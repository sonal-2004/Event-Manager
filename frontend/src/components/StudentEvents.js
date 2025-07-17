import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StudentEvents() {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [sortKey, setSortKey] = useState("club_name");

  useEffect(() => {
    axios
      .get("/api/events")
      .then((res) => {
        setAllEvents(res.data || []);
        filterAndGroupEvents(res.data || [], "All", sortKey);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  const filterAndGroupEvents = (events, tab, sortKey) => {
    let now = new Date();
    let filtered = [...events];

    if (tab === "Upcoming") {
      filtered = events.filter(event => new Date(event.date) > now);
    } else if (tab === "Past") {
      filtered = events.filter(event => new Date(event.date) < now);
    } else if (tab === "Registered") {
      filtered = events.filter(event => event.isRegistered); // Example condition
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortKey]?.toLowerCase?.() || "";
      const bVal = b[sortKey]?.toLowerCase?.() || "";
      return aVal.localeCompare(bVal);
    });

    // Grouping
    const grouped = {};
    filtered.forEach(event => {
      const club = event?.club_name?.trim() || "Other Clubs";
      if (!grouped[club]) grouped[club] = [];
      grouped[club].push(event);
    });

    setFilteredEvents(filtered);
    setGroupedEvents(grouped);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterAndGroupEvents(allEvents, tab, sortKey);
  };

  const handleSortChange = (e) => {
    const key = e.target.value;
    setSortKey(key);
    filterAndGroupEvents(allEvents, activeTab, key);
  };

  const openEventModal = (event) => setSelectedEvent(event);
  const closeEventModal = () => setSelectedEvent(null);

  const renderEventCard = (event) => (
    <div
      key={event._id}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl cursor-pointer transition duration-300"
      onClick={() => openEventModal(event)}
    >
      <h3 className="text-lg font-bold">{event.title?.trim() || "Untitled Event"}</h3>
      <p className="text-gray-600">
        📅 {event.date ? new Date(event.date).toLocaleDateString() : "Invalid Date"} | ⏰{" "}
        {event.time ? new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
      </p>
      <p>📍 Location: {event.location?.trim() || "N/A"}</p>
      <p>🎓 Club: {event.club_name?.trim() || "N/A"}</p>
      <p>📂 Type: {event.event_type?.trim() || "N/A"}</p>
      <p className="mt-2 text-gray-700 line-clamp-2">{event.description?.trim() || "No description."}</p>
      <button className="mt-2 px-3 py-1 rounded bg-gray-300 text-gray-700 cursor-default">Registered</button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Sort and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="mb-3 sm:mb-0">
          <span className="mr-2 font-semibold">Sort By:</span>
          <select value={sortKey} onChange={handleSortChange} className="border px-2 py-1 rounded">
            <option value="club_name">Club Name</option>
            <option value="event_type">Event Type</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
          </select>
        </div>

        <div className="flex space-x-2">
          {["All", "Registered", "Upcoming", "Past"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-1 rounded ${activeTab === tab ? "bg-purple-600 text-white" : "border border-purple-600 text-purple-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {Object.entries(groupedEvents).map(([clubName, clubEvents]) => (
        <div key={clubName} className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center text-purple-700">{clubName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clubEvents.map((event) => renderEventCard(event))}
          </div>
        </div>
      ))}

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full relative">
            <button onClick={closeEventModal} className="absolute top-2 right-2 text-gray-600 hover:text-black">
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title?.trim() || "Untitled Event"}</h2>
            <p>📅 {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : "Invalid Date"} | ⏰{" "}
              {selectedEvent.time
                ? new Date(`1970-01-01T${selectedEvent.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "N/A"}
            </p>
            <p>📍 Location: {selectedEvent.location?.trim() || "N/A"}</p>
            <p>🎓 Club: {selectedEvent.club_name?.trim() || "N/A"}</p>
            <p>📂 Type: {selectedEvent.event_type?.trim() || "N/A"}</p>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">
              {selectedEvent.description?.trim() || "No description."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
