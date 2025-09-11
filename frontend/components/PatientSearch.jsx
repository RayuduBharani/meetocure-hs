import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import React, { useState, useEffect } from "react";
import { AppointmentHistoryItem } from './AppointmentHistoryItem';
import { Header } from './Header';
import { UserCircleIcon } from './icons/Icons';



const AppointmentDetailModal = ({ appointment, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 my-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Appointment Details</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {/* Doctor Information */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Doctor Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4 mb-3">
                        {appointment.doctor.profileImage ? (
                            <img
                                src={appointment.doctor.profileImage}
                                alt={appointment.doctor.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon className="w-16 h-16 text-gray-400" />
                        )}
                        <div>
                            <p className="font-semibold text-gray-800 text-lg">{appointment.doctor.name}</p>
                            <p className="text-gray-600">{appointment.doctor.specialization}</p>
                            <p className="text-gray-600">{appointment.doctor.specialty}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Email: {appointment.doctor.email}</p>
                            <p className="text-sm text-gray-600">Mobile: {appointment.doctor.mobileNumber}</p>
                            {appointment.doctor.hospitalInfo?.hospitalName && (
                                <p className="text-sm text-gray-600">Hospital: {appointment.doctor.hospitalInfo.hospitalName}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status: {appointment.doctor.registrationStatus}</p>
                            <p className="text-sm text-gray-600">Experience: {appointment.doctor.experienceYears} years</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Information */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Patient Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name: {appointment.patientInfo?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Age: {appointment.patientInfo?.age || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Gender: {appointment.patientInfo?.gender || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Blood Group: {appointment.patientInfo?.blood_group || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Phone: {appointment.patientInfo?.phone || 'N/A'}</p>
                            {appointment.patientInfo?.allergies?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">Allergies:</p>
                                    <ul className="list-disc pl-4 text-sm text-gray-600">
                                        {appointment.patientInfo.allergies.map((allergy, index) => (
                                            <li key={index}>{allergy}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    {appointment.patientInfo?.medical_history_summary && (
                        <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700">Medical History:</p>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                {appointment.patientInfo.medical_history_summary}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Appointment Details */}
            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="text-gray-600">Date:</span>
                                <span className="ml-2 font-semibold text-gray-800">{appointment.date}</span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-600">Time:</span>
                                <span className="ml-2 font-semibold text-gray-800">{appointment.time}</span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-600">Type:</span>
                                <span className="ml-2 font-semibold text-gray-800">{appointment.type}</span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-600">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {appointment.status}
                                </span>
                            </p>
                            {appointment.reason && (
                                <p className="text-sm">
                                    <span className="text-gray-600">Reason:</span>
                                    <span className="ml-2 text-gray-800">{appointment.reason}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {filteredPatients.map(patient => {
                        return (
                            <tr
                                key={patient._id || patient.patient}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleSelectPatient(patient)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {patient.photo ? (
                                            <img src={patient.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <UserCircleIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-800">{patient.name || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">
                                                <div>{patient.phone}</div>
                                                <div className="text-xs">{patient.dob ? new Date(patient.dob).toLocaleDateString() : ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        <div className="text-gray-900">{patient.gender || 'N/A'}</div>
                                        <div className="text-gray-500">{patient.dob ? new Date(patient.dob).toLocaleDateString() : ''}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">No medical info</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {patient.updatedAt ? new Date(patient.updatedAt).toLocaleString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                            </tr>
                        )
                    })}
                    onClick={onClose}
                    className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                </div>
                Close
            </div>
        </div>
    </div>
);

const PatientRow = ({ patient, onView }) => (
    <div onClick={() => onView(patient)} className="grid grid-cols-5 items-center py-4 px-2 border-b border-gray-200/80 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-center gap-4 col-span-2">
            <UserCircleIcon className="w-10 h-10 text-gray-400" />
            <span className="font-medium text-gray-800">{patient.name}</span>
        </div>
        <div className="text-gray-600">{patient.patientId}</div>
        <div className="text-gray-600">{patient.email}</div>
        <div className="text-gray-600">{patient.phone}</div>
    </div>
);

export const PatientSearch = ({ initialSearchTarget, onExitPatientView, getPageTitle }) => {
    // PDF download handler
    const handleDownloadPDF = () => {
        if (filteredPatients.length === 0) {
            alert('No patients to download. Please ensure there are patients in the list.');
            return;
        }

        try {
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(20);
            doc.text('Patient Directory', 14, 22);

            // Add hospital name if available
            const hospitalName = localStorage.getItem('hospitalName');
            if (hospitalName) {
                doc.setFontSize(12);
                doc.text(`Hospital: ${hospitalName}`, 14, 30);
            }

            // Add generation date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

            // Prepare table data
            const tableColumn = ["Patient Name", "Contact Info", "Gender", "Medical Info", "Latest Appointment", "Doctor"];
            const tableRows = filteredPatients.map(patient => {
                const latestAppointment = patient.appointments && patient.appointments.length > 0
                    ? patient.appointments[0]
                    : null;
                const contactInfo = `${patient.phone}\n${patient.email}`;
                const medicalInfo = `Blood: ${patient.medicalInfo?.bloodType || 'N/A'}\n${patient.medicalInfo?.allergies?.length
                    ? `Allergies: ${patient.medicalInfo.allergies.length}`
                    : 'No allergies'
                    }`;
                return [
                    patient.name || 'N/A',
                    contactInfo,
                    patient.gender || 'N/A',
                    medicalInfo,
                    latestAppointment ? `${latestAppointment.date} ${latestAppointment.time}` : 'No appointments',
                    latestAppointment?.doctor ? `${latestAppointment.doctor.name}\n${latestAppointment.doctor.specialization}` : 'N/A'
                ];
            });

            // Add table
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [66, 139, 202] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }

            doc.save(`patients_${hospitalName || 'directory'}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch patients who booked appointments to verified doctors for the hospital
    const fetchPatients = async () => {
        const hospitalId = (localStorage.getItem('userId') || '').trim();

        if (!hospitalId) {
            setError('Hospital ID not found. Please log in again.');
            setLoading(false);
            return;
        }

        // Validate hospital ID format (24 character hex string)
        if (!/^[0-9a-fA-F]{24}$/.test(hospitalId)) {
            setError('Invalid Hospital ID format. Please log in again.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const hospitalName = localStorage.getItem('hospitalName') || '';
            const res = await fetch(`/api/dashboard/verified-doctors-patients?hospitalName=${encodeURIComponent(hospitalName)}`);
            if (!res.ok) throw new Error('Failed to fetch patients');
            const data = await res.json();
            setPatients(Array.isArray(data.patients) ? data.patients : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);


    useEffect(() => {
        if (initialSearchTarget && patients.length > 0) {
            const patientToView = patients.find(p => p.id === initialSearchTarget.id);
            if (patientToView) {
                setSelectedPatient(patientToView);
                setViewMode('detail');
            }
        } else {
            setViewMode('list');
        }
    }, [initialSearchTarget, patients]);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        if (!query) {
            setFilteredPatients(patients);
        } else {
            setFilteredPatients(
                patients.filter(p =>
                    (p.name && p.name.toLowerCase().includes(query)) ||
                    (p.patientId && p.patientId.toLowerCase().includes(query)) ||
                    (p.phone && p.phone.includes(query)) ||
                    (p.email && p.email.toLowerCase().includes(query))
                )
            );
        }
    }, [searchQuery, patients]);

    const handleViewAppointmentDetails = (appointment) => {
        setSelectedAppointment(appointment);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedPatient(null);
        onExitPatientView();
    }

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setViewMode('detail');
    }

    const searchPlaceholder = viewMode === 'list' ? 'Search by Patient Name, ID, or Phone...' : undefined;

    if (viewMode === 'detail' && selectedPatient) {
        return (
            <>
                <Header title={getPageTitle(true)} />
                <div className="p-8 space-y-6">
                    <button
                        onClick={handleBackToList}
                        className="text-[#062e3e] font-semibold hover:underline flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to patient list
                    </button>
                    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6 border border-gray-200/80">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                <UserCircleIcon className="w-24 h-24 text-gray-300" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                                <p className="text-gray-500 mt-1">
                                    Patient ID: {selectedPatient.patientId}
                                </p>
                                <p className="text-gray-500">
                                    {selectedPatient.email} | {selectedPatient.phone}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment History</h3>
                            <div className="space-y-3">
                                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? selectedPatient.appointments.map(app => (
                                    <AppointmentHistoryItem key={app.id} appointment={app} onViewDetails={handleViewAppointmentDetails} />
                                )) : <p className="text-gray-500 p-4 text-center"></p>}
                            </div>
                        </div>
                    </div>
                    {selectedAppointment && (
                        <AppointmentDetailModal
                            appointment={selectedAppointment}
                            onClose={() => setSelectedAppointment(null)}
                        />
                    )}
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Header title={getPageTitle(false)} />
                <div className="p-8">
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">Loading patients...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header
                title={getPageTitle(false)}
                searchPlaceholder={searchPlaceholder}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <div className="p-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/80">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-800">Patient Directory</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchPatients}
                                disabled={loading}
                                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={filteredPatients.length === 0}
                                className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Patient Information</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Personal Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Medical Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Last Visit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map(patient => {
                                    return (
                                        <tr
                                            key={patient.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleSelectPatient(patient)}
                                        >
                                            <td className="px-10 py-4 w-1/3">
                                                <div className="flex items-center gap-3">
                                                    <UserCircleIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <div className="font-medium text-gray-800">{patient.name || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">{patient.phone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="text-gray-900">{patient.gender || 'N/A'}</div>
                                                    <div className="text-gray-500">
                                                        {(() => {
                                                            const d = new Date(patient.dob);
                                                            const day = String(d.getDate()).padStart(2, "0");
                                                            const month = String(d.getMonth() + 1).padStart(2, "0");
                                                            const year = d.getFullYear();
                                                            return `${day}-${month}-${year}`;
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="text-gray-900">Blood: {patient.medicalInfo?.bloodType || 'N/A'}</div>
                                                    <div className="text-gray-500">
                                                        {patient.medicalInfo?.allergies?.length
                                                            ? `${patient.medicalInfo.allergies.length} allergies`
                                                            : 'No allergies'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 w-1/6 whitespace-nowrap">
                                                {patient ? (
                                                    <div className="text-sm">
                                                        {(() => {
                                                            const d = new Date(patient.updatedAt);
                                                            const day = String(d.getDate()).padStart(2, "0");
                                                            const month = String(d.getMonth() + 1).padStart(2, "0");
                                                            const year = d.getFullYear();
                                                            const hours = String(d.getHours()).padStart(2, "0");
                                                            const minutes = String(d.getMinutes()).padStart(2, "0");
                                                            return (
                                                                <>
                                                                    <div className="text-sm font-gray-500">{`${day}-${month}-${year}`}</div>
                                                                    <div className="text-sm text-gray-500">{`${hours}:${minutes}`}</div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                ) : 'No visits'}
                                            </td>
                                            <td className="px-6 py-4 w-6/6 whitespace-nowrap">
                                                {(() => {
                                                    const latestAppointment = Array.isArray(patient.appointments) && patient.appointments.length > 0 ? patient.appointments[0] : null;
                                                    const status = latestAppointment?.status;
                                                    let statusText = '';
                                                    let statusClass = '';
                                                    switch (status) {
                                                        case 'completed':
                                                            statusText = 'Completed';
                                                            statusClass = 'bg-green-100 text-green-800';
                                                            break;
                                                        case 'pending':
                                                            statusText = 'Pending';
                                                            statusClass = 'bg-yellow-100 text-yellow-800';
                                                            break;
                                                        case 'cancelled':
                                                            statusText = 'Cancelled';
                                                            statusClass = 'bg-red-100 text-red-800';
                                                            break;
                                                        default:
                                                            statusText = status || 'No Appointments';
                                                            statusClass = 'bg-gray-100 text-gray-800';
                                                    }
                                                    return (
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                                            {statusText}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {filteredPatients.length === 0 && !error && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-lg">No patients found.</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {searchQuery ? 'Try adjusting your search criteria.' : 'Patients will appear here once they book appointments with verified doctors.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
export default PatientSearch;