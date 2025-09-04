import React, { useState, useEffect } from 'react';

const DebugFaceRecognition = () => {
  const [logs, setLogs] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking');
  const [wsStatus, setWsStatus] = useState('not-connected');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }].slice(-20)); // Keep last 20 logs
  };

  // Check if backend server is running
  const checkServerHealth = async () => {
    const possibleUrls = [
      'http://localhost:8010/health',
      'http://localhost:80/afrs-service/health',
      `http://${window.location.host}/health`,
      `http://${window.location.host}/afrs-service/health`,
    ];

    for (const url of possibleUrls) {
      try {
        addLog(`Checking server health: ${url}`, 'info');
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setServerStatus('running');
          addLog(
            `Server is running at ${url}: ${JSON.stringify(data)}`,
            'success'
          );
          return; // Exit once we find a working URL
        } else {
          addLog(
            `Server at ${url} responded with status: ${response.status}`,
            'warning'
          );
        }
      } catch (error) {
        addLog(
          `Server connection failed for ${url}: ${error.message}`,
          'warning'
        );
      }
    }

    setServerStatus('error');
    addLog('No working server URL found', 'error');
  };

  // Check if live verification endpoint exists
  const checkLiveVerifyEndpoint = async () => {
    try {
      addLog('Checking live verification endpoint...', 'info');
      const response = await fetch(
        'http://localhost:8010/api/live_verify/live_verify_page'
      );
      if (response.ok) {
        addLog('Live verification endpoint is available', 'success');
      } else {
        addLog(
          `Live verification endpoint not found: ${response.status}`,
          'error'
        );
      }
    } catch (error) {
      addLog(
        `Live verification endpoint check failed: ${error.message}`,
        'error'
      );
    }
  };

  // Test WebSocket connection
  const testWebSocket = () => {
    addLog('Testing WebSocket connection...', 'info');

    // Try multiple WebSocket URLs
    const possibleUrls = [
      'ws://localhost:8010/api/live_verify/ws/live_verify',
      'ws://localhost:80/afrs-service/api/live_verify/ws/live_verify',
      `ws://${window.location.host}/api/live_verify/ws/live_verify`,
      `ws://${window.location.host}/afrs-service/api/live_verify/ws/live_verify`,
    ];

    let currentUrlIndex = 0;

    const tryConnection = () => {
      if (currentUrlIndex >= possibleUrls.length) {
        addLog('All WebSocket URLs failed', 'error');
        return;
      }

      const wsUrl = possibleUrls[currentUrlIndex];
      addLog(
        `Trying connection ${currentUrlIndex + 1}/${
          possibleUrls.length
        }: ${wsUrl}`,
        'info'
      );

      const ws = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          addLog(`Connection timeout for: ${wsUrl}`, 'warning');
          currentUrlIndex++;
          tryConnection();
        }
      }, 3000);

      ws.onopen = () => {
        clearTimeout(timeout);
        setWsStatus('connected');
        addLog(`WebSocket connected successfully to: ${wsUrl}`, 'success');

        // Send a test frame
        setTimeout(() => {
          addLog('Sending test frame...', 'info');
          ws.send(
            JSON.stringify({
              type: 'frame',
              data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            })
          );
        }, 1000);

        // Clean up after 10 seconds
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
            addLog('Test completed, closing connection', 'info');
          }
        }, 10000);
      };

      ws.onmessage = event => {
        clearTimeout(timeout);
        addLog(
          `WebSocket message received: ${event.data.substring(0, 100)}...`,
          'success'
        );
      };

      ws.onclose = event => {
        clearTimeout(timeout);
        if (wsStatus === 'connected') {
          setWsStatus('disconnected');
          addLog(
            `WebSocket closed: ${event.code} - ${event.reason || 'No reason'}`,
            'warning'
          );
        } else {
          addLog(`Connection failed: ${wsUrl} (${event.code})`, 'error');
          currentUrlIndex++;
          setTimeout(tryConnection, 1000);
        }
      };

      ws.onerror = error => {
        clearTimeout(timeout);
        setWsStatus('error');
        addLog(`WebSocket error for ${wsUrl}: ${error}`, 'error');
      };
    };

    tryConnection();
  };

  // Test camera access
  const testCamera = async () => {
    try {
      addLog('Testing camera access...', 'info');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      addLog('Camera access granted!', 'success');

      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      addLog('Camera test completed', 'info');
    } catch (error) {
      addLog(`Camera access failed: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    checkServerHealth();
    checkLiveVerifyEndpoint();
  }, []);

  const getStatusColor = status => {
    switch (status) {
      case 'running':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'checking':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogColor = type => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Face Recognition Debug Console
      </h1>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Backend Server</h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              serverStatus
            )}`}
          >
            {serverStatus === 'checking' && 'Checking...'}
            {serverStatus === 'running' && 'Running ✓'}
            {serverStatus === 'error' && 'Not Available ✗'}
          </div>
        </div>

        <div className="p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">WebSocket</h3>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              wsStatus
            )}`}
          >
            {wsStatus === 'not-connected' && 'Not Connected'}
            {wsStatus === 'connected' && 'Connected ✓'}
            {wsStatus === 'error' && 'Error ✗'}
            {wsStatus === 'disconnected' && 'Disconnected'}
          </div>
        </div>

        <div className="p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Camera</h3>
          <button
            onClick={testCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Test Camera
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={checkServerHealth}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Check Server
        </button>
        <button
          onClick={testWebSocket}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test WebSocket
        </button>
        <button
          onClick={() => setLogs([])}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
        <button
          onClick={() => window.open('http://localhost:8010/docs', '_blank')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Open API Docs
        </button>
      </div>

      {/* Setup Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Setup Checklist:</h3>
        <ul className="text-sm space-y-1">
          <li>✓ 1. Make sure your Python backend is running on port 8010</li>
          <li>✓ 2. Check that all required routes are included in main.py</li>
          <li>✓ 3. Ensure MongoDB connection is working</li>
          <li>✓ 4. Verify live_verify.py router is imported and included</li>
          <li>✓ 5. Test the API endpoints work via browser or Postman</li>
        </ul>
      </div>

      {/* Command to start backend */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">Start Backend:</h3>
        <code className="block bg-black text-green-400 p-3 rounded text-sm">
          python main.py
        </code>
        <p className="text-sm text-gray-600 mt-2">
          Or: <code>uvicorn main:app --host 0.0.0.0 --port 8010 --reload</code>
        </p>
      </div>

      {/* Logs */}
      <div className="border rounded-lg">
        <h3 className="font-semibold p-4 border-b bg-gray-50">Debug Logs</h3>
        <div className="p-4 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center">
              No logs yet. Click the buttons above to run tests.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-sm ${getLogColor(
                    log.type
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="flex-1">{log.message}</span>
                    <span className="text-xs opacity-60 ml-2">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* URLs for reference */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Reference URLs:</h3>
        <div className="text-sm space-y-1">
          <div>
            Health Check: <code>http://localhost:8010/health</code>
          </div>
          <div>
            API Docs: <code>http://localhost:8010/docs</code>
          </div>
          <div>
            Live Verify Page:{' '}
            <code>http://localhost:8010/api/live_verify/live_verify_page</code>
          </div>
          <div>
            WebSocket:{' '}
            <code>ws://localhost:8010/api/live_verify/ws/live_verify</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugFaceRecognition;
