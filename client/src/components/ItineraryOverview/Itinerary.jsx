import { useLocation, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { SET_BOOKMARKS } from '../../reducers/application';

import ItineraryDays from './ItineraryDays';
import AddNoteForm from './AddNoteForm';
import Note from './Note';

export default function Itinerary(props) {
  const {
    itinerary,
    user,
    deleteDayFromItinerary,
    bookmarks,
    addBookmark,
    deleteBookmark,
    dispatch,
    addTripNote,
    deleteTripNote,
    editTripNote,
  } = props;

  const url = useLocation().pathname;

  const SHOW = 'SHOW';
  const HIDE = 'HIDE';
  const [view, setView] = useState(SHOW);

  const ADD = 'ADD';
  const DEFAULT = 'DEFAULT';
  const [addView, setAddView] = useState(DEFAULT);

  const formatDate = dateString => {
    if (dateString) {
      return new Date(dateString).toDateString();
    }
  };

  let tripDuration = 0;
  let endDate;

  const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  if (itinerary.start_date) {
    itinerary.locations.forEach(location => {
      tripDuration += location.days.length;
    });

    endDate = addDays(itinerary.start_date, tripDuration).toDateString();
  } else if (itinerary) {
    itinerary.locations.forEach(
      location => (tripDuration += location.days.length)
    );
  }
  const BOOKMARKED = 'BOOKMARKED';
  const BOOKMARK = 'BOOKMARK';
  const [bookmarkView, setBookMarkView] = useState(BOOKMARK);

  const bookmarkArr = bookmarks.map(bookmark => {
    return bookmark.id;
  });
  useEffect(() => {
    if (bookmarkArr.includes(itinerary.id)) {
      setBookMarkView(BOOKMARKED);
    }
  }, [itinerary.id, bookmarkArr]);

  useEffect(() => {
    const trip_notes = itinerary.trip_notes;
    if (trip_notes?.length > 0) {
    }
  });

  const handleBookmark = () => {
    if (user.id && !bookmarkArr.includes(itinerary.id)) {
      addBookmark(itinerary.id).then(res => {
        if (!res.data.error) {
          dispatch({
            type: SET_BOOKMARKS,
            bookmarks: res.data,
          });
          setBookMarkView(BOOKMARKED);
        }
      });
    } else if (user.id && bookmarkArr.includes(itinerary.id)) {
      const bookmarkId = bookmarks.find(
        bookmark => bookmark.id === itinerary.id
      ).bookmark_id;
      deleteBookmark(bookmarkId).then(res => {
        if (!res.data.error) {
          dispatch({
            type: SET_BOOKMARKS,
            bookmarks: res.data,
          });
          setBookMarkView(BOOKMARK);
        }
      });
    }
  };

  const handleCommaLocations = name => {
    if (!name.includes(',')) {
      return name;
    } else {
      return name.replace(/,/g, ', ');
    }
  };

  const pinnedNotes = [];
  const regularNotes = [];

  itinerary.trip_notes &&
    itinerary.trip_notes.forEach(note => {
      if (note.important) {
        pinnedNotes.push(note);
      } else {
        regularNotes.push(note);
      }
    });

  const toggleNotes = event => {
    view === SHOW ? setView(HIDE) : setView(SHOW);
  };

  const addNote = () => {
    addView === ADD ? setAddView(DEFAULT) : setAddView(ADD);
  };

  return (
    <section className='flex flex-col w-full h-full my-8 space-y-6 divide-y divide-gray-300'>
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='pl-4 ml-8 text-2xl font-bold border-l-8 border-teal-600 lg:mx-16 sm:whitespace-nowrap'>
            Itinerary Overview
          </h2>
          {user.id && (
            <div className='flex items-center mr-24 space-x-1 md:mr-32 lg:mr-40'>
              <span className='hidden text-sm md:block'>
                {bookmarkView === BOOKMARKED && user.id
                  ? 'Bookmarked'
                  : 'Bookmark'}
              </span>
              <button className='focus:outline-none pr-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  fill={
                    bookmarkView === BOOKMARKED && user.id
                      ? 'currentColor'
                      : 'transparent'
                  }
                  className={
                    bookmarkView === BOOKMARKED && user.id
                      ? 'w-5 h-5 text-red-600 '
                      : 'w-5 h-5 '
                  }
                  onClick={handleBookmark}
                >
                  <path d='M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className='flex flex-col p-4 mx-8 bg-gray-100 divide-y shadow-md rounded-xl divide lg:mx-16'>
          <div className='flex items-center justify-between py-2 pb-2'>
            <div className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='w-6 h-6 mr-2'
              >
                <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' />
                <path
                  fillRule='evenodd'
                  d='M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z'
                  clipRule='evenodd'
                />
              </svg>
              <h1 className='text-xl font-bold'>{itinerary.name}</h1>
            </div>
            {url.includes('edit') && (
              <Link
                to={`/itineraries/${itinerary.id}/overview/edit`}
                className=''
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  className='w-5 h-5'
                >
                  <path d='M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z' />
                  <path
                    fillRule='evenodd'
                    d='M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'
                    clipRule='evenodd'
                  />
                </svg>
              </Link>
            )}
          </div>
          <div
            className={
              itinerary.start_date ? 'flex items-center py-2' : 'hidden'
            }
          >
            {itinerary.start_date && (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='w-6 h-6 mr-2'
              >
                <path
                  fillRule='evenodd'
                  d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                  clipRule='evenodd'
                />
              </svg>
            )}
            <p className=''>
              {itinerary.start_date &&
                `${formatDate(itinerary.start_date)} - ${endDate}`}
            </p>
          </div>
          <div className='flex items-center py-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='w-6 h-6 mr-2'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                clipRule='evenodd'
              />
            </svg>
            <p>{tripDuration === 1 ? '1 Day' : `${tripDuration} Days`}</p>
          </div>
          <div className='flex items-center pt-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='self-start flex-shrink-0 w-6 h-6 mt-2 mr-2'
            >
              <path
                fillRule='evenodd'
                d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
                clipRule='evenodd'
              />
            </svg>
            <p className='py-2'>{itinerary.description}</p>
          </div>
        </div>
      </div>

      <div className='pt-8 mx-8 lg:mx-16'>
        <div className='flex items-center pb-4 space-x-4'>
          <h2 className='pl-4 text-2xl font-bold border-l-8 border-teal-600'>
            Trip Notes
          </h2>
          {url.includes('edit') && (
            <button type='button' onClick={addNote}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='w-5 h-5'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          )}
        </div>
        {addView === ADD && (
          <AddNoteForm
            addTripNote={addTripNote}
            itinerary={itinerary}
            dispatch={dispatch}
            setAddView={setAddView}
            DEFAULT={DEFAULT}
          />
        )}
        <article className='flex flex-col bg-gray-100 divide-y shadow-md rounded-xl divide'>
          {pinnedNotes.length > 0 &&
            pinnedNotes.map((note, index) => {
              return (
                <Note
                  key={note.id}
                  note={note}
                  deleteTripNote={deleteTripNote}
                  itinerary={itinerary}
                  dispatch={dispatch}
                  editTripNote={editTripNote}
                  isRegularNotes={regularNotes.length !== 0}
                  isFirstNote={index === 0}
                  isLastNote={index === pinnedNotes.length - 1}
                  isPinned='true'
                />
              );
            })}
          {regularNotes.length !== 0 && (
            <div className='flex items-center p-4 space-x-2'>
              <button
                type='button'
                onClick={toggleNotes}
                className='w-5 h-5'
                title={
                  view === SHOW
                    ? 'Hide additional notes'
                    : 'Show additional notes'
                }
              >
                {view === SHOW && (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    className='flex-shrink-0 w-full h-full'
                  >
                    <path
                      fillRule='evenodd'
                      d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
                {view === HIDE && (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    className='flex-shrink-0 w-full h-full'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </button>
              <span className='font-semibold'>Additional Notes</span>
            </div>
          )}
          {view === SHOW &&
            regularNotes.length > 0 &&
            regularNotes.map((note, index) => {
              return (
                <Note
                key={note.id}
                note={note}
                deleteTripNote={deleteTripNote}
                itinerary={itinerary}
                dispatch={dispatch}
                editTripNote={editTripNote}
                isRegularNotes={regularNotes.length !== 0}
                isFirstNote={index === 0}
                isLastNote={index === pinnedNotes.length - 1}
              />
              );
            })}
          {regularNotes.length === 0 && pinnedNotes.length === 0 && (
            <div className='flex items-center p-4 space-x-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='w-5 h-5'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <p className=''>No trip notes to display</p>
            </div>
          )}
        </article>
      </div>

      {itinerary.locations.length === 0 && (
        <div className='pt-8 mx-8 lg:mx-16'>
          <article className='mb-6 bg-gray-100 divide-y divide-gray-600 shadow-lg divide-opacity-25 rounded-xl last:mb-0'>
            <div className='flex items-center p-4 rounded-xl'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='w-5 h-5'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <h5 className='ml-2'>
                There are no days planned for this trip yet.
              </h5>
            </div>
          </article>
        </div>
      )}
      {itinerary.locations &&
        itinerary.locations.map((location, index) => {
          return (
            <div key={index} className='mx-8 lg:mx-16'>
              <h2 className='mt-4 mb-2 ml-2 text-3xl font-bold'>
                {handleCommaLocations(location.name)}
              </h2>
              {location.days &&
                location.days.map(day => {
                  return (
                    <ItineraryDays
                      key={day.id}
                      day={day}
                      itinerary={itinerary}
                      user={user}
                      deleteDayFromItinerary={deleteDayFromItinerary}
                      days={location.days}
                      // showConfirm={setShowConfirm}
                    />
                  );
                })}
            </div>
          );
        })}
    </section>
  );
}
