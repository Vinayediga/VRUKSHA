import React, { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1/users";

const UploadPopup = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [plantName, setPlantName] = useState("");
  const [confirmRules, setConfirmRules] = useState(false);
  const [status, setStatus] = useState("");

  // Get user location when popup opens
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setStatus("⚠️ Please enable location to verify upload authenticity.")
      );
    }
  }, []);

  // Handle file select + preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);

      // constrain preview dimensions to avoid stretching
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 400; // keep preview manageable
          let { width, height } = img;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          setPreview(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(selected);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return alert("Please select an image.");
    if (!confirmRules) return alert("Please confirm the photo rules.");
    if (!plantName.trim()) return alert("Please enter the plant name.");

    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", plantName.trim());
    formData.append("lat", location.lat);
    formData.append("lng", location.lng);

    try {
      const res = await fetch(`${API_BASE_URL}/upload-plant`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      console.log("Upload response:", { status: res.status, data });

      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }
      setStatus(
        `✅ Upload successful: ${
          data?.points !== undefined
            ? `${data.points} points awarded`
            : data?.message || "Growth recorded!"
        }`
      );
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
        >
          ×
        </button>

        <h2 className="text-[#8B0000] text-2xl font-bold mb-4 text-center">
          Upload Plant Image
        </h2>

        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <p>📸 Use a white or light background.</p>
          <p>🌿 Only one plant in the photo.</p>
          <p>☀️ Take under natural lighting.</p>
          <p>📍 Location access required for verification.</p>
        </div>

        {preview && (
          <div className="w-full mb-4 rounded-lg overflow-hidden bg-gray-50">
            <img
              src={preview}
              alt="Preview"
              className="block max-h-80 w-full object-contain mx-auto"
            />
          </div>
        )}

        <input
          type="text"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="Enter plant name"
          className="block w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full mb-3 text-gray-700 border border-gray-300 rounded-md cursor-pointer"
        />

        <label className="flex items-center gap-2 mb-4 text-sm">
          <input
            type="checkbox"
            checked={confirmRules}
            onChange={() => setConfirmRules(!confirmRules)}
          />
          <span>I confirm that I followed the photo rules.</span>
        </label>

        <button
          onClick={handleUpload}
          className="w-full bg-[#7BB61A] text-white font-semibold py-2 rounded-md hover:bg-[#6ba014] transition"
        >
          Submit
        </button>

        {status && <p className="mt-3 text-center text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
};

export default UploadPopup;
