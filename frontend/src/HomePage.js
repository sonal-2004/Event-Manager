import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const gatheringPhotos = [
  "/images/event1.jpg", "/images/event2.jpg", "/images/event3.jpg",
  "/images/event4.jpg", "/images/event5.jpg", "/images/event6.jpg",
  "/images/event7.JPG", "/images/event8.JPG", "/images/event9.JPG",
];

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold">Campus Events</div>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="hover:text-indigo-200 font-medium">Home</Link>
              <Link to="/event" className="hover:text-indigo-200 font-medium">Events</Link>
              <Link to="/club" className="hover:text-indigo-200 font-medium">Clubs</Link>
              <Link to="/login" className="hover:text-indigo-200 font-medium">Login</Link>
            </div>
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link to="/" className="block hover:text-indigo-200">Home</Link>
              <Link to="/event" className="block hover:text-indigo-200">Events</Link>
              <Link to="/club" className="block hover:text-indigo-200">Clubs</Link>
              <Link to="/login" className="block hover:text-indigo-200">Login</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 overflow-hidden">
        {Array.from({ length: 25 }).map((_, index) => (
          <img
            key={index}
            src="/assets/sparkling.png"
            alt="Sparkle"
            className="absolute w-4 h-4 sparkle pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        <div className="relative z-10 text-center px-4 sm:px-10">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            MITAOE’s<br />
            <span className="text-yellow-400">Campus Events</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl">Discover amazing events, connect with clubs, and make unforgettable memories.</p>
          <p className="mt-2 text-base sm:text-xl">Your gateway to an incredible college experience starts here.</p>
        </div>
      </div>

      {/* How It Works */}
    {/* How It Works */}
<section className="pt-12 pb-12 text-center px-4">
  <div className="max-w-5xl mx-auto">
    <img src="/assets/calender.png" alt="Calendar Icon" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" />
    <h2 className="text-3xl sm:text-4xl font-bold text-purple-700 mb-4">How It Works</h2>
    <p className="text-gray-600 mb-10 text-base sm:text-lg">
      Getting involved in campus life is easy. Follow these simple steps to start your journey.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {/* Discover Events */}
      <Link to="/event" className="bg-white border rounded-lg shadow-lg shadow-purple-300 p-6 sm:p-8 w-full max-w-xs mx-auto hover:shadow-xl transition-all">
        <div className="text-purple-600 text-3xl sm:text-4xl mb-4">📅</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Discover Events</h3>
        <p className="text-gray-600 text-sm sm:text-base">Browse through a variety of events happening across campus.</p>
      </Link>

      {/* Register for Events */}
      <Link to="/event" className="bg-white border rounded-lg shadow-lg shadow-purple-300 p-6 sm:p-8 w-full max-w-xs mx-auto hover:shadow-xl transition-all">
        <div className="text-purple-600 text-3xl sm:text-4xl mb-4">👥</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Register for Events</h3>
        <p className="text-gray-600 text-sm sm:text-base">Sign up and track your registrations with reminders.</p>
      </Link>

      {/* Explore Clubs */}
      <Link to="/club" className="bg-white border rounded-lg shadow-lg shadow-purple-300 p-6 sm:p-8 w-full max-w-xs mx-auto hover:shadow-xl transition-all">
        <div className="text-purple-600 text-3xl sm:text-4xl mb-4">⭐</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Explore Clubs</h3>
        <p className="text-gray-600 text-sm sm:text-base">Learn about clubs and their upcoming activities.</p>
      </Link>
    </div>
  </div>
</section>


      {/* Event Gallery */}
      <section className="pt-8 pb-16 bg-gray-50 px-4 sm:px-8 md:px-24">
        <div className="text-center mb-10">
          <img src="/assets/camera.jpg" alt="Gallery Icon" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-700">Event Gallery</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { src: "/images/firodiya.jpg", label: "Firodiya" },
            { src: "/images/annual-sports.jpg", label: "Annual Sports" },
            { src: "/images/club-event.jpg", label: "Club Event" },
          ].map((img, i) => (
            <div key={i} className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <img src={img.src} alt={img.label} className="w-full h-52 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <h3 className="text-white text-xl font-semibold">{img.label}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nakshatra Section */}
      <section className="relative px-4 sm:px-8 md:px-24 pt-10 pb-6 text-center">
        <img
          src="/assets/mandola.png"
          alt="Mandala Art"
          className="absolute left-10 bottom-0 w-28 sm:w-40 md:w-56 z-0"
          style={{ transform: "translateY(35%)" }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-800">Nakshatra</h2>
          <p className="mt-2 text-base sm:text-lg text-gray-700">Some glimpses of the MITAOE's annual function</p>
        </div>
      </section>

      {/* Gathering Photos */}
      <section className="px-4 sm:px-8 md:px-24 py-10">
        <div className="max-w-7xl mx-auto rounded-xl p-6 bg-yellow-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {gatheringPhotos.map((src, idx) => (
              <div key={idx} className="overflow-hidden rounded-xl shadow-md">
                <img
                  src={src}
                  alt={`College Event ${idx + 1}`}
                  className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-800 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm sm:text-base">
          <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
