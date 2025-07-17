import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StudentEvents() {
  const [groupedEvents, setGroupedEvents] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    axios
      .get("/api/events")
      .then((res) => {
        groupEventsByClub(res.data);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  const groupEventsByClub = (events) => {
    const grouped = {};
    events.forEach((event) => {
      const key = event?.club_name?.trim() || "Other Clubs";
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(event);
    });
    setGroupedEvents(grouped);
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const renderEventCard = (event) => (
    <div
      key={event._id}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl cursor-pointer transition duration-300 ease-in-out"
      onClick={() => openEventModal(event)}
    >
      <h3 className="text-lg font-bold">
        {event?.title?.trim() || "Untitled Event"}
      </h3>
      <p className="text-gray-600">
        📅 {event?.date ? new Date(event.date).toLocaleDateString() : "Invalid Date"} | 🕒{" "}
        {event?.time?.trim()
          ? new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A"}
      </p>
      <p>📍 Location: {event?.location?.trim() || "N/A"}</p>
      <p>🎓 Club: {event?.club_name?.trim() || "N/A"}</p>
      <p>📂 Type: {event?.event_type?.trim() || "N/A"}</p>
      <p className="text-gray-700 line-clamp-3 mt-2">
        {event?.description?.trim() || "No description."}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Events by Clubs</h2>
      {Object.entries(groupedEvents).map(([clubName, clubEvents]) => (
        <div key={clubName} className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{clubName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clubEvents.map((event) => renderEventCard(event))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full relative">
            <button
              onClick={closeEventModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2">
              {selectedEvent?.title?.trim() || "Untitled Event"}
            </h2>
            <p>
              📅 {selectedEvent?.date
                ? new Date(selectedEvent.date).toLocaleDateString()
                : "Invalid Date"} | 🕒{" "}
              {selectedEvent?.time?.trim()
                ? new Date(`1970-01-01T${selectedEvent.time}`).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>
            <p>
              📍 Location: {selectedEvent?.location?.trim() || "N/A"}
            </p>
            <p>
              🎓 Club: {selectedEvent?.club_name?.trim() || "N/A"}
            </p>
            <p>
              📂 Type: {selectedEvent?.event_type?.trim() || "N/A"}
            </p>
            <p className="mt-3 text-gray-700 whitespace-pre-wrap">
              {selectedEvent?.description?.trim() || "No description."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
