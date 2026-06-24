import React, { useEffect, useState, useRef, useContext } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button, Tooltip } from "@mui/material";
import TextField from "@mui/material/TextField";
import IconButton from '@mui/material/IconButton';
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import validator from "validator";
import CircularProgress from "@mui/material/CircularProgress";
import AddressInputs from "../Modals/AddressInputs";
import Cookies from "js-cookie";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import Contacts from "./Contacts";
import ServiceLocations from "./ServiceLocations";
import { DataContext } from "../../context/AppData";
import useQuickBook from "../Hooks/useQuickBook";
import CustomerFiles from "./CustomerFiles";
import BackButton from "../Reusable/BackButton";
import CustomerBills from "./CustomerBills";
import CustomerPo from "./CustomerPo";
import CustomerEstimates from "./CustomerEstimates";
import CustomerSR from "./CustomerSR";
import CustomerInvoice from "./CustomerInvoice";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import { SaveOutline } from "react-ionicons";
import PaymentsScreen from "./PaymentsScreen";
import PaymentsList from "./PaymentsList";
import debounce from "lodash.debounce";
import Authorization from "../Reusable/Authorization";
import CustomerAutoCompleteList from "../Reusable/CustomerAutoCompleteList";
import { Edit } from "@mui/icons-material";
import { EditButton } from "../Reusable/EditButton";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import JobForm from "../jobForm/JobForm";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import useMenuAccess from "../Hooks/useMenuAccess";
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

const AddCustomer = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [formData, setFormData] = useState({});

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = searchParams.get("id") || 0;
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const { loggedInUser, scrollBottom, dashBoardRefresh } =
    useContext(DataContext);

  const [allowLogin, setAllowLogin] = useState(false);
  const [openJobPopup, setOpenJobPopup] = useState(false);

  // company data
  const [companyData, setCompanyData] = useState({
    CustomerTypeId: 1,
    isRecurringBilling: null,
    ConfirmPassword: "",
  });
  const [customerType, setCustomerType] = useState([]);
  const [disableButton, setDisableButton] = useState(false);
  const [loading, setLoading] = useState(true);

  // updated contacts
  const [contactDataList, setContactDataList] = useState([]);
  const [sLAddress, setSLAddress] = useState({});
  // service Locations
  const [slForm, setSlForm] = useState([]);

  const [defaultContact, setDefaultContact] = useState("");
  const [mailData, setMailData] = useState({
    ContactMail: "",
    Customer: "",
  });

  const [tblData, setTblData] = useState({});
  const { syncQB } = useQuickBook();
  // tabs
  const [value, setValue] = useState(Number(searchParams.get("tab")) || 0);
  const [prevFiles, setPrevFiles] = useState([]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Get menu access permissions
  const menuAccess = useMenuAccess();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleMouseDownPassword = (event) => event.preventDefault();
  const handleMouseUpPassword = (event) => event.preventDefault();


  const getCustomerData = async () => {
    if (idParam === 0) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/GetCustomer?id=${idParam}`,
        {
          headers,
        }
      );
      setLoading(false);

      


      let billAddress = response.data.AddressesData;
      //   response.data.AddressesData.forEach((element) => {
      //     if (element.Type === "BillAddr") {
      //         billAddress = element;
      //         console.log("billAddress", element);
      //         return; // Exit the loop once we find a BillAddr
      //     }
      // });

      // If billAddress is still null, find the first ShipAddr
      // if (!billAddress) {
      //     billAddress = response.data.AddressesData.find(element => element.Type === "ShipAddr") || null;
      //     console.log("billAddress (default to ShipAddr)", billAddress);
      // }

      setCompanyData({
        ...response.data.Data,
        tblUserAddresses: billAddress,
        ConfirmPassword: response?.data?.Data?.Password || ""
      });
      setPrevFiles(response.data.FileData);
      setContactDataList(response.data.ContactData);
      setSlForm(response.data.ServiceLocationData);

      response.data.ContactData.forEach((element) => {
        if (element.isDefault) {
          setDefaultContact(element.Email);
          setMailData({
            ContactMail: element.Email,
            Customer: response.data.Data.CompanyName,
          });
        }
      });
      setTblData({
        ...tblData,
        SRData: response.data.ServiceRequestData,
        EstimateData: response.data.EstimateData,
        PoData: response.data.PurchaseOrderData,
        InvoiceData: response.data.InvoiceData,
        BillData: response.data.BillData,
      });

      console.log(response.data.ServiceLocationData);

      if (scrollBottom) {
        setTimeout(() => {
          window.scrollTo(0, 4000);
        }, 200);
      }
    } catch (error) {
      setLoading(false);
      console.error("There was an error updating the customer:", error);
    }
  };
  const [paymentList, setPaymentList] = useState({ Data: [] });
  const getPaymentData = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    StatusId = 0,
    isAscending = false,
    isIssueDate = false,
    profit = false,
    startDate = null,
    endDate = null,
    customerId = 0
  ) => {
    if (idParam === 0) {
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Payment/GetPaymentServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&StatusId=${StatusId}&isAscending=${isAscending}&isIssueDate=${isIssueDate}&isProfit=${profit}&StartDate=${startDate}&EndDate=${endDate}&CustomerId=${idParam}`,
        {
          headers,
        }
      );
      setPaymentList(response.data);
      console.log("getPaymentData:", response.data);
    } catch (error) {
      console.error("There was an error updating the customer:", error);
    }
  };
  useEffect(() => {
    getCustomerType();
    getPaymentData();
    if (dashBoardRefresh) {
      console.log("dashBoardRefresh");
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    getCustomerData();
  }, [idParam]);

  useEffect(() => {
    setSearchParams({
      id: idParam,
    });
  }, [idParam, value]);

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

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSubmit = async () => {
    // Check permissions before submitting
    if (idParam == 0) {
      // Creating new customer - need create access
      if (!menuAccess.canCreate || menuAccess.isLoading) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create customers");
        return;
      }
    } else {
      // Updating existing customer - need edit access
      if (!menuAccess.canEdit || menuAccess.isLoading) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update customers");
        return;
      }
    }

    setCompanyData((prevData) => ({
      ...prevData,
      CompanyId: Number(loggedInUser.CompanyId),
    }));
    const updatedData = {
      ...companyData,
      CompanyId: Number(loggedInUser.CompanyId),
      tblUserAddresses: companyData.tblUserAddresses,
    };
    console.log("check1 ", companyData);
    console.log("check1 company id ", Number(loggedInUser.CompanyId));

    setSubmitClicked(true);
    if (
      !companyData.CompanyName ||
      !companyData.DisplayName ||
      !companyData.Email ||
      !companyData.Address
    ) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      console.log("check2 ");

      return; // Return early if any required field is empty
    }

    // if (!validator.isLength(companyData.CompanyName, { min: 3, max: 100 })) {
    //   setOpenSnackBar(true);
    //   setSnackBarColor("error");
    //   setSnackBarText("Company name should be 3 to 30 characters");
    //   console.log("Company name should be between 3 and 30 characters");
    //   return;
    // }

    // Validate first name length
    if (!validator.isLength(companyData.DisplayName, { min: 3, max: 100 })) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Display Name should be between 3 and 30 characters");
      console.log("First name should be 3 to 30 characters");
      return;
    }
    if (!validator.isLength(companyData.CompanyName, { min: 3, max: 100 })) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Company Name should be between 3 and 30 characters");
      console.log("First name should be 3 to 30 characters");
      return;
    }

    // if (!validator.isLength(companyData.ContactName, { min: 3, max: 100 })) {
    //   setOpenSnackBar(true);
    //   setSnackBarColor("error");
    //   setSnackBarText("Contact Name should be between 3 and 30 characters");
    //   console.log("Last name should be between 3 and 30 characters");
    //   return;
    // }

    // if (!validator.isEmail(companyData.Email)) {
    //   setOpenSnackBar(true);
    //   setSnackBarColor("error");
    //   setSnackBarText("Email must contain the @ symbol");
    //   console.log("Email must contain the @ symbol");
    //   return;
    // }
    // if (
    //   companyData.Phone &&
    //   !validator.isMobilePhone(companyData.Phone, "any", { max: 20 })
    // ) {
    //   setOpenSnackBar(true);
    //   setSnackBarColor("error");
    //   setSnackBarText("Phone number is not valid");

    //   return;
    // }
    if (companyData.Password) {
      if (companyData.Password !== companyData.ConfirmPassword) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("Password and confirm Password does not match");
        console.log("check2 ");

        return; // Return early if any required field is empty
      }
    }
    setDisableButton(true);
    // return
    try {
      const response = await axios.post(
        `${baseUrl}/api/Customer/AddCustomer`,
        updatedData,
        {
          headers,
        }
      );

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      syncQB(response.data.SyncId);
      setDisableButton(false);
      console.log("sussess add customer response", response.data);
      navigate(`/customers/add-customer?id=${response.data.Id}`);
      // window.location.reload();
    } catch (error) {
      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);

      console.error("Error submitting data:", error.response.data);
      // console.log("customer payload is", companyData);
    }
  };
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;

    setCompanyData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
        CompanyId: Number(loggedInUser.CompanyId),
      };

      console.log("company data is", updatedFormData);

      return updatedFormData;
    });
  };

  const handleOpenPopup = (jobId = null) => {
    setSelectedJobId(jobId);
    setOpenJobPopup(true);
  };

  const handleClosePopup = () => {
    setOpenJobPopup(false);
  };

  return (
    <>
      {loading ? (
        <div className="center-loader">
          <CircularProgress />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row">
            <Authorization allowTo={[1, 4, 5, 6]} hide>
              <div
                style={{ height: "83vh", overflowY: "scroll" }}
                className="col-md-3"
              >
                <div className="card">
                  <CustomerAutoCompleteList
                    formData={formData}
                    setFormData={setFormData}
                    onChange={(customer) => {
                      setSearchParams({
                        statusId: Number(searchParams.get("statusId")),
                        tab: value,
                        id: customer.UserId,
                      });
                    }}
                  />
                </div>
              </div>
            </Authorization>

            <div
              style={{ height: "83vh", overflowY: "scroll" }}
              className={loggedInUser.userRole == 2 ? "" : "col-md-9"}
            >
              <div style={{ height: "fit-content" }} className="card ">
                {idParam != 0 && !menuAccess.isLoading && !menuAccess.canEdit && (
                  <div className="alert alert-warning m-3" role="alert">
                    <strong>Read-only mode:</strong> You don't have permission to update this customer. You can view the information but cannot make changes.
                  </div>
                )}
                {idParam == 0 && !menuAccess.isLoading && !menuAccess.canCreate && (
                  <div className="alert alert-warning m-3" role="alert">
                    <strong>No create access:</strong> You don't have permission to create new customers.
                  </div>
                )}
                <div className="itemtitleBar d-flex justify-content-between">
                  <h4 className="modal-title w-50" id="#gridSystemModal">
                    Customer Info
                  </h4>
                  <Authorization allowTo={[1]} hide>
                    <FormGroup key={companyData.UserId}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={companyData.isLoginAllow}
                            onChange={(e) => {
                              setCompanyData({
                                ...companyData,
                                isLoginAllow: e.target.checked,
                              });
                            }}
                          />
                        }
                        label="Allow Login"
                      />
                    </FormGroup>
                  </Authorization>
                </div>
                <Authorization allowTo={[1, 4]}>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="row"></div>
                        <div className="row">
                          <div className="col-xl-4 mb-3">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label"
                            >
                              Customer Name{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <TextField
                              type="text"
                              className="form-control"
                              name="CompanyName"
                              variant="outlined"
                              size="small"
                              value={companyData.CompanyName || ""}
                              error={submitClicked && !companyData.CompanyName}
                              onChange={handleCompanyChange}
                              placeholder="Customer Name"
                              disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                            />
                          </div>
                          <Authorization allowTo={[1, 4, 5, 6]} hide>
                            <div className="col-xl-4 mb-3">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label"
                              >
                                First Name
                              </label>
                              <TextField
                                type="text"
                                className="form-control"
                                name="FirstName"
                                variant="outlined"
                                size="small"
                                disabled
                                value={companyData.FirstName || ""}
                                // error={submitClicked && !companyData.FirstName}
                                // onChange={handleCompanyChange}
                                placeholder="First Name"
                              />
                            </div>
                            <div className="col-xl-4 mb-3">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label"
                              >
                                Last Name
                              </label>
                              <TextField
                                type="text"
                                className="form-control"
                                name="LastName"
                                variant="outlined"
                                size="small"
                                disabled
                                value={companyData.LastName || ""}
                                // error={submitClicked && !companyData.LastName}
                                // onChange={handleCompanyChange}
                                placeholder="Last Name"
                              />
                            </div>
                          </Authorization>
                          <div className="col-xl-4 mb-3">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label"
                            >
                              User Name
                            </label>
                            <TextField
                              type="text"
                              className="form-control"
                              variant="outlined"
                              size="small"
                              name="username"
                              disabled
                              value={companyData.username || ""}
                              // error={submitClicked && !companyData.LastName}
                              // onChange={handleCompanyChange}
                              placeholder="User Name"
                            />
                          </div>
                          {/* <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Contact Name <span className="text-danger">*</span>
                        </label>
                        <TextField
                          type="text"
                          className="form-control"
                          name="ContactName"
                          variant="outlined"
                          size="small"
                          value={companyData.ContactName || ""}
                          onChange={handleCompanyChange}
                          error={submitClicked && !companyData.ContactName}
                          placeholder="Contact Name"
                        />
                      </div> 
                      <div className="col-xl-4 mb-3">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label"
                        >
                          Contact Company <span className="text-danger">*</span>
                        </label>

                        <TextField
                          type="text"
                          className="form-control"
                          name="CompanyName"
                          variant="outlined"
                          size="small"
                          error={submitClicked && !companyData.CompanyName}
                          value={companyData?.CompanyName || ""}
                          onChange={handleCompanyChange}
                          placeholder="Contact Company"
                        />
                      </div>*/}

                          <div className="col-xl-4 mb-3">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label"
                            >
                              Email <span className="text-danger">*</span>
                            </label>
                            <TextField
                              type="text"
                              className="form-control"
                              name="Email"
                              variant="outlined"
                              size="small"
                              value={companyData.Email || ""}
                              error={submitClicked && !companyData.Email}
                              onChange={handleCompanyChange}
                              placeholder="Email"
                              disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                            />
                          </div>
                          <Authorization allowTo={[1, 4, 5, 6]} hide>
                            <div className="col-xl-4 mb-3">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label"
                              >
                                Internal Customer Name{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <TextField
                                type="text"
                                className="form-control"
                                name="DisplayName"
                                variant="outlined"
                                size="small"
                                value={companyData.DisplayName || ""}
                                error={
                                  submitClicked && !companyData.DisplayName
                                }
                                onChange={handleCompanyChange}
                                placeholder="Customer Display Name"
                                disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                              />
                            </div>
                            <div className="col-xl-4 mb-3">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label"
                              >
                                Password
                              </label>
                              {/* <TextField
                                // type="password"
                                className="form-control"
                                name="Password"
                                variant="outlined"
                                size="small"
                                value={companyData.Password || ""}
                                onChange={handleCompanyChange}
                                placeholder="Password"
                                type={showPassword ? 'text' : 'password'}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label={
                                        showPassword ? 'hide the password' : 'display the password'
                                      }
                                      onClick={handleClickShowPassword}
                                      onMouseDown={handleMouseDownPassword}
                                      onMouseUp={handleMouseUpPassword}
                                      edge="end"
                                    >
                                      {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                }
                              /> */}
                              <TextField
                                className="form-control"
                                name="Password"
                                variant="outlined"
                                size="small"
                                value={companyData.Password || ""}
                                onChange={handleCompanyChange}
                                placeholder="Password"
                                type={showPassword ? "text" : "password"}
                                disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                        disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                              />


                            </div>
                            <div className="col-xl-4 mb-3">
                              <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label"
                              >
                                Confirm Password
                              </label>

                              <TextField
                                className="form-control"
                                name="ConfirmPassword"
                                variant="outlined"
                                size="small"
                                value={companyData.ConfirmPassword || ""}
                                onChange={handleCompanyChange}
                                placeholder="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        onClick={handleClickShowConfirmPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        onMouseUp={handleMouseUpPassword}
                                        edge="end"
                                        disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                                      >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                              />

                            </div>

                            <div
                              className="col-xl-4 mb-3 d-flex align-items-center"
                              style={{ cursor: (idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)) ? "not-allowed" : "pointer" }}
                            >
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={companyData.isRecurringBilling} // bind to state
                                onChange={(e) =>
                                  setCompanyData({
                                    ...companyData,
                                    isRecurringBilling: e.target.checked,
                                  })
                                }
                                disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                              />
                              <h5
                                className="fw-normal"
                                style={{ marginLeft: "9px", marginTop: "7px" }}
                              >
                                Recurring Billing
                              </h5>
                            </div>
                          </Authorization>
                          <div className="col-xl-6 mb-3">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label"
                            >
                              Property Management Address
                              <span className="text-danger">*</span>
                            </label>
                            <AddressInputs
                              address={companyData.Address}
                              name="Address"
                              handleChange={handleCompanyChange}
                              setCompanyData={setCompanyData}
                              emptyError={submitClicked && !companyData.Address}
                              disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                            />
                          </div>
                          <Authorization allowTo={[1, 4, 5, 6]} hide>
                            <div className="col-xl-4 mb-3">
                              <label className="form-label">Notes</label>
                              <TextArea
                                name="Notes"
                                value={companyData.Notes || ""}
                                onChange={handleCompanyChange}
                                className=" form-control "
                                rows="2"
                                disabled={idParam != 0 && (!menuAccess.canEdit || menuAccess.isLoading)}
                              ></TextArea>
                            </div>
                          </Authorization>
                        </div>
                      </div>
                    </div>
                    <EventPopups
                      open={openSnackBar}
                      setOpen={setOpenSnackBar}
                      color={snackBarColor}
                      text={snackBarText}
                    />
                    <div className="row">
                      <div className="col-md-1">
                        <BackButton
                          onClick={() => {
                            // navigate(`/customers`);
                            window.history.back();
                          }}
                        >
                          Back
                        </BackButton>
                      </div>
                      <div className="col-md-8">
                        <Tooltip title="Job Form" arrow>
                          <EditButton
                            onClick={handleOpenPopup}
                            title="Job Form"
                          >
                            job
                          </EditButton>
                        </Tooltip>
                      </div>

                      <div className="col-md-3 text-end">
                        {/* <NavLink to="/customers">
                      <button className="btn btn-danger light  m-1 ">
                        Cancel
                      </button>
                    </NavLink> */}
                        {((idParam == 0 && menuAccess.canCreate) || (idParam != 0 && menuAccess.canEdit)) && !menuAccess.isLoading ? (
                          <LoaderButton
                            loading={disableButton}
                            handleSubmit={handleSubmit}
                          >
                            Save
                          </LoaderButton>
                        ) : (
                          <Tooltip 
                            title={idParam == 0 ? "You don't have permission to create customers" : "You don't have permission to update customers"} 
                            arrow
                          >
                            <span>
                              <LoaderButton
                                loading={false}
                                handleSubmit={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                disable={true}
                              >
                                Save
                              </LoaderButton>
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </Authorization>
              </div>
              {idParam == 0 ? (
                <></>
              ) : (
                <>
                  <Box sx={{ width: "100%" }}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <Authorization allowTo={[1, 4, 5, 6]} hide>
                        <Tabs
                          value={value}
                          variant="scrollable"
                          onChange={handleChange}
                          aria-label="basic tabs example"
                        >
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Contacts"
                            {...a11yProps(0)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Service Locations"
                            {...a11yProps(1)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Files"
                            {...a11yProps(2)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Service Requests"
                            {...a11yProps(3)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Estimates"
                            {...a11yProps(4)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Invoices"
                            {...a11yProps(5)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Purchace Orders"
                            {...a11yProps(6)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Bills"
                            {...a11yProps(7)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Payments"
                            {...a11yProps(8)}
                          />
                        </Tabs>
                      </Authorization>
                      <Authorization allowTo={[2]} hide>
                        <Tabs
                          variant="scrollable"
                          sx={{ p: 0, textTransform: "lowercase" }}
                          value={value}
                          onChange={handleChange}
                          aria-label="basic tabs example"
                        >
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Contacts"
                            {...a11yProps(0)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Service Locations"
                            {...a11yProps(1)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Files"
                            {...a11yProps(2)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Service Requests"
                            {...a11yProps(3)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Estimates"
                            {...a11yProps(4)}
                          />
                          <Tab
                            sx={{ p: 0, textTransform: "capitalize" }}
                            label="Invoices"
                            {...a11yProps(5)}
                          />
                        </Tabs>
                      </Authorization>
                    </Box>
                    <CustomTabPanel value={value} index={0}>
                      <Contacts
                        contactDataList={contactDataList}
                        setContactDataList={setContactDataList}
                        getCustomerData={getCustomerData}
                        CustomerId={idParam}
                      />
                    </CustomTabPanel>

                    <CustomTabPanel value={value} index={1}>
                      <ServiceLocations
                        getCustomerData={getCustomerData}
                        sLAddress={sLAddress}
                        setSLAddress={setSLAddress}
                        slForm={slForm}
                        setSlForm={setSlForm}
                        CustomerId={idParam}
                      />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={2}>
                      <CustomerFiles
                        getCustomerData={getCustomerData}
                        prevFiles={prevFiles}
                        CustomerId={idParam}
                      />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={3}>
                      <CustomerSR
                        data={tblData.SRData}
                        customer={{
                          CustomerDisplayName: companyData.DisplayName,
                          CustomerId: idParam,
                        }}
                      />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={4}>
                      <CustomerEstimates
                        data={tblData.EstimateData}
                        customer={{
                          CustomerDisplayName: companyData.DisplayName,
                          CustomerId: idParam,
                        }}
                      />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={5}>
                      <CustomerInvoice
                        data={tblData.InvoiceData}
                        customerId={idParam}
                        mailData={mailData}
                      />
                    </CustomTabPanel>
                    <Authorization allowTo={[1, 4, 5, 6]} hide>
                      <CustomTabPanel value={value} index={6}>
                        <CustomerPo data={tblData.PoData} />
                      </CustomTabPanel>
                      <CustomTabPanel value={value} index={7}>
                        <CustomerBills data={tblData.BillData} />
                      </CustomTabPanel>
                      <CustomTabPanel value={value} index={8}>
                        <PaymentsList
                          customerId={idParam}
                          getPaymentData={getPaymentData}
                          paymentList={paymentList}
                          customerName={companyData.DisplayName}
                        />
                      </CustomTabPanel>
                    </Authorization>
                  </Box>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <Dialog
        open={openJobPopup}
        onClose={handleClosePopup}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: { width: "65%", maxWidth: "65%", padding: "0", margin: "0" },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            "&.MuiDialogContent-root": {
              overflowX: "hidden",
              margin: 0,
            },
          }}
        >
          <JobForm
            handleClosePopup={handleClosePopup}
            selectedCustomer={{
              CustomerId: idParam,
              CustomerName: companyData.CompanyName,
            }}
            jobId={selectedJobId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCustomer;
