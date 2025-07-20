import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchEvents();
      await fetchRegisteredEvents();

      const postLoginEventId = sessionStorage.getItem("registerAfterLogin");
      if (postLoginEventId) {
        handleRegister(Number(postLoginEventId));
        sessionStorage.removeItem("registerAfterLogin");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : 'auto';
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events/all');
      setEvents(res.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await axios.get('/api/student/registered');
      const registeredIds = res.data.map((e) => e.event_id || e.id);
      setRegisteredEvents(registeredIds);
    } catch (error) {
      console.error('Failed to fetch registered events:', error);
    }
  };

  const handleRegister = async (eventId) => {
  try {
    await axios.post(`/api/student/register/${eventId}`);
    alert("✅ Registration successful!");

    // Update local state immediately
    setRegisteredEvents((prev) => [...prev, eventId]);

    // Optional: sync with server after a short delay
    setTimeout(fetchRegisteredEvents, 1000);
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.setItem("registerAfterLogin", eventId.toString());
      window.location.href = "/login";
    } else if (error.response?.status === 400) {
      alert("ℹ You are already registered for this event.");
      // Optionally update UI anyway
      setRegisteredEvents((prev) => [...prev, eventId]);
    } else {
      console.error("❌ Registration failed:", error);
      alert("❌ Registration failed.");
    }
  }
};

  const today = new Date();
  const isPast = (date) => new Date(date) < today;

  const filteredEvents = {
    all: events,
    upcoming: events.filter(e => !isPast(e.date)),
    past: events.filter(e => isPast(e.date)),
    registered: events.filter(e => registeredEvents.includes(e.id)),
  };

  const getSectionTitle = () => {
    switch (selectedTab) {
      case 'upcoming': return 'Upcoming Events';
      case 'past': return 'Past Events';
      case 'registered': return 'Your Registered Events';
      default: return 'All Events';
    }
  };

  const renderEventCard = (event) => {
    const isPastEvent = isPast(event.date);
    const isRegistered = registeredEvents.includes(event.id);

    return (
      <div
        key={event.id}
        className="bg-white border rounded-lg shadow-md p-4 max-w-sm mx-auto hover:shadow-xl transition cursor-pointer"
        onClick={() => setSelectedEvent(event)}
      >
        {event.poster && (
          <img src={event.poster} alt="Poster" className="rounded mb-2 w-full max-h-48 object-contain" />
        )}
        <h3 className="text-lg font-bold">{event.title}</h3>
        <p className="text-sm text-gray-600">
          📅 {new Date(event.date).toLocaleDateString()} | 🕒{" "}
          {event.time
            ? new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'N/A'}
        </p>
        <p>📍 {event.location}</p>
        <p>🎓 {event.club_name}</p>
        <p className="mt-2 text-gray-700 line-clamp-3">{event.description}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isPastEvent && !isRegistered) handleRegister(event.id);
          }}
          disabled={isPastEvent || isRegistered}
          className={`mt-4 w-full py-2 rounded text-white ${
            isPastEvent || isRegistered
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isPastEvent ? 'Registration Closed' : isRegistered ? 'Registered' : 'Register'}
        </button>
      </div>
    );
  };

  return (
    <div>
      <Navbar />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-2">{getSectionTitle()}</h1>
        <p className="italic text-yellow-300">Find & Register for Campus Events</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center my-6 gap-2 flex-wrap">
        {['all', 'upcoming', 'past', 'registered'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-full border ${
              selectedTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Events
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mb-16">
        {filteredEvents[selectedTab]?.length > 0 ? (
          filteredEvents[selectedTab].map(event => renderEventCard(event))
        ) : (
          <p className="text-center col-span-full text-gray-500">No events to display.</p>
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
            <p>
              📅 {new Date(selectedEvent.date).toLocaleDateString()} | 🕒{" "}
              {selectedEvent.time
                ? new Date(`1970-01-01T${selectedEvent.time}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </p>
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
