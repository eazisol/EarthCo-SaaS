import React, { useEffect, useState } from "react";
import axios from "axios";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import BackButton from "../Reusable/BackButton";
import { baseUrl } from "../../apiConfig";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import MultiSelectAutocomplete from "../Reusable/MultiSelectAutocomplete";
import useGetData from "../Hooks/useGetData";

const PunchlistModal2 = ({
  headers,
  fetchFilterdPunchList,
  addPunchListData,
  setAddPunchListData,
  selectedPL,
  setselectedPL,
}) => {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [regionalManagers, setRegionalManagers] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);

  const [staffData, setStaffData] = useState([]);
  console.log("🚀 ~ staffData:", staffData)
  const [contactList, setContactList] = useState([]);


  const handlePopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
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

  useEffect(() => {
    fetchStaffList();
    // fetchPunchList();
  }, []);
  useEffect(() => {
    fetctContacts(addPunchListData.CustomerId);
  }, [addPunchListData.CustomerId]);

  const fetchPLData = async () => {
    if (!selectedPL) {
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/PunchList/GetPunchlist?id=${selectedPL}`,
        { headers }
      );
      console.log("selected pl is", res.data);
      setAddPunchListData(res.data);
      setSelectedContact(res.data);

      // setRegionalManagers(
      //   res.data.AssignData.map((contact) => contact.AssignId)
      // );
    } catch (error) {
      console.log("fetch PL api call error", error);
    }
  };

  const fetchRMData = async () => {
    console.log("selectedPL", selectedPL);
    if (!selectedPL) {
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/PunchList/GetPunchlistAssigns?id=${selectedPL}`,
        { headers }
      );
      console.log("selected RM is", res.data);

      setRegionalManagers(res.data.map((contact) => contact.AssignId));
    } catch (error) {
      console.log("fetch RM api call error", error);
    }
  };

  useEffect(() => {
    fetchPLData();
    fetchRMData();
  }, [selectedPL]);

  const [selectedContact, setSelectedContact] = useState({});
  const handleContactAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "ContactId",
        value: newValue ? newValue.ContactId : "",
      },
    };
    setSelectedContact(newValue);
    setAddPunchListData((prevData) => ({
      ...prevData,
      ContactName: newValue.FirstName,
      ContactCompany: newValue.CompanyName,
      ContactEmail: newValue.Email,
    }));
    // console.log("selected contact is", newValue);

    handleChange(simulatedEvent);
  };

  const handleStaffAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "AssignedTo",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleChange(simulatedEvent);
  };

  const [submitClicked, setSubmitClicked] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDisableButton(false);
    setAddPunchListData((prevState) => ({
      ...prevState,
      [name]: value,
      StatusId: 2,
    }));
    // console.log("handle change", addPunchListData);
  };

  const handleSubmit = async (event) => {
    setSubmitClicked(true);
    event.preventDefault();

    if (
      !addPunchListData.CustomerId ||
      !addPunchListData.Title ||
      !addPunchListData.ContactId
      // !addPunchListData.AssignedTo
    ) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      return;
    }
    if (regionalManagers.length <= 0) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please Select regional Manager");
      console.log("Required fields are empty");
      return;
    }
    setDisableButton(true);
    const assignArray = regionalManagers.map((contact) => ({
      AssignId: contact,
    }));

    try {
      const response = await axios.post(
        `${baseUrl}/api/PunchList/AddPunchList`,
        {
          ...addPunchListData,
          AssignedTo: regionalManagers[0],
          tblPunchlistAssigns: assignArray,
        },
        { headers }
      );
      // Handle success - maybe redirect or show a message
      console.log("successfully posted punch list", addPunchListData);
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      setDisableButton(false);

      setselectedPL(0);
      fetchFilterdPunchList();
      document.getElementById("punchListcloser").click();
    } catch (error) {
      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
      console.error("Error sending dataaaaaaaa:", error);
      // console.log("Error sending dataaaaaa:",addPunchListData);

      // Handle error - show an error message to the user
    }
  };

  // useEffect(() => {
  //   console.log("punch list dataaa", addPunchListData);
  //   console.log("selected contact dataaa", selectedContact);
  // }, [addPunchListData, selectedContact]);

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="modal fade modal-lg" id="editPunch">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Punchlist</h5>
              <button
                // type="button"
                className="btn-close"
                onClick={() => {
                  document.getElementById("punchListcloser").click();
                }}
              ></button>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className=" col-md-6 mb-3">
                  <label className="form-label">
                    Title<span className="text-danger">*</span>
                  </label>
                  <TextField
                    type="text"
                    className="form-control"
                    name="Title"
                    size="small"
                    value={addPunchListData.Title || ""}
                    onChange={handleChange}
                    placeholder="Title"
                    error={submitClicked && !addPunchListData.Title}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Customer <span className="text-danger">*</span>
                  </label>

                  <CustomerAutocomplete
                    formData={addPunchListData}
                    setFormData={setAddPunchListData}
                    submitClicked={submitClicked}
                    handlePopup={handlePopup}
                    setBtnDisable={setBtnDisable}
                    checkQb={true}
                  />
                </div>

                <div className="col-md-6 mb-3 ">
                  <label className="form-label">
                    Contact Name<span className="text-danger">*</span>
                  </label>
                  <Autocomplete
                    size="small"
                    options={contactList}
                    getOptionLabel={(option) =>
                      option.FirstName + " " + option.LastName || ""
                    }
                    value={
                      contactList.find(
                        (contact) =>
                          contact.ContactId === addPunchListData.ContactId
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
                        error={submitClicked && !addPunchListData.ContactId}
                        placeholder="Contacts"
                        className="bg-white"
                      />
                    )}
                    aria-label="Contact select"
                  />
                </div>

                {/* <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Regional Manager <span className="text-danger">*</span>
                  </label>
                  <Autocomplete
                    id="staff-autocomplete"
                    size="small"
                    options={staffData.filter(
                      (staff) => staff.Role === "Regional Manager"
                    )}
                    getOptionLabel={(option) =>
                      option.FirstName + " " + option.LastName || ""
                    }
                    value={
                      staffData.find(
                        (staff) => staff.UserId === addPunchListData.AssignedTo
                      ) || null
                    }
                    onChange={handleStaffAutocompleteChange}
                    isOptionEqualToValue={(option, value) =>
                      option.UserId === value.AssignedTo
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
                        error={submitClicked && !addPunchListData.AssignedTo}
                        placeholder="Choose..."
                        className="bg-white"
                      />
                    )}
                  />
                </div> */}
                <div className="col-md-6 mb-3">
                  <MultiSelectAutocomplete
                    options={staffData.filter(
                      (staff) =>
                        staff.Role === "Regional Manager"|| staff.Role === "Account Manager"||staff?.isSuperAdmin
                    )}
                    property="Assign"
                    label="Regional Manager"
                    selectedOptions={regionalManagers}
                    setSelectedOptions={setRegionalManagers}
                    fullList={staffData}
                    error={submitClicked}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Contact Company</label>
                  <TextField
                    size="small"
                    value={
                      selectedContact.CompanyName ||
                      addPunchListData.ContactCompany ||
                      ""
                    }
                    fullWidth
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Contact Email</label>
                  <TextField
                    size="small"
                    value={
                      selectedContact.Email ||
                      addPunchListData.ContactEmail ||
                      ""
                    }
                    fullWidth
                  />
                </div>

                {/* {emptyFieldError && (
                  <div className="col-md-12">
                    <Alert severity="error">
                      {" "}
                      Please fill all required fields
                    </Alert>
                  </div>
                )} */}

                {/* <div className="col-lg-6 col-md-6 ">
                        <label className="form-label">Status:</label>
                        <FormControl fullWidth>
                          <Select
                            name="StatusId"
                            value={addPunchListData.StatusId || ""}
                            onChange={handleChange}
                            size="small"
                          >
                            <MenuItem value={1}>Open</MenuItem>
                            <MenuItem value={2}>Closed</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                     */}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger light"
                id="punchListcloser"
                data-bs-dismiss="modal"
                data-bs-target="#editPunch"
                onClick={() => {
                  setAddPunchListData((prevData) => ({
                    ...prevData,
                    Title: "",
                    AssignedTo: null,
                    CustomerId: null,
                    ContactEmail: null,
                    ContactId: null,
                    ContactCompany: null,
                  }));

                  setselectedPL(0);

                  // Clear the Contact Email field
                  setSelectedContact((prevData) => ({
                    ...prevData,
                    Email: null,
                    CompanyName: null,
                  }));
                  setRegionalManagers([]);
                }}
              >
                Close
              </button>
              <LoaderButton
                loading={disableButton}
                handleSubmit={handleSubmit}
                disable={btnDisable}
              >
                Save
              </LoaderButton>
              {/* <button
              
                className="btn btn-primary"
               
                onClick={handleSubmit}
              >
                Next
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PunchlistModal2;
