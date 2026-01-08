import { useState, useEffect } from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Fat from './components/Fat';
import JDoodleCompiler from './components/practice_compiler';
import Login from './components/login';
import Signup from './components/signup';
import Dashboard from '../Dashboard/App';
import Profile from '../Dashboard/profile';
import { Toaster } from 'sonner';
import { useAuthstore } from '../../stores/auth';
import { Loader } from 'lucide-react';
import ForgotPassword from './components/ForgotPassword';
import LeetCodeProblems from '../Dashboard/LeetCodeProblems';

function App() {
  const {checkauth, authUser, isCheckingAuth} = useAuthstore();
  const location = useLocation();

  useEffect(() => {
    checkauth();
  }, [checkauth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin' />
      </div>
    );
  }

  // Add conditional class based on route
  const isAppRoute = location.pathname === '/app';
  
  return (
    <div className={`${isAppRoute ? 'h-screen' : 'min-h-screen'} bg-[#111111]`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Fat />} />
        <Route path="/practice" element={<JDoodleCompiler />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/profile"/>} />  
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/profile"/>} />  
        <Route path="/app" element={authUser ? <Dashboard /> : <Navigate to="/login"/>} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login"/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/problems" element={authUser ? <LeetCodeProblems /> : <Navigate to="/login"/>} />
      </Routes>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default App;
