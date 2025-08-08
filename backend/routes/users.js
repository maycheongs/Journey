import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();
const saltRounds = 10;


export default ({
  getUser,
  getUserByEmail,
  addUser,
  getItinerariesForGroup,
  getBookmarksForUser,
  deleteBookmark,
  getBookmark,
  addBookmark,
  getBookmarkByItineraryId,
  updateUserPassword,
}) => {
  router.post('/logout', (req, res) => {
    req.session.userId = null;
    res.send({ message: 'successful logout' });
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await userHelpers.getUserByEmail(email);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      req.session.userId = user.id;
      console.log('Login - Session set:', req.session, 'User ID:', user.id, 'Cookies:', req.headers.cookie); // Debug
      res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  router.get('/:user_id', (req, res) => {
    getUser(req.session.userId)
      .then(user => {
        const { id, email, first_name, last_name } = user[0];
        const parsed = { id, email, first_name, last_name };
        res.send(parsed);
      })
      .catch(err =>
        res.send({
          error: err.message,
        })
      );
  });

  router.put('/:user_id', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      res.send({ error: 'You must be logged in to change your password' });
    } else {
      getUser(userId).then(userArr => {
        const user = userArr[0];

        if (!bcrypt.compareSync(req.body.oldPassword, user.password)) {
          res.send({
            error:
              'The current password you provided does not match the one on record',
          });
        } else {
          const hashedPass = bcrypt.hashSync(req.body.newPassword, saltRounds);
          updateUserPassword(hashedPass, userId).then(() => {
            res.send({ success: 'password update success' });
          });
        }
      });
    }
  });

  router.post('/', (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const hash = bcrypt.hashSync(password, saltRounds);
    getUserByEmail(email)
      .then(user => {
        if (user) {
          res.json({
            error: 'Sorry, a user account with this email already exists',
          });
        } else {
          return addUser(first_name, last_name, email, hash).then(user => {
            req.session.userId = user.id;
            const { id, email, first_name, last_name } = user;
            const parsed = { id, email, first_name, last_name };
            res.send(parsed);
          });
        }
      })
      .catch(err =>
        res.json({
          error: err.message,
        })
      );
  });

  router.get('/me', async (req, res) => {
    console.log('GET /me - Session:', req.session, 'Cookies:', req.headers.cookie); // Debug
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const user = await userHelpers.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      console.log('GET /me - User:', user); // Debug
      res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
    } catch (err) {
      console.error('Get user error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/:user_id/itineraries', async (req, res) => {
    const { user_id } = req.params;
    if (req.session.userId != user_id) {
      return res.status(403).json({ error: 'Unauthorized access to itineraries' });
    }

    try {
      const result = await getItinerariesForGroup(user_id);
      res.send(result);
    } catch (err) {
      console.log('Error fetching itineraries:', err);
      res.status(500).json({ error: 'Failed to fetch itineraries' });
    }

  });

  router.get('/:user_id/bookmarks', (req, res) => {
    const userId = req.session.userId;

    if (userId) {
      getBookmarksForUser(userId).then(bookmarks => {
        res.send(bookmarks);
      });
    } else {
      res.send({ error: 'You must be logged in to get bookmarks' });
    }
  });

  router.post('/:user_id/bookmarks', (req, res) => {
    const userId = req.session.userId;

    if (userId) {
      getBookmarkByItineraryId(req.body.itineraryId, userId).then(result => {
        if (result.length < 1) {
          addBookmark(req.body.itineraryId, userId).then(() => {
            getBookmarksForUser(userId).then(bookmarks => {
              res.send(bookmarks);
            });
          });
        } else {
          res.send({ error: 'Itinerary is already bookmarked' });
        }
      });
    } else {
      res.send({ error: 'You must be logged in to add a bookmark' });
    }
  });

  router.delete('/:user_id/bookmarks/:bookmark_id', (req, res) => {
    const userId = req.session.userId;
    const bookmarkId = req.params.bookmark_id;

    if (!userId) {
      res.send({ error: 'You must be logged in to delete a bookmark.' });
    } else {
      getBookmark(bookmarkId).then(bookmark => {
        if (bookmark.user_id !== userId) {
          res.send({ error: "You cannot delete another user's bookmark" });
        } else {
          deleteBookmark(bookmarkId).then(() => {
            getBookmarksForUser(userId).then(bookmarks => {
              res.send(bookmarks);
            });
          });
        }
      });
    }
  });

  return router;
};
