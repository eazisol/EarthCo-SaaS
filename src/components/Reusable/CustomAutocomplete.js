import React, { useEffect, useState } from "react";
import useGetData from "../Hooks/useGetData";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { NavLink } from "react-router-dom";
import { Chip } from "@mui/material";

const CustomAutocomplete = ({
  property1,
  property2,
  formData,
  setFormData,
  endPoint,
  placeholder,
  error= false

}) => {
  const { getListData, data } = useGetData();
  const [search, setSearch] = useState("");
  const [oldNumber, setOldNumber] = useState("");

  useEffect(() => {
    if (formData[property2] !== "") {
      setOldNumber(formData[property2]);
      console.log("Search empty");
    }
    // console.log("testing", formData);
  }, [formData, property2]);

  useEffect(() => {
    if (endPoint !== "") {
      getListData(`${endPoint}?Search=${search}`);
    }
    console.log("Search text:", search);
  }, [search]);

  

  return (
    <>
      <Autocomplete
        size="small"
        options={data}
        onInputChange={(event, value) => {
          if (value === "") {
            console.log("property1", property1);
            setOldNumber("");
            setFormData({
              ...formData,
              [property1]: null,
              [property2]: "",
            });
          }
        }}
        getOptionLabel={(option) => option[property2] || ""}
        noOptionsText="No record found in system"
        value={
          formData[property2] ? { [property2]: formData[property2] } : null
        }
        onChange={(event, newValue) => {
          if (newValue) {
            console.log("prop");
            setFormData({
              ...formData,
              [property1]: newValue[property1] || null,
              [property2]: newValue[property2] || "",
            });
          }
        }}
        // isOptionEqualToValue={(option, value) =>
        //   option[property1] === value[property1]
        // }
        renderInput={(params) => (
          <TextField
            {...params}
            label=""
            error={error}
            onChange={(e) => setSearch(e.target.value)}
           
            onBlur={() => {
              if (formData[property2] === "") {
                setFormData({
                  ...formData,
                  [property2]: oldNumber,
                });
              }
            }}
            placeholder={placeholder}
            className="bg-white"
          />
        )}
        aria-label="Contact select"
      />
    </>
  );
};

export default CustomAutocomplete;
