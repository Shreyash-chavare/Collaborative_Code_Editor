import React, { useState } from 'react';
import './index.css'; // Ensure you have this import to apply Tailwind CSS
import { useAuthstore } from '../../../stores/auth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username:"",
    fullname: "",
    email: "",
    password: ""
  });
  const { signup,isSigningUp } = useAuthstore();

  const validateForm = () => {
    if(!formData.fullname.trim()) return toast.error("Full name is required");
    if(!formData.email.trim()) return toast.error("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return toast.error("Invalid email format");
    }
    if(!formData.password.trim()) return toast.error("Password is required");
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = validateForm();
    
    if (success === true) {
      try {
        const result = await signup(formData);
        
        if (result.success) {
          toast.success("Account created successfully!");
          navigate('/profile');
        } else {
          // Handle specific error messages
          const errorMessage = result.message || "Failed to create account";
          if (errorMessage.includes('already exists') || errorMessage.includes('already taken')) {
            toast.error(errorMessage);
          } else {
            toast.error(errorMessage);
          }
        }
      } catch (error) {
        console.error('Error during signup:', error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to create account. Please try again.";
        toast.error(errorMessage);
      }
    }
  };



  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="flex bg-white rounded-lg shadow-lg shadow-yellow-600 border-2 border-yellow-600 overflow-hidden w-3/4 max-w-4xl mt-4">
        <div className="w-1/2 bg-gray-900 text-white p-8 flex flex-col justify-center items-center">
          <h1 className="text-4xl mb-2">Registration Page</h1>
          <p className="text-lg">Start Your Development Journey Here!</p>
        </div>
        <div className="w-1/2 p-8 bg-black text-white flex flex-col justify-center items-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="fullname" className="block text-yellow-500">FullName</label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  className="w-full p-2 border rounded bg-black"
                  placeholder="Enter your FullName"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-yellow-500">UserName</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full p-2 border rounded bg-black"
                  placeholder="Enter your Username"
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-yellow-500">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-2 border rounded bg-black"
                  placeholder="Enter your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-yellow-500">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-2 border rounded bg-black"
                  placeholder="Enter your Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <button
              type="submit"
              className='btn btn-primary w-full text-yellow-600 hover:text-yellow-300'
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className='size-5 animate-spin' />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
              <button
                type="button"
                className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 mt-4"
              >
                Continue with Google
              </button>
            </form>
            <div className="text-center mt-4">
              <p>
                Already have an account?{" "}
                <Link to="/login" className='link link-primary text-yellow-600 hover:text-yellow-300'>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
