import React, { createContext, useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './App.css';
import { LogIn,Mic, MicOff  } from 'lucide-react';
import OnlineCompiler from '../Home/components/online_compiler';
import VoiceChat from '../Home/components/VoiceChat';
import { io } from 'socket.io-client';
import { axiosinstance } from '../../utils/axios';

function Dashboard() {
  const [reviewData, setReviewData] = useState(""); // State to hold review data
  const [roomId, setRoomId] = useState(""); // State to hold room ID
  const [inputRoomId, setInputRoomId] = useState(""); // New state for input value
  const [flag, setFlag] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]); // State to hold room members
  const [username, setUsername] = useState("");
  const [isMuted, setIsMuted] = useState(true); // Set initial state to true (muted)
  const socketRef = useRef(null);
  const location = useLocation();
  const problemData = location.state;
  const [problemTitle, setProblemTitle] = useState("");
  const [problemContent, setProblemContent] = useState("");
  const [problemId, setProblemId] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const convertHtmlToPlainText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const formatText = (node) => {
      let result = '';
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) { // Text node
          result += child.textContent;
        } else if (child.nodeType === 1) { // Element node
          let content = formatText(child);
          switch (child.tagName.toLowerCase()) {
            case 'p':
              result += `\n${content}\n`;
              break;
            case 'br':
              result += '\n';
              break;
            case 'ul':
              result += '\n' + content;
              break;
            case 'li':
              result += `\n• ${content}`;
              break;
            case 'strong':
            case 'b':
              result += `*${content}*`;
              break;
            case 'code':
              result += `\`${content}\``;
              break;
            case 'pre':
              result += `\n\`\`\`\n${content}\n\`\`\`\n`;
              break;
            default:
              result += content;
          }
        }
      });
      return result;
    };

    return formatText(tempDiv)
      .trim()
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/\n\n\n+/g, '\n\n');
  };

  useEffect(() => {
    if (problemData) {
      setProblemTitle(problemData.title);
      setProblemContent(problemData.content);
      setDifficulty(problemData.difficulty);
      setProblemId(problemData.problemId);
    }
  }, [problemData]);

  useEffect(() => {
    socketRef.current= io(import.meta.env.VITE_BACKEND_URL);

    socketRef.current.on("members-update", (members) => {
      console.log("members", members);
      setRoomMembers(members);
    });

    socketRef.current.on("problem-update", (problemInfo) => {
      setProblemTitle(problemInfo.title)
      setProblemContent(problemInfo.content)
      setDifficulty(problemInfo.difficulty)
      setProblemId(problemInfo.problemId)
    })
  }, []);

  useEffect(() => {
    if (problemData && roomId) {
      setProblemTitle(problemData.title);
      setProblemContent(problemData.content);
      setDifficulty(problemData.difficulty);
      setProblemId(problemData.problemId);


    }
  }, [problemData])

  useEffect(() => {
    if (problemData) {
      socketRef.current?.emit("problem-update", {
        room: roomId,
        problemInfo: {
          title: problemData.title,
          content: problemData.content,
          difficulty: problemData.difficulty,
          problemId: problemData.problemId
        }

      });
    }
  }, [roomMembers])

  const handleJoinRoom = async () => {
    if (!inputRoomId.trim()) return;
    try {
      const response = await axiosinstance.get('/getUsername');

      // Axios automatically parses JSON - use response.data, not response.json()
      const data = response.data;

      if (data.success && data.username) {
        setUsername(data.username);
        setRoomId(inputRoomId);
        setFlag(true);
        setIsMuted(true); // Ensure user starts muted when joining
        setInputRoomId("");
        console.log(`Got username: ${data.username}`);

        if (socketRef.current) {
          socketRef.current.emit("join-room", inputRoomId);

          socketRef.current.emit("add-member", {
            room: inputRoomId,
            username: data.username
          });
        }
      } else {
        console.error("Failed to get username:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room");

      socketRef.current.emit("remove-member", {
        room: roomId,
        username: username
      });
      setFlag(false);
      setRoomId("");
      setRoomMembers([]);
      setIsMuted(true); // Reset to muted state when leaving
    }
  };

  return (
    <>
    <div className="container">
      <div className='problem-section'>
        {flag ? (
          <div className={`bg-[#111111] p-4 rounded-lg mb-4 ${problemData? 'room-members': 'fullroom'}`}>
            <div className="squad-header">
                <div className="squad-name">
                  <h1 className="mr-8"> Squad </h1>
                </div>
                <div className="voice-controls ml-auto">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`voice-button ${isMuted ? 'muted' : ''} text-white`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ?<MicOff size={20} className="text-white" />:<Mic size={20} className="text-white" />}
                  </button>
                </div>
              </div>
            <div className="player-box bg-[#1a1a1a] rounded-lg p-3">
              <div className="player-details">
                <div className="player space-y-2">
                  {roomMembers.map((member) => (
                    <h2 key={member} className="text-[#d1d0c5]">{member}</h2>
                  ))}
                </div>
              </div>
            </div>
            <div className="room-detail mt-4 flex justify-between items-center">
              <h3 className="text-[#d1d0c5]">Room ID: {roomId}</h3>
              <button onClick={handleLeave} className="leave-button">Leave</button>
            </div>
          </div>
        ) : (
          <div className={` bg-[#111111] p-4 rounded-lg mb-4 ${problemData? 'join-room-section': 'fullroom'}`}>
            <label className="text-sm text-gray-300">Join Room</label>
            <div className="flex mt-2">
              <input
                type="text"
                placeholder="Enter Room ID"
                className="flex-1 p-2 rounded-l bg-[#1a1a1a] text-[#d1d0c5]"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
              />
              <button
                className="join-button"
                onClick={handleJoinRoom}
              >
                <LogIn size={16} />
              </button>
            </div>
          </div>
        )}

        <div className={`${problemData? 'problem-content-section': 'no-content'}`}>
          <h2 className="section-title">Problem Statement</h2>
          <div className="problem-header">
            <div className="flex items-center gap-2">
              <span className="text-[#d1d0c5]">{problemId}.</span>
              <h2 className="text-[#d1d0c5] font-medium">{problemTitle}</h2>
            </div>
            <span className={`difficulty-badge difficulty-${difficulty?.toLowerCase()}`}>
              {difficulty}
            </span>
          </div>
          <div className="problem-description">
            {convertHtmlToPlainText(problemContent)}
          </div>
        </div>
      </div>

      <div className="compiler-section">
        <OnlineCompiler
          setParentReview={setReviewData}
          room={roomId}
          setFlag={setFlag}
          flag={flag}
        />
      </div>
    </div>
    {flag && <VoiceChat roomId={roomId} username={username} isMuted={isMuted} />}
    </>
  );
}

export default Dashboard;