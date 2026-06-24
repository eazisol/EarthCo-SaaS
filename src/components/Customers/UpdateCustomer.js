import React, { useEffect, useState, useRef, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import AdressModal from "../Modals/AdressModal";
import { Form } from "react-bootstrap";
import { Create, Delete, Update } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import validator from "validator";
import CircularProgress from "@mui/material/CircularProgress";
import AddressInputs from "../Modals/AddressInputs";
import { useFormik } from "formik";
import { ServiceValidation, ValidationCustomer } from "./ValidationCustomer";
import MapCo from "./MapCo";
import { DataContext } from "../../context/AppData";
import { baseUrl } from "../../apiConfig";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const UpdateCustomer = ({
  headers,
  selectedItem,
  setShowContent,
  setCustomerAddSuccess,
  setCustomerUpdateSuccess,
  fetchCustomers,
}) => {
  const navigate = useNavigate();

  const { serviceLocationAddress, setServiceLocationAddress } =
    useContext(DataContext);

  const [customerData, setCustomerData] = useState({});
  const [contacts, setContacts] = useState([]);
  const [loginState, setLoginState] = useState("dontallow");
  const [showLogin, setShowLogin] = useState(false);
  const [primary, setPrimary] = useState(false);
  const [alowContactLogin, setAlowContactLogin] = useState(false);
  const [allowLogin, setAllowLogin] = useState(false);

  const [showContacts, setShowContacts] = useState(false);
  const [showSRLocation, setShowSRLocation] = useState(false);

  const [customerAddress, setCustomerAddress] = useState("");

  // company data
  const [companyData, setCompanyData] = useState({
    CompanyName: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Address: "",
    Phone: "",
    AltPhone: "",
    Fax: "",
    CustomerTypeId: "",
    Notes: "",
    username: "",
    Password: "",
    ConfirmPassword: "",
    CustomerTypeId: 1,
  });
  const [customerType, setCustomerType] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState({});
  const [responseid, setresponseid] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [disableButton, setDisableButton] = useState(false);
  const [error, setError] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(true);

  // updated contacts
  const [contactData, setContactData] = useState({});
  const [contactDataList, setContactDataList] = useState([]);
  const [contactAddSuccess, setContactAddSuccess] = useState(false);
  const [contactDelSuccess, setContactDelSuccess] = useState(false);
  // service Locations
  const [serviceLocations, setServiceLocations] = useState({});
  const [slForm, setSlForm] = useState([]);
  const [addSLSuccess, setAddSLSuccess] = useState(false);

  // tabs
  const [value, setValue] = useState(0);

  useEffect(() => {
    console.log("customer address", customerAddress);
  }, [customerAddress]);

  const getCustomerData = async () => {
    if (selectedItem === 0) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/GetCustomer?id=${selectedItem}`,
        {
          headers,
        }
      );
      setLoading(false);

      // AhsanModel
      // Handle the response. For example, you can reload the customers or show a success message
      console.log("Customer zzzzzzzz:", response.data);
      setSelectedCompany(response.data);
      setAllowLogin(response.data.isLoginAllow);
      setCompanyData(response.data.Data);
      setContactDataList(response.data.ContactData);
      setSlForm(response.data.ServiceLocationData);
      console.log(response.data.ServiceLocationData);
    } catch (error) {
      setLoading(false);
      console.error("There was an error updating the customer:", error);
    }
  };
  useEffect(() => {
    getCustomerData();
    getCustomerType();
  }, []);

  // validation logic
  useEffect(() => {
    // Check if allowLogin is true
    if (allowLogin) {
      // Check if username is not null and passwords match
      if (
        companyData.username &&
        companyData.Password &&
        companyData.Password === companyData.ConfirmPassword
      ) {
      } else {
      }
    } else {
      // Check if company name, first name, last name, and email are not empty
      if (
        companyData.CompanyName &&
        companyData.FirstName &&
        companyData.LastName &&
        companyData.Email
      ) {
      } else {
      }
    }
  }, [companyData, allowLogin]);

  // company logic
  const getCustomerType = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/GetCustomerTypes`,
        { headers }
      );
      console.log("getCustomerType", response.data);
      setCustomerType(response.data);
      console.log(".............", customerType);
    } catch (error) {
      console.log("getCustomerType api call error", error);
    }
  };
  const [submitClicked, setSubmitClicked] = useState(false);
  const [emptyFieldError, setEmptyFieldError] = useState(false);
  const [emailValidError, setemailValidError] = useState(false);
  const [companyNameError, setCompanyNameError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const handleSubmit = async () => {
    setDisableButton(true);
    console.log("check1");
    setSubmitClicked(true);
    if (
      !companyData.CompanyName ||
      !companyData.FirstName ||
      !companyData.LastName ||
      !companyData.Email
    ) {
      console.log("check2 ");

      setEmptyFieldError(true);

      return; // Return early if any required field is empty
    }

    if (
      allowLogin &&
      (!companyData.username ||
        !companyData.Password ||
        !companyData.ConfirmPassword)
    ) {
      console.log("check3");

      return; // Return early if login fields are empty
    }
    if (allowLogin && companyData.Password !== companyData.ConfirmPassword) {
      console.log("check4");
      return; // Return early if passwords do not match
    }

    if (!validator.isLength(companyData.CompanyName, { min: 3, max: 30 })) {
      setCompanyNameError(true);
      console.log("Company name should be between 3 and 30 characters");
      return;
    }

    // Validate first name length
    if (!validator.isLength(companyData.FirstName, { min: 3, max: 30 })) {
      setFirstNameError(true);
      console.log("First name should be between 3 and 30 characters");
      return;
    }

    // Validate last name length
    if (!validator.isLength(companyData.LastName, { min: 3, max: 30 })) {
      setLastNameError(true);
      console.log("Last name should be between 3 and 30 characters");
      return;
    }

    if (!validator.isEmail(companyData.Email)) {
      setemailValidError(true);
      console.log("Email must contain the @ symbol");
      return;
    }
    if (
      companyData.Phone &&
      !validator.isMobilePhone(companyData.Phone, "any", { max: 20 })
    ) {
      setPhoneError(true);
      console.log("Phone number is not valid");
      return;
    }

    try {
      const response = await axios.post(
        "${baseUrl}/api/Customer/AddCustomer",
        companyData,
        {
          headers,
        }
      );

      // console.log("postData,,,,,,,,,:", postData);
      setEmptyFieldError(false);

      setTimeout(() => {
        setCustomerUpdateSuccess(false);
        setCustomerAddSuccess(false);
      }, 4000);
      selectedItem === 0
        ? setCustomerAddSuccess(true)
        : setCustomerUpdateSuccess(true);

      fetchCustomers();
      // navigate("/Customers");
      setShowContent(true);
      setDisableButton(false);
      // window.location.reload();
    } catch (error) {
      setDisableButton(false);
      setError(true);
      setEmptyFieldError(false);
      setEmailError(error.response.data);
      console.error("Error submitting data:", error.response.data);
      // console.log("customer payload is", companyData);
    }
  };
  const handleCompanyChange = (e) => {
    setemailValidError(false);
    setEmptyFieldError(false);
    setDisableButton(false);
    setLastNameError(false);
    setFirstNameError(false);
    setCompanyNameError(false);
    setPhoneError(false);
    const { name, value } = e.target;

    setCompanyData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
        isLoginAllow: allowLogin,
      };

      // Additional checks for the username and password fields
      if (name === "Password" || name === "ConfirmPassword") {
        // Check if the passwords match
        const isMatching =
          name === "Password"
            ? value === prevFormData.ConfirmPassword
            : prevFormData.Password === value;

        setPasswordsMatch(isMatching);

        // Disable button if passwords don't match when allowLogin is true
        if (allowLogin && !isMatching) {
          setDisableButton(true);
        }
      } else if (allowLogin && name === "username" && !value) {
        // Disable button if username is empty when allowLogin is true
        setDisableButton(true);
      }

      setError(false);
      console.log("company data is", updatedFormData);

      return updatedFormData;
    });
  };

  //  Contacts logic

  // AhsanModel
  const formInitialValues = {
    CompanyName: "",
    FirstName: "",
    LastName: "",
    Phone: "",
    AltPhone: "",
    Email: "",
    Address: "",
    Comments: "",
  };

  useEffect(() => {
    //console.log("Service Locations in useEffect:", serviceLocations);
    formik.setValues({
      CompanyName: contactData.CompanyName,
      FirstName: contactData.FirstName,
      LastName: contactData.LastName,
      Phone: contactData.Phone,
      AltPhone: contactData.AltPhone,
      Email: contactData.Email,
      Address: contactData.Address,
      Comments: contactData.Comments,
      ContactId: contactData.ContactId,
    });
  }, [contactData]);

  const resetForm = () => {
    formik.resetForm();
    //setContactAddSuccess(false);
  };

  const handleAddContactsClick = () => {
    resetForm();
  };

  const formik = useFormik({
    initialValues: formInitialValues,
    validationSchema: ValidationCustomer,

    onSubmit: async (values, action) => {
      console.log(values);

      const CId = selectedItem;

      const updatedValues = {
        ...values,
        CustomerId: CId,
      };
      console.log(updatedValues);

      try {
        const response = await axios.post(
          `${baseUrl}/api/Customer/AddContact`,
          updatedValues,
          { headers }
        );
        console.log("successful contact api", response.data.Id);
        //setShouldCloseModal(true);

        // Update the contactData with the response id, then add to list
        setContactData((prevState) => ({
          ...prevState,
          ContactId: response.data.Id,
        }));

        // Consider moving response id state update and contactDataList update here after the contactData state is guaranteed to be set
        setresponseid(response.data.Id);
        getCustomerData();

        const closeButton = document.getElementById("closer");
        if (closeButton) {
          closeButton.click();
        }

        action.resetForm();

        setTimeout(() => {
          setContactAddSuccess(false);
        }, 3000);
        setContactAddSuccess(true);
        // Adding to contactDataList can be here as well to ensure it's added after contactData is set with new ContactId
      } catch (error) {
        console.log("api call error", error);
      }
    },
  });

  // const handleContactChange = (e) => {
  //   const { name, value, type } = e.target;

  //   // Check if the input type is "number" and convert the value to a number
  //   // const parsedValue = type === 'number' ? parseFloat(value) : valu

  //   setContactData({
  //     ...contactData,
  //     [name]: value,
  //     CustomerId: selectedItem,
  //   });
  //   console.log("contact data,,,,,,", contactData);
  // };

  // useEffect(() => {
  //   // Only add to contactDataList if contactData is not empty
  //   if (
  //     contactData.FirstName ||
  //     contactData.LastName ||
  //     contactData.Phone ||
  //     contactData.Email
  //   ) {
  //     console.log("contactDataList", contactDataList);
  //     console.log("Adding to contactDataList: ", contactData);
  //     setContactDataList((prevList) => [...prevList, contactData]);
  //   }
  //   setContactData({
  //     FirstName: "",
  //     LastName: "",
  //     Phone: "",
  //     AltPhone: "",
  //     Email: "",
  //     Address: "",
  //     Comments: "",
  //   });
  // }, [responseid]); // Depends on when responseid is set

  // const [shouldCloseModal, setShouldCloseModal] = useState(false); // close modal
  // const handleContactSave = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const response = await axios.post(
  //       "${baseUrl}/api/Customer/AddContact",
  //       contactData,
  //       { headers }
  //     );
  //     console.log("successful contact api", response.data.Id);
  //     setShouldCloseModal(true);

  //     // Update the contactData with the response id, then add to list
  //     setContactData((prevState) => ({
  //       ...prevState,
  //       ContactId: response.data.Id,
  //     }));

  //     // Consider moving response id state update and contactDataList update here after the contactData state is guaranteed to be set
  //     setresponseid(response.data.Id);
  //     getCustomerData();
  //     setTimeout(() => {
  //       setContactAddSuccess(false);
  //     }, 3000);
  //     setContactAddSuccess(true);
  //     // Adding to contactDataList can be here as well to ensure it's added after contactData is set with new ContactId
  //   } catch (error) {
  //     console.log("api call error", error);
  //   }
  // };

  const delContact = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/DeleteContact?id=${id}`,
        { headers }
      );

      const updatedContacts = contactDataList.filter(
        (contact) => contact.ContactId !== id
      );
      setContactDataList(updatedContacts);
      setContactDelSuccess(true);
      setTimeout(() => {
        setContactDelSuccess(false);
      }, 4000);
      console.log("contact deleted sussessfully", id, response);
    } catch (error) {
      console.log("error deleting contact", error);
    }
  };

  const deleteContact = (id) => {
    delContact(id);
  };

  const updateContact = (id) => {
    console.log(id);
    const updatedContacts = contactDataList.filter(
      (contact) => contact.ContactId !== id
    );
    setContactDataList(updatedContacts);
  };

  useEffect(() => {
    if (loginState === "allow") {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [loginState]);

  // const isSaveDisabled = () => {
  //   return (
  //     !contactData.FirstName ||
  //     !contactData.LastName ||
  //     !contactData.Phone ||
  //     !contactData.Email ||
  //     !contactData.Address ||
  //     // Check for other fields if they are required as well
  //     false
  //   ); // This false is just to avoid ending the statement with ||
  // };

  // service locations logic

  const handleSLChange = (e) => {
    const { name, type, value } = e.target;

    const updatedValue = e.target.value;

    setServiceLocations((prevLocations) => ({
      ...prevLocations,
      CustomerId: selectedItem,
      [name]: updatedValue,
    }));
    console.log("ssssssss", serviceLocations);
  };

  //AhsanModel

  const serviceFromInitialValue = {
    Name: "",
    Address: "",
    Phone: "",
    AltPhone: "",
    isBilltoCustomer: null,
    ServiceLocationId: null,
  };

  const resetFormLocation = () => {
    formikAddService.resetForm();
    //setContactAddSuccess(false);
  };

  useEffect(() => {
    console.log("lat lng data", serviceLocationAddress);
  }, [serviceLocationAddress]);

  const handleAddLocationClick = () => {
    resetFormLocation();
  };

  const [sLSubmitClicked, setSLSubmitClicked] = useState(false);
  // const [emptyAddress, setEmptyAddress] = useState(false);

  const formikAddService = useFormik({
    initialValues: serviceFromInitialValue,
    // validationSchema: ServiceValidation,

    onSubmit: async (values, action) => {
      setSLSubmitClicked(true);
      console.log("Form value", values);

      const CId = selectedItem;
      const updatedValues = {
        ...values,
        CustomerId: CId,
        Address: serviceLocationAddress.Address,
        lat: serviceLocationAddress.lat,
        lng: serviceLocationAddress.lng,
      };

      console.log("service location payload is", updatedValues);

      // if (!serviceLocationAddress.Address) {
      //   setEmptyAddress(true);
      //   return;
      // }

      try {
        const response = await axios.post(
          `${baseUrl}/api/Customer/AddServiceLocation`,
          updatedValues,
          { headers }
        );

        setServiceLocationAddress({});

        // Assuming that the response data has an ID that you want to append
        const serviceLocationWithId = {
          ...values, // spread the existing serviceLocations fields
          ServiceLocationId: response.data.Id, // add the new ID from the response
        };
        console.log("New service location to add:", serviceLocationWithId);

        // Find the index of the item to update in slForm
        const indexOfItemToUpdate = slForm.findIndex(
          (item) => item.ServiceLocationId === values.ServiceLocationId
        );

        if (indexOfItemToUpdate !== -1) {
          // Update the item at the found index
          setSlForm((prevObjects) => {
            const updatedSlForm = [...prevObjects];
            updatedSlForm[indexOfItemToUpdate] = serviceLocationWithId;
            console.log("Updated slForm:", updatedSlForm);
            return updatedSlForm;
          });
        } else {
          // Add the new item if it doesn't exist
          setSlForm((prevObjects) => [...prevObjects, serviceLocationWithId]);
        }

        // // Update your form state with the new service location object that includes the response ID
        // setSlForm((prevObjects) => {
        //   const updatedSlForm = [...prevObjects, serviceLocationWithId];
        //   console.log("Updated slForm:", updatedSlForm);
        //   return updatedSlForm;
        // });

        // // Reset serviceLocations state to clear the form or set it for a new entry
        // setServiceLocations({
        //   Name: "",
        //   Address: "",
        //   Phone: "",
        //   AltPhone: "",
        //   isBilltoCustomer: null,
        // });
        getCustomerData();

        const closeButton = document.getElementById("closerLocation");
        if (closeButton) {
          closeButton.click();
        }

        action.resetForm();

        setTimeout(() => {
          setAddSLSuccess(false);
        }, 3000);
        setAddSLSuccess(true);

        console.log("successfully sent service locations", response.data.Id);
      } catch (error) {
        console.log("service locations Post error", error);
      }
    },
  });

  // const addServiceLocation = async (e) => {
  //   e.preventDefault();
  //   // Check if serviceLocations has data to add
  //   if (Object.keys(serviceLocations).length === 0) {
  //     alert("Service Locations data is empty");
  //     return;
  //   }
  //   try {
  //     const response = await axios.post(
  //       `${baseUrl}/api/Customer/AddServiceLocation`,
  //       serviceLocations,
  //       { headers }
  //     );

  //     // Assuming that the response data has an ID that you want to append
  //     const serviceLocationWithId = {
  //       ...serviceLocations, // spread the existing serviceLocations fields
  //       ServiceLocationId: response.data.Id, // add the new ID from the response
  //     };
  //     console.log("New service location to add:", serviceLocationWithId);
  //     // Update your form state with the new service location object that includes the response ID
  //     setSlForm((prevObjects) => {
  //       const updatedSlForm = [...prevObjects, serviceLocationWithId];
  //       console.log("Updated slForm:", updatedSlForm);
  //       return updatedSlForm;
  //     });

  //     // Reset serviceLocations state to clear the form or set it for a new entry
  //     setServiceLocations({
  //       Name: "",
  //       Address: "",
  //       Phone: "",
  //       AltPhone: "",
  //       isBilltoCustomer: null,
  //     });
  //     getCustomerData();
  //     setTimeout(() => {
  //       setAddSLSuccess(false);
  //     }, 3000);
  //     setAddSLSuccess(true);

  //     console.log("successfully sent service locations", response.data.Id);
  //   } catch (error) {
  //     console.log("service locations Post error", error);
  //   }
  // };

  const handleDelete = async (serviceLocationId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/DeleteServiceLocation?id=${serviceLocationId}`,
        { headers }
      );
      const updatedSlForm = slForm.filter(
        (sl) => sl.ServiceLocationId !== serviceLocationId
      );
      setSlForm(updatedSlForm);
      console.log("successfully deleted service location", response);
    } catch (error) {
      console.log("error deleting service location", error);
    }
  };
  const updateSL = (serviceLocationId) => {
    console.log(serviceLocationId);
    const updatedSlForm = slForm.filter(
      (sl) => sl.ServiceLocationId !== serviceLocationId
    );
    setSlForm(updatedSlForm);
    console.log(updatedSlForm);
  };

  // const isFormInvalid = () => {
  //   // Check if any of these fields are empty or in the case of isBilltoCustomer, undefined
  //   return (
  //     !serviceLocations.Name ||
  //     !serviceLocations.Address ||
  //     !serviceLocations.Phone ||
  //     serviceLocations.isBilltoCustomer === undefined
  //   ); // Explicitly check for undefined
  // };

  // tabs

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;

    formikAddService.handleChange(e);
    formikAddService.setFieldValue(name, value);
  };

  useEffect(() => {
    //console.log("Service Locations in useEffect:", serviceLocations);
    formikAddService.setValues({
      Name: serviceLocations.Name,
      Address: serviceLocations.Address,
      Phone: serviceLocations.Phone,
      AltPhone: serviceLocations.AltPhone,
      isBilltoCustomer: serviceLocations.isBilltoCustomer,
      ServiceLocationId: serviceLocations.ServiceLocationId,
    });
  }, [serviceLocations]);

  return (
    <>
      {loading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: "#789a3d" }} />
        </div>
      ) : (
        <div className="">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="card ">
              <div className="">
                <h4 className="modal-title itemtitleBar" id="#gridSystemModal">
                  Customer Info
                </h4>
              </div>
              <div className="card-body">
                {/* {formData.CustomerData.CustomerName && (
                <div className="col-xl-4 mb-3">
                  <div className="form-check custom-checkbox form-check-inline message-customer">
                    <input
                      type="checkbox"
                      name="isPrimary"
                      className="form-check-input"
                      id="customCheckBox"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="customCheckBox"
                    >
                      Send text message to {formData.CustomerData.CustomerName}
                    </label>
                  </div>
                </div>
              )} */}

                <div className="row">
                  <div className="col-9">
                    <div className="row">
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Company Name <span className="text-danger">*</span>
                        </label>
                        {/* <MapCo /> */}
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="CompanyName"
                          variant="outlined"
                          size="small"
                          error={submitClicked && !companyData.CompanyName}
                          value={companyData?.CompanyName || ""}
                          onChange={handleCompanyChange}
                          placeholder="Company Name"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          First Name <span className="text-danger">*</span>
                        </label>
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="FirstName"
                          variant="outlined"
                          size="small"
                          value={companyData.FirstName}
                          error={submitClicked && !companyData.FirstName}
                          onChange={handleCompanyChange}
                          placeholder="First Name"
                        />
                      </div>
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="LastName"
                          variant="outlined"
                          size="small"
                          value={companyData.LastName}
                          onChange={handleCompanyChange}
                          error={submitClicked && !companyData.LastName}
                          placeholder="Last Name"
                        />
                      </div>
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Email <span className="text-danger">*</span>
                        </label>
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="Email"
                          variant="outlined"
                          size="small"
                          value={companyData.Email}
                          error={submitClicked && !companyData.Email}
                          onChange={handleCompanyChange}
                          placeholder="Email"
                        />
                      </div>
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Address
                        </label>
                        {/* <AddressInputs
                          setCustomerAddress={setCustomerAddress}
                        /> */}
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="Address"
                          variant="outlined"
                          size="small"
                          value={companyData.Address}
                          onChange={handleCompanyChange}
                          placeholder="Address"
                        />
                      </div>
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Phone
                        </label>
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="Phone"
                          variant="outlined"
                          size="small"
                          value={companyData.Phone}
                          error={phoneError}
                          onChange={handleCompanyChange}
                          placeholder="Phone"
                        />
                      </div>
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          AltPhone
                        </label>
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="AltPhone"
                          variant="outlined"
                          size="small"
                          value={companyData.AltPhone}
                          onChange={handleCompanyChange}
                          placeholder="Alternate Phone"
                        />
                      </div>
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Customer Fax
                        </label>
                        <TextField
                          type="text"
                          className="form-control form-control-sm"
                          name="Fax"
                          variant="outlined"
                          size="small"
                          value={companyData.Fax}
                          onChange={handleCompanyChange}
                          placeholder="Customer Fax"
                        />
                      </div>
                      <div className="col-xl-4 mb-3">
                        <FormControl fullWidth variant="outlined">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Customer Type
                          </label>
                          <Select 
                            labelId="customer-type-label"
                            id="customer-type-select"
                            variant="outlined"
                            name="CustomerTypeId"
                            value={companyData.CustomerTypeId}
                            onChange={handleCompanyChange}
                            size="small"
                          >
                            {customerType.map((customer, index) => (
                              <MenuItem
                                key={customer.CustomerTypeId}
                                value={customer.CustomerTypeId}
                              >
                                {customer.CustomerType}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>

                      <div className="col-xl-4 mb-3">
                        <label className="form-label">Notes</label>
                        <textarea
                          name="Notes"
                          value={companyData.Notes}
                          onChange={handleCompanyChange}
                          className="form-txtarea form-control form-control-sm"
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="col-xl-12 mb-3 ">
                      <div className="form-check form-check-inline radio-margin">
                        <label
                          className="form-check-label "
                          htmlFor="inlineRadio1"
                        >
                          Allow Login:
                        </label>
                        <div className="form-check form-check-inline radio-margin-div">
                          <input
                            className="form-check-input ml-2 pl-2"
                            type="radio"
                            id="inlineRadio1"
                            name="isLoginAllow"
                            value="Customer"
                            checked={allowLogin === true} // Check the "yes" radio button if allowLogin is true
                            onChange={() => {
                              setAllowLogin(true);
                              setDisableButton(true);
                            }}
                          />
                          <label
                            className="form-check-label allow-customer-login"
                            htmlFor="inlineRadio1"
                          >
                            yes
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="inlineRadio2"
                            name="isLoginAllow"
                            value="BillToServiceLocation"
                            checked={allowLogin === false} // Check the "no" radio button if allowLogin is false
                            onChange={() => {
                              setAllowLogin(false);
                            }}
                          />
                          <label
                            className="form-check-label allow-customer-login"
                            htmlFor="inlineRadio2"
                          >
                            no
                          </label>
                        </div>
                      </div>
                    </div>
                    {allowLogin && (
                      <div className="row">
                        <div className="col-xl-12 mb-3">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Username <span className="text-danger">*</span>
                          </label>
                          <TextField
                            type="text"
                            className="form-control form-control-sm"
                            name="username"
                            variant="outlined"
                            size="small"
                            error={submitClicked && !companyData.username}
                            value={companyData.username}
                            onChange={handleCompanyChange}
                            placeholder="User Name"
                          />
                        </div>
                        <div className="col-xl-12 mb-3">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Password <span className="text-danger">*</span>
                          </label>
                          <TextField
                            type="password"
                            className="form-control form-control-sm"
                            name="Password"
                            variant="outlined"
                            size="small"
                            error={submitClicked && !companyData.Password}
                            onChange={handleCompanyChange}
                            placeholder="Password"
                          />
                        </div>
                        <div className="col-xl-12 mb-3">
                          <label
                            htmlFor="exampleFormControlInput1"
                            className="form-label"
                          >
                            Confirm Password{" "}
                            <span className="text-danger">*</span>
                          </label>
                          <TextField
                            type="password"
                            className="form-control form-control-sm"
                            name="ConfirmPassword"
                            variant="outlined"
                            size="small"
                            error={
                              submitClicked && !companyData.ConfirmPassword
                            }
                            onChange={handleCompanyChange}
                            placeholder="Confirm Password"
                          />
                          {!passwordsMatch && (
                            <div className="text-danger">
                              Passwords do not match.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* <div className="col-md-6">
                  <label className="col-sm-4 col-form-label">
                    Address<span className="text-danger">*</span>
                  </label>
                  <AddressInputs />
                </div> */}
                <div className="row">
                  <div className="col-md-9">
                    {error && (
                      <Alert severity="error">
                        {emailError
                          ? emailError
                          : "An error occured while adding/Updating customer"}
                      </Alert>
                    )}
                    {emptyFieldError && (
                      <Alert severity="error">
                        Please Fill all required fields
                      </Alert>
                    )}
                    {emailValidError && (
                      <Alert severity="error">Please enter valid email</Alert>
                    )}
                    {lastNameError && (
                      <Alert severity="error">
                        Please enter valid Last Name
                      </Alert>
                    )}
                    {firstNameError && (
                      <Alert severity="error">
                        Please enter valid First Name
                      </Alert>
                    )}
                    {companyNameError && (
                      <Alert severity="error">
                        Please enter valid Company name
                      </Alert>
                    )}
                    {phoneError && (
                      <Alert severity="error">
                        Please enter valid Phone Number
                      </Alert>
                    )}
                  </div>
                  <div className="col-md-3 text-end">
                    <button
                      className="btn btn-primary m-1"
                      onClick={handleSubmit}
                      disabled={disableButton}
                    >
                      Submit
                    </button>
                    <NavLink to="/customers">
                      <button
                        className="btn btn-danger light  m-1 "
                        onClick={() => {
                          setShowContent(true);
                        }}
                      >
                        Cancel
                      </button>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* contact modal */}
          {/* AhsanModel */}

          <div className="modal fade" id="basicModal">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <form onSubmit={formik.handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Add Contact</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                    ></button>
                  </div>
                  <div style={{ paddingLeft: "0.5em" }} className="modal-body">
                    <div className="basic-form">
                      <div className="mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          Contact Company<span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="text"
                            name="CompanyName"
                            className="form-control form-control-sm"
                            placeholder="Contact Company"
                            // onChange={handleContactChange}
                            value={formik.values.CompanyName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            //required
                          />
                          {formik.errors.CompanyName &&
                          formik.touched.CompanyName ? (
                            <small style={{ color: "red" }}>
                              {formik.errors.CompanyName}
                            </small>
                          ) : null}
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          FirstName<span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="text"
                            name="FirstName"
                            className="form-control form-control-sm"
                            placeholder="First Name"
                            onChange={formik.handleChange}
                            value={formik.values.FirstName}
                            onBlur={formik.handleBlur}
                            //required
                          />
                          {formik.errors.FirstName &&
                          formik.touched.FirstName ? (
                            <small style={{ color: "red" }}>
                              {formik.errors.FirstName}
                            </small>
                          ) : null}
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          Last Name<span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="text"
                            name="LastName"
                            className="form-control form-control-sm"
                            placeholder="Last Name"
                            onChange={formik.handleChange}
                            value={formik.values.LastName}
                            onBlur={formik.handleBlur}
                            //required
                          />
                          {formik.errors.LastName && formik.touched.LastName ? (
                            <small style={{ color: "red" }}>
                              {formik.errors.LastName}
                            </small>
                          ) : null}
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          Phone<span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="text"
                            id="contactInp3"
                            name="Phone"
                            className="form-control form-control-sm"
                            placeholder="Phone"
                            onChange={formik.handleChange}
                            value={formik.values.Phone}
                            onBlur={formik.handleBlur}
                            //required
                          />
                          {formik.errors.Phone && formik.touched.Phone ? (
                            <small style={{ color: "red" }}>
                              {formik.errors.Phone}
                            </small>
                          ) : null}
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          Alt Phone
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="text"
                            id="contactInp3"
                            name="AltPhone"
                            className="form-control form-control-sm"
                            placeholder=" Alt Phone"
                            onChange={formik.handleChange}
                            value={formik.values.AltPhone}
                            //required
                          />
                        </div>
                      </div>
                      <div className="mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          Email<span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-8">
                          <input
                            type="email"
                            id="contactInp2"
                            className="form-control form-control-sm"
                            name="Email"
                            placeholder="Email"
                            onChange={formik.handleChange}
                            value={formik.values.Email}
                            onBlur={formik.handleBlur}
                            //required
                          />
                          {formik.errors.Email && formik.touched.Email ? (
                            <small style={{ color: "red" }}>
                              {formik.errors.Email}
                            </small>
                          ) : null}
                        </div>
                      </div>
                      <div className=" mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          Address<span className="text-danger">*</span>
                        </label>
                        <div className="col-sm-8">
                          <input
                            name="Address"
                            className="form-control form-control-sm"
                            placeholder="Address"
                            onChange={formik.handleChange}
                            value={formik.values.Address}
                            onBlur={formik.handleBlur}
                            //required
                          />
                          {formik.errors.Address && formik.touched.Address ? (
                            <small style={{ color: "red" }}>
                              {formik.errors.Address}
                            </small>
                          ) : null}
                        </div>
                      </div>
                      <div className=" mb-3 row">
                        <label className="col-sm-4 col-form-label">
                          Comments
                        </label>
                        <div className="col-sm-8">
                          <textarea
                            name="Comments"
                            className="form-txtarea form-control form-control-sm"
                            onChange={formik.handleChange}
                            value={formik.values.Comments}
                            rows="2"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      id="closer"
                      className="btn btn-danger light"
                      data-bs-dismiss="modal"
                      onClick={() => {
                        getCustomerData();
                        setContactData({
                          FirstName: "",
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
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {selectedItem === 0 ? null : (
            <div>
              {/* Contacts Table */}

              {/* servive location form */}
              {/* AhsanModel */}

              <div
                style={{ zIndex: "100" }}
                className="modal fade "
                id="basicModal2"
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <form onSubmit={formikAddService.handleSubmit}>
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
                              <input
                                type="text"
                                name="Name"
                                onChange={formikAddService.handleChange}
                                className="form-control form-control-sm"
                                placeholder="Name"
                                value={formikAddService.values.Name}
                                onBlur={formikAddService.handleBlur}
                                //required
                              />
                              {formikAddService.errors.Name &&
                              formikAddService.touched.Name ? (
                                <small style={{ color: "red" }}>
                                  {formikAddService.errors.Name}
                                </small>
                              ) : null}
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">
                              Bill To<span className="text-danger">*</span>
                            </label>
                            <div className="col-sm-9">
                              <div className="row">
                                <div className="col-5">
                                  <input
                                    className="form-check-input radio-margin-top"
                                    type="radio"
                                    name="isBilltoCustomer"
                                    id="inlineRadio11"
                                    onChange={handleRadioChange}
                                    onBlur={formikAddService.handleBlur}
                                    value={true}
                                    // checked={
                                    //   serviceLocations.isBilltoCustomer === true
                                    // }
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
                                    onChange={handleRadioChange}
                                    onBlur={formikAddService.handleBlur}
                                    value={false}
                                    // checked={
                                    //   serviceLocations.isBilltoCustomer ===
                                    //   false
                                    // }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="inlineRadio22"
                                  >
                                    This service Location
                                  </label>
                                </div>
                              </div>
                              {formikAddService.errors.isBilltoCustomer &&
                              formikAddService.touched.isBilltoCustomer ? (
                                <small style={{ color: "red" }}>
                                  {formikAddService.errors.isBilltoCustomer}
                                </small>
                              ) : null}
                            </div>
                          </div>

                          <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">
                              Address<span className="text-danger">*</span>
                            </label>
                            <div className="col-sm-9">
                              <MapCo />
                              {/* {emptyAddress && (
                                <small style={{ color: "red" }}>
                                  Address is required
                                </small>
                              )} */}

                              {/* <input
                                type="text"
                                onChange={formikAddService.handleChange}
                                name="Address"
                                value={formikAddService.values.Address}
                                className="form-control form-control-sm"
                                placeholder="Address"
                                onBlur={formikAddService.handleBlur}
                              />*/}
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">
                              Phone<span className="text-danger">*</span>
                            </label>
                            <div className="col-sm-9">
                              <input
                                type="text"
                                onChange={formikAddService.handleChange}
                                value={formikAddService.values.Phone}
                                name="Phone"
                                className="form-control form-control-sm"
                                placeholder="Phone"
                                onBlur={formikAddService.handleBlur}
                              />
                              {formikAddService.errors.Phone &&
                              formikAddService.touched.Phone ? (
                                <small style={{ color: "red" }}>
                                  {formikAddService.errors.Phone}
                                </small>
                              ) : null}
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label className="col-sm-3 col-form-label">
                              Alt Phone
                            </label>
                            <div className="col-sm-9">
                              <input
                                type="text"
                                name="AltPhone"
                                onChange={formikAddService.handleChange}
                                value={formikAddService.values.AltPhone}
                                className="form-control form-control-sm"
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
                            setServiceLocationAddress({});
                            setServiceLocations({
                              Name: "",
                              Address: "",
                              Phone: "",
                              AltPhone: "",
                              isBilltoCustomer: null,
                            });
                          }}
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          //data-bs-dismiss="modal"
                          // onClick={addServiceLocation}
                          // disabled={isFormInvalid()}
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              {/* service location table */}
              <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                  >
                    <Tab label="Contacts" {...a11yProps(0)} />
                    <Tab label="Service Locations" {...a11yProps(1)} />
                    {/* <Tab label="Item Three" {...a11yProps(2)} /> */}
                  </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div className="card">
                      <div className="">
                        <h4
                          className="modal-title itemtitleBar"
                          id="#gridSystemModal1"
                        >
                          Contacts
                        </h4>
                      </div>
                      <div className="card-body">
                        {contactAddSuccess && (
                          <Alert severity="success">
                            Contact Added/Updated Successfuly
                          </Alert>
                        )}
                        {contactDelSuccess && (
                          <Alert severity="success">
                            Contact Deleted Successfuly
                          </Alert>
                        )}

                        <button
                          className="btn btn-primary btn-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#basicModal"
                          style={{ margin: "0px 20px 12px" }}
                          onClick={handleAddContactsClick}
                        >
                          + Add Contacts
                        </button>

                        <div className="col-xl-12">
                          <div className="card">
                            <div className="card-body p-0">
                              <div className="estDataBox">
                                <div className="table-responsive active-projects style-1">
                                  <table
                                    id="empoloyees-tblwrapper"
                                    className="table"
                                  >
                                    <thead>
                                      <tr>
                                        <th>#</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th style={{ maxWidth: "20px" }}>
                                          Address
                                        </th>

                                        <th className="actions-head ">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {contactDataList.map((contact, index) => (
                                        <tr key={index}>
                                          <td>{contact.ContactId}</td>
                                          <td>{contact.FirstName}</td>
                                          <td>{contact.LastName}</td>
                                          <td>{contact.Email}</td>
                                          <td>{contact.Phone}</td>
                                          <td>{contact.Address}</td>
                                          <td
                                            className="contact-actions"
                                            style={{ cursor: "pointer" }}
                                          >
                                            <Create
                                              className="custom-create-icon"
                                              data-bs-toggle="modal"
                                              data-bs-target="#basicModal"
                                              onClick={() => {
                                                setContactData(contact);
                                                updateContact(
                                                  contact.ContactId
                                                );
                                              }}
                                            ></Create>
                                            <Button
                                              color="error"
                                              className="delete-button"
                                              data-bs-toggle="modal"
                                              data-bs-target={`#contactDeleteModal${contact.ContactId}`}
                                            >
                                              <Delete />
                                            </Button>

                                            {/* <Delete
                                          color="error" 

                                           onClick={() =>
                                           deleteContact(contact.ContactId)
                                           }
                                        ></Delete>*/}
                                          </td>
                                          <div
                                            className="modal fade"
                                            id={`contactDeleteModal${contact.ContactId}`}
                                            tabIndex="-1"
                                            aria-labelledby="deleteModalLabel"
                                            aria-hidden="true"
                                          >
                                            <div
                                              className="modal-dialog"
                                              role="document"
                                            >
                                              <div className="modal-content">
                                                <div className="modal-header">
                                                  <h5 className="modal-title">
                                                    Are you sure you want to
                                                    delete {contact.FirstName}?
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
                                                      onClick={() =>
                                                        deleteContact(
                                                          contact.ContactId
                                                        )
                                                      }
                                                    >
                                                      Yes
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </CustomTabPanel>
                {/* AhsanModel */}
                <CustomTabPanel value={value} index={1}>
                  <form>
                    <div className="card">
                      <div className="">
                        <h4
                          className="modal-title itemtitleBar"
                          id="#gridSystemModal"
                        >
                          Service Locations
                        </h4>
                      </div>
                      <div className="card-body">
                        {addSLSuccess && (
                          <Alert severity="success">
                            Service Location Added/Updated Successfuly
                          </Alert>
                        )}

                        <button
                          className="btn btn-primary btn-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#basicModal2"
                          style={{ margin: "0px 20px 12px" }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddLocationClick();
                          }}
                        >
                          + Add Service Locations
                        </button>

                        <div className="col-xl-12">
                          <div className="card">
                            <div className="card-body p-0">
                              <div className="estDataBox">
                                <div className="table-responsive active-projects style-1">
                                  <table
                                    id="empoloyees-tblwrapper"
                                    className="table"
                                  >
                                    <thead>
                                      <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Address</th>
                                        <th>Phone</th>
                                        <th>Alt Phone</th>
                                        <th>Bill to Customer</th>
                                        <th className="actions-head">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {slForm.map((slData, index) => (
                                        <tr key={slData.ServiceLocationId}>
                                          <td>{slData.ServiceLocationId}</td>
                                          <td>{slData.Name}</td>
                                          <td>{slData.Address}</td>
                                          <td>{slData.Phone}</td>
                                          <td>{slData.AltPhone}</td>
                                          <td>
                                            {slData.isBilltoCustomer
                                              ? "Customer"
                                              : "Service Location"}
                                          </td>

                                          <td
                                            className="contact-actions"
                                            style={{ cursor: "pointer" }}
                                          >
                                            <Create
                                              className="custom-create-icon"
                                              data-bs-toggle="modal"
                                              data-bs-target="#basicModal2"
                                              onClick={() => {
                                                console.log("sl data", slData);
                                                setServiceLocationAddress(
                                                  (prevData) => ({
                                                    ...prevData,
                                                    Address: slData.Address,
                                                    lat: slData.lat,
                                                    lng: slData.lng,
                                                  })
                                                );
                                                setServiceLocations(slData);
                                                updateSL(
                                                  slData.ServiceLocationId
                                                );
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
                                          </td>
                                          <div
                                            className="modal fade"
                                            id={`sLDeleteModal${slData.ServiceLocationId}`}
                                            tabIndex="-1"
                                            aria-labelledby="deleteModalLabel"
                                            aria-hidden="true"
                                          >
                                            <div
                                              className="modal-dialog"
                                              role="document"
                                            >
                                              <div className="modal-content">
                                                <div className="modal-header">
                                                  <h5 className="modal-title">
                                                    Are you sure you want to
                                                    delete {slData.Name}?
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
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </CustomTabPanel>
                {/* <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel> */}
              </Box>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default UpdateCustomer;
