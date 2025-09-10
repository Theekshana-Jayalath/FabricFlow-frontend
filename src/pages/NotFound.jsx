import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-24 h-24 bg-[#FFEED6] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-[#005A54] text-white px-6 py-3 rounded-md hover:bg-[#EF6869] transition-colors font-medium"
          >
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full border border-[#005A54] text-[#005A54] px-6 py-3 rounded-md hover:bg-[#005A54] hover:text-white transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
