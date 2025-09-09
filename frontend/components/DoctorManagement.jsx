import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import { UserCircleIcon } from "./icons/Icons";
import { StarIcon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';

/* ---------------------- Doctor Management ---------------------- */
const DoctorManagement = ({ hospitalName }) => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hospitalName) return;
        const fetchDoctors = async () => {
            try {
                const res = await fetch(
                    `/api/doctors?hospitalName=${encodeURIComponent(hospitalName)}&verified=true`
                );
                const data = await res.json();
                setDoctors(data);
            } catch (err) {
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [hospitalName]);

    if (loading) return <p className="p-8 text-gray-500">Loading...</p>;

    return (
        <div>
            <Header title="Doctor Management" />
            <div className="p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Verified Doctors</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1">
                    {doctors.length === 0 && (
                        <p className="text-gray-500">No verified doctors found.</p>
                    )}
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor._id} doctor={doctor} onViewProfile={() => navigate(`/doctor/${doctor._id}/stats`)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ---------------------- Doctor Card ---------------------- */
const DoctorCard = ({ doctor, onViewProfile }) => {
    const isVerified = doctor.verified === true;
    return (
        <div
            className="bg-white rounded-2xl shadow-md border border-gray-200/80 flex flex-col items-center justify-center p-4 relative transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            style={{ width: '250px', height: '220px', minWidth: '160px', minHeight: '160px' }}
            onClick={onViewProfile}
        >
            <span
                className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${isVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
                {isVerified ? "Verified" : "Unverified"}
            </span>
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                {doctor.profileImage ? (
                    <img src={doctor.profileImage} alt="Profile" className="w-20 h-20 object-cover rounded-full border-4 border-green-400" />
                ) : (
                    <UserCircleIcon className="w-20 h-20 text-gray-300" />
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">{doctor.fullName}</h3>
            <p className="text-gray-500 text-xs text-center mt-1 truncate w-full">{doctor.specialty}</p>
        </div>
    );
};

export { DoctorManagement };
