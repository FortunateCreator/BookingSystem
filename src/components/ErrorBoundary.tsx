import React, { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    let message = 'Something went wrong.';
    
    try {
      const parsed = JSON.parse(error?.message || '');
      if (parsed.error) {
        message = `Firebase Error: ${parsed.error} (${parsed.operationType} on ${parsed.path})`;
      }
    } catch {
      message = error?.message || message;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
          <p className="text-gray-700 mb-6">{message}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
