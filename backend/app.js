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

const corsOptions = {
  origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.set('trust proxy', 1); // trust first proxy for secure cookies in production

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight
app.use(session({
  name: 'connect.sid',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none', // for cross-site cookies
  },
}));


// Debug middleware

if (process.env.DEBUG_SESSION === 'true') {
  app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url, 
    'Session:', req.session, 'Cookies:', req.headers.cookie, 'SessionID:', req.sessionID, 
    'Secure:', req.secure, 'Protocol:', req.protocol, 'X-Forwarded-Proto:', req.get('x-forwarded-proto'));
  const originalSetHeader = res.setHeader;
  res.setHeader = function (name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('Setting Set-Cookie:', value);
    }
    originalSetHeader.apply(res, [name, value]);
  };
  next();
});
}

 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet({contentSecurityPolicy: false})); // Disable CSP for now, can be configured later

app.get('/wake', (req,res) => {
  res.json({
    awake: true,
    time: new Date().toISOString()
  })
})

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
  if (process.env.DEBUG_SESSION === 'true') console.log('Socket.io CORS origin:', socketOrigin);
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
