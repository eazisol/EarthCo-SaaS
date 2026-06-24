import React, { useEffect, useState } from "react";
import useGetData from "../Hooks/useGetData";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
const CustomAutocompleteMulti = ({
  property1,
  property2,
  formData,
  setFormData,
  endPoint,
  placeholder,
}) => {
  const { getListData, data } = useGetData();
  const [search, setSearch] = useState("");
  const [oldNumber, setOldNumber] = useState("");
  useEffect(() => {
  
    if (formData[property2] !== "") {
      setOldNumber(formData[property2]);
    }
  }, [formData]);

  useEffect(() => {
    getListData(`${endPoint}?Search=${search}`);
  }, [search]);
  return (
    <>
      <Autocomplete
        size="small"
        options={data}
        getOptionLabel={(option) => option[property2] || ""}
        noOptionsText="No record found in system"
        value={
          formData[property2] ? { [property2]: formData[property2] } : null
          // formData[property2] || null
          //   data.find((bill) => bill[property1] === formData[property1]) || null
        }
        onChange={(event, newValue) => {
          if (newValue) {
            setFormData({
              ...formData,
              [property1]: newValue[property1] || null,
              [property2]: newValue[property2] || "",
            });
          }
        }}
        isOptionEqualToValue={(option, value) =>
          option[property1] === value[property1]
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label=""
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onClick={() => {
              setFormData({
                ...formData,
                [property2]: "",
              });
            }}
            onBlur={() => {
              if (formData[property2] == "") {
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

export default CustomAutocompleteMulti;
