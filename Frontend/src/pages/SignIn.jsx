import React, { useState } from "react";
import axios from "axios";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8001/api/v1/users/login",
        {
          Email: email,
          Password: password,
        },
        { withCredentials: true }
      );

      alert("Login Successful");
      console.log("Login Response:", response.data);

      // Mark user as authenticated on the client
      localStorage.setItem("isAuthenticated", "true");

      // Redirect to shop page after successful login
      window.location.href = "/shop";

    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] to-[#ffeae0] px-4">
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#8B0000] text-center mb-6">
          Welcome Back 👋
        </h2>

        <form className="space-y-5" onSubmit={handleLogin}>
          
          {/* EMAIL */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#7BB61A] text-white font-semibold py-2 rounded-lg hover:bg-[#6da318] transition duration-200 shadow-md"
            disabled={loading}
          >
            {loading ? "Processing..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center justify-center mt-6">
          <div className="h-[1px] w-16 bg-gray-300"></div>
          <span className="mx-3 text-gray-500 text-sm">or</span>
          <div className="h-[1px] w-16 bg-gray-300"></div>
        </div>

        {/* GOOGLE SIGN-IN */}
        <button
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-[#8B0000] font-semibold py-2 border border-[#8B0000]/40 rounded-lg hover:bg-[#8B0000] hover:text-white transition duration-200 shadow-sm text-sm sm:text-base"
          type="button"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <p className="text-center text-sm mt-5 text-[#8B0000]">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="font-semibold underline hover:text-[#7BB61A] transition"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
