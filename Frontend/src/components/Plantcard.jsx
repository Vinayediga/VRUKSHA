import React from "react";
import { Link } from "react-router-dom";
 // adjust path to your asset

const PlantCard = ({ name, players }) => {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-2xl transform transition duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group"
    >
      {/* Image */}
      <img
        src='./plants.png'
        alt={name}
        className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white">
        <h4 className="text-xl font-semibold">{name}</h4>
        <p className="text-sm">{players}</p>
        <button className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition">
          Buy Your Plant
        </button>
      </div>
    </div>
  );
};

export default PlantCard;
