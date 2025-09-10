import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserCircleIcon } from "./icons/Icons";
import { Header } from "./Header";

const DoctorDetailsPage = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null); // ✅ for preview
    const [stats, setStats] = useState({ totalAppointments: 0, totalPatients: 0 });
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [appointmentFilter, setAppointmentFilter] = useState('all');
    const [appointmentSearch, setAppointmentSearch] = useState('');
    const [actionLoading, setActionLoading] = useState({ verify: false, reject: false });

    useEffect(() => {
        fetch(`/api/doctors/${doctorId}`)
            .then((res) => res.json())
            .then((response) => {
                if (response.success && response.data) {
                    // Use doctorVerification data for display since it has more complete info
                    setDoctor(response.data.doctorVerification);
                    setLoading(false);

                    // Fetch stats for this doctor
                    fetch(`/api/appointments/doctor/${doctorId}/stats`)
                        .then((res) => res.json())
                        .then((statsData) => setStats(statsData))
                        .catch((err) => console.error("Error fetching stats:", err));

                    // Fetch patients who booked appointments with this doctor
                    fetch(`/api/appointments/doctor/${doctorId}/patients`)
                        .then((res) => res.json())
                        .then((patientsData) => setPatients(patientsData))
                        .catch((err) => console.error("Error fetching patients:", err));

                    // Fetch all appointments for this doctor
                    fetchAppointments();
                } else {
                    console.error("Error fetching doctor data:", response.error);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Error fetching doctor data:", err);
                setLoading(false);
            });
    }, [doctorId]);

    const fetchAppointments = async () => {
        setAppointmentsLoading(true);
        try {
            const res = await fetch(`/api/appointments/doctor/${doctorId}`);
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            } else {
                console.error("Error fetching appointments:", data.error);
            }
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setAppointmentsLoading(false);
        }
    };

    const handleVerify = async () => {
        // Confirm verification
        const confirmed = window.confirm(
            `Are you sure you want to verify ${doctor?.fullName || doctor?.name || 'this doctor'}? This action cannot be undone.`
        );
        
        if (!confirmed) return;

        setActionLoading(prev => ({ ...prev, verify: true }));

        try {
            const res = await fetch(`/api/doctors/${doctorId}/verify`, { 
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                alert(`Doctor ${doctor?.fullName || doctor?.name || ''} has been verified successfully!`);
                navigate("/");
            } else {
                alert(`Verification failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error verifying doctor:', err);
            alert("Network error occurred while verifying doctor: " + err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, verify: false }));
        }
    };
    const handleReject = async () => {
        // Get rejection reason
        const reason = prompt(
            `Please provide a reason for rejecting ${doctor?.fullName || doctor?.name || 'this doctor'} (optional):`
        );
        
        // Confirm rejection
        const confirmed = window.confirm(
            `Are you sure you want to reject ${doctor?.fullName || doctor?.name || 'this doctor'}? This action cannot be undone.`
        );
        
        if (!confirmed) return;

        setActionLoading(prev => ({ ...prev, reject: true }));

        try {
            const res = await fetch(`/api/doctors/${doctorId}/reject`, { 
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: reason || '' }),
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                alert(`Doctor ${doctor?.fullName || doctor?.name || ''} has been rejected successfully!`);
                navigate("/");
            } else {
                alert(`Rejection failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error rejecting doctor:', err);
            alert("Network error occurred while rejecting doctor: " + err.message);
        } finally {
            setActionLoading(prev => ({ ...prev, reject: false }));
        }
    };

    if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
    if (!doctor) return <div className="p-8 text-red-500">Doctor not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <Header title="Doctor Details" />
            {/* Back Arrow */}
            <div className="w-full px-8 pt-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#062e3e] font-semibold hover:underline mb-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back
                </button>
            </div>

            <div className="w-full px-8 py-10 space-y-10">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center overflow-hidden border-4 border-red-300">
                        {doctor.profileImage ? (
                            <img
                                src={doctor.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <UserCircleIcon className="w-32 h-32 text-blue-500" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {doctor.fullName}
                        </h2>
                        <div className="flex flex-wrap gap-6 text-gray-600 text-base mb-4">
                            <span className="text-blue-700 font-semibold">
                                {doctor.category}
                            </span>
                            {doctor.gender && <span>{doctor.gender}</span>}
                            {doctor.dateOfBirth && (
                                <span>DOB: {new Date(doctor.dateOfBirth).toLocaleDateString()}</span>
                            )}
                            {doctor.experienceYears && (
                                <span>{doctor.experienceYears} yrs Experience</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white shadow rounded-xl p-8">
                    <div>
                        <h4 className="text-xs uppercase text-gray-500">Specializations</h4>
                        <p className="text-gray-800">
                            {doctor.primarySpecialization || "N/A"}
                        </p>
                        <p className="text-gray-800">
                            {doctor.additionalSpecializations || "N/A"}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase text-gray-500">Council</h4>
                        <p className="text-gray-800">
                            Reg No: {doctor.medicalCouncilRegistrationNumber}
                        </p>
                        <p className="text-gray-800">Name: {doctor.medicalCouncilName}</p>
                        <p className="text-gray-800">Year: {doctor.yearOfRegistration}</p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase text-gray-500">Stats</h4>
                        <p className="text-gray-800">Total Appointments: {stats.totalAppointments}</p>
                        <p className="text-gray-800">Total Patients: {stats.totalPatients}</p>
                    </div>
                </div>

                {/* Patients List */}
                {patients.length > 0 && (
                    <div className="bg-white shadow rounded-xl p-8 mt-8">
                        <h4 className="font-bold text-lg mb-3 text-gray-900">Patients Who Booked Appointments</h4>
                        <ul className="list-disc pl-6">
                            {patients.map((patient) => (
                                <li key={patient._id} className="text-gray-700 mb-2">
                                    {patient.name} ({patient.email}) - {patient.appointmentCount} appointment(s)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Appointments List */}
                <div className="bg-white shadow rounded-xl p-8 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-lg text-gray-900">All Appointments</h4>
                        <button
                            onClick={fetchAppointments}
                            disabled={appointmentsLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                            {appointmentsLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    
                    {/* Appointment Summary */}
                    {appointments.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                                <p className="text-sm text-gray-600">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">
                                    {appointments.filter(apt => apt.status === 'completed').length}
                                </p>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">
                                    {appointments.filter(apt => apt.status === 'pending').length}
                                </p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">
                                    {appointments.filter(apt => apt.status === 'cancelled').length}
                                </p>
                                <p className="text-sm text-gray-600">Cancelled</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by patient name or email..."
                                value={appointmentSearch}
                                onChange={(e) => setAppointmentSearch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                        <button
                            onClick={() => setAppointmentFilter('all')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                appointmentFilter === 'all' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setAppointmentFilter('pending')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                appointmentFilter === 'pending' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setAppointmentFilter('confirmed')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                appointmentFilter === 'confirmed' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Confirmed
                        </button>
                        <button
                            onClick={() => setAppointmentFilter('completed')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                appointmentFilter === 'completed' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setAppointmentFilter('cancelled')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                appointmentFilter === 'cancelled' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Cancelled
                        </button>
                        </div>
                    </div>
                    
                    {appointmentsLoading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading appointments...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No appointments found for this doctor.</p>
                        </div>
                    ) : appointments.filter(appointment => {
                        const matchesFilter = appointmentFilter === 'all' || appointment.status === appointmentFilter;
                        const matchesSearch = !appointmentSearch || 
                            (appointment.patient?.name?.toLowerCase().includes(appointmentSearch.toLowerCase())) ||
                            (appointment.patient?.email?.toLowerCase().includes(appointmentSearch.toLowerCase()));
                        return matchesFilter && matchesSearch;
                    }).length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No {appointmentFilter} appointments found.</p>
                        </div>
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
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments
                                        .filter(appointment => {
                                            const matchesFilter = appointmentFilter === 'all' || appointment.status === appointmentFilter;
                                            const matchesSearch = !appointmentSearch || 
                                                (appointment.patient?.name?.toLowerCase().includes(appointmentSearch.toLowerCase())) ||
                                                (appointment.patient?.email?.toLowerCase().includes(appointmentSearch.toLowerCase()));
                                            return matchesFilter && matchesSearch;
                                        })
                                        .map((appointment) => (
                                        <tr key={appointment._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-2">
                                                <div>
                                                    <button
                                                        onClick={() => navigate(`/patient/${appointment.patient?._id || appointment.patient}`)}
                                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                    >
                                                        {appointment.patient?.name || appointment.patientInfo?.name || 'N/A'}
                                                    </button>
                                                    <p className="text-gray-500 text-xs">
                                                        {appointment.patient?.email || appointment.patientInfo?.email || 'N/A'}
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

                {/* Hospital Info */}
                {doctor.hospitalInfo?.length > 0 && (
                    <div className="bg-white shadow rounded-xl p-8">
                        <h4 className="font-bold text-lg mb-3 text-gray-900">
                            Hospital Info
                        </h4>
                        {doctor.hospitalInfo.map((hosp, idx) => (
                            <div key={idx} className="mb-3">
                                <p>
                                    <span className="font-semibold">Name:</span>{" "}
                                    {hosp.hospitalName}
                                </p>
                                <p>
                                    <span className="font-semibold">Address:</span>{" "}
                                    {hosp.hospitalAddress}
                                </p>
                                <p>
                                    <span className="font-semibold">Contact:</span>{" "}
                                    {hosp.contactNumber}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Qualifications */}
                {doctor.qualifications?.length > 0 && (
                    <div className="bg-white shadow rounded-xl p-8">
                        <h4 className="font-bold text-lg mb-3 text-gray-900">
                            Qualifications
                        </h4>
                        {doctor.qualifications.map((q, idx) => (
                            <p key={idx} className="text-gray-700">
                                {q.degree} - {q.universityCollege} ({q.year})
                            </p>
                        ))}
                        {doctor.qualificationCertificates?.length > 0 && (
                            <div className="flex gap-4 mt-4 flex-wrap">
                                {doctor.qualificationCertificates.map((cert, idx) => (
                                    <img
                                        key={idx}
                                        src={cert}
                                        alt="Certificate"
                                        className="w-32 h-32 object-contain border rounded cursor-pointer"
                                        onClick={() => setSelectedImage(cert)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Identity & Certificates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {doctor.identityDocument && (
                        <div className="bg-white shadow rounded-xl p-8">
                            <h4 className="font-bold text-lg mb-3 text-gray-900">
                                Identity Document
                            </h4>
                            <img
                                src={doctor.identityDocument}
                                alt="Identity Document"
                                className="w-32 h-32 object-contain border rounded cursor-pointer"
                                onClick={() => setSelectedImage(doctor.identityDocument)}
                            />
                        </div>
                    )}
                    {doctor.medicalCouncilCertificate && (
                        <div className="bg-white shadow rounded-xl p-8">
                            <h4 className="font-bold text-lg mb-3 text-gray-900">
                                Council Certificate
                            </h4>
                            <img
                                src={doctor.medicalCouncilCertificate}
                                alt="Council Certificate"
                                className="w-32 h-32 object-contain border rounded cursor-pointer"
                                onClick={() => setSelectedImage(doctor.medicalCouncilCertificate)}
                            />
                        </div>
                    )}
                </div>

                {/* About Section */}
                {doctor.about && (
                    <div className="bg-white shadow rounded-xl p-8">
                        <h4 className="font-bold text-lg mb-3 text-gray-900">About</h4>
                        <p className="text-gray-700 leading-relaxed">{doctor.about}</p>
                    </div>
                )}

                {/* Bank Info */}
                {doctor.bankingInfo?.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-8">
                        <h4 className="font-bold text-lg mb-3 text-gray-900">
                            Bank Details
                        </h4>
                        {doctor.bankingInfo.map((bank, idx) => (
                            <div key={idx} className="space-y-1 text-gray-700">
                                <p>
                                    <span className="font-semibold">Account Holder:</span>{" "}
                                    {bank.accountHolderName}
                                </p>
                                <p>
                                    <span className="font-semibold">Account Number:</span>{" "}
                                    {bank.accountNumber}
                                </p>
                                <p>
                                    <span className="font-semibold">IFSC:</span> {bank.ifscCode}
                                </p>
                                <p>
                                    <span className="font-semibold">Bank:</span> {bank.bankName}
                                </p>
                                <p>
                                    <span className="font-semibold">Branch:</span>{" "}
                                    {bank.bankBranch}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <button
                        onClick={handleVerify}
                        disabled={actionLoading.verify || actionLoading.reject}
                        className={`font-semibold px-6 py-2 rounded-lg transition-colors duration-200 ${
                            actionLoading.verify || actionLoading.reject
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {actionLoading.verify ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={actionLoading.verify || actionLoading.reject}
                        className={`font-semibold px-6 py-2 rounded-lg transition-colors duration-200 ${
                            actionLoading.verify || actionLoading.reject
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        {actionLoading.reject ? 'Rejecting...' : 'Reject'}
                    </button>
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Preview"
                        className="max-w-4xl max-h-[90%] rounded-lg shadow-lg"
                    />
                </div>
            )}
        </div>
    );
};

export default DoctorDetailsPage;
