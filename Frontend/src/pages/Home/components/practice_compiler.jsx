import React, { useState } from "react";
import './index.css'; // Ensure you have this import to apply Tailwind CSS
import './compiler.css';
import { useLocation } from "react-router-dom";
import { axiosinstance } from "../../../utils/axios";

const JDoodleCompiler = () => {
    const location = useLocation();
    const lang = location.state;
    
    // Map profile page language IDs to compiler language IDs
    const languageMap = {
        'python': 'python3',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c'
    };




    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState(languageMap[lang.setlang] || 'python3');

    const handleRunCode = async () => {
        setOutput("Running...");

        const requestData = {
            language,
            versionIndex: language === "python3" ? "3" : "0",
            script: code,
            stdin: input,
        };

        try {
            const response = await axiosinstance.post("/api/compile", JSON.stringify(requestData),);

            if (!response.ok) {
                throw new Error("Server error: " + response.statusText);
            }

            const result = await response.json();
            setOutput(result.output || result.error);
        } catch (error) {
            setOutput("Error: " + error.message);
        }
    };

    return (
        <div className="h-5/6 bg-[#111111] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center">
                    <h1 className="text-2xl font-bold text-[#d1d0c5]">Practice Mode</h1>
                    <div className="ml-4">
                        <select
                            className="bg-[#2a2a2a] text-[#d1d0c5] px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-gray-600"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="python3">Python</option>
                            <option value="java">Java</option>
                            <option value="c">C</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Code Editor */}
                    <div className="lg:col-span-2">
                        <label className="block text-[#d1d0c5] mb-2 text-sm">Code Editor</label>
                        <textarea
                            className="w-full h-[400px] bg-[#1a1a1a] text-[#d1d0c5] p-4 rounded border border-gray-700 focus:outline-none focus:border-gray-600 font-mono resize-none"
                            placeholder="Write your code here..."
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Input/Output Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[#d1d0c5] mb-2 text-sm">Input (Optional)</label>
                            <textarea
                                className="w-full h-[150px] bg-[#1a1a1a] text-[#d1d0c5] p-4 rounded border border-gray-700 focus:outline-none focus:border-gray-600 font-mono resize-none"
                                placeholder="Enter input here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-[#d1d0c5] mb-2 text-sm">Output</label>
                            <pre className="w-full h-[150px] bg-[#1a1a1a] text-[#d1d0c5] p-4 rounded border border-gray-700 overflow-auto font-mono">
                                {output || 'Output will appear here...'}
                            </pre>
                        </div>

                        <button
                            onClick={handleRunCode}
                            className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#d1d0c5] py-3 px-6 rounded flex items-center justify-center transition-colors border border-gray-700"
                        >
                            Run Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JDoodleCompiler;
