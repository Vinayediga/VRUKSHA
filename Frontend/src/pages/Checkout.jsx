import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1/users";

// Helper function to safely parse JSON responses
const parseJSONResponse = async (res) => {
  const contentType = res.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  } else {
    // If not JSON, try to extract error message from HTML
    const text = await res.text();
    console.error("Non-JSON response:", text);
    
    // Try to extract error message from HTML error page
    // Match patterns like "Error: Coupon is already used or expired."
    const errorMatch = text.match(/Error:\s*([^<\.]+(?:\.[^<]*)?)/i) || 
                       text.match(/<pre>Error:\s*([^<]+)/i) ||
                       text.match(/<pre>([^<]+)/i);
    
    let errorMessage = null;
    if (errorMatch) {
      errorMessage = errorMatch[1]
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim();
    }
    
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    
    throw new Error(`Server error: ${res.status} ${res.statusText}`);
  }
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plant } = location.state || {};

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    paymentMethod: "UPI",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!plant) {
    return (
      <div className="text-center text-red-600 mt-20 text-xl">
        No plant selected for checkout.
      </div>
    );
  }

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Unable to load Razorpay SDK."));
      document.body.appendChild(script);
    });

  const basePrice = Number(plant.price);
  const discountAmount = appliedCoupon
    ? Number(((appliedCoupon.discountPercent / 100) * basePrice).toFixed(2))
    : 0;
  const finalAmount = Math.max(0, Number((basePrice - discountAmount).toFixed(2)));

  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toDateString();
  };

  const recordOrder = async (paymentId, method) => {
    const payload = {
      plant: {
        id: plant.id,
        name: plant.name,
        type: plant.type,
        price: basePrice,
        imageURL: plant.imageURL,
      },
      payment: {
        paymentId,
        method,
        amount: finalAmount,
        status: method === "COD" ? "pending" : "paid",
      },
      customer: {
        name: form.name,
        email: form.email,
        address: form.address,
      },
      expectedDelivery: getDeliveryDate(),
      couponCode: appliedCoupon?.code || null,
    };

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJSONResponse(res);
    if (!res.ok) {
      throw new Error(data?.message || "Unable to record order.");
    }

    return data.data;
  };

  const startOnlinePayment = async () => {
    try {
      setIsProcessing(true);
      await loadRazorpayScript();

      const orderRes = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: "INR",
          receipt: `plant_${plant.id || "custom"}_${Date.now()}`,
          notes: {
            plantId: plant.id,
            plantName: plant.name,
          },
        }),
      });

      const orderData = await parseJSONResponse(orderRes);
      if (!orderRes.ok) {
        throw new Error(orderData?.message || "Failed to create order.");
      }

      const { order, key } = orderData.data || {};
      if (!order?.id || !key) {
        throw new Error("Invalid order response from server.");
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Vruksha Nursery",
        description: `Purchase - ${plant.name}`,
        image: plant.imageURL,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            const verifyData = await parseJSONResponse(verifyRes);
            if (!verifyRes.ok) {
              throw new Error(verifyData?.message || "Payment verification failed.");
            }

            await recordOrder(response.razorpay_payment_id, "Online");
            toast.success("Payment success! Order placed.");
            navigate("/success", {
              state: {
                plant,
                paymentId: response.razorpay_payment_id,
                amountPaid: finalAmount,
                coupon: appliedCoupon,
              },
            });
          } catch (error) {
            console.error(error);
            toast.error(error.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
        },
        notes: {
          address: form.address,
        },
        theme: {
          color: "#7BB61A",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to start payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!form.name || !form.email || !form.address) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (finalAmount <= 0) {
      toast.error("Final amount must be greater than ₹0.");
      return;
    }

    try {
      if (form.paymentMethod === "COD") {
        const paymentId = "cod_" + Math.random().toString(36).substring(2, 12);
        await recordOrder(paymentId, "COD");
        toast.success("Order placed with Cash on Delivery.");
        navigate("/success", {
          state: {
            plant,
            paymentId,
            amountPaid: finalAmount,
            coupon: appliedCoupon,
          },
        });
        return;
      }

      await startOnlinePayment();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to place order.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf5] flex flex-col items-center py-16 px-4 md:px-20">
      <h2 className="text-2xl md:text-4xl font-extrabold text-[#8B0000] mb-8 md:mb-10 tracking-wide text-center">
        Checkout
      </h2>

      <div className="w-full max-w-5xl bg-[#8B0000] text-white rounded-2xl p-6 md:p-12 shadow-lg flex flex-col md:flex-row gap-8 md:gap-10">
        {/* Product Summary */}
        <div className="md:w-1/2 flex flex-col items-center text-center mb-6 md:mb-0">
          <img
            src={plant.imageURL}
            alt={plant.name}
            className="rounded-xl shadow-lg w-full max-w-xs h-[220px] object-cover mb-6"
          />
          <h3 className="text-2xl font-semibold">{plant.name}</h3>
          <p className="text-lg text-gray-200 mt-2">{plant.type}</p>
          <div className="mt-4 bg-white text-[#8B0000] rounded-xl p-4 w-full shadow-sm">
            <div className="flex justify-between text-sm">
              <span>Original Price</span>
              <span>₹{basePrice.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600 mt-1">
                <span>
                  Coupon ({appliedCoupon.code}) - {appliedCoupon.discountPercent}%
                </span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold mt-3 border-t border-dashed pt-2">
              <span>Payable</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Billing Form */}
        <div className="md:w-1/2 bg-white text-[#8B0000] rounded-xl p-8 shadow-inner">
          <h4 className="text-xl font-bold mb-6 text-center">Billing Details</h4>
          <form className="space-y-5">
            <div>
              <label className="block font-semibold mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleInput}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#7BB61A] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleInput}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#7BB61A] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Delivery Address</label>
              <textarea
                name="address"
                placeholder="Enter your address"
                rows="3"
                value={form.address}
                onChange={handleInput}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#7BB61A] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleInput}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#7BB61A] outline-none"
              >
                <option value="UPI">UPI / Card (Online Payment)</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#7BB61A] outline-none"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                      toast("Coupon removed.");
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={applyingCoupon || !couponInput.trim()}
                    onClick={async () => {
                      try {
                        setApplyingCoupon(true);
                        const res = await fetch(`${API_BASE_URL}/rewards/validate`, {
                          method: "POST",
                          credentials: "include",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ code: couponInput }),
                        });
                        
                        const data = await parseJSONResponse(res);
                        if (!res.ok) {
                          throw new Error(data?.message || `Invalid coupon (${res.status})`);
                        }
                        
                        if (!data.data) {
                          throw new Error("Invalid response from server");
                        }
                        
                        setAppliedCoupon(data.data);
                        toast.success(`Coupon ${data.data.code} applied!`);
                      } catch (error) {
                        console.error("Coupon validation error:", error);
                        // Check if it's a network error
                        if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
                          toast.error("Cannot connect to server. Please check if the backend is running on the correct port.");
                        } else {
                          toast.error(error.message || "Unable to apply coupon.");
                        }
                      } finally {
                        setApplyingCoupon(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-semibold ${
                      applyingCoupon || !couponInput.trim()
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#7BB61A] text-white"
                    }`}
                  >
                    {applyingCoupon ? "Checking..." : "Apply"}
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
              className={`w-full mt-6 font-semibold py-3 rounded-md transition-all duration-300 shadow-md ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#7BB61A] text-white hover:bg-[#6ba014]"
              }`}
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
