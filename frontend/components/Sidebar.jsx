import React from 'react';
import { DashboardIcon, AppointmentIcon, DoctorIcon, PatientIcon, ReportIcon, BrandIcon, LogoutIcon } from './icons/Icons';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: DashboardIcon },
  { name: 'Appointments', icon: AppointmentIcon },
  { name: 'Doctors', icon: DoctorIcon },
  { name: 'Patients', icon: PatientIcon },
  // { name: 'Reports', icon: ReportIcon },
];

export const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  // Use React Router navigation
  const navigate = useNavigate();
  const navToPath = {
    'Dashboard': '/',
    'Appointments': '/appointments',
    'Doctors': '/doctors',
    'Patients': '/patients',
    // 'Reports': '/reports',
  };
  return (
    <aside className="w-64 bg-[#062e3e] text-white flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-white/20">
        {/* <BrandIcon className="w-8 h-8 text-cyan-400" /> */}
        <div className="flex flex-col items-center pt-4">
        <img src="/assets/Logo Design of Meetocure.png" alt="Logo" className="w-16 h-16 mb-2" />
      </div>
        <h1 className="text-xl font-bold">MeetoCure</h1>
      </div>
      <nav className="mt-4 flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="px-4">
              <button
                onClick={() => navigate(navToPath[item.name])}
                className={`w-full flex items-center gap-3 px-4 py-3 my-1 rounded-lg text-left transition-colors duration-200 ${activePage === item.name
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-white/10 hover:text-white transition-colors duration-200"
        >
          <LogoutIcon className="w-6 h-6" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
