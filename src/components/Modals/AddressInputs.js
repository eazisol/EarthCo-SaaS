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
import { mapKey } from "../../apiConfig";

const GOOGLE_MAPS_API_KEY = mapKey; // Replace with your API key

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

const AddressInputs = ({
  address,
  name,
  handleChange,
  setCompanyData,
  addressValue,
  emptyError,
  disabled = false,
}) => {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const loaded = useRef(false);

  useEffect(() => {
    setValue(address);
  }, [address]);

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

  React.useEffect(() => {
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
    if (disabled) return; // Prevent changes if disabled
    
    if (newValue) {
      setValue(newValue);
      const simulatedEvent = {
        target: {
          name: name,
          value: newValue.description ? newValue.description : "",
        },
      };
      handleChange(simulatedEvent);

      // Use the Google Maps Geocoding API to get additional details
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: newValue.place_id }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addressComponents = results[0].address_components;

          let city = "";
          let state = "";
          let country = "";
          let streetNumber = "";
          let streetName = "";
          let latitude = "";
          let longitude = "";
          let countryCode = "";
          let postalCode = "";

          for (const component of addressComponents) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            } else if (
              component.types.includes("administrative_area_level_1")
            ) {
              state = component.long_name;
            } else if (component.types.includes("country")) {
              country = component.long_name;
              countryCode = component.short_name;
            } else if (component.types.includes("street_number")) {
              streetNumber = component.long_name;
            } else if (component.types.includes("route")) {
              streetName = component.long_name;
            } else if (component.types.includes("postal_code")) {
              postalCode = component.long_name;
            }
          }

          latitude = results[0].geometry.location.lat();
          longitude = results[0].geometry.location.lng();

          setCompanyData((prevData) => ({
            ...prevData,
            tblUserAddresses: [
              {
                State: state,
                City: city,
                Country: country,
                CountryCode: countryCode,
                Street: streetNumber + ", " + streetName,
                ZipCode: postalCode,
                Lat: latitude,
                Long: longitude,
                Type: "BillAddr",
                Description: newValue.description,
              },
            ],
          }));

          console.log(`Street Number: ${streetNumber}`);
          console.log(`Street Name: ${streetName}`);
          console.log(`City: ${city}`);
          console.log(`State: ${state}`);
          console.log(`Country: ${country}`);
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
    }
  };

  return (
    <Autocomplete
      id="google-map-demo"
      // sx={{ width: 300 }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.description
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value || addressValue || ""}
      noOptionsText="No locations"
      onChange={handleSelect}
      disabled={disabled}
      onInputChange={(event, newInputValue) => {
        if (!disabled) {
          setInputValue(newInputValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Address"
          error={emptyError}
          fullWidth
          disabled={disabled}
        />
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

export default AddressInputs;
