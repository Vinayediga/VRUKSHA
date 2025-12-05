import React from "react";
import { useNavigate } from "react-router-dom";

const PlantCard = ({ id, name, players, imageURL, maxPoints }) => {
  const navigate = useNavigate();

  const handleBuyClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    if (id) {
      navigate(`/plants/${id}`);
    } else {
      navigate("/shop");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group">
      {/* Image */}
      <img
        src={imageURL}
        alt={name}
        className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white">
        <h4 className="text-lg sm:text-xl font-semibold">{name}</h4>
        <p className="text-xs sm:text-sm">{players}</p>
        {/* New Max Points Slot */}
        {maxPoints && (
          <p className="text-sm mt-1 text-yellow-300">
            🌿 Max Points: {maxPoints}
          </p>
        )}
        <button
          className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={handleBuyClick}
        >
          Buy Your Plant
        </button>
      </div>
    </div>
  );
};

export default PlantCard;
