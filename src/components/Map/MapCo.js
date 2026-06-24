import React, { useState, useEffect, useRef, memo, useContext } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { baseUrl, mapKey } from "../../apiConfig";
import { AirlineSeatLegroomExtra } from "@mui/icons-material";
import { Button } from "@mui/material";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import FileUploadButton from "../Reusable/FileUploadButton";
import { TextField } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import useGetApi from "../Hooks/useGetApi";
import EventPopups from "../Reusable/EventPopups";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import html2canvas from "html2canvas";
import MapPdf from "./MapPdf";
import PrintButton from "../Reusable/PrintButton";
import { pdf } from "@react-pdf/renderer";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";

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
  getColoredMarkers,
}) {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [map, setMap] = useState(null);
  const [open, setOpen] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [selectedColoredMarker, setSelectedColoredMarker] = useState({});
  const infoWindowRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);
  const [colorTypeList, setColorTypeList] = useState([]);
  const navigate = useNavigate();
  const { getData, data, isloading } = useGetApi();
  const divRef = useRef(null);

  const filteredMapData = mapData.filter(isLocationInUS);
  const { loggedInUser } = useContext(DataContext);
  // Use menu access for Service Requests Map (/map)
  const menuAccess = useMenuAccess(); // auto-detects from route

  const [markerData, setMarkerData] = useState({
    MeterNumber: "",
  });
  const handleMapClick = (event) => {
    // Block clicks if no edit access
    if (!menuAccess?.canEdit || menuAccess?.isLoading) {
      return;
    }
    if (loggedInUser.userRole == "2") {
      return
    }
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerData({ lat, lng });
    console.log("markers", lat, lng);
    setOpen(true);
    // setMarkerData((prevData) => ({ ...prevData, lat, lng }));
  };

  const trackFile = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      // setFiles((prevFiles) => [...prevFiles, uploadedFile]);
      setMarkerData((prevData) => ({
        ...prevData,
        ControllerPhoto: uploadedFile,
      }));
    }
    console.log("uploaded file is", uploadedFile);
  };
  const fetchSRColorTypes = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestMapColorTypes`,
        { headers }
      );

      setColorTypeList(res.data);
      setMarkerData((prevData) => ({
        ...prevData,
        MeterNumber: "",
        ColorTypeId: res.data[0]?.Id,
        ColorType: res.data[0]?.ColorType,
        Color: res.data[0]?.Color,
      }));
      console.log("color types", res.data);
    } catch (error) {
      console.log("error fetching SR color types", error);
    }
  };
  const deleteColoredMarker = (id) => {

    getData(`/ServiceRequest/DeleteServiceRequestMapLatLong?id=${id}`, () => {
      setOpenModal2(false);
      getColoredMarkers();
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Successfully Deleted Marker");
    });
  };
  const submitMapData = async () => {
    const formData = new FormData();

    if (!markerData.CustomerId) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please Select Customer");
      return;
    }
    if (!markerData.ColorTypeId) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please Select Color");
      return;
    }
    const updatedData = {
      ...markerData,

      ControllerPhoto: markerData.ControllerPhoto
        ? markerData.ControllerPhoto
        : new Blob(
            [
              new Uint8Array(
                atob("R0lGODlhAQABAAAAACwAAAAAAQABAAA=")
                  .split("")
                  .map((c) => c.charCodeAt(0))
              ),
            ],
            { type: "image/gif" }
          ),
    };

    formData.append("LatLongData", JSON.stringify(updatedData));
    // formData.append("ServiceRequestId", JSON.stringify(id));
    console.log("map payload is", updatedData);

    formData.append("Files", updatedData.ControllerPhoto);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };
    for (let [key, value] of formData.entries()) {
      console.log("map payload", key, value);
    }
    // return
    try {
      const response = await axios.post(
        `${baseUrl}/api/ServiceRequest/AddServiceRequestMapLatLong`,
        formData,
        {
          headers,
        }
      );
      getColoredMarkers();
      setTimeout(() => {
        setMarkerData((prevData) => ({
          ...prevData,
          MeterNumber: "",
          ColorTypeId: colorTypeList[0]?.Id,
          ColorType: colorTypeList[0]?.ColorType,
          Color: colorTypeList[0]?.Color,
        }));
        setOpen(false);
      }, 10);
      console.log("Successfully posted map data");
      // Handle successful submission
      // window.location.reload();
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1500);
    } catch (error) {
      console.error("API Call Error:", error.response.data);
    }
    for (let [key, value] of formData.entries()) {
      console.log("filessss", key, value);
    }
  };
  useEffect(() => {
    if (map && filteredMapData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredMapData.forEach((location) => {
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

  useEffect(() => {
    fetchSRColorTypes();
  }, []);

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

  const openInfoWindow = (location) => {
    setSelectedMarker(location);
    setTimeout(() => {
      if (map) {
        map.panTo({ lat: location.lat, lng: location.lng });
        map.setZoom(15); // Adjust zoom level as needed
      }
    }, 500);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const mapRef = useRef(null);

  const handleSavePdf = () => {
    const scaleFactor = 2; // Adjust the scale factor as needed

    html2canvas(mapRef.current, {
      scale: scaleFactor,
      useCORS: true, // Enable cross-origin resource sharing
      allowTaint: true, // Allow images from different origins to be included
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        // setMapImg(imgData);
        setTimeout(() => {
          handleMainButtonClick(imgData);
        }, 1000);
        console.log("imgData", imgData);

      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };
  const handleMainButtonClick = async (image) => {
    try {
      const DocumentComponent = MapPdf;

      // Generate the PDF document
      const blob = await pdf(<DocumentComponent mapImage={image} />).toBlob();

      // Create a File object from the blob
      const pdfFile = new File([blob], `Map.pdf`, {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfFile.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };

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
        open={open}
        onClose={() => {
          // setMarkerData((prevData) => ({
          //   ...prevData,
          //   MeterNumber: "",
          //   ColorTypeId: colorTypeList[0]?.Id,
          //   ColorType: colorTypeList[0]?.ColorType,
          //   Color: colorTypeList[0]?.Color,
          // }));
          setOpen(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h3>Marker Options</h3>
          <div className="row align-items-center mt-2">
            <div className="col-md-4">
              <h6>Customer:</h6>
            </div>
            <div className="col-md-8">
              <CustomerAutocomplete
                formData={markerData}
                setFormData={setMarkerData}
                submitClicked={submitClicked}
              />
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-md-4">
              {" "}
              <h6>Type</h6>
            </div>
            <div className="col-md-12">
              <div className="row pb-2">
                {colorTypeList?.map((type, index) => (
                  <div
                    style={{
                      borderRight: index % 2 !== 1 ? "1px solid #ccc" : "",
                    }}
                    className="col-md-6 d-flex pt-2"
                    key={index}
                    onClick={() => {
                      setMarkerData((prevData) => ({
                        ...prevData,
                        ColorTypeId: type.Id,
                        ColorType: type.ColorType,
                        Color: type.Color,
                      }));
                    }}
                  >
                    <input
                      type="checkbox"
                      name=""
                      id={`clrcheckbox${index}`}
                      className="form-check-input me-2 "
                      checked={type.Id == markerData.ColorTypeId}
                    />
                    <label
                      htmlFor={`#clrcheckbox${index}`}
                      className="me-2 w-75"
                    >
                      {type.ColorType}
                    </label>
                    <div
                      style={{
                        height: "20px",
                        width: "20px",
                        backgroundColor: type.Color,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row align-items-center mt-2">
            <div className="col-md-4">
              <h6>Meter Number:</h6>
            </div>
            <div className="col-md-8">
              <TextField
                size="small"
                fullWidth
                value={markerData.MeterNumber}
                onChange={(e) => {
                  setMarkerData((prevData) => ({
                    ...prevData,
                    MeterNumber: e.target.value,
                  }));
                  console.log("color", e.target.value);
                }}
              />
            </div>
          </div>
          <div className="row align-items-center mt-2">
            <div className="col-md-4 pe-0">
              <h6>Controller Photo:</h6>
            </div>
            <div className="col-md-8">
              <FileUploadButton onClick={trackFile}>
                Controller Photo
              </FileUploadButton>
            </div>
            <div className="row">
              <div className="col-md-4 "></div>
              {markerData?.ControllerPhoto ? (
                <img
                  className="mt-2"
                  src={URL.createObjectURL(markerData?.ControllerPhoto)}
                  style={{
                    width: "115px",
                    height: "110px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="row align-items-center justify-content-end mt-2">
            <button
              type="button"
              className="btn btn-danger light me-2 w-auto"
              onClick={() => {
                setOpen(false);
                setMarkerData((prevData) => ({
                  ...prevData,
                  MeterNumber: "",
                  ColorTypeId: colorTypeList[0]?.Id,
                  ColorType: colorTypeList[0]?.ColorType,
                  Color: colorTypeList[0]?.Color,
                }));
              }}
            >
              Close
            </button>

            <button
              type="button"
              className="btn btn-primary me-2  w-auto"
              onClick={() => {
                console.log("markerData", markerData);

                submitMapData();
              }}
            >
              Save
            </button>
          </div>
        </Box>
      </Modal>
      <Modal
        open={openModal2}
        onClose={() => {
          // setMarkerData((prevData) => ({
          //   ...prevData,
          //   MeterNumber: "",
          //   ColorTypeId: colorTypeList[0]?.Id,
          //   ColorType: colorTypeList[0]?.ColorType,
          //   Color: colorTypeList[0]?.Color,
          // }));
          setOpenModal2(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h3>Marker Info</h3>
          <div className="row align-items-center">
            <div className="col-md-12">
              {" "}
              <h6>Type: {selectedColoredMarker.ColorType}</h6>
            </div>
            <div className="col-md-12">
              {" "}
              <h6>Customer: {selectedColoredMarker.FirstName}</h6>
            </div>
            <div className="col-md-12">
              <div className="row pb-2"></div>
            </div>
          </div>
          <div className="row align-items-center mt-2">
            <div className="col-md-12">
              <h6>Meter Number: {selectedColoredMarker.MeterNumber}</h6>
            </div>
          </div>
          <div className="row align-items-center mt-2">
            <div className="col-md-4 pe-0">
              <h6>Controller Photo:</h6>
            </div>
            <div className="col-md-8"></div>
            <div className="row">
              <div className="col-md-4 "></div>
              {selectedColoredMarker?.FilePath ? (
                <img
                  className="mt-2"
                  src={baseUrl + "/" + selectedColoredMarker?.FilePath}
                  style={{
                    width: "115px",
                    height: "110px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="row align-items-center justify-content-end mt-2">
            <button
              type="button"
              className="btn btn-secondary  me-2 w-auto"
              onClick={() => {
                setOpenModal2(false);
                setMarkerData((prevData) => ({
                  ...prevData,
                  MeterNumber: "",
                  ColorTypeId: colorTypeList[0]?.Id,
                  ColorType: colorTypeList[0]?.ColorType,
                  Color: colorTypeList[0]?.Color,
                }));
              }}
            >
              Close
            </button>

            <button
              type="button"
              className="btn btn-danger me-2  w-auto"
              onClick={() => {
                console.log("markerData", markerData);

                deleteColoredMarker(
                  selectedColoredMarker.ServiceRequestMapLatLongId
                );
              }}
            >
              Delete
            </button>
          </div>
        </Box>
      </Modal>

      <div className="mb-2 text-end">
       
        <PrintButton varient="Download" onClick={handleSavePdf}></PrintButton>
      </div>
      <div className="" ref={mapRef}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={1}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
          {mapData.length > 0 &&
            mapData.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => openInfoWindow(location)}
              />
            ))}

          {coloredMarkersList.length > 0 &&
            coloredMarkersList.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => {
                  if (loggedInUser.userRole == "2") {
                    return
                  }
                  setSelectedColoredMarker(location);
                  setOpenModal2(true);
                }}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 3.86 5 11 7 13 2-2 7-9.14 7-13 0-3.87-3.13-7-7-7zm0 10.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 5.5 12 5.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z",
                  fillColor: location.Color || "#ff0000",
                  fillOpacity: 1,
                  strokeWeight: 0,
                  scale: 1.5,
                  anchor: getAnchorPoint(), // (X offset, Y offset),
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
              />
            ))}

          {selectedMarker && (
            <InfoWindow
              ref={infoWindowRef}
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="">
                <h6 className="pb-0 mb-0">
                  <strong>Service Request #:</strong>
                </h6>
                <div
                  style={{ cursor: (menuAccess?.canEdit && !menuAccess?.isLoading) ? "pointer" : "not-allowed", color: "blue", opacity: (menuAccess?.canEdit && !menuAccess?.isLoading) ? 1 : 0.6 }}
                  onClick={() => {
                    if (!menuAccess?.canEdit || menuAccess?.isLoading) {
                      return;
                    }
                    if (loggedInUser.userRole == "2") {
                      navigate(
                        `/service-requests/service-request-preview?id=${selectedMarker.ServiceRequestId}&customerId=${loggedInUser.userId}`
                      );
                      return
                    }
                   
                    navigate(
                      `/service-requests/add-sRform?id=${selectedMarker.ServiceRequestId}`
                    );
                  }}
                >
                  <p className="mt-0 pt-0" style={{ lineHeight: "1.3" }}>
                    {selectedMarker.ServiceRequestNumber}
                  </p>
                </div>
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
