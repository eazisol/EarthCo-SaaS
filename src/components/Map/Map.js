import React, { useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import MapCo from "./MapCo";
import Cookies from "js-cookie";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { CircularProgress } from "@mui/material";
import EventPopups from "../Reusable/EventPopups";
import { baseUrl } from "../../apiConfig";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import { DataContext } from "../../context/AppData";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import Authorization from "../Reusable/Authorization";
const Map = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const { loggedInUser } = useContext(DataContext);

  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSR, setselectedSR] = useState(null);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [primaryColor, setPrimaryColor] = useState(""); // default

  useEffect(() => {
    const color = Cookies.get("PrimeryColor");
    if (color) setPrimaryColor(color);
  }, []);

  const [formData, setFormData] = useState({
    // SRTypeId:
    //   loggedInUser.userRole == 6 ? 8 : loggedInUser.userRole == 5 ? 3 : 1,
    SRTypeId: 0,
    pageLength: 50,
    CustomerId : idParam || 0
  });

  const [mapData, setMapData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coloredMarkersList, setColoredMarkersList] = useState([]);

  const [sRTypes, setSRTypes] = useState([]);
  const fetchSRTypes = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestTypes`,
        { headers }
      );
      console.log("service request types are", res.data);

      let filteredSRTypes = res.data; // Initialize with the original data

      if (loggedInUser.userRole == 5) {
        filteredSRTypes = res.data.filter((option) => option.SRTypeId === 3);
      }
      if (loggedInUser.userRole == 6) {
        filteredSRTypes = res.data.filter((option) => option.SRTypeId === 8);
      }

      setSRTypes([{ Type: "All", SRTypeId: 0 }, ...filteredSRTypes]);
    } catch (error) {
      console.log("error fetching SR types", error);
    }
  };

  const [scrollLoader, setScrollLoader] = useState(false);
  const getSRMap = async () => {
    setScrollLoader(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestListForMap?DisplayStart=${0}&DisplayLength=${
          formData.pageLength
        }&CustomerId=${formData.CustomerId}&SRTypeId=${formData.SRTypeId}`,
        {
          headers,
        }
      );
      setScrollLoader(false);
      console.log("map Data", response.data);
      setMapData(response.data);
      setCustomers(response.data);
      setIsLoading(false);
      // window.location.reload();
    } catch (error) {
      setIsLoading(false);
      setScrollLoader(false);
      setMapData([]);
      console.error("There was an error getting map:", error);
    }
  };
  const getColoredMarkers = async () => {
    setScrollLoader(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestMapLatLong?Id=${formData.CustomerId}`,
        {
          headers,
        }
      );
      setColoredMarkersList(response.data);
      console.log("getColoredMarkers", response.data);

      // window.location.reload();
    } catch (error) {
      setColoredMarkersList([]);
      console.error("There was an error getting map:", error);
    }
  };

  useEffect(() => {
    getColoredMarkers();
  }, [formData.CustomerId]);

  const filteredMapData =
    selectedType === "All"
      ? mapData
      : mapData
          .filter((map) => {
            if (!map) {
              return false;
            }

            const typeMatches =
              selectedType === "Select Type" || map.Type === selectedType;

            const queryMatches =
              (map.ServiceRequestNumber &&
                map.ServiceRequestNumber.toLowerCase().includes(
                  searchQuery.toLowerCase()
                )) ||
              (map.CustomerName &&
                map.CustomerName.toLowerCase().includes(
                  searchQuery.toLowerCase()
                )) ||
              (map.Type &&
                map.Type.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (map.Address &&
                map.Address.toLowerCase().includes(searchQuery.toLowerCase()));

            return typeMatches && queryMatches;
          })
          .sort((a, b) => b.ServiceRequestId - a.ServiceRequestId);

  const [toolTipData, setToolTipData] = useState({});

  const getLatLngs = (map) => {
    if (!map.lat) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Location not Found");
      return;
    }

    setToolTipData(map);
  };

  useEffect(() => {
    fetchSRTypes();
  }, []);

  useEffect(() => {
    getSRMap();
  }, [formData]);

  if (isLoading) {
    return (
      <div className="center-loader">
        <CircularProgress></CircularProgress>
      </div>
    );
  }

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-5">
                <div>
                  <div>
                    {/*  <label>Search</label>
                    <input
                      type="text"
                      className="form-control input-default "
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search SR #, Customer Name, Address, Type "
                    /> */}
                    <Authorization allowTo={[1, 4, 5, 6]} hide>
                      <label className="form-label">Select Customer</label>

                      <CustomerAutocomplete
                        formData={formData}
                        setFormData={setFormData}
                        submitClicked={false}
                      />
                    </Authorization>
                  </div>
                  <div className="mt-2">
                    <label>Select Type</label>
                    {/* <Form.Select
                      className="form-control bg-white"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Inspect and Advise">
                        Inspect and Advise
                      </option>
                      <option value="Irrigation">Irrigation</option>
                      <option value="Irrigator Form">Irrigator Form</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Other">Other</option>
                      <option value="Proposal Needed">Proposal Needed</option>
                      <option value="Tree Care">Tree Care</option>
                      <option value="Spray Tech">Spray Tech</option>
                    </Form.Select> */}
                    <FormControl fullWidth variant="outlined">
                      <Select
                        name="SRTypeId"
                        value={formData.SRTypeId || 0}
                        onChange={(e) => {}}
                        size="small"
                      >
                        {sRTypes.map((type) => (
                          <MenuItem
                            key={type.SRTypeId}
                            value={type.SRTypeId}
                            onClick={() => {
                              setFormData((prevData) => ({
                                ...prevData,
                                Type: type.Type,
                                SRTypeId: type.SRTypeId,
                              }));
                            }}
                          >
                            {type.Type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>

                  <div className=" mt-2  ">
                    <div className="pt-0">
                      <div className="tab-content">
                        <div style={{ height: "70vh", overflowY: "scroll" }}>
                          {mapData.length <= 0 ? (
                            <h4 className="mt-3 text-center">
                              No Record Found
                            </h4>
                          ) : (
                            mapData.map((map) => (
                              <div
                                style={{ cursor: "pointer" }}
                                key={map.ServiceRequestId}
                                className="tab-pane active"
                              >
                                <div className="row serviceLocations py-0">
                                  <div
                                    onClick={() => {
                                      getLatLngs(map);
                                      setselectedSR(map.ServiceRequestId);
                                    }}
                                    className="col-md-12"
                                  >
                                    <div
                                      className={
                                        selectedSR === map.ServiceRequestId
                                          ? "locationInfo selected-map"
                                          : "locationInfo"
                                      }
                                    >
                                          <div className="col-md-3 flex-box" style={{backgroundColor:primaryColor,color:"white"   }}>
                                        <p>{map.ServiceRequestNumber}</p>
                                      </div>
                                      <div className="col-md-9">
                                        <div className="media-body">
                                          <h6 className="mb-1">
                                            {map.CustomerDisplayName}
                                          </h6>
                                          <p className="mb-1">{map.Address}</p>
                                          <span className="badge badge-primary">
                                            {map.Type}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          <div
                            className="row text-center justify-content-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                pageLength: formData.pageLength + 10,
                              });
                            }}
                          >
                            {scrollLoader ? (
                              <div style={{ height: "10em" }}>
                                <CircularProgress></CircularProgress>
                              </div>
                            ) : (
                              <>
                                {mapData.length <= 0 ? (
                                  <></>
                                ) : (
                                  <h4>Load More</h4>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <MapCo
                  mapData={mapData}
                  toolTipData={toolTipData}
                  coloredMarkersList={coloredMarkersList}
                  getColoredMarkers={getColoredMarkers}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Map;
