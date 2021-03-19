import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';

export default function PrintableItinerary({ children }) {
  const linkToPrint = () => {
    return (
      <button
        type='button'
        className='absolute flex items-center p-2 space-x-2 lg:mr-2 top-24 lg:right-16 right-10 hover:underline'
      >
        <span className='hidden text-sm md:inline'>Print</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 20 20'
          fill='currentColor'
          className='w-5 h-5'
        >
          <path
            fillRule='evenodd'
            d='M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z'
            clipRule='evenodd'
          />
        </svg>
      </button>
    );
  };

  const componentRef = useRef();

  return (
    <div ref={componentRef} className='flex flex-col w-full pt-16 lg:ml-64'>
      <ReactToPrint
        trigger={linkToPrint}
        content={() => componentRef.current}
      />
      {children}
    </div>
  );
}