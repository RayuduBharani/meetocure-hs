import React from 'react';

const statusStyles = {
  'Confirmed': 'text-green-700 font-semibold',
  'Cancelled': 'text-red-700 font-semibold',
  'Rescheduled': 'text-amber-700 font-semibold',
  'Checked-in': 'text-blue-700 font-semibold',
  'Completed': 'text-gray-700 font-semibold',
};

export const AppointmentHistoryItem = ({ appointment, onViewDetails }) => {
  // Back button handler
  const handleBack = () => {
    window.history.back();
  };
  return (
    <>
      <button onClick={handleBack} className="mb-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Back</button>
      <div className="bg-gray-50/70 p-4 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 border border-gray-200/80">
        <div className="w-1/3">
          <p className="font-bold text-gray-800">{appointment.doctor.name}</p>
          <p className="text-sm text-gray-500">{appointment.doctor.specialty}</p>
        </div>
        <div className="w-1/4 text-center">
          <p className="font-medium text-gray-700">{appointment.date}</p>
          <p className="text-sm text-gray-500">{appointment.time}</p>
        </div>
        <div className="w-1/4 text-center">
          <span className={statusStyles[appointment.status]}>
            {appointment.status}
          </span>
        </div>
        <div className="w-1/6 text-right">
          <button onClick={() => onViewDetails(appointment)} className="text-[#062e3e] font-semibold hover:underline">
            View Details
          </button>
        </div>
      </div>
    </>
  );
};
