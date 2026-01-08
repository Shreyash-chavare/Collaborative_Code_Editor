import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Wifi, WifiOff } from 'lucide-react';
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';

const VoiceChat = ({ roomId, username, isMuted: parentIsMuted }) => {
    const [isMuted, setIsMuted] = useState(true);
    const [peers, setPeers] = useState([]);
    const [stream, setStream] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);
    const userVideo = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // Sync with parent mute state
    useEffect(() => {
        setIsMuted(parentIsMuted);
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !parentIsMuted;
            });
        }
    }, [parentIsMuted]);

    const handlePeerError = (peer, error) => {
        console.error("Peer connection error:", error);
        setError("Connection error occurred. Attempting to reconnect...");
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
            if (peer && !peer.destroyed) {
                peer.destroy();
            }
            setError(null);
        }, 5000);
    };

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");
        
        socketRef.current.on("connect", () => {
            setIsConnected(true);
            setError(null);
        });

        socketRef.current.on("disconnect", () => {
            setIsConnected(false);
            setError("Disconnected from server. Attempting to reconnect...");
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setError("Failed to connect to server. Please check your connection.");
        });
        
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                setStream(stream);
                stream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
                if (userVideo.current) {
                    userVideo.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error accessing microphone:", err);
                setError("Failed to access microphone. Please check your permissions.");
            });

        socketRef.current.emit("join-voice-room", { roomId, username });

        socketRef.current.on("user-joined-voice", ({ signal, callerID, callerUsername }) => {
            const peer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream: stream
            });

            peer.on("error", (error) => handlePeerError(peer, error));
            peer.on("close", () => {
                setPeers(prev => prev.filter(p => p.peer._id !== callerID));
            });

            peer.signal(signal);
            peer.on("connect", () => {
                console.log("Connected to peer:", callerUsername);
                setError(null);
            });

            setPeers(prev => [...prev, { peer, username: callerUsername }]);
        });

        socketRef.current.on("receiving-returned-signal", ({ signal, id }) => {
            const peer = peers.find(p => p.peer._id === id);
            if (peer) {
                peer.peer.signal(signal);
            }
        });

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.emit("leave-voice-room", { roomId, username });
                socketRef.current.disconnect();
            }
        };
    }, [roomId, username]);

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("error", (error) => handlePeerError(peer, error));
        peer.on("close", () => {
            setPeers(prev => prev.filter(p => p.peer._id !== callerID));
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending-signal", { userToSignal, callerID, signal });
        });

        return peer;
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="voice-chat-container">
            <div className="voice-controls">
                <button 
                    onClick={toggleMute}
                    className={`voice-button ${isMuted ? 'muted' : ''} text-white`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                </button>
                <div className="connection-status">
                    {isConnected ? 
                        <Wifi size={20} className="text-green-500" /> : 
                        <WifiOff size={20} className="text-red-500" />
                    }
                </div>
            </div>
            {error && (
                <div className="error-message text-red-500 text-sm mt-2">
                    {error}
                </div>
            )}
            <div className="voice-participants">
                <div className="participant">
                    <audio ref={userVideo} autoPlay playsInline muted={isMuted} />
                </div>
                {peers.map((peer, index) => (
                    <div key={index} className="participant">
                        <audio ref={node => {
                            if (node) {
                                node.srcObject = peer.peer.stream;
                                node.play();
                            }
                        }} />
                        <span>{peer.username}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoiceChat; 