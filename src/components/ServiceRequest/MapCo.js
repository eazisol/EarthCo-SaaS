import React, { useEffect, useRef, useState, useContext } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  InfoWindow,
} from "@react-google-maps/api";
import { CircularProgress, TextField } from "@mui/material";
import { toPng } from "html-to-image";
import { DataContext } from "../../context/AppData";
import SyncIcon from "@mui/icons-material/Sync";
import html2pdf from "html2pdf.js";
import LoadingButton from "@mui/lab/LoadingButton";
import SendIcon from "@mui/icons-material/FileDownloadOutlined";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { baseUrl, mapKey } from "../../apiConfig";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import FileUploadButton from "../Reusable/FileUploadButton";
import PlaceIcon from '@mui/icons-material/Place';
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
const containerStyle = {
  width: "100%",
  height: "42rem",
};

const libraries = ["places"];

function GoogleMapApi({ setFiles, colorTypeList,srNumber }) {
  const { sRMapData, setSRMapData } = useContext(DataContext);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapKey, // Replace with your API key
    libraries,
  });

  const divRef = useRef(null);
  const searchInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markerData, setMarkerData] = useState({
    MeterNumber: "",
  });
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [open, setOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(14);
  const handleZoomChange = (newZoomLevel) => {
    setZoomLevel(newZoomLevel);
  };
  useEffect(() => {
    handleCurrentLocation();
    setTimeout(() => {
      // handleZoomChange(zoomLevel - 1);
    }, 1000);
  }, []);

  useEffect(() => {
    setMarkerData((prevData) => ({
      ...prevData,
      MeterNumber: "",
      ColorTypeId: colorTypeList[0]?.Id,
      ColorType: colorTypeList[0]?.ColorType,
      Color: colorTypeList[0]?.Color,
    }));
   
  }, [colorTypeList]);

  

  const refreshMap = () => {
    if (map && sRMapData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      sRMapData.forEach((marker) => {
        if (marker.lat && marker.lng) {
          bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
        } else {
          console.error("Invalid marker data:", marker);
        }
      });
      map.fitBounds(bounds);
    }
  };
  const [refreshCount, setRefreshCount] = useState(0);
  useEffect(() => {
    setRefreshCount(refreshCount + 1);
    setTimeout(() => {
      if (refreshCount < 1) {
        refreshMap();
      }
    }, 2000);
  }, [sRMapData]);

  useEffect(() => {
    if (map && sRMapData.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      sRMapData.forEach((marker) => {
        // Ensure lat and lng are defined and valid numbers
        if (
          marker &&
          typeof marker.lat == "number" &&
          typeof marker.lng == "number"
        ) {
          bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
        } else {
          console.error("Invalid marker data:", marker);
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      } else {
        console.warn(
          "Bounds were not set because no valid markers were provided."
        );
      }
    }
    console.log("Markers:", sRMapData);
  }, [map, sRMapData]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentMarkers = [{ lat: latitude, lng: longitude }];
          if (sRMapData.length == 0) {
            setSRMapData(currentMarkers);
          }
          if (map) {
            map.panTo({ lat: latitude, lng: longitude });
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setOpen(true);
    setMarkerData((prevData) => ({ ...prevData, lat, lng }));
    return;
    setSRMapData((prevMarkers) => [...prevMarkers, { lat, lng }]);
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

  const onLoad = (map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const handleSearch = () => {
    const input = searchInputRef.current;
    if (!input) return;
    const autocomplete = new window.google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const newMarkers = [
        ...sRMapData,
        {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
      ];
      setSRMapData(newMarkers);

      if (map) {
        map.panTo(place.geometry.location);
      }
    });
  };

  const [imgSaveLoading, setImgSaveLoading] = useState(false);

  const onhandleSaveLocation = () => {
    setImgSaveLoading(true);
    toPng(divRef.current, { cacheBust: false })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "map_image.png";
        link.href = dataUrl;
        link.click();
        setImgSaveLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setImgSaveLoading(false);
      });
  };
  const [pdfSaveLoading, setPdfSaveLoading] = useState(false);

  const handleSavePdf = () => {
    setPdfSaveLoading(true);
    const scaleFactor = 2; // Adjust the scale factor as needed

    html2canvas(divRef.current, {
      scale: scaleFactor,
      useCORS: true, // Enable cross-origin resource sharing
      allowTaint: true, // Allow images from different origins to be included
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/jpeg");

        const pdf = new jsPDF({
          unit: "mm",
          format: "a4",
          orientation: "landscape",
        });

        const imgWidth = 280; // A4 size in mm
        const imgHeight = 190;

        pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
        pdf.save(`${srNumber}_Map.pdf`);
        const pdfBlob = pdf.output("blob");
        const pdfFile = new File([pdfBlob], "map_image.pdf", {
          type: "application/pdf",
        });
        setFiles((prevFiles) => [...prevFiles, pdfFile]); // Store PDF file in state
        setPdfSaveLoading(false);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        setPdfSaveLoading(false);
      });
  };
  const getAnchorPoint = () => {
    if (window.google && window.google.maps) {
      return new window.google.maps.Point(10, 20);
    }
    return null; // Or a default fallback if it's not available
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="map-loader">
        <CircularProgress />
      </div>
    );
  }

  const handleDeleteMarker = () => {
    // Remove the selectedMarker from the markers array and update state
    const updatedMarkers = sRMapData.filter(
      (marker) => marker !== selectedMarker
    );
    setSRMapData(updatedMarkers);

    // Close the tooltip
    setSelectedMarker(null);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          setMarkerData((prevData) => ({
            ...prevData,
            MeterNumber: "",
            ColorTypeId: colorTypeList[0]?.Id,
            ColorType: colorTypeList[0]?.ColorType,
            Color: colorTypeList[0]?.Color,
          }));
          setOpen(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h3>Marker Options</h3>
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
          {/* <div className="row align-items-center mt-2">
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
          </div>*/}
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

                  setSRMapData((prevMarkers) => [...prevMarkers, markerData]);
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
                }}
              >
                Save
              </button>
            
          </div>
        </Box>
      </Modal>
      <div>
        <div className="row">
          <div className="col-md-6">
            {" "}
            <TextField
              inputRef={searchInputRef}
              type="text"
              placeholder="Search for a place"
              onChange={handleSearch}
              size="small"
              variant="outlined"
              className="my-3"
            />
          </div>
          <div className="col-md-6 text-end">
            {" "}
            {/* <span
              className="pt-5"
              style={{ cursor: "pointer" }}
              onClick={refreshMap}
            >
              <SyncIcon
                sx={{
                  color: "black",
                  fontSize: "30px",
                  marginTop: "20px",
                  marginRight: "20px",
                }}
              />
            </span> */}
          </div>
        </div>

        <div id="SR-preview" ref={divRef}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            zoom={zoomLevel}
          >
            {sRMapData.map((marker, index) => (
              <Marker
                key={index}
                
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => {
                  console.log("selectedMarker", marker);
                  setSelectedMarker(marker);
                }}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 3.86 5 11 7 13 2-2 7-9.14 7-13 0-3.87-3.13-7-7-7zm0 10.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 5.5 12 5.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z",
                  fillColor: marker.Color || "#ff0000",
                  fillOpacity: 1,
                  strokeWeight: 0,
                  scale: 1.5,
                  anchor: getAnchorPoint(),// (X offset, Y offset),
                  scaledSize: new window.google.maps.Size(30, 30),
                  
                }}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)} // Close the tooltip
              >
                <div>
                  {/* <h5>Remove Marker?</h5> */}
                  <h6>
                    Type:{" "}
                    {colorTypeList.map((type) => {
                      if (type.Id === selectedMarker.ColorTypeId) {
                        return <>{type.ColorType}</>; // Use the actual value here
                      }
                      return null; // Ensure that map always returns something, even if it's null
                    })}
                  </h6>
                  {selectedMarker.MeterNumber ? (
                    <h6>Meter Number: {selectedMarker.MeterNumber}</h6>
                  ) : (
                    <></>
                  )}
                  {selectedMarker.FilePath ? (
                    <img
                      src={`${baseUrl}/${selectedMarker.FilePath}`}
                      style={{
                        width: "115px",
                        height: "110px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <></>
                  )}
                  {selectedMarker?.ControllerPhoto ? (
                    <img
                      className=""
                      src={URL.createObjectURL(selectedMarker?.ControllerPhoto)}
                      style={{
                        width: "115px",
                        height: "110px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <></>
                  )}
                  <button
                    className="btn btn-sm btn-danger w-100 mt-2"
                    onClick={handleDeleteMarker}
                  >
                    Delete Marker
                  </button>{" "}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
        <div className="row ">
          <div className="col-md-12 text-end mt-2">
            <LoadingButton
              variant="contained"
              loading={imgSaveLoading}
              startIcon={<SendIcon sx={{ fontSize: 2 }} />}
              onClick={onhandleSaveLocation}
              disableElevation
              sx={{
                marginRight: "0.6em",

                color: "#fff",

                textTransform: "capitalize",
              }}
            >
              PNG
            </LoadingButton>
            <LoadingButton
              variant="contained"
              loading={pdfSaveLoading}
              startIcon={<SendIcon sx={{ fontSize: 2 }} />}
              onClick={handleSavePdf}
              disableElevation
              sx={{
                marginRight: "0.6em",

                color: "#fff",

                textTransform: "capitalize",
              }}
            >
              PDF
            </LoadingButton>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(GoogleMapApi);
