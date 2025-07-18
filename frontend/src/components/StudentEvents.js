import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;

const StudentEvents = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [filters, setFilters] = useState({ sortBy: '' });

  useEffect(() => {
    fetchUser();
  }, []);

 useEffect(() => {
  if (user?.role === "student") {
    fetchAllData();
  }
}, [user]);


  useEffect(() => {
    filterEvents();
  }, [activeTab, filters, events, registeredEvents]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  const fetchAllData = async () => {
    try {
      const [eventRes, registeredRes] = await Promise.all([
        axios.get('/api/events/all'),
        user ? axios.get('/api/events/registered') : Promise.resolve({ data: [] }),
      ]);

      console.log('Fetched events:', eventRes.data); // Debug log
      setEvents(eventRes.data);
      setRegisteredEvents(registeredRes.data.map(ev => ev.id));
    } catch (err) {
      console.error('Error loading data', err);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const authCheck = await axios.get('/api/auth/user');
      if (!authCheck.data || authCheck.data.role !== 'student') {
        window.location.href = `/login?redirect=/student/events`;
        return;
      }

      await axios.post(`/api/events/register/${eventId}`);
      await fetchAllData();
      alert('Successfully registered!');
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = `/login?redirect=/student/events`;
      } else {
        alert(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  const filterEvents = () => {
    const today = new Date();
    let result = [...events];

    if (activeTab === 'Upcoming') {
      result = result.filter(e => {
        const eventDate = new Date(e.date);
        return !isNaN(eventDate) && eventDate >= today;
      });
    } else if (activeTab === 'Past') {
      result = result.filter(e => {
        const eventDate = new Date(e.date);
        return !isNaN(eventDate) && eventDate < today;
      });
    } else if (activeTab === 'Registered') {
      result = result.filter(e => registeredEvents.includes(e.id));
    }

    if (filters.sortBy === 'Date') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filters.sortBy === 'Time') {
      result.sort((a, b) => a.time.localeCompare(b.time));
    } else if (filters.sortBy === 'Club') {
      result.sort((a, b) => a.club_name.localeCompare(b.club_name));
    } else if (filters.sortBy === 'Type') {
      result.sort((a, b) => a.event_type.localeCompare(b.event_type));
    }

    setFilteredEvents(result);
  };

  const renderEventCard = (event) => {
    const isRegistered = registeredEvents.includes(event.id);
    const isPast = new Date(event.date) < new Date();

    return (
      <div
        key={event.id}
        className="bg-white rounded-lg shadow-lg shadow-purple-300 p-4 max-w-sm mx-auto flex flex-col hover:shadow-xl transition"
      >
        {event.poster && (
          <img
            src={event.poster}
            alt="Poster"
            className="rounded max-h-60 w-full object-cover mb-3"
          />
        )}
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p>📅 {new Date(event.date).toLocaleDateString()} | 🕒 {event.time}</p>
        <p className="text-sm text-red-500">Raw Date: {event.date}</p> {/* Debug line */}
        <p>📍 {event.location}</p>
        <p>🎓 {event.club_name} | 🏷️ {event.event_type}</p>
        <p className="text-gray-700 mt-2 line-clamp-3">{event.description}</p>
        {isPast ? (
          <button
            disabled
            className="mt-4 px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed"
          >
            Deadline Gone
          </button>
        ) : (
          <button
            disabled={isRegistered}
            onClick={() => handleRegister(event.id)}
            className={`mt-4 px-4 py-2 rounded ${
              isRegistered ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isRegistered ? 'Registered' : 'Register'}
          </button>
        )}
      </div>
    );
  };

  const tabHeaderText = {
    All: 'All Events',
    Upcoming: 'Upcoming Events',
    Past: 'Past Events',
    Registered: 'Registered Events',
  };

  return (
    <div>
      <Navbar />

      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 overflow-hidden text-center">
        {Array.from({ length: 25 }).map((_, index) => (
          <img
            key={index}
            src="/assets/starss.png"
            alt="sparkle"
            className="absolute w-4 h-4 sparkle pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animation: 'twinkle 2s infinite ease-in-out',
            }}
          />
        ))}
        <h1 className="relative z-10 text-4xl font-bold">
          🎉 {tabHeaderText[activeTab]} {filters.sortBy && `(Sorted by ${filters.sortBy})`}
        </h1>
        <p className="mt-2 text-yellow-300 italic z-10 relative">
          Find & Register for Campus Events
        </p>
        <div className="relative z-10 mt-6 flex justify-center gap-4 flex-wrap">
          <img src="/images/event-left.png" alt="img1" className="h-32 w-48 rounded-xl shadow-lg object-cover" />
          <img src="/images/event-right.jpg" alt="img2" className="h-32 w-48 rounded-xl shadow-lg object-cover" />
          <img src="/images/event-mid.jpg" alt="img3" className="h-32 w-48 rounded-xl shadow-lg object-cover" />
        </div>
      </div>

      <div className="flex justify-center gap-4 my-6">
        {['All', 'Upcoming', 'Past', 'Registered'].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-full font-medium ${
              activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 px-4 mb-6">
        <select
          className="border px-3 py-1 rounded"
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="">Sort By</option>
          <option value="Date">Date</option>
          <option value="Time">Time</option>
          <option value="Club">Club</option>
          <option value="Type">Type</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mb-10">
        {filteredEvents.length ? (
          filteredEvents.map(renderEventCard)
        ) : (
          <p className="text-center col-span-3 text-gray-500">No events found.</p>
        )}
      </div>

      <footer className="bg-purple-800 text-white py-6 text-center">
        &copy; {new Date().getFullYear()} Student Events Portal. All rights reserved.
      </footer>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

export default StudentEvents;
