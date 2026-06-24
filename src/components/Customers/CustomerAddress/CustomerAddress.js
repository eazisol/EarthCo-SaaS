import React, { useContext, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { DataContext } from "../../../context/AppData";
import { mapKey } from "../../../apiConfig";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 31.558,
  lng: 74.35,
};

function GoogleMapApi() {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [selectedMarker, setSelectedMarker] = useState(null);
  const searchInputRef = useRef(null);

  const { customerAddress, setCustomerAddress } = useContext(DataContext);

  useEffect(() => {
    // Load markers from localStorage on component mount
    const savedMarkers = JSON.parse(localStorage.getItem("markers")) || [];
    setMarkers(savedMarkers);
  }, []);

  const saveMarkersToLocalStorage = (markers) => {
    localStorage.setItem("markers", JSON.stringify(markers));
  };

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(defaultCenter);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const handleSearch = (e) => {
    const input = searchInputRef.current;

    if (
      input &&
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const newMarkers = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          setMarkers(newMarkers);
          saveMarkersToLocalStorage(newMarkers);

          // Center the map on the selected place
          if (map) {
            map.panTo(place.geometry.location);
          }
          setCustomerAddress(e.target.value);
          console.log("mapesss", customerAddress);
        }
      });
    }

    console.log("map input is", e.target.value);
  };

  const handleMapClick = (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    setMarkers((prevMarkers) => {
      const newMarkers = [...prevMarkers, { lat: clickedLat, lng: clickedLng }];
      saveMarkersToLocalStorage(newMarkers);
      return newMarkers;
    });
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  return (
    <LoadScript
      googleMapsApiKey={mapKey}
      libraries={["places"]}
    >
      <div>
        <input
          ref={searchInputRef}
          type="text"
          value={customerAddress || ""}
          placeholder="Address"
          onChange={handleSearch}
          className="form-control"
        />

        {/* <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={3}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
         
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={marker}
              onClick={() => handleMarkerClick(marker)}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={selectedMarker}
              onCloseClick={handleInfoWindowClose}
            >
              <div>
                <p>Marker Info</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap> */}
      </div>
    </LoadScript>
  );
}

export default React.memo(GoogleMapApi);
