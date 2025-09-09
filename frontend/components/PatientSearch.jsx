import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { AppointmentHistoryItem } from './AppointmentHistoryItem';
import { Header } from './Header';
import { UserCircleIcon } from './icons/Icons';

const AppointmentDetailModal = ({ appointment, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Appointment Details</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-semibold text-gray-800">{appointment.doctor.name} ({appointment.doctor.specialty})</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-semibold text-gray-800">{appointment.date} at {appointment.time}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800">{appointment.status}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">{appointment.details || 'No additional details available.'}</p>
                </div>
            </div>
            <div className="mt-6 text-right">
                <button
                    onClick={onClose}
                    className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                    Close
                </button>
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
        const doc = new jsPDF();
        const tableColumn = ["Name", "Gender", "Phone", "Date of Birth"];
        const tableRows = filteredPatients.map(patient => [
            patient.name,
            patient.gender,
            patient.phone,
            patient.dateOfBirth
        ]);
        autoTable(doc, { head: [tableColumn], body: tableRows });
        doc.save("patients.pdf");
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    // Fetch patients who booked appointments to verified doctors for the hospital
    useEffect(() => {
        const hospitalName = localStorage.getItem('hospitalName') || '';
        fetch(`/api/patients?hospitalName=${encodeURIComponent(hospitalName)}`)
            .then((res) => res.json())
            .then((data) => {
                setPatients(data);
                setFilteredPatients(data);
            })
            .catch((err) => console.error("Error fetching patients:", err));
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
                    p.name.toLowerCase().includes(query) ||
                    p.patientId.toLowerCase().includes(query) ||
                    p.phone.includes(query)
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
                                {selectedPatient.appointments.length > 0 ? selectedPatient.appointments.map(app => (
                                    <AppointmentHistoryItem key={app.id} appointment={app} onViewDetails={handleViewAppointmentDetails} />
                                )) : <p className="text-gray-500 p-4 text-center">No appointment history found for this patient.</p>}
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
                        <button
                            onClick={handleDownloadPDF}
                            className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-650 transition-colors duration-200"
                        >
                            Download PDF
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-40 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Gender</th>
                                    <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Date of Birth</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.map(patient => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-40 py-4 whitespace-nowrap flex items-center gap-3 w-1/2">
                                            <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                            <span className="font-medium text-gray-800">{patient.name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 w-1/6">{patient.gender}</td>
                                        <td className="px-10 py-4 whitespace-nowrap text-gray-600 w-1/6">{patient.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 w-1/6">{patient.dateOfBirth}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPatients.length === 0 && (
                            <div className="text-center text-gray-500 py-8">No patients found.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
