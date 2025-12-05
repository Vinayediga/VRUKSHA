import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SuccessPage from "./pages/successpage";
import MyOrders from "./pages/Myorders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Plant from "./pages/Plant";
import Leaderboard from "./pages/Leaderboard";
import DashboardContent from "./pages/Dashboard";
import CheckoutPage from "./pages/Checkout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/Signup";
import { Toaster } from "react-hot-toast";

// Simple auth guard based on localStorage flag set after login/signup
const RequireAuth = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    // Redirect to signin and remember where the user was trying to go
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
     <Toaster position="top-right" />
      <Router>
        {/* Navbar always at the top */}
        <Navbar />

        {/* Page content changes depending on route */}
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/plants/:id" element={<Plant />} />
            <Route path="/Leaderboard" element={<Leaderboard />} />
            {/* Protected routes */}
            <Route
              path="/Dashboard"
              element={
                <RequireAuth>
                  <DashboardContent />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <MyOrders />
                </RequireAuth>
              }
            />
            {/* Public auth and utility routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/success" element={<SuccessPage />} />

          </Routes>
        </main>

        {/* Footer always at the bottom */}
        <Footer />
      </Router>
    </>
  );
}

export default App;
