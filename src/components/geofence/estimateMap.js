import React, { useState, useEffect, useRef, memo, useContext } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
  useLoadScript,
} from "@react-google-maps/api";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { mapKey } from "../../apiConfig";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Cookies from "js-cookie";
import useGetApi from "../Hooks/useGetApi";
import EventPopups from "../Reusable/EventPopups";
import { DataContext } from "../../context/AppData";
import LoaderButton from "../Reusable/LoaderButton";
import { Button } from "@mui/material";

const containerStyle = {
  width: "100%",
  height: "400px",
};
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #fff",
  borderRadius: "10px",
  boxShadow: 24,
  p: 2,
};
const defaultCenter = {
  lat: 31.4237697,
  lng: 74.2678971,
};

const US_LATITUDE_RANGE = [24.396308, 49.384358];
const US_LONGITUDE_RANGE = [-125.0, -66.93457];

const isLocationInUS = (location) => {
  return (
    location.lat >= US_LATITUDE_RANGE[0] &&
    location.lat <= US_LATITUDE_RANGE[1] &&
    location.lng >= US_LONGITUDE_RANGE[0] &&
    location.lng <= US_LONGITUDE_RANGE[1]
  );
};

function GoogleMapApi({
  mapData = [],
  toolTipData,
  coloredMarkersList,
  radius,
  setRadius,
  submitRadius,
  openModal2,
  setOpenModal2,
  selectedColoredMarker,
  setSelectedColoredMarker,
  radiusLoader
}) {
  const token = Cookies.get("token");
  const [map, setMap] = useState(null);
  const [open, setOpen] = useState(false);
  const infoWindowRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const navigate = useNavigate();
  const { getData, data, isloading } = useGetApi();
  const divRef = useRef(null);

  const filteredMapData = mapData?.filter(isLocationInUS);
  const { loggedInUser } = useContext(DataContext);

  const [markerData, setMarkerData] = useState({
    MeterNumber: "",
  });
  const handleMapClick = (event) => {
    if (loggedInUser.userRole == "2") {

      return
    }
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerData({ lat, lng });
    setOpen(true);
    // setMarkerData((prevData) => ({ ...prevData, lat, lng }));
  };


  useEffect(() => {
    if (map && filteredMapData?.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredMapData?.forEach((location) => {
        if (isFinite(location.lat) && isFinite(location.lng)) {
          bounds.extend(
            new window.google.maps.LatLng(location.lat, location.lng)
          );
        }
      });
      map.fitBounds(bounds);
    }
  }, [map]);

  useEffect(() => {
    if (
      map &&
      toolTipData &&
      isFinite(toolTipData.lat) &&
      isFinite(toolTipData.lng)
    ) {
      openInfoWindow(toolTipData);
    }
  }, [map, toolTipData]);

  const onLoad = (map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };
  const getAnchorPoint = () => {
    if (window.google && window.google.maps) {
      return new window.google.maps.Point(10, 20);
    }
    return null; // Or a default fallback if it's not available
  };
  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const openInfoWindow = (location) => {
    setSelectedMarker(location);
    setTimeout(() => {
      if (map) {
        map.panTo({ lat: location.lat, lng: location.lng });
        map.setZoom(15); // Adjust zoom level as needed
      }
    }, 500);
  };
  const mapRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      // handleSavePdf();
    }, 1000);
  }, [mapData, coloredMarkersList]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapKey,
    libraries: ["places"],
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded)
    return (
      <div className="map-loader">
        <CircularProgress />
      </div>
    );

  return (
    <div>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />

      <Modal
        open={openModal2}
        onClose={() => {
          setOpenModal2(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h3>Set Radius</h3>
          <div className="row align-items-center">
            <div className="col-md-12">
              <h6>Customer: <span style={{ fontWeight: "normal", color: "#2c2c2c" }}>{selectedColoredMarker.CustomerDisplayName || selectedColoredMarker?.DisplayName}</span></h6>
            </div>
          </div>
          {selectedColoredMarker.Address && <div className="row align-items-center mt-1">
            <div className="col-md-12">
              <h6>Address: <span style={{ fontWeight: "normal", color: "#2c2c2c" }}>{selectedColoredMarker.Address}</span></h6>
            </div>
          </div>}
          <div className="row align-items-center mt-2">
            <div className="col-md-12">
              <label htmlFor="radiusInput" className="form-label">
                Radius (m):
              </label>
              <input
                style={{ width: "40%" }}
                type="number"
                className="form-control"
                id="radiusInput"
                placeholder="Enter radius"
                min={0}
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </div>
          </div>

          {/* <Box mt={3} display="flex" justifyContent="flex-end">
            <Button size="small" variant="outlined" onClick={() => {
              setOpenModal2(false);
            }} sx={{ mr: 1 }}>

              Cancel
            </Button>
            <LoaderButton
              disable={radiusLoader}
              loading={radiusLoader}
              handleSubmit={() => {
                submitRadius()
              }}
            >
              Save
            </LoaderButton>
          </Box> */}
          <div className="row align-items-center justify-content-end mt-2">
            
            <button
              type="button"
              className="btn btn-danger light me-2 w-auto"
              onClick={() => {
                  setOpenModal2(false);
                
              }}
            >
              Close
            </button>
         
        
            <button
              type="button"
              className="btn btn-primary me-2 w-auto"
              disabled={radiusLoader}
              style={{
                minWidth: "80px", // Set a fixed min width to prevent width change
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => {
                submitRadius();
              }}
            >
              {radiusLoader ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                  <CircularProgress size={16} />
                </span>
              ) : (
                "Save"
              )}
            </button>
          
        </div>
        </Box>
      </Modal>


      <div className="" ref={mapRef}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={1}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
          {mapData?.length > 0 &&
            mapData?.map((location, index) => {
              return (
                <React.Fragment key={index}>
                  <Marker
                    position={{ lat: location.lat, lng: location.lng }}
                    onClick={() => {
                      setSelectedColoredMarker(location);
                      setRadius(location?.LocationRadius);
                      setOpenModal2(true);
                    }}
                  />
                  {location.LocationRadius > 0 && (
                    <>
                      <Circle
                        center={{ lat: location?.lat, lng: location?.lng }}
                        radius={Number(location?.LocationRadius)}
                        options={{
                          strokeColor: '#5b7929',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          fillColor: '#b7cf91',
                          fillOpacity: 0.1,
                        }}
                      />
                      {/* Radius text overlay */}
                      <Marker
                        position={{ lat: location?.lat, lng: location?.lng }}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="60" height="30" xmlns="http://www.w3.org/2000/svg">
                              <rect width="60" height="30" fill="rgba(0,0,0,0.7)" rx="15" stroke="white" stroke-width="1"/>
                              <text x="30" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">
                                ${location.LocationRadius}m
                              </text>
                            </svg>
                          `),
                          scaledSize: new window.google.maps.Size(60, 30),
                          anchor: new window.google.maps.Point(30, 15)
                        }}
                        zIndex={1000}
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}

          {selectedMarker && (
            <InfoWindow
              ref={infoWindowRef}
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={handleInfoWindowClose}
            >
              <div >
                <div>
                  <h6 className="pb-0 mb-0">
                    <strong>Customer:</strong>
                  </h6>
                </div>{" "}
                <div>
                  <p className="mt-0 pt-0" style={{ lineHeight: "1.3" }}>
                    {selectedMarker.CustomerDisplayName}
                  </p>
                </div>
                <h6 className="pb-0 mb-0">
                  <strong>Address:</strong>
                </h6>
                <p
                  className="mt-0 pt-0"
                  style={{ lineHeight: "1.3", maxWidth: "17em" }}
                >
                  {selectedMarker.Address}
                </p>
              </div>
            </InfoWindow>
          )}

        </GoogleMap>
      </div>
    </div>
  );
}

export default memo(GoogleMapApi);
