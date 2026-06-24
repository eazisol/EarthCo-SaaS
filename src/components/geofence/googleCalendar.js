import React, { useState, useEffect, useContext } from "react";
import TitleBar from "../TitleBar";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import moment from 'moment';
import axios from 'axios';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DataContext } from "../../context/AppData";
import { GoogleMap, Circle, Marker, InfoWindow } from "@react-google-maps/api";
import CircularProgress from "@mui/material/CircularProgress";
import EventPopups from "../Reusable/EventPopups";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import { useNavigate } from 'react-router-dom';
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';



const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const CustomEvent = ({ event }) => {
  const lines = event.title.split('\n');
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'flex-start',
      padding: '2px 4px',
      fontSize: '11px',
      lineHeight: '1.1'
    }}>
      {lines.map((line, index) => (
        <div 
          key={index} 
          style={{ 
            fontWeight: index === 0 ? 'bold' : 'normal',
            fontSize: index === 0 ? '12px' : '10px',
            marginBottom: index < lines.length - 1 ? '1px' : '0'
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

// Custom header component to highlight current date
const CustomHeader = ({ label, date }) => {
  const today = moment();
  const isToday = moment(date).isSame(today, 'day');
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '8px 4px'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: isToday ? '600' : '400',
        color: isToday ? '#7b9b43' : '#000000',
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: '1.2'
      }}>
        {label}
      </div>
    </div>
  );
};

// Custom Toolbar for Calendar with Green Header Design
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToToday = () => {
    toolbar.onNavigate('TODAY');
  };

  let label = toolbar.label;

  return (
    <div 
      className="rbc-toolbar d-flex align-items-center justify-content-between mb-3" 
      style={{ 
        gap: 8,
        padding: "0px 16px",
        flexWrap: "nowrap"
      }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          flex: "0 0 auto",
          gap: 0,
          flexWrap: "nowrap",
          height: "36px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "36px",
            gap: "0px",
          }}
        >
          <div
            onClick={goToBack}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              margin: 0,
              outline: "none",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "16px",
              width: "36px",
              height: "36px",
              justifyContent: "center",
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </div>
          <div
            onClick={goToNext}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              margin: 0,
              outline: "none",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "16px",
              width: "36px",
              height: "36px",
              justifyContent: "center",
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
        </div>
          <div
          onClick={goToToday}
          style={{
              minWidth: "120px",
              height: "36px",
              borderRadius: "8px",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              marginLeft: "8px",
            outline: "none",
              transition: "all 0.2s ease",
            cursor: "pointer",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
          }}
            aria-label="Go to today"
            title="Go to today"
        >
            {label}
          </div>
        </div>
      </div>
      
      <span style={{ flex: "1 1 auto" }} />
      
      <div style={{ display: "flex", gap: "12px", flex: "0 0 auto", whiteSpace: "nowrap", flexWrap: "nowrap" }}>
        <select
          value={toolbar.view}
          onChange={(e) => toolbar.onView(e.target.value)}
            style={{
              height: "30px",
            minWidth: "100px",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "500",
              outline: "none",
            padding: "0 40px 0 14px",
              cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            backgroundImage: "url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\" fill=\"none\"><path d=\"M6 9l4 4 4-4\" stroke=\"%236b7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "16px",
            borderRadius: "4px",
          }}
         
        >
          {toolbar.views.map((view) => (
            <option key={view} value={view} style={{ textTransform: "capitalize", fontWeight: "500" }}>
              {`${view.charAt(0).toUpperCase()}${view.slice(1)} View`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const GoogleCalendar = () => {
  const [events, setEvents] = useState([]);
  const [geofenceLocations, setGeofenceLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [foremenList, setForemenList] = useState([]);
  const [filteredForemenList, setFilteredForemenList] = useState([]);
  const [loadingForemen, setLoadingForemen] = useState(true);
  const [selectedForeman, setSelectedForeman] = useState(null);
  const [foremanEvents, setForemanEvents] = useState([]);
  const [estimtates, setEstimtates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { loggedInUser } = useContext(DataContext);
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const fetchForemen = async () => {
    setLoadingForemen(true);
    try {
      const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
        headers,
      });

      const foremen = response.data.filter(staff => staff.Role === "Foreman");
      setForemenList(foremen);
      setFilteredForemenList(foremen);
      if (foremen.length > 0 && !selectedForeman) {
        setSelectedForeman(foremen[0]);
      }
    } catch (error) {
      console.error("Error fetching foremen list:", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Error fetching foremen list");
    } finally {
      setLoadingForemen(false);
    }
  };
  const fetchEstimtates = async () => {
    try {
      setLoading(true);
      if (!selectedForeman?.UserId) {
        setEstimtates([]);
        setEvents([]);
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimateServerSideList?Search=&DisplayStart=1&DisplayLength=50&StatusId=0&isAscending=0&isPurchaseOrder=2&isBill=2&isInvoice=2&isRegionalManager=0&isBillSort=2&isInvoiceSort=0&isProfit=0&isApprovedDate=0&StartDate=null&EndDate=null&EstimateTypeId=0&ForemanId=${selectedForeman?.UserId}&isForemanOnly=1`,
        { headers }
      );
      const estimates = response?.data?.Data || [];
      setEstimtates(estimates);
      const mappedEvents = estimates.map((estimate) => {
        const startDate = estimate?.IssueDate ? new Date(estimate.IssueDate) : new Date();
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const customerName = estimate?.CustomerDisplayName || estimate?.CustomerCompanyName || 'Customer';
        const estimateNumber = estimate?.EstimateNumber || '';
        const address = estimate?.Address || '';
        const title = `${customerName}\nEstimate #${estimateNumber}`;
        
        return {
          id: estimate?.EstimateId,
          title: title,
          start: startDate,
          end: endDate,
          description: estimate?.DescriptionofWork || '',
          // location: estimate?.Address || '',
          statusColor: estimate?.StatusColor || undefined,
          geofence: (estimate?.lat && estimate?.lng) ? {
            lat: Number(estimate.lat),
            lng: Number(estimate.lng),
            radius: Number(estimate?.LocationRadius || 0)
          } : null,
          raw: estimate,
        };
      });
      setEvents(mappedEvents);
      setForemanEvents(mappedEvents);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setEstimtates([]);
        setEvents([]);
        setForemanEvents([]);
      } else {
        setEstimtates([]);
        setEvents([]);
        setForemanEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEstimtates();
  }, [selectedForeman]);
  useEffect(() => {
    fetchForemen();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredForemenList(foremenList);
    } else {
      const filtered = foremenList.filter(foreman =>
        `${foreman.FirstName} ${foreman.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        foreman.FirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        foreman.LastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredForemenList(filtered);
    }
  }, [searchTerm, foremenList]);
  useEffect(() => {
    if (!selectedForeman) {
      setForemanEvents([]);
    }
  }, [selectedForeman, events]);
  const handleForemanSelect = (foreman) => {
    setSelectedForeman(foreman);
    const filteredEvents = events.filter(event =>
      event.description && event.description.includes(foreman.FirstName) ||
      event.title && event.title.includes(foreman.FirstName)
    );
    setForemanEvents(filteredEvents);
  };
  const handleEventClick = (event) => {
    if (event.id) {
      navigate(`/estimates/add-estimate?id=${event.id}`);
    }
  };
  const estimateDataByid = async (id) => {
    const response = await axios.get(
      `${baseUrl}/api/Estimate/GetEstimate?id=${id}`,
      { headers }
    );
    return response.data;
  }
  const handleEventDrop = async ({ event, start, end, isAllDay, allDay }) => {
    const movedEventId = event.id;
    const optimisticEvent = { ...event, start, end, allDay: allDay ?? isAllDay };
    const updateList = (list) => list.map((e) => (e.id === movedEventId ? optimisticEvent : e));

    // Keep previous state for revert
    const previousEvents = events;
    const previousForemanEvents = foremanEvents;

    // Optimistic UI update
    setEvents((prev) => updateList(prev));
    if (selectedForeman) {
      setForemanEvents((prev) => updateList(prev));
    }

    try {
      const estimateData = await estimateDataByid(movedEventId);
      const newDate = moment(start).format("YYYY-MM-DDTHH:mm:ss");

      const postData = new FormData();
      const updatedPayload = {
        ...estimateData.EstimateData,
        IssueDate: newDate,
      };
      postData.append("EstimateData", JSON.stringify(updatedPayload));
      postData.append("isCopy", 0);
      postData.append("Files", estimateData?.EstimateData?.tblEstimateFiles);

      await axios.post(
        `${baseUrl}/api/Estimate/AddEstimate`,
        postData,
        { headers }
      );

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText("Event rescheduled successfully");
    } catch (error) {
      // Revert on failure
      setEvents(previousEvents);
      if (selectedForeman) {
        setForemanEvents(previousForemanEvents);
      }
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Failed to save change. Reverted.");
    }
  };
  const eventStyleGetter = (event) => {
    const hasGeofence = event.geofence !== null;
    const backgroundColor = event?.statusColor;
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        color: 'white',
        border: '0px',
        display: 'block',
        cursor: 'grab',
        // minHeight: '50px',
        padding: '4px 4px',
        fontSize: '12px',
        lineHeight: '1.2',
        whiteSpace: 'pre-line', 
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    };
  };
  return (
    <>
      <TitleBar
        icon={<CalendarMonthIcon fontSize="large" />}
        title={"Job Calendar"}
      />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 " >
            <div className="card h-100" style={{padding:0}}>
              <div className="card-body p-0">
                <div className="p-2 border-bottom">
                  <h4 className="card-title mb-0">Foremen</h4>
                </div>
                {loadingForemen? (
                  <div className="text-center py-4">
                    <CircularProgress size={30} />
                    <p className="mt-2 mb-0">Loading foremen...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 ">
                      <FormControl variant="standard" fullWidth>
                        <TextField
                          value={searchTerm}
                          placeholder="Search Foreman"
                          className="bg-white"
                          variant="outlined"
                          size="small"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon color="#ccc" />
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                          }}
                        />
                      </FormControl>
                    </div>
                    <div style={{ height: "calc(100vh - 300px)", overflowY: "auto" }}>
                      <ul className="list-group list-group-flush">
                        {filteredForemenList.length > 0 ? (
                          filteredForemenList.map((foreman) => (
                            <li
                              key={foreman.UserId}
                            
                              className={
                                selectedForeman && selectedForeman.UserId === foreman.UserId
                                  ? "list-group-item active cursor-pointer border-0"
                                  : "list-group-item cursor-pointer border-0"
                              }
                              onClick={() => handleForemanSelect(foreman)}
                              style={{ 
                                borderBottom: "1px solid #dee2e6",
                                borderRadius: 0,
                                cursor: "pointer",
                                zIndex:"auto"
                              }}
                            >
                              <div className="d-flex flex-column">
                                { selectedForeman && selectedForeman.UserId === foreman.UserId? <strong >{`${foreman.FirstName} ${foreman.LastName}`}</strong>:   <h4 className="card-title mb-0">{`${foreman.FirstName} ${foreman.LastName}`}</h4>} 
                              </div>
                            </li>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="mb-0 text-muted">No foremen available</p>
                          </div>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-9">
            <div className="card h-100" style={{padding:0}}>
              <div className="card-body">
                

                {loading||loadingForemen ? (
                  <div className="text-center py-5">
                    <CircularProgress />
                    <p className="mt-3">Loading calendar events...</p>
                  </div>
                ) : (
                  <div style={{ height: '100%' }}>
                    <DnDCalendar
                      localizer={localizer}
                      events={selectedForeman ? foremanEvents : events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: '100%' }}
                      onSelectEvent={handleEventClick}
                      onEventDrop={handleEventDrop}
                      draggableAccessor={() => true}
                      eventPropGetter={eventStyleGetter}
                      components={{
                        event: CustomEvent,
                        toolbar: CustomToolbar, // Use custom toolbar with arrow buttons
                        header: CustomHeader, // Use custom header to highlight current date
                      }}
                      views={['month', 'week']}
                      // views={['month', 'week', 'day']}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

     
      </div>

      {/* Notification */}
      <EventPopups
        openSnackBar={openSnackBar}
        setOpenSnackBar={setOpenSnackBar}
        snackBarColor={snackBarColor}
        snackBarText={snackBarText}
      />
    </>
  );
};