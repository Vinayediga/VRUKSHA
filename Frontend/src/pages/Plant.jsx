import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Plant = () => {
  const { id } = useParams();
  const navigate = useNavigate() // get ID from URL

  const plants = [
    { id: 1, name: "Peace Lily", type: "Flowering", difficulty: "Easy", price: "159", maxPoints: 80, imageURL: "/peacelily.jpg" },
    { id: 2, name: "Areca Palm", type: "Foliage", difficulty: "Medium", price: "199", maxPoints: 100, imageURL: "/Arecapalm.webp" },
    { id: 3, name: "Aloe Vera", type: "Succulents", difficulty: "Easy", price: "99", maxPoints: 50, imageURL: "/AloveVera.jpeg" },
    { id: 4, name: "Jade Plant", type: "Succulents", difficulty: "Medium", price: "179", maxPoints: 90, imageURL: "/Jadeplant.webp" },
    { id: 5, name: "Snake Plant", type: "Foliage", difficulty: "Easy", price: "129", maxPoints: 70, imageURL: "/Snakeplant.webp" },
    { id: 6, name: "Orchid", type: "Flowering", difficulty: "Hard", price: "249", maxPoints: 120, imageURL: "/orchidPlant.webp" },
    { id: 7, name: "Money Plant", type: "Foliage", difficulty: "Easy", price: "149", maxPoints: 75, imageURL: "/MoneyPlant.webp" },
    { id: 8, name: "Cactus", type: "Succulents", difficulty: "Hard", price: "189", maxPoints: 95, imageURL: "/cactus plant.webp" },
  ];

  const plant = plants.find((p) => p.id === Number(id));

  if (!plant) {
    return <div className="text-center mt-20 text-red-600">Plant not found 🌱</div>;
  }

  return (
    <div className="w-[90%] mx-auto mt-24 pb-10">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-red-800 mb-6 sm:mb-10 text-center relative inline-block">
        {plant.name}
        <span className="block w-16 h-1 bg-green-500 mx-auto mt-2 rounded-full"></span>
      </h2>

      {/* Plant Image */}
      <div className="flex items-center justify-center">
        <img
          src={plant.imageURL}
          alt={plant.name}
          className="rounded-xl shadow-lg w-full max-w-md h-[220px] sm:h-[280px] object-cover transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Price + Buy button */}
      <div className="mt-8 sm:mt-10 flex flex-col items-center space-y-4">
        <p className="text-xl sm:text-2xl font-bold text-gray-800">₹{plant.price}</p>
        <button
        onClick={() => navigate("/checkout", { state: { plant } })} 
        className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 hover:scale-105 transition-all duration-300">
          Buy Now
        </button>

        {/* Static Max Points Section */}
        <div className="mt-6 px-6 py-3 bg-gradient-to-r from-green-600 via-green-500 to-green-400 rounded-2xl shadow-md border border-green-300">
          <p className="text-xl font-bold text-white text-center drop-shadow-md">
            🌟 Earn up to{" "}
            <span className="text-3xl text-yellow-200">{plant.maxPoints}</span>{" "}
            Green Points!
          </p>
          <p className="text-sm text-white/90 text-center mt-1 italic">
            Collect points for every care task and grow your 🌿 eco-score.
          </p>
        </div>
      </div>

      {/* About Plant Section */}
      <div className="mt-16 bg-gradient-to-r from-green-200 via-green-100 to-green-50 rounded-2xl p-10 shadow-lg">
        <h3 className="text-2xl font-semibold text-red-800 mb-4">About {plant.name}</h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          🌿 The {plant.name} is a beautiful {plant.type.toLowerCase()} plant that’s known for being
          <strong> {plant.difficulty.toLowerCase()} to care for</strong> and an excellent choice for
          home or office decor. Perfect for bringing life, freshness, and peace to your space.
        </p>
      </div>
    </div>
  );
};

export default Plant;
