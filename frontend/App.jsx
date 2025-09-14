/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import PatientSearch from './components/PatientSearch';
import Dashboard from './components/Dashboard';
import AppointmentsDashboard from './components/AppointmentsDashboard';
import { DoctorManagement } from './components/DoctorManagement';
import LoginPage from './components/LoginPage';
import DoctorDetailsPage from './components/DoctorDetailsPage';
import DoctorStatsPage from './components/DoctorStatsPage';
import PatientDetailsPage from './components/PatientDetailsPage';
import AppointmentDetailsPage from './components/AppointmentDetailsPage';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';


const AppLayout = ({
  handleLogout,
  hospitalName,
  searchTarget,
  handleNavigateToPatient,
  handleClearSearchTarget
}) => {
  const location = useLocation();
  let routeActivePage = 'Dashboard';
  if (location.pathname.startsWith('/appointments')) routeActivePage = 'Appointments';
  else if (location.pathname.startsWith('/doctors')) routeActivePage = 'Doctors';
  else if (location.pathname.startsWith('/patients')) routeActivePage = 'Patients';

  const getPageTitle = (hasSelectedPatient) => {
    if (routeActivePage === 'Patients') {
      return hasSelectedPatient ? 'Patient Details' : 'Patients';
    }
    if (routeActivePage === 'Appointments') return 'Appointments';
    if (routeActivePage === 'Doctors') return 'Doctor Management';
    return routeActivePage;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activePage={routeActivePage} setActivePage={() => { }} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/doctor/:doctorId" element={<DoctorDetailsPage />} />
            <Route path="/doctor/:doctorId/stats" element={<DoctorStatsPage />} />
            <Route path="/patient/:patientId" element={<PatientDetailsPage />} />
            <Route path="/appointment/:appointmentId" element={<AppointmentDetailsPage />} />
            <Route path="/appointments" element={<AppointmentsDashboard onNavigateToPatient={handleNavigateToPatient} />} />
            <Route path="/doctors" element={<DoctorManagement hospitalName={hospitalName} />} />
            <Route path="/patients" element={<PatientSearch initialSearchTarget={searchTarget} onExitPatientView={handleClearSearchTarget} getPageTitle={getPageTitle} />} />
            {/* <Route path="/reports" element={<Reports />} /> */}
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [searchTarget, setSearchTarget] = useState(null);
  const [hospitalName, setHospitalName] = useState(localStorage.getItem('hospitalName') || '');

  const handleLogin = () => {
    setIsLoggedIn(true);
    setHospitalName(localStorage.getItem('hospitalName') || '');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('hospitalName');
    setHospitalName('');
  };

  const handleNavigateToPatient = (patient) => {
    setSearchTarget(patient);
  };

  const handleClearSearchTarget = () => {
    setSearchTarget(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppLayout
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        hospitalName={hospitalName}
        searchTarget={searchTarget}
        handleNavigateToPatient={handleNavigateToPatient}
        handleClearSearchTarget={handleClearSearchTarget}
      />
    </Router>
  );
};

export default App;
