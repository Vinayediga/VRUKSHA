import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1/users";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch orders.");
        }
        setOrders(data.data || []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading your orders...
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg sm:text-xl text-gray-700 px-4 text-center">
        No orders found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] px-4 sm:px-6 md:px-8 py-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#8B0000] mb-6 sm:mb-8 text-center">
        My Orders
      </h2>

      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <img
                src={order.plant?.imageURL}
                alt={order.plant?.name}
                className="w-full sm:w-40 h-40 object-cover rounded-lg shadow"
              />

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#8B0000]">
                    {order.plant?.name}
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-700 mt-1 text-sm sm:text-base break-words">
                  Payment ID:{" "}
                  <span className="text-xs sm:text-sm">
                    {order.payment?.paymentId}
                  </span>
                </p>

                <p className="text-gray-700 mt-1 font-semibold text-sm sm:text-base">
                  Amount Paid: ₹
                  {order.finalAmount?.toFixed(2) ?? order.payment?.amount}
                </p>

                {order.coupon && (
                  <p className="text-xs sm:text-sm text-green-700 mt-1">
                    Coupon {order.coupon.code} (-{order.coupon.discountPercent}%
                    {" | "}
                    ₹{order.coupon.discountAmount?.toFixed(2)})
                  </p>
                )}

                <p className="text-gray-700 mt-1 text-sm sm:text-base">
                  Payment Method: {order.payment?.method}
                </p>

                <p className="text-green-700 mt-2 font-semibold text-sm sm:text-base">
                  Expected Delivery: {order.expectedDelivery}
                </p>

                <p className="text-gray-600 mt-2 text-xs sm:text-sm">
                  Deliver to: {order.customer?.name} ({order.customer?.address})
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
