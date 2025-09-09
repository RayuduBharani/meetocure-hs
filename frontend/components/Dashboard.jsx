import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppointmentIcon,
  DoctorIcon,
  PatientIcon,
  ReportIcon,
  UserCircleIcon,
} from './icons/Icons';
import { Header } from './Header';
// import WeeklyAppointmentsChart from './WeeklyAppointmentsChart';

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'; // ✅ Needed for trend arrows

const StatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/80 flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend !== 0 && (
          <span
            className={`inline-flex items-center text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {trend > 0 ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>
    </div>
  );
};

// ✅ Status styles for today's schedule
const statusStyles = {
  Confirmed: { text: 'text-green-800', bg: 'bg-green-100' },
  'Checked-in': { text: 'text-blue-800', bg: 'bg-blue-100' },
  Completed: { text: 'text-gray-800', bg: 'bg-gray-200' },
  Cancelled: { text: 'text-red-800', bg: 'bg-red-100' },
  Rescheduled: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
};

// ✅ Today's schedule sub-component
const TodaysSchedule = ({ appointments }) => {
  return (
    <div className="space-y-4">
      {appointments.slice(0, 4).map((app) => {
        const statusStyle = statusStyles[app.status] || { text: '', bg: '' };
        return (
          <div
            key={app.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50/80 transition-colors"
          >
            <div className="w-16 text-center">
              <p className="font-bold text-[#062e3e] text-lg">
                {app.time && app.time.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500">
                {app.time && app.time.split(' ')[1]}
              </p>
            </div>
            <div className="w-1.5 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircleIcon className="w-10 h-10 text-gray-400 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {app.patient?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    with {app.doctor?.name}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}
              >
                {app.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);


  const navigate = useNavigate();

  // ✅ Fetch all data once on mount
  useEffect(() => {
    fetch('/api/appointments/today')
      .then((res) => res.json())
      .then(setAppointments);

    fetch('/api/patients')
      .then((res) => res.json())
      .then(setPatients);

    const hospitalName = localStorage.getItem('hospitalName') || '';

    // Only fetch unverified doctors for dashboard
    fetch(
      `/api/doctors/unverified?hospitalName=${encodeURIComponent(hospitalName)}`
    )
      .then((res) => res.json())
      .then((data) => setUnverifiedDoctors(Array.isArray(data) ? data : []));

    // Fetch only unverified doctors for this hospital
    fetch(`/api/doctors?hospitalName=${encodeURIComponent(hospitalName)}&verified=false`)
      .then((res) => res.json())
      .then(setDoctors);

    fetch('/api/dashboard/activity')
      .then((res) => res.json())
      .then(setActivities);

    fetch('/api/appointments/weekly')
      .then((res) => res.json())
      .then(setWeeklyData);
  }, []);

  const refreshDoctors = () => {
    const hospitalName = localStorage.getItem('hospitalName') || '';
    fetch(
      `/api/doctors/unverified?hospitalName=${encodeURIComponent(hospitalName)}`
    )
      .then((res) => res.json())
      .then((data) => setUnverifiedDoctors(Array.isArray(data) ? data : []));
  };

  const handleVerifyDoctor = async (doctorId) => {
    await fetch(`/api/doctors/${doctorId}/verify`, { method: 'PATCH' });
    setSelectedDoctor(null);
    refreshDoctors();
  };

  const handleRejectDoctor = async (doctorId) => {
    await fetch(`/api/doctors/${doctorId}/reject`, { method: 'DELETE' });
    setSelectedDoctor(null);
    refreshDoctors();
  };

  // ✅ Only verified doctors
  const verifiedDoctorsCount = Array.isArray(doctors)
    ? doctors.filter((doc) => doc.registrationStatus === 'verified').length
    : 0;
  const totalPatientsCount = patients.length;
  const totalAppointmentsCount = appointments.length;
  const cancelledAppointmentsCount = appointments.filter(a => a.status === 'Cancelled').length;

  // Helper: get start/end of current week (Monday-Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Filter appointments for current week
  const weeklyAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    return appDate >= monday && appDate <= sunday;
  });

  return (
    <>
      <Header title="Dashboard Overview" />
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard
                title="Total Verified Doctors"
                value={verifiedDoctorsCount}
                icon={<DoctorIcon className="w-5 h-5" />}
                trend={0}
              />
              <StatCard
                title="Total Patients"
                value={totalPatientsCount}
                icon={<PatientIcon className="w-5 h-5" />}
                trend={0}
              />
              <StatCard
                title="Total Appointments"
                value={totalAppointmentsCount}
                icon={<AppointmentIcon className="w-5 h-5" />}
                trend={0}
              />
              <StatCard
                title="Cancelled Appointments"
                value={cancelledAppointmentsCount}
                icon={<ReportIcon className="w-5 h-5" />}
                trend={0}
              />
            </div>
            {/* All Doctors Section */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200/80 mb-8" style={{ width: '80vw' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                All Doctors
              </h3>
              <div className="flex flex-wrap gap-3 justify-start">
                {doctors.length === 0 && (
                  <p className="text-gray-500">No doctors found.</p>
                )}
                {[...doctors, ...unverifiedDoctors].map((doctor) => {
                  const isVerified = doctor.verified === true || doctor.registrationStatus === 'verified';
                  return (
                    <div
                      key={doctor._id}
                      className="bg-white rounded-2xl shadow-md border border-gray-200/80 flex flex-col items-center justify-center p-4 relative transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                      style={{ width: '250px', height: '220px', minWidth: '160px', minHeight: '160px' }}
                      onClick={() => navigate(`/doctor/${doctor._id}`)}
                    >
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {isVerified ? "Verified" : "Unverified"}
                      </span>
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                        {doctor.profileImage ? (
                          <img src={doctor.profileImage} alt="Profile" className="w-20 h-20 object-cover rounded-full border-4 border-red-300" />
                        ) : (
                          <UserCircleIcon className="w-20 h-20 text-gray-300" />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 text-center">
                        {doctor.name || doctor.doctorName || doctor.fullName || doctor.email || 'No Name'}
                      </h3>
                      <p className="text-gray-500 text-xs text-center mt-1 truncate w-full">{doctor.specialty}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="bg-white p-6 rounded-2xl h-40 shadow-md border border-gray-200/80">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Appointments This Week
            </h3>
            {weeklyAppointments.length === 0 ? (
              <p className="text-gray-500">No appointments this week.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {weeklyAppointments.map(app => (
                  <li key={app._id || app.id} className="py-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{app.patient?.name || 'Unknown Patient'}</span>
                    <span className="text-gray-500 text-sm">{app.date} {app.time}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusStyles[app.status]?.bg || ''} ${statusStyles[app.status]?.text || ''}`}>{app.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
