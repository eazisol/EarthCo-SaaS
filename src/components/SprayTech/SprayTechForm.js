import React, { useContext, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import TitleBar from "../TitleBar";
import { NavLink, Navigate } from "react-router-dom";
import axios from "axios";
import { Print, Email, Download } from "@mui/icons-material";
import Cookies from "js-cookie";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import formatDate from "../../custom/FormatDate";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import { Delete, Create } from "@mui/icons-material";
import { Button } from "@mui/material";
import useDeleteFile from "../Hooks/useDeleteFile";
import { useNavigate } from "react-router-dom";
import MapCo from "./MapCo";
import { DataContext } from "../../context/AppData";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import ServiceLocations from "../CommonComponents/ServiceLocations";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import Contacts from "../CommonComponents/Contacts";
import BackButton from "../Reusable/BackButton";
import FileUploadButton from "../Reusable/FileUploadButton";
import PrintButton from "../Reusable/PrintButton";
import { baseUrl } from "../../apiConfig";


const SprayTechForm = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  // const isSRUpdateRoute = window.location.pathname.includes("Update-SRform");

  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();

  const {
    sRMapData,
    setSRMapData,
    PunchListData,
    setPunchListData,
    loggedInUser,
  } = useContext(DataContext);

  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { deleteSRFile } = useDeleteFile();

  const { name, setName, fetchName } = useFetchCustomerName();
  const { contactEmail, fetchEmail } = useFetchContactEmail();

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

  const [customersList, setCustomersList] = useState([]);
  const [customer, setCustomer] = useState();

  const [sRList, setSRList] = useState({});

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const [SRData, setSRData] = useState({
    ServiceRequestData: {
      ServiceRequestId: idParam,

      CustomerId: 0,
      ServiceRequestNumber: "",

      SRTypeId: loggedInUser.userRole == 5 ? 3 : 1,
      SRStatusId: 1,
      Assign: "",
      WorkRequest: "",
      ActionTaken: "",
      tblSRItems: [],
      tblServiceRequestLatLongs: [],
    },
  }); // payload

  const navigate = useNavigate();

  useEffect(() => {
    if (PunchListData) {
      setSRData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: PunchListData.CustomerId,
        },
      }));
    }

    // Set the tblSRItems state with the response.data.tblSRItems
    if (PunchListData.ItemData) {
      setTblSRItems(PunchListData.ItemData);

      fetchName(PunchListData.CustomerId);

      fetchStaffList();
      fetctContacts(PunchListData.CustomerId);
      console.log("PunchList Data link", PunchListData);
    }
  }, [PunchListData.ItemData]);

  useEffect(() => {
    fetchEmail(SRData.ServiceRequestData.ContactId);
  }, [SRData]);

  const [itemInput, setItemInput] = useState({
    Name: "",
    Qty: 1,
    Description: "",
    Rate: null,
  });
  const [tblSRItems, setTblSRItems] = useState([]);

  const [files, setFiles] = useState([]);

  const [sLList, setSLList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [sRTypes, setSRTypes] = useState([]);

  const [btnDisable, setBtnDisable] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const [addCustomerSuccess, setAddCustomerSuccess] = useState("");

  const [submitClicked, setSubmitClicked] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  const inputFile = useRef(null);

  const fetchServiceLocations = async (id) => {
    if (!id) {
      return;
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

    // try {
    //   const res = await axios.get(
    //     `${baseUrl}/api/Customer/GetCustomerServiceLocation?id=${id}`
    //   );
    //   setSLList(res.data);
    //   console.log("service locations are", res.data);
    // } catch (error) {
    //   setSLList([]);
    //   console.log("service locations fetch error", error);
    // }
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

    // try {
    //   const res = await axios.get(`${baseUrl}/api/Customer/GetCustomerContact?id=${id}`);
    //   console.log("contacts data isss", res.data);
    //   setContactList(res.data)
    // } catch (error) {
    //   setContactList([])
    //   console.log("contacts data fetch error", error);
    // }
  };
  useEffect(() => {
    fetchServiceLocations(SRData.ServiceRequestData.CustomerId);
    fetctContacts(SRData.ServiceRequestData.CustomerId);
    fetchName(SRData.ServiceRequestData.CustomerId);

    // SRData.ServiceRequestData.ContactId &&
    // SRData.ServiceRequestData.ServiceLocationId &&
    // SRData.ServiceRequestData.Assign
    //   ? setDisableSubmit(false)
    //   : setDisableSubmit(true);
  }, [SRData.ServiceRequestData.CustomerId]);

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

  const fetchSRTypes = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestTypes`,
        { headers }
      );
      console.log("service request types are", res.data);

      let filteredSRTypes = res.data; // Initialize with the original data

      if (loggedInUser.userRole == 5) {
        filteredSRTypes = res.data.filter((option) => option.SRTypeId === 3);
      }

      setSRTypes(filteredSRTypes);
    } catch (error) {
      console.log("error fetching SR types", error);
    }
  };

  const handleCustomerAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "CustomerId",
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

    handleInputChange(simulatedEvent);
  };

  const [selectedContacts, setSelectedContacts] = useState([]);
  const handleContactChange = (event, newValue) => {
    setSelectedContacts(newValue.map((company) => company.ContactId));
  };

  const handleStaffAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "Assign",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleInputChange = (event) => {
    // setSubmitClicked(false);
    setLoadingButton(false);
    setErrorMessage("");
    setEmptyFieldsError(false);
    const { name, value } = event.target;
    setSRData((prevData) => ({
      ServiceRequestData: {
        ...prevData.ServiceRequestData,
        [name]:
          name === "CustomerId" ||
          name === "ServiceLocationId" ||
          name === "ContactId" ||
          name === "Assign" ||
          name === "SRTypeId" ||
          name === "SRStatusId"
            ? Number(value)
            : value,
      },
    }));

    if (name === "CustomerId" && value != 0) {
      console.log(value);
      fetchServiceLocations(value);
      fetctContacts(value);
    }

    console.log("object,,,,,,", SRData);
  };

  const submitHandler = async () => {
    setSubmitClicked(true);

    if (
      !SRData.ServiceRequestData.CustomerId ||
      !SRData.ServiceRequestData.ServiceLocationId ||
      !SRData.ServiceRequestData.Assign ||
      selectedContacts.length <= 0
    ) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      console.log("Required fields are empty");
      return;
    }
    setLoadingButton(true);
    setBtnDisable(true);
    const formData = new FormData();

    const contactIdArray = selectedContacts.map((contact) => ({
      ContactId: contact,
    }));

    SRData.ServiceRequestData.tblSRItems = tblSRItems;
    SRData.ServiceRequestData.ContactId = selectedContacts[0];
    SRData.ServiceRequestData.tblServiceRequestContacts = contactIdArray;
    SRData.ServiceRequestData.tblServiceRequestLatLongs = sRMapData;

    console.log("servise request data before", SRData);

    formData.append(
      "ServiceRequestData",
      JSON.stringify(SRData.ServiceRequestData)
    );

    // formData.append(
    //   "ServiceRequestData",
    //   JSON.stringify(SRData.ServiceRequestData)
    // );
    files.forEach((file) => {
      formData.append("Files", file);
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/ServiceRequest/AddServiceRequest`,
        formData,
        {
          headers,
        }
      );
      console.log(response.data.Message);

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      setSubmitClicked(false);
      setLoadingButton(false);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
      navigate(`/service-requests/add-sRform?id=${response.data.Id}`);

      console.log("payload izzzzzzz", formData);
      console.log("sussessfully posted service request");

      setBtnDisable(false);

      // Handle successful submission
      // window.location.reload();
    } catch (error) {
      console.error("API Call Error:", error.response.data);
      setSubmitClicked(false);
      setLoadingButton(false);
      setBtnDisable(false);
      setErrorMessage(error.response.data);
      setError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }
    for (let [key, value] of formData.entries()) {
      console.log("filessss", key, value);
    }
  };

  const removeItem = (index) => {
    const newItems = [...tblSRItems];
    newItems.splice(index, 1);
    setTblSRItems(newItems);
  };

  const trackFile = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFiles((prevFiles) => [...prevFiles, uploadedFile]);
    }
    console.log("uploaded file is", uploadedFile);
  };
  const addFile = () => {
    inputFile.current.click();
  };
  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  const [PrevFiles, setPrevFiles] = useState([]);

  const fetchSR = async () => {
    if (idParam === 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequest?id=${idParam}`,
        { headers }
      );

      setSRList(response.data.Data);
      // setSROBJ(response.data);

      setSRMapData(response.data.LatLongData);

      setSRData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: response.data.Data.CustomerId,
          ...response.data.Data,
        },
      }));

      setSelectedContacts(
        response.data.ContactData.map((contact) => contact.ContactId)
      );

      // Set the tblSRItems state with the response.data.tblSRItems
      setTblSRItems(response.data.ItemData);
      setLoading(false);
      console.log("response.data.Data", response.data);
      setPrevFiles(response.data.FileData);

      console.log(" list is///////", response.data.Data);
    } catch (error) {
      setLoading(false);
      console.error("API Call Error:", error);
    }
  };

  useEffect(() => {
    fetchSR();
    fetchCustomers();
    return () => {
      setSRMapData([]);
    };
  }, []);

  useEffect(() => {
    console.log("items are", tblSRItems);
  }, [tblSRItems]);

  // items..........

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [showItem, setShowItem] = useState(true);
  const [itemBtnDisable, setItemBtnDisable] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    axios
      .get(
        `${baseUrl}/api/Item/GetSearchItemList?Search=${searchText}`,
        { headers }
      )
      .then((response) => {
        setSearchResults(response.data);
      })
      .catch((error) => {
        console.error("Error fetching itemss data:", error);
      });
  }, [searchText]);

  const handleItemChange = (event) => {
    setShowItem(true);
    setSearchText(event.target.value);

    setSelectedItem({}); // Clear selected item when input changes
  };

  const handleAddItem = () => {
    const newItem = { ...itemInput };
    if (!newItem.ItemId) {
      return;
    }
    const newAmount = newItem.Qty * newItem.Rate;
    newItem.Amount = newAmount;

    setTblSRItems([...tblSRItems, newItem]);

    // Reset the modal input field and other states
    setSearchText("");
    setSelectedItem({
      SalePrice: "",
      SaleDescription: "",
    });
    setItemInput({
      Name: "",
      Qty: 1,
      Description: "",
      Rate: 0,
    });

    // Enable or disable the button based on your condition
    // setItemBtnDisable(false); // You can add your logic here

    console.log("table items are ", tblSRItems);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSearchText(item.ItemName); // Set the input text to the selected item's name
    setItemInput({
      ...itemInput,
      ItemId: item.ItemId,
      Name: item.ItemName,
      Description: item.SaleDescription,
      Rate: item.SalePrice,
    });
    setShowItem(false);
    setSearchResults([]); // Clear the search results
    itemInput.ItemId && setItemBtnDisable(false);
    console.log("selected item is", itemInput);
  };

  const handleDescriptionChange = (itemId, event) => {
    const updatedItems = tblSRItems.map((item, index) => {
      if (index === itemId) {
        const updatedItem = { ...item };
        updatedItem.Description = event.target.value;

        return updatedItem;
      }
      return item;
    });

    setTblSRItems(updatedItems);
  };

  const handleQuantityChange = (itemId, event) => {
    const updatedItems = tblSRItems.map((item, index) => {
      if (index === itemId) {
        const updatedItem = { ...item };
        updatedItem.Qty = parseInt(event.target.value, 10);
        updatedItem.Amount = updatedItem.Qty * updatedItem.Rate;
        return updatedItem;
      }
      return item;
    });

    setTblSRItems(updatedItems);
  };

  const handleRateChange = (itemId, event) => {
    const updatedItems = tblSRItems.map((item, index) => {
      if (index === itemId) {
        const updatedItem = { ...item };
        updatedItem.Rate = parseFloat(event.target.value);
        updatedItem.Amount = updatedItem.Qty * updatedItem.Rate;
        return updatedItem;
      }
      return item;
    });

    setTblSRItems(updatedItems);
  };

  useEffect(() => {
    fetchSRTypes();
    fetchStaffList();
  }, []);

  // fileAdd

  return (
    <>
      <TitleBar icon={icon} title="Add Spray Tech" />
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <EventPopups
        open={showEmailAlert}
        setOpen={setShowEmailAlert}
        color={emailAlertColor}
        text={emailAlertTxt}
      />

      {loading ? (
        <div className="center-loader">
          <CircularProgress />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="card">
            <div className="">
              <div className="card-body p-0">
                {/* Add service form */}

                <div className="">
                  <div className="">
                    <div className="itemtitleBar">
                      <h4>Spray Tech Details</h4>
                    </div>{" "}
                    <div
                      className=" card-body"
                      style={{ position: "relative" }}
                    >
                      {loggedInUser.userRole == "1" ||
                        (loggedInUser.userRole == "5" ? (
                          <></>
                        ) : (
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
                        ))}
                      <div className="row">
                        <div className="col-md-3 mb-2">
                          <label className="form-label">
                            Customers<span className="text-danger">*</span>
                          </label>
                          <Autocomplete
                            id="staff-autocomplete"
                            size="small"
                            options={customerSearch}
                            getOptionLabel={(option) => option.FirstName || ""}
                            value={name ? { FirstName: name } : null}
                            onChange={handleCustomerAutocompleteChange}
                            isOptionEqualToValue={(option, value) =>
                              option.UserId === value.CustomerId
                            }
                            renderOption={(props, option) => (
                              <li {...props}>
                                <div className="customer-dd-border">
                                  <h6> {option.FirstName}</h6>
                                  <small># {option.UserId}</small>
                                </div>
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label=""
                                onBlur={() => {
                                  fetchName(
                                    SRData.ServiceRequestData.CustomerId
                                  );
                                }}
                                onClick={() => {
                                  setName("");
                                }}
                                onChange={(e) => {
                                  fetchCustomers(e.target.value);
                                }}
                                placeholder="Choose..."
                                error={
                                  submitClicked &&
                                  !SRData.ServiceRequestData.CustomerId
                                }
                                className="bg-white"
                              />
                            )}
                          />
                        </div>

                        <div className="col-xl-3 mb-2 col-md-3 ">
                          <div className="row">
                            <div className="col-md-auto">
                              <label className="form-label">
                                Service Locations
                                <span className="text-danger">*</span>{" "}
                              </label>
                            </div>
                            <div className="col-md-3">
                              {" "}
                              {SRData.ServiceRequestData.CustomerId ? (
                                <ServiceLocations
                                  fetchServiceLocations={fetchServiceLocations}
                                  fetchCustomers={fetchCustomers}
                                  customerId={
                                    SRData.ServiceRequestData.CustomerId
                                  }
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
                                  SRData.ServiceRequestData.ServiceLocationId
                              ) || null
                            }
                            onChange={handleSLAutocompleteChange}
                            isOptionEqualToValue={(option, value) =>
                              option.ServiceLocationId ===
                              value.ServiceLocationId
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label=""
                                placeholder="Service Locations"
                                className="bg-white"
                                error={
                                  submitClicked &&
                                  !SRData.ServiceRequestData.ServiceLocationId
                                }
                              />
                            )}
                            aria-label="Default select example"
                          />
                        </div>

                        <div className="col-xl-3 mb-2 col-md-9 ">
                          <div className="row">
                            <div className="col-md-auto">
                              <label className="form-label">
                                Contacts<span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-md-3">
                              {" "}
                              {SRData.ServiceRequestData.CustomerId ? (
                                <Contacts
                                  fetctContacts={fetctContacts}
                                  fetchCustomers={fetchCustomers}
                                  customerId={
                                    SRData.ServiceRequestData.CustomerId
                                  }
                                />
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>

                          <Autocomplete
                            multiple
                            size="small"
                            options={contactList}
                            getOptionLabel={(option) => option.FirstName || ""}
                            onChange={handleContactChange}
                            value={contactList.filter((company) =>
                              selectedContacts.includes(company.ContactId)
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label=""
                                placeholder="Select Contacts"
                                className="bg-white"
                                error={
                                  submitClicked && selectedContacts.length <= 0
                                }
                              />
                            )}
                            aria-label="Contact select"
                          />

                          {/* <Autocomplete
                            id="inputState299"
                            size="small"
                            options={contactList}
                            getOptionLabel={(option) => option.FirstName || ""}
                            value={
                              contactList.find(
                                (contact) =>
                                  contact.ContactId ===
                                  SRData.ServiceRequestData.ContactId
                              ) || null
                            }
                            onChange={handleContactAutocompleteChange}
                            isOptionEqualToValue={(option, value) =>
                              option.ContactId === value.ContactId
                            }
                            renderOption={(props, option) => (
                              <li {...props}>
                                <div className="customer-dd-border">
                                  <h6> {option.FirstName}</h6>
                                  <small>{option.Email}</small>
                                </div>
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label=""
                                error={
                                  submitClicked &&
                                  !SRData.ServiceRequestData.ContactId
                                }
                                placeholder="Contacts"
                                className="bg-white"
                              />
                            )}
                            aria-label="Contact select"
                          /> */}
                        </div>
                        <div className="col-xl-3 col-md-4">
                          {" "}
                          {/* Adjust the column size as needed */}
                          <label className="form-label">
                            Assign / Appointment:
                            <span className="text-danger">*</span>
                          </label>
                          <Autocomplete
                            id="staff-autocomplete"
                            size="small"
                            options={staffData.filter(
                              (staff) =>
                              staff.Role === "Regional Manager" || staff.Role === "Account Manager"||staff?.isSuperAdmin
                          )}
                            getOptionLabel={(option) => option.FirstName || ""}
                            value={
                              staffData.find(
                                (staff) =>
                                  staff.UserId ===
                                  SRData.ServiceRequestData.Assign
                              ) || null
                            }
                            onChange={handleStaffAutocompleteChange}
                            isOptionEqualToValue={(option, value) =>
                              option.UserId === value.Assign
                            }
                            renderOption={(props, option) => (
                              <li {...props}>
                                <div className="customer-dd-border">
                                  <div className="row">
                                    <div className="col-md-auto">
                                      {" "}
                                      <h6 className="pb-0 mb-0">
                                        {" "}
                                        {option.FirstName}
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
                                error={
                                  submitClicked &&
                                  !SRData.ServiceRequestData.Assign
                                }
                                placeholder="Choose..."
                                className="bg-white"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="row  mt-2 ">
                        <div className="col-md-3">
                          {" "}
                          {/* Adjust the column size as needed */}
                          <label className="form-label">
                            Spray Tech Number
                          </label>
                          <TextField
                            name="ServiceRequestNumber"
                            variant="outlined"
                            size="small"
                            value={
                              SRData.ServiceRequestData.ServiceRequestNumber ||
                              ""
                            }
                            onChange={handleInputChange}
                            className="form-txtarea form-control form-control-sm"
                            placeholder=" Service Request Number"
                          />
                        </div>
                        <div className="col-xl-3 col-md-3">
                          <label className="form-label">Type:</label>
                          <FormControl fullWidth variant="outlined">
                            <Select
                              name="SRTypeId"
                              value={SRData.ServiceRequestData.SRTypeId || ""}
                              onChange={handleInputChange}
                              size="small"
                            >
                              <MenuItem value=""></MenuItem>
                              {sRTypes.map((type) => (
                                <MenuItem
                                  key={type.SRTypeId}
                                  value={type.SRTypeId}
                                >
                                  {type.Type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                        <div className=" col-xl-3 col-md-4">
                          <label className="form-label">Due Date:</label>

                          <TextField
                            type="date"
                            name="DueDate"
                            size="small"
                            value={
                              formatDate(SRData.ServiceRequestData.DueDate) ||
                              ""
                            }
                            onChange={handleInputChange}
                            className="form-control form-control-sm"
                            placeholder="DueDate"
                          />
                        </div>
                        <div className="col-md-4"></div>
                      </div>
                    </div>
                    <div className="row mx-1 mb-3">
                      <div style={{position : "relative"}} className="col-lg-3 col-md-3 ">
                        {loggedInUser.userRole == "5" ? (
                          <><div
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
                        ></div></>
                        ) : (
                                                  
                          <></>
                        )}
                        <label className="form-label">Status:</label>
                        <FormControl fullWidth>
                          <Select
                            name="SRStatusId"
                            value={SRData.ServiceRequestData.SRStatusId || 1}
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
                </div>
                {/* Assign and scedule */}
                {/* <div className="">
                  <div className=" mt-3">
                    <div className="itemtitleBar">
                      <h4>Assign & Schedule</h4>
                    </div>
                    <br />
                    <div className="">
                      <div className="row">
                       
                        {/* <div className="col-md-6 pt-4">
                        {" "}
                         Adjust the column size as needed
                        <button className="btn schedule-btn">Schedule</button>
                      </div> 
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* item table */}
                <div className="itemtitleBar">
                  <h4>Items</h4>
                </div>
                <div className="card-body  pt-0 ">
                  <div className="estDataBox">
                    <div className="table-responsive active-projects style-1 mt-2">
                      <table id="empoloyees-tblwrapper" className="table ">
                        <thead>
                          <tr>
                            <th >Item</th>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount $</th>
                          
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tblSRItems?.map((item, index) => (
                            <tr key={index} style={{height  :"fit-content"}}>
                              <td>{item.Name}</td>
                              <td>
                                <TextField
                               size="small"
                               multiline
                               style={{ height: "fit-content"}}
                                  className="form-control form-control-sm"
                                  value={item.Description}
                                  onChange={
                                    (e) =>
                                      handleDescriptionChange(index, e) // Use item.ItemId
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                 
                                  className="form-control form-control-sm"
                                  value={item.Qty}
                                  onChange={
                                    (e) => handleQuantityChange(index, e) // Use item.ItemId
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                 
                                  className="form-control form-control-sm"
                                  value={item.Rate}
                                  onChange={
                                    (e) => handleRateChange(index, e) // Use item.ItemId
                                  }
                                />
                              </td>
                              <td className="text-right">{(item.Rate * item.Qty).toFixed(2)}</td>
                             
                              <td>
                                <div className="badgeBox">
                                  <Button onClick={() => removeItem(index)}>
                                    <Delete color="error" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          <tr>
                            <td>
                              <>
                                <Autocomplete
                                  id="search-items"
                                  options={searchResults}
                                  getOptionLabel={(item) => item.ItemName}
                                  value={selectedItem.ItemName} // This should be the selected item, not searchText
                                  onChange={(event, newValue) => {
                                    if (newValue) {
                                      handleItemClick(newValue);
                                    } else {
                                      setSelectedItem({});
                                    }
                                  }}
                                  filterOptions={(options, { inputValue }) => {
                                    return options.filter(
                                      (option) =>
                                        option.ItemName?.toLowerCase().includes(inputValue.toLowerCase()) ||
                                        option.SaleDescription?.toLowerCase().includes(inputValue.toLowerCase())
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Search for items..."
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      onChange={handleItemChange}
                                    />
                                  )}
                                  renderOption={(props, item) => (
                                    <li
                                      style={{
                                        cursor: "pointer",
                                        width: "30em",
                                      }}
                                      {...props}
                                      // onClick={() => handleItemClick(item)}
                                    >
                                      <div className="customer-dd-border">
                                        <p>
                                          <strong>{item.ItemName}</strong>{" "}
                                        </p>
                                        <p>{item.Type}</p>
                                        <small>{item.SaleDescription}</small>
                                      </div>
                                    </li>
                                  )}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      // Handle item addition when Enter key is pressed
                                      e.preventDefault(); // Prevent form submission
                                      handleAddItem();
                                    }
                                  }}
                                />
                              </>
                            </td>
                            <td>
                              <TextField
                                size="small"
                              multiline
                                  style={{ height: "fit-content"}}
                                value={itemInput.Description}
                                onChange={(e) =>
                                  setItemInput({
                                    ...itemInput,
                                    Description: e.target.value,
                                  })
                                }
                             
                                className="form-control form-control-sm"
                                placeholder="Description"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    // Handle item addition when Enter key is pressed
                                    e.preventDefault(); // Prevent form submission
                                    handleAddItem();
                                  }
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                name="Qty"
                                value={itemInput.Qty}
                                onChange={(e) =>
                                  setItemInput({
                                    ...itemInput,
                                    Qty: Number(e.target.value),
                                  })
                                }  
                                className="form-control form-control-sm"
                                placeholder="Quantity"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    // Handle item addition when Enter key is pressed
                                    e.preventDefault(); // Prevent form submission
                                    handleAddItem();
                                  }
                                }}
                              />
                            </td>
                            <td>
                             
                                <input
                                  type="number"
                                  name="Rate"
                                 
                                  className="form-control form-control-sm"
                                  value={itemInput.Rate}
                                  onChange={(e) =>
                                    setItemInput({
                                      ...itemInput,
                                      Rate: Number(e.target.value),
                                    })
                                  }
                                  onClick={(e) => {
                                    setSelectedItem({
                                      ...selectedItem,
                                      SalePrice: 0,
                                    });
                                  }}
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddItem();
                                    }
                                  }}
                                />
                             
                            </td>
                            <td className="text-right">
                              <h5 style={{ margin: "0" }}>
                                {(itemInput.Rate * itemInput.Qty).toFixed(2)}
                              </h5>
                            </td>
                            
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className=" mt-3">
                  <div className="">
                    <div className="itemtitleBar">
                      <h4>Details</h4>
                    </div>
                    <div className="card-body row">
                      <div className="col-md-12 mx-1 mt-2">
                        <div className="row">
                         
                            <div className="col-md-4 mb-1">
                              {" "}
                              {/* Adjust the column size as needed */}
                              <label className="form-label">
                                Work Requested:
                              </label>
                              <TextField
                                name="WorkRequest"
                                multiline
                                rows={3}
                                value={
                                  SRData.ServiceRequestData.WorkRequest || ""
                                }
                                onChange={handleInputChange}
                                variant="outlined"
                                placeholder="Work Requested"
                                size="small"
                                fullWidth
                              />
                            </div>
                            {SRData.ServiceRequestData.SRTypeId === 3? <></>:<>

                          <div className="col-md-4 mb-1">
                            {" "}
                            <label className="form-label">Action Taken:</label>
                            {/* Adjust the column size as needed */}
                            <TextField
                              name="ActionTaken"
                              placeholder="Action Taken"
                              multiline
                              rows={3}
                              value={
                                SRData.ServiceRequestData.ActionTaken || ""
                              }
                              onChange={handleInputChange}
                              variant="outlined"
                              fullWidth
                              size="small"
                            />
                          </div></>}

                          <div className=" col-md-4">
                            <label className="form-label">
                              Date Completed:
                            </label>

                            <TextField
                              type="date"
                              name="CompletedDate"
                              size="small"
                              value={
                                formatDate(
                                  SRData.ServiceRequestData.CompletedDate
                                ) || ""
                              }
                              onChange={handleInputChange}
                              className="form-control form-control-sm"
                              placeholder="Completed Date "
                            />
                          </div>

                          <div className="col-md-12">
                            {SRData.ServiceRequestData.SRTypeId === 3 ? (
                              <MapCo />
                            ) : (
                              // <iframe
                              //   className="SRmap"
                              //   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27233.071725612084!2d74.27175771628481!3d31.437978669606856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190143e0e99feb%3A0xf39379efff4dd86!2sUniversity%20of%20Management%20%26%20Technology!5e0!3m2!1sen!2s!4v1692089484116!5m2!1sen!2s"
                              //   allowFullScreen=""
                              //   loading="lazy"
                              //   referrerPolicy="no-referrer-when-downgrade"
                              // ></iframe>
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row card-body">
                      <div className="col-xl-2 col-md-2">
                        {/* <label className="form-label">Attachments</label>
                       <h4 className="card-title mt-2">Attachments</h4>
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
                        </div> */}
                        <FileUploadButton onClick={trackFile}>
                          Upload File
                        </FileUploadButton>
                      </div>

                      {PrevFiles.map((file, index) => (
                        <div
                          key={index}
                          className="col-md-2 col-md-2 mt-3 image-container"
                          style={{
                            width: "150px", // Set the desired width
                            height: "120px", // Set the desired height
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
                              alt={file.FileName}
                              style={{
                                width: "150px",
                                height: "120px",
                                objectFit: "cover",
                              }}
                            />
                          </a>
                          <p
                            className="file-name-overlay"
                            style={{
                              position: "absolute",
                              bottom: "0",
                              left: "13px",
                              right: "0",
                              backgroundColor: "rgba(0, 0, 0, 0.3)",
                              textAlign: "center",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              width: "100%",
                              textOverflow: "ellipsis",
                              padding: "5px",
                            }}
                          >
                            {file.FileName}
                          </p>
                          <span
                            className="file-delete-button"
                            style={{
                              left: "140px",
                            }}
                            onClick={() => {
                              deleteSRFile(file.SRFileId, fetchSR);
                            }}
                          >
                            <span>
                              <Delete color="error" />
                            </span>
                          </span>
                        </div>
                      ))}

                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="col-md-2 col-md-2 mt-3 image-container"
                          style={{
                            width: "150px", // Set the desired width
                            height: "120px", // Set the desired height
                            margin: "1em",
                            position: "relative",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              width: "150px",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                          <p
                            className="file-name-overlay"
                            style={{
                              position: "absolute",
                              bottom: "0",
                              left: "13px",
                              right: "0",
                              backgroundColor: "rgba(0, 0, 0, 0.3)",
                              textAlign: "center",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              width: "100%",
                              textOverflow: "ellipsis",
                              padding: "5px",
                            }}
                          >
                            {file.name}
                          </p>
                          <span
                            className="file-delete-button"
                            style={{
                              left: "140px",
                            }}
                            onClick={() => {
                              removeFile(index);
                            }}
                          >
                            <span>
                              <Delete color="error" />
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
             <div className="row">
                <div className="col-md-6 ">
                  <div className="ms-3">
                <BackButton
                    className="btn btn-danger  light ms-2"
                    
                    onClick={() => {
                      setPunchListData({});
                      navigate("/spray-tech");
                    }}
                  >
                    back
                  </BackButton>
                  </div>
                 
                </div>
                <div className="col-md-6 mb-3 text-right">
                  {idParam ? (
                    <>
                      {/* <FormControl className=" mx-2">
                        <Select
                          labelId="estimateLink"
                          aria-label="Default select example"
                          variant="outlined"
                          className="text-left me-2"
                          value={1}
                          // color="success"

                          name="Status"
                          size="small"
                          placeholder="Select Status"
                          fullWidth
                        >
                          <MenuItem value={1}>Create </MenuItem>
                          <MenuItem
                            value={2}
                            onClick={() => {
                              // setEstimateLinkData("PO clicked")
                              setSROBJ({});

                              navigate("/estimates/add-estimate");
                            }}
                          >
                            Estimate
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              navigate("/invoices/add-invoices");
                            }}
                            value={3}
                          >
                            Invoice
                          </MenuItem>
                        </Select>
                      </FormControl> */}
                      <PrintButton
                    
                    varient="mail"
                        onClick={() => {
                          navigate(
                            `/send-mail?title=${"Service Request"}&mail=${contactEmail}&customer=${name}&number=${
                              SRData.ServiceRequestData.ServiceRequestNumber
                            }&isOpen=${
                              SRData.ServiceRequestData.SRStatusId === 1
                                ? "Open"
                                : "Closed"
                            }`
                          );
                       
                        }}
                      >
                       
                      </PrintButton>
                      <PrintButton
                       varient="print"
                        onClick={() => {
                          navigate(
                            `/service-requests/service-request-preview?id=${idParam}`
                          );
                          // setestmPreviewId(estimate.EstimateId);
                          setSRData(customer);
                        }}
                      >
                       
                      </PrintButton>
                      <button
                        className="btn btn-dark me-2"
                        style={{ marginRight: "1em" }}
                        onClick={() => {
                          setPunchListData({
                            ServiceRequestId : SRData.ServiceRequestData.ServiceRequestId,
                            ServiceRequestNumber : SRData.ServiceRequestData.ServiceRequestNumber,
                            CustomerId: SRData.ServiceRequestData.CustomerId,
                            ServiceLocationId:
                              SRData.ServiceRequestData.ServiceLocationId,
                              EstimateNotes :  SRData.ServiceRequestData.WorkRequest,
                            FilesData: PrevFiles,
                            ContactIds: selectedContacts,
                            ItemData: tblSRItems.map((items) => ({
                              ...items,
                              isCost: false,
                            })),
                          });
                          navigate(`/estimates/add-estimate`);
                        }}
                      >
                        Copy to Estimate
                      </button>{" "}
                    </>
                  ) : (
                    <></>
                  )}
                 
                  <LoaderButton
                    loading={loadingButton}
                    handleSubmit={submitHandler}
                  >
                    Save
                  </LoaderButton>
                  {/* <button
                    type="button"
                    className="btn btn-primary me-2"
                    // disabled={disableSubmit}
                    onClick={submitHandler}
                  >
                    Submit
                  </button> */}
                </div>
              </div> </div>

              
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SprayTechForm