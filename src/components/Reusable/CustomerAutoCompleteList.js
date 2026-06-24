import React, { useEffect } from "react";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
const CustomerAutoCompleteList = ({
  formData,
  setFormData,
  onChange = () => {},
}) => {
  const { customerSearch, fetchCustomers } = useCustomerSearch();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    console.log("customerSearch", customerSearch);
  }, [customerSearch]);

  return (
    <>
      <label className="form-label mt-4 ms-2">Search by name or detail</label>
      <FormControl variant="standard">
      <TextField
        value={formData.CustomerDisplayName}
        placeholder="Search Customer"
        className="bg-white mx-2"
        variant="outlined"
        size="small"
        InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="#ccc" />
              </InputAdornment>
            ),
          }}
        onClick={() => {
          fetchCustomers();
        }}
        onChange={(e) => {
          fetchCustomers(e.target.value);
          setFormData({
            ...formData,
            CustomerDisplayName: e.target.value,
          });
        }}
      /></FormControl>
      <div style={{ height: "100%", overflowY: "scroll" }}>
        <ul style={{ border: "0px solid #fff" }} className="list-group">
          {customerSearch.map((customer, index) => (
            <li
              key={index}
              style={{ border: "0px solid #fff", borderRadius : 0, borderBottom : "1px solid #ccc" }}
              className={
                customer.DisplayName == formData.CustomerDisplayName
                  ? "list-group-item active cursor-pointer"
                  : "list-group-item  cursor-pointer"
              }
              onClick={() => {
                onChange(customer);
                setFormData({
                  ...formData,
                  CustomerDisplayName: customer.DisplayName,
                });
              }}
            >
              <div className="d-flex flex-column">
                <strong>{customer.DisplayName}</strong>
                <small>{customer.CompanyName}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default CustomerAutoCompleteList;
