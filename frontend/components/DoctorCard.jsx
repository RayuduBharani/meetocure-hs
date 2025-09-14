/* eslint-disable react/prop-types */
import React from "react";

const DoctorCard = ({ doctor, onVerify, onReject, showActions = false }) => {
  const isVerified = doctor?.registrationStatus?.toLowerCase() === "verified";

  return (
    <div className="border p-4 rounded shadow">
      <h2 className="font-bold text-lg">{doctor.name}</h2>
      <p>{doctor.specialty}</p>
      <p className="text-sm text-gray-500">
        Status:{" "}
        <span className={isVerified ? "text-green-600" : "text-red-600"}>
          {doctor.registrationStatus}
        </span>
      </p>
      {showActions && (
        <div className="mt-2 space-x-2">
          <button
            onClick={() => onVerify(doctor._id)}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Verify
          </button>
          <button
            onClick={() => onReject(doctor._id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorCard;
