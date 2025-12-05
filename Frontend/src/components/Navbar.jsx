import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1/users";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem("isAuthenticated") === "true"
  );

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Keep auth state in sync across tabs/windows
    const handleStorage = (event) => {
      if (event.key === "isAuthenticated") {
        setIsAuthenticated(event.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      setProfileOpen(false);
      setMenuOpen(false);
      navigate("/signin");
    }
  };

  const links = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "My Orders", path: "/orders" },
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
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 md:py-4">
          {/* Logo */}
          <h1 className="text-white font-extrabold text-xl sm:text-2xl tracking-wide">
            Vruksha
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

          {/* Desktop Auth/Profile controls */}
          <div className="hidden md:flex items-center gap-4 text-white">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-green-700 px-3 py-2 rounded-full hover:bg-green-600 transition"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-green-700 font-bold">
                    U
                  </span>
                  <span className="text-sm font-semibold">Profile</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-lg py-2 text-sm">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/dashboard");
                      }}
                    >
                      Dashboard
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className="px-4 py-2 border border-white rounded-full text-sm font-semibold hover:bg-white hover:text-[#A0522D] transition"
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </button>
                <button
                  className="px-4 py-2 bg-green-600 rounded-full text-sm font-semibold hover:bg-green-500 transition"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

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

            {/* Mobile auth/profile controls */}
            <div className="pt-4 border-t border-white/20 space-y-2">
              {isAuthenticated ? (
                <>
                  <button
                    className="w-full text-left px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/dashboard");
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-md bg-red-600 hover:bg-red-500 text-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full text-left px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/signin");
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-md bg-green-600 hover:bg-green-500 text-sm"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/signup");
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
