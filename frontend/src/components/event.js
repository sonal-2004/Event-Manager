import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar'; // Optional if you have a top navbar

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const Event = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    club_name: '',
    event_type: '',
    poster: null,
  });

  const fetchMyEvents = async () => {
    try {
      const res = await axios.get('/api/clubAdmin/my-events');
      setEvents(res.data);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'poster') {
      setFormData((prev) => ({ ...prev, poster: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    try {
      await axios.post('/api/clubAdmin/events', data);
      alert('✅ Event created successfully!');
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        club_name: '',
        event_type: '',
        poster: null,
      });
      fetchMyEvents();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to create event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/api/clubAdmin/event/${eventId}`);
      alert('🗑️ Event deleted');
      fetchMyEvents();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete event');
    }
  };

  return (
    <div className="p-6">
      <Navbar />

      <h2 className="text-3xl font-extrabold text-purple-800 mb-6 text-center">📢 Manage Events</h2>

      {/* Create Event Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-md max-w-xl mx-auto mb-12">
        <h3 className="text-xl font-semibold mb-4 text-purple-700">Create New Event</h3>
        <input name="title" value={formData.title} placeholder="Title" onChange={handleChange} className="border p-2 w-full" required />
        <textarea name="description" value={formData.description} placeholder="Description" onChange={handleChange} className="border p-2 w-full" required />
        <input name="date" type="date" value={formData.date} onChange={handleChange} className="border p-2 w-full" required />
        <input name="time" type="time" value={formData.time} onChange={handleChange} className="border p-2 w-full" required />
        <input name="location" value={formData.location} placeholder="Location" onChange={handleChange} className="border p-2 w-full" required />
        <input name="club_name" value={formData.club_name} placeholder="Club Name" onChange={handleChange} className="border p-2 w-full" required />
        <input name="event_type" value={formData.event_type} placeholder="Event Type" onChange={handleChange} className="border p-2 w-full" required />
        <input name="poster" type="file" onChange={handleChange} className="w-full" />
        <button type="submit" className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
          Create Event
        </button>
      </form>

      {/* List of Events */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-purple-800 mb-4">📋 Your Events</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-4 rounded shadow-md">
              <h4 className="font-semibold text-lg">{event.title}</h4>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-sm">📅 {event.date} | 🕒 {event.time}</p>
              <p className="text-sm">📍 {event.location}</p>
              <p className="text-sm">🎓 {event.club_name} | 📂 {event.event_type}</p>
              {event.poster && (
                <img src={event.poster} alt="Poster" className="max-h-40 mt-2 rounded object-contain" />
              )}
              <button
                onClick={() => handleDelete(event.id)}
                className="mt-3 text-red-600 hover:text-red-800 font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Event;
