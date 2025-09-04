import { useState } from 'react';

const UploadScanner = ({ onFile }) => {
  const [preview, setPreview] = useState('');

  const onChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      // call parent with both file and preview (to mimic camera capture)
      onFile(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          className="block text-gray-700 text-sm font-semibold mb-2"
          htmlFor="file-upload"
        >
          Choose Image to Upload
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={onChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {preview && (
        <div className="mb-2 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Image Preview
          </h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden max-w-lg">
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadScanner;
