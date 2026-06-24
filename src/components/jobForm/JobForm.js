import React, { useEffect, useState, useRef, useContext } from "react";
import TextField from "@mui/material/TextField";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import BackButton from "../Reusable/BackButton";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import { baseUrl } from "../../apiConfig";
import Cookies from "js-cookie";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import { Delete, Create } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";



const JobForm = ({
  handleClosePopup,
  fromJobList,
  jobId,
  selectedCustomer = {},
}) => {
  const [staffData, setStaffData] = useState([]);
  const [disableButton, setDisableButton] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [openJobPopup, setOpenJobPopup] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [formData, setFormData] = useState({
    CustomerId: selectedCustomer?.CustomerId || "",
    CustomerName: selectedCustomer?.CustomerName || "",
    RegionalManagerId: "",
    RegionalManagerName: "",
  });
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  let currentMonth = new Date().toLocaleString("default", { month: "long" });
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  const navigate = useNavigate();

  // Get menu access permissions
  const menuAccess = useMenuAccess();
  
  // Determine if this is edit mode (has jobId or idParam)
  const isEditMode = !!(jobId || idParam);
  const canEdit = menuAccess.canEdit && !menuAccess.isLoading;
  const canCreate = menuAccess.canCreate && !menuAccess.isLoading;

  const handleAutocompleteChange = (
    fieldName,
    valueProperty,
    event,
    newValue
  ) => {
    const simulatedEvent = {
      target: {
        name: fieldName,
        value: newValue ? newValue[valueProperty] : "",
      },
    };

    handleInputChange(simulatedEvent);
  };
  const handleInputChange = (e, newValue) => {
    if (isEditMode && !canEdit) return; // Prevent changes if no edit access
    setDisableButton(false);
    const { name, value } = e.target;

    const adjustedValue = [
      "FertilizerNoOfBags",
      "NoOfFlatsOfColor",
      "MulchQuantity",
      "OverseedingNoOfBags",
      "PGR5galBPS",
      "RegionalManagerId",
      "CustomerId",
    ].includes(name)
      ? value === ""
        ? ""
        : Number(value)
      : value;

    setFormData((prevData) => ({ ...prevData, [name]: adjustedValue }));
  };
  const fetchStaffList = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
        headers,
      });
      setStaffData(response.data);
    } catch (error) {
    }
  };

  const handleSubmit = async () => {
    // Check permissions before submitting
    if (isEditMode) {
      // Updating existing job - need edit access
      if (!canEdit) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update jobs");
        return;
      }
    } else {
      // Creating new job - need create access
      if (!canCreate) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create jobs");
        return;
      }
    }

    if (!formData.CustomerId || !formData.RegionalManagerId) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      return;
    }

    const postData = new FormData();

    const payload = {
      ...formData,
      CustomerJobFormId: formData.CustomerJobFormId || 0,
      CustomerId: Number(formData.CustomerId),
      CustomerName: formData.CustomerName, //new
      RegionalManagerName: formData.RegionalManagerName,
      RegionalManagerId: Number(formData.RegionalManagerId),
      StartDate: formData.StartDate || new Date().toISOString(),
      ReferenceAddress: formData.ReferenceAddress,
      RotationLength: String(formData.RotationLength),
      IrrInspectionFreq: formData.IrrInspectionFreq,
      LaborHours: String(formData.LaborHours),
      GateCode: formData.GateCode,
      LandscapeWalkDate: formData.LandscapeWalkDate,
      BoardMeetingDate: formData.BoardMeetingDate || null,
      MowDay: formData.MowDay,
      TypeofMowers: formData.TypeofMowers,
      FertilizerNoOfBags: Number(formData.FertilizerNoOfBags),
      NoOfFlatsOfColor: Number(formData.NoOfFlatsOfColor),
      MulchQuantity: formData.MulchQuantity,
      NumberOfControllers: String(formData.NumberOfControllers),
      ContractInclusions: formData.ContractInclusions,
      IrrigationHoursIncluded: String(formData.IrrigationHoursIncluded),
      QACIncluded: String(formData.QACIncluded),
      OverseedingNoOfBags: Number(formData.OverseedingNoOfBags),
      PGR5galBPS: Number(formData.PGR5galBPS),
      ReclaimedWater: String(formData.ReclaimedWater),
      DogBagsIncluded: String(formData.DogBagsIncluded),
      Misc: formData.Misc,
      Concerns: formData.Concerns,
    };

    postData.append("CustomerJobFormData", JSON.stringify(payload));

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    setDisableButton(true);

    try {
      const response = await axios.post(
        `${baseUrl}/api/CustomerJobForm/AddCustomerJobForm`,
        postData,
        { headers }
      );

      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);

      // setTimeout(() => {
      //   navigate(`/job/list`);
      // }, 2000);
      if (typeof handleClosePopup === "function") {
        handleClosePopup(true);
      }
    } catch (error) {
      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response?.data || "An error occurred.");
    }

    for (let [key, value] of postData.entries()) {
    }
  };
  const [loading, setLoading] = useState(false);
  const fetchJobData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/CustomerJobForm/GetCustomerJobForm?id=${jobId || idParam
        }`,
        { headers }
      );

      if (response?.data) {
        const jobData = response.data;
        const { data } = await axios.get(
          `${baseUrl}/api/Customer/GetCustomerNameById?id=${response?.data?.CustomerId}`,
          { headers }
        );

        setFormData((prev) => ({
          ...prev,
          ...jobData,
          CustomerId: jobData.CustomerId,
          CustomerDisplayName: data?.DisplayName,
          CustomerJobFormId: jobData.CustomerJobFormId,
          CustomerName: jobData.CustomerName,
          StartDate: jobData.StartDate ? jobData.StartDate.split("T")[0] : "",
          LandscapeWalkDate: jobData.LandscapeWalkDate
            ? jobData.LandscapeWalkDate.split("T")[0]
            : "",
          BoardMeetingDate: jobData.BoardMeetingDate
            ? jobData.BoardMeetingDate.split("T")[0]
            : "",
        }));
      }
      setLoading(false);
    } catch (err) {

      setLoading(false);
    }
  };

  const fetchJobDataById = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/CustomerJobForm/GetCustomerJobForm?id=${id}`,
        { headers }
      );

      if (response?.data) {
        const jobData = response.data;
        setFormData((prev) => ({
          ...prev,
          ...jobData,
          StartDate: jobData.StartDate ? jobData.StartDate.split("T")[0] : "",
          LandscapeWalkDate: jobData.LandscapeWalkDate
            ? jobData.LandscapeWalkDate.split("T")[0]
            : "",
          BoardMeetingDate: jobData.BoardMeetingDate
            ? jobData.BoardMeetingDate.split("T")[0]
            : "",
        }));
      }
    } catch (err) {
    }
  };

  const fetchJobDataByCustomerId = async (customerId) => {
    if (!customerId) return;

    try {
      const response = await axios.get(
        `${baseUrl}/api/CustomerJobForm/GetCustomerJobFormList`,
        { headers }
      );

      if (Array.isArray(response.data)) {
        const match = response.data.find(
          (form) => Number(form.CustomerId) === Number(customerId)
        );

        if (match) {
          const jobDetails = await axios.get(
            `${baseUrl}/api/CustomerJobForm/GetCustomerJobForm?id=${match.CustomerJobFormId}`,
            { headers }
          );

          const jobData = jobDetails.data;

          setFormData((prev) => ({
            ...prev,
            ...jobData,
            StartDate: jobData.StartDate ? jobData.StartDate.split("T")[0] : "",
            LandscapeWalkDate: jobData.LandscapeWalkDate
              ? jobData.LandscapeWalkDate.split("T")[0]
              : "",
            BoardMeetingDate: jobData.BoardMeetingDate
              ? jobData.BoardMeetingDate.split("T")[0]
              : "",
          }));
        } else {
        }
      } else {
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    if (idParam || jobId) {
      fetchJobData();
      // fetchJobDataByCustomerId(jobId || idParam);
    }
  }, [jobId]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    const shouldSetCustomer =
      selectedCustomer?.CustomerId ||
      !formData.CustomerId ||
      formData.CustomerId === 0;

    if (shouldSetCustomer) {

      // if(formData.CustomerId){
      //   const { data } =  axios.get(
      //     `${baseUrl}/api/Customer/GetCustomerNameById?id=${formData.CustomerId}`,
      //     { headers }
      //   );
      // }
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          CustomerId: selectedCustomer.CustomerId,
          CustomerDisplayName: selectedCustomer.CustomerName,
        };
        return newFormData;
      });
      if (selectedCustomer?.CustomerId) {
        fetchJobDataByCustomerId(selectedCustomer.CustomerId);
      }
    }
  }, []);



  return (

    <div style={{ height: "fit-content" }} className="card mb-0">
      {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>Read-only mode:</strong> You don't have permission to update this job. You can view the information but cannot make changes.
        </div>
      )}
      {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>No create access:</strong> You don't have permission to create new jobs.
        </div>
      )}
      <div className="jobFormBar d-flex justify-content-between">
        <h4 className="modal-title w-50" id="#gridSystemModal">
          Job Form
        </h4>

      </div>

      <div className="card-body">
        <div className="col-12">
          <div className="row">


            <div className="col-md-3 ">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Customer Name
                <span className="text-danger">*</span>
              </label>

              {/* <CustomerAutocomplete
                                     formData={formData}
                                     setFormData={(data) => {
                                     setFormData((prev) => ({
                                     ...prev,
                                     ...data,
                                        }));
                                        if (data.CustomerId) {
                                        fetchJobDataByCustomerId(data.CustomerId); 
                                         }
                                        }}
                                   submitClicked={submitClicked}
                                   selectedCustomerId={formData.CustomerId}
                                     /> */}
              {formData.CustomerName ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Customer Name"
                  value={formData.CustomerName}
                  InputProps={{ readOnly: true }}
                />
              ) : (
                <CustomerAutocomplete
                  formData={formData}
                  setFormData={(data) => {
                    if (isEditMode && !canEdit) return;
                    setFormData((prev) => ({
                      ...prev,
                      ...data,
                    }));
                    if (data.CustomerId) {
                      fetchJobDataByCustomerId(data.CustomerId);
                    }
                  }}
                  submitClicked={submitClicked}
                  selectedCustomerId={formData.CustomerId}
                  disabled={isEditMode && !canEdit}
                />
              )}
              {/* {
                                        formData.CustomerName ? (
                                          <TextField
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            placeholder="Customer Name"
                                            value={formData.CustomerName}
                                            InputProps={{ readOnly: true }}
                                          />
                                        ) : (
                                          <CustomerAutocomplete
                                            formData={formData}
                                            setFormData={(data) => {
                                              setFormData((prev) => ({
                                                ...prev,
                                                ...data,
                                              }));
                                              if (data.CustomerId) {
                                                fetchJobDataByCustomerId(data.CustomerId);
                                              }
                                            }}
                                            submitClicked={submitClicked}
                                            selectedCustomerId={formData.CustomerId}
                                          />
                                        )
                                      } */}
            </div>
            <div className="col-md-3 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Regional Manager
                <span className="text-danger">*</span>
              </label>
              <Autocomplete
                id="staff-autocomplete"
                size="small"
                options={staffData.filter(
                  (staff) =>
                    staff.Role === "Regional Manager" || staff.Role === "Account Manager"||staff?.isSuperAdmin
                )}
                disabled={isEditMode && !canEdit}
                getOptionLabel={(option) =>
                  option.FirstName + " " + option.LastName || ""
                }
                value={
                  formData.RegionalManagerId
                    ? staffData.find(
                      (staff) => staff.UserId === formData.RegionalManagerId
                    ) || null
                    : null
                }

                onChange={(event, newValue) => {
                  if (isEditMode && !canEdit) return;
                  handleAutocompleteChange(
                    "RegionalManagerId",
                    "UserId",
                    event,
                    newValue
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option.UserId === value.RegionalManagerId
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
                    // error={submitClicked && !formData.RegionalManagerId}
                    placeholder="Choose..."
                    className="bg-white"
                    disabled={isEditMode && !canEdit}
                  />
                )}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Start Date
              </label>
              <TextField
                type="Date"
                className="form-control"
                name="StartDate"
                onChange={handleInputChange}
                value={formData.StartDate || ""}
                variant="outlined"
                size="small"
                disabled={isEditMode && !canEdit}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Refrence Address
              </label>
              <TextField
                type="text"
                className="form-control"
                variant="outlined"
                size="small"
                name="ReferenceAddress"
                value={formData.ReferenceAddress || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Landscape Walk Date
              </label>
              <TextField
                type="date"
                className="form-control"
                name="LandscapeWalkDate"
                variant="outlined"
                size="small"
                value={formData.LandscapeWalkDate || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Board Meeting Date
              </label>
              <TextField
                type="Date"
                className="form-control"
                name="BoardMeetingDate"
                variant="outlined"
                size="small"
                value={formData.BoardMeetingDate || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>


            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Rotation Length
              </label>
              <TextField
                type="text"
                className="form-control"
                variant="outlined"
                size="small"
                name="RotationLength"
                value={formData.RotationLength || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>

            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Irr Inspection Freq
              </label>
              <TextField
                type="text"
                className="form-control"
                variant="outlined"
                size="small"
                value={formData.IrrInspectionFreq || ""}
                name="IrrInspectionFreq"
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Labour Hours
              </label>
              <TextField
                type="text"
                className="form-control"
                variant="outlined"
                size="small"
                name="LaborHours"
                value={formData.LaborHours || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Gate Code
              </label>
              <TextField
                type="text"
                className="form-control"
                name="GateCode"
                variant="outlined"
                size="small"
                value={formData.GateCode || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Mow Day
              </label>
              <TextField
                type="text"
                className="form-control"
                name="MowDay"
                variant="outlined"
                size="small"
                value={formData.MowDay || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Type of Mowers
              </label>
              <TextField
                type="text"
                className="form-control"
                name="TypeofMowers"
                variant="outlined"
                size="small"
                value={formData.TypeofMowers || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>


            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Fertilizer No of Bags
              </label>
              <TextField
                type="number"
                className="form-control"
                name="FertilizerNoOfBags"
                variant="outlined"
                size="small"
                value={formData.FertilizerNoOfBags || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                No of Flats of Color
              </label>
              <TextField
                type="number"
                className="form-control"
                name="NoOfFlatsOfColor"
                variant="outlined"
                size="small"
                value={formData.NoOfFlatsOfColor || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Mulch Quantity
              </label>
              <TextField
                type="number"
                className="form-control"
                name="MulchQuantity"
                variant="outlined"
                size="small"
                value={formData.MulchQuantity || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                No of Controllers
              </label>
              <TextField
                type="text"
                className="form-control"
                name="NumberOfControllers"
                variant="outlined"
                size="small"
                value={formData.NumberOfControllers || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Contract Inclusions
              </label>
              <TextField
                type="text"
                className="form-control"
                name="ContractInclusions"
                variant="outlined"
                size="small"
                value={formData.ContractInclusions || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Irrigation Included?
              </label>
              <TextField
                type="text"
                className="form-control"
                name="IrrigationHoursIncluded"
                variant="outlined"
                size="small"
                value={formData.IrrigationHoursIncluded || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                QAC Included?
              </label>
              <TextField
                type="text"
                className="form-control"
                name="QACIncluded"
                variant="outlined"
                size="small"
                value={formData.QACIncluded || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                No of Bags
              </label>
              <TextField
                type="number"
                className="form-control"
                name="OverseedingNoOfBags"
                variant="outlined"
                size="small"
                value={formData.OverseedingNoOfBags || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                PGR 5gal BPS
              </label>
              <TextField
                type="number"
                className="form-control"
                name="PGR5galBPS"
                variant="outlined"
                value={formData.PGR5galBPS || ""}
                size="small"
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Reclaimed Water
              </label>
              <TextField
                type="text"
                className="form-control"
                name="ReclaimedWater"
                variant="outlined"
                size="small"
                value={formData.ReclaimedWater || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-2 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Dog Bags Included?
              </label>
              <TextField
                type="text"
                className="form-control"
                name="DogBagsIncluded"
                variant="outlined"
                size="small"
                value={formData.DogBagsIncluded || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Misc
              </label>
              <TextField
                type="text"
                className="form-control"
                name="Misc"
                variant="outlined"
                size="small"
                value={formData.Misc || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label jobFormLable"
                style={{ color: "#888888" }}
              >
                Concern
              </label>
              <TextField
                type="text"
                className="form-control"
                name="Concerns"
                variant="outlined"
                size="small"
                value={formData.Concerns || ""}
                onChange={handleInputChange}
                disabled={isEditMode && !canEdit}
              />
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

          <div className="col-md-9">
            <BackButton
              onClick={handleClosePopup}>
              Back
            </BackButton>
          </div>


          <div className="col-md-3 text-end">
            {((!isEditMode && canCreate) || (isEditMode && canEdit)) ? (
              <LoaderButton
                loading={disableButton}
                handleSubmit={handleSubmit}
              >
                Save
              </LoaderButton>
            ) : (
              <Tooltip 
                title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create jobs"} 
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

    </div>

  )
}

export default JobForm