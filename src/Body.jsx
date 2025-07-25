// Body.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // ✅ Corrected import
import NavBar from './NavBar';
import { Footer } from './Footer';

export const Body = () => {
  return (
    <>
      <NavBar />
      <Outlet />
      <Footer/>
    </>
  );
};
