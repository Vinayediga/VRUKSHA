import React from 'react'
import { Link } from 'react-router-dom'

const FeaturedPlants = () => {
  const plants = [
    { id: 1, name: "Plant 1", players: "100 Players" },
    { id: 2, name: "Plant 2", players: "150 Players" },
    { id: 3, name: "Plant 3", players: "120 Players" },
  ]

  return (
    <section className="p-6 bg-gray-50">
      <h3 className="text-3xl font-bold mb-8 text-center text-green-900">Featured Plants</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <Link key={plant.id} to={`/plants/${plant.id}`}>
            <div className="relative overflow-hidden rounded-2xl shadow-2xl transform transition duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group">
              {/* Image */}
              <img
                src="/plants.png"
                alt={plant.name}
                className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 text-white">
                <h4 className="text-xl font-semibold">{plant.name}</h4>
                <p className="text-sm">{plant.players}</p>
                <button className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition">
                  Buy Your Plant
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FeaturedPlants
