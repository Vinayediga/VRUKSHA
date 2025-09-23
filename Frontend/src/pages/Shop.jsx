import React from 'react'
import FilterBar from '../components/FilterBar';
import PlantCard from '../components/Plantcard';

import { Link } from "react-router-dom";

const Shop = () => {

    const plants = [
    { id: 1, name: "Plant 1", players: "159 Rupees" },
    { id: 2, name: "Plant 2", players: "199 Rupees" },
    { id: 3, name: "Plant 3", players: "249 Rupees" },
    { id: 4, name: "Plant 4", players: "99 Rupees" },
    { id: 5, name: "Plant 5", players: "129 Rupees" },
    { id: 6, name: "Plant 6", players: "179 Rupees" },
  ];

  return (

    <div>
       <main className="flex-8 mt-28">
        <FilterBar  />
        <div className="w-[90%] mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {plants.map((plant) => (
            <Link key={plant.id} to={`/plants/${plant.id}`}>
            <PlantCard key={plant.id} name={plant.name} players={plant.players} />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Shop
