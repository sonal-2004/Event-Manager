import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    poster: '',
    club_name: '',
    event_type: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [registrations, setRegistrations] = useState({});
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/clubAdmin/my-events');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      poster: '',
      club_name: '',
      event_type: '',
    });
    setShowForm(false);
    setEditMode(false);
    setEventToEdit(null);
  };

  const validateForm = () => {
    const requiredFields = ['title', 'description', 'date', 'time', 'location', 'club_name', 'event_type'];
    for (const field of requiredFields) {
      if (!newEvent[field] || newEvent[field].trim() === '') {
        alert(`Please fill in the "${field}" field.`);
        return false;
      }
    }

    const selectedDate = new Date(`${newEvent.date}T${newEvent.time}`);
    const now = new Date();
    if (selectedDate < now) {
      alert("Please select a valid future date and time.");
      return false;
    }

    return true;
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('title', newEvent.title);
    formData.append('description', newEvent.description);
    formData.append('date', newEvent.date);
    formData.append('time', newEvent.time);
    formData.append('location', newEvent.location);
    formData.append('club_name', newEvent.club_name);
    formData.append('event_type', newEvent.event_type);
    if (newEvent.poster) {
      formData.append('poster', newEvent.poster);
    }
    return formData;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const formData = buildFormData();
      await axios.post('/api/clubAdmin/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchEvents();
      setSuccessMessage(`${newEvent.title} created successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      resetForm();
    } catch (error) {
      console.error('Failed to create event:', error);
      alert(error.response?.data?.message || 'Failed to create event.');
    }
  };

  const handleEdit = (event) => {
    setEditMode(true);
    setEventToEdit(event);
    setNewEvent({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      poster: '',
      club_name: event.club_name || '',
      event_type: event.event_type || '',
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const formData = buildFormData();
      await axios.put(`/api/clubAdmin/event/${eventToEdit.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Failed to update event:', error);
      alert(error.response?.data?.message || 'Failed to update event.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/clubAdmin/event/${id}`);
      fetchEvents();
      setSuccessMessage('Event deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert(error.response?.data?.message || 'Failed to delete event.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'poster') {
      setNewEvent({ ...newEvent, [name]: files[0] });
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const toggleRegistrations = async (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }

    try {
      const res = await axios.get(`/api/clubAdmin/event/${eventId}/registrations`);
      setRegistrations((prev) => ({ ...prev, [eventId]: res.data }));
      setExpandedEventId(eventId);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      alert(error.response?.data?.message || 'Failed to fetch registrations.');
    }
  };

  const toggleDescription = (eventId) => {
    setExpandedDescriptionId((prevId) => (prevId === eventId ? null : eventId));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      {/* Header */}
      <header className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 overflow-hidden text-center">
        {Array.from({ length: 25 }).map((_, index) => (
          <img
            key={index}
            src="/assets/starss.png"
            alt="Sparkle"
            className="absolute w-4 h-4 sparkle pointer-events-none"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        <h1 className="text-3xl text-yellow-300 font-bold">Event Dashboard</h1>
        <button
          className="mt-4 bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Event'}
        </button>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Event Form */}
        {showForm && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? 'Edit Event' : 'Create Event'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="title" placeholder="Title" value={newEvent.title} onChange={handleInputChange} className="p-2 border rounded" required />
              <input name="date" type="date" value={newEvent.date} onChange={handleInputChange} className="p-2 border rounded" required />
              <input name="time" type="time" value={newEvent.time} onChange={handleInputChange} className="p-2 border rounded" required />
              <input name="location" placeholder="Location" value={newEvent.location} onChange={handleInputChange} className="p-2 border rounded" required />
              <select name="club_name" value={newEvent.club_name} onChange={handleInputChange} className="p-2 border rounded" required>
                <option value="">Select Club</option>
                <option value="Tech Club">Tech Club</option>
                <option value="Cultural Club">Cultural Club</option>
                <option value="Literary Club">Literary Club</option>
                <option value="Sports Club">Sports Club</option>
              </select>
              <select name="event_type" value={newEvent.event_type} onChange={handleInputChange} className="p-2 border rounded" required>
                <option value="">Select Type</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="Competition">Competition</option>
                <option value="Social">Social</option>
              </select>
              <input name="poster" type="file" onChange={handleInputChange} className="p-2 border rounded col-span-full" />
              <textarea name="description" placeholder="Description" value={newEvent.description} onChange={handleInputChange} className="p-2 border rounded col-span-full" required />
            </div>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={editMode ? handleUpdate : handleCreate}>
              {editMode ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        )}

        {/* Events List */}
        <div className="text-center mt-6 mb-4">
          <img src="/assets/calender.png" alt="Calendar Icon" className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-purple-700">Managed Events</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-4 cursor-pointer transition transform hover:scale-[1.02]" onClick={() => toggleDescription(event.id)}>
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">
                {expandedDescriptionId === event.id ? event.description : event.description.length > 100 ? `${event.description.slice(0, 100)}...` : event.description}
              </p>
              <p>
                📅 {new Date(event.date).toLocaleDateString()} | 🕒{' '}
                {new Date('1970-01-01T' + event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-500">📍 {event.location}</p>
              {event.poster && <img src={event.poster} alt="Poster" className="rounded mt-2 max-h-40 object-contain w-full" />}
              <div className="mt-4 flex gap-2 flex-wrap">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                <button onClick={(e) => { e.stopPropagation(); toggleRegistrations(event.id); }} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                  {expandedEventId === event.id ? 'Hide Registrations' : 'View Registrations'}
                </button>
              </div>
              {expandedEventId === event.id && (
                <div className="mt-4 bg-gray-50 p-3 rounded shadow-inner">
                  <h4 className="font-semibold">Registered Students:</h4>
                  {registrations[event.id]?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm">
                      {registrations[event.id].map((student) => (
                        <li key={student.id}>{student.name} ({student.email})</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No registrations yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-purple-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Campus Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EventDashboard;
