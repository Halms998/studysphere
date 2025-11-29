import React from 'react';
import FormInput from '@/components/FormInput';
import { useLogin } from '@/hooks/useLogin';

/**
 * LoginPage Component - Single Responsibility: Render login UI
 * All logic is delegated to the useLogin hook
 * This component is purely presentational
 */
export default function LoginPage() {
  const {
    values,
    isChecking,
    isLoading,
    errors,
    serverError,
    handleChange,
    handleLogin,
  } = useLogin();

  // Loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  // Main login UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main className="bg-white p-12 rounded-xl shadow-xl w-full max-w-lg mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-1">
          Study Sphere
        </h1>
        <p className="text-xl font-normal text-gray-600 text-center mb-10">
          Welcome Back
        </p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
          />

          {/* Server Error Display */}
          {serverError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/auth/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition duration-150"
          >
            Sign up
          </a>
        </p>
      </main>
    </div>
  );
}