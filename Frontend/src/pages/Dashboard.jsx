import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PlantCard from "../components/Plantcard";
import UploadPopup from "../components/UploadPopup";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1/users";

const DashboardContent = () => {
  const plants = [
    { id: 1, name: "Peace Lily", type: "Flowering", difficulty: "Easy", price: "159", maxPoints: 80, imageURL: "/peacelily.jpg" },
    { id: 2, name: "Areca Palm", type: "Foliage", difficulty: "Medium", price: "199", maxPoints: 100, imageURL: "/Arecapalm.webp" },
    { id: 3, name: "Aloe Vera", type: "Succulents", difficulty: "Easy", price: "99", maxPoints: 50, imageURL: "/AloveVera.jpeg" },
  ];

  const [showPopup, setShowPopup] = useState(false);
  const [rewardSummary, setRewardSummary] = useState(null);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [claimingReward, setClaimingReward] = useState(null);

  const fetchRewards = async () => {
    try {
      setLoadingRewards(true);
      const res = await fetch(`${API_BASE_URL}/rewards/summary`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to load reward summary.");
      }
      setRewardSummary(data.data);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load rewards.");
    } finally {
      setLoadingRewards(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleClaimCoupon = async (rewardId) => {
    try {
      setClaimingReward(rewardId);
      const res = await fetch(`${API_BASE_URL}/rewards/claim`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Unable to claim coupon.");
      }
      toast.success("Coupon generated!");
      setRewardSummary((prev) => ({
        ...(prev || {}),
        ...data.data.summary,
        coupons: [data.data.coupon, ...(prev?.coupons || [])],
        catalog: prev?.catalog || [],
      }));
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to claim coupon.");
    } finally {
      setClaimingReward(null);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Coupon copied!");
    } catch {
      toast.error("Unable to copy code.");
    }
  };

  return (
    <div className="bg-[#fffaf5] min-h-screen px-4 sm:px-8 md:px-16 py-20 relative overflow-hidden">
      {/* Rewards Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-10 border border-[#f0e0e0]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Total Points Earned
            </p>
            <p className="text-4xl font-bold text-[#8B0000]">
              {loadingRewards ? "--" : rewardSummary?.totalPoints ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Available Points
            </p>
            <p className="text-3xl font-bold text-[#7BB61A]">
              {loadingRewards ? "--" : rewardSummary?.availablePoints ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              Claimed Coupons
            </p>
            <p className="text-2xl font-semibold text-[#8B0000]">
              {loadingRewards ? "--" : rewardSummary?.coupons?.length ?? 0}
            </p>
          </div>
        </div>

        {/* Claim options */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#8B0000] mb-4">
            Claim Coupons
          </h3>
          <div className="flex flex-wrap gap-4">
            {(rewardSummary?.catalog || []).map((option) => {
              const disabled =
                (rewardSummary?.availablePoints ?? 0) < option.pointsCost ||
                claimingReward === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleClaimCoupon(option.id)}
                  disabled={disabled}
                  className={`px-5 py-3 rounded-xl border font-semibold transition ${
                    disabled
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#7BB61A] text-white hover:bg-[#6ba014]"
                  }`}
                >
                  {option.label} ({option.pointsCost} pts)
                </button>
              );
            })}
            {!(rewardSummary?.catalog || []).length && (
              <p className="text-sm text-gray-500">
                {loadingRewards
                  ? "Loading options..."
                  : "No reward options available."}
              </p>
            )}
          </div>
        </div>

        {/* Coupon list */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#8B0000] mb-4">
            My Coupons
          </h3>
          {loadingRewards ? (
            <p className="text-gray-500 text-sm">Loading coupons...</p>
          ) : rewardSummary?.coupons?.length ? (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {rewardSummary.coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="flex items-center justify-between bg-[#fffaf5] border border-dashed border-[#f1c0c0] rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-[#8B0000]">
                      {coupon.code}
                      <span className="ml-2 text-sm text-gray-500">
                        {coupon.discountPercent}% OFF
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Cost: {coupon.pointsCost} pts | Status:{" "}
                      <span className="capitalize">{coupon.status}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="text-sm font-semibold text-[#7BB61A]"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No coupons yet. Earn points by uploading plant progress!
            </p>
          )}
        </div>
      </div>

      {/* Recent Uploads */}
      <h2 className="text-[#8B0000] font-bold text-2xl mb-8 tracking-wide">
        RECENT UPLOADS
      </h2>

      {/* Plant Cards */}
        <div className="flex flex-wrap gap-6 sm:gap-10 mb-12 justify-start">
        {plants.map((plant) => (
          <div key={plant.id} className="w-64">
            <PlantCard
              id={plant.id}
              name={plant.name}
              imageURL={plant.imageURL}
              maxPoints={plant.maxPoints}
            />
          </div>
        ))}
      </div>

      {/* Streak Section */}
      <div className="mb-4">
        <h3 className="text-[#8B0000] font-semibold text-lg">
          CURRENT STREAK <span className="font-normal">0 days</span>
        </h3>
      </div>

      {/* Upload Instruction */}
      <div className="mb-10">
        <h2 className="text-[#8B0000] font-bold text-2xl md:text-3xl leading-snug tracking-wide">
          UPLOAD PLANT IMAGE TO <br /> CONTINUE THE STREAK
        </h2>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => setShowPopup(true)}
        className="bg-[#7BB61A] text-white text-lg font-semibold py-3 px-16 rounded-md hover:bg-[#6ba014] transition duration-200 shadow-md"
      >
        UPLOAD
      </button>

      {/* Upload Popup */}
      {showPopup && <UploadPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default DashboardContent;
