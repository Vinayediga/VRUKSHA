import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";


const filtersData = [
  { id: "plantType", label: "Plant Type", options: ["Flowering", "Foliage", "Succulents"] },
  { id: "difficulty", label: "Difficulty", options: ["Easy", "Medium", "Hard"] },
  { id: "price", label: "Price", options: ["$", "$$", "$$$"] },
];

const FilterBar = () => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const filterBarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterClick = (filterId) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  const handleOptionClick = (filterId, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [filterId]: prev[filterId] === option ? null : option,
    }));
    setActiveFilter(null);
  };

  const clearAllFilters = () => setSelectedOptions({});

  const clearSingleFilter = (filterId, e) => {
    e.stopPropagation();
    setSelectedOptions((prev) => ({
      ...prev,
      [filterId]: null,
    }));
  };

  const isFilterSelected = Object.values(selectedOptions).some(val => val !== null);

  return (
    <div ref={filterBarRef} className="w-[90%] mx-auto mt-2 text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">FILTER BY</h2>

      <div className="flex flex-wrap justify-center gap-3">
        {filtersData.map((filter) => (
          <div key={filter.id} className="relative">
            <button
              onClick={() => handleFilterClick(filter.id)}
              className={`px-5 py-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                selectedOptions[filter.id]
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {selectedOptions[filter.id] || filter.label}
              {selectedOptions[filter.id] && (
                <span
                  className="cursor-pointer font-bold text-white hover:text-gray-200"
                  onClick={(e) => clearSingleFilter(filter.id, e)}
                >
                  ×
                </span>
              )}
           {!selectedOptions[filter.id] && (
  <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-600" />
)}
            </button>

            {activeFilter === filter.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg w-40 z-20 animate-fadeInSlide">
                {filter.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionClick(filter.id, option)}
                    className="block w-full text-left px-3 py-2 rounded-md hover:bg-teal-100 hover:text-teal-800 transition-colors duration-200"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Clear All button comes after filter buttons */}
        {isFilterSelected && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-full shadow hover:bg-red-600 transition duration-300"
          >
            Clear All
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInSlide {
          animation: fadeInSlide 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FilterBar;
