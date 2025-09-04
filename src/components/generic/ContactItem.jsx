import React from 'react';

const ContactItem = ({ iconClass, title, text }) => (
  <div className="flex items-start space-x-4">
    <i className={`${iconClass} text-[#172554] text-2xl mt-1`}></i>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {Array.isArray(text) ? (
        text.map((line, index) => (
          <p key={index} className="text-gray-600">
            {line}
          </p>
        ))
      ) : (
        <p className="text-gray-600">{text}</p>
      )}
    </div>
  </div>
);

export default ContactItem;
