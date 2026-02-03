// AuthContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';

import authApi from '../services/authApi';
import faceApi from '../services/faceApi';
import personApi from '../services/personApi';
import { useInactivityTimer } from '../hooks/useInactivityTimer';

const AuthContext = createContext();

// Auth states - makes the flow clearer
const AUTH_STATES = {
  INITIALIZING: 'INITIALIZING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  LOGGING_OUT: 'LOGGING_OUT',
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(AUTH_STATES.INITIALIZING);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const initAttempted = useRef(false);

  // Derived state
  const isLoading =
    authState === AUTH_STATES.INITIALIZING ||
    authState === AUTH_STATES.LOGGING_OUT;
  const isAuthenticated =
    authState === AUTH_STATES.AUTHENTICATED && !!currentUser;

  // Helper to update auth state
  const setAuthenticatedState = useCallback((user, userToken) => {
    setCurrentUser(user);
    setToken(userToken || true);
    setAuthState(AUTH_STATES.AUTHENTICATED);
  }, []);

  const setUnauthenticatedState = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    setAuthState(AUTH_STATES.UNAUTHENTICATED);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();

      if (userData.data.requiresAuth) {
        throw new Error('Authentication required');
      }

      setAuthenticatedState(userData.data.user, userData.data.token);
      return userData;
    } catch (error) {
      console.error('Get currentUser FAILED:', error.message);
      throw error;
    }
  }, [setAuthenticatedState]);

  const login = useCallback(
    async userData => {
      const { email, password, rememberMe } = userData;

      try {
        const user = await authApi.login(email, password, rememberMe);
        console.log('this is the user: ', user);

        if (user?.data?.requiresOtp) {
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
          return user;
        }

        setAuthenticatedState(user.data.user, user.data.token);
        return user;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    [setAuthenticatedState],
  );

  const autoLogin = useCallback(async () => {
    try {
      const user = await authApi.autoLogin();

      setAuthenticatedState(user.data.user, user.data.token);
      return user;
    } catch (error) {
      console.error(
        '❌ Auto-login failed:',
        error.response?.data || error.message,
      );
      throw error.response?.data || error;
    }
  }, [setAuthenticatedState]);

  const verifyOTPAndLogin = useCallback(
    async ({ email, otpCode, trustDevice, rememberMe, deviceFingerprint }) => {
      try {
        setAuthState(AUTH_STATES.INITIALIZING);
        const response = await authApi.verifyAndLogin({
          email,
          otpCode,
          trustDevice,
          rememberMe,
          deviceFingerprint,
        });
        console.log(response);

        setCurrentUser(response.data.user);
        setAuthState(AUTH_STATES.AUTHENTICATED);

        return response;
      } catch (error) {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        console.log('failed here', error.message);
        throw error.response?.data || error;
      }
    },
    [],
  );

  const resendOTPLogin = useCallback(async (email, ipAddress) => {
    try {
      const res = await authApi.resendOtpLogin(email, ipAddress);

      return res;
    } catch (error) {
      console.error('Failed to resent OTP:', error?.message);
      throw error;
    }
  }, []);

  const register = useCallback(
    async registrationData => {
      const { email, phone, password } = registrationData;

      try {
        const newUser = await authApi.register(email, phone, password);
        setAuthenticatedState(newUser.data.user, newUser.data.token);
        return newUser;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    [setAuthenticatedState],
  );

  const logout = useCallback(async () => {
    setAuthState(AUTH_STATES.LOGGING_OUT);

    try {
      await authApi.logout();

      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      // Set unauthenticated state
      setUnauthenticatedState();

      // Hard refresh to /login to clear all state
      window.location.href = '/login';
    }
  }, [setUnauthenticatedState]);

  const resendOTP = useCallback(async () => {
    try {
      const newOtp = await authApi.resendOtp();
      return newOtp;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, []);

  const verifyOTP = useCallback(async token => {
    try {
      const res = await authApi.verifyOtp(token);
      const newUser = res.data;
      setCurrentUser(newUser);
      return res;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, []);

  const completePersonalInfo = useCallback(
    async personData => {
      try {
        const updatedUser = await authApi.completePersonalInfo(personData);
        if (currentUser?.role === 'patient') {
          setCurrentUser(updatedUser.data?.user);
        }
        return updatedUser;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    [currentUser?.role],
  );

  const registerWalkIn = useCallback(async personData => {
    try {
      const newPerson = await personApi.createPerson(personData);
      return newPerson;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, []);

  const verifyFace = useCallback(
    async faceData => {
      try {
        const updatedUser = await authApi.verifyFace(faceData);
        await fetchCurrentUser();
        return updatedUser.data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },
    [fetchCurrentUser],
  );

  const processOCR = useCallback(async file => {
    try {
      const res = await faceApi.postImageForOcr(file);
      return res;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, []);

  // Initialize authentication ONCE on mount
  useEffect(() => {
    if (initAttempted.current) return;
    initAttempted.current = true;

    const initAuth = async () => {
      try {
        await fetchCurrentUser();
      } catch (jwtError) {
        try {
          // await autoLogin();
          await fetchCurrentUser();
        } catch (autoLoginError) {
          console.error('Auto-login also failed:', autoLoginError.message);
          setUnauthenticatedState();
        }
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - truly runs once

  // Initialize inactivity timer - only when authenticated
  useInactivityTimer(logout, isAuthenticated);

  const value = useMemo(
    () => ({
      currentUser,
      token,
      isLoading,
      isAuthenticated,
      authState,
      fetchCurrentUser,
      login,
      verifyOTPAndLogin,
      resendOTPLogin,
      register,
      resendOTP,
      verifyOTP,
      completePersonalInfo,
      registerWalkIn,
      verifyFace,
      processOCR,
      logout,
      autoLogin,
    }),
    [
      currentUser,
      token,
      isLoading,
      isAuthenticated,
      authState,
      fetchCurrentUser,
      login,
      verifyOTPAndLogin,
      resendOTPLogin,
      register,
      resendOTP,
      verifyOTP,
      completePersonalInfo,
      registerWalkIn,
      verifyFace,
      processOCR,
      logout,
      autoLogin,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;
