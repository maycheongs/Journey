import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useParams } from 'react-router-dom';
export default function ItineraryLeftNav(props) {
  const {
    setItinerary,
    itinerary,
    user,
    addDayWithLocation,
    sideBarState,
  } = props;

  const { itinerary_id } = useParams();

  const pathname = useLocation().pathname;
  const location = useLocation();

  const [newLocation, setNewLocation] = useState('');
  const [dropDown, setDropDown] = useState({});
  const [editMode, setEditMode] = useState(null);
  const [showLocation, setShowLocation] = useState(false);

  useEffect(() => {
    if (
      pathname.includes('edit') ||
      pathname.includes('activities/new') ||
      (location.previous && location.previous.edit === 'true')
    ) {
      setEditMode('true');
    } else {
      setEditMode(null);
    }
  }, [location.previous, pathname]);

  useEffect(() => {
    setItinerary(itinerary_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itinerary_id]);

  function handleSubmit(event, last_day_order, locationName) {
    event.preventDefault();
    const titleCase = str => {
      const result = str
        .toLowerCase()
        .split(' ')
        .map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      return result;
    };

    addDayWithLocation(
      itinerary_id,
      locationName || titleCase(newLocation),
      last_day_order + 1
    );

    setNewLocation('');

    return;
  }

  const handleDropDown = event => {
    const targetId = event.target.id;
    setDropDown(prev => {
      const isClassHidden =
        prev[targetId]?.dropClass === 'hidden' ||
        prev[targetId]?.dropClass === undefined;
      return {
        ...prev,
        [targetId]: {
          dropClass: isClassHidden
            ? 'flex flex-col space-y-2 pl-2 last:mb-4'
            : 'hidden',
          svgClass: isClassHidden
            ? 'transform duration-300 cursor-pointer pointer-events-none mr-1 flex-shrink-0 ml-2'
            : 'transform duration-300 -rotate-90 cursor-pointer pointer-events-none mr-1 flex-shrink-0 ml-2',
        },
      };
    });
  };

  let inTravelParty = false;
  if (itinerary && itinerary.users) {
    const travelParty = itinerary.users;

    travelParty.forEach(member => {
      if (member.id === user.id) {
        inTravelParty = true;
      }
    });
  }

  const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handleCommaLocations = name => {
    if (!name.includes(',')) {
      return name;
    } else {
      return name.replace(/,/g, ', ');
    }
  };

  return (
    <nav
      className={
        sideBarState.leftNav.collapsed
          ? 'fixed w-16 text-gray-100 bg-gray-600 h-full mt-16'
          : 'fixed px-6 z-40 w-full lg:w-64 xl:w-80 h-full pb-24 mt-16 overflow-y-scroll text-gray-100 bg-gray-600 no-scrollbar lg:block'
      }
    >
      {sideBarState.belowBreak && (
        <div
          className={
            sideBarState.leftNav.collapsed
              ? 'flex items-center justify-between w-full py-2 pl-4 pr-3 mt-2'
              : 'flex items-center justify-between w-full py-2 pl-4 pr-3 mt-2 border-b border-gray-100 border-opacity-50'
          }
        >
          <h1
            className={
              sideBarState.leftNav.collapsed
                ? 'hidden'
                : 'text-xl font-bold text-gray-100'
            }
          >
            Navigation
          </h1>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className={
              sideBarState.leftNav.collapsed
                ? 'w-6 h-6 cursor-pointer mt-2 ml-1'
                : 'w-6 h-6 cursor-pointer transform rotate-180'
            }
            onClick={() =>
              props.updateSidebar(
                null,
                null,
                !sideBarState.leftNav.userCollapsed,
                !sideBarState.leftNav.collapsed
              )
            }
          >
            <path
              fillRule='evenodd'
              d='M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      )}
      {itinerary && !sideBarState.leftNav.collapsed && (
        <div className='flex flex-col divide-y divide-gray-100 divide-opacity-50 top-20'>
          <div className='flex flex-col justify-center px-3 py-1 my-4 space-y-1 border-l-4'>
            <NavLink
              to={`/itineraries/${itinerary.id}${editMode ? '/edit' : ''}`}
              className='text-xl font-bold'
              state='test'
            >
              {itinerary.name}
            </NavLink>
            <div>
              {inTravelParty && (
                <NavLink
                  to={{
                    pathname: `/itineraries/${itinerary.id}/collaborators`,
                    previous: {
                      edit: `${pathname.includes('edit') ? 'true' : 'false'}`,
                    },
                  }}
                  className='flex rounded-xl hover:underline'
                >
                  My Group
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    className='w-5 h-5 ml-2'
                  >
                    <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
                  </svg>
                </NavLink>
              )}
            </div>
          </div>
          <div>
            {itinerary.locations.map((locationObj, index) => {
              return (
                <div key={index} className='flex flex-col my-1'>
                  <div
                    onClick={event => handleDropDown(event)}
                    className='flex items-center justify-between px-3 py-2 my-1 cursor-pointer hover:bg-opacity-25 rounded-xl'
                    id={index}
                  >
                    <h4 className='text-lg font-bold pointer-events-none'>
                      {handleCommaLocations(locationObj.name)}
                    </h4>

                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 14 11'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                      className={
                        dropDown[index]?.svgClass ||
                        'transform duration-300 -rotate-90 cursor-pointer pointer-events-none mr-1 flex-shrink-0 ml-2'
                      }
                    >
                      <path
                        d='M7.86603 10.5001C7.48112 11.1667 6.51887 11.1667 6.13397 10.5001L0.937822 1.50006C0.552922 0.833392 1.03405 5.98142e-05 1.80385 5.98815e-05L12.1962 6.079e-05C12.966 6.08573e-05 13.4471 0.833394 13.0622 1.50006L7.86603 10.5001Z'
                        fill='#F4F4F5'
                      />
                    </svg>
                  </div>
                  <div className={dropDown[index]?.dropClass || 'hidden'}>
                    {locationObj.days.map(day => {
                      return (
                        <NavLink
                          to={`/itineraries/${itinerary.id}/days/${day.id}${editMode ? '/edit' : ''}`}
                          key={day.id}
                          replace
                          className={({ isActive }) =>
                            `flex justify-between px-4 py-2 font-semibold rounded-xl hover:bg-gray-200 hover:bg-opacity-25 hover:text-gray-100 ${isActive ? 'bg-gray-200 bg-opacity-25' : ''
                            }`
                          }
                        >
                          <span>Day {day.day_order}</span>
                          <span className='font-light'>
                            {itinerary.start_date &&
                              `${addDays(
                                itinerary.start_date,
                                day.day_order - 1
                              )
                                .toDateString()
                                .substring(4, 10)}`}
                          </span>
                        </NavLink>
                      );
                    })}
                    {editMode &&
                      itinerary.users &&
                      itinerary.users.some(member => member.id === user.id) && (
                        <div>
                          <button
                            onClick={event =>
                              handleSubmit(
                                event,
                                locationObj.days.slice(-1)[0].day_order,
                                locationObj.name
                              )
                            }
                            className='ml-6 transform'
                          >
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                              className='w-6 h-6'
                            >
                              <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
          {editMode &&
            itinerary.users &&
            itinerary.users.some(member => member.id === user.id) ? (
            <div>
              <div
                className='flex items-center justify-between px-3 py-2 my-2 cursor-pointer hover:bg-gray-200 hover:bg-opacity-25 rounded-xl'
                onClick={() => setShowLocation(!showLocation)}
              >
                <button className='text-lg font-bold pointer-events-none'>
                  Add Location
                </button>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  className='w-6 h-6'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <form
                onSubmit={handleSubmit}
                className={showLocation ? 'flex items-center' : 'hidden'}
              >
                <input
                  value={newLocation}
                  name='add-location'
                  onChange={event => setNewLocation(event.target.value)}
                  type='text'
                  placeholder='Location'
                  className='w-full text-gray-600 border-gray-300 rounded-md appearance-none focus:ring-teal-600 focus:ring-1 focus:ring-offset-2 focus:ring-offset-transparent focus:border-transparent'
                />
              </form>
            </div>
          ) : (
            itinerary.users &&
            itinerary.users.some(member => member.id === user.id) && (
              <div className=''>
                <div>
                  <Link
                    to={`${pathname}/edit`}
                    className='flex items-center justify-between px-3 py-2 my-2 text-xl font-bold cursor-pointer hover:bg-gray-200 hover:bg-opacity-25 rounded-xl'
                  >
                    Edit
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      className='w-5 h-5 mr-0.5'
                    >
                      <path d='M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z' />
                      <path
                        fillRule='evenodd'
                        d='M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
}
