import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosinstance } from '../../../utils/axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [oldpass, setOldpass] = useState('');
  const [newpass, setNewpass] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [confirmNewPass, setConfirmNewPass] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !newpass.trim()) {
      return toast.error('Please fill out all fields.');
    }
    if (newpass !== confirmNewPass) {
      return toast.error('New password and confirm password do not match.');
    }


    setIsLoading(true);
    try {
      const res = await axiosinstance.post('/forgot-password', { email, newpass });
      if (res.data.success) {
        setEmailSent(true);
        toast.success('Password is reset successfully', {
          duration: 1000,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to  reset ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-black p-8 rounded-lg shadow-lg shadow-yellow-600 border-2 border-yellow-600">
        {!emailSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-200">
                Reset your Password
              </h2>
              <p className="mt-2 text-center text-sm text-yellow-600">
                Enter following Valid Credentials to reset your Password.
              </p>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full bg-black px-3 py-2 border border-gray-300 placeholder-gray-300 text-gray-300 focus:outline-none focus:ring-yellow-600 focus:border-yellow-600 focus:z-10 sm:text-sm"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* <div>
              <label htmlFor="email" className="sr-only">
                Old Password
              </label>
              <input
                id="oldpass"
                name="oldpass"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your current password"
                value={oldpass}
                onChange={(e) => setOldpass(e.target.value)}
              />
            </div> */}

            <div>
              <label htmlFor="email" className="sr-only">
                New Password
              </label>
              <input
                id="newpass"
                name="newpass"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full bg-black px-3 py-2 border border-gray-300 placeholder-gray-300 text-gray-300 focus:outline-none focus:ring-yellow-600 focus:border-yellow-600 focus:z-10 sm:text-sm"
                placeholder="Enter your New Password"
                value={newpass}
                onChange={(e) => setNewpass(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmNewPass" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="confirmNewPass"
                name="confirmNewPass"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full bg-black px-3 py-2 border border-gray-300 placeholder-gray-300 text-gray-300 focus:outline-none focus:ring-yellow-600 focus:border-yellow-600 focus:z-10 sm:text-sm"
                placeholder="Confirm your New Password"
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-600">
            <DotLottieReact
              src="https://lottie.host/7570e5c0-b8f9-4ebc-a551-fb8e6c1b5ec7/nD8HSPEhBd.lottie"
              loop
              autoplay
            />
            <p className="mb-4 text-lg font-bold text-gray-800">
              Your password has been updated successfully!
            </p>
          </div>
        )}

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="font-medium text-yellow-600 hover:text-yellow-300"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 