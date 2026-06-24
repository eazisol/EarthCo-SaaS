import React, { useEffect, useContext, useState } from "react";
import TitleBar from "../TitleBar";
import {
  Autocomplete,
  TextField,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import Cookies from "js-cookie";
import { Delete, Create } from "@mui/icons-material";
import axios from "axios";
import EventPopups from "../Reusable/EventPopups";
import { Print, Email, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import formatDate from "../../custom/FormatDate";
import LoaderButton from "../Reusable/LoaderButton";
import { DataContext } from "../../context/AppData";
import CircularProgress from "@mui/material/CircularProgress";
import useDeleteFile from "../Hooks/useDeleteFile";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import BackButton from "../Reusable/BackButton";
import FileUploadButton from "../Reusable/FileUploadButton";
import PrintButton from "../Reusable/PrintButton";
import { baseUrl } from "../../apiConfig";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import SignInput from "../CommonComponents/SignInput";
import imageCompresser from "../../custom/ImageCompresser";
import TimeInput from "../Reusable/TimeInput";
import dayjs from "dayjs";
import RadioOption from "../Reusable/RadioOption";
import { BsFiletypePdf } from "react-icons/bs";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";
const SafetyForm = () => {
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
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let currentMonth = new Date().toLocaleString("default", { month: "long" });
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  const navigate = useNavigate();

  const [sign, setSign] = useState("");
  const [url, setUrl] = useState("");

  const [foremanSign, setForemanSign] = useState("");
  const [foremanUrl, setForemanUrl] = useState("");

  const { deleteReportFile } = useDeleteFile();
  // const { contactEmail, fetchEmail } = useFetchContactEmail();
  const { customerMail, fetchCustomerEmail } = useFetchCustomerEmail();

  const { loggedInUser, companyInfo ,setselectedPdf, dynamicColorAndLogo} = useContext(DataContext);
 
  const currentDate = new Date();
  const currentTime = dayjs();
  const [formData, setFormData] = useState({
    ReportForWeekOf: currentMonth,
    StatusId: 1,
    Date: formatDate(currentDate),
    ReportTime: currentTime,
    SafetyFormId: 0,
    ReportDate: formatDate(currentDate),
    SafetyInspector: "",
    CustomerId: null,
    City: "",
  });
  console.log("🚀 ~ formData:", formData)
  const [sLList, setSLList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState({});
  const [staffData, setStaffData] = useState([]);

  const [Files, setFiles] = useState([]);
  const [prevFiles, setPrevFiles] = useState([]);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const [loading, setLoading] = useState(true);
  const [statusList, setStatusList] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const getWeeklyPreview = async () => {
    if (!idParam) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/WeeklyReport/GetWeeklyReportRC?id=${idParam}`,
        { headers }
      );

      // setFormData(res.data.Data);
      // fetchEmail(res.data.Data.ContactId);
      // setPrevFiles(res.data.FileData);
      setLoading(false);
      setSelectedContact({
        ...selectedContact,
        Email: res.data.Data.ContactEmail,
        CompanyName: res.data.Data.ContactCompany,
      });
    } catch (error) {
      setLoading(false);

      console.log("api call error", error);
    }
  };

  const fetchServiceLocations = async (id) => {
    axios
      .get(`${baseUrl}/api/Customer/GetCustomerServiceLocation?id=${id}`, {
        headers,
      })
      .then((res) => {
        setSLList(res.data);
      })
      .catch((error) => {
        setSLList([]);
        console.log("service locations fetch error", error);
      });
  };
  const [storeLocations, setStoreLocations] = useState([]);

  const fetchStoreLocations = async () => {
    axios
      .get(`${baseUrl}/api/WeeklyReport/GetStoreLocationList`, { headers })
      .then((res) => {
        setStoreLocations(res.data);
      })
      .catch((error) => {
        console.log("store locations fetch error", error);
      });
  };

  const fetctContacts = async (id) => {
    if (!id) {
      return;
    }
    axios
      .get(`${baseUrl}/api/Customer/GetCustomerContact?id=${id}`, { headers })
      .then((res) => {
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
    } catch (error) {
      console.log("error getting staff list", error);
    }
  };
  useEffect(() => {
    if (!formData.RegionalManagerId) {
      if (loggedInUser.userRole == "4") {
        setFormData((prevData) => ({
          ...prevData,
          RegionalManagerId: Number(loggedInUser.userId),
        }));
      }
    }

    fetchStaffList();
  }, []);
  useEffect(() => {
    fetchCustomerEmail(formData.ContactId);
  }, [formData.ContactId]);
  const handleInputChange = (e, newValue) => {
    const { name, value, type, checked } = e.target;

    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId
    const adjustedValue = [
      "UserId",
      "ServiceLocationId",
      "ContactId",
      "Nextweekrotation",
      "Thisweekrotation",
    ].includes(name)
      ? Number(value)
      : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : adjustedValue,
    }));
  };
  const handleCheckboxChange = (name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: !prevData[name], // Toggle the checkbox value
    }));
  };
  const handleDeleteFile = (index) => {
    const updatedFiles = [...Files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  // const handleDeleteFile = (index) => {
  //   console.log("Removing locally selected file at index:", index);
  //   setFiles((prev) => prev.filter((_, i) => i !== index));
  // };

  const trackFile = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const newFileName = `SafetyReport_${uploadedFile.name}`;

      const renamedFile = new File([uploadedFile], newFileName, {
        type: uploadedFile.type,
        lastModified: uploadedFile.lastModified,
      });
      // const uploadedFile = e.target.files[0];
      // if (uploadedFile) {
      // const newFile = {
      // actualFile: uploadedFile,
      // name: uploadedFile.name,
      // caption: uploadedFile.name,
      // date: new Date().toLocaleDateString(),
      // };

      const compressedImg = await imageCompresser(renamedFile);
      setFiles((prevFiles) => [...prevFiles, compressedImg]);
    }
  };
  const [submitClicked, setSubmitClicked] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleSubmit = async () => {
    if (!formData.TruckNo) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      return;
    }
    // const totalFiles = Files.length + prevFiles.length;

    // if (totalFiles > 4 || totalFiles < 2) {
    //   setOpenSnackBar(true);
    //   setSnackBarColor("error");
    //   setSnackBarText("Please Upload Minimum of 2 and Maximum of 4 files");
    //   return;
    // }

    const postData = new FormData();

    const SafetyReportData = {
      ...formData,
  CompanyId: parseInt(loggedInUser?.CompanyId) ,

      // SafetyFormId: formData.SafetyFormId || 0,
      SafetyFormId: idParam ? idParam : 0,
      ReportDate: formData.ReportDate,
      SafetyInspector: formData.SafetyInspector,
      ReportTime: formData.ReportTime || dayjs().toISOString(),
      // ReportTime: "",
      CustomerId: formData.CustomerId ?? null,
      City: formData.City,
      CurrentWeather: formData.CurrentWeather,
      Foreman: formData.Foreman,
      NumberOfCrew: String(formData.NumberOfCrew),
      TruckNo: formData.TruckNo,
      ForemanHaveMorningHuddleUp: formData.ForemanHaveMorningHuddleUp ?? "yes",
      CrewHaveWaterWaterJugs: formData.CrewHaveWaterWaterJugs ?? "yes",
      ForemanHaveFifteenGallonsOfWaterPerMan:
        formData.ForemanHaveFifteenGallonsOfWaterPerMan ?? "yes",
      ForemanIdentifyCommunicateAndCorrectHazards:
        formData.ForemanIdentifyCommunicateAndCorrectHazards ?? "yes",
      ForemanHaveTheIIPPCopyInTruck:
        formData.ForemanHaveTheIIPPCopyInTruck ?? "yes",
      ForemanHaveAMapToTheNearestMedicalClinic:
        formData.ForemanHaveAMapToTheNearestMedicalClinic ?? "yes",
      ForemanHaveAFirstAidKit: formData.ForemanHaveAFirstAidKit ?? "yes",
      CrewHaveCones: formData.CrewHaveCones ?? "yes",
      ForemanKnowTheWeather: formData.ForemanKnowTheWeather ?? "yes",
      ForemanConductTheLatestSafetyTailgateMeeting:
        formData.ForemanConductTheLatestSafetyTailgateMeeting ?? "yes",
      ForemanGiveHisCrewCorrectRestAndMealPeriods:
        formData.ForemanGiveHisCrewCorrectRestAndMealPeriods ?? "yes",
      PowerToolsAreInGoodCondition:
        formData.PowerToolsAreInGoodCondition ?? "yes",
      CrewIsWearingSafetyVest: formData.CrewIsWearingSafetyVest ?? "yes",
      SafetyGlassAreOnWhenNeeded: formData.SafetyGlassAreOnWhenNeeded ?? "yes",
      GlovesWhenNeeded: formData.GlovesWhenNeeded ?? "yes",
      EarplugsWhenNeeded: formData.EarplugsWhenNeeded ?? "yes",
      TruckIsCleanInside: formData.TruckIsCleanInside ?? "yes",
      TruckIsCleanOutside: formData.TruckIsCleanOutside ?? "yes",
      JobComments: formData.JobComments,
      ActionItems: formData.ActionItems,
      EmergencyFlashers: formData.EmergencyFlashers,
      WindshieldWipers: formData.WindshieldWipers,
      Horn: formData.Horn,
      Mirrors: formData.Mirrors,
      SeatBelts: formData.SeatBelts,
      LicensePlateAndRegistration: formData.LicensePlateAndRegistration,
      FireExtinguisher: formData.FireExtinguisher,
      Fluids: formData.Fluids,
      TurnSignals: formData.TurnSignals,
      Brakes: formData.Brakes,
      TruckTires: formData.TruckTires,
      SamsaraCamera: formData.SamsaraCamera,
      LogoAndOverallTruckAppearance: formData.LogoAndOverallTruckAppearance,
      TruckInspectionListAnyProblemsThatNeedCorrection:
        formData.TruckInspectionListAnyProblemsThatNeedCorrection,
      TowHitchBallHasALock: formData.TowHitchBallHasALock,
      TrailerHasSafetyChainsConnectedToTruck:
        formData.TrailerHasSafetyChainsConnectedToTruck,
      TrailerIsConnectedCorrectly: formData.TrailerIsConnectedCorrectly,
      TurnSignalsFunctioningCorrectly: formData.TurnSignalsFunctioningCorrectly,
      ElectricalConnectionCorrect: formData.ElectricalConnectionCorrect,
      TrailerHasProperRegistrationAndLicensePlate:
        formData.TrailerHasProperRegistrationAndLicensePlate,
      TrailerTires: formData.TrailerTires,
      TrailerInspectionListAnyProblemsThatNeedCorrection:
        formData.TrailerInspectionListAnyProblemsThatNeedCorrection,
      // ForemanSignaturePath: foremanUrl || "",
      // SafetyInspectorSignaturePath: url || "",
      StatusId: formData.StatusId,
      AssignTo: formData.AssignTo,
      // CreatedBy: formData.CreatedBy || "",
      // CreatedDate: formData.CreatedDate || new Date().toISOString(),
      // EditBy: formData.EditBy || "",
      // EditDate: formData.EditDate || "",
      // isActive: formData.isActive !== undefined ? formData.isActive : true,
      // isDelete: formData.isDelete !== undefined ? formData.isDelete : false,
    };
    //
    Files.forEach((files) => {
      postData.append("Files", files);
    });

    prevFiles.forEach((file) => {
      postData.append("PrevFiles", JSON.stringify(file));
    });
    postData.append("foremanSignatureImage", foremanUrl);
    postData.append("safetyInspectorSignatureImage", url);

    postData.append("SafetyReportData", JSON.stringify(SafetyReportData));

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    setDisableButton(true);

    try {
      const response = await axios.post(
        `${baseUrl}/api/SafetyReport/AddSafetyReport`,
        postData,
        { headers }
      );

      // setTimeout(() => {
      //   navigate(`/safety-reports/list`);
      // }, 4000)
        navigate(`/safety-reports/add?id=${response.data.Id}`);
      setTimeout(() => {
        setDisableButton(false);
        window.location.reload();
      }, 4000);
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
    } catch (error) {
      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response?.data || "An error occurred.");
    }

    for (let [key, value] of postData.entries()) {
      console.log("FormData:", key, value);
    }
  };

  useEffect(() => {
    fetctContacts(formData.CustomerId);
  }, [formData.CustomerId]);

  useEffect(() => {
    fetchStaffList();
    getWeeklyPreview();
    fetchStoreLocations();
  }, []);

  const fetchStatusList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/SafetyReport/GetSafetyReportStatusList`,
        { headers }
      );

      console.log("Full API Response of Status:", response);
      console.log("Data Received:", response.data);

      setStatusList(response.data);
    } catch (error) {
      console.error("Error fetching status list:", error);
      setStatusList([]);
    }
  };

  useEffect(() => {
    fetchStatusList();
  }, []);

  // populate data for edit
  const fetchReportDetails = async (reportId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/SafetyReport/GetSafetyReport?id=${reportId}`,
        { headers }
      );
      setFormData(response.data.Data);
      fetchCustomerEmail(response.data.Data.CustomerId);
      if (response.data.FileData && Array.isArray(response.data.FileData)) {
        setPrevFiles(response.data.FileData);
      } else {
        setPrevFiles([]);
      }

      if (response.data.Data.ForemanSignaturePath) {
        setForemanUrl(`${baseUrl}/${response.data.Data.ForemanSignaturePath}`);
      }

      if (response.data.Data.SafetyInspectorSignaturePath) {
        setUrl(`${baseUrl}/${response.data.Data.SafetyInspectorSignaturePath}`);
      }
      console.log("Prev Files Updated:", response.data.FileData);
    } catch (error) {
      console.error("Error fetching safety report:", error);
    }
  };

  useEffect(() => {
    if (idParam) {
      fetchReportDetails(idParam);
    }
  }, [idParam]);

  const handleDeleteUploadedFile = async (FileId, index) => {
    if (idParam) {
      // Only call delete API in edit mode
      if (!FileId || FileId <= 0 || index === undefined) {
        console.error("Invalid FileId or index", { FileId, index });
        return;
      }
      try {
        await axios.get(
          `${baseUrl}/api/SafetyReport/DeleteSafetyReportFile?FileId=${FileId}`,
          { headers }
        );
        setPrevFiles((prev) => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    } else {
      // If adding a new form, just remove file from frontend
      setFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };
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

  return (
    <>
      <TitleBar safetyIcon title="Safety Reports" />
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="container-fluid">
        {loading ? (
          <div className="center-loader">
            <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
          </div>
        ) : (
          <div className="card">
            <div className="itemtitleBar ">
              <h4> Job-Site Safety Inspection</h4>
            </div>
            <div className="card-body p-0 ">
              <div className="row mx-2 mt-3">
                <div className="col-md-3">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Date:</label>
                      <TextField
                        value={formatDate(formData.ReportDate)}
                        name="ReportDate"
                        onChange={handleInputChange}
                        className="input-limit-datepicker"
                        type="date"
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Time</label>
                      <TimeInput
                        name={"ReportTime"}
                        formData={formData}
                        setFormData={setFormData}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-3 ">
                  {/* <label className="form-label">Regional Manager</label> */}
                  <label className="form-label">Regional Manager</label>
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
                        (staff) => staff.UserId === formData.AssignTo
                      ) || null
                    }
                    onChange={(event, newValue) =>
                      handleAutocompleteChange(
                        "AssignTo",
                        "UserId",
                        event,
                        newValue
                      )
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.UserId === value.AssignTo
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
                        // error={submitClicked && !formData.RegionalManagerId}
                        placeholder="Choose..."
                        className="bg-white"
                      />
                    )}
                  />
                </div>
                <div className="col-md-3" style={{ position: "relative" }}>
                  <label className="form-label">Customer Name</label>

                  <CustomerAutocomplete
                    formData={formData}
                    setFormData={setFormData}
                    submitClicked={submitClicked}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Number of crew members on site:
                  </label>
                  <FormControl fullWidth>
                    <Select
                      name="NumberOfCrew"
                      value={formData.NumberOfCrew}
                      onChange={handleInputChange}
                      size="small"
                      MenuProps={{
                        sx: {
                          "& .MuiPaper-root": {
                            width: "120px", // Reduce dropdown width
                          },
                        },
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem
                          key={num}
                          value={num}
                          sx={{ minWidth: "50px" }}
                        >
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="col-md-3   mt-2">
                  <label className="form-label">Safety Inspector</label>
                  <TextField
                    className="form-control form-control-sm"
                    name="SafetyInspector"
                    value={formData.SafetyInspector}
                    onChange={handleInputChange}
                    size="small"
                  />
                </div>
                <div className="col-md-3  mt-2">
                  <label className="form-label">City</label>
                  <TextField
                    className="form-control form-control-sm"
                    name="City"
                    value={formData.City}
                    onChange={handleInputChange}
                    size="small"
                  />
                </div>

                <div className="col-md-3  mt-2">
                  <label className="form-label">Foreman:</label>
                  <TextField
                    className="form-control form-control-sm"
                    name="Foreman"
                    value={formData.Foreman}
                    onChange={handleInputChange}
                    size="small"
                  />
                </div>

                <div className="col-md-3 mt-2">
                  <div className="row">
                    {/* Status Dropdown */}
                    <div className="col-md-6">
                      <label className="form-label">Status:</label>
                      <FormControl fullWidth>
                        <Select
                          name="StatusId"
                          value={formData.StatusId || ""}
                          onChange={handleInputChange}
                          size="small"
                        >
                          {statusList.map((status) => (
                            <MenuItem
                              key={status.SafetyFormStatusId}
                              value={status.SafetyFormStatusId}
                            >
                              {status.Status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>

                    {/* Truck # */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Truck #<span className="text-danger">*</span>
                      </label>
                      <TextField
                        className="form-control form-control-sm"
                        name="TruckNo"
                        value={formData.TruckNo}
                        onChange={handleInputChange}
                        size="small"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-3  mt-2">
                  <label className="form-label">
                    Current weather at time of inspection{" "}
                  </label>
                  <TextField
                    className="form-control form-control-sm"
                    name="CurrentWeather"
                    value={formData.CurrentWeather}
                    onChange={handleInputChange}
                    size="small"
                  />
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="row mt-2 mx-2 ">
                <div className="col-md-6 col-sm-12 p-0 p-md-2">
                  <div className="itemtitleBar  ">
                    <h4>Crew Inspection</h4>
                  </div>
                  {[
                    {
                      title: "Did foreman have a morning 'huddle-up'",
                      name: "ForemanHaveMorningHuddleUp",
                    },
                    {
                      title: "Does the crew have water in their water jugs?",
                      name: "CrewHaveWaterWaterJugs",
                    },
                    {
                      title:
                        "Does the foreman have 1.5 gallons of water per man?",
                      name: "ForemanHaveFifteenGallonsOfWaterPerMan",
                    },
                    {
                      title:
                        "Did the foreman identify, communicate, and correct hazards?",
                      name: "ForemanIdentifyCommunicateAndCorrectHazards",
                    },
                    {
                      title: "Does the foreman have the IIPP copy in truck? ",
                      name: "ForemanHaveTheIIPPCopyInTruck",
                    },
                    {
                      title:
                        "Does the foreman have a map to the nearest medical clinic?",
                      name: "ForemanHaveAMapToTheNearestMedicalClinic",
                    },
                    {
                      title: "Does the foreman have a first aid kit?",
                      name: "ForemanHaveAFirstAidKit",
                    },
                    {
                      title: "Does the crew have cones?",
                      name: "CrewHaveCones",
                    },
                    {
                      title: "Does the foreman know the weather?",
                      name: "ForemanKnowTheWeather",
                    },
                    {
                      title:
                        "Did foreman conduct the latest Safety Tailgate Meeting?",
                      name: "ForemanConductTheLatestSafetyTailgateMeeting",
                    },
                    {
                      title:
                        "Did foreman give his crew correct rest and meal periods?",
                      name: "ForemanGiveHisCrewCorrectRestAndMealPeriods",
                    },
                    {
                      title: "Power tools are in good condition?",
                      name: "PowerToolsAreInGoodCondition",
                    },
                    {
                      title: "Crew is wearing safety vest?",
                      name: "CrewIsWearingSafetyVest",
                    },
                    {
                      title: "Safety Glass are on when needed?",
                      name: "SafetyGlassAreOnWhenNeeded",
                    },
                    {
                      title: "Gloves when needed?",
                      name: "GlovesWhenNeeded",
                    },
                    {
                      title: "Earplugs when needed?",
                      name: "EarplugsWhenNeeded",
                    },
                    {
                      title: "Truck is clean inside? ",
                      name: "TruckIsCleanInside",
                    },
                    {
                      title: "Truck is clean outside?",
                      name: "TruckIsCleanOutside",
                    },
                  ].map((inp, index) => (
                    <div key={index} className="row  align-items-center ">
                      <div className="col-md-8">
                        <h5 className="fw-normal">{inp.title}</h5>
                      </div>
                      <div className="col-md-4 " style={{ marginLeft: "-6px" }}>
                        <RadioOption
                          name={inp.name}
                          // title={inp.title}
                          formData={formData}
                          setFormData={setFormData}
                          sx={{ marginLeft: "-6px" }}
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="col-md-12 d-flex gap-3">
                    <div className="w-50">
                      <h5 className="fw-normal">Job Comments / Issues</h5>
                      <textarea
                        className="form-control form-control-sm"
                        name="JobComments"
                        value={formData.JobComments}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>

                    <div className="w-50">
                      <h5 className="fw-normal">Action Items</h5>
                      <textarea
                        className="form-control form-control-sm"
                        name="ActionItems"
                        value={formData.ActionItems}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="col-md-12 mt-2">
                    <h5 className="fw-normal ">Foreman Signature</h5>
                    <div className="d-flex justify-content-between mt-2">
                      <SignInput
                        sign={foremanSign}
                        setSign={setForemanSign}
                        url={foremanUrl}
                        setUrl={setForemanUrl}
                        imageName={"foremanSignature.png"}
                      />

                      {foremanUrl && typeof foremanUrl !== "string" ? (
                        <img
                          src={URL.createObjectURL(foremanUrl)}
                          style={{ height: 100, width: 200 }}
                          alt="Foreman Signature"
                        />
                      ) : foremanUrl ? (
                        <img
                          alt="Foreman Signature"
                          src={foremanUrl}
                          style={{ height: 100, width: 200 }}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="col-md-12 mt-2">
                    <h5 className="fw-normal ">Safety Inspector Signature</h5>
                    <div className="d-flex justify-content-between mt-2">
                      <SignInput
                        imageName={"SafetyInspectorSignature.png"}
                        sign={sign}
                        setSign={setSign}
                        url={url}
                        setUrl={setUrl}
                        modalId="inspectorModal"
                      />
                      {url && typeof url !== "string" ? (
                        <img
                          alt="Inspector Signature"
                          src={URL.createObjectURL(url)}
                          style={{ height: 100, width: 200 }}
                        />
                      ) : url ? (
                        <img
                          src={url}
                          style={{ height: 100, width: 200 }}
                          alt="Inspector Signature"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-12  p-0 p-md-2">
                  <div className="itemtitleBar mb-2">
                    <h4>Truck Inspection</h4>
                  </div>

                  {[
                    {
                      title: "Emergency Flashers",
                      name: "EmergencyFlashers",
                    },
                    {
                      title: "Windshield Wipers",
                      name: "WindshieldWipers",
                    },
                    {
                      title: "Horn",
                      name: "Horn",
                    },
                    {
                      title: "Mirrors",
                      name: "Mirrors",
                    },
                    {
                      title: "Seat Belts",
                      name: "SeatBelts",
                    },
                    {
                      title: "License Plate and Registration",
                      name: "LicensePlateAndRegistration",
                    },
                    {
                      title: "Fire Extinguisher",
                      name: "FireExtinguisher",
                    },
                    {
                      title: "Fluids Check",
                      name: "Fluids",
                    },
                    {
                      title: "Turn Signals",
                      name: "TurnSignals",
                    },
                    {
                      title: "Brakes",
                      name: "Brakes",
                    },
                    {
                      title: "Tires",
                      name: "TruckTires",
                    },
                    {
                      title: "Samsara Camera",
                      name: "SamsaraCamera",
                    },
                  ].map((inp, index) => (
                    <div
                      key={index}
                      className="w-100 d-flex align-items-center"
                      onClick={() => handleCheckboxChange(inp.name)}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name={inp.name}
                        checked={!!formData[inp.name]} // Ensure boolean value
                        onChange={(e) => e.stopPropagation()} // Prevent parent div from firing extra clicks
                      />
                      <h5
                        className="fw-normal"
                        style={{ marginLeft: "6px", marginTop: "7px" }}
                      >
                        {inp.title}
                      </h5>
                    </div>
                  ))}
                  <div className="col-md-9">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {" "}
                      <input
                        type="checkbox"
                        className="form-check-input"
                      />{" "}
                      <h5
                        className="fw-normal "
                        style={{ marginLeft: "13px", marginTop: "12px" }}
                      >
                        {" "}
                        Logo and overall truck appearance
                      </h5>
                    </label>

                    <TextField
                      className="form-control form-control-sm"
                      name="LogoAndOverallTruckAppearance"
                      value={formData.LogoAndOverallTruckAppearance}
                      onChange={handleInputChange}
                      size="small"
                      style={{ marginLeft: "30px" }}
                    />
                  </div>
                  <div className="col-md-9 ">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {" "}
                      <input
                        type="checkbox"
                        className="form-check-input"
                      />{" "}
                      <h5
                        className="fw-normal "
                        style={{ marginLeft: "13px", marginTop: "12px" }}
                      >
                        List any problems that need correction
                      </h5>
                    </label>
                    <TextField
                      style={{ marginLeft: "30px" }}
                      className="form-control form-control-sm"
                      name="TruckInspectionListAnyProblemsThatNeedCorrection"
                      value={
                        formData.TruckInspectionListAnyProblemsThatNeedCorrection
                      }
                      onChange={handleInputChange}
                      size="small"
                    />
                  </div>

                  <div className="itemtitleBar mb-2 mt-3">
                    <h4>Trailer Inspection (skip if no trailer)</h4>
                  </div>
                  {[
                    {
                      title: "Tow hitch ball has a lock",
                      name: "TowHitchBallHasALock",
                    },
                    {
                      title: "Trailer has safety chains connected to truck",
                      name: "TrailerHasSafetyChainsConnectedToTruck",
                    },
                    {
                      title: "Trailer is connected correctly",
                      name: "TrailerIsConnectedCorrectly",
                    },
                    {
                      title: "Turn Signals functioning correctly",
                      name: "TurnSignalsFunctioningCorrectly",
                    },
                    {
                      title: "Electrical connection correct",
                      name: "ElectricalConnectionCorrect",
                    },
                    {
                      title:
                        "Trailer has proper registration and license plate",
                      name: "TrailerHasProperRegistrationAndLicensePlate",
                    },
                    {
                      title: "Tires",
                      name: "TrailerTires",
                    },
                  ].map((inp, index) => (
                    <div
                      key={index}
                      className="w-100 d-flex align-items-center"
                      onClick={() => handleCheckboxChange(inp.name)}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name={inp.name}
                        checked={!!formData[inp.name]} // Ensures a boolean value
                        onChange={(e) => e.stopPropagation()} // Prevents event bubbling
                      />
                      <h5
                        className="fw-normal"
                        style={{ marginLeft: "6px", marginTop: "6px" }}
                      >
                        {inp.title}
                      </h5>
                    </div>
                  ))}
                  <div className="col-md-9">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <input type="checkbox" className="form-check-input" />
                      <h5
                        className="fw-normal"
                        style={{
                          marginLeft: "13px",
                          marginTop: "6px",
                          userSelect: "none",
                        }}
                      >
                        List any problems that need correction
                      </h5>
                    </label>

                    <TextField
                      style={{ marginLeft: "30px" }}
                      className="form-control form-control-sm"
                      name="TrailerInspectionListAnyProblemsThatNeedCorrection"
                      value={
                        formData.TrailerInspectionListAnyProblemsThatNeedCorrection
                      }
                      onChange={handleInputChange}
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <div className="row mt-2 mx-2">
                {/* Button */}
                <div className="col-md-3 col-lg-2">
                  <FileUploadButton onClick={trackFile} width={"max-content"}>
                    Inspection Photos
                  </FileUploadButton>
                </div>

                {/* Image Preview Section (Always Visible) */}
                <div className="col-12 mt-3">
                  <div className="d-flex flex-wrap">
                    {Files.map((file, index) => {
                      return (
                        <div
                          key={index}
                          className="col-md-2 col-md-2 mt-3 image-container"
                          style={{
                            width: "115px",
                            height: "110px",
                            margin: "1em",
                            position: "relative",
                          }}
                        >
                          {file.name.includes(".pdf") ? (
                            <div className="d-flex justify-content-center align-items-center pdf-div">
                              <BsFiletypePdf color="#ff0000" fontSize="4em" />
                            </div>
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              style={{
                                width: "115px",
                                height: "110px",
                                objectFit: "cover",
                              }}
                            />
                          )}
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
                      );
                    })}

                    {prevFiles.map((file, index) => {
                      return (
                        <div
                          key={index}
                          className="col-md-2 col-md-2 mt-3 image-container"
                          style={{
                            width: "115px",
                            height: "110px",
                            margin: "1em",
                            position: "relative",
                          }}
                        >
                          <a
                            href={`${baseUrl}/${file.FilePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {file.FileName.includes(".pdf") ? (
                              <div className="d-flex justify-content-center align-items-center pdf-div">
                                <BsFiletypePdf color="#ff0000" fontSize="4em" />
                              </div>
                            ) : (
                              <img
                                src={`${baseUrl}/${file.FilePath}`}
                                style={{
                                  width: "115px",
                                  height: "110px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
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
                          >
                            {" "}
                            {file.FileName}
                          </p>
                          <span
                            className="file-delete-button"
                            style={{
                              left: "90px",
                            }}
                            onClick={() =>
                              handleDeleteUploadedFile(
                                file.SafetyFormFileId,
                                index
                              )
                            }
                          >
                            <span>
                              <Delete color="error" />
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="row m-2 mb-3">
                <div className="col-6 col-md-4 ps-0 mt-2 ">
                  {" "}
                  <div className="ms-2">
                    <BackButton
                      onClick={() => {
                        navigate(`/safety-reports/list`);
                      }}
                    >
                      Back
                    </BackButton>
                  </div>
                </div>
                <div className="col-6 col-md-8 ps-0 mt-2  text-end">
                  {idParam ? (
                    <>
                      <PrintButton
                        varient="mail"
                        onClick={() => {
                          navigate(
                            `/send-mail?title=${"Safety Reports"}&mail=${customerMail}&number=${""}`
                          );
                          setselectedPdf([])
                        }}
                      >
                        <Email />
                      </PrintButton>

                      <PrintButton
                        varient="print"
                        onClick={() => {
                          navigate(`/safety-reports/preview?id=${idParam}`);
                        }}
                      ></PrintButton>
                    </>
                  ) : (
                    <></>
                  )}

                  <LoaderButton
                    loading={disableButton}
                    handleSubmit={handleSubmit}
                  >
                    Save
                  </LoaderButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default SafetyForm;
