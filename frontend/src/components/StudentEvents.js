import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;

const StudentEvents = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({});
  const [activeTab, setActiveTab] = useState('All');
  const [filters, setFilters] = useState({ sortBy: '' });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user !== null) {
      if (!user || user.role !== 'student') {
        window.location.href = `/login?redirect=/events`;
        return;
      }
      fetchAllData();
    }
  }, [user]);

  useEffect(() => {
    filterAndGroupEvents();
  }, [activeTab, filters, events, registeredEvents]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
    } catch (err) {
      setUser(null); // treat as guest
    }
  };

  const fetchAllData = async () => {
    try {
      const [eventRes, registeredRes] = await Promise.all([
        axios.get('/api/events/all'),
        user ? axios.get('/api/events/registered') : Promise.resolve({ data: [] }),
      ]);
      setEvents(eventRes.data);
      setRegisteredEvents(registeredRes.data.map(ev => ev.id));
    } catch (err) {
      console.error('Error loading data', err);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user || user.role !== 'student') {
      alert('Please log in as a student to register for events.');
      window.location.href = `/login?redirect=/events`;
      return;
    }
    try {
      await axios.post(`/api/events/register/${eventId}`);
      alert('Successfully registered!');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const filterAndGroupEvents = () => {
    const today = new Date();
    let result = [...events];

    if (activeTab === 'Upcoming') {
      result = result.filter(e => new Date(e.date) >= today);
    } else if (activeTab === 'Past') {
      result = result.filter(e => new Date(e.date) < today);
    } else if (activeTab === 'Registered') {
      result = result.filter(e => registeredEvents.includes(e.id));
    }

    let grouped = {};
    if (filters.sortBy === 'Date') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
      grouped = groupBy(result, e => new Date(e.date).toLocaleDateString());
    } else if (filters.sortBy === 'Time') {
      result.sort((a, b) => a.time.localeCompare(b.time));
      grouped = groupBy(result, e => e.time);
    } else if (filters.sortBy === 'Club') {
      result.sort((a, b) => a.club_name.localeCompare(b.club_name));
      grouped = groupBy(result, e => e.club_name);
    } else if (filters.sortBy === 'Type') {
      result.sort((a, b) => a.event_type.localeCompare(b.event_type));
      grouped = groupBy(result, e => e.event_type);
    } else {
      grouped = { 'All Events': result };
    }

    setGroupedEvents(grouped);
  };

  const groupBy = (arr, keyGetter) => {
    return arr.reduce((acc, item) => {
      const key = keyGetter(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const renderEventCard = (event) => {
    const isRegistered = registeredEvents.includes(event.id);
    const isPastDeadline = new Date(event.date) < new Date();

    return (
      <div
        key={event.id}
        className="bg-white rounded-lg shadow-md p-4 max-w-sm mx-auto flex flex-col hover:shadow-xl transition"
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
        <p>📍 {event.location}</p>
        <p>🎓 {event.club_name} | 🏷️ {event.event_type}</p>
        <p className="text-gray-700 mt-2 line-clamp-3">{event.description}</p>

        {isPastDeadline ? (
          <button
            className="bg-gray-500 cursor-not-allowed text-white py-1 px-4 rounded mt-4"
            disabled
          >
            Deadline Gone
          </button>
        ) : isRegistered ? (
          <button
            className="bg-green-500 text-white py-1 px-4 rounded mt-4"
            disabled
          >
            Registered
          </button>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded mt-4"
            onClick={() => handleRegister(event.id)}
          >
            Register
          </button>
        )}
      </div>
    );
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
          {activeTab === 'All' && '🎉 All Events'}
          {activeTab === 'Upcoming' && '📅 Upcoming Events'}
          {activeTab === 'Past' && '⏳ Past Events'}
          {activeTab === 'Registered' && '✅ Your Registered Events'}
        </h1>
        <p className="mt-2 text-yellow-300 italic z-10 relative">Find & Register for Campus Events</p>
      </div>

      <div className="flex justify-center gap-4 my-6 flex-wrap">
        {['All', 'Upcoming', 'Past', 'Registered'].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-full font-medium ${
              activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'All' ? 'All Events' : `${tab} Events`}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 px-4 mb-6">
        <select
          className="border px-3 py-1 rounded"
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="">Sort By</option>
          <option value="Date">Date</option>
          <option value="Time">Time</option>
          <option value="Club">Club</option>
          <option value="Type">Type</option>
        </select>
      </div>

      <div className="px-4 mb-10">
        {Object.keys(groupedEvents).length ? (
          Object.entries(groupedEvents).map(([group, items]) => (
            <div key={group} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-1">
                {filters.sortBy ? `🗂 ${filters.sortBy}: ${group}` : group}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(renderEventCard)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No events found.</p>
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
