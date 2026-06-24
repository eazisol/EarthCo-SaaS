import { TextField, Autocomplete } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import CircularProgress from "@mui/material/CircularProgress";
import { DataContext } from "../../context/AppData";
import useQuickBook from "../Hooks/useQuickBook";
import BackButton from "../Reusable/BackButton";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import CustomAutocomplete from "../Reusable/CustomAutocomplete";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";
import Alert from "@mui/material/Alert";

const AddItem = ({}) => {
  const { loggedInUser } = useContext(DataContext);
  const [formData, setFormData] = useState({});
  const [incomeAccountList, setIncomeAccountList] = useState([]);

  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  
  // Access control
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  
  // Determine if this is edit mode (has idParam)
  const isEditMode = !!(idParam && idParam !== 0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const [loading, setLoading] = useState(true);
  const { syncQB } = useQuickBook();

  const getItem = async () => {
    if (!idParam) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${baseUrl}/api/Item/GetItem?id=${idParam}`, {
        headers,
      });
      console.log("selectedItem iss", res.data);
      setFormData(res.data);
      setLoading(false);
    } catch (error) {
      console.log("API call error", error);
      setLoading(false);
    }
  };

  const getIncomeAccount = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/Item/GetAccountList`, {
        headers,
      });
      console.log("selectedItem iss", res.data);
      setIncomeAccountList(res.data);
    } catch (error) {
      console.log("API call error", error);
    }
  };
  const [staffData, setStaffData] = useState([]);
  const [selectedWager, setSelectedWager] = useState(0);

  const fetchStaffList = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
        headers,
      });
      setStaffData(
        response.data.filter(
          (staff) => staff.Role === "Irrigator" || staff.Role === "Spray Tech"
        )
      );

      console.log("staff list iss", response.data);
    } catch (error) {
      console.log("error getting staff list", error);
    }
  };

  const handleAutocompleteChange = (
    fieldName,
    valueProperty,
    event,
    newValue
  ) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    const simulatedEvent = {
      target: {
        name: fieldName,
        value: newValue ? newValue[valueProperty] : "",
        type: "number",
      },
    };

    handleChange(simulatedEvent);
  };

  const handleChange = (e) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    setemptyFieldError(false);
    setDisableButton(false);
    const { name, value, type, checked } = e.target;

    // Parse values as numbers if the input type is "number"
    const parsedValue = type === "number" ? parseFloat(value) : value;

    // Update formData based on input type
    if (name === "ItemName" && formData.isStaff) {
      console.log("matching");
      staffData.forEach((staff) => {
        if (value.includes(":")) {
          let staffName = value.split(":");

          if (
            staff.FirstName.toLowerCase().includes(
              staffName[staffName.length - 1]?.toLowerCase()
            )
          ) {
            setFormData({
              ...formData,
              UserId: staff.UserId,
            });
          }
        } else if (
          staff.FirstName.toLowerCase().includes(value.toLowerCase())
        ) {
          setFormData({
            ...formData,
            UserId: staff.UserId,
          });
        }
      });
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : parsedValue,
      CompanyId: Number(loggedInUser.CompanyId),
    }));
    console.log(formData);
  };

  const [submitClicked, setSubmitClicked] = useState(false);
  const [emptyFieldError, setemptyFieldError] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const submitData = async () => {
    // Check permissions before submitting
    if (isEditMode) {
      // Updating existing item - need edit access
      if (!menuAccess.isLoading && !menuAccess.canEdit) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update items");
        return;
      }
    } else {
      // Creating new item - need create access
      if (!menuAccess.isLoading && !menuAccess.canCreate) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create items");
        return;
      }
    }
    
    setSubmitClicked(true);
    if (
      !formData.ActualName ||
      !formData.IncomeAccount ||
      !formData.ExpenseAccount ||
      !formData.Type
    ) {
      setemptyFieldError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");

      return;
    }
    setDisableButton(true);

    try {
      const res = await axios.post(`${baseUrl}/api/Item/AddItem`, formData, {
        headers,
      });
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(res.data.Message);
      setDisableButton(false);
      syncQB(res.data.SyncId);

      setTimeout(() => {
        navigate(`/items`);
      }, 4000);
      console.log("successfuly posted item", res.data.Message);
    } catch (error) {
      setDisableButton(false);
      console.log("api call error", error.response.data.Message);
      console.log("api call error2", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }
  };

  useEffect(() => {
    getItem();
    getIncomeAccount();
    fetchStaffList();
  }, []);

  return (
    <>
      {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>Read-only mode:</strong> You don't have permission to update this item. You can view the information but cannot make changes.
        </div>
      )}
      {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>No create access:</strong> You don't have permission to create new items.
        </div>
      )}
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      {loading ? (
        <div className="center-loader">
          <CircularProgress />
        </div>
      ) : (
        <div className=" add-item mr-2">
          <div className="card">
            <div className="itemtitleBar">
              <h4>Non Inventory items</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 ">
                  <label htmlFor="firstName" className="form-label">
                    Name / Number<span className="text-danger">*</span>
                  </label>
                  <TextField
                    type="text"
                    error={submitClicked && !formData.ActualName}
                    name="ActualName"
                    size="small"
                    value={formData.ActualName || ""}
                    className="form-control"
                    onChange={handleChange}
                    placeholder="Item Name"
                    disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                  />
                </div>
                {/* <div className="col-md-3 mb-3">
                <label htmlFor="lastName" className="form-label">
                  SubItem of
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  placeholder=""
                />
               
              </div> */}
                <div className="col-md-3 ">
                  <label htmlFor="lastName" className="form-label">
                    Income Account<span className="text-danger">*</span>
                  </label>
                  <Autocomplete
                    size="small"
                    options={incomeAccountList}
                    getOptionLabel={(option) => option.Name || ""}
                    value={
                      incomeAccountList.find(
                        (po) => po.AccountId === formData.IncomeAccount
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      handleAutocompleteChange(
                        "IncomeAccount",
                        "AccountId",
                        event,
                        newValue
                      )
                    }
                    disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                    isOptionEqualToValue={(option, value) =>
                      option.AccountId === value.IncomeAccount
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label=""
                        error={submitClicked && !formData.IncomeAccount}
                        placeholder="Select Account"
                        className="bg-white"
                      />
                    )}
                    aria-label="Contact select"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="lastName" className="form-label">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="SKU"
                    value={formData.SKU || ""}
                    onChange={handleChange}
                    className="form-control"
                    id="lastName"
                    placeholder=""
                  />
                </div>

                <div className="col-md-3 ">
                  <label
                    htmlFor="lastName"
                    className={
                      formData.isStaff ? "form-label " : "form-label mt-3"
                    }
                  >
                    <input
                      type="checkbox"
                      name="isStaff"
                      style={{ height: "1rem", width: "1rem" }}
                      value={formData.isStaff || false}
                      checked={formData.isStaff}
                      onChange={(e) => {
                        if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
                          return;
                        }
                        setFormData({
                          ...formData,
                          isStaff: e.target.checked,
                          UserId: null,
                        });
                      }}
                      disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                      className="form-check-input"
                      id="same-address"
                    />{" "}
                    Link Wager(optional)
                  </label>
                  {formData.isStaff && (
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={staffData}
                      getOptionLabel={(option) =>
                        option.FirstName + " " + option.LastName || ""
                      }
                      value={
                        staffData.find(
                          (staff) => staff.UserId === formData.UserId
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
                          return;
                        }
                        setFormData({
                          ...formData,
                          UserId: newValue?.UserId,
                        });
                        setSelectedWager(newValue?.UserId);
                      }}
                      disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === formData.UserId
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
                          placeholder="Choose..."
                          className="bg-white"
                        />
                      )}
                    />
                  )}
                </div>

                <div className="col-md-3 mb-3 mt-1">
                  <label htmlFor="firstName" className="form-label">
                    Fully qualified name
                  </label>
                  <TextField
                    type="text"
                    // error={submitClicked && !formData.ActualName}
                    name="ItemName"
                    size="small"
                    value={formData.ItemName || ""}
                    className="form-control"
                    disabled
                    // onChange={handleChange}
                    placeholder="Item Name"
                  />
                </div>
                <div className="col-md-3 mb-2 mt-1">
                  <label className="form-label">Type<span className="text-danger">*</span></label>
                  <CustomAutocomplete
                    property1="Type"
                    property2="Type"
                    formData={formData}
                    setFormData={setFormData}
                    endPoint="/Item/GetSearchItemTypeList"
                    placeholder="Type"
                    error={submitClicked && !formData.Type}
                  />
                </div>

                <div className="col-md-10">
                  <div className="row">
                    <div className="col-md-6">
                      <h4 className="mb-3">Sale</h4>
                      <div className="form-check custom-checkbox mb-2">
                        <input
                          type="checkbox"
                          name="isSale"
                          value={formData.isSale || false}
                          onChange={handleChange}
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          className="form-check-input"
                          id="same-address"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="same-address"
                        >
                          Used for Sales Transactions
                        </label>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          Sales Description
                        </label>
                        <TextArea
                          className="form-txtarea form-control"
                          name="SaleDescription"
                          value={formData.SaleDescription || ""}
                          onChange={handleChange}
                          rows="2"
                          id="comment"
                        ></TextArea>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          Sale Price
                        </label>
                        <input
                          type="number"
                          className="form-control number-input number-input"
                          name="SalePrice"
                          value={formData.SalePrice }
                          onChange={handleChange}
                          placeholder="Sale Price"
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          Tax Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="SaleTaxCode"
                          value={formData.SaleTaxCode || ""}
                          onChange={handleChange}
                          placeholder=""
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h4 className="mb-3">Purchase</h4>
                      <div className="form-check custom-checkbox mb-2">
                        <input
                          type="checkbox"
                          name="isPurchase"
                          onChange={handleChange}
                          value={formData.isPurchase|| false}
                          className="form-check-input"
                          id="save-info"
                        />
                        <label className="form-check-label" htmlFor="save-info">
                          Used for Purchase Transactions
                        </label>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          Purchase Description
                        </label>
                        <TextArea
                          className="form-txtarea form-control"
                          rows="2"
                          onChange={handleChange}
                          value={formData.PurchaseDescription || ""}
                          name="PurchaseDescription"
                          id="comment"
                        ></TextArea>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          Cost
                        </label>
                        <input
                          type="number"
                          className="form-control number-input"
                          onChange={handleChange}
                          name="PurchasePrice"
                          value={formData.PurchasePrice}
                          placeholder="Purchase Price"
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          Purchase Tax Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="PurchareTaxCode"
                          onChange={handleChange}
                          value={formData.PurchareTaxCode ||""}
                          placeholder="Purchace Tax code"
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label htmlFor="firstName" className="form-label">
                          Expense Account<span className="text-danger">*</span>
                        </label>
                        <Autocomplete
                          size="small"
                          options={incomeAccountList}
                          getOptionLabel={(option) => option.Name || ""}
                          value={
                            incomeAccountList.find(
                              (po) => po.AccountId === formData.ExpenseAccount
                            ) || null
                          }
                          onChange={(event, newValue) =>
                            handleAutocompleteChange(
                              "ExpenseAccount",
                              "AccountId",
                              event,
                              newValue
                            )
                          }
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          isOptionEqualToValue={(option, value) =>
                            option.AccountId === value.ExpenseAccount
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label=""
                              error={submitClicked && !formData.ExpenseAccount}
                              placeholder="Select Account"
                              className="bg-white"
                            />
                          )}
                          aria-label="Contact select"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <BackButton
                    onClick={() => {
                      setFormData({});
                      navigate(`/items`);
                    }}
                  >
                    Cancel
                  </BackButton>
                  {/* {emptyFieldError && (
                  <Alert severity="error">
                    Please Fill All Required Fields
                  </Alert>
                )} */}
                </div>
                <div className="col-md-4 text-right">
                  {/* <button
                  onClick={submitData}
                
                  className="btn btn-primary me-1"
                >
                  Save
                </button> */}
                  {((!isEditMode && !menuAccess.isLoading && menuAccess.canCreate) || (isEditMode && !menuAccess.isLoading && menuAccess.canEdit)) ? (
                    <LoaderButton
                      loading={disableButton}
                      handleSubmit={submitData}
                    >
                      Save
                    </LoaderButton>
                  ) : (
                    <Tooltip 
                      title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create items"} 
                      arrow
                    >
                      <span>
                        <LoaderButton
                          disable={true}
                          loading={false}
                          handleSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Save
                        </LoaderButton>
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddItem;
