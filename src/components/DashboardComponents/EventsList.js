import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Create, Delete, Update } from "@mui/icons-material";
import Popover from "@mui/material/Popover";
import { TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import TblDateFormat from "../../custom/TblDateFormat";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const EventsList = ({ eventsList, onDeleteEvent }) => {
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
        <h6>events</h6>
        <div className="dz-scroll event-scroll">
          <div className="scrollable-events">
            {eventsList.filter(event => event.start?.dateTime).map((event, index) => {
              const eventDate = new Date(event.start.dateTime);
              const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const dayName = dayNames[eventDate.getDay()];
              const date = eventDate.getDate();
              const hours = eventDate.getHours();
              const minutes = eventDate.getMinutes();
              const formattedTime = `${hours % 12}:${minutes < 10 ? "0" : ""}${minutes} ${hours >= 12 ? "PM" : "AM"}`;
// console.log("filter event is", event)
              return (
                <div key={index} className="event-media">
                  <div className="d-flex align-items-center">
                    <div className="event-box">
                      <h5 className="mb-0">{date}</h5>
                      <span>{dayName}</span>
                    </div>
                    <div className="event-data ms-2">
                      <h5 className="mb-0">
                        <NavLink to="https://calendar.google.com/calendar">{event.summary}</NavLink>
                      </h5>
                      <span>{event.description}</span>
                    </div>
                  </div>
                  <span className="text-secondary">{formattedTime}</span>

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
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventsList;
