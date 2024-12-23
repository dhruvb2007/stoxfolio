import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { auth, db } from '../firebase'; // Ensure you have configured Firebase in this file
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password } = formData;

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user information to Firestore
      const userRef = doc(db, 'Users', user.uid);
      await setDoc(userRef, {
        full_name: fullName,
        email: email,
        password: password, // You may want to handle password securely, not store in plain text
      });

      // Create an Accounts subcollection with an initial account (you can customize this further)
      const accountsRef = collection(userRef, 'Accounts');
      const accountDocRef = doc(accountsRef, fullName); // You can replace 'default_account' with a dynamic account name
      await setDoc(accountDocRef, {
        account_name: fullName, 
      });

      // Create the Basics subcollection with initial values
      const basicsRef = collection(accountDocRef, 'Basics');
      const basicsDocRef = doc(basicsRef);
      await setDoc(basicsDocRef, {
        total_investment: 0,
        total_returns: 0,
        total_allotted_ipo: 0,
        pending: 0,
      });

      navigate('/'); // Replace '/dashboard' with your desired route
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
    }
  };

  return (
    <main>
      <div className='w-full flex flex-col items-center mt-24 md:mt-10'>
        <h1 className='text-4xl md:text-5xl font-medium '>Stocxfolio</h1>
      </div>
      <form className='mt-16 flex w-[100%] justify-center' onSubmit={handleSubmit}>
      <section className='mt-4 w-[100%] md:w-[50%]'>
        <div className='flex flex-col mt-4'>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className='bg-[#E1E1E1] py-2 px-4 outline-none rounded-md'
              required
            />
          </div>
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
          <div className='mt-4'>
            <button type="submit" className='bg-black text-white py-4 px-4 w-[100%] rounded-md text-xl font-medium'>
              Sign Up
            </button>
          </div>
          <div className="mt-4">
            <Link to={'/login'}>Existing account? Login</Link>
          </div>
        </section>
      </form>
    </main>
  );
}

export default Signup;
