// useInactivityTimer.js
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 28 * 60 * 1000; // Show warning at 28 minutes
const DEBOUNCE_DELAY = 1000; // 1 second debounce

export const useInactivityTimer = (logout, isAuthenticated) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const warningShownRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    warningShownRef.current = false;
    isProcessingRef.current = false;
  }, []);

  const handleLogout = useCallback(async () => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    cleanup(); // Clean up timers immediately

    try {
      await logout();

      toast.success('You have been logged out due to inactivity.');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      isProcessingRef.current = false;
    }
  }, [logout, navigate, cleanup]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current && isAuthenticated) {
      warningShownRef.current = true;

      const resetTimer = () => {
        // Reset function defined here to avoid dependency issues
        const now = Date.now();
        if (now - lastActivityRef.current < DEBOUNCE_DELAY) return;
        lastActivityRef.current = now;

        cleanup();

        if (!isAuthenticated) return;

        warningTimeoutRef.current = setTimeout(() => {
          showWarning();
        }, WARNING_TIMEOUT);

        timeoutRef.current = setTimeout(() => {
          handleLogout();
        }, INACTIVITY_TIMEOUT);
      };

      toast(
        t => (
          <div className="flex items-center gap-3">
            <span>You will be logged out in 2 minutes due to inactivity.</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resetTimer();
              }}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Stay Logged In
            </button>
          </div>
        ),
        {
          duration: 10000,
          icon: '⏰',
        },
      );
    }
  }, [isAuthenticated, cleanup, handleLogout]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    if (now - lastActivityRef.current < DEBOUNCE_DELAY) return;
    lastActivityRef.current = now;

    cleanup();

    warningTimeoutRef.current = setTimeout(() => {
      showWarning();
    }, WARNING_TIMEOUT);

    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [isAuthenticated, cleanup, showWarning, handleLogout]);

  useEffect(() => {
    // If not authenticated, clean up and exit
    if (!isAuthenticated) {
      cleanup();
      return;
    }

    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
    ];

    const options = { passive: true };

    events.forEach(event => {
      document.addEventListener(event, resetTimer, options);
    });

    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        resetTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, options);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanup();
    };
  }, [isAuthenticated, resetTimer, cleanup]);

  return { resetTimer, cleanup };
};
