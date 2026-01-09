import express from 'express'
import session from 'express-session';
import userRouter from './Routes/userRouter.js'
import path from 'path'
import cookieparser from 'cookie-parser'
import cors from "cors";
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import mongodb from './config/mongoose-connection.js'
import isLoggedIn from './middleware/isloggedin.js';
import dotenv from 'dotenv';
import { Server } from "socket.io";
import { LeetCode } from 'leetcode-query';
import UserActivity from '../Backend/models/userActivity.js'; 


const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

dotenv.config();

const Mongo = mongodb
Mongo.then(() => {
    console.log("mongodb connected")
}).catch(err => {
    console.error("Mongodb connection error", err)
})



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(cors({
    origin: process.env.NODE_ENV === "production"
    ? "https://collaborative-code-editor-ilbd.onrender.com"
    : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));


app.use(session({
    secret: process.env.JWT_TOKEN,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
         httpOnly: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 
    },
    name: 'sessionId',
    rolling: true
}));

app.use('/', userRouter);

const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

// Define frontend path (will be used after API routes)
const frontendPath = path.join(__dirname, '..', 'Frontend', 'dist');

const io = new Server(server, {
    cors: {
        origin:  process.env.NODE_ENV === "production"
        ? "https://collaborative-code-editor-ilbd.onrender.com"
        : ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket']
    },
    pingTimeout: 60000,
    pingInterval: 25000
})

const roomMembers = new Map();
const activeConnections = new Set();
const voiceRooms = new Map();
io.on('connection', (socket) => {
    let currentroom = null;
    const socketID = socket.id;
    console.log('User connected:', socketID);

    // Store socket ID in a Set to track active connections
    activeConnections.add(socketID);

    socket.on("join-room", (room) => {
        socket.join(room);
        currentroom = room;
        console.log(`User joined room ${currentroom}`);
    });

    socket.on("message", (data) => {
        console.log(`Message from ${socketID}:`, data.writtencode, "to", data.roomname);
        socket.to(data.roomname).emit("message", {roomname: data.roomname, writtencode: data.writtencode});
        }
        
    );

    socket.on('disconnect', (reason) => {
        console.log(`User disconnected (${reason}):`, socketID);
        activeConnections.delete(socketID);
    });



    socket.on("leave-room", () => {
        if(currentroom){
            socket.leave(currentroom)
            currentroom = null
        }
        console.log(`User ${socketID} left room ${currentroom}`);
    });

    socket.on("add-member", ({room, username}) => {
        if(!roomMembers.has(room)) {
            roomMembers.set(room, new Set());
        }
        roomMembers.get(room).add(username);
        io.to(room).emit("members-update", Array.from(roomMembers.get(room)));
        console.log("arr", Array.from(roomMembers.get(room)))
    });


    socket.on("remove-member", ({room,username}) => {
        if(roomMembers.has(room)) {
            roomMembers.get(room).delete(username);
            if(roomMembers.get(room).size === 0){
                roomMembers.delete(room);
            } else{
                io.to(room).emit("members-update", Array.from(roomMembers.get(room)));
            }
        }
    });

    socket.on("problem-update", (data)=>{
        socket.to(data.room).emit("problem-update", data.problemInfo)
    });

     // WebRTC Voice Chat Handlers
    socket.on("join-voice-room", ({ roomId, username }) => {
        socket.join(`voice-${roomId}`);
        if (!voiceRooms.has(roomId)) {
            voiceRooms.set(roomId, new Set());
        }
        voiceRooms.get(roomId).add(socketID);
        
        // Notify others in the room
        socket.to(`voice-${roomId}`).emit("user-joined-voice", {
            signal: null,
            callerID: socketID,
            callerUsername: username
        });
    });

    socket.on("sending-signal", ({ userToSignal, callerID, signal }) => {
        io.to(userToSignal).emit("user-joined-voice", {
            signal,
            callerID,
            callerUsername: socket.username
        });
    });

    socket.on("returning-signal", ({ signal, callerID }) => {
        io.to(callerID).emit("receiving-returned-signal", {
            signal,
            id: socketID
        });
    });

    socket.on("leave-voice-room", ({ roomId, username }) => {
        socket.leave(`voice-${roomId}`);
        if (voiceRooms.has(roomId)) {
            voiceRooms.get(roomId).delete(socketID);
            if (voiceRooms.get(roomId).size === 0) {
                voiceRooms.delete(roomId);
            }
        }
    });


    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});


app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});




__dirname = path.dirname(fileURLToPath(import.meta.url))




app.post("/api/compile", async (req, res) => {
    const { script, language, stdin } = req.body;
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
    const apiUrl = "https://api.jdoodle.com/v1/execute";

    const requestData = {
        clientId,
        clientSecret,
        script,
        language,
        versionIndex: language === "python3" ? "3" : "0",
        stdin: stdin || ""
    };

    try {
        console.log("Request data:", requestData);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
        });

        const responseText = await response.text();
        console.log("Full response from API:", responseText);

        const result = JSON.parse(responseText);
        res.json({ output: result.output || result.error });
    } catch (error) {
        console.error("Error occurred while fetching data from JDOODLE API:", error);
        res.status(500).json({ error: "Failed to fetch" });
    }
});

app.get('/api/user/activity', isLoggedIn, async (req, res) => {
    try {
      // Get user ID from session
      const userId = req.session.user.id;
      
      // Calculate date one year ago
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      // Query activities within the last year
      const activities = await UserActivity.find({
        userId: userId,
        date: { $gte: oneYearAgo }
      }).select('date -_id');
      
      // Group by date
      const groupedActivities = activities.reduce((acc, activity) => {
        // Format date as YYYY-MM-DD
        const date = new Date(activity.date).toISOString().split('T')[0];
        
        // Increment count for this date or initialize to 1
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      
      // Convert to array format expected by frontend
      const activityData = Object.keys(groupedActivities).map(date => ({
        date,
        count: groupedActivities[date]
      }));
      
      res.json(activityData);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({ error: 'Failed to fetch activity data' });
    }
  });


// Add before server.listen()
app.get('/api/leetcode/problems', async (req, res) => {
    const leetcode = new LeetCode();
    try {
        console.log('Fetching LeetCode problems...'); // Debug log
        const problemlist = await leetcode.problems({limit: 10});
        
        if (!problemlist) {
            throw new Error('No problems returned from LeetCode API');
        }

        // Cache the results for 1 hour
        const cacheData = {
            timestamp: Date.now(),
            data: problemlist
        };
        
        console.log(`Successfully fetched ${problemlist.questions.length} problems`); // Debug log
        res.json(problemlist.questions);
    } catch (error) {
        console.error('Detailed LeetCode API error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to fetch problems',
            details: error.message 
        });
    }
});

app.get('/api/leetcode/problem/:id', async (req, res) => {
    try {
        const leetcode = new LeetCode();
        const problemlist = await leetcode.problems();

        const selected_problem1 = problemlist.questions.find(
            p => p.questionFrontendId === req.params.id
        );

        if (!selected_problem1) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const selected_problem = await leetcode.problem(selected_problem1.titleSlug);

        if (!selected_problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        console.log("Fetched", selected_problem.title);
        res.json(selected_problem);
    } catch (error) {
        console.error('LeetCode API error:', error);
        res.status(500).json({
            error: 'Failed to fetch problem',
            details: error.message
        });
    }
});




// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Collaborative Code Editor Backend is running',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// Serve static files from React build (JS, CSS, images, etc.)
// This should come after API routes but before catch-all
app.use(express.static(frontendPath, { index: false })); // index: false prevents serving index.html automatically

// Root endpoint - serve React app in production, or API info in development
app.get('/', (req, res) => {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
        // If it's a browser request, serve the React app
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        // API request - return JSON
        res.status(200).json({ 
            message: 'Collaborative Code Editor Backend API',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                auth: '/api/auth/*',
                leetcode: '/api/leetcode/*',
                compile: '/api/compile'
            }
        });
    }
});

// Catch-all handler: serve React app for client-side routes
// This must be after all API routes and will only match routes not already handled
app.get('*', (req, res) => {
    // Skip API routes, socket.io, and health check (these are handled above)
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/socket.io') || 
        req.path === '/health') {
        return res.status(404).json({ error: 'Route not found' });
    }
    
    // Serve index.html for all other routes (React Router will handle the routing)
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Error loading page');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});