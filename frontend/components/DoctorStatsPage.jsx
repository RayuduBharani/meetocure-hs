import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from './Header';

const DoctorStatsPage = () => {
    const { doctorId } = useParams();
    const [stats, setStats] = useState({ totalAppointments: 0, cancelledAppointments: 0 });
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
  // Fetch stats for this doctor
  fetch(`/api/appointments/doctor/${doctorId}/stats`)
    .then((res) => res.json())
    .then((data) => {
      setStats({
        totalAppointments: data.totalAppointments || 0,
        cancelledAppointments: data.cancelledAppointments || 0,
      });
    })
    .catch((err) => console.error("Error fetching stats:", err));

  // Fetch patients who completed appointments with this doctor
  fetch(`/api/appointments/doctor/${doctorId}/completed-patients`)
    .then((res) => res.json())
    .then((patientsData) => setPatients(patientsData))
    .catch((err) => console.error("Error fetching patients:", err))
    .finally(() => setLoading(false));
}, [doctorId]);


    if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <Header title="Doctor Appointment Stats" />
            <div className="w-full px-8 py-10 space-y-10">
                <div className="flex gap-8 mb-8">
                    <div className="flex-1 bg-white shadow rounded-xl p-8 flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Total Appointments</h2>
                        <p className="text-3xl font-bold text-blue-700">{stats.totalAppointments}</p>
                    </div>
                    <div className="flex-1 bg-white shadow rounded-xl p-8 flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancelled Appointments</h2>
                        <p className="text-3xl font-bold text-red-600">{stats.cancelledAppointments}</p>
                    </div>
                </div>
                <div className="bg-white shadow rounded-xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Patients Who Completed Appointments</h3>
                    {patients.length === 0 ? (
                        <p className="text-gray-500">No completed appointments found.</p>
                    ) : (
                        <ul className="list-disc pl-6">
                            {patients.map((patient) => (
                                <li key={patient._id} className="text-gray-700 mb-2">
                                    {patient.name} ({patient.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorStatsPage;
