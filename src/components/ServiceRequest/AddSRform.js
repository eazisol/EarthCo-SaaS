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
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Grid,
} from "@mui/material";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import { Delete, Create } from "@mui/icons-material";
import { Button } from "@mui/material";
import useDeleteFile from "../Hooks/useDeleteFile";
import { useLocation, useNavigate } from "react-router-dom";
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
import SprayTechForm from "./SprayTechForm";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SRPdf from "./SRPdf";
import SprayTechPdf from "./SprayTechPdf";
import { pdf } from "@react-pdf/renderer";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import MultiSelectAutocomplete from "../Reusable/MultiSelectAutocomplete";
import ObjectCompare from "../../custom/ObjectCompare";
import useGetActivityLog from "../Hooks/useGetActivityLog";
import ActivityLog from "../Reusable/ActivityLog";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import formatAmount from "../../custom/FormatAmount";
import { BsFiletypePdf } from "react-icons/bs";
import imageCompresser from "../../custom/ImageCompresser";
import useGetData from "../Hooks/useGetData";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import useMenuAccess from "../Hooks/useMenuAccess";

const AddSRform = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const addParam = queryParams.get("add");

  // Get menu access permissions
  const menuAccess = useMenuAccess();
  
  // Determine if this is edit mode (has idParam)
  const isEditMode = !!(idParam && idParam !== 0);

  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();
  const { getLogs, activityLogs } = useGetActivityLog();

  const {
    sRMapData,
    setSRMapData,
    PunchListData,
    setPunchListData,
    loggedInUser,
    setselectedPdf,
    selectedPdf,
    selectedImages,
    setSelectedImages,
    companyInfo,
    dynamicColorAndLogo
  } = useContext(DataContext);
  const daysOfWeek = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 7, name: "Sunday" },
  ];
  const monthDates = Array.from({ length: 31 }, (_, i) => ({
    id: i + 1,
    label: `${i + 1}`,
  }));

  const monthsOfYear = [
    { id: 1, label: "January" },
    { id: 2, label: "February" },
    { id: 3, label: "March" },
    { id: 4, label: "April" },
    { id: 5, label: "May" },
    { id: 6, label: "June" },
    { id: 7, label: "July" },
    { id: 8, label: "August" },
    { id: 9, label: "September" },
    { id: 10, label: "October" },
    { id: 11, label: "November" },
    { id: 12, label: "December" },
  ];

  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { deleteSRFile } = useDeleteFile();

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

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusChecked, setStatusChecked] = useState(
    addParam === "true" || addParam === true ? true : false
  );
  const [SRData, setSRData] = useState({
    ServiceRequestData: {
      ServiceRequestId: idParam,
      CustomerId: 0,
      ServiceRequestNumber: "",
      SRTypeId:
      addParam === "true" || addParam === true ?9: loggedInUser.userRole == 6 ? 8 : loggedInUser.userRole == 5 ? 3 : 1,
      SRStatusId: 1,
      Assign: "",
      WorkRequest: "",
      ActionTaken: "",
      tblSRItems: [],
      tblServiceRequestLatLongs: [],
    },
  });
  const [initialFormData, setInitialFormData] = useState({
    ServiceRequestData: {
      ServiceRequestId: idParam,
      CustomerId: 0,
      ServiceRequestNumber: "",
      SRTypeId:
      addParam === "true" || addParam === true ?9: loggedInUser.userRole == 6 ? 8 : loggedInUser.userRole == 5 ? 3 : 1,
      SRStatusId: 1,
      Assign: "",
      WorkRequest: "",
      ActionTaken: "",
      tblSRItems: [],
      tblServiceRequestLatLongs: [],
    },
  });

  const [sTechItems, setSTechItems] = useState([]);
  const [RepeatIntervalList, setRepeatIntervalList] = useState([]);
  const [sideData, setSideData] = useState({
    Hours: 0,
    isTurf: false,
    isShrubs: false,
    isParkways: false,
    isTrees: false,
    Ounces: "",
    Pounds: "",
    Other: "",
  });

  const [recurringData, setRecurringData] = useState({
    RecurringTemplateTypeId: 1,
    CustomerId: null,
    ForemanId: "",
    TemplateName: "",
    StartDate: "",
    EndDate: "",
    RepeatIntervalId: "",
    Day: "",
    YearMonth: "",
    RepeatEvery: 1,
    statusChecked: false,
    repeatType: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (PunchListData) {
      setSRData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: PunchListData.CustomerId,
          CustomerDisplayName: PunchListData.CustomerDisplayName,
          WorkRequest: PunchListData.WorkRequest,
        },
      }));
      setRegionalManagers([PunchListData.RegionalManagerId]);
      setInitialFormData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: PunchListData.CustomerId,
          CustomerDisplayName: PunchListData.CustomerDisplayName,
          WorkRequest: PunchListData.WorkRequest,
        },
      }));
    }

    if (PunchListData.ItemData) {
      setTblSRItems(PunchListData.ItemData);

      fetchStaffList();
      fetctContacts(PunchListData.CustomerId);
    }

    if (PunchListData.PhotoPath) {
      setPrevFiles((prevState) => [
        ...prevState,

        { FilePath: PunchListData.PhotoPath, FileName: "PunchList photo" },

        // { FilePath: PunchListData.AfterPhotoPath? PunchListData.AfterPhotoPath : null , FileName : "PunchList after photo"},
      ]);
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

  const { getListData } = useGetData();

  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const [regionalManagers, setRegionalManagers] = useState([]);

  const [submitClicked, setSubmitClicked] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  const inputFile = useRef(null);

  const handleImageSelect = (image) => {
    // Check if the image is already selected
    const isSelected = selectedImages.some(
      (selectedImage) => selectedImage.SRFileId === image.SRFileId
    );

    if (isSelected) {
      // If already selected, remove it from the selectedImages state
      setSelectedImages((prevSelectedImages) =>
        prevSelectedImages.filter(
          (selectedImage) => selectedImage.SRFileId !== image.SRFileId
        )
      );
    } else {
      // If not selected, add it to the selectedImages state
      setSelectedImages((prevSelectedImages) => [...prevSelectedImages, image]);
    }
  };

  const fetchServiceLocations = async (id) => {
    if (!id) {
      return;
    }
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
  const [selectedContact, setSelectedContact] = useState("");

  const fetctContacts = async (id) => {
    if (!id) {
      return;
    }
    axios
      .get(`${baseUrl}/api/Customer/GetCustomerContact?id=${id}`, { headers })
      .then((res) => {
        setContactList(res.data);
        res.data.forEach((element) => {
          if (SRData.ServiceRequestData.ContactId === element.ContactId) {
            setSelectedContact(element.FirstName);
          }
        });
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
    // fetchName(SRData.ServiceRequestData.CustomerId, () => {
    //   setLoading(false);
    // });

    // SRData.ServiceRequestData.ContactId &&
    // SRData.ServiceRequestData.ServiceLocationId &&
    // SRData.ServiceRequestData.Assign
    //   ? setDisableSubmit(false)
    //   : setDisableSubmit(true);
  }, [SRData.ServiceRequestData.CustomerId]);

  const [colorTypeList, setColorTypeList] = useState([]);
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

  const fetchSRTypes = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestTypes`,
        { headers }
      );

      let filteredSRTypes = res.data; // Initialize with the original data

      if (loggedInUser.userRole == 5) {
        filteredSRTypes = res.data.filter((option) => option.SRTypeId === 3);
      }
      if (loggedInUser.userRole == 6) {
        filteredSRTypes = res.data.filter((option) => option.SRTypeId === 8);
      }

      setSRTypes(filteredSRTypes);
    } catch (error) {}
    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequest?id=${idParam}`,
        { headers }
      );
      if (response.data?.RecurringTemplateData) {
        const rec = response.data.RecurringTemplateData;

        setStatusChecked(true);
        setRecurringData((prev) => ({
          ...prev,
          TemplateName: rec.TemplateName || "",
          StartDate: rec.StartDate ? rec.StartDate.split("T")[0] : "",
          EndDate: rec.EndDate ? rec.EndDate.split("T")[0] : "",
          RepeatEvery: rec.RepeatEvery || 1,
          RepeatIntervalId: rec.RepeatIntervalId || "",
          Day: rec.Day || "",
          YearMonth: rec.YearMonth || "",
          statusChecked: true,
        }));
      }
      console.log(" ServiceRequest API response:", response.data);
    } catch (error) {
      console.error(" Error fetching ServiceRequest:", error);
    }
  };

  const fetchSRColorTypes = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestColorTypes`,
        { headers }
      );

      setColorTypeList(res.data);
    } catch (error) {
      console.log("error fetching SR color types", error);
    }
  };

  const handlePopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
  };

  const handleCustomerAutocompleteChange = (event, newValue) => {
    setBtnDisable(false);
    if (newValue) {
      setSRData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: newValue.UserId,
          CustomerDisplayName: newValue.DisplayName,
        },
      }));
      getListData(
        `/SyncQB/CheckSync?QBID=${newValue.QBId}&Type=Customer&CompanyId=${loggedInUser.CompanyId}`,
        (id) => {
          setBtnDisable(false);
        },
        (err) => {
          console.log("check error", err);
          setBtnDisable(true);
          handlePopup(true, "error", "This Customer is Inactive");
          // setOpenSnackBar(true);
          // setSnackBarColor("error");
          // setSnackBarText("error changing Sale Price");
        }
      );
    } else {
      // Handle the case where newValue is null (for example, clear CustomerId and CustomerDisplayName)
      setSRData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: null,
          CustomerDisplayName: "",
        },
      }));
    }
  };
  const [showMap, setShowMap] = useState(true);

  const handleSLAutocompleteChange = (event, newValue) => {
    setShowMap(false);
    const simulatedEvent = {
      target: {
        name: "ServiceLocationId",
        value: newValue ? newValue.ServiceLocationId : "",
      },
    };
    if (newValue && newValue.lat && newValue.lng) {
      const newMarker = { lat: newValue.lat, lng: newValue.lng };
      setSRMapData([newMarker]);
      setTimeout(() => {
        setShowMap(true);
      }, 100);
    } else {
    }
    console.log("service locations is", newValue);
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
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
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
      fetchServiceLocations(value);
      fetctContacts(value);
    }

    if (name === "SRTypeId") {
      if (Number(value) === 3) {
        setSRData((prevData) => ({
          ServiceRequestData: {
            ...prevData.ServiceRequestData,
            WorkRequest: "Irrigation was repaired.",
          },
        }));
      } else if (Number(value) === 8) {
        setSRData((prevData) => ({
          ServiceRequestData: {
            ...prevData.ServiceRequestData,
            WorkRequest: "Sprayed herbicide for weed control.",
          },
        }));
      }
    }
  };

  const submitMapData = async (id) => {
    const formData = new FormData();

    const updatedData = sRMapData.map((contact) => ({
      ...contact,
      ServiceRequestId: id,
      ControllerPhoto: contact.ControllerPhoto
        ? contact.ControllerPhoto
        : new Blob(
            [
              new Uint8Array(
                atob("R0lGODlhAQABAAAAACwAAAAAAQABAAA=")
                  .split("")
                  .map((c) => c.charCodeAt(0))
              ),
            ],
            { type: "image/gif" }
          ),
    }));

    formData.append("LatLongData", JSON.stringify(updatedData));
    formData.append("ServiceRequestId", JSON.stringify(id));
    updatedData.forEach((file) => {
      formData.append("Files", file.ControllerPhoto);
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };
    for (let [key, value] of formData.entries()) {
      console.log("map payload", key, value);
    }
    // return
    try {
      const response = await axios.post(
        `${baseUrl}/api/ServiceRequest/AddServiceRequestLatLong`,
        formData,
        {
          headers,
        }
      );

      // Handle successful submission
      // window.location.reload();
      setTimeout(() => {
        // window.location.reload();
        setBtnDisable(false);
        setSubmitClicked(false);
        setLoadingButton(false);
      }, 1500);
    } catch (error) {}
    for (let [key, value] of formData.entries()) {
      console.log("filessss", key, value);
    }
  };

  const submitHandler = async () => {
    // Check permissions before submitting
    if (isEditMode) {
      // Updating existing service request - need edit access
      if (!menuAccess.isLoading && !menuAccess.canEdit) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update service requests");
        setLoadingButton(false);
        return;
      }
    } else {
      // Creating new service request - need create access
      if (!menuAccess.isLoading && !menuAccess.canCreate) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create service requests");
        setLoadingButton(false);
        return;
      }
    }

    console.log("SUBMIT clicked");
    // await handleMainButtonClick(false);
    // if (ObjectCompare(initialFormData, SRData)) {
    //   console.log("data  matched initialFormData", initialFormData)
    //   console.log("data  matched SRData", SRData)
    // }else{
    //   console.log("data not matched initialFormData", initialFormData)
    //   console.log("data not matched SRData", SRData)

    // }
    // return
    setSubmitClicked(true);

    if (
      !SRData.ServiceRequestData.CustomerId ||
      regionalManagers.length <= 0 ||
      selectedContacts.length <= 0
    ) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");

      return;
    }

    // Validate recurring fields if Make Recurring is checked
    if (statusChecked) {
      if (
        !recurringData.TemplateName ||
        !recurringData.StartDate ||
        !recurringData.RepeatEvery ||
        !recurringData.RepeatIntervalId
      ) {
        setEmptyFieldsError(true);
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("Please fill all required recurring fields");

        return;
      }

      // Check if Day is required for Weekly or Monthly intervals
      const selectedRepeat = RepeatIntervalList.find(
        (r) => r.RepeatIntervalId === recurringData.RepeatIntervalId
      );
      if (
        (selectedRepeat?.Repeat === "Weekly" ||
          selectedRepeat?.Repeat === "Monthly" ||
          selectedRepeat?.Repeat === "Yearly") &&
        !recurringData.Day
      ) {
        setEmptyFieldsError(true);
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText(
          "Please select repeat day/date for the chosen interval"
        );

        return;
      }
      if (selectedRepeat?.Repeat === "Yearly" && !recurringData.YearMonth) {
        setEmptyFieldsError(true);
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("Please select repeat month for yearly interval");
        return;
      }
    }
    if (!SRData.ServiceRequestData.ServiceLocationId) {
      if (
        SRData.ServiceRequestData.SRTypeId !== 8 &&
        SRData.ServiceRequestData.SRTypeId !== 3
      ) {
        setEmptyFieldsError(true);
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("Please fill all required fields");

        return;
      }
    }
    setLoadingButton(true);
    setBtnDisable(true);
    const formData = new FormData();

    const contactIdArray = selectedContacts.map((contact) => ({
      ContactId: contact,
    }));
    const assignArray = regionalManagers.map((contact) => ({
      AssignId: contact,
    }));
    const itemArray = tblSRItems.map((item) => ({
      ...item,
      Rate: item.Rate ? parseFloat(item.Rate) : 0,
      Qty: item.Qty ? parseFloat(item.Qty) : 0,
      Amount: item.Amount ? parseFloat(item.Amount) : 0,
    }));
    SRData.ServiceRequestData.CustomerId = Number(
      SRData.ServiceRequestData.CustomerId
    );
    SRData.ServiceRequestData.tblSRItems = itemArray;
    SRData.ServiceRequestData.ContactId = selectedContacts[0];
    SRData.ServiceRequestData.Assign = regionalManagers[0];
    SRData.ServiceRequestData.tblServiceRequestContacts = contactIdArray;
    SRData.ServiceRequestData.tblServiceRequestAssigns = assignArray;
    // SRData.ServiceRequestData.tblServiceRequestLatLongs = sRMapData;
    SRData.ServiceRequestData.tblServiceRequestSprayTechItems = sTechItems;
    SRData.ServiceRequestData.tblServiceRequestSprayTeches =
      sideData == null ? [] : [sideData];

    //  return
    formData.append(
      "ServiceRequestData",
      JSON.stringify(SRData.ServiceRequestData)
    );

    if (recurringData.statusChecked || statusChecked) {
      // Get the selected repeat interval to determine if Day is needed
      const selectedRepeat = RepeatIntervalList.find(
        (r) => r.RepeatIntervalId === recurringData.RepeatIntervalId
      );
      const isWeekly = selectedRepeat && selectedRepeat.Repeat === "Weekly";
      const isMonthly = selectedRepeat && selectedRepeat.Repeat === "Monthly";
      const isYearly = selectedRepeat && selectedRepeat.Repeat === "Yearly";

      const recurringTemplateData = {
        ServiceRequestId: SRData?.ServiceRequestData?.ServiceRequestId || 0,
        isTemplate: 1,
        TemplateName: recurringData.TemplateName || "",
        StartDate: recurringData.StartDate || null,
        EndDate: recurringData.EndDate || null,
        RepeatEvery: Number(recurringData.RepeatEvery) || 1,
        RepeatIntervalId: Number(recurringData.RepeatIntervalId) || null,
        ...(isWeekly || isMonthly || isYearly
          ? { Day: Number(recurringData.Day) || null }
          : {}),
        ...(isYearly
          ? { YearMonth: Number(recurringData.YearMonth) || null }
          : {}),
      };

      console.log("RecurringTemplateData being sent:", recurringTemplateData);

      formData.append(
        "RecurringTemplateData",
        JSON.stringify(recurringTemplateData)
      );
    }

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    files.forEach((file) => {
      formData.append("Files", file);
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };
    for (let [key, value] of formData.entries()) {
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/ServiceRequest/AddServiceRequest`,
        formData,
        {
          headers,
        }
      );

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      // setSubmitClicked(false);
      // setLoadingButton(false);
      submitMapData(response.data.Id);

      navigate(statusChecked ? "/RecurringSR-list" : "/service-requests");

      // setBtnDisable(false);

      // Handle successful submission
      // window.location.reload();
    } catch (error) {
      setSubmitClicked(false);
      setLoadingButton(false);
      setBtnDisable(false);
      // setErrorMessage(error?.response?.data);
      setError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
      setSnackBarText(
        typeof error.response.data === "object"
          ? error.response.data.Message || JSON.stringify(error.response.data)
          : error.response.data
      );
    }
    for (let [key, value] of formData.entries()) {
    }
  };

  const removeItem = (index) => {
    const newItems = [...tblSRItems];
    newItems.splice(index, 1);
    setTblSRItems(newItems);
  };

  const trackFile = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const compressedImg = await imageCompresser(uploadedFile);
      setFiles((prevFiles) => [...prevFiles, compressedImg]);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  const [PrevFiles, setPrevFiles] = useState([]);
  const [sRPreviewData, setSRPreviewData] = useState({});
  const fetchSR = async () => {
    if (idParam === 0) {
      setLoading(false);
      return;
    }
    getLogs(idParam, "ServiceRequest");

    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequest?id=${idParam}`,
        { headers }
      );

      setSRPreviewData(response.data);
      setSRMapData(response.data.LatLongData);

      setSRData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: response.data.Data.CustomerId,
          ...response.data.Data,
        },
      }));
      setInitialFormData((prevData) => ({
        ServiceRequestData: {
          ...prevData.ServiceRequestData,
          CustomerId: response.data.Data.CustomerId,
          ...response.data.Data,
        },
      }));

      setSideData(response.data.SRSTData[0]);
      setSTechItems(
        response.data.SRSTIData == null ? [] : response.data.SRSTIData
      );

      setSelectedContacts(
        response.data.ContactData.map((contact) => contact.ContactId)
      );

      setRegionalManagers(
        response.data.AssignData.map((contact) => contact.AssignId)
      );

      // Set the tblSRItems state with the response.data.tblSRItems
      setTblSRItems(response?.data.ItemData);

      setSelectedImages(response.data.FileData);
      setPrevFiles(response.data.FileData);

      setLoading(false);
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

  // items..........

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [showItem, setShowItem] = useState(true);
  const [itemBtnDisable, setItemBtnDisable] = useState(true);
  const [modalLoding, setModalLoading] = useState(false);
  const inputRef = useRef(null);
  const getItems = () => {
    axios
      .get(`${baseUrl}/api/Item/GetSearchItemList?Search=${searchText}`, {
        headers,
      })
      .then((response) => {
        setSearchResults(response.data);
      })
      .catch((error) => {
        console.error("Error fetching itemss data:", error);
      });
  };
  useEffect(() => {
    getItems();
  }, [searchText]);

  const handleItemChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleAddItem = () => {
    const newItem = { ...itemInput };
    if (!newItem.ItemId) {
      return;
    }
    const newAmount = newItem.Qty * newItem.Rate;
    newItem.Amount = newAmount;

    setTblSRItems([...tblSRItems, newItem]);
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
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSearchText(item.ItemName);
    setBtnDisable(false);
    getListData(
      `/SyncQB/CheckSync?QBID=${item.QBId}&Type=Item&CompanyId=${loggedInUser.CompanyId}`,
      (id) => {
        // setBtnDisable(false);
      },
      (err) => {
        console.log("check error", err);
        // setBtnDisable(true);
        setTblSRItems([...tblSRItems.slice(0, -1)]);
        handlePopup(true, "error", "This Item is Inactive");
        // setOpenSnackBar(true);
        // setSnackBarColor("error");
        // setSnackBarText("error changing Sale Price");
      }
    );
    setItemInput({
      ...itemInput,
      ItemId: item.ItemId,
      Name: item.ItemName,
      Description: item.SaleDescription,
      Rate: item.SalePrice,
      PurchasePrice: item.PurchasePrice,
    });
    setTblSRItems([
      ...tblSRItems,
      {
        ...itemInput,
        ItemId: item.ItemId,
        Name: item.ItemName,
        Description: item.SaleDescription,
        Rate: item.SalePrice,
        PurchasePrice: item.PurchasePrice,
      },
    ]);
    setShowItem(false);
    setSearchResults([]); // Clear the search results
    itemInput.ItemId && setItemBtnDisable(false);
    setItemInput({
      Name: "",
      Qty: 1,
      Description: "",
      Rate: 0,
      PurchasePrice: 0,
    });
  };

  const quantityInputRef = useRef(null);
  useEffect(() => {
    if (quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  }, [tblSRItems.length]);

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
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = tblSRItems.map((item, index) => {
        if (index === itemId) {
          const updatedItem = { ...item };
          updatedItem.Qty = inputValue; // Keep input value as string for display

          // Calculate amount if input is a valid number
          const parsedQty = parseFloat(inputValue);
          updatedItem.Amount = !isNaN(parsedQty)
            ? parsedQty * updatedItem.Rate
            : 0;

          return updatedItem;
        }
        return item;
      });

      setTblSRItems(updatedItems);
    }
  };

  const handleRateChange = (itemId, event) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^-?[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = tblSRItems.map((item, index) => {
        if (index === itemId) {
          const updatedItem = { ...item };
          updatedItem.Rate = inputValue; // Keep input value as string for display

          // Calculate amount if input is a valid number
          const parsedQty = parseFloat(inputValue);
          updatedItem.Amount = !isNaN(parsedQty)
            ? parsedQty * updatedItem.Rate
            : 0;

          return updatedItem;
        }
        return item;
      });

      setTblSRItems(updatedItems);
    }
  };

  useEffect(() => {
    fetchSRTypes();
    fetchSRColorTypes();
    fetchStaffList();
  }, []);

  // fileAdd

  const handleMainButtonClick = async (
    navigat = true,
    copyToEstimate = false
  ) => {
    try {
      const DocumentComponent =
        SRData.ServiceRequestData.SRTypeId === 8 ? SprayTechPdf : SRPdf;
      const documentProps =
        SRData.ServiceRequestData.SRTypeId === 8
          ? {
              sRPreviewData: {
                ...{ Data: SRData.ServiceRequestData },
                name: SRData.ServiceRequestData.CustomerCompanyName,
                SRSTData: [sideData],
                SRSTIData: sTechItems,
                companyInfo: companyInfo,
              },
            }
          : {
              data: {
                ...{ Data: SRData.ServiceRequestData },
                name: SRData.ServiceRequestData.CustomerCompanyName,
                companyInfo: companyInfo,
              },
            };

      // Generate the PDF document
      const blob = await pdf(<DocumentComponent {...documentProps} />).toBlob();

      // Create a File object from the blob
      const pdfFile = new File(
        [blob],
        SRData.ServiceRequestData.SRTypeId === 8
          ? `Spray Tech_${SRData.ServiceRequestData.ServiceRequestNumber}.pdf`
          : `Service Request_${SRData.ServiceRequestData.ServiceRequestNumber}.pdf`,
        {
          type: "application/pdf",
        }
      );

      // Store the File object in state
      setselectedPdf(pdfFile); // Now, pdfBlob is a File object with a name and type
      if (copyToEstimate) {
        setPunchListData({
          ServiceRequestId: SRData.ServiceRequestData.ServiceRequestId,
          ServiceRequestNumber: SRData.ServiceRequestData.ServiceRequestNumber,
          CustomerId: SRData.ServiceRequestData.CustomerId,
          RegionalManagerId: SRData.ServiceRequestData.Assign,
          ServiceLocationId: SRData.ServiceRequestData.ServiceLocationId,
          EstimateNotes: SRData.ServiceRequestData.WorkRequest,
          CustomerDisplayName: SRData.ServiceRequestData.CustomerDisplayName,
          FilesData: PrevFiles,
          ContactIds: selectedContacts,
          isCreatedFromServiceRequest: true,
          ItemData: tblSRItems.map((items) => ({
            ...items,
            isCost: false,
            IsApproved: true,
          })),
        });
        navigate(`/estimates/add-estimate`);
        return;
      }

      if (navigat) {
        navigate(
          `/send-mail?title=${"Service Request"}&mail=${contactEmail}&customer=${
            SRData.ServiceRequestData.CustomerCompanyName
          }&number=${SRData.ServiceRequestData.ServiceRequestNumber}&isOpen=${
            SRData.ServiceRequestData.SRStatusId === 1 ? "Open" : "Closed"
          }&contact=${selectedContact}&id=${idParam}`
        );
      } else {
        setFiles((prevFiles) => {
          const updatedFiles = [...prevFiles, pdfFile]; // Assuming newEntry is the new file you want to append
          return updatedFiles; // Return the updated files array
        });
      }
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };

  const handleConfirm = async () => {
    setModalLoading(true);
    try {
      await handleMainButtonClick(false, true); // wait for it to complete
      setModalOpen(false); // close modal *after* it’s done
    } catch (err) {
      console.error("Error in confirmation:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // Only scheduled, so always true
  const isScheduled = true;
  const selectedRepeat = RepeatIntervalList.find(
    (r) => r.RepeatIntervalId === recurringData.RepeatIntervalId
  );
  const isWeekly = selectedRepeat && selectedRepeat.Repeat === "Weekly";
  const isMonthly = selectedRepeat && selectedRepeat.Repeat === "Monthly";
  const isYearly = selectedRepeat && selectedRepeat.Repeat === "Yearly";
  const isDaily = selectedRepeat && selectedRepeat.Repeat === "Daily";

  useEffect(() => {
    if (!RepeatIntervalList || RepeatIntervalList.length === 0) {
      setRepeatIntervalList([
        { RepeatIntervalId: 1, Repeat: "Daily" },
        { RepeatIntervalId: 2, Repeat: "Weekly" },
        { RepeatIntervalId: 3, Repeat: "Monthly" },
        { RepeatIntervalId: 4, Repeat: "Yearly" },
      ]);
    }
  }, []);

  const repeatType = selectedRepeat?.Repeat;

  const handleRecurringChange = (e) => {
    const { name, value } = e.target;

    // Special validation for RepeatEvery field
    if (name === "RepeatEvery") {
      // Only allow positive numbers and limit to 10 characters
      const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      if (
        numericValue.length <= 10 &&
        (numericValue === "" || parseInt(numericValue) > 0)
      ) {
        setRecurringData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setRecurringData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <TitleBar
        icon={icon}
        title={
          addParam === "true" || addParam === true
            ? `Add Recurring SR`
            : `Add Service Request  ${
                SRData.ServiceRequestData.Type
                  ? " - " + SRData.ServiceRequestData.Type
                  : ""
              }`
        }
      />
      {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>Read-only mode:</strong> You don't have permission to update this service request. You can view the information but cannot make changes.
        </div>
      )}
      {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>No create access:</strong> You don't have permission to create new service requests.
        </div>
      )}
      <ConfirmationModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        title="Confirmation"
        description={
          <>
            If you confirm, a new estimate will be created using the Service
            Request data and items. All files with
            <strong> pre-selected checkboxes</strong> will be included. You may
            deselect any files before proceeding.
          </>
        }
        onConfirm={handleConfirm}
        loading={modalLoding}
        disabled={modalLoding}
      />
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
                {SRData.ServiceRequestData.isDelete && (
                  <div class="alert alert-danger w-100 mb-0" role="alert">
                    This Service request has been deleted
                  </div>
                )}
                <div className="">
                  <div className="">
                    <div style={{ display: "flex" }} className="itemtitleBar ">
                      <div style={{ width: "50%" }}>
                        <h4>Service Request Details</h4>
                      </div>
                      <div style={{ width: "50%" }} className=" text-end">
                        {SRData.ServiceRequestData.EstimateId ? (
                          <NavLink
                            to={`/estimates/add-estimate?id=${SRData.ServiceRequestData.EstimateId}`}
                          >
                            <p
                              style={{ textDecoration: "underline" }}
                              className="text-black"
                            >
                              Estimate#{" "}
                              {SRData.ServiceRequestData.EstimateNumber}
                            </p>
                          </NavLink>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                    <div
                      className=" card-body"
                      style={{ position: "relative" }}
                    >
                      {loggedInUser.userRole == "1" ||
                        (loggedInUser.userRole == "5" ||
                        loggedInUser.userRole == "6" ||
                        loggedInUser.userRole == "4" ? (
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
                            getOptionLabel={(option) =>
                              option.DisplayName
                                ? option.DisplayName
                                : option.DisplayName || ""
                            }
                            value={
                              SRData.ServiceRequestData.CustomerDisplayName
                                ? {
                                    DisplayName:
                                      SRData.ServiceRequestData
                                        .CustomerDisplayName,
                                  }
                                : null
                            }
                            onChange={handleCustomerAutocompleteChange}
                            isOptionEqualToValue={(option, value) =>
                              option.UserId === value.CustomerId
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
                            renderOption={(props, option) => (
                              <li {...props}>
                                <div className="customer-dd-border">
                                  <h6>
                                    #{option.UserId} - {option.DisplayName}
                                  </h6>
                                  <small> {option.CompanyName}</small>
                                </div>
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label=""
                                onChange={(e) => {
                                  fetchCustomers(e.target.value);
                                  setSRData((prevData) => ({
                                    ServiceRequestData: {
                                      ...prevData.ServiceRequestData,
                                      CustomerDisplayName: e.target.value,
                                    },
                                  }));
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
                                {SRData.ServiceRequestData.SRTypeId == 3 ||
                                SRData.ServiceRequestData.SRTypeId == 8 ? (
                                  <></>
                                ) : (
                                  <span className="text-danger">*</span>
                                )}
                              </label>
                            </div>
                            <div className="col-md-3">
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
                            options={sLList || []}
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
                            options={contactList || []}
                            getOptionLabel={(option) =>
                              option.FirstName + " " + option.LastName || ""
                            }
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
                        {/* <div className="col-xl-3 col-md-4">
                        
                          <label className="form-label">
                            Assign / Appointment:
                            <span className="text-danger">*</span>
                          </label>
                          <Autocomplete
                            id="staff-autocomplete"
                            size="small"
                            options={staffData.filter(
                              (staff) =>
                                staff.Role === "Regional Manager" ||
                                staff.Role === "Irrigator" ||
                               staff.UserId === 9517 ||
                                staff.UserId === 3252 ||
                                staff.UserId === 6146
                            )}
                            getOptionLabel={(option) =>
                              option.FirstName + " " + option.LastName || ""
                            }
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
                                      <h6 className="pb-0 mb-0">
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
                                error={
                                  submitClicked &&
                                  !SRData.ServiceRequestData.Assign
                                }
                                placeholder="Choose..."
                                className="bg-white"
                              />
                            )}
                          />
                        </div> */}
                        <div className="col-md-3">
                          <MultiSelectAutocomplete
                            options={staffData.filter(
                              (staff) =>
                                staff.Role === "Regional Manager" ||
                                staff.Role === "Account Manager" ||
                                staff.Role === "Irrigator" ||
                                staff?.isSuperAdmin
                            )}
                            property="Assign"
                            label="Assign / Appointment:"
                            selectedOptions={regionalManagers}
                            setSelectedOptions={setRegionalManagers}
                            fullList={staffData}
                            error={submitClicked}
                          />
                        </div>
                      </div>

                      <div className="row  mt-2 ">
                        <div className="col-md-3">
                          <label className="form-label">
                            Service Request Number
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
                              onChange={(e) => {
                                handleInputChange(e);
                              }}
                              size="small"
                            >
                              <MenuItem value=""></MenuItem>
                              {sRTypes.map((type) => (
                                <MenuItem
                                  key={type.SRTypeId}
                                  value={type.SRTypeId}
                                  onClick={() => {
                                    setSRData((prevData) => ({
                                      ServiceRequestData: {
                                        ...prevData.ServiceRequestData,
                                        Type: type.Type,
                                      },
                                    }));
                                  }}
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
                      </div>
                    </div>
                    <div className="row mx-1 mb-3">
                      <div
                        style={{ position: "relative" }}
                        className="col-lg-3 col-md-3 "
                      >
                        {loggedInUser.userRole == "5" ||
                        loggedInUser.userRole == "6" ? (
                          <>
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
                          </>
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
                      {(addParam === "true" || addParam === true||recurringData.statusChecked||statusChecked) && (
                        <div className="col-lg-3 col-md-3 d-flex justify-content-start align-items-center mt-3 pl-2">
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={statusChecked}
                                value={recurringData.statusChecked}
                                onChange={(e) =>
                                  setStatusChecked(e.target.checked)
                                }
                              />
                            }
                            label="Make Recurring"
                            labelPlacement="end"
                            sx={{
                              gap: 1,
                              "& .MuiFormControlLabel-label": { ml: 1 },
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {statusChecked && (
                  <div className="">
                    <div style={{ display: "flex" }} className="itemtitleBar ">
                      <div style={{ width: "50%" }}>
                        <h4>Recurring Interval</h4>
                      </div>
                    </div>
                    <div
                      className=" card-body"
                      style={{ position: "relative" }}
                    >
                      {loggedInUser.userRole == "1" ||
                        (loggedInUser.userRole == "5" ||
                        loggedInUser.userRole == "6" ||
                        loggedInUser.userRole == "4" ? (
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
                        <div className=" mb-2 col-md-2 ">
                          <div className="row">
                            <div className="col-md-auto">
                              <label className="form-label">
                                Schedule Name
                                <span className="text-danger">*</span>
                              </label>
                              <TextField
                                name="TemplateName"
                                value={recurringData.TemplateName || ""}
                                onChange={handleRecurringChange}
                                placeholder="Enter template name"
                                size="small"
                                fullWidth
                                className="bg-white"
                                error={
                                  submitClicked &&
                                  statusChecked &&
                                  !recurringData.TemplateName
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-2">
                          <label
                            className="form-label"
                            style={{ color: "#989898" }}
                          >
                            Start Date<span className="text-danger">*</span>
                          </label>
                          <TextField
                            type="date"
                            className="form-control"
                            name="StartDate"
                            size="small"
                            value={recurringData.StartDate || ""}
                            onChange={handleRecurringChange}
                            error={
                              submitClicked &&
                              statusChecked &&
                              !recurringData.StartDate
                            }
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">
                            End date
                          </label>
                          <TextField
                            type="date"
                            className="form-control"
                            name="EndDate"
                            size="small"
                            value={recurringData.EndDate || ""}
                            onChange={handleRecurringChange}
                            // error={
                            //   submitClicked &&
                            //   statusChecked &&
                            //   !recurringData.EndDate
                            // }
                          />
                        </div>
                        <div className=" col-md-2">
                          <label className="form-label">
                            Repeat Every<span className="text-danger">*</span>
                          </label>
                          <TextField
                            type="text"
                            inputProps={{ maxLength: 10 }}
                            name="RepeatEvery"
                            value={recurringData.RepeatEvery ?? ""}
                            onChange={handleRecurringChange}
                            placeholder="Enter Repeat Every"
                            size="small"
                            fullWidth
                            className="bg-white"
                            error={
                              submitClicked &&
                              statusChecked &&
                              !recurringData.RepeatEvery
                            }
                          />
                        </div>
                        <div className=" col-md-2">
                          <label className="form-label">
                            Repeat Interval
                            <span className="text-danger">*</span>
                          </label>
                          <Autocomplete
                            id="inputStateRepeat"
                            size="small"
                            options={RepeatIntervalList || []}
                            getOptionLabel={(option) => option.Repeat || ""}
                            value={
                              RepeatIntervalList.find(
                                (opt) =>
                                  opt.RepeatIntervalId ===
                                  recurringData.RepeatIntervalId
                              ) || null
                            }
                            onChange={(event, newValue) =>
                              setRecurringData((prev) => ({
                                ...prev,
                                RepeatIntervalId:
                                  newValue?.RepeatIntervalId || "",
                                Day: "",
                                YearMonth: "",
                              }))
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.RepeatIntervalId ===
                              value?.RepeatIntervalId
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select Repeat Interval"
                                className="bg-white"
                                error={
                                  submitClicked &&
                                  statusChecked &&
                                  !recurringData.RepeatIntervalId
                                }
                              />
                            )}
                          />
                        </div>
                        <div className=" col-md-2">
                          {/* Weekly */}
                          {isWeekly && (
                            <Grid item xs={6}>
                              <label
                                className="form-label"
                                style={{ color: "#989898" }}
                              >
                                Repeat Day<span className="text-danger">*</span>
                              </label>
                              <Autocomplete
                                id="inputStateRepeatDay"
                                size="small"
                                options={daysOfWeek || []}
                                getOptionLabel={(option) => option?.name || ""}
                                value={
                                  (daysOfWeek || []).find(
                                    (d) => d.id === Number(recurringData.Day)
                                  ) || null
                                } // CHANGE: safe find
                                onChange={(event, newValue) => {
                                  console.log("Weekly Day selected:", newValue);
                                  setRecurringData((prev) => ({
                                    ...prev,
                                    Day: newValue?.id || "",
                                  }));
                                }}
                                isOptionEqualToValue={(option, value) =>
                                  option.id === value?.id
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Select Day"
                                    className="bg-white"
                                    error={
                                      submitClicked &&
                                      statusChecked &&
                                      isWeekly &&
                                      !recurringData.Day
                                    }
                                  />
                                )}
                              />
                            </Grid>
                          )}

                          {/* Monthly   */}
                          {isMonthly && (
                            <Grid item xs={6}>
                              <label
                                className="form-label"
                                style={{ color: "#989898" }}
                              >
                                Repeat Date
                                <span className="text-danger">*</span>
                              </label>
                              <Autocomplete
                                id="inputStateRepeatDate"
                                size="small"
                                options={monthDates || []}
                                getOptionLabel={(option) => option?.label || ""}
                                value={
                                  (monthDates || []).find(
                                    (d) => d.id === Number(recurringData.Day)
                                  ) || null
                                } // CHANGE: safe find
                                onChange={(event, newValue) => {
                                  console.log(
                                    "Monthly Day selected:",
                                    newValue
                                  );
                                  setRecurringData((prev) => ({
                                    ...prev,
                                    Day: newValue?.id || "",
                                  }));
                                }}
                                isOptionEqualToValue={(option, value) =>
                                  option.id === value?.id
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Select Date"
                                    className="bg-white"
                                    error={
                                      submitClicked &&
                                      statusChecked &&
                                      isMonthly &&
                                      !recurringData.Day
                                    }
                                  />
                                )}
                              />
                            </Grid>
                          )}

                          {isYearly && (
                            <>
                              <Grid item xs={6}>
                                <label
                                  className="form-label"
                                  style={{ color: "#989898" }}
                                >
                                  Repeat Month
                                  <span className="text-danger">*</span>
                                </label>
                                <Autocomplete
                                  id="inputStateRepeatMonth"
                                  size="small"
                                  options={monthsOfYear || []}
                                  getOptionLabel={(option) =>
                                    option?.label || ""
                                  }
                                  value={
                                    (monthsOfYear || []).find(
                                      (m) =>
                                        m.id === Number(recurringData.YearMonth)
                                    ) || null
                                  }
                                  onChange={(event, newValue) =>
                                    setRecurringData((prev) => ({
                                      ...prev,
                                      YearMonth: newValue?.id || "",
                                    }))
                                  }
                                  isOptionEqualToValue={(option, value) =>
                                    option.id === value?.id
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder="Select Month"
                                      className="bg-white"
                                    />
                                  )}
                                />
                              </Grid>
                             
                            </>
                          )}
                        </div>
                      </div>
                      <div className="row">
                      {isYearly && (
                       <div className=" mb-2 col-md-2 ">
                            <div className="col-md-auto">
                                <Grid item xs={3} className="mt-2">
                                  <label
                                    className="form-label"
                                    style={{ color: "#989898" }}
                                  >
                                    Repeat Date
                                    <span className="text-danger">*</span>
                                  </label>
                                  <Autocomplete
                                    id="inputStateRepeatDateYearly"
                                    size="small"
                                    options={monthDates || []}
                                    getOptionLabel={(option) =>
                                      option?.label || ""
                                    }
                                    value={
                                      (monthDates || []).find(
                                        (d) =>
                                          d.id === Number(recurringData.Day)
                                      ) || null
                                    }
                                    onChange={(event, newValue) =>
                                      setRecurringData((prev) => ({
                                        ...prev,
                                        Day: newValue?.id || "",
                                      }))
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                      option.id === value?.id
                                    }
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        placeholder="Select Date"
                                        className="bg-white"
                                        error={
                                          submitClicked &&
                                          statusChecked &&
                                          isYearly &&
                                          !recurringData.Day
                                        }
                                      />
                                    )}
                                  />
                                </Grid>
                              </div>
                              </div>
                      )}
                      </div>
                    </div>
                  </div>
                )}
                {/* item table */}
                <div className="itemtitleBar">
                  <h4>Items</h4>
                </div>
                <div className="card-body  pt-0 pb-0">
                  <div className="estDataBox">
                    <div className="table-responsive active-projects style-1 mt-2">
                      <table id="empoloyees-tblwrapper" className="table ">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount $</th>

                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tblSRItems?.map((item, index) => (
                            <tr key={index} style={{ height: "fit-content" }}>
                              <td>{item.Name}</td>
                              <td>
                                <textarea
                                  size="small"
                                  rows="2"
                                  style={{ height: "fit-content" }}
                                  className="form-control form-control-sm"
                                  value={item.Description}
                                  onChange={
                                    (e) => handleDescriptionChange(index, e) // Use item.ItemId
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="form-control form-control-sm number-input"
                                  value={item.Qty}
                                  ref={
                                    index === tblSRItems.length - 1
                                      ? quantityInputRef
                                      : null
                                  }
                                  onChange={
                                    (e) => handleQuantityChange(index, e) // Use item.ItemId
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="form-control form-control-sm number-input"
                                  value={item.Rate}
                                  onChange={
                                    (e) => handleRateChange(index, e) // Use item.ItemId
                                  }
                                />
                              </td>
                              <td className="text-right pe-2">
                                {formatAmount(item.Rate * item.Qty)}
                              </td>

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
                                  options={searchResults || []}
                                  getOptionLabel={(item) => item.ItemName}
                                  value={selectedItem.ItemName} // This should be the selected item, not searchText
                                  onChange={(event, newValue) => {
                                    setBtnDisable(false);
                                    if (newValue) {
                                      handleItemClick(newValue);
                                    } else {
                                      setSelectedItem({});
                                    }
                                    setSearchText("");
                                  }}
                                  filterOptions={(options) => options}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Search for items"
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      onChange={handleItemChange}
                                      onClick={getItems}
                                    />
                                  )}
                                  renderOption={(props, item) => (
                                    <li
                                      style={{
                                        cursor: "pointer",
                                        width: "30em",
                                      }}
                                      {...props}
                                      // // onClick={() => handleItemClick(item)}
                                    >
                                      <div className="customer-dd-border">
                                        <p>
                                          <strong>{item.ItemName}</strong>
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
                              <textarea
                                size="small"
                                rows="2"
                                style={{ height: "fit-content" }}
                                value={itemInput.Description}
                                // onChange={(e) =>
                                //   setItemInput({
                                //     ...itemInput,
                                //     Description: e.target.value,
                                //   })
                                // }
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
                                // onChange={(e) =>
                                //   setItemInput({
                                //     ...itemInput,
                                //     Qty: Number(e.target.value),
                                //   })
                                // }
                                className="form-control form-control-sm number-input"
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
                                className="form-control form-control-sm number-input"
                                value={itemInput.Rate}
                                // onChange={(e) =>
                                //   setItemInput({
                                //     ...itemInput,
                                //     Rate: Number(e.target.value),
                                //   })
                                // }
                                // onClick={(e) => {
                                //   setSelectedItem({
                                //     ...selectedItem,
                                //     SalePrice: 0,
                                //   });
                                // }}
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
                {SRData.ServiceRequestData.SRTypeId === 8 && (
                  <SprayTechForm
                    SrId={SRData.ServiceRequestData.ServiceRequestId}
                    sideData={sideData}
                    setSideData={setSideData}
                    sTechItems={sTechItems}
                    setSTechItems={setSTechItems}
                  />
                )}
                {/* Details */}
                <div className=" ">
                  <div className="">
                    <div className="itemtitleBar">
                      <h4>Details</h4>
                    </div>
                    <div className="card-body row">
                      <div className="col-md-12 mx-1 mt-2">
                        <div className="row">
                          <div className="col-md-4 mb-1">
                            {/* Adjust the column size as needed */}
                            <label className="form-label">
                              Work Requested:
                            </label>
                            <TextArea
                              name="WorkRequest"
                              value={
                                SRData.ServiceRequestData.WorkRequest || ""
                              }
                              onChange={handleInputChange}
                              placeholder="Work Requested"
                            />
                          </div>
                          {SRData.ServiceRequestData.SRTypeId === 3 ||
                          SRData.ServiceRequestData.SRTypeId === 8 ? (
                            <></>
                          ) : (
                            <>
                              <div className="col-md-4 mb-1">
                                <label className="form-label">
                                  Action Taken:
                                </label>
                                {/* Adjust the column size as needed */}
                                <TextArea
                                  name="ActionTaken"
                                  placeholder="Action Taken"
                                  value={
                                    SRData.ServiceRequestData.ActionTaken || ""
                                  }
                                  onChange={handleInputChange}
                                />
                              </div>
                            </>
                          )}

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
                            {SRData.ServiceRequestData.SRTypeId === 3 ||
                            SRData.ServiceRequestData.SRTypeId === 8 ? (
                              <>
                                {showMap && (
                                  <MapCo
                                    setFiles={setFiles}
                                    colorTypeList={colorTypeList}
                                    srNumber={
                                      SRData.ServiceRequestData
                                        .ServiceRequestNumber
                                    }
                                  />
                                )}
                              </>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row card-body">
                      <div className="col-xl-2 col-md-2">
                        <FileUploadButton onClick={trackFile}>
                          Upload File
                        </FileUploadButton>
                      </div>

                      {PrevFiles.map((file, index) => (
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
                            {file.FileName.includes(".pdf") ? (
                              <div className="d-flex justify-content-center align-items-center pdf-div">
                                <BsFiletypePdf color="#ff0000" fontSize="4em" />
                              </div>
                            ) : (
                              <img
                                src={`${baseUrl}/${file.FilePath}`}
                                alt={file.FileName}
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
                            {file.FileName}
                          </p>
                          {selectedImages.some(
                            (selectedImage) =>
                              selectedImage.SRFileId === file.SRFileId
                          ) ? (
                            <span
                              className=""
                              style={{
                                position: "absolute",
                                top: "3px",
                                left: "5px",
                              }}
                            >
                              <Tooltip
                                title="Click to select image"
                                placement="top"
                                arrow
                              >
                                <Checkbox
                                  checked={true}
                                  onChange={() => handleImageSelect(file)}
                                />
                              </Tooltip>
                            </span>
                          ) : (
                            <span
                              className=""
                              style={{
                                position: "absolute",
                                top: "3px",
                                left: "5px",
                              }}
                            >
                              <Tooltip
                                title="Click to select image"
                                placement="top"
                                arrow
                              >
                                <Checkbox
                                  checked={false}
                                  onChange={() => handleImageSelect(file)}
                                />
                              </Tooltip>
                            </span>
                          )}
                          <span
                            className="file-delete-button"
                            style={{
                              left: "90px",
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
                      {/* When user select image or files  show*/}
                      {files.map((file, index) => (
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
                          navigate(
                            statusChecked
                              ? "/RecurringSR-list"
                              : "/service-requests"
                          );
                          // window.history.back();
                        }}
                      >
                        back
                      </BackButton>
                    </div>
                  </div>
                  {!SRData.ServiceRequestData.isDelete && (
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
                       {  !statusChecked&&<> <ActivityLog
                            activityLogs={activityLogs}
                            type="Service Request"
                          />
                          <PrintButton
                            varient="mail"
                            onClick={() => {
                              handleMainButtonClick();
                            }}
                          ></PrintButton>
                          <PrintButton
                            varient="print"
                            onClick={() => {
                              if (SRData.ServiceRequestData.SRTypeId === 8) {
                                navigate(
                                  `/service-requests/spray-tech-preview?id=${idParam}`
                                );
                              } else {
                                navigate(
                                  `/service-requests/service-request-preview?id=${idParam}`
                                );
                              }
                            }}
                          ></PrintButton></>}
                          <PDFDownloadLink
                            document={
                              SRData.ServiceRequestData.SRTypeId === 8 ? (
                                <SprayTechPdf
                                  sRPreviewData={{
                                    ...{ Data: SRData.ServiceRequestData },
                                    name: SRData.ServiceRequestData
                                      .CustomerCompanyName,
                                    SRSTData: [sideData],
                                    SRSTIData: sTechItems,
                                    dynamicColorAndLogo: dynamicColorAndLogo,
                                  }}
                                />
                              ) : (
                                <SRPdf
                                  data={{
                                    ...{ Data: SRData.ServiceRequestData },
                                    name: SRData.ServiceRequestData
                                      .CustomerCompanyName,
                                    companyInfo: companyInfo,
                                    dynamicColorAndLogo: dynamicColorAndLogo,
                                    }}
                                />
                              )
                            }
                            fileName={
                              SRData.ServiceRequestData.SRTypeId === 8
                                ? `Spray Tech_${SRData.ServiceRequestData.ServiceRequestNumber}.pdf`
                                : `Service Request_${SRData.ServiceRequestData.ServiceRequestNumber}.pdf`
                            }
                          >
                            {({ blob, url, loading, error }) =>
                              loading ? (
                                <span className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn">
                                  <i className="fa fa-spinner"></i>
                                </span>
                              ) : (
                                <PrintButton
                                  varient="Download"
                                  onClick={() => {
                                    console.log("sTechItems", sTechItems);
                                  }}
                                ></PrintButton>
                              )
                            }
                          </PDFDownloadLink>
                          {loggedInUser.userRole == 1 ||
                          loggedInUser.userRole == 4 ? (
                            <>
                              {!SRData.ServiceRequestData.EstimateId && !statusChecked ? (
                                // <button
                                // disabled={loadingButton}
                                //   className="btn btn-dark me-2"
                                //   style={{ marginRight: "1em" }}
                                //   onClick={() => {
                                //     handleMainButtonClick(false, true);
                                //   }}
                                // >
                                //   Copy to Estimate
                                // </button>
                                <button
                                  disabled={loadingButton}
                                  className="btn btn-dark me-2"
                                  onClick={() => setModalOpen(true)}
                                >
                                  Copy to Estimate
                                </button>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <></>
                      )}

                      {((!isEditMode && !menuAccess.isLoading && menuAccess.canCreate) || (isEditMode && !menuAccess.isLoading && menuAccess.canEdit)) ? (
                        <LoaderButton
                          disable={btnDisable}
                          loading={loadingButton}
                          handleSubmit={submitHandler}
                        >
                          Save
                        </LoaderButton>
                      ) : (
                        <Tooltip 
                          title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create service requests"} 
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
                      {/* <button
                    type="button"
                    className="btn btn-primary me-2"
                    // disabled={disableSubmit}
                    onClick={submitHandler}
                  >
                    Submit
                  </button> */}
                    </div>
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

export default AddSRform;