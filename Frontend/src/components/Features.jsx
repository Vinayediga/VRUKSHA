import React from 'react'

const Features = () => {
  const features = [
    {
      icon: "🌱",
      text: "Plant it at home, nurture it with care, and watch it grow."
    },
    {
      icon: "📸",
      text: "Take photos of your plant’s growth and upload them to your dashboard."
    },
    {
      icon: "🏆",
      text: "See your streak, earn badges, and climb the leaderboard with friends."
    }
  ]

  return (
    <section className="p-6 bg-gray-50">
      <h3 className="text-3xl font-bold text-center text-green-900 mb-10">Features</h3>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg transform transition duration-500 hover:-translate-y-3 hover:scale-105 hover:shadow-2xl"
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <div className="text-5xl mb-4 animate-bounce">{f.icon}</div>
            <p className="text-gray-700 font-medium text-center">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <button className="bg-green-600 px-8 py-3 text-white font-semibold rounded-full hover:bg-green-700 transition transform hover:scale-105">
          Get Started
        </button>
      </div>
    </section>
  )
}

export default Features
