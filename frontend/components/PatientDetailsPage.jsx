import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserCircleIcon } from "./icons/Icons";
import { Header } from "./Header";

const PatientDetailsPage = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPatientDetails();
        fetchPatientAppointments();
    }, [patientId]);

    const fetchPatientDetails = async () => {
        try {
            const res = await fetch(`/api/patient-details/${patientId}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log('Patient data:', data);
            setPatient(data);
        } catch (err) {
            console.error("Error fetching patient details:", err);
            setError(`Error fetching patient details: ${err.message}`);
        }
    };

    const fetchPatientAppointments = async () => {
        try {
            const res = await fetch(`/api/appointments?patientId=${patientId}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            console.log('Patient appointments:', data);
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (err) {
            console.error("Error fetching patient appointments:", err);
            setError(`Error fetching patient appointments: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading patient details...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <Header title="Patient Details" />
            
            {/* Back Arrow */}
            <div className="w-full px-8 pt-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#062e3e] font-semibold hover:underline mb-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="w-full px-8 py-10 space-y-10">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {patient ? (
                    <>
                        {/* Patient Profile Header */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center overflow-hidden border-4 border-blue-300">
                                {patient.photo ? (
                                    <img
                                        src={patient.photo}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <UserCircleIcon className="w-32 h-32 text-blue-500" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {patient.name}
                                </h2>
                                <div className="flex flex-wrap gap-6 text-gray-600 text-base mb-4">
                                    <span className="text-blue-700 font-semibold">
                                        {patient.email}
                                    </span>
                                    {patient.phone && <span>{patient.phone}</span>}
                                    {patient.dateOfBirth && (
                                        <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                                    )}
                                    {patient.gender && <span>{patient.gender}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Key Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white shadow rounded-xl p-8">
                            <div>
                                <h4 className="text-xs uppercase text-gray-500 mb-2">Contact Information</h4>
                                <p className="text-gray-800 mb-1">Phone: {patient.phone}</p>
                                <p className="text-gray-800 mb-1">Email: {patient.email}</p>
                                {patient.address && (
                                    <div className="mt-2">
                                        <p className="text-gray-800">{patient.address.street}</p>
                                        <p className="text-gray-800">{patient.address.city}, {patient.address.state}</p>
                                        <p className="text-gray-800">{patient.address.zipCode}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <h4 className="text-xs uppercase text-gray-500 mb-2">Medical Information</h4>
                                {patient.medicalInfo?.bloodType && (
                                    <p className="text-gray-800 mb-1">Blood Type: {patient.medicalInfo.bloodType}</p>
                                )}
                                {patient.medicalInfo?.allergies && patient.medicalInfo.allergies.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-gray-800 font-semibold">Allergies:</p>
                                        <ul className="list-disc pl-4">
                                            {patient.medicalInfo.allergies.map((allergy, idx) => (
                                                <li key={idx} className="text-gray-800">{allergy}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <h4 className="text-xs uppercase text-gray-500 mb-2">Emergency Contact</h4>
                                {patient.emergencyContact?.name ? (
                                    <div>
                                        <p className="text-gray-800 mb-1">{patient.emergencyContact.name}</p>
                                        <p className="text-gray-800 mb-1">{patient.emergencyContact.relationship}</p>
                                        <p className="text-gray-800">{patient.emergencyContact.phone}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No emergency contact provided</p>
                                )}
                            </div>
                        </div>

                        {/* Medical History */}
                        {patient.medicalInfo?.medicalHistory && (
                            <div className="bg-white shadow rounded-xl p-8">
                                <h4 className="font-bold text-lg mb-3 text-gray-900">Medical History</h4>
                                <p className="text-gray-700 leading-relaxed">{patient.medicalInfo.medicalHistory}</p>
                            </div>
                        )}

                        {/* Appointments History */}
                        <div className="bg-white shadow rounded-xl p-8">
                            <h4 className="font-bold text-lg mb-6 text-gray-900">Appointment History</h4>
                            
                            {appointments.length === 0 ? (
                                <p className="text-gray-500">No appointments found for this patient.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Date & Time</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Doctor</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Type</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Payment</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-700">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map((appointment) => (
                                                <tr key={appointment._id} className="border-b border-gray-100 hover:bg-gray-50">
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
                                                    <td className="py-3 px-2 text-gray-700">
                                                        {appointment.doctor?.name || 'N/A'}
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
                                                    <td className="py-3 px-2 text-gray-700">
                                                        <p className="text-sm">
                                                            {appointment.reason || 'No reason provided'}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Medical Records */}
                        {appointments.some(apt => apt.medicalRecords && apt.medicalRecords.length > 0) && (
                            <div className="bg-white shadow rounded-xl p-8">
                                <h4 className="font-bold text-lg mb-6 text-gray-900">Medical Records</h4>
                                <div className="space-y-4">
                                    {appointments.map((appointment) => 
                                        appointment.medicalRecords && appointment.medicalRecords.map((record, idx) => (
                                            <div key={`${appointment._id}-${idx}`} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-semibold text-gray-900 capitalize">
                                                        {record.record_type.replace('_', ' ')}
                                                    </h5>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(record.upload_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {record.description && (
                                                    <p className="text-gray-700 mb-2">{record.description}</p>
                                                )}
                                                <a 
                                                    href={record.file_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-red-500">Patient not found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetailsPage;
