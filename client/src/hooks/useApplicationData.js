import { useEffect, useReducer, useRef } from 'react';
import dataReducer, {
  SET_USER,
  SET_MY_ITINERARIES,
  SET_ITINERARY,
  SET_BOOKMARKS,
  SHOW_SIDEBAR,
} from '../reducers/application';
import axios from 'axios';
import { io } from 'socket.io-client';

const ENDPOINT = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8002';

// Setup axios instance with interceptors
export const api = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : undefined, // proxy works in dev
  // withCredentials: true, // include cookies for CORS
});

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.config.method, response.config.url, 'Cookies:', document.cookie, 'Set-Cookie:', response.headers['set-cookie']); // Debug
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default function useApplicationData() {
  // Load persisted user from localStorage
  const persistedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [state, dispatch] = useReducer(dataReducer, {
    user: persistedUser || {},
    itinerary: null,
    myItineraries: [],
    bookmarks: [],
    sideNav: {
      belowBreak: false,
      rightNav: {
        collapsed: false,
        breakPointCollapsed: false,
        userCollapsed: false,
      },
      leftNav: {
        collapsed: false,
        breakPointCollapsed: false,
        userCollapsed: false,
      },
    },
    key: Math.random(),
  });

  // Persist user in localStorage
  useEffect(() => {
    if (state.user?.id) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.user]);



  // Fetch user on initial mount if not loaded
  useEffect(() => {
  const checkUser = async () => {
    const storedUser = localStorage.getItem('user');
    console.log('Initial check - localStorage user:', storedUser); // Debug
    try {
      const response = await api.get('/api/users/me');
      console.log('Fetched user from /me:', response.data); // Debug
      if (response.data.id) {
        dispatch({ type: SET_USER, user: response.data });
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        dispatch({ type: SET_USER, user: {} });
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Failed to fetch user from /me:', err.response?.data || err.message);
      dispatch({ type: SET_USER, user: {} });
      localStorage.removeItem('user');
    }
  };
  checkUser();
}, []);

  // --- Authentication ---
const login = async (email, password) => {
  try {
    const response = await api.post('/api/users/login', { email, password });
    console.log('Login response:', response.data, 'Cookies:', document.cookie, 'Set-Cookie:', response.headers['set-cookie']); // Debug
    dispatch({ type: SET_USER, user: response.data });
    localStorage.setItem('user', JSON.stringify(response.data));
    return response;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};
  const logout = () =>
    api.post('/api/users/logout').then(() => dispatch({ type: SET_USER, user: {} }));
  const register = (first_name, last_name, email, password) =>
    api.post('/api/users', { first_name, last_name, email, password });

  // --- Itinerary CRUD ---
  useEffect(() => {
    if (state.user.id) {
      console.log('Fetching itineraries for user ID:', state.user.id); // Debug
      api.get(`/api/users/${state.user.id}/itineraries`).then(res => {
        const myItineraries = res.data;

        if (Array.isArray(myItineraries) && myItineraries.length > 0) {
          dispatch({
            type: SET_MY_ITINERARIES,
            myItineraries: myItineraries,
          });
        }
      });
    }
  }, [state.user, state.itinerary?.id]);
  const createItinerary = (itinerary, visibility) =>
    api.post('/api/itineraries', { ...itinerary, visible: visibility });

  const deleteItinerary = (itineraryId) => api.delete(`/api/itineraries/${itineraryId}`);

  const setItinerary = (itinerary_id) =>
    Promise.all([
      api.get(`/api/itineraries/${itinerary_id}`),
      api.get(`/api/itineraries/${itinerary_id}/collaborators`),
    ])
      .then(([itinerary, users]) => {
        dispatch({
          type: SET_ITINERARY,
          itinerary: { ...itinerary.data, users: users.data },
        });
      })
      .catch((err) => console.log(err));

  const editItinerary = (itinerary, visibility) =>
    api.put(`/api/itineraries/${itinerary.id}`, { ...itinerary, visible: visibility });

  // --- Days and Activities ---
  const addDayWithLocation = (itinerary_id, location_name, new_day_order) =>
    api
      .post(`/api/itineraries/${itinerary_id}`, { location_name, new_day_order })
      .then((res) => {
        if (res.data.error) return { error: res.data.error };

        dispatch({ type: SET_ITINERARY, itinerary: { ...state.itinerary, ...res.data } });
        return { itinerary: res.data };
      });

  const deleteDayFromItinerary = (itinerary_id, day_id) =>
    api.delete(`/api/itineraries/${itinerary_id}/days/${day_id}`).then((res) => {
      if (res.data.error) return { error: res.data.error };

      dispatch({ type: SET_ITINERARY, itinerary: { ...state.itinerary, ...res.data } });
      return { success: 'day deleted' };
    });

  const createActivity = (activity, itineraryId, dayId) =>
    api.post(`/api/itineraries/${itineraryId}/days/${dayId}/activities`, activity);

  const deleteActivity = (itineraryId, dayId, activityId) =>
    api.delete(`/api/itineraries/${itineraryId}/days/${dayId}/activities/${activityId}`)
      .then((res) => {
        if (res.data.error) return { error: res.data.error };
        dispatch({ type: SET_ITINERARY, itinerary: { ...state.itinerary, ...res.data } });
        return { success: 'Activity Deleted' };
      });

  const deleteActivityWithoutDay = (activityId, itineraryId) =>
    api.delete(`/api/itineraries/${itineraryId}/activities/${activityId}`);

  const editActivity = (itinerary_id, activity_id, activityForm) =>
    api.put(`/api/itineraries/${itinerary_id}/activities/${activity_id}`, activityForm)
      .then((res) => {
        if (res.data.error) return { error: res.data.error };
        dispatch({ type: SET_ITINERARY, itinerary: { ...state.itinerary, ...res.data } });
        return { success: 'Activity Updated' };
      });

  const updateActivityDay = (activityId, dayId, itineraryId) =>
    api.put(`/api/itineraries/${itineraryId}/activities/${activityId}`, { dayId });

  // --- Collaborators ---
  const addCollaborator = (itineraryId, email) =>
    api.post(`/api/itineraries/${itineraryId}/users`, { email })
      .then((res) => {
        if (res.data.error) return { error: res.data.error };
        dispatch({ type: SET_ITINERARY, itinerary: { ...state.itinerary, users: res.data } });
        return { party: res.data, success: 'user added to travel party' };
      });

  const removeCollaborator = (itineraryId, userId) =>
    api.delete(`/api/itineraries/${itineraryId}/users/${userId}`)
      .then((res) => {
        dispatch({ type: SET_ITINERARY, itinerary: { ...state.itinerary, users: res.data } });
      });

  // --- Bookmarks ---
  useEffect(() => {
    if (state.user.id) {
      api.get(`/api/users/${state.user.id}/bookmarks`).then(res => {
        const bookmarks = res.data;

        if (Array.isArray(bookmarks) && bookmarks.length > 0) {
          dispatch({
            type: SET_BOOKMARKS,
            bookmarks: bookmarks,
          });
        }
      });
    }
  }, [state.user?.id]);
  const addBookmark = (itineraryId) =>
    api.post(`/api/users/${state.user.id}/bookmarks`, { itineraryId });

  const deleteBookmark = (bookmarkId) =>
    api.delete(`/api/users/${state.user.id}/bookmarks/${bookmarkId}`);

  // --- Notes ---
  const addTripNote = (itinerary_id, noteString, important) =>
    api.post(`/api/itineraries/${itinerary_id}/notes`, { note: noteString, important });

  const deleteTripNote = (itinerary_id, note_id) =>
    api.delete(`/api/itineraries/${itinerary_id}/notes/${note_id}`);

  const editTripNote = (itinerary_id, note_id, noteStr, important) =>
    api.put(`/api/itineraries/${itinerary_id}/notes/${note_id}`, { note: noteStr, important });

  // --- Search ---
  const searchItineraries = (query, type, length) =>
    api.get(`/api/itineraries/${query}/${type}/${length}`);

  const searchAttractions = (locationName, query, categories) =>
    api.get(`/api/attractions/${locationName}/${query}/${categories}`);

  const addMyLocation = (attractionId, itineraryId) =>
    api.post(`/api/itineraries/${itineraryId}/activities`, { attractionId, itineraryId });

  // --- UI ---
  function updateSidebar(right, rightUser, left, leftUser) {
    dispatch({
      type: SHOW_SIDEBAR,
      belowBreak: window.innerWidth < 1024,
      rightNav: {
        collapsed: right !== null ? right : state.sideNav.rightNav.collapsed,
        breakPointCollapsed: state.sideNav.rightNav.breakPointCollapsed,
        userCollapsed: rightUser !== null ? rightUser : state.sideNav.rightNav.userCollapsed,
      },
      leftNav: {
        collapsed: left !== null ? left : state.sideNav.leftNav.collapsed,
        breakPointCollapsed: false,
        userCollapsed: leftUser !== null ? leftUser : state.sideNav.leftNav.userCollapsed,
      },
    });
  }

  // --- Responsive Sidebar ---
  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth >= 1024) {
        dispatch({
          type: SHOW_SIDEBAR,
          belowBreak: false,
          rightNav: { collapsed: false, breakPointCollapsed: true, userCollapsed: false },
          leftNav: { collapsed: false, breakPointCollapsed: true, userCollapsed: false },
        });
      } else {
        dispatch({
          type: SHOW_SIDEBAR,
          belowBreak: true,
          rightNav: { collapsed: true, breakPointCollapsed: false, userCollapsed: true },
          leftNav: { collapsed: true, breakPointCollapsed: false, userCollapsed: true },
        });
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!state.itinerary?.id) return;

    if (!socketRef.current) {
      // Create socket only once
      socketRef.current = io(ENDPOINT);

      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socketRef.current.on('itinerary', (data) => {
        dispatch({ type: SET_ITINERARY, itinerary: { ...state.itinerary, ...data } });
      });
    }

    // Join the new itinerary room
    socketRef.current.emit('itinerary_id', state.itinerary.id);

    // return () => {
    //   socketRef.current.disconnect();
    //   socketRef.current = null;
    // };
  }, [state.itinerary, state.itinerary?.id]);

  return {
    state,
    dispatch,
    login,
    register,
    logout,
    createItinerary,
    removeCollaborator,
    createActivity,
    addCollaborator,
    setItinerary,
    addDayWithLocation,
    deleteItinerary,
    deleteBookmark,
    addBookmark,
    deleteDayFromItinerary,
    updateSidebar,
    deleteActivity,
    editActivity,
    editItinerary,
    searchAttractions,
    addMyLocation,
    updateActivityDay,
    deleteActivityWithoutDay,
    searchItineraries,
    addTripNote,
    deleteTripNote,
    editTripNote,
  };
}
