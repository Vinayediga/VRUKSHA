import React from "react";

const Leaderboard = () => {
  const players = [
    { name: "Arjun", streak: 45, points: 980 },
    { name: "Meera", streak: 42, points: 950 },
    { name: "Ravi", streak: 38, points: 870 },
    { name: "Kiran", streak: 38, points: 890 },
    { name: "Divya", streak: 30, points: 760 },
    { name: "Sneha", streak: 27, points: 720 },
    { name: "Vikram", streak: 25, points: 710 },
    { name: "Nisha", streak: 22, points: 690 },
    { name: "Rohit", streak: 20, points: 680 },
    { name: "Aditi", streak: 18, points: 640 },
    { name: "Sachin", streak: 16, points: 610 },
    { name: "Priya", streak: 15, points: 590 },
  ];

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.streak === a.streak) return b.points - a.points;
    return b.streak - a.streak;
  });

  return (
    <main className="min-h-[calc(100vh-6rem)] flex flex-col items-center bg-[#fffaf5] px-4 py-10">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-[#8B0000] mb-6 tracking-wide text-center md:text-left">
          LEADERBOARD
        </h1>

        {/* Table container */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#8B0000]/20 overflow-hidden">
          <div className="p-2 sm:p-4">
            <table className="w-full text-sm sm:text-base border-collapse">
              <thead>
                <tr className="bg-[#8B0000] text-white text-xs sm:text-sm">
                  <th className="py-2 px-2 sm:px-4 text-left">RANK</th>
                  <th className="py-2 px-2 sm:px-4 text-left">NAME</th>
                  <th className="py-2 px-2 sm:px-4 text-left hidden xs:table-cell">
                    STREAK
                  </th>
                  <th className="py-2 px-2 sm:px-4 text-left">POINTS</th>
                </tr>
              </thead>

              <tbody>
                {sortedPlayers.map((p, i) => {
                  const rankClass =
                    i === 0
                      ? "text-yellow-500 font-bold"
                      : i === 1
                      ? "text-gray-300 font-bold"
                      : i === 2
                      ? "text-orange-400 font-bold"
                      : "text-[#8B0000]";

                  return (
                    <tr
                      key={p.name + i}
                      className="bg-white even:bg-[#fffaf5] hover:bg-[#8B0000]/5 transition-all duration-200 animate-rowFadeUp"
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <td className={`py-2 px-2 sm:px-4 ${rankClass}`}>
                        {i + 1}
                      </td>
                      <td className="py-2 px-2 sm:px-4 text-gray-800 truncate max-w-[120px] sm:max-w-none">
                        {p.name}
                      </td>
                      <td className="py-2 px-2 sm:px-4 text-green-700 font-medium hidden xs:table-cell">
                        {p.streak}d
                      </td>
                      <td className="py-2 px-2 sm:px-4 text-[#8B0000] font-semibold">
                        {p.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes rowFadeUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-rowFadeUp {
          animation: rowFadeUp 0.3s ease forwards;
        }

        @media (max-width: 480px) {
          table th, table td {
            padding: 6px 8px;
          }
          th:nth-child(3), td:nth-child(3) {
            display: none;
          }
        }
      `}</style>
    </main>
  );
};

export default Leaderboard;
