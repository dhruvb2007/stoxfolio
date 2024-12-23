// Import necessary Firebase and React components
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Ensure you have configured Firebase in this file
import { signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      // Sign in user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      navigate('/');
      console.log('User logged in:', user);
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message);
    }
  };

  return (
    <main>
      <div className='w-full flex flex-col items-center mt-24 md:mt-10'>
        <h1 className='text-4xl md:text-5xl font-medium '>Stocxfolio</h1>
      </div>
      <form className='mt-14 md:mt-16 flex w-[100%] justify-center' onSubmit={handleSubmit}>
        <section className='mt-4 w-[100%] md:w-[50%]'>
          <div className='flex flex-col mt-4'>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className='bg-[#E1E1E1] py-2 px-4 outline-none rounded-md'
              required
            />
          </div>
          <div className='flex flex-col mt-4'>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className='bg-[#E1E1E1] py-2 px-4 outline-none rounded-md'
              required
            />
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <div className="mt-4">
            <p>Forgot Password?</p>
          </div>
          <div className='mt-4'>
            <button type="submit" className='bg-black text-white py-4 px-4 w-[100%] rounded-md text-xl font-medium'>
              Login
            </button>
          </div>
          <div className='mt-4'>
            <Link to={'/signup'}>Create New Account? Sign Up</Link>
          </div>
        </section>
      </form>
    </main>
  );
}

export default Login;
