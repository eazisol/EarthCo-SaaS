import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Create, Delete, Update } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const DateEventList = ({ eventsOnDate, onDeleteEvent, handleEventEdit }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const handleDeleteConfirmation = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="btn btn-sm btn-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirmation}
            className="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </DialogActions>
      </Dialog>

      <div className="events">
        <div className="dz-scroll event-scroll">
          <div className="">
            {eventsOnDate.map((event, index) => {
              // Parse the event's start.dateTime
              const eventDate = new Date(event.start.dateTime);
              const endtime = new Date(event.end.dateTime);

              // Define an array of day names
              const dayNames = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ];

              // Get the day name, date, and time
              const dayName = dayNames[eventDate.getDay()];
              const date = eventDate.getDate();
              const hours = eventDate.getHours();
              const minutes = eventDate.getMinutes();

              const enddayName = dayNames[endtime.getDay()];
              const enddate = endtime.getDate();
              const endhours = endtime.getHours();
              const endminutes = endtime.getMinutes();

              // Format the time as "HH:mm AM/PM"
              const formattedTime = `${hours % 12}:${
                minutes < 10 ? "0" : ""
              }${minutes} ${hours >= 12 ? "PM" : "AM"}`;

              const formattedEndTime = `${endhours % 12}:${
                endminutes < 10 ? "0" : ""
              }${endminutes} ${endhours >= 12 ? "PM" : "AM"}`;

              return (
                <div key={index} className="row mt-2">
                  <div className="col-md-2">
                    <div className="event-box">
                      <h5 className="mb-0">{date}</h5>
                      <span>{dayName}</span>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="event-data">
                      <h5 className="mb-0">
                        <NavLink to="https://calendar.google.com/calendar">
                          {event.summary}
                        </NavLink>
                      </h5>
                      <span>{event.description}</span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <span className="text-secondary">
                      Start: {formattedTime}{" "}
                    </span>
                    <span className="text-secondary">
                      End: {formattedEndTime}
                    </span>
                  </div>
                  <div className="col-md-2 text-end">
                    <span
                      className="me-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        handleEventEdit(event);
                      }}
                    >
                      <Create color="success" />
                    </span>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setEventToDelete(event);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Delete color="error" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default DateEventList;
