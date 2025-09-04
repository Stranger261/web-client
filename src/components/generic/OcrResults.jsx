const OcrResults = ({ data }) => {
  if (!data) return null;
  return (
    <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">OCR Results</h2>
      <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default OcrResults;
