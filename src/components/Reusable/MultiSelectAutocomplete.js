import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const MultiSelectAutocomplete = ({
  options,
  error,
  property,
  label,
  selectedOptions,
  setSelectedOptions,
  fullList,
  required = true,
}) => {
  const handleStaffAutocompleteChange = (event, newValue) => {
    setSelectedOptions(newValue.map((company) => company.UserId));
  };
  useEffect(() => {
   console.log("first",selectedOptions)
  }, [selectedOptions])
  
  return (
    <>
      <label className="form-label">
        {label}
        {required ? <span className="text-danger">*</span> : null}
      </label>
      <Autocomplete
        id="staff-autocomplete"
        size="small"
        multiple
        options={options}
        getOptionLabel={(option) =>
          option.FirstName + " " + option.LastName || ""
        }
        value={fullList.filter((company) =>
          selectedOptions.includes(company.UserId)
        )}
        onChange={handleStaffAutocompleteChange}
        isOptionEqualToValue={(option, value) =>
          option.UserId === value[property]
        }
        renderOption={(props, option) => (
          <li {...props}>
            <div className="customer-dd-border">
              <div className="row">
                <div className="col-md-12">
                  <h6 className="pb-0 mb-0">
                    {option.FirstName} {option.LastName}
                  </h6>
                </div>
                <div className="col-md-12">
                  <small>
                    {"("}
                    {option.Role}
                    {")"}
                  </small>
                </div>
              </div>
            </div>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label=""
            error={required && error && selectedOptions.length <= 0}
            placeholder="Choose..."
            className="bg-white"
          />
        )}
      />
    </>
  );
};

export default MultiSelectAutocomplete;
