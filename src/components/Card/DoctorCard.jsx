import React from 'react';

const DoctorCard = ({ name, specialty, bio }) => (
  <div className="bg-white p-6 rounded-3xl shadow-md text-center">
    <img
      src={`https://placehold.co/150x150/e0f2fe/1e40af?text=${name.substring(
        4,
        5
      )}`}
      alt={name}
      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
    />
    <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
    <p className="text-[#172554] mb-2">{specialty}</p>
    <p className="text-sm text-gray-600">{bio}</p>
  </div>
);

export default DoctorCard;
