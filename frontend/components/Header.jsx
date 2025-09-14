/* eslint-disable react/prop-types */
import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export const Header = ({ title}) => {
  const handleBack = () => {
    window.history.back();
  };
  // Get hospital name and email from localStorage
  const hospitalName = localStorage.getItem('hospitalName') || 'Hospital';
  // Try to get email from localStorage, fallback to token decode if needed
  let email = localStorage.getItem('email');
  if (!email) {
    // Try to extract email from token if available
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        email = payload.email;
      } catch (e) {
        console.log(e)
        email = 'admin@meetocure.com';
      }
    } else {
      email = 'admin@meetocure.com';
    }
  }
  return (
    <header className="bg-white p-4 flex justify-between items-center z-10 border-b border-gray-200/80">
      <div className="flex items-center gap-2">
        <button onClick={handleBack} className="mr-2 p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-700-bold" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        
        <div className="flex items-center ml-6">
          <div className="ml-3 hidden sm:block text-right">
            <p className="text-sm pr-4 font-semibold text-gray-800">{hospitalName}</p>
            <p className="text-xs pr-4 text-gray-500">{email}</p>
          </div>
          <img src="/assets/logo.png" alt="Hospital Logo" className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </header>
  );
};
