import React, { useState, useEffect } from 'react';
import "./problems.css";
import { useNavigate } from 'react-router-dom';
import { axiosinstance } from '../../utils/axios';
const LeetCodeProblems = () => {
    const [problemlist, setProblemlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questionId, setQuestionId] = useState('');
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [expandedProblemId, setExpandedProblemId] = useState(null);
    const navigate = useNavigate();

    const convertHtmlToPlainText = (html) => {
        // Create a temporary div to handle HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Replace specific HTML elements with formatted text
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
            .replace(/\n\s*\n/g, '\n\n') // Remove extra blank lines
            .replace(/\n\n\n+/g, '\n\n'); // Limit consecutive newlines
    };

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                console.log('Starting problems fetch...'); // Debug log
                const response = await axiosinstance.get('/api/leetcode/problems');

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Server error: ${response.status}`);
                }

                console.log('Problems fetched successfully:', data); // Debug log
                setProblemlist(data);
                setLoading(false);
            } catch (err) {
                console.error('Error details:', err); // Debug log
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const handleSearchQuestion = async () => {
        if (!questionId.trim()) return;

        setSearchLoading(true);
        setError(null);
        try {
            const response = await axiosinstance.get(`/api/leetcode/problem/${questionId}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch problem details');
            }

            setSelectedProblem(data);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleOpenProblem = (problem) => {
        console.log(problem)
        navigate('/app', {
            state: {
                problemId: problem.questionFrontendId,
                title: problem.title,
                content: convertHtmlToPlainText(problem.content),
                topicTags: problem.topicTags,
                difficulty: problem.difficulty,
            }
        })
    }

    const handleProblemClick = async (problemId) => {
        if (expandedProblemId === problemId) {
            setExpandedProblemId(null);
            return;
        }

        try {
            const response = await axiosinstance.get(`/api/leetcode/problem/${problemId}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch problem details');
            }

            setSelectedProblem(data);
            setExpandedProblemId(problemId);
        } catch (err) {
            console.error('Error fetching problem details:', err);
            setError(err.message);
        }
    };

    if (loading) return <div className="p-4">Loading LeetCode problems...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <div className="space-y-6">
                {/* Search Section */}
                <div className="bg-[#111111] p-4 rounded-lg">
                    <h2 className="text-xl font-bold text-[#d1d0c5] mb-4">Search Problem</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={questionId}
                            onChange={(e) => setQuestionId(e.target.value)}
                            placeholder="Enter question ID"
                            className="flex-1 p-2 rounded bg-[#1a1a1a] text-[#d1d0c5] border border-gray-700"
                        />
                        <button
                            onClick={handleSearchQuestion}
                            disabled={searchLoading}
                            className="px-4 py-2 bg-[#1a1a1a] text-[#d1d0c5] rounded hover:bg-[#2a2a2a] transition-colors border border-gray-700"
                        >
                            {searchLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* Problems List */}
                {selectedProblem ? (
                    <div className="bg-[#111111] p-4 rounded-lg">
                        <h2 className="text-xl font-bold text-[#d1d0c5] mb-4">Search Result</h2>
                        <div className="p-3 border border-gray-700 rounded bg-[#1a1a1a]">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-[#d1d0c5]">
                                        {selectedProblem.questionFrontendId}. {selectedProblem.title}
                                    </h3>
                                    <div className="text-[#d1d0c5] font-mono whitespace-pre-wrap">
                                        {convertHtmlToPlainText(selectedProblem.content)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenProblem(selectedProblem)}
                                    className="px-4 py-2 bg-[#2a2a2a] text-[#d1d0c5] rounded hover:bg-[#3a3a3a] transition-colors border border-gray-700"
                                >
                                    Open Problem
                                </button>
                            </div>
                            <div className="flex flex-col gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-gray-400">Success Rate</p>
                                    <p className="text-[#d1d0c5]">{JSON.parse(selectedProblem.stats).acRate}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Topics</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedProblem.topicTags.map((tag) => (
                                            <span
                                                key={tag.name}
                                                className="px-2 py-1 bg-[#111111] text-[#d1d0c5] text-sm rounded border border-gray-700"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedProblem(null)}
                            className="mt-4 px-4 py-2 bg-[#222222] text-[#d1d0c5] rounded hover:bg-[#333333] transition-colors border border-gray-700"
                        >
                            Back to All Problems
                        </button>
                    </div>
                ) : (
                    // 📃 Show full list
                    <div className="bg-[#111111] p-4 rounded-lg">
                        <h2 className="text-xl font-bold text-[#d1d0c5] mb-4">All Problems</h2>
                        <div className="space-y-2">
                            {problemlist.map(problem => (
                                <div key={problem.questionFrontendId}>
                                    <div
                                        onClick={() => handleProblemClick(problem.questionFrontendId)}
                                        className="p-3 border border-gray-700 rounded bg-[#1a1a1a] hover:bg-[#2a2a2a] cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium">{problem.questionFrontendId}. </span>
                                                {problem.title}
                                            </div>
                                            <span className={`ml-2 px-2 py-1 rounded text-sm ${problem.difficulty === 'Easy' ? 'bg-green-900 text-green-100' :
                                                    problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-100' :
                                                        'bg-red-900 text-red-100'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </div>
                                    </div>

                                    {expandedProblemId === problem.questionFrontendId && selectedProblem && (
                                        <div className="mt-2 ml-4 p-4 border-l-2 border-gray-700 bg-[#1a1a1a] rounded">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h3 className="text-lg font-semibold text-[#d1d0c5]">{selectedProblem.title}</h3>
                                                        <div className="text-[#d1d0c5] font-mono whitespace-pre-wrap">
                                                            {convertHtmlToPlainText(selectedProblem.content)}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleOpenProblem(selectedProblem)}
                                                        className="px-4 py-2 bg-[#2a2a2a] text-[#d1d0c5] rounded hover:bg-[#3a3a3a] transition-colors border border-gray-700"
                                                    >
                                                        Open Problem
                                                    </button>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-400">Success Rate</p>
                                                        <p className="text-[#d1d0c5]">{JSON.parse(selectedProblem.stats).acRate}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">Topics</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {selectedProblem.topicTags.map((tag) => (
                                                                <span
                                                                    key={tag.name}
                                                                    className="px-2 py-1 bg-[#111111] text-[#d1d0c5] text-sm rounded border border-gray-700"
                                                                >
                                                                    {tag.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LeetCodeProblems;