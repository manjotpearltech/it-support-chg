import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

const PasswordProtection = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === '141') {
      // Store authentication in sessionStorage (clears when browser closes)
      sessionStorage.setItem('isAuthenticated', 'true');
      onAuthenticated();
    } else {
      setError(true);
      setIsShaking(true);
      setPassword('');
      
      // Remove shake animation after it completes
      setTimeout(() => setIsShaking(false), 500);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-glow-blue">
            <Lock className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            IT Support AI
          </h1>
          <p className="text-text-secondary text-sm">
            Enter password to access the assistant
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit}>
          <div className={`bg-white/95 backdrop-blur-xl border-2 ${
            error ? 'border-red-500' : 'border-border-primary'
          } rounded-2xl p-6 shadow-light-lg ${
            isShaking ? 'animate-shake' : ''
          }`}>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Incorrect password. Please try again.</span>
              </div>
            )}

            {/* Password Input */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                className="w-full px-4 py-3 bg-bg-secondary border-2 border-border-primary focus:border-blue-500 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!password}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-xl shadow-light-md hover:shadow-light-lg disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Access</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            🔒 Secure access to IT Support AI Assistant
          </p>
        </div>
      </div>

      {/* Custom shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default PasswordProtection;

