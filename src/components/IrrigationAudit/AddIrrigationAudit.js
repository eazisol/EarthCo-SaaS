import React, { useContext, useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Form } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { NavLink, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import { CircularProgress } from "@mui/material";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import formatDate from "../../custom/FormatDate";
import AuditController from "./AuditController";
import AuditControllerTable from "./AuditControllerTable";
import Contacts from "../CommonComponents/Contacts";
import { Print, Email, Download } from "@mui/icons-material";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import BackButton from "../Reusable/BackButton";
import PrintButton from "../Reusable/PrintButton";
import { baseUrl } from "../../apiConfig";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import TitleBar from "../TitleBar";
import HandleDelete from "../Reusable/HandleDelete";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";

const AddIrrigationAudit = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const { setselectedPdf} = useContext(DataContext);

  // Permissions for Irrigation Audit
  const menuAccess = useMenuAccess();
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.64111 13.5497L9.38482 9.9837L12.5145 12.4421L15.1995 8.97684"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="18.3291"
        cy="3.85021"
        rx="1.76201"
        ry="1.76201"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6808 2.86012H7.01867C4.25818 2.86012 2.54651 4.81512 2.54651 7.57561V14.9845C2.54651 17.7449 4.22462 19.6915 7.01867 19.6915H14.9058C17.6663 19.6915 19.3779 17.7449 19.3779 14.9845V8.53213"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [formData, setFormData] = useState({
    ReportDate: new Date().toISOString().substr(0, 10),
  });
  const [morePhoto, setMorePhoto] = useState([]);
  const [controllerFormData, setControllerFormData] = useState({});
  const [sLList, setSLList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSL, setSelectedSL] = useState(null);
  const [staffData, setStaffData] = useState([]);

  const [submitClicked, setSubmitClicked] = useState(false);
  const { name, setName, fetchName } = useFetchCustomerName();
  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { contactEmail, fetchEmail } = useFetchContactEmail();

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const [addSucces, setAddSucces] = useState("");

  const navigate = useNavigate();

  const handleCustomerAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    setErrorMessage("");
    const simulatedEvent = {
      target: {
        name: "CustomerId",
        value: newValue ? newValue.UserId : "",
      },
    };

    setSelectedCustomer(newValue);
    console.log("selected customer data", newValue);

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event

    handleInputChange(simulatedEvent);
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
  const fetchServiceLocations = async (id) => {
    if (!id) {
      return;
    }
    axios
      .get(`${baseUrl}/api/Customer/GetCustomerServiceLocation?id=${id}`)
      .then((res) => {
        setSLList(res.data);
        console.log("service locations are", res.data);
      })
      .catch((error) => {
        setSLList([]);
        console.log("service locations fetch error", error);
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

  const handleRBAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "RegionalManagerId",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleSLAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "ServiceLocationId",
        value: newValue ? newValue.ServiceLocationId : "",
      },
    };

    handleInputChange(simulatedEvent);
  };

  const handleContactAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "ContactId",
        value: newValue ? newValue.ContactId : "",
      },
    };

    setFormData({
      ...formData,
      ContactName: newValue.FirstName,
      ContactCompany: newValue.CompanyName,
      ContactEmail: newValue.Email,
    });

    handleInputChange(simulatedEvent);
  };

  const handleInputChange = (e, newValue) => {
    setErrorMessage("");
    setDisableButton(false);
    const { name, value } = e.target;

    setSelectedSL(newValue);

    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    console.log("main payload isss", formData);
  };

  useEffect(() => {
    fetchServiceLocations(formData.CustomerId);
    fetctContacts(formData.CustomerId);
    fetchName(formData.CustomerId);
    console.log("main payload isss", formData);
  }, [formData.CustomerId]);

  const [errorMessage, setErrorMessage] = useState("");
  const [disableButton, setDisableButton] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setFormData((prevData) => ({
        ...prevData,
        CustomerName: selectedCustomer.FirstName,
      }));
    }
  }, [selectedCustomer]);

  const handleSubmit = async () => {
    setSubmitClicked(true);

    if (
      !formData.CustomerId ||
      !formData.RegionalManagerId ||
      !formData.ContactId
    ) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("please fill all required Fields");
      setErrorMessage("please fill all required Fields");
      return;
    }
    setDisableButton(true);

    try {
      const res = await axios.post(
        `${baseUrl}/api/IrrigationAuditReport/AddIrrigationAuditReport`,
        formData,
        { headers }
      );
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(res.data.Message);
      setTimeout(() => {
        navigate(`/irrigation-audit`);
        setDisableButton(false);
      }, 4000);

    } catch (error) {
      console.log("error submitting data", error);
      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }
  };

  const [showForm, setShowForm] = useState(false);

  const toggleShowForm = () => {
    setShowForm(!showForm);
  };

  const [controllerList, setControllerList] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchIrrigation = async () => {
    if (!idParam) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/IrrigationAuditReport/GetIrrigationAuditReport?id=${idParam}`,
        { headers }
      );
      console.log("selected irrigation is", res.data);

      setFormData(res.data[0].Data);
      fetchEmail(res.data[0].Data.ContactId);
      setControllerList(res.data);
      //   setInputValue(res.data.IrrigationData.CustomerId);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      console.log("fetch irrigation api call error", error);
    }
  };

  useEffect(() => {
    fetchIrrigation();
  }, [idParam]);
  useEffect(() => {
    fetchCustomers();
    fetchStaffList();
  }, []);

  // if (isLoading) {
  //   return (
  //     <div className="center-loader">
  //                       <CircularProgress />
  //                     </div>
  //   )
  // }

  return (
    <>
      <TitleBar icon={icon} title="Add Controller - Audit" />
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="container-fluid">
        {isLoading ? (
          <div className="center-loader">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="card">
              <div className="card-body p-0">
                <div className="itemtitleBar">
                  <h4>General Information</h4>
                </div>
                <div className="card-body">
                  <div className="">
                    {/* {errorMessage ? (
                    <Alert severity="error">{errorMessage}</Alert>
                  ) : null}
                  {addSucces && <Alert severity="success">{addSucces}</Alert>} */}

                    <div className="row mb-2 mx-1">
                      {/* <div className="col-md-3 ">
                        <label className="form-label">Title</label>

                        <TextField
                          type="text"
                          size="small"
                          name="Title"
                          onChange={handleInputChange}
                          value={formData.Title}
                          className="form-control form-control-sm"
                          placeholder="Title"
                          error={submitClicked && !formData.Title}
                        />
                      </div> */}

                      <div className="col-md-3">
                        <label className="form-label">
                          Customer<span className="text-danger">*</span>
                        </label>
                        {/* <Autocomplete
                          id="staff-autocomplete"
                          size="small"
                          options={customerSearch}
                          getOptionLabel={(option) =>
                            option.FirstName
                              ? option.FirstName
                              : option.DisplayName || ""
                          }
                          filterOptions={(options, { inputValue }) => {
                            return options.filter(
                              (option) =>
                                option.FirstName?.toLowerCase().includes(
                                  inputValue?.toLowerCase()
                                ) ||
                                option.DisplayName?.toLowerCase().includes(
                                  inputValue?.toLowerCase()
                                )
                            );
                          }}
                          value={name ? { FirstName: name } : null}
                          onChange={handleCustomerAutocompleteChange}
                          isOptionEqualToValue={(option, value) =>
                            option.UserId === value.CustomerId
                          }
                          renderOption={(props, option) => (
                            <li {...props}>
                              <div className="customer-dd-border">
                                  <h6>
                                    
                                  #{option.UserId} - {option.FirstName}
                                  </h6>
                                  <small> {option.DisplayName}</small>
                                </div>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label=""
                              onClick={() => {
                                setName("");
                              }}
                              onBlur={() => {
                                fetchName(formData.CustomerId);
                              }}
                              onChange={(e) => {
                                fetchCustomers(e.target.value);
                              }}
                              placeholder="Choose..."
                              error={submitClicked && !formData.CustomerId}
                              className="bg-white"
                            />
                          )}
                        /> */}
                        <CustomerAutocomplete
                          formData={formData}
                          setFormData={setFormData}
                          submitClicked={submitClicked}
                        />
                      </div>

                      <div className="col-md-3">
                        <div className="row">
                          <div className="col-md-auto">
                            <label className="form-label">
                              Contacts<span className="text-danger">*</span>
                            </label>
                          </div>
                          <div className="col-md-3">
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
                              className="bg-white"
                              error={submitClicked && !formData.ContactId}
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
                              staff.Role === "Regional Manager" || staff.Role === "Account Manager"|| staff?.isSuperAdmin
                          )}
                          getOptionLabel={(option) =>
                            option.FirstName + " " + option.LastName || ""
                          }
                          value={
                            staffData.find(
                              (staff) =>
                                staff.UserId === formData.RegionalManagerId
                            ) || null
                          }
                          onChange={handleRBAutocompleteChange}
                          isOptionEqualToValue={(option, value) =>
                            option.UserId === value.RegionalManagerId
                          }
                          renderOption={(props, option) => (
                            <li {...props}>
                              <div className="customer-dd-border">
                                <div className="row">
                                  <div className="col-md-12">
                                    {" "}
                                    <h6 className="pb-0 mb-0">
                                      {" "}
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
                              error={
                                submitClicked && !formData.RegionalManagerId
                              }
                              placeholder="Choose..."
                              className="bg-white"
                            />
                          )}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Created</label>
                        <input
                          type="date"
                          name="ReportDate"
                          value={formatDate(formData.ReportDate)}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Created"
                        />
                      </div>
                      <div className="col-md-4 mt-4">
                        <BackButton
                          onClick={() => {
                            // setShowContent(true);
                            // setSelectedIrr(0);
                            navigate(`/irrigation-audit`);
                          }}
                        >
                          Back
                        </BackButton>
                      </div>
                      <div className="col-md-8 text-end mt-4">
                        <div>
                          {idParam === 0 ? null : (
                            <>
                              <HandleDelete
                                id={idParam}
                                endPoint={
                                  "IrrigationAuditReport/DeleteIrrigationAuditReport?id="
                                }
                                to="/irrigation-audit"
                                syncQB={() => {}}
                                disabled={!canDelete}
                              />
                              <PrintButton
                                varient="mail"
                                onClick={() => {
                                  navigate(
                                    `/send-mail?title=${"Irrigation Audit"}&mail=${contactEmail}&number=${''}`
                                  );
                                  setselectedPdf([])
                                }}
                              ></PrintButton>

                              <PrintButton
                                varient="print"
                                onClick={() => {
                                  navigate(
                                    `/irrigation-audit/preview?id=${idParam}`
                                  );
                                }}
                              ></PrintButton>
                            </>
                          )}{" "}
                          <LoaderButton
                            loading={disableButton}
                            disable={disableButton}
                            handleSubmit={handleSubmit}
                          >
                            Save
                          </LoaderButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              {idParam === 0 ? null : (
                <div className="row">
                  <div className="col-md-12 text-end">
                    <button
                      className="btn btn-dark btn-sm m-3"
                      onClick={toggleShowForm}
                    >
                      Add Controller Info
                    </button>
                  </div>
                </div>
              )}
              {showForm && (
                <AuditController
                  setAddSucces={setAddSucces}
                  fetchIrrigation={fetchIrrigation}
                  toggleShowForm={toggleShowForm}
                  idParam={idParam}
                  setFormData={setControllerFormData}
                  formData={controllerFormData}
                  morePhoto={morePhoto}
                  setMorePhoto={setMorePhoto}
                />
              )}

              <AuditControllerTable
                setAddSucces={setAddSucces}
                fetchIrrigation={fetchIrrigation}
                headers={headers}
                controllerList={controllerList}
                setShowForm={setShowForm}
                setFormData={setControllerFormData}
                morePhoto={morePhoto}
                setMorePhoto={setMorePhoto}
                canDelete={canDelete}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AddIrrigationAudit;
