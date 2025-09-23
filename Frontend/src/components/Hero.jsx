import React from 'react'
import { Link } from 'react-router-dom'
const Hero = () => {
  return (
    <section
      className="relative bg-cover bg-center h-[90vh] flex items-center"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content on the left side */}
      <div className="relative px-8 md:px-16 text-left w-full md:w-[50%]">
        <h2 className="text-white text-3xl md:text-4xl font-bold leading-snug">
          Experience the joy of growing your own plants while connecting,
          sharing, and competing with a community of nature lovers.
        </h2>

        {/* Green Button */}
        <Link  to='./shop' >
        <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition">
          Buy Your Plant
        </button>
        </Link>
      </div>
    </section>
  )
}

export default Hero
