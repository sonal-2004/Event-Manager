import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';
import { useNavigate, useLocation } from 'react-router-dom';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortOrder, setSortOrder] = useState('upcoming');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        const res = await axios.get('/student/check');
        setIsLoggedIn(res.data.loggedIn);
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await axios.get('/student/get-events');
        setEvents(res.data.events || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLoginStatus();
    fetchEvents();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleBack = () => {
    setSelectedEvent(null);
  };

  const handleRegister = async (eventId) => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=events`);
      return;
    }

    try {
      await axios.post('/student/register', { eventId });
      alert('✅ Successfully registered!');
    } catch (err) {
      alert('⚠️ Already registered or error occurred.');
    }
  };

  const fetchRegisteredEvents = async () => {
    if (!isLoggedIn) {
      navigate('/login?redirect=events');
      return;
    }

    try {
      const res = await axios.get('/student/registered-events');
      setRegisteredEvents(res.data.events || []);
      setSortOrder('registered');
    } catch (err) {
      console.error(err);
    }
  };

  const sortEvents = () => {
    const now = new Date();

    if (sortOrder === 'registered') return registeredEvents;

    return events
      .filter((event) => {
        const eventDate = new Date(event.date);
        return sortOrder === 'upcoming'
          ? eventDate >= now
          : eventDate < now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        {!selectedEvent ? (
          <>
            <h1 className="text-4xl font-bold mb-6 text-center text-indigo-600">Events</h1>

            <div className="flex justify-center gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded-full font-medium ${
                  sortOrder === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setSortOrder('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`px-4 py-2 rounded-full font-medium ${
                  sortOrder === 'past' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
                onClick={() => setSortOrder('past')}
              >
                Past
              </button>
              <button
                className={`px-4 py-2 rounded-full font-medium ${
                  sortOrder === 'registered' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}
                onClick={fetchRegisteredEvents}
              >
                Registered
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortEvents().map((event) => (
                <div
                  key={event._id}
                  className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                  onClick={() => handleEventClick(event)}
                >
                  <img
                    src={event.poster}
                    alt="Poster"
                    className="rounded mb-2 w-full h-48 object-contain"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">{event.name}</h2>
                  <p className="text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white shadow-xl rounded-lg p-6 max-w-xl mx-auto">
            <img
              src={selectedEvent.poster}
              alt="Poster"
              className="rounded mb-4 w-full h-64 object-contain"
            />
            <h2 className="text-3xl font-bold mb-2 text-indigo-700">{selectedEvent.name}</h2>
            <p className="text-gray-600 mb-1">📅 {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
            <p className="text-sm text-gray-500 mb-6">ID: {selectedEvent._id}</p>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => handleRegister(selectedEvent._id)}
              >
                Register
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={handleBack}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEvents;
