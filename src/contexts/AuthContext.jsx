import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';
import authApi from '../services/authApi';
import faceApi from '../services/faceApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // DEBUG: Monitor all state changes
  useEffect(() => {
    console.log('🔄 AUTH STATE CHANGED:', {
      currentUser: currentUser
        ? {
            email: currentUser.email,
            role: currentUser.role,
            registration_status: currentUser.registration_status,
          }
        : null,
      hasToken: !!token,
      isLoading,
    });
  }, [currentUser, token, isLoading]);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const userData = await authApi.getCurrentUser();
      setCurrentUser(userData.data.user);
      setToken(userData.data.token || true);
    } catch (error) {
      console.log(
        '❌ getCurrentUser FAILED:',
        error.response?.data || error.message
      );
      setCurrentUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current user on app initialization
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = useCallback(async userData => {
    const { email, password } = userData;

    try {
      setIsLoading(true);
      const user = await authApi.login(email, password);
      console.log(user);

      setCurrentUser(user.data.user);
      setToken(user.data.token || true);

      return user;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async registrationData => {
    const { email, phone, password } = registrationData;

    try {
      setIsLoading(true);
      const newUser = await authApi.register(email, phone, password);

      setCurrentUser(newUser.data.user);
      setToken(newUser.data.token || true);

      return newUser;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setCurrentUser(null);
      setToken(null);
    }
  }, []);

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

  const completePersonalInfo = useCallback(async personData => {
    try {
      const updatedUser = await authApi.completePersonalInfo(personData);
      console.log(updatedUser);
      setCurrentUser(updatedUser.data?.user);

      return updatedUser;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, []);

  const verifyFace = useCallback(async faceData => {
    try {
      const updatedUser = await authApi.verifyFace(faceData);

      await fetchCurrentUser();

      return updatedUser.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, []);

  const processOCR = useCallback(async file => {
    try {
      const res = await faceApi.postImageForOcr(file);

      return res;
    } catch (error) {
      throw error.response?.data || error;
    }
  }, []);

  const value = {
    currentUser,
    token,
    isLoading,
    fetchCurrentUser,
    login,
    register,
    resendOTP,
    verifyOTP,
    completePersonalInfo,
    verifyFace,
    processOCR,
    logout,
  };

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
