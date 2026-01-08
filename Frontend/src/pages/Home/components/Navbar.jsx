import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiSettings, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuthstore } from '../../../stores/auth'
import BackgroundGlow from './background_glow';

const Navbar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuthstore();

    const langmap = new Map();
    langmap.set("Py", "python")
    langmap.set("C++", "cpp")
    langmap.set("C", "c")
    langmap.set("Ja", "java")


    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                setIsSettingsOpen(false);
                navigate('/');
                useAuthstore.setState({ authUser: null });
            }
        } catch (error) {
            console.error("Logout failed:", error);
            setIsSettingsOpen(false);
            navigate('/');
        }
    };

    const handleLang = (e) =>{
        const textlang = e.currentTarget.querySelector("span").innerText
        const langId = langmap.get(textlang)
        navigate('/practice', { state:{
            setlang: langId
          }})
    }

    const handleCodeSquad = () => {
        navigate('/');
    }

    // Only show settings on home page
    const showSettings = location.pathname === '/app';

    return (
        <nav className='sticky top-0 z-50 w-full bg-[#111111] shadow-md'>
            <BackgroundGlow />
        <div className='flex justify-between items-center px-6 py-4'>
            <div onClick={handleCodeSquad} className="title text-4xl font-bold text-[#e29a14] cursor-pointer">
                CodeSquad
            </div>
            <div className="flex gap-6 items-center">
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] hover:bg-[#222222] transition-all duration-200 font-semibold text-gray-200 min-w-[120px]">
                        Languages
                        <svg 
                            className="transform transition-transform duration-200 group-hover:rotate-180" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            width={20} 
                            height={20}
                            fill="none"
                        >
                            <path 
                                d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" 
                                stroke="currentColor" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </svg>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-52 rounded-lg shadow-lg bg-[#1a1a1a] ring-1 ring-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100">
                        <ul className="py-1 divide-y divide-gray-700">
                            <li className="group/item hover:bg-[#222222] transition-colors">
                                <div onClick={handleLang} className="px-3 py-2 flex items-center gap-2 w-full cursor-pointer">
                                    <span className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-blue-400 font-mono text-sm">C++</span>
                                    <span className="font-medium text-gray-300">C++</span>
                                </div>
                            </li>
                            <li className="group/item hover:bg-[#222222] transition-colors">
                                <div onClick={handleLang} className="px-3 py-2 flex items-center gap-2 w-full cursor-pointer">
                                    <span className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center text-red-400 font-mono text-sm">Ja</span>
                                    <span className="font-medium text-gray-300">Java</span>
                                </div>
                            </li>
                            <li className="group/item hover:bg-[#222222] transition-colors">
                                <div onClick={handleLang} className="px-3 py-2 flex items-center gap-2 w-full cursor-pointer">
                                    <span className="w-8 h-8 rounded-lg bg-yellow-800 flex items-center justify-center text-yellow-400 font-mono text-sm">C</span>
                                    <span className="font-medium text-gray-300">C</span>
                                </div>
                            </li>
                            <li className="group/item hover:bg-[#222222] transition-colors">
                                <div onClick={handleLang} className="px-3 py-2 flex items-center gap-2 w-full cursor-pointer">
                                    <span className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center text-red-400 font-mono text-sm">Py</span>
                                    <span className="font-medium text-gray-300">Python</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
    
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] hover:bg-[#222222] transition-all duration-200 font-semibold text-gray-200 min-w-[120px]">
                        IDE
                        <svg 
                            className="transform transition-transform duration-200 group-hover:rotate-180" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            width={20} 
                            height={20}
                            fill="none"
                        >
                            <path 
                                d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" 
                                stroke="currentColor" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </svg>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-52 rounded-lg shadow-lg bg-[#1a1a1a] ring-1 ring-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100">
                        <ul className="py-1 divide-y divide-gray-700">
                            <li className="group/item hover:bg-[#222222] transition-colors">
                                <Link to="/practice" className="px-3 py-2 flex items-center gap-2 w-full">
                                    <span className="w-8 h-8 rounded-lg bg-green-800 flex items-center justify-center text-green-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                        </svg>
                                    </span>
                                    <span className="font-medium text-gray-300">Online</span>
                                </Link>
                            </li>
                            <li className="group/item hover:bg-[#222222] transition-colors">
                                <Link to="/login" className="px-3 py-2 flex items-center gap-2 w-full">
                                    <span className="w-8 h-8 rounded-lg bg-purple-800 flex items-center justify-center text-purple-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                        </svg>
                                    </span>
                                    <span className="font-medium text-gray-300">Collaborative</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
    
                {/* Settings Dropdown - Only shown on home page */}
                {showSettings && (
                    <div className="relative">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="p-2 hover:bg-[#222222] rounded-full transition-colors duration-200"
                        >
                            <FiSettings className="w-5 h-5 text-gray-300" />
                        </button>
                        
                        {isSettingsOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-lg py-1 z-50 ring-1 ring-gray-800">
                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#222222]"
                                    onClick={() => setIsSettingsOpen(false)}
                                >
                                    <FiUser className="w-4 h-4 mr-2" />
                                    View Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#222222]"
                                >
                                    <FiLogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </nav>
    )
}

export default Navbar
