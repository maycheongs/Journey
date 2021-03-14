import { Fragment } from 'react';

export default function ItineraryDayActivities(props) {
  const { activity } = props;

  const tConvert = (time) => {
    // Check correct time format and split into components
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    let timeArr = [];

    if (time.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours

      for (let i = 0; i < time.length; i++) {
        if (i !== 3) {
          timeArr.push(time[i]);
        }
      }
    }

    return timeArr.join(''); // return adjusted time or original string
  };

  return (
    <div className='py-4 space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='w-5 h-5'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z'
              clipRule='evenodd'
            />
          </svg>
          <h4 className='font-bold'>{activity.name}</h4>
        </div>
        <div className='flex space-x-3'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 17 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='text-gray-700 duration-200 transform fill-current hover:text-teal-600 hover:scale-125'
          >
            <path d='M14.2398 2.0688C13.9331 1.76885 13.5172 1.60034 13.0835 1.60034C12.6499 1.60034 12.234 1.76885 11.9273 2.0688L5.72412 8.1376V10.4H8.03661L14.2398 4.3312C14.5464 4.03116 14.7186 3.62426 14.7186 3.2C14.7186 2.77574 14.5464 2.36884 14.2398 2.0688Z' />
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M1.63525 4.79995C1.63525 4.3756 1.80756 3.96864 2.11426 3.66858C2.42096 3.36852 2.83694 3.19995 3.27068 3.19995H6.54153C6.7584 3.19995 6.96639 3.28424 7.11974 3.43427C7.27309 3.5843 7.35924 3.78778 7.35924 3.99995C7.35924 4.21212 7.27309 4.41561 7.11974 4.56564C6.96639 4.71567 6.7584 4.79995 6.54153 4.79995H3.27068V12.8H11.4478V9.59995C11.4478 9.38778 11.534 9.1843 11.6873 9.03427C11.8407 8.88424 12.0486 8.79995 12.2655 8.79995C12.4824 8.79995 12.6904 8.88424 12.8437 9.03427C12.9971 9.1843 13.0832 9.38778 13.0832 9.59995V12.8C13.0832 13.2243 12.9109 13.6313 12.6042 13.9313C12.2975 14.2314 11.8815 14.4 11.4478 14.4H3.27068C2.83694 14.4 2.42096 14.2314 2.11426 13.9313C1.80756 13.6313 1.63525 13.2243 1.63525 12.8V4.79995Z'
            />
          </svg>
          <svg
            width='20'
            height='20'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='ml-2 text-gray-700 duration-200 transform fill-current hover:text-red-600 hover:scale-125'
          >
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M7.1999 1.59998C7.05137 1.60005 6.9058 1.64148 6.77948 1.71962C6.65317 1.79775 6.5511 1.90951 6.4847 2.04238L5.9055 3.19998H3.1999C2.98773 3.19998 2.78425 3.28426 2.63422 3.43429C2.48419 3.58432 2.3999 3.7878 2.3999 3.99998C2.3999 4.21215 2.48419 4.41563 2.63422 4.56566C2.78425 4.71569 2.98773 4.79998 3.1999 4.79998V12.8C3.1999 13.2243 3.36847 13.6313 3.66853 13.9313C3.96859 14.2314 4.37556 14.4 4.7999 14.4H11.1999C11.6242 14.4 12.0312 14.2314 12.3313 13.9313C12.6313 13.6313 12.7999 13.2243 12.7999 12.8V4.79998C13.0121 4.79998 13.2156 4.71569 13.3656 4.56566C13.5156 4.41563 13.5999 4.21215 13.5999 3.99998C13.5999 3.7878 13.5156 3.58432 13.3656 3.43429C13.2156 3.28426 13.0121 3.19998 12.7999 3.19998H10.0943L9.5151 2.04238C9.44871 1.90951 9.34664 1.79775 9.22032 1.71962C9.09401 1.64148 8.94843 1.60005 8.7999 1.59998H7.1999ZM5.5999 6.39998C5.5999 6.1878 5.68419 5.98432 5.83422 5.83429C5.98425 5.68426 6.18773 5.59998 6.3999 5.59998C6.61208 5.59998 6.81556 5.68426 6.96559 5.83429C7.11562 5.98432 7.1999 6.1878 7.1999 6.39998V11.2C7.1999 11.4121 7.11562 11.6156 6.96559 11.7657C6.81556 11.9157 6.61208 12 6.3999 12C6.18773 12 5.98425 11.9157 5.83422 11.7657C5.68419 11.6156 5.5999 11.4121 5.5999 11.2V6.39998ZM9.5999 5.59998C9.38773 5.59998 9.18425 5.68426 9.03422 5.83429C8.88419 5.98432 8.7999 6.1878 8.7999 6.39998V11.2C8.7999 11.4121 8.88419 11.6156 9.03422 11.7657C9.18425 11.9157 9.38773 12 9.5999 12C9.81208 12 10.0156 11.9157 10.1656 11.7657C10.3156 11.6156 10.3999 11.4121 10.3999 11.2V6.39998C10.3999 6.1878 10.3156 5.98432 10.1656 5.83429C10.0156 5.68426 9.81208 5.59998 9.5999 5.59998Z'
            />
          </svg>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 20 20'
          fill='currentColor'
          className='w-5 h-5'
        >
          <path
            fillRule='evenodd'
            d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
            clipRule='evenodd'
          />
        </svg>
        <span>{activity.address}</span>
      </div>
      <div className='flex items-center space-x-2'>
        {activity.start_time && activity.end_time && (
          <Fragment>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='w-5 h-5'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                clipRule='evenodd'
              />
            </svg>
            <span>
              {tConvert(activity.start_time)} - {tConvert(activity.end_time)}
            </span>
          </Fragment>
        )}
      </div>
    </div>
  );
}
