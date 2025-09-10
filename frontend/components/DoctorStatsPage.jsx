import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';

const DoctorStatsPage = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ 
        totalAppointments: 0, 
        totalPatients: 0,
        byStatus: {
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0
        }
    });
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    console.log(appointments);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch stats for this doctor
        fetch(`/api/appointments/doctor/${doctorId}/stats`)
            .then((res) => {
                console.log('Stats response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log('Stats data:', data); // Debug log
                setStats({
                    totalAppointments: data.totalAppointments || 0,
                    totalPatients: data.totalPatients || 0,
                    byStatus: data.byStatus || {
                        pending: 0,
                        confirmed: 0,
                        completed: 0,
                        cancelled: 0
                    }
                });
            })
            .catch((err) => {
                console.error("Error fetching stats:", err);
                setError(`Error fetching stats: ${err.message}`);
            });

        // Fetch patients who have appointments with this doctor
        fetch(`/api/appointments/doctor/${doctorId}/patients`)
            .then((res) => {
                console.log('Patients response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((patientsData) => {
                console.log('Patients data:', patientsData); // Debug log
                setPatients(patientsData);
            })
            .catch((err) => {
                console.error("Error fetching patients:", err);
                setError(`Error fetching patients: ${err.message}`);
            });

        // Fetch all appointments for this doctor
        fetch(`/api/appointments/doctor/${doctorId}`)
            .then((res) => {
                console.log('Appointments response status:', res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log('Appointments data:', data); // Debug log
                if (data.success) {
                    setAppointments(data.data);
                } else {
                    console.error('Appointments API returned error:', data.error);
                    setError(`Appointments API error: ${data.error}`);
                }
            })
            .catch((err) => {
                console.error("Error fetching appointments:", err);
                setError(`Error fetching appointments: ${err.message}`);
            })
            .finally(() => setLoading(false));
    }, [doctorId]);


    if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <Header title="Doctor Appointment Stats" />
            <div className="w-full px-8 py-10 space-y-10">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {/* Debug Info */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                    <strong>Debug Info:</strong> Doctor ID: {doctorId}
                </div>
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Appointments</h3>
                        <p className="text-3xl font-bold text-blue-700">{stats.totalAppointments}</p>
                    </div>
                    <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Patients</h3>
                        <p className="text-3xl font-bold text-green-700">{stats.totalPatients}</p>
                    </div>
                    <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.byStatus.completed}</p>
                    </div>
                    <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.byStatus.pending}</p>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white shadow rounded-xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Appointment Status Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{stats.byStatus.confirmed}</p>
                            <p className="text-sm text-gray-600">Confirmed</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{stats.byStatus.completed}</p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{stats.byStatus.cancelled}</p>
                            <p className="text-sm text-gray-600">Cancelled</p>
                        </div>
                    </div>
                </div>
                {/* Patients List */}
                <div className="bg-white shadow rounded-xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Patients with Appointments</h3>
                    {patients.length === 0 ? (
                        <p className="text-gray-500">No patients found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patients.map((patient) => (
                                <div key={patient._id} className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                                    <p className="text-gray-600 text-sm">{patient.email}</p>
                                    <p className="text-gray-500 text-xs">
                                        {patient.appointmentCount} appointment(s) - Last: {new Date(patient.lastAppointment).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Appointments Table */}
                <div className="bg-white shadow rounded-xl p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Recent Appointments</h3>
                        <p className="text-sm text-gray-500">Click on any row to view full appointment details</p>
                    </div>
                    {appointments.length === 0 ? (
                        <p className="text-gray-500">No appointments found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Patient</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Date & Time</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Type</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.slice(0, 10).map((appointment) => (
                                        <tr 
                                            key={appointment._id} 
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/appointment/${appointment._id}`)}
                                        >
                                            <td className="py-3 px-2">
                                                <div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/patient/${appointment.patient?._id || appointment.patient}`);
                                                        }}
                                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                    >
                                                        {appointment.patientInfo?.name || 'N/A'}
                                                    </button>
                                                    <p className="text-gray-500 text-xs">
                                                        {appointment.patient?.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-gray-700">
                                                <div>
                                                    <p className="font-medium">
                                                        {new Date(appointment.appointment_date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {appointment.appointment_time}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-gray-700 capitalize">
                                                {appointment.appointment_type}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div>
                                                    <p className="text-gray-700 font-medium">
                                                        ${appointment.payment?.amount || 0}
                                                    </p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        appointment.payment?.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        appointment.payment?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        appointment.payment?.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {appointment.payment?.status || 'pending'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {appointments.length > 10 && (
                                <p className="text-center text-gray-500 mt-4">
                                    Showing 10 of {appointments.length} appointments
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorStatsPage;
