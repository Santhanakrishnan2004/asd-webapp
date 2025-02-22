const express = require('express');
require('dotenv').config(); 
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const PORT = 3000||process.env.port;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true
}));

// EJS Setup
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Routes
app.use(authRoutes);

// Home Route
app.get('/', (req, res) => {
    res.render('home');
});

// Community Chat Route
app.get('/community', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('community');
});


// Start HTTP Server and Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for a user joining with their chosen name
    socket.on('join', (name) => {
        socket.username = name;
        io.emit('message', `${name} has joined the chat!`);
    });

    // Listen for chat messages
    socket.on('chat message', (msg) => {
        io.emit('message', `${socket.username}: ${msg}`);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        io.emit('message', `${socket.username} has left the chat.`);
    });
});
// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
