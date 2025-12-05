import React from "react";
import { useNavigate } from "react-router-dom";

const FeaturedPlants = () => {
  const navigate = useNavigate();

  const handleBuyClick = (event, plantId) => {
    event.preventDefault();
    event.stopPropagation();

    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    navigate(`/plants/${plantId}`);
  };

  const plants = [
    { id: 1, name: "Peace Lily", type: "Flowering", difficulty: "Easy", value: "$$", price: "159 Rupees", imageURL: "/peacelily.jpg", maxPoints: 50 },
    { id: 2, name: "Areca Palm", type: "Foliage", difficulty: "Medium", value: "$$", price: "199 Rupees", imageURL: "/Arecapalm.webp", maxPoints: 60 },
    { id: 3, name: "Aloe Vera", type: "Succulents", difficulty: "Easy", value: "$", price: "99 Rupees", imageURL: "/AloveVera.jpeg", maxPoints: 40 },
   
    
  ];

  return (
    <section className="px-4 sm:px-6 py-8 bg-gray-50">
      <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-green-900">
        Featured Plants
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <div
            key={plant.id}
            className="relative overflow-hidden rounded-2xl shadow-2xl transform transition duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group"
            onClick={() => navigate(`/plants/${plant.id}`)}
          >
              {/* Image */}
              <img
                src={plant.imageURL}
                alt={plant.name}
                className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white">
                <h4 className="text-xl font-semibold">{plant.name}</h4>
                <p className="text-sm">{plant.players}</p>
                <button
                  className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
                  onClick={(e) => handleBuyClick(e, plant.id)}
                >
                  Buy Your Plant
                </button>
              </div>
            </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPlants
