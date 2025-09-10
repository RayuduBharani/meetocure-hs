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
  confirmed: { text: 'text-green-800', bg: 'bg-green-100' },
  Confirmed: { text: 'text-green-800', bg: 'bg-green-100' },
  'checked-in': { text: 'text-blue-800', bg: 'bg-blue-100' },
  'Checked-in': { text: 'text-blue-800', bg: 'bg-blue-100' },
  completed: { text: 'text-gray-800', bg: 'bg-gray-200' },
  Completed: { text: 'text-gray-800', bg: 'bg-gray-200' },
  cancelled: { text: 'text-red-800', bg: 'bg-red-100' },
  Cancelled: { text: 'text-red-800', bg: 'bg-red-100' },
  pending: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
  Pending: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
  rescheduled: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
  Rescheduled: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
};

// ✅ Today's schedule sub-component
const TodaysSchedule = ({ appointments }) => {
  if (!Array.isArray(appointments) || appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No appointments scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.slice(0, 4).map((app) => {
        const statusStyle = statusStyles[app.status] || { text: '', bg: '' };
        const time = app.appointment_time || app.time;
        const patientName = app.patientInfo?.name || app.patient?.name || app.patientName || 'Unknown Patient';
        const doctorName = app.doctor?.verificationDetails?.name || 
                          app.doctor?.verificationDetails?.doctorName || 
                          app.doctor?.verificationDetails?.fullName || 
                          app.doctor?.name || 
                          app.doctorName || 
                          'Unknown Doctor';
        
        return (
          <div
            key={app._id || app.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50/80 transition-colors"
          >
            <div className="w-16 text-center">
              <p className="font-bold text-[#062e3e] text-lg">
                {time && time.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500">
                {time && time.split(' ')[1]}
              </p>
            </div>
            <div className="w-1.5 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircleIcon className="w-10 h-10 text-gray-400 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {patientName}
                  </p>
                  <p className="text-sm text-gray-500">
                    with {doctorName}
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
    // Fetch today's appointments
    fetch('/api/appointments/today')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Handle both array response and success/data response format
        const appointments = Array.isArray(data) ? data : (data.data || []);
        console.log('Appointments data:', appointments);
        if (appointments.length > 0) {
          console.log('First appointment structure:', appointments[0]);
        }
        setAppointments(appointments);
      })
      .catch((error) => {
        console.error('Error fetching today\'s appointments:', error);
        setAppointments([]); // Set empty array as fallback
      });

    // Fetch patients
    fetch('/api/patients')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const patients = Array.isArray(data) ? data : (data.data || []);
        setPatients(patients);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
        setPatients([]);
      });

    const hospitalName = localStorage.getItem('hospitalName') || '';

    // Fetch only unverified doctors for this hospital
    fetch(`/api/doctors?hospitalName=${encodeURIComponent(hospitalName)}&verified=false`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const unverifiedDoctors = Array.isArray(data) ? data : [];
        setDoctors(unverifiedDoctors);
        setUnverifiedDoctors(unverifiedDoctors);
      })
      .catch((error) => {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
        setUnverifiedDoctors([]);
      });

    // Fetch dashboard activity
    fetch('/api/dashboard/activity')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const activities = Array.isArray(data) ? data : (data.data || []);
        setActivities(activities);
      })
      .catch((error) => {
        console.error('Error fetching activities:', error);
        setActivities([]);
      });

    // Fetch weekly appointments
    fetch('/api/appointments/weekly')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const weeklyAppointments = Array.isArray(data) ? data : (data.data || []);
        setWeeklyData(weeklyAppointments);
      })
      .catch((error) => {
        console.error('Error fetching weekly appointments:', error);
        setWeeklyData([]);
      });
  }, []);

  const refreshDoctors = () => {
    const hospitalName = localStorage.getItem('hospitalName') || '';
    fetch(`/api/doctors?hospitalName=${encodeURIComponent(hospitalName)}&verified=false`)
      .then((res) => res.json())
      .then((data) => {
        const unverifiedDoctors = Array.isArray(data) ? data : [];
        setDoctors(unverifiedDoctors);
        setUnverifiedDoctors(unverifiedDoctors);
      });
  };

  const handleVerifyDoctor = async (doctorVerificationId) => {
    try {
      const response = await fetch(`/api/doctors/${doctorVerificationId}/verify`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Doctor verified successfully!');
        setSelectedDoctor(null);
        refreshDoctors();
      } else {
        alert(`Verification failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error verifying doctor:', error);
      alert('Network error occurred while verifying doctor');
    }
  };

  const handleRejectDoctor = async (doctorVerificationId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    try {
      const response = await fetch(`/api/doctors/${doctorVerificationId}/reject`, { 
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason || '' }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Doctor rejected successfully!');
        setSelectedDoctor(null);
        refreshDoctors();
      } else {
        alert(`Rejection failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      alert('Network error occurred while rejecting doctor');
    }
  };

  // ✅ Only unverified doctors
  const unverifiedDoctorsCount = Array.isArray(doctors) ? doctors.length : 0;
  const totalPatientsCount = Array.isArray(patients) ? patients.length : 0;
  const totalAppointmentsCount = Array.isArray(appointments) ? appointments.length : 0;
  const cancelledAppointmentsCount = Array.isArray(appointments) ? appointments.filter(a => a.status === 'cancelled' || a.status === 'Cancelled').length : 0;

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
  const weeklyAppointments = Array.isArray(appointments) ? appointments.filter(app => {
    const appDate = new Date(app.appointment_date || app.date);
    return appDate >= monday && appDate <= sunday;
  }) : [];

  return (
    <>
      <Header title="Appointments" />
      <div className="p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Appointments"
            value={totalAppointmentsCount}
            icon={<AppointmentIcon className="w-5 h-5" />}
            trend={0}
          />
          <StatCard
            title="Confirmed"
            value={Array.isArray(appointments) ? appointments.filter(a => a.status === 'confirmed' || a.status === 'Confirmed').length : 0}
            icon={<AppointmentIcon className="w-5 h-5" />}
            trend={0}
          />
          <StatCard
            title="Pending"
            value={Array.isArray(appointments) ? appointments.filter(a => a.status === 'pending' || a.status === 'Pending').length : 0}
            icon={<AppointmentIcon className="w-5 h-5" />}
            trend={0}
          />
          <StatCard
            title="Cancelled"
            value={cancelledAppointmentsCount}
            icon={<ReportIcon className="w-5 h-5" />}
            trend={0}
          />
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200/80 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Today's Appointments
          </h3>
          <TodaysSchedule appointments={appointments} />
        </div>

        {/* Unverified Doctors Section */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200/80 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Unverified Doctors
          </h3>
          <div className="flex flex-wrap gap-4 justify-start">
            {doctors.length === 0 ? (
              <p className="text-gray-500">No unverified doctors found.</p>
            ) : (
              doctors.map((doctorData) => {
                // Extract doctor verification and doctor info from the new structure
                const doctorVerification = doctorData.doctorVerification;
                const doctor = doctorData.doctor;
                
                return (
                  <div
                    key={doctorVerification._id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200/80 flex flex-col items-center justify-center p-6 relative transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                    style={{ width: '280px', height: '240px', minWidth: '200px', minHeight: '200px' }}
                    onClick={() => navigate(`/doctor/${doctorVerification._id}`)}
                  >
                    <span
                      className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                    >
                      Unverified
                    </span>
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                      {doctorVerification.profileImage ? (
                        <img src={doctorVerification.profileImage} alt="Profile" className="w-24 h-24 object-cover rounded-full border-4 border-red-300" />
                      ) : (
                        <UserCircleIcon className="w-24 h-24 text-gray-300" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                      {doctorVerification.name || doctorVerification.doctorName || doctorVerification.fullName || doctorVerification.email || 'No Name'}
                    </h3>
                    <p className="text-gray-500 text-sm text-center mb-2">
                      {doctorVerification.specialty || doctorVerification.specialization || 'General Practice'}
                    </p>
                    <p className="text-gray-400 text-xs text-center">
                      {doctorVerification.email || 'No email'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* All Appointments */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200/80">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            All Appointments
          </h3>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <AppointmentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((app) => {
                const statusStyle = statusStyles[app.status] || { text: '', bg: '' };
                const time = app.appointment_time || app.time;
                const date = app.appointment_date || app.date;
                const patientName = app.patientInfo?.name || app.patient?.name || app.patientName || 'Unknown Patient';
                const doctorName = app.doctor?.verificationDetails?.name || 
                                  app.doctor?.verificationDetails?.doctorName || 
                                  app.doctor?.verificationDetails?.fullName || 
                                  app.doctor?.name || 
                                  app.doctorName || 
                                  'Unknown Doctor';
                
                return (
                  <div
                    key={app._id || app.id}
                    className="flex items-center gap-6 p-6 rounded-xl hover:bg-gray-50/80 transition-colors border border-gray-200/60"
                  >
                    <div className="w-20 text-center">
                      <p className="font-bold text-[#062e3e] text-lg">
                        {time && time.split(' ')[0]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {time && time.split(' ')[1]}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {date}
                      </p>
                    </div>
                    <div className="w-1 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <UserCircleIcon className="w-12 h-12 text-gray-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">
                            {patientName}
                          </p>
                          <p className="text-gray-500">
                            with Dr. {doctorName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {app.reason || 'General consultation'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-4 py-2 text-sm font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {app.status}
                        </span>
                        <button
                          onClick={() => navigate(`/appointment/${app._id || app.id}`)}
                          className="px-4 py-2 bg-[#062e3e] text-white rounded-lg hover:bg-[#0a3d4f] transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
