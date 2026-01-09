import React, { useState, useEffect, useRef, useContext } from "react";
import './index.css';
import './compiler.css';
import { io } from 'socket.io-client';
import 'prismjs/themes/prism-tomorrow.css';
import prism from 'prismjs';
import { Play, Save, Download, Settings, RefreshCw, X } from 'lucide-react';
import { axiosinstance } from "../../../utils/axios";

const OnlineCompiler = ({ setParentReview , room , setFlag , flag}) => {
    const [language, setLanguage] = useState(() => localStorage.getItem('compiler_language') || "python3");
    const [code, setCode] = useState(() => localStorage.getItem('compiler_code') || "");
    const [input, setInput] = useState(() => localStorage.getItem('compiler_input') || "");
    const [output, setOutput] = useState("");
    const [review, setReview] = useState("");
    const [socketId, setSocketId] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const socketRef = useRef(null);
    const [minimize , setMinimize] = useState(false);



    // Save code to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('compiler_code', code);
    }, [code]);

    // Save language to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('compiler_language', language);
    }, [language]);

    // Save input to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('compiler_input', input);
    }, [input]);

    useEffect(() => {
        prism.highlightAll();
    }, []);

    useEffect(() => {
        if (room) {
            handleJoinRoom();
        }
    }, [room]);

    const handleJoinRoom = () => {
        if (socketRef.current) {
        socketRef.current.emit("join-room", room);
        setFlag(true);
        }
    };


    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
                withCredentials: true,
                transports: ['websocket'],
                timeout: 10000,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });
        }
    }, []); // Run once on mount
    
    // Handle socket events in a separate useEffect
    useEffect(() => {
        if (!socketRef.current) return;
    
        const socket = socketRef.current;
    
        // Remove existing listeners to prevent duplicates
        socket.off("connect");
        socket.off("connect_error");
        socket.off("message");
    
        // Add listeners
        socket.on("connect", () => {
            console.log("Connected to server:", socket.id);
            setSocketId(socket.id);
        });
    
        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });
    
        socket.on("message", (data) => {
            console.log("Message received:", data);
            console.log("Current room:", room);
            if (data.roomname === room) {
                console.log("Setting code to:", data.writtencode);
                setCode(data.writtencode);
            }
        });
    
        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("message");
        };
    }, [room, socketRef.current]); // Run when room or socket changes
    

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput("Running...");

        const requestData = {
            language,
            versionIndex: language === "python3" ? "3" : "0",
            script: code,
            stdin: input,
        };

        try {
            const response =  await axiosinstance.post("/api/compile", requestData);

            if (!response.ok) {
                throw new Error("Server error: " + response.statusText);
            }

            const result = await response.json();
            setOutput(result.output || result.error);
        } catch (error) {
            setOutput("Error: " + error.message);
        } finally {
            setIsRunning(false);
        }
    };

    const handleTextArea = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        socketRef.current.emit("message", {roomname: room, writtencode: newCode});
    };

    const runcode = async () => {
        try {
            setReview("");
            setShowReview(false);
            
            const response = await axiosinstance.post('/get-code', { code });
            setReview(response.data);
            setParentReview(response.data);
            setShowReview(true);
        } catch (error) {
            console.error('Error running code:', error);
        }
    };

     const handleMinimize = () => {
        setMinimize(!minimize);
    };

    return (
        <div className={`compiler-container ${showReview ? 'review-open' : ''}`}>
            <div className="compiler-header">
                <div className="language-selector">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="language-select"
                    >
                        <option value="python3">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
                <div className="compiler-controls">
                    <button className="control-btn" onClick={handleRunCode} disabled={isRunning}>
                        <Play className="icon" />
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button className="control-btn" onClick={runcode}>
                        <RefreshCw className="icon" />
                        Review
                    </button>
                    <button className="control-btn">
                        <Save className="icon" />
                        Save
                    </button>
                    <button className="control-btn">
                        <Download className="icon" />
                        Download
                    </button>
                    <button className="control-btn">
                        <Settings className="icon" />
                        Settings
                    </button>
                </div>
            </div>

            <div className="compiler-body">
                <div className="editor-pane">
                    <div className="editor-header">
                        <span className="file-name">main.{language === 'python3' ? 'py' : language === 'java' ? 'java' : language === 'c' ? 'c' : 'cpp'}</span>
                    </div>
                    <textarea
                        className="code-editor"
                        placeholder="Write your code here..."
                        value={code}
                        onChange={handleTextArea}
                        spellCheck="false"
                    />
                </div>
                <button className="hover:bg-[#323437] h-10 p-2"
                    onClick={handleMinimize}> 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#4a4a4a" fill="#4a4a4a">
    <path d="M3 12C3 11.4188 3 11.1282 3.0575 10.8897C3.21354 10.2427 3.6684 9.73726 4.25074 9.56389C4.46534 9.5 4.72689 9.5 5.25 9.5H18.75C19.2731 9.5 19.5347 9.5 19.7493 9.56389C20.3316 9.73726 20.7865 10.2427 20.9425 10.8897C21 11.1282 21 11.4188 21 12C21 12.5812 21 12.8718 20.9425 13.1103C20.7865 13.7573 20.3316 14.2627 19.7493 14.4361C19.5347 14.5 19.2731 14.5 18.75 14.5H5.25C4.72689 14.5 4.46534 14.5 4.25074 14.4361C3.6684 14.2627 3.21354 13.7573 3.0575 13.1103C3 12.8718 3 12.5812 3 12Z" stroke="currentColor" stroke-width="1.5" />
</svg> 
                </button>
            {minimize && (
                <div className="io-pane z-100">
                    
                    <div className="input-section">
                        <div className="section-header">Input</div>
                        <textarea
                            className="io-textarea"
                            placeholder="Enter input (optional)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    <div className="output-section">
                        <div className="section-header">Output</div>
                        <pre className="output-display">{output}</pre>
                    </div>
                </div>
            )}   
            </div>
            {showReview && (
                <div className="review-panel">
                    <div className="review-header">
                        <h3>Code Review</h3>
                        <button className="close-btn" onClick={() => setShowReview(false)}>
                            <X className="icon" />
                        </button>
                    </div>
                    <div className="review-content">
                        {review}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineCompiler;
