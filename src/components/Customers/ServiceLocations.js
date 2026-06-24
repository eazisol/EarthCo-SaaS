import React, { useEffect, useState } from "react";
import axios from "axios";
import { Create, Delete, Update } from "@mui/icons-material";
import validator from "validator";
import { Button, TextField } from "@mui/material";
import Cookies from "js-cookie";
import EventPopups from "../Reusable/EventPopups";
import SLAddress from "./CustomerAddress/SLAddress";
import { baseUrl } from "../../apiConfig";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";

const ServiceLocations = ({
  getCustomerData,
  sLAddress,
  setSLAddress,
  slForm,
  setSlForm,
  CustomerId
}) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  const [formData, setFormData] = useState({});

  const [submitClicked, setSubmitClicked] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  useEffect(() => {
    console.log("lat lng data", sLAddress);
  }, [sLAddress]);

  const handleSubmit = async () => {
    setSubmitClicked(true);

    const CId = idParam;

    const updatedValues = {
      ...formData,
      CustomerId: CId,
      Address: sLAddress.Address,
      lat: sLAddress.lat,
      lng: sLAddress.lng,
    };

    setFormData((prevFormData) => ({
      ...prevFormData,
      CustomerId: idParam,
      Address: sLAddress.Address,
      lat: sLAddress.lat,
      lng: sLAddress.lng,
    }));

    console.log("Sl payload izzzz", updatedValues);

    if (!updatedValues.Name || !updatedValues.Address || !updatedValues.Phone) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      console.log("check2 ");

      return; // Return early if any required field is empty
    }

    if (!validator.isLength(formData.Name, { min: 3, max: 30 })) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Name should be 3 to 30 characters");
      console.log("Company name should be between 3 and 30 characters");
      return;
    }

    if (
      formData.Phone &&
      !validator.isMobilePhone(formData.Phone, "any", { max: 20 })
    ) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Phone number is not valid");

      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/Customer/AddServiceLocation`,
        updatedValues,
        {
          headers,
        }
      );
      getCustomerData();

      setSLAddress({});
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      setSubmitClicked(false);
      const closeButton = document.getElementById("closerLocation");
      if (closeButton) {
        closeButton.click();
      }
    } catch (error) {
      console.log("error adding SL", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,

      lat: sLAddress.lat,
      lng: sLAddress.lng,
    }));
    console.log("handle change form data", formData);
  };

  const handleDelete = async (serviceLocationId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/DeleteServiceLocation?id=${serviceLocationId}&CustomerId=${CustomerId}`,
        { headers }
      );
      const updatedSlForm = slForm.filter(
        (sl) => sl.ServiceLocationId !== serviceLocationId
      );
      setSlForm(updatedSlForm);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Successfully Deleted Service Location");
      console.log("successfully deleted service location", response);
    } catch (error) {
      console.log("error deleting service location", error);
    }
  };

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div style={{ zIndex: "100" }} className="modal fade " id="basicModal2">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Service location</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="basic-form">
                <div className="mb-3 row">
                  <label className="col-sm-3 col-form-label">
                    Name<span className="text-danger">*</span>
                  </label>
                  <div className="col-sm-9">
                    <TextField
                      type="text"
                      size="small"
                      name="Name"
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Name"
                      error={submitClicked && !formData.Name}
                      value={formData.Name}
                    />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label className="col-sm-3 col-form-label">Bill To</label>
                  <div className="col-sm-9">
                    <div className="row">
                      <div className="col-5">
                        <input
                          className="form-check-input radio-margin-top"
                          type="radio"
                          name="isBilltoCustomer"
                          id="inlineRadio11"
                          onChange={handleChange}
                          value={true}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="inlineRadio11"
                        >
                          Customer
                        </label>
                      </div>
                      <div className="col-7">
                        <input
                          className="form-check-input radio-margin-top"
                          type="radio"
                          name="isBilltoCustomer"
                          id="inlineRadio22"
                          onChange={handleChange}
                          value={false}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="inlineRadio22"
                        >
                          This service Location
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3 row">
                  <label className="col-sm-3 col-form-label">
                    Address<span className="text-danger">*</span>
                  </label>
                  <div className="col-sm-9">
                    <SLAddress
                      address={formData.Address}
                      name="Address"
                      handleChange={handleChange}
                      setSLAddress={setSLAddress}
                      addressValue={formData}
                      emptyerror={submitClicked && !sLAddress.Address}
                    />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label className="col-sm-3 col-form-label">
                    Phone<span className="text-danger">*</span>
                  </label>
                  <div className="col-sm-9">
                    <TextField
                      type="text"
                      size="small"
                      onChange={handleChange}
                      value={formData.Phone}
                      name="Phone"
                      className="form-control"
                      placeholder="Phone"
                      error={submitClicked && !formData.Phone}
                    />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label className="col-sm-3 col-form-label">Alt Phone</label>
                  <div className="col-sm-9">
                    <TextField
                      type="text"
                      size="small"
                      name="AltPhone"
                      onChange={handleChange}
                      value={formData.AltPhone}
                      className="form-control"
                      placeholder="Alt Phone"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                id="closerLocation"
                className="btn btn-danger light"
                data-bs-dismiss="modal"
                onClick={() => {
                  getCustomerData();
                  setSubmitClicked(true);
                  setSLAddress({}); // Resetting SLAddress
                  setFormData({
                    // Resetting formData
                    Name: "",
                    Address: "",
                    Phone: "",
                    AltPhone: "",
                    isBilltoCustomer: null,
                    ServiceLocationId: null,
                  });
                }}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                //data-bs-dismiss="modal"
                onClick={handleSubmit}
                // disabled={isFormInvalid()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
      <div style={{ display: "flex" }} className="itemtitleBar ">
          <div style={{ width: "50%" }}>
            <h4>Service Locations</h4>
          </div>
          <div style={{ width: "50%" }} className=" text-end">
            <p
              data-bs-toggle="modal"
              data-bs-target="#basicModal2"
              style={{ textDecoration: "underline", cursor : "pointer" }}
              className="text-black"
            >
              Add Service Location
            </p>
          </div>
        </div>

        <div className="card-body">
          {/* <div className="row">
            <div className="col-md-8"></div>
            <div className="col-md-4 text-end">
              <button
                className="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#basicModal2"
                style={{ margin: "0px 20px 12px" }}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                + Add Service Locations
              </button>
            </div>
          </div> */}

          <div className="col-xl-12">
            <div className="card">
              <div className="card-body p-0">
                <>
                  <TableContainer>
                    <Table id="empoloyees-tblwrapper" className="table">
                      <TableHead className="table-header">
                        <TableRow>
                          <TableCell style={{width : "3em"}}>#</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Address</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Alt Phone</TableCell>
                          <TableCell>Bill to Customer</TableCell>
                          <TableCell className="actions-head">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {slForm.map((slData, index) => (
                          <TableRow key={slData.ServiceLocationId}>
                            <TableCell style={{width : "3em"}}>{slData.ServiceLocationId}</TableCell>
                            <TableCell>{slData.Name}</TableCell>
                            <TableCell>{slData.Address}</TableCell>
                            <TableCell>{slData.Phone}</TableCell>
                            <TableCell>{slData.AltPhone}</TableCell>
                            <TableCell>
                              {slData.isBilltoCustomer
                                ? "Customer"
                                : "Service Location"}
                            </TableCell>

                            <TableCell
                              className="contact-actions"
                              style={{ cursor: "pointer" }}
                            >
                              <div className="d-flex flex-nowrap align-items-center">
                              <Create
                                className="custom-create-icon"
                                data-bs-toggle="modal"
                                data-bs-target="#basicModal2"
                                onClick={() => {
                                  console.log("sl data", slData);

                                  setFormData((prevData) => ({
                                    ...prevData,
                                    ...slData,
                                    Address: slData.Address,
                                    lat: slData.lat,
                                    lng: slData.lng,
                                  }));
                                }}
                              ></Create>
                              {/* <Delete
                                          color="error"
                                          onClick={() =>
                                            handleDelete(
                                              slData.ServiceLocationId
                                            )
                                          }
                                        ></Delete> */}
                              <Button
                                color="error"
                                className="delete-button"
                                data-bs-toggle="modal"
                                data-bs-target={`#sLDeleteModal${slData.ServiceLocationId}`}
                              >
                                <Delete />
                              </Button>
                              </div>
                              <div
                                className="modal fade"
                                id={`sLDeleteModal${slData.ServiceLocationId}`}
                                tabIndex="-1"
                                aria-labelledby="deleteModalLabel"
                                aria-hidden="true"
                              >
                                <div className="modal-dialog" role="document">
                                  <div className="modal-content">
                                    <div className="modal-header">
                                      <h5 className="modal-title">
                                        Are you sure you want to delete
                                        {slData.Name}?
                                      </h5>
                                      <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                      ></button>
                                    </div>
                                    <div className="modal-body">
                                      <div className="basic-form text-center">
                                        <button
                                          type="button"
                                          id="closer"
                                          className="btn btn-danger light m-3"
                                          data-bs-dismiss="modal"
                                        >
                                          Close
                                        </button>
                                        <button
                                          className="btn btn-primary m-3"
                                          data-bs-dismiss="modal"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(
                                              slData.ServiceLocationId
                                            );
                                          }}
                                        >
                                          Yes
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceLocations;
