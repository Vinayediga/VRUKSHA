import React, { useState, useEffect } from "react"

const Footer = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true)
      else setScrolled(false)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = ["Home", "Shop", "Leaderboard", "Dashboard"]

  return (
    <footer
      className={`w-full mx-auto mt-10 transition-all duration-500 shadow-lg ${
        scrolled ? "bg-[#8B4513]" : "bg-[#A0522D]"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 text-white">
        

        {/* Navigation links */}
        <ul className="flex gap-6 mb-4 md:mb-0">
          {navItems.map((item) => (
            <li key={item} className="cursor-pointer hover:text-green-400 transition-colors duration-300">
              {item}
            </li>
          ))}
        </ul>

        <p className="text-center md:text-left">
          © {new Date().getFullYear()} Rooksha. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
