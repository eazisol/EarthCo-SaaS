import React from "react";
import { Print, Email, Download } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import {
  Autocomplete,
  TextField,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import Cookies from "js-cookie";
import EventPopups from "../Reusable/EventPopups";
import Contacts from "../CommonComponents/Contacts";
import ServiceLocations from "../CommonComponents/ServiceLocations";
import { DataContext } from "../../context/AppData";
import CircularProgress from "@mui/material/CircularProgress";
import LoaderButton from "../Reusable/LoaderButton";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import BackButton from "../Reusable/BackButton";
import PrintButton from "../Reusable/PrintButton";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import LandScapePdf from "./LandScapePdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import formatDate from "../../custom/FormatDate";

const LandscapeForm = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const currentDate = new Date();
  const { loggedInUser, setselectedPdf, companyInfo,dynamicColorAndLogo } = useContext(DataContext);
  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { contactEmail, fetchEmail } = useFetchContactEmail();

  const [formData, setFormData] = useState({
    StatusId: 1,
    MonthDate: formatDate(currentDate),
  });
  const [contactList, setContactList] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  const navigate = useNavigate();

  const handleMainButtonClick = async () => {
    try {
      const blob = await pdf(
        <LandScapePdf
          landscapeData={{
            ...formData,
            name: formData.CustomerCompanyName,
            companyInfo: companyInfo,
          }}
        />
      ).toBlob();

      // Create a File object from the blob
      const pdfFile = new File([blob], "Landscape.pdf", {
        type: "application/pdf",
      });

      // Store the File object in state
      setselectedPdf(pdfFile); // Now, pdfBlob is a File object with a name and type

      navigate(
        `/send-mail?title=${"Monthly Landscape Report"}&mail=${contactEmail}&number=${''}`
      );
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };

  const fetctContacts = async (id) => {
    if (!id) {
      return;
    }
    axios
      .get(`${baseUrl}/api/Customer/GetCustomerContact?id=${id}`, { headers })
      .then((res) => {
        console.log("contacts data isss", res.data);
        setContactList(res.data);
      })
      .catch((error) => {
        setContactList([]);
        console.log("contacts data fetch error", error);
      });
  };
  const fetchStaffList = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
        headers,
      });
      setStaffData(response.data);

      console.log("staff list iss", response.data);
    } catch (error) {
      console.log("error getting staff list", error);
    }
  };

  useEffect(() => {
    fetctContacts(formData.CustomerId);
    // fetchName(formData.CustomerId);
    console.log("main payload isss", formData);
  }, [formData.CustomerId]);

  const [loading, setLoading] = useState(true);
  const getLandscape = async () => {
    if (!idParam) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/MonthlyLandsacpe/GetMonthlyLandsacpe?id=${idParam}`,
        { headers }
      );
      setFormData(res.data);
      setLoading(false);
      fetchEmail(res.data.ContactId);

      console.log("reponse landscape is", res.data);
    } catch (error) {
      console.log("api call error", error);
      setLoading(false);
    }
  };

  const handleContactAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "ContactId",
        value: newValue ? newValue.ContactId : "",
      },
    };

    handleInputChange(simulatedEvent);
  };

  const handleRBAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "RequestBy",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleInputChange = (e, newValue) => {
    const { name, value, type, checked } = e.target;

    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId
    const adjustedValue = ["UserId", "ServiceLocationId", "ContactId"].includes(
      name
    )
      ? Number(value)
      : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : adjustedValue,
    }));

    // if (name === "UserId" && value != 0) {
    //   console.log(value);
    //   fetchServiceLocations(value);
    //   fetctContacts(value);
    // }
    console.log("landcape payload", formData);
  };

  const [disableButton, setDisableButton] = useState(false);

  const handleSubmit = async (e) => {
    setSubmitClicked(true);
    setDisableButton(true);
    e.preventDefault();
    if (!formData.CustomerId || !formData.ContactId || !formData.RequestBy) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      setDisableButton(false);
      console.log("Required fields are empty");
      return;
    }

    console.log("payload", formData);

    try {
      const response = await axios.post(
        `${baseUrl}/api/MonthlyLandsacpe/AddMonthlyLandsacpe`,
        formData,
        { headers }
      );

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);

      setTimeout(() => {
        // navigate(`/landscape/landscape-report?id=${response.data.Id}`);
        navigate(`/landscape/add-landscape?id=${response.data.Id}`);
        setDisableButton(false);
        window.location.reload();
      }, 4000);

      // Log the response or handle success
      console.log("Response:", response.data);
    } catch (error) {
      // Handle the error
      setDisableButton(false);
      console.error("API Post Error:", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }
  };

  useEffect(() => {
    fetchStaffList();
    getLandscape();
  }, []);

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="container-fluid">
        {loading ? (
          <div className="center-loader">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="card">
              <div className="itemtitleBar">
                <h4>Customer Information</h4>
              </div>

              <div className="card-body py-0" style={{ position: "relative" }}>
                <div className="estDataBox">
                  <div className="basic-form mb-2">
                    <div className="row mt-2">
                      <div className="col-md-3">
                        <label className="form-label">
                          Customers <span className="text-danger">*</span>
                        </label>

                        <CustomerAutocomplete
                          formData={formData}
                          setFormData={setFormData}
                          submitClicked={submitClicked}
                        />
                      </div>

                      <div className="col-md-3 ">
                        <div className="row">
                          <div className="col-md-auto">
                            <label className="form-label">
                              Contacts<span className="text-danger">*</span>
                            </label>
                          </div>
                          <div className="col-md-3">
                            {" "}
                            {formData.CustomerId ? (
                              <Contacts
                                fetctContacts={fetctContacts}
                                fetchCustomers={fetchCustomers}
                                customerId={formData.CustomerId}
                              />
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                        <Autocomplete
                          id="inputState299"
                          size="small"
                          options={contactList}
                          getOptionLabel={(option) =>
                            option.FirstName + " " + option.LastName || ""
                          }
                          value={
                            contactList.find(
                              (contact) =>
                                contact.ContactId === formData.ContactId
                            ) || null
                          }
                          onChange={handleContactAutocompleteChange}
                          isOptionEqualToValue={(option, value) =>
                            option.ContactId === value.ContactId
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label=""
                              placeholder="Contacts"
                              error={submitClicked && !formData.ContactId}
                              className="bg-white"
                            />
                          )}
                          aria-label="Contact select"
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">
                          Regional Manager{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <Autocomplete
                          id="staff-autocomplete"
                          size="small"
                          options={staffData.filter(
                            (staff) =>
                              staff.Role === "Regional Manager" || staff.Role === "Account Manager"||staff?.isSuperAdmin
                          )}
                          getOptionLabel={(option) =>
                            option.FirstName + " " + option.LastName || ""
                          }
                          value={
                            staffData.find(
                              (staff) => staff.UserId === formData.RequestBy
                            ) || null
                          }
                          onChange={handleRBAutocompleteChange}
                          isOptionEqualToValue={(option, value) =>
                            option.UserId === value.RequestedBy
                          }
                          renderOption={(props, option) => (
                            <li {...props}>
                              <div className="customer-dd-border">
                                <div className="row">
                                  <div className="col-md-auto">
                                    {" "}
                                    <h6 className="pb-0 mb-0">
                                      {" "}
                                      {option.FirstName} {option.LastName}
                                    </h6>
                                  </div>
                                  <div className="col-md-auto">
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
                              error={submitClicked && !formData.RequestBy}
                              placeholder="Choose..."
                              className="bg-white"
                            />
                          )}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">
                          Created Date<span className="text-danger">*</span>
                        </label>
                        <TextField
                          value={formatDate(formData.MonthDate)}
                          name="MonthDate"
                          onChange={handleInputChange}
                          className="input-limit-datepicker"
                          type="date"
                          variant="outlined"
                          size="small"
                          error={submitClicked && !formData.MonthDate}
                          // helperText={
                          //   submitClicked && !formData.CustomerId
                          //     ? "Issue Date is required"
                          //     : ""
                          // }
                          required
                          fullWidth
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-md-3 ms-3 mb-3">
                  <label className="form-label">Status:</label>
                  <FormControl fullWidth>
                    <Select
                      name="StatusId"
                      value={formData.StatusId || 1}
                      onChange={handleInputChange}
                      size="small"
                    >
                      <MenuItem value={1}>Open</MenuItem>
                      <MenuItem value={2}>Closed</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-0">
                <div className="estDataBox">
                  <div className="itemtitleBar">
                    <h4>Maintainence Report</h4>
                  </div>
                  <div className="basic-form">
                    <div className="card-body">
                      <div className="col-md-12">
                        <div className="row">
                          <div
                            className="col-md-5"
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <h5>Supervisor Visited the job weekly</h5>
                          </div>
                          <div className="col-md-7">
                            <input
                              type="checkbox"
                              name="SupervisorVisitedthejobweekly"
                              value={
                                formData.SupervisorVisitedthejobweekly || false
                              }
                              checked={
                                formData.SupervisorVisitedthejobweekly || false
                              }
                              onChange={handleInputChange}
                              className="form-check-input"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="row">
                          <div
                            className="col-md-5"
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <h5>Completed Litter pickup of ground areas</h5>
                          </div>
                          <div className="col-md-7">
                            <input
                              type="checkbox"
                              name="CompletedLitterpickupofgroundareas"
                              value={
                                formData.CompletedLitterpickupofgroundareas ||
                                false
                              }
                              checked={
                                formData.CompletedLitterpickupofgroundareas ||
                                false
                              }
                              onChange={handleInputChange}
                              className="form-check-input"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="row">
                          <div
                            className="col-md-5"
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <h5>Completed sweeping or blowing of walkways</h5>
                          </div>
                          <div className="col-md-7">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              name="Completedsweepingorblowingofwalkways"
                              value={
                                formData.Completedsweepingorblowingofwalkways ||
                                false
                              }
                              checked={
                                formData.Completedsweepingorblowingofwalkways ||
                                false
                              }
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="row">
                          <div
                            className="col-md-5"
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <h5>High priority areas were Visited weekly</h5>
                          </div>
                          <div className="col-md-7">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              name="HighpriorityareaswereVisitedweekly"
                              value={
                                formData.HighpriorityareaswereVisitedweekly ||
                                false
                              }
                              checked={
                                formData.HighpriorityareaswereVisitedweekly ||
                                false
                              }
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="row">
                          <div
                            className="col-md-5"
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <h5>V Ditches were cleaned and inspected</h5>
                          </div>
                          <div className="col-md-7">
                            <input
                              type="checkbox"
                              name="VDitcheswerecleanedandinspected"
                              onChange={handleInputChange}
                              value={
                                formData.VDitcheswerecleanedandinspected ||
                                false
                              }
                              checked={
                                formData.VDitcheswerecleanedandinspected ||
                                false
                              }
                              className="form-check-input"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div
                          className="row"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div
                            className="col-md-5"
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <h5>
                              Weep screen inspectedand cleaned in rotation
                              section
                            </h5>
                          </div>
                          <div className="col-md-7">
                            <input
                              name="WeepscreeninspectedandcleanedinrotationsectionId"
                              onChange={handleInputChange}
                              value={
                                formData.WeepscreeninspectedandcleanedinrotationsectionId ||
                                ""
                              }
                              className="datepicker-default form-control form-control-sm"
                              id="datepicker"
                            />

                            {/* <select className="default-select  form-control wide" >
                                                                <option>Select</option>
                                                                <option>2</option>
                                                                <option>3</option>
                                                                <option>4</option>
                                                            </select> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="estDataBox">
                    <div className="itemtitleBar">
                      <h4>Lawn Maintainence</h4>
                    </div>
                    <div className="basic-form">
                      <div className="card-body">
                        <div className="col-md-12">
                          <div
                            className="row"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Fertilization of Turf occoured</h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                name="Fertilizationoftrufoccoured"
                                onChange={handleInputChange}
                                value={
                                  formData.Fertilizationoftrufoccoured || ""
                                }
                                className="datepicker-default form-control form-control-sm"
                                id="datepicker"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Turf was Mowed and edged weekly</h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                name="Trufwasmovedandedgedweekly"
                                onChange={handleInputChange}
                                value={
                                  formData.Trufwasmovedandedgedweekly || false
                                }
                                checked={
                                  formData.Trufwasmovedandedgedweekly || false
                                }
                                className="form-check-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="estDataBox">
                    <div className="itemtitleBar">
                      <h4>Shrub Maintainence</h4>
                    </div>
                    <div className="basic-form">
                      <div className="card-body">
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>
                                Shrubs trimmed according to rotation schedule
                              </h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                name="Shrubstrimmedaccordingtorotationschedule"
                                onChange={handleInputChange}
                                value={
                                  formData.Shrubstrimmedaccordingtorotationschedule ||
                                  false
                                }
                                checked={
                                  formData.Shrubstrimmedaccordingtorotationschedule ||
                                  false
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div
                            className="row"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Fertilization of Shrubs occoured</h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                name="FertilizationofShrubsoccoured"
                                onChange={handleInputChange}
                                value={
                                  formData.FertilizationofShrubsoccoured || ""
                                }
                                className="datepicker-default form-control"
                                id="datepicker"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="estDataBox">
                    <div className="itemtitleBar">
                      <h4>Ground cover and flowerbed Maintainence</h4>
                    </div>
                    <div className="basic-form">
                      <div className="card-body">
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>
                                Watering of flowerbeds Completed and checked
                              </h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                name="WateringofflowerbedsCompletedandchecked"
                                onChange={handleInputChange}
                                value={
                                  formData.WateringofflowerbedsCompletedandchecked ||
                                  false
                                }
                                checked={
                                  formData.WateringofflowerbedsCompletedandchecked ||
                                  false
                                }
                                className="form-check-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="estDataBox">
                    <div className="itemtitleBar">
                      <h4>Irrigation System</h4>
                    </div>
                    <div className="basic-form">
                      <div className="card-body">
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Heads were adjusted for maximum coverage</h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                name="Headswereadjustedformaximumcoverage"
                                onChange={handleInputChange}
                                value={
                                  formData.Headswereadjustedformaximumcoverage ||
                                  false
                                }
                                checked={
                                  formData.Headswereadjustedformaximumcoverage ||
                                  false
                                }
                                className="form-check-input"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>
                                Repairs were made to maintain an effective
                                system
                              </h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                name="Repairsweremadetomaintainaneffectivesystem"
                                onChange={handleInputChange}
                                value={
                                  formData.Repairsweremadetomaintainaneffectivesystem ||
                                  false
                                }
                                checked={
                                  formData.Repairsweremadetomaintainaneffectivesystem ||
                                  false
                                }
                                className="form-check-input"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Controllers were inspected and adjusted</h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                name="Controllerswereinspectedandadjusted"
                                onChange={handleInputChange}
                                value={
                                  formData.Controllerswereinspectedandadjusted ||
                                  false
                                }
                                checked={
                                  formData.Controllerswereinspectedandadjusted ||
                                  false
                                }
                                className="form-check-input"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Main line was repaired</h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                name="Mainlinewasrepaired"
                                onChange={handleInputChange}
                                value={formData.Mainlinewasrepaired || false}
                                checked={formData.Mainlinewasrepaired || false}
                                className="form-check-input"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Valve(s) was repaired</h5>
                            </div>
                            <div className="col-md-7">
                              <input
                                type="checkbox"
                                name="Valvewasrepaired"
                                onChange={handleInputChange}
                                value={formData.Valvewasrepaired || false}
                                checked={formData.Valvewasrepaired || false}
                                className="form-check-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="estDataBox">
                    <div className="itemtitleBar">
                      <h4>Rotation</h4>
                    </div>
                    <div className="basic-form">
                      <div className="card-body">
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>This month's expected rotation schedule</h5>
                            </div>
                            <div className="col-md-7">
                              <div className="basic-form">
                                <div className="mb-3">
                                  <TextArea
                                    className="form-txtarea form-control"
                                    name="Thismonthexpectedrotationschedule"
                                    onChange={handleInputChange}
                                    value={
                                      formData.Thismonthexpectedrotationschedule ||
                                      ""
                                    }
                                    rows="2"
                                  ></TextArea>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="estDataBox">
                    <div className="itemtitleBar">
                      <h4>Extra Information</h4>
                    </div>
                    <div className="basic-form">
                      <div className="card-body">
                        <div className="col-md-12">
                          <div className="row">
                            <div
                              className="col-md-5"
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <h5>Notes</h5>
                            </div>
                            <div className="col-md-7">
                              <div className="basic-form">
                                <div className="mb-3">
                                  <TextArea
                                    className="form-txtarea form-control"
                                    rows="2"
                                    name="Notes"
                                    onChange={handleInputChange}
                                    value={formData.Notes || ""}
                                  ></TextArea>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-2 ">
                    <div className="col-md-4 ">
                      <div className="ms-4">
                        {" "}
                        <BackButton
                          onClick={() => {
                            navigate("/landscape");
                            // window.history.back();
                          }}
                        >
                          Back
                        </BackButton>
                      </div>
                    </div>
                    <div className="col-md-8 ps-0 text-end">
                      {idParam ? (
                        <>
                          <PrintButton
                            varient="mail"
                            onClick={handleMainButtonClick}
                          ></PrintButton>

                          <PrintButton
                            varient="print"
                            onClick={() => {
                              navigate(
                                `/landscape/landscape-report?id=${idParam}`
                              );
                            }}
                          ></PrintButton>
                          <PDFDownloadLink
                            document={
                              <LandScapePdf
                                landscapeData={{
                                  ...formData,
                                  name: formData.CustomerCompanyName,
                                  companyInfo: companyInfo,
                                  dynamicColorAndLogo: dynamicColorAndLogo,
                                }}
                              />
                            }
                            fileName="Landscape.pdf"
                          >
                            {({ blob, url, loading, error }) =>
                              loading ? (
                                <span className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn">
                                  <i className="fa fa-spinner"></i>
                                </span>
                              ) : (
                                <PrintButton
                                  varient="Download"
                                  onClick={() => {}}
                                ></PrintButton>
                              )
                            }
                          </PDFDownloadLink>
                        </>
                      ) : (
                        <></>
                      )}

                      <LoaderButton
                        loading={disableButton}
                        handleSubmit={handleSubmit}
                        disable={disableButton}
                      >
                        Save
                      </LoaderButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LandscapeForm;
