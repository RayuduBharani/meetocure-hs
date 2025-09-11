import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './Header';
import { UserCircleIcon } from './icons/Icons';

const statusStyles = {
  'Confirmed': { text: 'text-green-800', bg: 'bg-green-100' },
  'Checked-in': { text: 'text-blue-800', bg: 'bg-blue-100' },
  'Completed': { text: 'text-gray-800', bg: 'bg-gray-200' },
  'Cancelled': { text: 'text-red-800', bg: 'bg-red-100' },
  'Rescheduled': { text: 'text-yellow-800', bg: 'bg-yellow-100' },
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/80">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-4xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);

const AppointmentRow = ({ appointment, onCheckIn, onViewDetails }) => {
  const statusStyle = statusStyles[appointment.status];
  return (
    <div className="grid grid-cols-5 items-center py-4 px-2 border-b border-gray-200/80 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 col-span-1">
        <UserCircleIcon className="w-10 h-10 text-gray-400" />
        <span className="font-medium text-gray-800">{appointment.patient.name}</span>
      </div>
      <div className="text-gray-600">{appointment.doctor.name}</div>
      <div className="text-gray-600">{appointment.time}</div>
      <div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
          {appointment.status}
        </span>
      </div>
      <div>
        {appointment.status === 'Confirmed' && (
          <button
            onClick={() => onCheckIn(appointment._id || appointment.id)}
            className="bg-[#062e3e] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#04222f] transition-all duration-200 transform hover:scale-[1.02]"
          >
            Check-in
          </button>
        )}
        {appointment.status !== 'Confirmed' && (
          <button
            onClick={() => onViewDetails(appointment.patient)}
            className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export const AppointmentsDashboard = ({ onNavigateToPatient }) => {
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/appointments/today')
      .then(res => res.json())
      .then(setAppointments)
      .catch(() => setAppointments([]));
  }, []);

  const handleCheckIn = async (appointmentId) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const updated = await res.json();
      setAppointments(current => current.map(app => app._id === updated._id ? updated : app));
    } catch (err) { }
  };

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return appointments;
    return appointments.filter(app =>
      app.patient.name.toLowerCase().includes(query) ||
      app.doctor.name.toLowerCase().includes(query)
    );
  }, [appointments, searchQuery]);

  const totalAppointments = appointments.length;
  const checkedInCount = appointments.filter(a => a.status === 'Checked-in').length;
  const pendingCount = appointments.filter(a => a.status === 'Confirmed').length;

  return (
    <>
      <Header
        title="Appointments"
        searchPlaceholder="Search patient, doctor..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="p-6">
        {/* All Appointments Section with vertical scrollbar only for the section */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/90">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            All Appointments
          </h3>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No appointments found.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    <div className="w-21 text-center">
                      <p className="font-bold text-[#062e3e] text-lg">
                        {time && `${time.split(' ')[0]} ${time.split(' ')[1]}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {date && date.substring(0, 10)}
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
                          onClick={() => window.location.href = `/appointment/${app._id || app.id}`}
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
}
