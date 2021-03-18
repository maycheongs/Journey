import { SET_ITINERARY } from '../../reducers/application';

export default function AttractionsListItem(props) {
  const {
    attraction,
    dayId,
    addMyLocation,
    itinerary,
    dispatch,
    createActivity,
  } = props;

  const addToMyLocations = () => {
    addMyLocation(attraction.id, itinerary.id).then(res => {
      if (res.data.error) {
        // display error => must be logged in, or don't have permissions becuase not part of travel party
      } else {
        dispatch({
          type: SET_ITINERARY,
          itinerary: { ...itinerary, ...res.data },
        });

        // display message upon successfully added
      }
    });
  };

  const addToDay = () => {
    const activity = { attractionId: attraction.id };
    createActivity(activity, itinerary.id, dayId).then(res => {
      if (res.data.error) {
        // dispay error => must be logged in, or don't have permissions because they are not part of travel party
      } else {
        dispatch({
          type: SET_ITINERARY,
          itinerary: { ...itinerary, ...res.data },
        });

        // display message upon successfully added
      }
    });
  };

  return (
    <div className='p-3 mb-4 text-gray-600 bg-gray-100 shadow-md rounded-xl'>
      {attraction.image && (
        <div className='mb-2 aspect-w-2 aspect-h-1 aspect-w-1'>
          <img
            src={attraction.image}
            alt='attraction'
            className='object-cover object-bottom shadow-sm rounded-xl'
          />
        </div>
      )}
      <h4 className='font-bold'>{attraction.name}</h4>
      <p className='-mt-0.5 text-sm line-clamp-3 leading-tight text-gray-500'>
        {attraction.description}
      </p>
      {/* do one of those on hover effects for the buttons perhaps - use some kind of icon instead? */}
      <div className='flex mt-2 space-x-3'>
        <button
          type='button'
          onClick={addToMyLocations}
          className='flex items-center justify-center w-1/2 py-1 text-sm text-gray-100 bg-teal-600 border-2 border-transparent h-1/2 rounded-3xl hover:text-teal-600 hover:border-teal-600 hover:bg-transparent focus:ring-teal-600 focus:ring-1'
          alt='text'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path d='M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' />
          </svg>
        </button>
        <button
          type='button'
          onClick={addToDay}
          className='flex items-center justify-center w-1/2 py-1 text-sm text-gray-100 bg-teal-600 border-2 border-transparent h-1/2 rounded-3xl hover:text-teal-600 hover:border-teal-600 hover:bg-transparent focus:ring-teal-600 focus:ring-1'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path
              fillRule='evenodd'
              d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
