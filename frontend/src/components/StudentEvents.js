import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchRegisteredEvents(); // This will fail if user is not logged in
        await fetchAllEvents(); // Only fetch events if login is successful

        const postLoginEventId = sessionStorage.getItem("registerAfterLogin");
        if (postLoginEventId) {
          handleRegister(Number(postLoginEventId));
          sessionStorage.removeItem("registerAfterLogin");
        }
      } catch (err) {
        console.warn("User not logged in. Redirecting to login...");
        window.location.href = "/login";
      }
    };

    fetchData();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const res = await axios.get('/api/events/all');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await axios.get('/api/events/registered');
      const ids = res.data.map(e => e.id || e.event_id);
      setRegisteredEvents(ids);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw new Error('Unauthorized');
      } else {
        console.error('Failed to fetch registered events:', err);
      }
    }
  };

  const handleRegister = async (eventId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/events/register/${eventId}`);
      console.log(res.data.message);
      setRegisteredEvents(prev => [...prev, eventId]);
      alert(res.data.message);
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const isRegistered = registeredEvents.includes(event.id);

    if (selectedTab === 'upcoming') return eventDate > now;
    if (selectedTab === 'past') return eventDate < now;
    if (selectedTab === 'registered') return isRegistered;
    return true;
  });

  return (
    <div>
      <Navbar />
      <div className="tabs flex gap-4 justify-center mt-6">
        {['all', 'upcoming', 'past', 'registered'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${selectedTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="events grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {filteredEvents.map(event => {
          const isRegistered = registeredEvents.includes(event.id);
          return (
            <div key={event.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <button
                className={`mt-2 px-4 py-2 rounded ${
                  isRegistered ? 'bg-green-500' : 'bg-blue-500'
                } text-white`}
                disabled={isRegistered || loading}
                onClick={() => handleRegister(event.id)}
              >
                {isRegistered ? 'Registered' : 'Register'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentEvents;
