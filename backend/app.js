import express from 'express';
import { Server as SocketIO } from 'socket.io'; 
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import session from 'express-session';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import usersRouter from './routes/users.js';
import apiRouter from './routes/itineraries.js';
import searchRouter from './routes/attractions.js';

import db from './db/index.js';
import userHelpersFactory from './db_queries/userHelpers.js';
import apiHelpersFactory from './db_queries/itineraryHelpers.js';
import searchHelpersFactory from './db_queries/searchHelpers.js';

const userHelpers = userHelpersFactory(db);
const apiHelpers = apiHelpersFactory(db);
const searchHelpers = searchHelpersFactory(db);

const app = express();

// CORS configuration
const origin = process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:8000';
console.log('CORS origin:', origin); //DEBUG
app.use(cors({
  origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle CORS preflight requests
app.options('*', cors({
  origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//for debug only remove later
import session from 'express-session';

app.use(session({
  name: 'session',
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // must be true on Render (HTTPS)
    sameSite: 'none',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));


// app.use(session({
//   name: 'session',
//   secret: 'a-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { 
//     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site cookies in production
//     maxAge: 24 * 60 * 60 * 1000, // 1 day
//   },
// }));


//middleware to log all response headers
app.use((req, res, next) => {
  const originalEnd = res.end;
  res.end = function (...args) {
    console.log('➡️ Response headers:', res.getHeaders());
    originalEnd.apply(res, args);
  };
  next();
});
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to avoid conflicts with CORS
}));

app.use('/api/users', usersRouter(userHelpers));
app.use('/api/itineraries', apiRouter(apiHelpers));
app.use('/api/attractions', searchRouter(searchHelpers));

//global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
});


export function setupSocketIO(server, app) {
  const socketOrigin = process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL] : ['http://localhost:8000', 'http://127.0.0.1:8000'];
  console.log('Socket.io CORS origin:', socketOrigin); // Debug
  const io = new SocketIO(server, {
    cors: {
      origin: socketOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
  });

  app.set('socketio', io);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('itinerary_id', (id) => {
      socket.join(id);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}


export default app;
