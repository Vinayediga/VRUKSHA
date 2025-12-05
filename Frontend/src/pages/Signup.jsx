import React, { useState, useRef } from "react";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    Username: "",
    Fullname: "",
    Email: "",
    Password: "",
    Country: "",
    phoneNumber: "",
    AvatarFile: null,
  });

  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        AvatarFile: file,
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("Username", formData.Username);
      form.append("Fullname", formData.Fullname);
      form.append("Email", formData.Email);
      form.append("Password", formData.Password);
      form.append("Country", formData.Country);
      form.append("phoneNumber", formData.phoneNumber);
      form.append("avatar", formData.AvatarFile); // MUST MATCH MULTER FIELD NAME

      const response = await axios.post(
        "http://127.0.0.1:8001/api/v1/users/register",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Registration Successful");
      console.log("Registration Response:", response.data);

      // Mark user as authenticated on the client
      localStorage.setItem("isAuthenticated", "true");

      // Redirect to shop page after successful signup
      window.location.href = "/shop";
    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fffaf5] to-[#ffeae0] px-4">
      <div className="bg-white/40 backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#8B0000] text-center mb-6">
          Create Account
        </h2>

        <form className="space-y-5" onSubmit={handleSignup}>
          {/* USERNAME */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* FULLNAME */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">
              Fullname
            </label>
            <input
              type="text"
              name="Fullname"
              value={formData.Fullname}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* COUNTRY */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">
              Country
            </label>
            <input
              type="text"
              name="Country"
              value={formData.Country}
              onChange={handleChange}
              placeholder="Country"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* PHONE NUMBER */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">
              Phone Number
            </label>
            <input
              type="number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8B0000]/40 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
          </div>

          {/* AVATAR UPLOAD */}
          <div>
            <label className="block text-[#8B0000] font-medium mb-1">
              Avatar
            </label>

            <button
              type="button"
              onClick={() => avatarInputRef.current.click()}
              className="w-full bg-[#8B0000] text-white py-2 rounded-lg font-semibold hover:bg-[#6a0000] transition"
            >
              Upload Avatar
            </button>

            {formData.AvatarFile && (
              <p className="text-sm text-green-700 mt-2">
                Avatar uploaded successfully
              </p>
            )}

            <input
              type="file"
              accept="image/*"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              required
              className="hidden"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-[#7BB61A] text-white font-semibold py-2 rounded-lg hover:bg-[#6da318] transition duration-200 shadow-md"
            disabled={loading}
          >
            {loading ? "Processing..." : "Signup"}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-[#8B0000]">
          Already have an account?{" "}
          <a
            href="/signin"
            className="font-semibold underline hover:text-[#7BB61A] transition"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
