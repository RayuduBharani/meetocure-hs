import React, { useState, useEffect} from 'react';
import { Header } from './Header';
import { UserCircleIcon } from './icons/Icons';

const statusStyles = {
  'Confirmed': { text: 'text-green-800', bg: 'bg-green-100' },
  'Checked-in': { text: 'text-blue-800', bg: 'bg-blue-100' },
  'Completed': { text: 'text-gray-800', bg: 'bg-gray-200' },
  'Cancelled': { text: 'text-red-800', bg: 'bg-red-100' },
  'Rescheduled': { text: 'text-yellow-800', bg: 'bg-yellow-100' },
};


export const AppointmentsDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorMap, setDoctorMap] = useState({});

  useEffect(() => {
    const hospitalName = localStorage.getItem('hospitalName') || '';
    fetch(`/api/dashboard/verified-doctors-all-appointments?hospitalName=${encodeURIComponent(hospitalName)}`)
      .then(res => res.json())
      .then(data => {
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
        // Build doctorId -> name map
        const map = {};
        (data.appointments || []).forEach(app => {
          // Try to get doctorId and name from each appointment
          const doctorId = app.doctor?._id || app.doctor?.id || app.doctorId;
          const doctorName = app.doctor?.verificationDetails?.name || app.doctor?.name || app.doctorName;
          if (doctorId && doctorName) {
            map[doctorId] = doctorName;
          }
        });
        setDoctorMap(map);
      })
      .catch(() => setAppointments([]));
  }, []);
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
                // Try to get doctor name from appointment, else from doctorMap using doctorId
                let doctorName = app.doctor?.verificationDetails?.name || app.doctor?.name || app.doctorName;
                if (!doctorName) {
                  const doctorId = app.doctor?._id || app.doctor?.id || app.doctorId;
                  if (doctorId && doctorMap[doctorId]) {
                    doctorName = doctorMap[doctorId];
                  }
                }
                doctorName = doctorName || 'Verified Doctor';
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
                            with a {doctorName}
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
export default AppointmentsDashboard;