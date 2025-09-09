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
      <div className="p-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/80">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-32 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map(app => (
                  <tr key={app._id || app.id} className="hover:bg-gray-50">
                    <td className="px-32 py-4 whitespace-nowrap flex items-center gap-3">
                      <UserCircleIcon className="w-8 h-8 text-gray-400" />
                      <span className="font-medium text-gray-800">{app.patient.name}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-gray-600">{app.doctor.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">{app.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[app.status]?.bg} ${statusStyles[app.status]?.text}`}>{app.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAppointments.length === 0 && (
              <div className="text-center text-gray-500 py-8">No appointments found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
