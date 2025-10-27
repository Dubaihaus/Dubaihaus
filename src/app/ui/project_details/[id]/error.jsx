'use client';

export default function Error({ error, reset }) {
  console.error(error);
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-gray-600">Please try again.</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}
