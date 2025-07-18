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
    fetchEvents();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectAction = params.get('action');
    const eventId = params.get('eventId');
    const tab = params.get('tab');

    if (user && user.role === 'student') {
      fetchRegisteredEvents().then(() => {
        if (redirectAction === 'register' && eventId) {
          handleRegister(eventId);
        } else if (tab === 'registered') {
          setActiveTab('Registered');
        }
      });
    }
  }, [user]);

  useEffect(() => {
    filterAndGroupEvents();
  }, [activeTab, filters, events, registeredEvents]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events/all');
      setEvents(res.data.events || res.data);
    } catch (err) {
      console.error('Error fetching events', err);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await axios.get('/api/events/registered');
      setRegisteredEvents(res.data.events.map(ev => ev.id));
    } catch (err) {
      console.error('Error fetching registered events', err);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user || user.role !== 'student') {
      window.location.href = `/login?redirect=/events?action=register&eventId=${eventId}`;
      return;
    }
    try {
      const event = events.find(e => e.id === parseInt(eventId));
      await axios.post(`/api/events/register/${eventId}`);
      alert(`✅ Registered successfully for ${event?.title || 'event'}!`);
      fetchRegisteredEvents();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Registration failed');
    }
  };

  const filterAndGroupEvents = () => {
    const today = new Date();
    let filtered = [...events];

    if (activeTab === 'Upcoming') {
      filtered = filtered.filter(e => new Date(e.date) >= today);
    } else if (activeTab === 'Past') {
      filtered = filtered.filter(e => new Date(e.date) < today);
    } else if (activeTab === 'Registered') {
      if (!user || user.role !== 'student') {
        window.location.href = `/login?redirect=/events?tab=registered`;
        return;
      }
      filtered = filtered.filter(e => registeredEvents.includes(e.id));
    }

    let grouped = {};
    if (filters.sortBy === 'Date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      grouped = groupBy(filtered, e => new Date(e.date).toLocaleDateString());
    } else if (filters.sortBy === 'Time') {
      filtered.sort((a, b) => a.time.localeCompare(b.time));
      grouped = groupBy(filtered, e => e.time);
    } else if (filters.sortBy === 'Club') {
      filtered.sort((a, b) => a.club_name.localeCompare(b.club_name));
      grouped = groupBy(filtered, e => e.club_name);
    } else if (filters.sortBy === 'Type') {
      filtered.sort((a, b) => a.event_type.localeCompare(b.event_type));
      grouped = groupBy(filtered, e => e.event_type);
    } else {
      grouped = { 'All Events': filtered };
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
    const isPast = new Date(event.date) < new Date();

    return (
      <div key={event.id} className="bg-white rounded-lg shadow p-4">
        {event.poster && (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded mb-2 overflow-hidden">
            <img
              src={event.poster}
              alt="Poster"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p>📅 {new Date(event.date).toLocaleDateString()} | 🕒 {event.time}</p>
        <p>📍 {event.location}</p>
        <p>🎓 {event.club_name} | 🏷️ {event.event_type}</p>
        <p className="mt-2 text-gray-700 line-clamp-3">{event.description}</p>

        {isPast ? (
          <button className="bg-gray-500 text-white py-1 px-4 rounded mt-4 cursor-not-allowed" disabled>
            Deadline Gone
          </button>
        ) : isRegistered ? (
          <button className="bg-green-500 text-white py-1 px-4 rounded mt-4" disabled>
            Registered
          </button>
        ) : (
          <button
            onClick={() => handleRegister(event.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded mt-4"
          >
            Register
          </button>
        )}
      </div>
    );
  };

  const tabTitles = {
    All: '🎉 All Events',
    Upcoming: '📅 Upcoming Events',
    Past: '⏳ Past Events',
    Registered: '✅ Your Registered Events'
  };

  return (
    <div>
      <Navbar />

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white text-center relative">
        <h1 className="text-4xl font-bold z-10 relative">{tabTitles[activeTab]}</h1>
        <p className="italic text-yellow-300 mt-2 z-10 relative">
          Find & Register for Campus Events
        </p>
      </div>

      <div className="flex justify-center mt-6 flex-wrap gap-4">
        {['All', 'Upcoming', 'Past', ...(user ? ['Registered'] : [])].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full ${
              activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab === 'All' ? 'All Events' : `${tab} Events`}
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-4 mb-6">
        <select
          className="border px-3 py-1 rounded"
          onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="">Sort By</option>
          <option value="Date">Date</option>
          <option value="Time">Time</option>
          <option value="Club">Club</option>
          <option value="Type">Type</option>
        </select>
      </div>

      <div className="px-6">
        {Object.keys(groupedEvents).length ? (
          Object.entries(groupedEvents).map(([group, list]) => (
            <div key={group} className="mb-10">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                {filters.sortBy ? `🗂 ${filters.sortBy}: ${group}` : group}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map(renderEventCard)}
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
    </div>
  );
};

export default StudentEvents;
