import express from 'express';
import { Server as SocketIO } from 'socket.io'; 
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import cookieSession from 'cookie-session';
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

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());
app.use(cors());

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

// const server = http.createServer(app);

// const io = new SocketIO(server, {
//   cors: {
//     origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   },
// });

// app.set('socketio', io);

// io.on('connection', (socket) => {
//   console.log('New client connected');

//   socket.on('itinerary_id', (id) => {
//     socket.join(id);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// server.listen(port, () => console.log(`Listening on port ${port}`));

export function setupSocketIO(server, app) {
  const io = new SocketIO(server, {
    cors: {
      origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
