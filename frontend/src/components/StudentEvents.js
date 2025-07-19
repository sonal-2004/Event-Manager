import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';

axios.defaults.withCredentials = true;

const StudentEvents = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All Events');

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/student/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchRegisteredEvents = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/student/registered-events/${user._id}`);
      setRegisteredEvents(response.data);
    } catch (error) {
      console.error('Error fetching registered events:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegisteredEvents();
    }
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const filtered = events.filter((event) => {
      if (!user) return false; // 👈 Ensures no data is shown when not logged in
      const eventDate = new Date(event.date);
      const isPastEvent = eventDate < now;
      const isRegistered = registeredEvents.some((e) => e._id === event._id);

      switch (selectedTab) {
        case 'Upcoming Events':
          return !isPastEvent;
        case 'Past Events':
          return isPastEvent;
        case 'Registered Events':
          return isRegistered;
        default:
          return true;
      }
    });
    setFilteredEvents(filtered);
  }, [events, registeredEvents, selectedTab, user]);

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`/api/student/register/${eventId}`);
      fetchRegisteredEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const renderEventCard = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const isPastEvent = eventDate < now;
    const isRegistered = registeredEvents.some((e) => e._id === event._id);

    return (
      <div key={event._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-xl font-bold mb-2">{event.name}</h3>
        <p className="text-gray-600 mb-1">Date: {new Date(event.date).toLocaleDateString()}</p>
        <p className="text-gray-600 mb-1">Venue: {event.venue}</p>
        <p className="text-gray-600 mb-1">Time: {event.time}</p>
        <p className="text-gray-600 mb-1">Description: {event.description}</p>
        <button
          onClick={() => handleRegister(event._id)}
          disabled={isPastEvent || isRegistered}
          className={`mt-4 w-full py-2 rounded text-white ${
            isPastEvent || isRegistered
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRegistered ? 'Registered' : isPastEvent ? 'Event Passed' : 'Register'}
        </button>
      </div>
    );
  };

  const tabs = ['All Events', 'Upcoming Events', 'Past Events', 'Registered Events'];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center space-x-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full border ${
                selectedTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-100'
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {filteredEvents.length === 0 ? (
          <p className="text-center text-gray-600">No events available.</p>
        ) : (
          filteredEvents.map((event) => renderEventCard(event))
        )}
      </div>
    </div>
  );
};

export default StudentEvents;
