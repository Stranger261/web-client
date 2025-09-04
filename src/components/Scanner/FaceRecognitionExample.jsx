import React, { useState } from 'react';
import SimpleFaceRecognition from './SimpleFaceRecognition';

const FaceRecognitionExample = () => {
  const [verificationResults, setVerificationResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handleVerificationResult = result => {
    // Add to results history
    const newResult = {
      ...result,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    setVerificationResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results

    if (result.matched) {
      setCurrentUser({
        person_id: result.person_id,
        name: result.name,
        confidence: result.confidence,
        loginTime: new Date().toLocaleString(),
      });

      // You could also redirect, update global state, etc.
      console.log('User verified:', result);
    } else {
      console.log('Verification failed:', result);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const clearHistory = () => {
    setVerificationResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Face Recognition Demo
          </h1>
          <p className="text-gray-600">
            GCash-style live face verification with real-time feedback
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Face Recognition Component */}
          <div className="lg:col-span-1">
            <SimpleFaceRecognition
              onResult={handleVerificationResult}
              className="mx-auto"
            />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current User Status */}
            {currentUser ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-green-600">
                    User Logged In
                  </h2>
                  <button
                    onClick={logout}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {currentUser.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium">{currentUser.person_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">
                      {Math.round(currentUser.confidence || 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Login Time:</span>
                    <span className="font-medium">{currentUser.loginTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-600 mb-4">
                  Not Logged In
                </h2>
                <p className="text-gray-500">
                  Use the face recognition system to verify your identity.
                </p>
              </div>
            )}

            {/* Features List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium">Real-time Detection</h3>
                    <p className="text-sm text-gray-600">
                      Live face detection with visual feedback
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium">Quality Checks</h3>
                    <p className="text-sm text-gray-600">
                      Lighting, position, clarity validation
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium">Auto Capture</h3>
                    <p className="text-sm text-gray-600">
                      3-second countdown when ready
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium">Smart Feedback</h3>
                    <p className="text-sm text-gray-600">
                      Guidance for optimal positioning
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification History */}
            {verificationResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Recent Verifications
                  </h2>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear History
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {verificationResults.map(result => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${
                        result.matched
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-medium ${
                            result.matched ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {result.matched ? '✓ Success' : '✗ Failed'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {result.matched && (
                        <div className="text-sm text-gray-600">
                          <div>ID: {result.person_id}</div>
                          {result.name && <div>Name: {result.name}</div>}
                          {result.confidence && (
                            <div>
                              Confidence: {Math.round(result.confidence)}%
                            </div>
                          )}
                        </div>
                      )}

                      {!result.matched && (
                        <div className="text-sm text-gray-600">
                          Distance: {result.distance?.toFixed(3)}, Threshold:{' '}
                          {result.threshold?.toFixed(3)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integration Guide */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Integration Guide
              </h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    1. Basic Usage:
                  </h3>
                  <code className="block bg-gray-100 p-2 rounded">
                    {`<SimpleFaceRecognition onResult={handleResult} />`}
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    2. Custom WebSocket URL:
                  </h3>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    {`const { ... } = useFaceRecognition({
  wsUrl: 'ws://localhost:8010/api/live_verify/ws/live_verify',
  onVerificationResult: handleResult
});`}
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    3. Handle Results:
                  </h3>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    {`const handleResult = (result) => {
  if (result.matched) {
    // User verified successfully
    console.log('Welcome', result.name);
  } else {
    // Verification failed
    console.log('Access denied');
  }
};`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionExample;
