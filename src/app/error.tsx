'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h2>Something went wrong!</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', color: 'black' }}>
        {error.message}
      </pre>
      <pre style={{ background: '#f5f5f5', padding: '1rem', color: 'black' }}>
        {error.stack}
      </pre>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
