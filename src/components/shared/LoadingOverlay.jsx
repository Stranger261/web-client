// src/components/generic/LoadingOverlay.jsx
import { Loader2, Heart, Stethoscope } from 'lucide-react';

const LoadingOverlay = ({
  message = 'Loading...',
  size = 'lg',
  showLogo = true,
  variant = 'default',
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const variants = {
    default: {
      gradient: 'from-blue-50 via-white to-blue-50',
      color: 'text-blue-600',
      border: 'border-blue-600',
      bg: 'bg-blue-600',
    },
    medical: {
      gradient: 'from-blue-50 via-cyan-50 to-white',
      color: 'text-blue-600',
      border: 'border-blue-600',
      bg: 'bg-blue-600',
    },
    minimal: {
      gradient: 'from-gray-50 to-white',
      color: 'text-gray-600',
      border: 'border-gray-600',
      bg: 'bg-gray-600',
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center min-h-screen bg-gradient-to-br ${currentVariant.gradient} z-50`}
    >
      <div className="text-center space-y-6">
        {/* Animated Logo/Spinner */}
        <div className="relative flex justify-center">
          {/* Outer rotating ring */}
          <div
            className={`${sizes[size]} border-4 ${currentVariant.border} border-t-transparent border-solid rounded-full animate-spin`}
          ></div>

          {/* Inner content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {showLogo ? (
              <div className="flex flex-col items-center">
                {/* Medical-themed icon */}
                <div className="relative">
                  <Heart
                    className={`${currentVariant.color} animate-pulse`}
                    size={size === 'xl' ? 32 : size === 'lg' ? 24 : 16}
                  />
                  <Stethoscope
                    className={`${currentVariant.color} absolute -bottom-1 -right-1`}
                    size={size === 'xl' ? 16 : size === 'lg' ? 12 : 8}
                  />
                </div>
                {/* Logo text */}
                <span
                  className={`${currentVariant.color} font-bold text-xs mt-1`}
                >
                  HVill
                </span>
              </div>
            ) : (
              <Loader2
                className={`${currentVariant.color} animate-spin`}
                size={size === 'xl' ? 32 : size === 'lg' ? 24 : 16}
              />
            )}
          </div>
        </div>

        {/* Loading text with animation */}
        <div className="space-y-2">
          <p className={`font-semibold ${currentVariant.color} text-lg`}>
            {message}
          </p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map(dot => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full ${currentVariant.bg} animate-bounce`}
                style={{
                  animationDelay: `${dot * 0.2}s`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Optional progress bar for longer loads */}
        <div className="w-48 mx-auto bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full ${currentVariant.bg} animate-pulse`}
            style={{
              width: '60%',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
