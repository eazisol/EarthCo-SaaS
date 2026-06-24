import { Autocomplete, TextField } from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useGetData from "../Hooks/useGetData";
import { DataContext } from "../../context/AppData";

const CustomerAutocomplete = ({
  formData,
  setFormData,
  submitClicked,
  handlePopup = () => {},
  setBtnDisable = () => {},
  checkQb = false,
  onChange=() => {},
  selectedCustomerId = null,
  disableField=false
}) => {
  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { getListData } = useGetData();

  const { loggedInUser } = useContext(DataContext);

  useEffect(() => {
    fetchCustomers();
  }, []);

useEffect(() => {
  if (selectedCustomerId && customerSearch.length > 0) {
    const selected = customerSearch.find((cust) => cust.UserId === selectedCustomerId);
    if (selected && !formData.CustomerDisplayName) {
      setFormData((prev) => ({
        ...prev,
        CustomerDisplayName: selected.DisplayName,
        CustomerId: selected.UserId,
        BillEmail: selected.Email,
      }));
    }
  }
}, [selectedCustomerId, customerSearch]);


  useEffect(() => {
    console.log("customerSearch", customerSearch);
    // fetchName(formData.CustomerId)
  }, [customerSearch]);

  return (
    <Autocomplete
    disabled={disableField}
      id="staff-autocomplete"
      size="small"
      options={customerSearch}
      getOptionLabel={(option) =>
        option.DisplayName ? option.DisplayName : formData.CustomerDisplayName || ""
      }
      filterOptions={(options) => options}
      value={
        formData.CustomerDisplayName
          ? { DisplayName: formData.CustomerDisplayName }
          : null
      }
//       value={
//   customerSearch.find((cust) => cust.UserId === formData.CustomerId) || formData.CustomerDisplayName
// }
// value={
//   customerSearch.find((cust) => cust.UserId === formData.CustomerId) ??
//   (formData.CustomerId && {
//     DisplayName: formData.CustomerDisplayName,
//     UserId: formData.CustomerId
//   }) ??
//   null
// }


      onChange={(event, newValue) => {
        console.log("newValue", newValue);
        onChange(newValue)
        setBtnDisable(false);
        if (newValue) {
          setFormData({
            ...formData,
            CustomerId: newValue.UserId,
            CustomerDisplayName: newValue.DisplayName,
            BillEmail: newValue.Email,
          });
          if (checkQb) {
            getListData(
              `/SyncQB/CheckSync?QBID=${newValue.QBId}&Type=Customer&CompanyId=${loggedInUser.CompanyId}`,
              (id) => {
                setBtnDisable(false);
              },
              (err) => {
                console.log("check error", err);
                setBtnDisable(true);
                handlePopup(true, "error", "This Customer is Inactive");
                // setOpenSnackBar(true);
                // setSnackBarColor("error");
                // setSnackBarText("error changing Sale Price");
              }
            );
          }
          // fetchName(newValue.UserId);
        } else {
          setFormData({
            ...formData,
            CustomerId: null,
            CustomerDisplayName: "",
          });
          setBtnDisable(true);
          // Perform any other necessary actions when newValue is null
        }
      }}
      isOptionEqualToValue={(option, value) =>
        option.UserId === value.CustomerId
      }
      renderOption={(props, option) => (
        <li {...props}>
          <div className="customer-dd-border">
            <h6 className="pb-0 mb-0">
              #{option.UserId} - {option.DisplayName}
            </h6>
            <small> {option.CompanyName}</small>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label=""
          onBlur={() => {
            // fetchName(formData.CustomerId);
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
          placeholder="Choose Customer"
          error={submitClicked && !formData.CustomerId}
          className="bg-white"
        />
      )}
    />
  );
};

export default CustomerAutocomplete;
