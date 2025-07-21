import React from 'react';
import { Link } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';

const Signup: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">Create your account</h1>
      
      <div className="w-full max-w-md">
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              footerAction: "text-blue-600 hover:text-blue-800",
            }
          }}
        />
      </div>
      
      <div className="mt-4 text-center text-sm">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;