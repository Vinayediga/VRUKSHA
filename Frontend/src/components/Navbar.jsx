import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
   
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="fixed top-0 w-full z-50 flex justify-center">
      <nav
        className={`w-[90%] mt-4 rounded-2xl transition-all duration-500 ${
          scrolled ? "bg-[#8B4513] shadow-xl" : "bg-[#A0522D]"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <h1 className="text-white font-extrabold text-2xl tracking-wide">
            Ruksha
          </h1>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-10 text-white font-medium">
            {links.map(({ name, path }) => (
              <li key={name} className="relative">
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `cursor-pointer transition-all duration-300 hover:scale-110 ${
                      isActive ? "text-green-400 font-bold" : ""
                    }`
                  }
                >
                  {name}
                </NavLink>
                <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-green-400 transition-all duration-300 group-hover:w-full"></span>
              </li>
            ))}
          </ul>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✖" : "☰"}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden px-8 py-4 space-y-4 text-white font-medium bg-[#8B4513] rounded-b-2xl">
            {links.map(({ name, path }) => (
              <NavLink
                key={name}
                to={path}
                onClick={() => setMenuOpen(false)} // closes menu after click
                className={({ isActive }) =>
                  `block cursor-pointer hover:text-green-400 transition-colors duration-300 ${
                    isActive ? "text-green-400 font-bold" : ""
                  }`
                }
              >
                {name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
