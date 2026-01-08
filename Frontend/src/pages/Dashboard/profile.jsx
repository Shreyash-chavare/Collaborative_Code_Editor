import React, { useState, useEffect } from 'react';
import { Calendar, User, Mail, Plus, LogIn, Code, Users } from 'lucide-react';
import { useAuthstore } from '../../stores/auth';
import { useNavigate } from 'react-router-dom';
import "./App.css"

const Profile = () => {
  const [roomId, setRoomId] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const { authUser } = useAuthstore();
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysActive, setDaysActive] = useState(0);
  
  console.log('AuthUser in Profile:', authUser); // Debug log
  const navigate = useNavigate();
  
  // Add state for selected language
  const [selectedLanguage, setSelectedLanguage] = useState('python'); // Default language

  // Add language options
  const languages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'c', name: 'C', icon: '🔧' },
  ];

  // Fetch user activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3000/api/user/activity', {
          credentials: 'include', // Important for cookies/session
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }
        
        const data = await response.json();
        console.log(data)
        setActivityData(data);
        
        // Calculate days active
        setDaysActive(new Set(data.map(item => item.date)).size);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError(err.message);
        // Fall back to sample data if API fails
        setActivityData(generateSampleActivityData());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityData();
  }, []);

  // Sample user data with real or fallback activity data
  const userData = {
    username: authUser?.name || 'Not Available',
    email: authUser?.email || 'Not Available',
    profileImage: 'https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?ga=GA1.1.2027076217.1740375917&semt=ais_hybrid&w=740',
  };

  function generateSampleActivityData() {
    const data = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) // 0-4 contributions per day
      });
    }
    return data;
  }

  // Update the handleLanguage function
  const handleLanguage = (langId) => {
    setSelectedLanguage(langId);
    navigate('/practice', { state:{
      setlang: langId
    }})
  };

  const handleCollaborative = () => {
    navigate("/app");
  };

  // Add this handler function near your other handlers
  const handleGoToProblems = () => {
    navigate("/problems");
  };

  // Function to fill in missing dates with zero counts
  const fillMissingDates = (data) => {
    const filledData = [...data];
    const dateSet = new Set(data.map(item => item.date));
    
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Iterate through each day in the last year
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (!dateSet.has(dateStr)) {
        filledData.push({ date: dateStr, count: 0 });
      }
    }
    
    // Sort by date
    return filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Function to group activity data by week
  const getCalendarData = () => {
    // Make sure we have data for every day
    const completeData = fillMissingDates(activityData);
    
    const weeks = [];
    let dayIndex = 0;
    
    // Get today's day of week (0 = Sunday, 6 = Saturday)
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    
    // Start from the most recent complete week
    const startIndex = completeData.length - 1 - todayDayOfWeek;
    
    // Create 53 weeks (371 days which covers a year plus some buffer)
    for (let i = 0; i < 53; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const dataIndex = startIndex - (i * 7 + (6 - j));
        if (dataIndex >= 0 && dataIndex < completeData.length) {
          week.push(completeData[dataIndex]);
        } else {
          // Add empty cell if we don't have data
          week.push({ date: '', count: 0 });
        }
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const weeks = isLoading ? [] : getCalendarData();

  return (
    <div className="h-5/6 bg-[#111111] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* User Profile Section */}
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <img
            src={userData.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
          />
          
          <div className="flex-1">
            {/* Email */}
            <div className="flex items-center text-gray-400 text-sm mb-1">
              <Mail size={14} className="mr-1" />
              <span>{userData?.email || 'Not Available'}</span>
            </div>
            
            {/* Username */}
            <div className="flex items-center text-2xl font-bold text-[#d1d0c5]">
              <User size={24} className="mr-2 text-[#d1d0c5]" />
              <h2>{userData?.username || 'Not Available'}</h2>
            </div>
            
            <div className="mt-4 text-[#d1d0c5]">
              <span>
                <span className="font-semibold">{daysActive}</span> Days Active
              </span>
            </div>
          </div>
        </div>

        {/* IDE Options Section */}
        <div>
          <div className="flex items-center mb-6">
            <Code size={20} className="mr-2 text-[#d1d0c5]" />
            <h3 className="text-lg font-semibold text-[#d1d0c5]">Coding Environment</h3>
          </div>
          
          {/* Rest of IDE options unchanged */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguage(lang.id)}
                  className={`px-4 py-2 rounded flex items-center gap-2 transition-colors
                    ${selectedLanguage === lang.id 
                      ? 'bg-[#3a3a3a] text-[#d1d0c5] border border-[#4a4a4a]' 
                      : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-[#d1d0c5]'}`}
                >
                  <span className="pointer-events-none">{lang.icon}</span>
                  {lang.name}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#d1d0c5] py-3 px-8 rounded flex items-center justify-center transition-colors"
                onClick={handleCollaborative}
              >
                <Users size={18} className="mr-2" />
                Collaborative
              </button>
              <button 
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#d1d0c5] py-3 px-8 rounded flex items-center justify-center transition-colors"
                onClick={handleGoToProblems}
              >
                <Code size={18} className="mr-2" />
                Go to Problems
              </button>
            </div>
          </div>
        </div>
        
        {/* Activity Calendar */}
        <div>
          <div className="flex items-center mb-6">
            <Calendar size={20} className="mr-2 text-[#d1d0c5]" />
            <h3 className="text-lg font-semibold text-[#d1d0c5]">Activity Calendar</h3>
          </div>
          
          {isLoading ? (
            <div className="text-gray-400 text-center py-8">Loading activity data...</div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">Error loading activity data</div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex items-start">
                {/* Day labels */}
                <div className="mr-2">
                  <div className="text-xs text-gray-400 h-3 mb-1">Mon</div>
                  <div className="text-xs text-gray-400 h-3 mb-1">Tue</div>
                  <div className="text-xs text-gray-400 h-3 mb-1">Wed</div>
                  <div className="text-xs text-gray-400 h-3 mb-1">Thu</div>
                  <div className="text-xs text-gray-400 h-3 mb-1">Fri</div>
                  <div className="text-xs text-gray-400 h-3 mb-1">Sat</div>
                  <div className="text-xs text-gray-400 h-3 mb-1">Sun</div>
                </div>
                
                {/* Calendar grid */}
                <div className="flex space-x-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col space-y-1">
                      {week.map((day, dayIndex) => {
                        // Updated color scheme to match dark theme
                        let bgColor = 'bg-[#2a2a2a]';
                        if (day.count === 1) bgColor = 'bg-[#1e4620]';
                        else if (day.count === 2) bgColor = 'bg-[#2a642c]';
                        else if (day.count === 3) bgColor = 'bg-[#37833b]';
                        else if (day.count >= 4) bgColor = 'bg-[#46a658]';
                        
                        return (
                          <div 
                            key={dayIndex} 
                            className={`w-3 h-3 ${bgColor} rounded-sm border border-gray-700`}
                            title={day.date ? `${day.date}: ${day.count} activities` : ''}
                          ></div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Month labels */}
              <div className="flex mt-2 ml-6">
                <div className="text-xs text-gray-400 flex w-full justify-between">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-end mt-4 text-sm text-gray-400">
                <span className="mr-2">Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-[#2a2a2a] rounded-sm border border-gray-700"></div>
                  <div className="w-3 h-3 bg-[#1e4620] rounded-sm border border-gray-700"></div>
                  <div className="w-3 h-3 bg-[#2a642c] rounded-sm border border-gray-700"></div>
                  <div className="w-3 h-3 bg-[#37833b] rounded-sm border border-gray-700"></div>
                  <div className="w-3 h-3 bg-[#46a658] rounded-sm border border-gray-700"></div>
                </div>
                <span className="ml-2">More</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;