import React, { useRef, useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomerSearch from "../../Hooks/useCustomerSearch";
import useFetchCustomerName from "../../Hooks/useFetchCustomerName";
import {
  Alert,
  Autocomplete,
  TextField,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { Print, Email, Download } from "@mui/icons-material";
import Cookies from "js-cookie";
import { Delete, Create } from "@mui/icons-material";
import TitleBar from "../../TitleBar";
import { DataContext } from "../../../context/AppData";
import EventPopups from "../../Reusable/EventPopups";
import Contacts from "../../CommonComponents/Contacts";
import ServiceLocations from "../../CommonComponents/ServiceLocations";
import CircularProgress from "@mui/material/CircularProgress";
import LoaderButton from "../../Reusable/LoaderButton";
import useDeleteFile from "../../Hooks/useDeleteFile";
import useFetchContactEmail from "../../Hooks/useFetchContactEmail";
import BackButton from "../../Reusable/BackButton";
import FileUploadButton from "../../Reusable/FileUploadButton";
import PrintButton from "../../Reusable/PrintButton";
import TextArea from "../../Reusable/TextArea";
import { baseUrl } from "../../../apiConfig";
import CustomerAutocomplete from "../../Reusable/CustomerAutocomplete";
import imageCompresser from "../../../custom/ImageCompresser";

const AddWRform = () => {
  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5096 2.53165H7.41104C5.50437 2.52432 3.94146 4.04415 3.89654 5.9499V15.7701C3.85437 17.7071 5.38979 19.3121 7.32671 19.3552C7.35512 19.3552 7.38262 19.3561 7.41104 19.3552H14.7343C16.6538 19.2773 18.1663 17.6915 18.1525 15.7701V7.36798L13.5096 2.53165Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.2688 2.52084V5.18742C13.2688 6.48909 14.3211 7.54417 15.6228 7.54784H18.1482"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0974 14.0786H8.1474"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.2229 10.6388H8.14655"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { loggedInUser, setLoggedInUser ,setselectedPdf} = useContext(DataContext);

  const { deleteReportFile } = useDeleteFile();
  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { contactEmail, fetchEmail } = useFetchContactEmail();

  const [formData, setFormData] = useState({ StatusId: 1 });
  const [sLList, setSLList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const inputFile = useRef(null);
  const [Files, setFiles] = useState([]);
  const [estimateFiles, setEstimateFiles] = useState([]);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const [prevFiles, setPrevFiles] = useState([]);

  const navigate = useNavigate();

  const fetchServiceLocations = async (id) => {
    if(!id){
      return
    }
    axios
      .get(
        `${baseUrl}/api/Customer/GetCustomerServiceLocation?id=${id}`,
        { headers }
      )
      .then((res) => {
        setSLList(res.data);
        console.log("service locations are", res.data);
      })
      .catch((error) => {
        setSLList([]);
        console.log("service locations fetch error", error);
      });
  };

  const fetctContacts = async (id) => {
    if (!id) {
      return;
    }
    axios
      .get(
        `${baseUrl}/api/Customer/GetCustomerContact?id=${id}`,
        { headers }
      )
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
      const response = await axios.get(
        `${baseUrl}/api/Staff/GetStaffList`,
        { headers }
      );
      setStaffData(response.data);

      console.log("staff list iss", response.data);
    } catch (error) {
      console.log("error getting staff list", error);
    }
  };

  const [loading, setLoading] = useState(true);

  const getWeeklyPreview = async () => {
    if (!idParam) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/WeeklyReport/GetWeeklyReport?id=${idParam}`,
        { headers }
      );
      setFormData(res.data.Data);
      setPrevFiles(res.data.FileData);
      fetchEmail(res.data.Data.ContactId);
      setLoading(false);

      console.log("reponse weekly is", res.data);
    } catch (error) {
      setLoading(false);

      console.log("api call error", error);
    }
  };

  useEffect(() => {
    fetchServiceLocations(formData.CustomerId);
    fetctContacts(formData.CustomerId);
    // fetchName(formData.CustomerId);
    console.log("main payload isss", formData);
  }, [formData.CustomerId]);

  useEffect(() => {
    fetchStaffList();
    getWeeklyPreview();
  }, []);

  const handleCustomerAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange

    const simulatedEvent = {
      target: {
        name: "CustomerId",
        value: newValue ? newValue.UserId : "",
      },
    };
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

    handleInputChange(simulatedEvent);
  };

  const handleRBAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "AssignTo",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleInputChange = (e, newValue) => {
    setEmptyFieldsError(false);
    const { name, value, type, checked } = e.target;

    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId
    const adjustedValue = [
      "UserId",
      "ServiceLocationId",
      "ContactId",
     
    ].includes(name)
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
    console.log("Weakly payload", formData);
  };

  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const handleSubmit = (e) => {
    setDisableButton(true);
    setSubmitClicked(true);
    e.preventDefault();
    if (
      !formData.CustomerId ||
      !formData.ServiceLocationId ||
      !formData.ContactId ||
      !formData.AssignTo
    ) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("please fill all required fields");
      setDisableButton(false);

      console.log("Required fields are empty");
      return;
    }
    const postData = new FormData();

    // Merge the current items with the new items for EstimateData
    const WeeklyReportData = {
      ...formData,
      // CreatedBy: 2,
      // EditBy: 2,
      // isActive: true,
    };

    console.log("WeeklyReportData:", WeeklyReportData);
    // console.log("data:", data);

    postData.append("WeeklyReportData", JSON.stringify(WeeklyReportData));
    console.log(JSON.stringify(WeeklyReportData));
    // Appending files to postData
    Files.forEach((fileObj) => {
      postData.append("Files", fileObj);
    });

    submitData(postData);
  };

  // const appendFilesToFormData = (formData) => {
  //   Files.forEach((fileObj) => {
  //     formData.append("Files", fileObj.actualFile);
  //   });
  // };

  const submitData = async (postData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Important for multipart/form-data requests
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/WeeklyReport/AddWeeklyReport`,
        postData,
        {
          headers,
        }
      );

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      // setDisableButton(false);

      setTimeout(() => {
       
        navigate("/weekly-reports");
        setDisableButton(false);
        // navigate(
        //   `/weekly-reports/weekly-report-preview?id=${response.data.Id}`
        // );
      }, 3000);

      console.log("Data submitted successfully:", response.data);
    } catch (error) {
      console.error("API Call Error:", error);
      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }

    // Logging FormData contents (for debugging purposes)
    for (let [key, value] of postData.entries()) {
      console.log("fpayload....", key, value);
    }
    // window.location.reload();

    // console.log("post data izzz",postData);
  };

  const handleDeleteFile = (index) => {
    // Create a copy of the Files array without the file to be deleted
    const updatedFiles = [...Files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  const handleEstmDeleteFile = (index) => {
    // Create a copy of the estimateFiles array without the file to be deleted
    const updatedEstimateFiles = [...estimateFiles];
    updatedEstimateFiles.splice(index, 1);

    // Update the estimateFiles state with the updated array
    setEstimateFiles(updatedEstimateFiles);
  };

  const addFile = () => {
    inputFile.current.click();
    // console.log("Filesss are", Files);
  };

  const trackFile = async(e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      // const newFile = {
      // actualFile: uploadedFile,
      // name: uploadedFile.name,
      // caption: uploadedFile.name,
      // date: new Date().toLocaleDateString(),
      // };
      const compressedImg =  await imageCompresser(uploadedFile)
      
      setFiles((prevFiles) => [...prevFiles, compressedImg]);
    }
  };

  return (
    <>
      <TitleBar icon={icon} title="Add Weekly Report" />

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
              <div className="card-body" style={{ position: "relative" }}>
                {/* {loggedInUser.userRole !== "1" && (
                  <div
                    className="overlay"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0)",
                      zIndex: 999,
                    }}
                  ></div>
                )} */}
                <div className="row ">
                  <div className="col-md-3">
                    <label className="form-label">
                      Customers <span className="text-danger">*</span>
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
                  <div className="col-md-3 ">
                    <div className="row">
                      <div className="col-md-auto">
                        <label className="form-label">
                          Service Location
                          <span className="text-danger">*</span>{" "}
                        </label>
                      </div>
                      <div className="col-md-3">
                        {" "}
                        {formData.CustomerId ? (
                          <ServiceLocations
                            fetchServiceLocations={fetchServiceLocations}
                            fetchCustomers={fetchCustomers}
                            customerId={formData.CustomerId}
                          />
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                    <Autocomplete
                      id="inputState19"
                      size="small"
                      options={sLList}
                      getOptionLabel={(option) => option.Name || ""}
                      value={
                        sLList.find(
                          (customer) =>
                            customer.ServiceLocationId ===
                            formData.ServiceLocationId
                        ) || null
                      }
                      onChange={handleSLAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.ServiceLocationId === value.ServiceLocationId
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          placeholder="Service Locations"
                          error={submitClicked && !formData.ServiceLocationId}
                          className="bg-white"
                        />
                      )}
                      aria-label="Default select example"
                    />
                  </div>
                  <div className="col-md-3 ">
                    <div className="row">
                      <div className="col-md-auto">
                        <label className="form-label">
                          Contact<span className="text-danger">*</span>
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
                      getOptionLabel={(option) => option.FirstName + " " + option.LastName || ""}
                      value={
                        contactList.find(
                          (contact) => contact.ContactId === formData.ContactId
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
                      Assign/Appointment <span className="text-danger">*</span>
                    </label>
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={staffData.filter(
                        (staff) =>
                        staff.Role === "Regional Manager"||staff.Role === "Account Manager"||staff?.isSuperAdmin
                    )}
                      getOptionLabel={(option) => option.FirstName+ " "+option.LastName || ""}
                      value={
                        staffData.find(
                          (staff) => staff.UserId === formData.AssignTo
                        ) || null
                      }
                      onChange={handleRBAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === value.AssignTo
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
                          error={submitClicked && !formData.AssignTo}
                          placeholder="Choose..."
                          className="bg-white"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                {" "}
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
              <div className="itemtitleBar">
                <h4>General Information</h4>
              </div>
              <div className="card-body ">
                <div className="row ">
                  {/* <div className="col-md-3 ">
                    <label className="form-label">Job Name</label>
                    <input
                      type="text"
                      value={formData.JobName}
                      onChange={handleInputChange}
                      name="JobName"
                      className="form-control"
                      placeholder="Job Name"
                    />
                  </div> */}

                  <div className="col-md-3">
                    <label className="form-label">Report For Week of:</label>
                    <input
                      type="date"
                      name="ReportForWeekOf"
                      value={formData.ReportForWeekOf}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Created"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">This week's rotation:</label>

                    <input
                     type="text"
                      className="form-control number-input"
                      value={formData.Thisweekrotation}
                      onChange={handleInputChange}
                      name="Thisweekrotation"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Next weeks rotation: </label>
                    <input
                      type="text"
                      className="form-control number-input"
                      value={formData.Nextweekrotation}
                      onChange={handleInputChange}
                      name="Nextweekrotation"
                    />
                  </div>

                 
                </div>
                <div  className="row ">
                <div className="col-md-4">
                  
                  <label className="form-label mt-2">Service request Notes:</label>
                  <div className="col-md-12">
                    <TextArea
                      className="form-txtarea form-control"
                      rows="3"
                      name="ServiceRequests"
                      value={formData.ServiceRequests}
                      onChange={handleInputChange}
                     
                    ></TextArea>
                  </div>
                </div>
                <div className="col-md-4">
                    <label className="form-label  mt-2">Proposal Notes:</label>

                    <div className="mb-3">
                      <TextArea
                        className="form-control"
                        rows="3"
                        value={formData.ProposalsNotes}
                        onChange={handleInputChange}
                        name="ProposalsNotes"
                      
                      ></TextArea>
                    </div>
                  </div>
                <div className="col-md-4">
                  <label className="form-label  mt-2">Notes:</label>
                  <div className="col-md-12">
                    <TextArea
                      className="form-txtarea form-control"
                      rows="3"
                      name="Notes"
                      value={formData.Notes}
                      onChange={handleInputChange}
                     
                    ></TextArea>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* <div className="card">
              <div className="itemtitleBar">
                <h4>Proposals</h4>
              </div>
              <div className="card-body ">
                <div className="basic-form">
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label">Proposals Completed</label>
                      <div className="mb-3">
                        <TextArea
                          className=" form-control"
                          rows="3"
                          onChange={handleInputChange}
                          value={formData.ProposalsCompleted}
                          name="ProposalsCompleted"
                        
                        ></TextArea>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Proposals Submitted</label>

                      <div className="mb-3">
                        <TextArea
                          className=" form-control"
                          rows="3"
                          value={formData.ProposalsSubmitted}
                          onChange={handleInputChange}
                          name="ProposalsSubmitted"
                         
                        ></TextArea>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Notes</label>

                      <div className="mb-3">
                        <TextArea
                          className="form-control"
                          rows="3"
                          value={formData.ProposalsNotes}
                          onChange={handleInputChange}
                          name="ProposalsNotes"
                        
                        ></TextArea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="card">
              <div className="estDataBox">
                <div className="itemtitleBar">
                  <h4>Files</h4>
                </div>
              </div>
              <div className="card-body">
                <div className="row mt-2">
                  <div className="col-md-2 col-lg-2">
                    <FileUploadButton onClick={trackFile}>
                      Upload File
                    </FileUploadButton>
                    {/* <div className="basic-form">
                      <label className="form-label">Attachments</label>
                      <div className="dz-default dlab-message upload-img mb-3">
                        <form action="#" className="dropzone">
                          <svg
                            width="41"
                            height="40"
                            viewBox="0 0 41 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M27.1666 26.6667L20.4999 20L13.8333 26.6667"
                              stroke="#DADADA"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                            <path
                              d="M20.5 20V35"
                              stroke="#DADADA"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                            <path
                              d="M34.4833 30.6501C36.1088 29.7638 37.393 28.3615 38.1331 26.6644C38.8731 24.9673 39.027 23.0721 38.5703 21.2779C38.1136 19.4836 37.0724 17.8926 35.6111 16.7558C34.1497 15.619 32.3514 15.0013 30.4999 15.0001H28.3999C27.8955 13.0488 26.9552 11.2373 25.6498 9.70171C24.3445 8.16614 22.708 6.94647 20.8634 6.1344C19.0189 5.32233 17.0142 4.93899 15.0001 5.01319C12.9861 5.0874 11.015 5.61722 9.23523 6.56283C7.45541 7.50844 5.91312 8.84523 4.7243 10.4727C3.53549 12.1002 2.73108 13.9759 2.37157 15.959C2.01205 17.9421 2.10678 19.9809 2.64862 21.9222C3.19047 23.8634 4.16534 25.6565 5.49994 27.1667"
                              stroke="#DADADA"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                            <path
                              d="M27.1666 26.6667L20.4999 20L13.8333 26.6667"
                              stroke="#DADADA"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </svg>
                          <div className="fallback mb-3">
                            <input
                              name="file"
                              type="file"
                              onChange={trackFile}
                            />
                          </div>
                        </form>
                      </div>
                    </div> */}
                  </div>

                  {Files.map((file, index) => (
                    <div
                      key={index}
                      className="col-md-2 col-md-2 mt-3 image-container"
                      style={{
                        width: "115px", // Set the desired width
                        height: "110px", // Set the desired height
                        margin: "1em",
                        position: "relative",
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        style={{
                          width: "115px",
                          height: "110px",
                          objectFit: "cover",
                        }}
                      />
                      <p
                        className="file-name-overlay"
                        style={{
                          position: "absolute",
                          bottom: "0",
                          left: "0px",
                          right: "0",
                          backgroundColor: "rgba(0, 0, 0, 0.3)",
                          textAlign: "center",
                          overflow: "hidden",
                         
                          textOverflow: "ellipsis",
                          padding: "5px",
                        }}
                      >
                        {file.name}
                      </p>
                      <span
                        className="file-delete-button"
                        style={{
                          left: "90px",
                        }}
                        onClick={() => {
                          handleDeleteFile(index);
                        }}
                      >
                        <span>
                          <Delete color="error" />
                        </span>
                      </span>
                    </div>
                  ))}
                  {prevFiles.map((file, index) => {
                    return (
                      <div
                        key={index}
                        className="col-md-2 col-md-2 mt-3 image-container"
                        style={{
                          width: "115px", // Set the desired width
                          height: "110px", // Set the desired height
                          margin: "1em",
                          position: "relative",
                        }}
                      >
                        <a
                          href={`${baseUrl}/${file.FilePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`${baseUrl}/${file.FilePath}`}
                            style={{
                              width: "115px",
                              height: "110px",
                              objectFit: "cover",
                            }}
                          />
                        </a>
                        <p
                          className="file-name-overlay"
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0px",
                            right: "0",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            textAlign: "center",
                            overflow: "hidden",
                           
                            textOverflow: "ellipsis",
                            padding: "5px",
                          }}
                        ></p>
                        <span
                          className="file-delete-button"
                          style={{
                            left: "90px",
                          }}
                          onClick={() => {
                            deleteReportFile(
                              "WeeklyReport/DeleteWeeklyReportFile?FileId=",
                              file.WeeklyReportFileId,
                              getWeeklyPreview
                            );
                          }}
                        >
                          <span>
                            <Delete color="error" />
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="row mt-3 ">
                  <div className="col-md-4 ps-0">
                    <div className="ms-4">
                      <BackButton
                        onClick={() => {
                          navigate("/weekly-reports");
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
                          onClick={() => {
                            navigate(
                              `/send-mail?title=${"Weekly Report"}&mail=${contactEmail}&number=${''}`
                            );
                            setselectedPdf([])
                          }}
                        >
                          <Email />
                        </PrintButton>

                        <PrintButton
                          varient="print"
                          onClick={() => {
                            navigate(
                              `/weekly-reports/weekly-report-preview?id=${idParam}`
                            );
                          }}
                        ></PrintButton>
                      </>
                    ) : (
                      <></>
                    )}{" "}
                    <LoaderButton
                      loading={disableButton}
                      handleSubmit={handleSubmit}
                      disable={disableButton}
                    >
                      {/* Save and Preview */}
                      Save
                    </LoaderButton>
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

export default AddWRform;
