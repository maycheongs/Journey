import { useState } from 'react';
import { SET_USER } from '../reducers/application';
import { Link, useNavigate } from 'react-router-dom';

import FormButton from './FormButton';
import AlertMessage from './AlertMessage';

export default function LoginForm(props) {
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState({
    staus: false,
    message: '',
    show: 'flex p-3 bg-red-700 bg-opacity-50 rounded-xl mb-4',
    hide: 'hidden',
  });

  const navigate = useNavigate();

  const handleChange = event => {
    const { value, name } = event.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const save = event => {
    event.preventDefault();

    if (userInfo.email === '') {
      setError({
        ...error,
        status: true,
        message: 'Please enter an email.',
      });
      return;
    }

    if (userInfo.password === '') {
      setError({
        ...error,
        status: true,
        message: 'Please enter a password.',
      });
      return;
    }

    props
      .onSave(userInfo.email.trim().toLowerCase(), userInfo.password)
      .then(res => {
        console.log('Login response:',res, 'data', res.data); // Debug
        if (res.data.email) {
          setError({
            ...error,
            status: false,
            message: '',
          });

          props.dispatch({
            type: SET_USER,
            user: res.data,
          });

          navigate(`/dashboard/${res.data.id}`);
        } else if (res.data.error) {
          setError({
            ...error,
            status: true,
            message: 'Incorrect email or password.',
          });
        }
      });
  };

  return (
    <>
      <AlertMessage
        isError={error.status}
        show={error.show}
        hide={error.hide}
        message={error.message}
      ></AlertMessage>

      <section className='w-full shadow-lg bg-gray-50 rounded-xl'>
        <form onSubmit={event => save(event)} className='flex flex-col'>
          <div className='flex flex-col mx-8 my-4'>
            <label htmlFor='email' className='font-semibold'>
              Email
            </label>
            <input
              value={userInfo.email}
              name='email'
              onChange={handleChange}
              type='email'
              placeholder='Email'
              className='mb-4 border-gray-300 rounded-md appearance-none focus:ring-teal-600 focus:ring-1 focus:border-teal-600'
            />
            <label htmlFor='password' className='font-semibold'>
              Password
            </label>
            <input
              value={userInfo.password}
              name='password'
              onChange={handleChange}
              type='password'
              placeholder='Password'
              className='mb-2 border-gray-300 rounded-md focus:ring-teal-600 focus:ring-1 focus:border-teal-600'
            />
          </div>
          <footer className='flex flex-col items-center justify-between px-8 py-3 bg-gray-300 bg-opacity-50 sm:items-center sm:flex-row rounded-b-xl'>
            <FormButton type='submit'>Log in</FormButton>
            <span className='mt-2 ml-1.5 text-xs font-semibold'>
              Don't have an account? Sign up{' '}
              <Link to='/signup' className='text-teal-600 hover:underline'>
                here!
              </Link>
            </span>
          </footer>
        </form>
      </section>
    </>
  );
}
