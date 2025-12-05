import React, { useState } from "react";

const UploadPopup = ({ onClose }) => {
  const [plantName, setPlantName] = useState("");
  const [file, setFile] = useState(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      {/* Popup container */}
      <div className="bg-[#8B0000] text-white rounded-2xl shadow-2xl w-[90%] max-w-md p-8 relative animate-fadeIn">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-200 transition"
        >
          ×
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-bold mb-6 tracking-wide text-center">
          UPLOAD PLANT IMAGE
        </h2>

        {/* Form content */}
        <form className="space-y-6">
          {/* Plant name input */}
          <div>
            <label className="block text-sm font-semibold mb-2 tracking-wide">
              PLANT NAME
            </label>
            <input
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Enter plant name"
              className="w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7BB61A]"
            />
          </div>

          {/* Upload image input */}
          <div>
            <label className="block text-sm font-semibold mb-2 tracking-wide">
              UPLOAD IMAGE
            </label>
            <div className="flex items-center gap-3">
              <label className="bg-[#7BB61A] hover:bg-[#6ba014] cursor-pointer text-white font-semibold px-4 py-2 rounded-md transition-all duration-200">
                FILE BROWSER
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              {file && (
                <p className="text-sm text-gray-200 truncate max-w-[150px]">
                  {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Upload button */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => {
                if (plantName && file) alert("File uploaded successfully!");
              }}
              className="bg-[#7BB61A] hover:bg-[#6ba014] text-white font-semibold px-8 py-2 rounded-md transition duration-200 shadow-md"
            >
              UPLOAD
            </button>
          </div>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UploadPopup;
