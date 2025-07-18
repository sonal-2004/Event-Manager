import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortOption, setSortOption] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const postLoginEventId = sessionStorage.getItem("registerAfterLogin");
    if (isLoggedIn && postLoginEventId) {
      handleRegister(postLoginEventId);
      sessionStorage.removeItem("registerAfterLogin");
    }
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    try {
      const res = await axios.get('/api/student/profile');
      if (res.data && res.data.email) {
        setIsLoggedIn(true);
        fetchRegisteredEvents();
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events/all');
      setEvents(res.data);
    } catch (error) {
      console.error('❌ Failed to fetch events:', error);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await axios.get('/api/student/registered');
      setRegisteredEvents(res.data.map(e => e.id));
    } catch (error) {
      console.error('⚠️ Could not fetch registered events');
    }
  };

  const handleRegister = async (eventId) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("registerAfterLogin", eventId);
      window.location.href = "/login";
      return;
    }

    try {
      await axios.post(`/api/student/register/${eventId}`);
      alert("✅ Registration successful!");
      fetchRegisteredEvents();
    } catch (error) {
      console.error('❌ Registration error:', error);
      if (error.response?.status === 400) {
        alert("ℹ️ You're already registered for this event.");
      } else {
        alert("❌ Registration failed. Please try again.");
      }
    }
  };

  const today = new Date();
  const isPast = (date) => new Date(date) < today;

  const sortEvents = (list) => {
    return [...list].sort((a, b) => {
      switch (sortOption) {
        case 'date': return new Date(a.date) - new Date(b.date);
        case 'time': return a.time.localeCompare(b.time);
        case 'eventType': return (a.eventType || '').localeCompare(b.eventType || '');
        case 'club_name': return (a.club_name || '').localeCompare(b.club_name || '');
        default: return 0;
      }
    });
  };

  const getFilteredEvents = () => {
    let base = events;

    if (selectedTab === 'upcoming') {
      base = base.filter(e => !isPast(e.date));
    } else if (selectedTab === 'past') {
      base = base.filter(e => isPast(e.date));
    } else if (selectedTab === 'registered') {
      base = base.filter(e => registeredEvents.includes(e.id));
    }

    return sortEvents(base);
  };

  const groupedEvents = () => {
    const list = getFilteredEvents();

    if (!sortOption) return { '': list };

    return list.reduce((groups, event) => {
      const key = sortOption === 'date'
        ? new Date(event.date).toLocaleDateString()
        : event[sortOption] || 'Unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
      return groups;
    }, {});
  };

  const renderEventCard = (event) => {
    const isPastEvent = isPast(event.date);
    const isRegistered = registeredEvents.includes(event.id);

    return (
      <div
        key={event.id}
        className="bg-white border rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
        onClick={() => setSelectedEvent(event)}
      >
        {event.poster && (
          <img src={event.poster} alt="Poster" className="rounded mb-2 w-full max-h-48 object-contain" />
        )}
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm text-gray-600">
          📅 {new Date(event.date).toLocaleDateString()} | 🕒 {new Date('1970-01-01T' + event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p>📍 {event.location}</p>
        <p>🎓 {event.club_name}</p>
        <p className="mt-2 text-gray-700 line-clamp-3">{event.description}</p>

        {selectedTab !== 'registered' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isPastEvent && !isRegistered) handleRegister(event.id);
            }}
            disabled={isPastEvent || isRegistered}
            className={`mt-4 w-full py-2 rounded text-white ${isPastEvent || isRegistered ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isPastEvent ? 'Registration Closed' : isRegistered ? 'Registered' : 'Register'}
          </button>
        )}
      </div>
    );
  };

  const renderTabs = () => {
    const tabs = ['all', ...(isLoggedIn ? ['upcoming', 'past', 'registered'] : [])];
    return tabs.map(tab => (
      <button
        key={tab}
        onClick={() => setSelectedTab(tab)}
        className={`px-4 py-2 rounded-full border ${selectedTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)} Events
      </button>
    ));
  };

  if (loading) return <p className="text-center py-10 text-lg text-gray-600">Loading...</p>;

  return (
    <div>
      <Navbar />

      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-2">Student Events</h1>
        <p className="italic text-yellow-300">Find & Register for Campus Events</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center my-6 gap-2 flex-wrap">{renderTabs()}</div>

      {/* Filter Box */}
      <div className="flex justify-end items-center px-4 mb-6">
        <label className="mr-2 font-medium">Sort by:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">None</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="eventType">Event Type</option>
          <option value="club_name">Club</option>
        </select>
      </div>

      {/* Grouped Events */}
      <div className="px-4 mb-16 space-y-6">
        {Object.entries(groupedEvents()).map(([group, list]) => (
          <div key={group}>
            {sortOption && <h2 className="text-xl font-semibold mb-3">{group}</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map(event => renderEventCard(event))}
            </div>
          </div>
        ))}
        {!Object.values(groupedEvents()).flat().length && (
          <p className="text-center text-gray-500">No events to display.</p>
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-xl text-gray-600 hover:text-black"
              onClick={() => setSelectedEvent(null)}
            >
              ✕
            </button>
            {selectedEvent.poster && (
              <img src={selectedEvent.poster} alt="Poster" className="rounded mb-4 max-h-60 object-contain mx-auto" />
            )}
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
            <p>📅 {new Date(selectedEvent.date).toLocaleDateString()} | 🕒 {new Date('1970-01-01T' + selectedEvent.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p>📍 {selectedEvent.location}</p>
            <p>🎓 {selectedEvent.club_name}</p>
            <div className="mt-3 text-gray-700 whitespace-pre-line">{selectedEvent.description}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-purple-800 text-white py-8 text-center">
        <p>&copy; {new Date().getFullYear()} Student Events Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StudentEvents;
