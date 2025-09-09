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

    useEffect(() => {
        fetch(`/api/doctors/${doctorId}`)
            .then((res) => res.json())
            .then((data) => {
                setDoctor(data);
                setLoading(false);

                // Fetch stats for this doctor
                fetch(`/api/appointments/doctor/${doctorId}/stats`)
                    .then((res) => res.json())
                    .then((statsData) => setStats(statsData));

                // Fetch patients who booked appointments with this doctor
                fetch(`/api/appointments/doctor/${doctorId}/patients`)
                    .then((res) => res.json())
                    .then((patientsData) => setPatients(patientsData));
            })
            .catch((err) => {
                console.error("Error fetching doctor data:", err);
                setLoading(false);
            });
    }, [doctorId]);


    const handleVerify = async () => {
        try {
            const res = await fetch(`/api/doctors/${doctorId}/verify`, { method: "PATCH" });
            if (!res.ok) {
                const text = await res.text();
                alert("Verification failed: " + text);
                return;
            }
            // Try to parse JSON, fallback to text
            let data;
            try {
                data = await res.json();
            } catch {
                data = null;
            }
            if (data && data.success) {
                navigate("/");
            } else {
                alert("Verification failed: " + (data?.error || "Unknown error"));
            }
        } catch (err) {
            alert("Network error: " + err.message);
        }
    };
    const handleReject = async () => {
        try {
            const res = await fetch(`/api/doctors/${doctorId}/reject`, { method: "PATCH" });
            if (!res.ok) {
                const text = await res.text();
                alert("Rejection failed: " + text);
                return;
            }
            navigate("/");
        } catch (err) {
            alert("Network error: " + err.message);
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
                                    {patient.name} ({patient.email})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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
                        className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                        Verify
                    </button>
                    <button
                        onClick={handleReject}
                        className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Reject
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
