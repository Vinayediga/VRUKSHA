import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plant, paymentId, amountPaid, coupon } = location.state || {};

  if (!plant || !paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-700">
        Invalid payment details. No data received.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] flex flex-col items-center py-20 px-6">
      
      <h2 className="text-4xl font-extrabold text-[#7BB61A] mb-6 tracking-wide">
        Payment Successful
      </h2>

      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full p-10 text-center border border-gray-200">

        <h3 className="text-2xl font-semibold text-[#8B0000]">
          Thank you for your purchase!
        </h3>

        <p className="text-gray-700 mt-3">
          Your order has been successfully placed and is being processed.
        </p>

        <div className="mt-8 space-y-4 text-left">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">Product:</p>
            <p>{plant.name}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">Amount Paid:</p>
            <p>₹{(typeof amountPaid === "number" ? amountPaid : Number(plant.price)).toFixed(2)}</p>
          </div>

          {coupon && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">Coupon Applied:</p>
              <p>
                {coupon.code} - {coupon.discountPercent}% OFF
              </p>
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">Payment ID:</p>
            <p className="text-sm break-all text-gray-700">{paymentId}</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-10 bg-[#7BB61A] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#6ba014] transition-all shadow-md"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
