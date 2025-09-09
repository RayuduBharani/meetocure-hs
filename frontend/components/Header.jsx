import React from 'react';
import { NotificationIcon, SearchIcon, UserCircleIcon } from './icons/Icons';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export const Header = ({ title, searchPlaceholder, searchValue, onSearchChange }) => {
  const handleBack = () => {
    window.history.back();
  };
  return (
    <header className="bg-white p-4 flex justify-between items-center z-10 border-b border-gray-200/80">
      <div className="flex items-center gap-2">
        <button onClick={handleBack} className="mr-2 p-1 rounded-full hover:bg-gray-100 transition-colors" aria-label="Go back">
          <ArrowLeftIcon className="w-6 h-6 text-gray-700-bold" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        {searchPlaceholder && (
          <div className="relative w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#062e3e]"
            />
          </div>
        )}
        <button
          onClick={() => alert('Profile clicked! This would open profile settings in a real app.')}
          className="hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <UserCircleIcon className="w-10 h-10 text-gray-400" />
        </button>
      </div>
    </header>
  );
};
