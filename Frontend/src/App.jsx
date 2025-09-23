import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Plant from "./pages/Plant";


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        {/* Navbar always at the top */}
        <Navbar />

        {/* Page content changes depending on route */}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
           <Route path="/plants/:id" element={<Plant />} />
          </Routes>
        </main>

        {/* Footer always at the bottom */}
        <Footer />
      </Router>
    </>
  );
}

export default App;
