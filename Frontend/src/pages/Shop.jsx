import React, { useState } from "react";
import FilterBar from "../components/FilterBar";
import PlantCard from "../components/Plantcard";
import { Link } from "react-router-dom";

const Shop = () => {
  const [filters, setFilters] = useState({});

  const plants = [
    { id: 1, name: "Peace Lily", type: "Flowering", difficulty: "Easy", value: "$$", price: "159 Rupees", imageURL: "/peacelily.jpg", maxPoints: 50 },
    { id: 2, name: "Areca Palm", type: "Foliage", difficulty: "Medium", value: "$$", price: "199 Rupees", imageURL: "/Arecapalm.webp", maxPoints: 60 },
    { id: 3, name: "Aloe Vera", type: "Succulents", difficulty: "Easy", value: "$", price: "99 Rupees", imageURL: "/AloveVera.jpeg", maxPoints: 40 },
    { id: 4, name: "Jade Plant", type: "Succulents", difficulty: "Medium", value: "$$", price: "179 Rupees", imageURL: "/Jadeplant.webp", maxPoints: 55 },
    { id: 5, name: "Snake Plant", type: "Foliage", difficulty: "Easy", value: "$", price: "129 Rupees", imageURL: "Snakeplant.webp", maxPoints: 45 },
    { id: 6, name: "Orchid", type: "Flowering", difficulty: "Hard", value: "$$$", price: "249 Rupees", imageURL: "orchidPlant.webp", maxPoints: 70 },
    { id: 7, name: "Money Plant", type: "Foliage", difficulty: "Easy", value: "$", price: "149 Rupees", imageURL: "MoneyPlant.webp", maxPoints: 50 },
    { id: 8, name: "Cactus", type: "Succulents", difficulty: "Hard", value: "$$", price: "189 Rupees", imageURL: "cactus plant.webp", maxPoints: 65 },
  ];

  // 🌿 Convert "159 Rupees" → 159
  const parsePrice = (price) => parseInt(price.replace(/\D/g, ""), 10);

  // ✅ Improved filtering
const filteredPlants = plants.filter((plant) => {
  const matchesType = !filters.plantType || plant.type === filters.plantType;
  const matchesDifficulty = !filters.difficulty || plant.difficulty === filters.difficulty;

  // 🪴 Price filter (numeric range)
  const plantPrice = parseInt(plant.price.replace(/\D/g, ""), 10);
  let matchesPrice = true;

  if (filters.price === "Below ₹150") {
    matchesPrice = plantPrice < 150;
  } else if (filters.price === "₹150 - ₹200") {
    matchesPrice = plantPrice >= 150 && plantPrice <= 200;
  } else if (filters.price === "Above ₹200") {
    matchesPrice = plantPrice > 200;
  }

  // 🌿 Points filter (numeric range)
  const plantPoints = plant.maxPoints;
  let matchesPoints = true;

  if (filters.points === "Below 50") {
    matchesPoints = plantPoints < 50;
  } else if (filters.points === "50 - 60") {
    matchesPoints = plantPoints >= 50 && plantPoints <= 60;
  } else if (filters.points === "Above 60") {
    matchesPoints = plantPoints > 60;
  }

  return matchesType && matchesDifficulty && matchesPrice && matchesPoints;
});


  return (
    <div className="px-4 sm:px-0">
      <main className="flex-8 mt-28">
        {/* 🌼 Filter Bar */}
        <FilterBar onFilterChange={setFilters} />

        {/* 🪴 Plant Cards */}
        <div className="w-[90%] mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlants.length > 0 ? (
            filteredPlants.map((plant) => (
              <Link key={plant.id} to={`/plants/${plant.id}`}>
                <PlantCard
                  id={plant.id}
                  name={plant.name}
                  players={plant.price}
                  imageURL={plant.imageURL}
                  maxPoints={plant.maxPoints}
                />
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              No plants match the selected filters 🌱
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Shop;
