import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import parse from "autosuggest-highlight/parse";
import { debounce } from "@mui/material/utils";
import { useState, useRef, useEffect } from "react";
import { mapKey } from "../../../apiConfig";

const GOOGLE_MAPS_API_KEY = mapKey;

function loadScript(src, position, id) {
  if (!position) {
    return;
  }

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };

const SLAddress = ({
  address,
  name,
  handleChange,
  setSLAddress,
  addressValue,
  emptyerror
}) => {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const loaded = useRef(false);

  useEffect(() => {
    setValue(address);
    console.log("address is", address);
  }, []);

  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector("head"),
        "google-maps"
      );
    }

    loaded.current = true;
  }

  const fetch = React.useMemo(
    () =>
      debounce((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 400),
    []
  );

  useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
      
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
        console.log("address results are", newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  // const handleSelect = (event, newValue) => {
  //   if (newValue) {
  //     // Retrieve latitude and longitude for the selected address
  //     const geocoder = new window.google.maps.Geocoder();
  //     geocoder.geocode({ address: newValue.description }, (results, status) => {
  //       if (status === "OK" && results[0]) {
  //         const { lat, lng } = results[0].geometry.location;
  //         setValue({
  //           address: newValue.description,
  //         });
  //       }
  //     });
  //   } else {
  //     setValue(null);
  //   }
  // };

  const handleSelect = (event, newValue) => {
    if (newValue) {
      setValue(newValue);
      const simulatedEvent = {
        target: {
          name: name,
          value: newValue.description ? newValue.description : "",
        },
      };
      console.log("new value is", newValue)

      handleChange(simulatedEvent);

      // Use the Google Maps Geocoding API to get latitude and longitude
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: newValue.description }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const latitude = location.lat();
          const longitude = location.lng();
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          setSLAddress((prevData) => ({
            ...prevData,
            Address : newValue.description,
            lat: latitude,
            lng: longitude,
          }));
        } else {
          console.log(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    } else {
      setValue(null);
      const simulatedEvent = {
        target: {
          name: name,
          value: "",
        },
      };
      handleChange(simulatedEvent);
      setSLAddress((prevData) => ({
        ...prevData,
        Address: "",
      }));
    }
  };

  return (
    <Autocomplete
      id="google-map-demo"
      // sx={{ width: 300 }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option?.description
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value || addressValue.Address || ""}
      noOptionsText="No locations"
      onChange={handleSelect}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} size="small" placeholder="Address" error={emptyerror} fullWidth />
      )}
      renderOption={(props, option) => {
        const matches =
          option.structured_formatting.main_text_matched_substrings || [];

        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match) => [match.offset, match.offset + match.length])
        );

        return (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item sx={{ display: "flex", width: 44 }}>
                <LocationOnIcon sx={{ color: "text.secondary" }} />
              </Grid>
              <Grid
                item
                sx={{ width: "calc(100% - 44px)", wordWrap: "break-word" }}
              >
                {parts.map((part, index) => (
                  <Box
                    key={index}
                    component="span"
                    sx={{ fontWeight: part.highlight ? "bold" : "regular" }}
                  >
                    {part.text}
                  </Box>
                ))}
                <Typography variant="body2" color="text.secondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          </li>
        );
      }}
    />
  );
};

export default SLAddress;
