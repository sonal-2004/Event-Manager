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
  const [filters, setFilters] = useState({
    date: '',
    time: '',
    club_name: '',
    event_type: '',
  });

  useEffect(() => {
    fetchUser();
    fetchAllData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [activeTab, filters, events, registeredEvents]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data); // { role: 'student', name: '...' }
    } catch (err) {
      setUser(null);
    }
  };

  const fetchAllData = async () => {
    try {
      const [eventRes, registeredRes] = await Promise.all([
        axios.get('/api/events/all'),
        axios.get('/api/events/registered'),
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
      return;
    }

    try {
      await axios.post(`/api/events/register/${eventId}`);
      fetchAllData();
      alert('Successfully registered!');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const filterEvents = () => {
    const today = new Date();
    let result = [...events];

    if (activeTab === 'Upcoming') {
      result = result.filter(e => new Date(e.date) >= today);
    } else if (activeTab === 'Past') {
      result = result.filter(e => new Date(e.date) < today);
    } else if (activeTab === 'Registered') {
      result = result.filter(e => registeredEvents.includes(e.id));
    }

    if (filters.date) result = result.filter(e => e.date === filters.date);
    if (filters.time) result = result.filter(e => e.time === filters.time);
    if (filters.club_name) result = result.filter(e => e.club_name === filters.club_name);
    if (filters.event_type) result = result.filter(e => e.event_type === filters.event_type);

    setFilteredEvents(result);
  };

  const uniqueValues = (key) => [...new Set(events.map(e => e[key]).filter(Boolean))];

  const renderEventCard = (event) => {
    const isRegistered = registeredEvents.includes(event.id);
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
        <p>📍 {event.location}</p>
        <p>🎓 {event.club_name} | 🏷️ {event.event_type}</p>
        <p className="text-gray-700 mt-2 line-clamp-3">{event.description}</p>
        <button
          disabled={isRegistered}
          onClick={() => handleRegister(event.id)}
          className={`mt-4 px-4 py-2 rounded ${
            isRegistered ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-red-700'
          } text-white`}
        >
          {isRegistered ? 'Registered' : 'Register'}
        </button>
      </div>
    );
  };

  return (
    <div>
      <Navbar />

      {/* Header with sparkle animation and images */}
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
        <h1 className="relative z-10 text-4xl font-bold">🎉 Student Events Dashboard</h1>
        <p className="mt-2 text-yellow-300 italic z-10 relative">Find & Register for Campus Events</p>
        <div className="relative z-10 mt-6 flex justify-center gap-4 flex-wrap">
          <img src="/images/event-left.png" alt="img1" className="h-32 w-48 rounded-xl shadow-lg object-cover" />
          <img src="/images/event-right.jpg" alt="img2" className="h-32 w-48 rounded-xl shadow-lg object-cover" />
          <img src="/images/event-mid.jpg" alt="img3" className="h-32 w-48 rounded-xl shadow-lg object-cover" />
        </div>
      </div>

      {/* Tabs */}
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

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 px-4 mb-6">
        <select
          className="border px-3 py-1 rounded"
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        >
          <option value="">Date</option>
          {uniqueValues('date').map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
        <select
          className="border px-3 py-1 rounded"
          onChange={(e) => setFilters({ ...filters, time: e.target.value })}
        >
          <option value="">Time</option>
          {uniqueValues('time').map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="border px-3 py-1 rounded"
          onChange={(e) => setFilters({ ...filters, club_name: e.target.value })}
        >
          <option value="">Club</option>
          {uniqueValues('club_name').map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="border px-3 py-1 rounded"
          onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
        >
          <option value="">Type</option>
          {uniqueValues('event_type').map((type, i) => (
            <option key={i} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mb-10">
        {filteredEvents.length ? (
          filteredEvents.map(renderEventCard)
        ) : (
          <p className="text-center col-span-3 text-gray-500">No events found.</p>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-purple-800 text-white py-6 text-center">
        &copy; {new Date().getFullYear()} Student Events Portal. All rights reserved.
      </footer>

      {/* Sparkle Animation */}
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
