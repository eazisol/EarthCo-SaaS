import React, { useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Cookies from "js-cookie";
import EventPopups from "../Reusable/EventPopups";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import { baseUrl } from "../../apiConfig";

const AddStoreLocation = ({fetchStoreLocations}) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [formData, setFormData] = useState({});
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);

  const handleSubmit = async () => {
    setSubmitClicked(true);

    const updatedValues = {
      ...formData,
    };

    console.log("contact payload izzzz", updatedValues);

    if (!formData.Location) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      console.log("check2 ");

      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/WeeklyReport/AddStoreLocation`,
        updatedValues,
        {
          headers,
        }
      );

      
      setOpenSnackBar(true);
      setSubmitClicked(false);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      fetchStoreLocations()
     

      const closeButton = document.getElementById("slCloser");
      if (closeButton) {
        closeButton.click();
      }
    } catch (error) {
      console.log("error adding SL", error);
      setOpenSnackBar(true);
      setSubmitClicked(false);
      setSnackBarColor("error");
      setSnackBarText("Error Adding Store Location");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    console.log("handle change form data", formData);
  };

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="modal fade" id="basicModalStoreLocation">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Store Location</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="basic-form">
                <div className="mb-3 row">
                  <label className="col-sm-4 col-form-label">
                    Store Location<span className="text-danger">*</span>
                  </label>
                  <div className="col-sm-8">
                    <TextField
                      type="text"
                      size="small"
                      name="Location"
                      className="form-control"
                      placeholder="First Name"
                      error={submitClicked && !formData.Location}
                      onChange={handleChange}
                      value={formData.Location}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                id="slCloser"
                className="btn btn-danger light"
                data-bs-dismiss="modal"
                onClick={() => {
                  setFormData({
                    CompanyName: "",
                    Location: "",
                    LastName: "",
                    Phone: "",
                    AltPhone: "",
                    Email: "",
                    Address: "",
                    Comments: "",
                  });
                }}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <span
        style={{ cursor: "pointer", color: "#779A3D" }}
        data-bs-toggle="modal"
        data-bs-target="#basicModalStoreLocation"
      >
        <CustomizedTooltips title="Click add new Store Location" placement="top">
          <strong>+ Add</strong>
        </CustomizedTooltips>
      </span>
    </>
  );
};

export default AddStoreLocation;
