import React from "react";

const Plant = () => {
  const plantImages = [
    { id: 1, src: "/plants.png" },
    { id: 2, src: "/plants.png" },
    { id: 3, src: "/plants.png" },
  ];

  const price = "199 Rupees";

  return (
    <div className="w-[90%] mx-auto mt-24">
      {/* Heading */}
      <h2 className="text-3xl font-extrabold text-red-800 mb-10 text-center relative inline-block">
        PLANT GALLERY
        <span className="block w-16 h-1 bg-green-500 mx-auto mt-2 rounded-full"></span>
      </h2>

      {/* Plant Image Gallery */}
      <div className="flex gap-6 items-center justify-center overflow-x-auto scrollbar-hide pb-4">
        {plantImages.map((img) => (
          <img
            key={img.id}
            src={img.src}
            alt={`Plant view ${img.id}`}
            className="rounded-xl shadow-lg w-[320px] h-[220px] object-cover transform hover:scale-105 transition-transform duration-500"
          />
        ))}
      </div>

      {/* Price + Buy button */}
      <div className="mt-10 flex flex-col items-center space-y-4">
        <p className="text-2xl font-bold text-gray-800">{price}</p>
        <button className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-700 hover:scale-105 transition-all duration-300">
          Buy Now
        </button>
      </div>

      {/* About Plant Section */}
      <div className="mt-16 bg-gradient-to-r from-green-200 via-green-100 to-green-50 rounded-2xl p-10 shadow-lg">
        <h3 className="text-2xl font-semibold text-red-800 mb-4">
          About Plant
        </h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          🌱 Experience the joy of growing your own plants while connecting,
          sharing, and competing with a vibrant community of nature lovers.  
          Caring for plants not only enhances your environment but also brings
          peace, mindfulness, and a sense of accomplishment.
        </p>
      </div>
    </div>
  );
};

export default Plant;
