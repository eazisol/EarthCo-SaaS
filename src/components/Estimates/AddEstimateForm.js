import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Cookies from "js-cookie";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Delete, Download, HdrStrongRounded } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Button,
  Fade,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import formatDate from "../../custom/FormatDate";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import { useNavigate } from "react-router-dom";
import { useEstimateContext } from "../../context/EstimateContext";
import useDeleteFile from "../Hooks/useDeleteFile";
import { DataContext } from "../../context/AppData";
import { RoutingContext } from "../../context/RoutesContext";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import Contacts from "../CommonComponents/Contacts";
import ServiceLocations from "../CommonComponents/ServiceLocations";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import useQuickBook from "../Hooks/useQuickBook";
import BackButton from "../Reusable/BackButton";
import FileUploadButton from "../Reusable/FileUploadButton";
import formatAmount, { formatCurrency } from "../../custom/FormatAmount";
import PrintButton from "../Reusable/PrintButton";
import useGetEstimate from "../Hooks/useGetEstimate";
import { PDFDownloadLink } from "@react-pdf/renderer";
import EstimatePdf from "./EstimatePdf";
import { BsFiletypePdf } from "react-icons/bs";
import { pdf } from "@react-pdf/renderer";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import CustomAutocomplete from "../Reusable/CustomAutocomplete";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import MultiSelectDD from "../Reusable/MultiSelectDD";
import LinkingBadges from "../Reusable/LinkingBadges";
import DraggableRow from "./DraggableRow";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { saveAs } from "file-saver";
import imagePathCorrector from "../../custom/ImagePathCorrector";
import imageCompression from "browser-image-compression";
import imageCompresser from "../../custom/ImageCompresser";
import useGetData from "../Hooks/useGetData";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import TblDateFormat from "../../custom/TblDateFormat";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import MultiSelectAutocomplete from "../Reusable/MultiSelectAutocomplete";
import useMenuAccess from "../Hooks/useMenuAccess";

const AddEstimateForm = () => {
  const {
    PunchListData,
    setPunchListData,
    selectedImages,
    setSelectedImages,
    loggedInUser,
    selectedPdf,
    setselectedPdf,
    companyInfo,
    dynamicColorAndLogo,
  } = useContext(DataContext);

  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [copyEstimates, setCopyEstimate] = useState(false);
  const currentDate = new Date();
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  // Get menu access permissions
  const menuAccess = useMenuAccess();
  
  // Determine if this is edit mode (has idParam)
  const isEditMode = !!(idParam && idParam !== 0);

  // Helper to determine the correct IssueDate
  const getInitialIssueDate = () => {
    // If copyEstimates is true, always use current date
    if (copyEstimates) {
      return formatDate(currentDate);
    }
    // If new form (no idParam), use current date
    if (!idParam) {
      return formatDate(currentDate);
    }
    // Otherwise, will be set from API (see fetchEstimates)
    return "";
  };

  const [formData, setFormData] = useState({
    EstimateNumber: "",
    IssueDate: getInitialIssueDate(),
    EstimateNotes: "",
    ApprovedDate: null,
    ServiceLocationNotes: "",
    EstimateTypeId: loggedInUser?.CompanyId == 2 ? 1 : null,
    EstimateStatusId: 4,
    tblEstimateItems: [],
    tblEstimateEstimateTags: [],
    isCreatedFromServiceRequest: 0,
    isPartial: false,
    ForemanId: null,
  });
  // For multi-select Foreman UI; keeps payload compatible by syncing first selection
  const [selectedForemen, setSelectedForemen] = useState([]);
  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();

  const navigate = useNavigate();
  // const queryParams = new URLSearchParams(window.location.search);
  // const idParam = Number(queryParams.get("id"));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    description: "",
    onConfirm: () => { },
    confirmText: "",
    cancelText: "",
  });


  const { syncQB } = useQuickBook();
  const { getListData } = useGetData();
  const { getEstimateStatus, estimateStatus } = useGetEstimate();
  // Initialize selectedForemen from existing ForemanId when available
  useEffect(() => {
    if (formData?.ForemanId && !selectedForemen?.length) {
      setSelectedForemen([formData.ForemanId]);
    }
  }, [formData?.ForemanId]);

  // Keep legacy single ForemanId synced as first selected
  useEffect(() => {
    const firstSelected = selectedForemen && selectedForemen.length > 0 ? selectedForemen[0] : null;
    if (formData.ForemanId !== firstSelected) {
      setFormData(prev => ({ ...prev, ForemanId: firstSelected }));
    }
  }, [selectedForemen]);


  useEffect(() => {
    // fetchName(PunchListData.CustomerId);

    if (PunchListData.ContactIds?.length > 0) {
      setSelectedContacts(PunchListData.ContactIds);
    }

    if (PunchListData.PhotoPath) {
      setFormData((prevState) => ({
        ...prevState,
        ...PunchListData,
        IssueDate: formatDate(currentDate),
        tblEstimateFiles: [
          { FilePath: PunchListData.PhotoPath, FileName: "PunchList photo" },
          // { FilePath: PunchListData.AfterPhotoPath? PunchListData.AfterPhotoPath : null , FileName : "PunchList after photo"},
        ],
      }));
    }
    // if (PunchListData.AfterPhotoPath) {
    //   setFormData((prevState) => ({
    //     ...prevState,
    //     ...PunchListData,
    //     IssueDate: formatDate(currentDate),
    //     tblEstimateFiles: [

    //       { FilePath: PunchListData.AfterPhotoPath? PunchListData.AfterPhotoPath : "" , FileName : "PunchList after photo"},
    //     ],
    //   }));
    // }

    if (PunchListData.FilesData) {
      setFormData((prevState) => ({
        ...prevState,
        ...PunchListData,
        tblEstimateFiles: PunchListData.FilesData,
      }));
    }

    if (PunchListData.CustomerId) {
      setFormData((prevState) => ({
        ...prevState,
        ...PunchListData,
        IssueDate: formatDate(currentDate),
      }));
    }
    if (PunchListData.ItemData) {
      setFormData((prevState) => ({
        ...prevState,
        ...PunchListData,
        tblEstimateItems: PunchListData.ItemData,
      }));
    }
    if (!PunchListData.RegionalManagerId) {
      if (loggedInUser.userRole == "4") {
        setFormData({
          ...formData,
          RegionalManagerId: Number(loggedInUser.userId),
        });
      }
    }


    // fetctContacts(PunchListData.CustomerId);
    if (selectedPdf.name) {
      setFiles([selectedPdf]);
    }

    // }
  }, []);

  const inputFile = useRef(null);
  const [Files, setFiles] = useState([]);
  const [sLList, setSLList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [tags, setTags] = useState([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const { contactEmail, fetchEmail } = useFetchContactEmail();
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [totalItemAmount, setTotalItemAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [estimateTagData, setEstimateTagData] = useState([]);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [selectedPos, setSelectedPos] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const totalBillAmount = selectedBills?.reduce((sum, item) => sum + Number(item.BillAmount), 0)
  const totalAmountSum = selectedInvoice.reduce(
    (sum, item) => sum + Number(item.TotalAmount),
    0
  );


  const { deleteEstmFile } = useDeleteFile();

  const { staffName, fetchStaffName } = useFetchCustomerName();
  const [estimateType, setEstimateType] = useState([]);

  const [estimateFiles, setEstimateFiles] = useState([]);

  const { setEstimateLinkData } = useEstimateContext();

  const [PrevFiles, setPrevFiles] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);
  const [selectForeman, setSelectForeman] = useState(null);
  const [approvedItems, setApprovedItems] = useState([]);
  const [qBError, setQBError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Parse to number if the input type is number
    const parsedValue =
      e.target.type === "number" ? parseFloat(value) || 0 : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  };

  const fetchEstimates = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }
    getListData(
      `/SyncQB/CheckSyncLog?Id=${id}&Type=Estimate&CompanyId=${loggedInUser.CompanyId}`,
      (data) => {
        const parsedMessage = JSON.parse(data.Message);
        const message =
          parsedMessage &&
            parsedMessage.Fault &&
            parsedMessage.Fault.Error &&
            parsedMessage.Fault.Error[0] &&
            parsedMessage.Fault.Error[0].Detail
            ? parsedMessage.Fault.Error[0].Detail
            : data.Message;
        setQBError(message);
      },
      (err) => {
        console.log("qb errorrrr", err);
      }
    );
    try {
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimate?id=${id}`,
        { headers }
      );

      if (response.data.EstimateItemData.PurchaseOrderId) {
        setBtnDisable(true);
      }

      setPrevFiles(response?.data.EstimateFileData);
      setSelectedImages(response?.data.EstimateFileData);
      setEstimateLinkData((prevState) => ({
        ...prevState,
        FileData: response.data.EstimateFileData,
      }));
      // fetchName(response.data.EstimateData.CustomerId);
      fetchStaffName(response.data.EstimateData.RegionalManagerId);
      fetchEmail(response.data.EstimateItemData.ContactId);
      setTotalDiscount(response.data.EstimateData.Discount);
      setLaborRate(response.data.EstimateData.LaborRate);
      setSelectedPos(response.data.EstimatePurchaseOrderData);
      setSelectedBills(response.data.EstimatePurchaseOrderData);
      setSelectedInvoice(response.data.EstimateInvoiceData);
      setSelectedContacts(
        response.data.EstimateContactData.map((contact) => contact.ContactId)
      );
      const selectedTags = response.data.EstimateTagData.map((tag) => ({
        EstimateTagId: tag.EstimateTagId,
      }));

      setFormData((prevData) => ({
        ...prevData,
        tblEstimateEstimateTags: selectedTags,
      }));
      setEstimateTagData(response.data.EstimateTagData);
      // Combine EstimateItemData and EstimateCostItemData into tblEstimateItems
      const combinedItems = [
        ...response.data.EstimateItemData,
        ...response.data.EstimateCostItemData,
      ];

      setApprovedItems(
        response.data.EstimateItemData.filter(
          (item) => item.IsApproved === true
        )
      );

      setFormData((prevState) => ({
        ...prevState,
        ...response.data.EstimateData,
        IssueDate: copyEstimates ? formatDate(new Date()) : response.data.EstimateData.IssueDate,
        tblEstimateItems: combinedItems,
        // tblEstimateFiles: combinedItems,
      }));

      // Populate multi-select foremen from API response
      try {
        const apiForemen = response?.data?.EstimateForemanData || [];
        const foremanIds = apiForemen.map((f) => f.ForemanId).filter((id) => !!id);
        setSelectedForemen(foremanIds);
      } catch (e) {
        setSelectedForemen([]);
      }

      setEstimateFiles(response.data.EstimateFileData);

      // setFiles((prevState) => ({
      //   ...prevState,
      //   ...response.data.EstimateFileData,

      // }))
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("API Call Error:", error);
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
        if (!idParam) {
          setFormData({
            ...formData,
            ContactId: res.data[0].ContactId,
          });
          setSelectedContacts([...selectedContacts, res.data[0].ContactId]);
        }
      })
      .catch((error) => {
        setContactList([]);
      });
  };

  const fetchTags = async () => {
    axios
      .get(`${baseUrl}/api/Estimate/GetEstimateTagList`, {
        headers,
      })
      .then((res) => {
        setTags(res.data);
      })
      .catch((error) => {
        setTags([]);
        console.log("contacts data fetch error", error);
      });
  };
  const getEstimateTypeList = async () => {
    axios
      .get(`${baseUrl}/api/Estimate/GetEstimateTypeList`, {
        headers,
      })
      .then((res) => {
        setEstimateType(res.data);
      })
      .catch((error) => {
        setTags([]);
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

  const [staffData, setStaffData] = useState([]);

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

  const handleContactChange = (event, newValue) => {
    setSelectedContacts(newValue.map((company) => company.ContactId));
  };

  // const handleTagAutocompleteChange = (event, newValues) => {
  //   const tagString = newValues.map((tag) => tag.Tag).join(", ");

  //   setFormData((prevData) => ({
  //     ...prevData,
  //     Tags: tagString,
  //   }));
  // };
  const handleTagAutocompleteChange = (event, newValues) => {
    const selectedTags = newValues.map((tag) => ({
      EstimateTagId: tag.EstimateTagId,
    }));

    setFormData((prevData) => ({
      ...prevData,
      tblEstimateEstimateTags: selectedTags,
    }));
  };

  const handleInputChange = (e, newValue) => {
    setDisableButton(false);
    const { name, value } = e.target;
    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId
    const adjustedValue = [
      "UserId",
      "ServiceLocationId",
      "ContactId",
      "Qty",
      "Rate",
      "EstimateStatusId",
      "RequestedBy",
      'ForemanId',
    ].includes(name)
      ? Number(value)
      : value;

    setFormData((prevData) => ({ ...prevData, [name]: adjustedValue }));
  };

  useEffect(() => { }, [formData]);

  const LinkToPO = () => {
    setEstimateLinkData((prevState) => ({
      ...prevState,
      ...formData,
      CustomerName: formData.CustomerCompanyName,
      RegionalManager: formData.RegionalManagerId,
      RequestedBy: formData.RequestedBy,
      CustomerDisplayName: formData.CustomerDisplayName,
      BillId: null,
      BillNumber: "",
      PurchaseOrderId: null,
      PurchaseOrderNumber: "",
      InvoiceId: null,
      InvoiceNumber: "",
      isCreatedFromEstimate: true,
    }));
  };
  const handlePopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
  };

  const handleSubmit = (
    id = idParam,
    number = formData.EstimateNumber,
    isCopy = false,
    copy = 0,
    estimtaeId
  ) => {
    // Check permissions before submitting
    if (isEditMode && !isCopy) {
      // Updating existing estimate - need edit access
      if (!menuAccess.isLoading && !menuAccess.canEdit) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update estimates");
        return;
      }
    } else if (!isCopy) {
      // Creating new estimate - need create access
      if (!menuAccess.isLoading && !menuAccess.canCreate) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create estimates");
        return;
      }
    }

    setSubmitClicked(true);

    let updatedEstimateItems = formData.tblEstimateItems;
    if (isCopy) {
      updatedEstimateItems = formData.tblEstimateItems.map((item) => ({
        ...item,
        IsApproved: false,
        Rate: item.Rate ? parseFloat(item.Rate) : 0,
        Qty: item.Qty ? parseFloat(item.Qty) : 0,
        PurchasePrice: item.PurchasePrice ? parseFloat(item.PurchasePrice) : 0,
      }));
    } else {
      updatedEstimateItems = formData.tblEstimateItems.map((item) => ({
        ...item,
        Rate: item.Rate ? parseFloat(item.Rate) : 0,
        Qty: item.Qty ? parseFloat(item.Qty) : 0,
        PurchasePrice: item.PurchasePrice ? parseFloat(item.PurchasePrice) : 0,
      }));
    }
    if (
      !formData.IssueDate ||
      !formData.CustomerId
      // !formData.ServiceLocationId ||
      // !formData.RequestedBy ||
      // !formData.RegionalManagerId ||
      // !formData.AssignTo ||
      // !formData.EstimateStatusId ||
      // selectedContacts.length <= 0
    ) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      return;
    }

    if (updatedEstimateItems.length <= 0) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please Add Atleast one Item");
      return;
    }

    const postData = new FormData();

    // Merge the current items with the new items for EstimateData
    const contactIdArray = selectedContacts.map((contact) => ({
      ContactId: contact,
    }));
    const mergedEstimateData = {
      ...formData,
      EstimateId: id,
      CustomerId: Number(formData.CustomerId),
      EstimateTypeId: Number(formData.EstimateTypeId),
      EstimateNumber: number,
      ContactId: selectedContacts[0],
      CompanyId: Number(loggedInUser.CompanyId),
      TotalAmount: totalItemAmount || 0,
      ProfitPercentage: profitPercentage || 0,
      Discount: totalDiscount || 0,
      LaborRate: laborRate || 0,
      Shipping: shippingCost || 0,
      BillId: selectedBills[0] ? selectedBills[0].BillId : null,
      BillNumber: selectedBills[0] ? selectedBills[0].BillNumber : "",
      PurchaseOrderId: selectedPos[0] ? selectedPos[0].PurchaseOrderId : null,
      PurchaseOrderNumber: selectedPos[0]
        ? selectedPos[0].PurchaseOrderNumber
        : "",
      tblEstimateContacts: contactIdArray,
      tblEstimateItems: updatedEstimateItems,
      tblEstimatePurchaseOrders: selectedPos,
      tblEstimateInvoices: selectedInvoice,
      tblEstimateFiles: selectedImages,
      tblEstimateForemen: (selectedForemen || []).map((id) => ({ ForemanId: id })),
      CopyFrom: estimtaeId,
      isCreatedFromServiceRequest:
        formData?.isCreatedFromServiceRequest !== 0 &&
          formData?.isCreatedFromServiceRequest !== undefined
          ? formData?.isCreatedFromServiceRequest == 1
            ? 1
            : 0
          : !PunchListData?.isCreatedFromServiceRequest
            ? 0
            : 1,
    };

    postData.append("EstimateData", JSON.stringify(mergedEstimateData));
    postData.append("isCopy", copy);

    // Appending files to postData
    Files.forEach((fileObj) => {
      postData.append("Files", fileObj);
    });
    estimateFiles.forEach((fileObj) => {
      postData.append("Files", fileObj);
    });
    // selectedImages.forEach((fileObj) => {
    //   postData.append("tblEstimateFiles", fileObj);
    // });
    setDisableButton(true);

    submitData(postData);
  };

  const submitData = async (postData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Important for multipart/form-data requests
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/Estimate/AddEstimate`,
        postData,

        {
          headers,
        }
      );
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      syncQB(response.data.SyncId);

      navigate(`/estimates/add-estimate?id=${response.data.Id}`);

      setTimeout(() => {
        setDisableButton(false);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("API Call Error:", error);

      setDisableButton(false);

      let errorMessage =
        error.response?.data?.Message ||
        error.response?.data ||
        "Error creating Estimate";
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(errorMessage);
    }

    // Logging FormData contents (for debugging purposes)
    for (let [key, value] of postData.entries()) {
    }
    // window.location.reload();
  };

  useEffect(() => {
    fetchEstimates(idParam);
    fetchStaffList();
    fetchTags();
    getEstimateStatus();
    getEstimateTypeList();
  }, []);

  useEffect(() => {
    fetchServiceLocations(formData.CustomerId);
    fetctContacts(formData.CustomerId);
    // fetchName(formData.CustomerId, () => {
    //   setLoading(false);
    // });
  }, [formData.CustomerId]);

  const downloadFile = (filePath, fileName) => {
    saveAs(imagePathCorrector(filePath), fileName);
    return;
  };

  const handleStatusChange = (e) => {
    const value = parseInt(e.target.value, 10); // This converts the string to an integer

    setFormData((prevData) => ({
      ...prevData,
      EstimateStatusId: value,
    }));
  };
  const handleEstimateTypeChange = (e) => {
    const value = parseInt(e.target.value);

    setFormData((prevData) => ({
      ...prevData,
      EstimateTypeId: loggedInUser?.CompanyId === 1 ? null : value,
    }));
  };

  // new items
  const [itemInput, setItemInput] = useState({
    Name: "",
    Qty: 1,
    Description: "",
    Rate: null,
  });
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
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

  const deleteItem = (i, isCost) => {
    const updatedArr = formData.tblEstimateItems.filter(
      (item, index) => index !== i
    );
    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: updatedArr,
    }));
  };

  const handleItemChange = (event) => {
    setSearchText(event.target.value);

    setSelectedItem({}); // Clear selected item when input changes
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setBtnDisable(false);
    getListData(
      `/SyncQB/CheckSync?QBID=${item.QBId}&Type=Item&CompanyId=${loggedInUser.CompanyId}`,
      (id) => { },
      (err) => {
        setFormData((prevData) => ({
          ...prevData,
          tblEstimateItems: prevData.tblEstimateItems.slice(0, -1),
        }));
        handlePopup(true, "error", "This Item is Inactive");
        // setOpenSnackBar(true);
        // setSnackBarColor("error");
        // setSnackBarText("error changing Sale Price");
      }
    );
    setSearchText(item.ItemName); // Set the input text to the selected item's name
    setItemInput({
      ...itemInput,
      ItemId: item.ItemId,
      Name: item.ItemName,
      Description: item.SaleDescription,
      Rate: item.SalePrice,
      PurchasePrice: item.PurchasePrice,
      isCost: false,
      IsApproved: true,
      OrderBy: formData.tblEstimateItems.length + 1,
    });

    setSearchResults([]); // Clear the search results

    // Update the formData.tblEstimateItems state
    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: [
        ...prevData.tblEstimateItems,
        {
          ...itemInput,
          ItemId: item.ItemId,
          Name: item.ItemName,
          Description: item.SaleDescription,
          Rate: item.SalePrice,
          PurchasePrice: item.PurchasePrice,
          isCost: false,
          IsApproved: true,
          OrderBy: formData.tblEstimateItems.length + 1,
        },
      ],
    }));

    // Clear the itemInput state
    setItemInput({
      Name: "",
      Qty: 1,
      Description: "",
      Rate: null,
    });
  };
  const quantityInputRef = useRef(null);
  useEffect(() => {
    if (quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  }, [formData.tblEstimateItems.length]);

  const handleAddItem = () => {
    const newAmount = itemInput.Qty * itemInput.Rate;
    const newItem = {
      ...itemInput,

      Amount: newAmount,
    };
    if (!itemInput.ItemId) {
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: [...prevData.tblEstimateItems, itemInput],
    }));

    setSearchText("");
    setSelectedItem({
      SalePrice: "",
      SaleDescription: "",
    });
    setItemInput({
      Name: "",
      Qty: 1,
      Description: "",
      Rate: null,
    });
  };

  const handleDescriptionChange = (i, event, add) => {
    if (add === 0) {
      const updatedItems = formData.tblEstimateItems.map((item, index) => {
        if (index === i && item.isCost == false) {
          const updatedItem = { ...item };
          updatedItem.Description = event.target.value;

          return updatedItem;
        }
        return item;
      });
      setFormData((prevData) => ({
        ...prevData,
        tblEstimateItems: updatedItems,
      }));
    }
    if (add === 1) {
      const updatedItems = formData.tblEstimateItems.map((item, index) => {
        if (index === i && item.isCost == true) {
          const updatedItem = { ...item };
          updatedItem.Description = event.target.value;
          return updatedItem;
        }
        return item;
      });
      setFormData((prevData) => ({
        ...prevData,
        tblEstimateItems: updatedItems,
      }));
    }
  };

  const handleQuantityChange = (i, event, add) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = formData.tblEstimateItems.map((item, index) => {
        if (index === i && item.isCost == false) {
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
      setFormData((prevData) => ({
        ...prevData,
        tblEstimateItems: updatedItems,
      }));
    }
  };
  const handleRateChange = (i, event, add) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^-?[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = formData.tblEstimateItems.map((item, index) => {
        if (index === i && item.isCost == false) {
          const updatedItem = { ...item };
          updatedItem.Rate = inputValue; // Keep input value as string for display

          // Calculate amount if input is a valid number
          const parsedQty = parseFloat(inputValue);

          return updatedItem;
        }
        return item;
      });
      setFormData((prevData) => ({
        ...prevData,
        tblEstimateItems: updatedItems,
      }));
    }
  };

  const handleCostChange = (i, event, add) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^-?[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = formData.tblEstimateItems.map((item, index) => {
        if (index === i && item.isCost == false) {
          const updatedItem = { ...item };
          updatedItem.PurchasePrice = inputValue; // Keep input value as string for display

          // Calculate amount if input is a valid number
          const parsedQty = parseFloat(inputValue);

          return updatedItem;
        }
        return item;
      });
      setFormData((prevData) => ({
        ...prevData,
        tblEstimateItems: updatedItems,
      }));
    }
  };

  const handleIsApproved = (i, event, add) => {
    const updatedItems = formData.tblEstimateItems.map((item, index) => {
      if (index === i) {
        // Check if the condition for isCost matches the `add` parameter
        if (
          (add === 0 && item.isCost === false) ||
          (add === 1 && item.isCost === true)
        ) {
          // Copy the item and update IsApproved based on the checkbox's checked state
          const updatedItem = {
            ...item,
            IsApproved: event.target.checked, // Use checked for boolean state
          };
          // Optionally update the Amount if needed
          // updatedItem.Amount = updatedItem.Qty * updatedItem.Rate;
          return updatedItem;
        }
      }
      return item;
    });
    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: updatedItems,
    }));
  };

  // AC

  // calculations

  const [subtotal, setSubtotal] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalACAmount, setTotalACAmount] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [laborRate, setLaborRate] = useState(0);
  const [paymentCredit, setPaymentCredit] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);

  const shippingcostChange = (e) => {
    if (parseFloat(e.target.value) > 0) {
      setShippingCost(parseFloat(e.target.value));
    } else {
      setShippingCost(0);
    }
  };

  const discountChange = (e) => {
    const newValue = parseFloat(e.target.value);

    if (isNaN(newValue)) {
      setTotalDiscount(0);
      return;
    }
    if (newValue === 0) {
      setTotalDiscount(0);
    } else {
      setTotalDiscount(newValue);
    }
    // if (newValue) {
    //   if (newValue >= 0 && newValue <= 100) {
    //   } else if (newValue > 100) {
    //     setTotalDiscount(100); // Set it to the maximum value (100) if it exceeds.
    //   } else {
    //     setTotalDiscount(0);
    //   }
    // }
  };
  const laborRateChange = (e) => {
    const newValue = parseFloat(e.target.value);

    if (isNaN(newValue)) {
      setLaborRate(0);
      return;
    }
    if (newValue === 0) {
      setLaborRate(0);
    } else {
      setLaborRate(newValue);
    }

  };

  useEffect(() => {
    const filteredACItems = formData.tblEstimateItems?.filter(
      (item) => item.isCost === true
    );
    const filteredItems = formData.tblEstimateItems?.filter(
      (item) => item.isCost === false
    );
    const approvedItems = formData.tblEstimateItems?.filter(
      (item) => item.IsApproved === true
    );

    const newACTotalAmount = filteredACItems?.reduce(
      (acc, item) => acc + item.Rate * item.Qty,
      0
    );

    const newTotalAmount = approvedItems?.reduce(
      (acc, item) => acc + item.Rate * item.Qty,
      0
    );
    const newCostTotalAmount = filteredItems?.reduce(
      (acc, item) => acc + item.PurchasePrice * item.Qty,
      0
    );
    const totalamount = newTotalAmount + shippingCost - (totalDiscount * newTotalAmount) / 100;

    let calculatedTotalProfit = 0;
    if (newTotalAmount > 0) {
      calculatedTotalProfit =
        newTotalAmount - (totalDiscount * newTotalAmount) / 100 - totalExpense;
    }
    let calculatedProfitPercentage = 0;
    // if (totalExpense > 0) {
    //   calculatedProfitPercentage = (calculatedTotalProfit / totalExpense) * 100;
    // } early calculation
    if (totalamount > 0) {
      calculatedProfitPercentage = (calculatedTotalProfit / totalamount) * 100;
    }
    setTotalExpense(newCostTotalAmount + newACTotalAmount);

    setSubtotal(newTotalAmount);
    setTotalACAmount(newACTotalAmount);
    if (totalamount) {
      setTotalItemAmount(totalamount);
    } else {
      setTotalItemAmount(0);
    }

    setTotalProfit(calculatedTotalProfit);

    setBalanceDue(totalItemAmount - paymentCredit);

    setProfitPercentage(calculatedProfitPercentage);

    // console.log("amounts are", calculatedProfitPercentage, shippingCost, calculatedTotalProfit, totalACAmount, totalItemAmount, subtotal);
  }, [
    formData.tblEstimateItems,
    shippingCost,
    totalDiscount,
    totalItemAmount,
    subtotal,
    totalExpense,
  ]);

  // filesss........

  const handleDeleteFile = (index) => {
    // Create a copy of the Files array without the file to be deleted
    const updatedFiles = [...Files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  const handleDeletePLFile = (indexToDelete) => {
    // Create a copy of the formData.tblEstimateFiles array
    const updatedFiles = [...formData.tblEstimateFiles];

    // Remove the file at the specified index
    updatedFiles.splice(indexToDelete, 1);

    // Update the formData with the new array without the deleted file
    setFormData({ ...formData, tblEstimateFiles: updatedFiles });
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

  const trackFile = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const compressedImg = await imageCompresser(uploadedFile);
      setFiles((prevFiles) => [...prevFiles, compressedImg]);
    }
  };

  // State to store selected images

  const handleImageSelect = (image) => {
    // Check if the image is already selected
    const isSelected = selectedImages.some(
      (selectedImage) => selectedImage.EstimateFileId === image.EstimateFileId
    );

    if (isSelected) {
      // If already selected, remove it from the selectedImages state
      setSelectedImages((prevSelectedImages) =>
        prevSelectedImages.filter(
          (selectedImage) =>
            selectedImage.EstimateFileId !== image.EstimateFileId
        )
      );
    } else {
      // If not selected, add it to the selectedImages state
      setSelectedImages((prevSelectedImages) => [...prevSelectedImages, image]);
    }
  };

  const handleMainButtonClick = async () => {
    try {
      const blob = await pdf(
        <EstimatePdf
          data={{
            ...formData,
            RegionalManagerName: staffName,
            companyInfo: companyInfo,
            IncludePrices:true,
            SelectedCompany:
              loggedInUser.CompanyId == 2
                ? loggedInUser.CompanyName
                : "Earthco Landscape",
            CustomerName: formData.CustomerCompanyName,
            ApprovedItems: formData.tblEstimateItems.filter(
              (item) => item.IsApproved === true
            ),
            Amount: formData.tblEstimateItems
              .filter((item) => item.IsApproved === true)
              .reduce((accumulator, item) => accumulator + item.Amount, 0),
       
          }}
        />
      ).toBlob();

      // Create a File object from the blob
      const pdfFile = new File(
        [blob],
        `${formData.CustomerCompanyName} Estimate ${formData.EstimateNumber}.pdf`,
        {
          type: "application/pdf",
        }
      );

      // Store the File object in state
      setselectedPdf(pdfFile); // Now, pdfBlob is a File object with a name and type

      navigate(
        `/send-mail?title=${"Estimate"}&mail=${contactEmail}&customer=${formData.CustomerCompanyName
        }&number=${formData.EstimateNumber}`
      );
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };

  const [textareaHeight, setTextareaHeight] = useState("3em"); // Initial height

  const handleResize = (event) => {
    const { target } = event;
    target.style.height = "auto"; // Reset height to auto to allow for resizing
    target.style.height = `${target.scrollHeight}px`; // Set the height to fit the content
    setTextareaHeight(`${target.scrollHeight}px`); // Update state with the new height
  };

  useEffect(() => {
    fetchEmail(formData.ContactId);
  }, [formData.ContactId]);

  const moveRow = (dragIndex, hoverIndex) => {
    const draggedItem = formData.tblEstimateItems[dragIndex];
    const updatedItems = [...formData.tblEstimateItems];
    updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, draggedItem);

    // Update OrderId for each item based on the new order
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      OrderBy: index + 1,
    }));

    setFormData((prevState) => ({
      ...prevState,
      tblEstimateItems: reorderedItems,
    }));
  };

  const [sortOrder, setSortOrder] = useState("asc"); // State to manage sort direction

  const handleSort = () => {
    const sortedItems = [...formData.tblEstimateItems].sort((a, b) => {
      return sortOrder === "asc" ? a.Qty - b.Qty : b.Qty - a.Qty;
    });

    // Update OrderBy for sorted items
    sortedItems.forEach((item, index) => {
      item.OrderBy = index + 1;
    });

    formData.tblEstimateItems = sortedItems;
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  const handleOpenCopyEstimateModal = () => {
    setModalConfig({
      title: "Copy Estimate",
      description: (
        <>
          A copy of the estimate will be created using the same data and items.
          Files with <strong>pre-selected checkboxes</strong> will be included.
          You may deselect any files before proceeding.
        </>
      ),
      onConfirm: () => {
        setCopyEstimate(true);
        setFormData((prev) => ({
          ...prev,
          IssueDate: formatDate(new Date()),
          EstimateStatusId: 4,
          isCreatedFromServiceRequest: 0,
          isPartial: false,
          ApprovedDate: null,
          ReadyToInvoiceDate: null,
          CompletedDate: null,
          ServiceRequestId: null,
          ServiceRequestNumber: null,
          BillId: null,
          BillNumber: null,
          InvoiceNumber: null,
          InvoiceId: null,
          PurchaseOrderId: null,
          PurchaseOrderNumber: null,
          EstimateNumber: null,
          BalanceAmount: totalItemAmount
        }))
        setSelectedInvoice([])
        setSelectedPos([])
        setSelectedBills([])
        setModalOpen(false);
        setOpenSnackBar(true);
        setSnackBarColor("success");
        setSnackBarText("Estimate copied successfully.");
      },
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
    setModalOpen(true);
  };

  const handleOpenPurchaseOrderModal = () => {
    setModalConfig({
      title: "Purchase Order",
      description: (
        <>
          {formData?.PurchaseOrderId
            ? "An purchase order has already been created for this estimate. Are you sure you want to create a new one?"
            : "A purchase order will be generated based on the selected data. Confirm to continue."}
        </>
      ),

      onConfirm: () => {
        LinkToPO();
        navigate("/purchase-order/add-po");
        setModalOpen(false);
      },
      confirmText: formData?.PurchaseOrderId ? "Yes" : "Confirm",
      cancelText: formData?.PurchaseOrderId ? "No" : "Cancel",
    });
    setModalOpen(true);
  };

  const handleOpenInvoiceModal = () => {
    setModalConfig({
      title: "Invoice",
      description: (
        <>
          {formData?.InvoiceId
            ? "An invoice has already been created for this estimate. Are you sure you want to create a new one?"
            : "An invoice will be generated based on the selected data. Confirm to continue."}
        </>
      ),
      onConfirm: () => {
        LinkToPO();
        navigate("/invoices/add-invoices");
        setModalOpen(false);
      },
      confirmText: formData?.InvoiceId ? "Yes" : "Confirm",
      cancelText: formData?.InvoiceId ? "No" : "Cancel",
    });
    setModalOpen(true);
  };

  const handleOpenPdfDownloadModal = () => {
    setModalConfig({
      title: "PDF Download Options",
      description: (
        <>
          <Typography>
          You can download the estimate with or without pricing.
          Select Yes to include pricing, or No to exclude it.
          </Typography>
        </>
      ),
      onConfirm: async () => {
        try {
          setModalOpen(false);
          await downloadEstimatePdf(true);
        } catch (e) {}
      },
      confirmText: "Yes",
      cancelText: "No",
      onClose: () => {
        // Backdrop/escape close: only close, do not download
        setModalOpen(false);
      },
      onCancel: async () => {
        // Explicit No button: download without prices
        try {
          setModalOpen(false);
          await downloadEstimatePdf(false);
        } catch (e) {}
      },
    });
    setModalOpen(true);
  };

  const downloadEstimatePdf = async (includePrices) => {
    try {
      const blob = await pdf(
        <EstimatePdf
          data={{
            ...formData,
            companyInfo: companyInfo,
            RegionalManagerName: staffName,
            SelectedCompany:
              loggedInUser.CompanyId == 2
                ? loggedInUser.CompanyName
                : "Earthco Landscape",
            CustomerName: formData.CustomerCompanyName,
            ApprovedItems: formData.tblEstimateItems.filter(
              (item) => item.IsApproved === true
            ),
            Amount: formData.tblEstimateItems
              .filter((item) => item.IsApproved === true)
              .reduce((accumulator, item) => accumulator + item.Amount, 0),
            IncludePrices: includePrices,
          }}
        />
      ).toBlob();

      saveAs(
        blob,
        `${formData.CustomerCompanyName} Estimate ${formData.EstimateNumber}.pdf`
      );
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };
  return (
    <>
      <ConfirmationModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        onClose={modalConfig.onClose}
        onCancel={modalConfig.onCancel}
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
      {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>Read-only mode:</strong> You don't have permission to update this estimate. You can view the information but cannot make changes.
        </div>
      )}
      {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>No create access:</strong> You don't have permission to create new estimates.
        </div>
      )}
      <div className="card">
        <div style={{ display: "flex" }} className="itemtitleBar ">
          <div style={{ width: "50%" }}>
            <h4>Estimate Details</h4>
          </div>
          <div
            style={{ width: "50%" }}
            className="d-flex justify-content-end text-end"
          >
            {formData.ServiceRequestId ? (
              <NavLink
                to={`/service-requests/add-sRform?id=${formData.ServiceRequestId}`}
              >
                <p
                  style={{ textDecoration: "underline" }}
                  className="text-black me-2"
                >
                  Service Request# {formData.ServiceRequestNumber}
                </p>
              </NavLink>
            ) : (
              <></>
            )}
            {qBError !== "" ? (
              <CustomizedTooltips title={qBError} placement={"top"}>
                <InfoOutlinedIcon color="error" sx={{ fontSize: 30 }} />
              </CustomizedTooltips>
            ) : (
              <></>
            )}
          </div>
        </div>

        <>
          {loading ? (
            <div className="center-loader">
              <CircularProgress />
            </div>
          ) : (
            <>
              <div className="card-body">
                {formData.isDelete && (
                  <div class="alert alert-danger w-100 mb-0" role="alert">
                    This Estimate has been deleted
                  </div>
                )}
                <div className="row ">
                  <div className="col-md-3">
                    <div className="col-md-12">
                      <label className="form-label">
                        Customers <span className="text-danger">*</span>
                      </label>

                      <CustomerAutocomplete
                        formData={formData}
                        setFormData={setFormData}
                        submitClicked={submitClicked}
                        handlePopup={handlePopup}
                        setBtnDisable={setBtnDisable}
                        checkQb={true}
                      />
                    </div>
                    <div className=" col-md-12 mt-2">
                      <label className="form-label">
                        Date<span className="text-danger">*</span>
                      </label>
                      <TextField
                        value={formatDate(formData.IssueDate)}
                        name="IssueDate"
                        onChange={handleInputChange}
                        className="input-limit-datepicker"
                        type="date"
                        variant="outlined"
                        size="small"
                        error={submitClicked && !formData.IssueDate}
                        // helperText={
                        //   submitClicked && !formData.CustomerId
                        //     ? "Issue Date is required"
                        //     : ""
                        // }
                        required
                        fullWidth
                      />
                    </div>
                    <div className="col-md-12  mt-2">
                      <div className="row">
                        <div className="col-md-auto">
                          <label className="form-label">
                            Service Locations
                          </label>
                        </div>
                        <div className="col-md-3">
                          {" "}
                          {formData.CustomerId ? (
                            <ServiceLocations
                              fetchServiceLocations={fetchServiceLocations}
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
                        onChange={(event, newValue) =>
                          handleAutocompleteChange(
                            "ServiceLocationId",
                            "ServiceLocationId",
                            event,
                            newValue
                          )
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.ServiceLocationId === value.ServiceLocationId
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label=""
                            placeholder="Service Locations"
                            // error={submitClicked && !formData.ServiceLocationId}
                            className="bg-white"
                          />
                        )}
                        aria-label="Default select example"
                      />
                    </div>
                    <div className="col-md-12 mt-2">
                      <div className="row">
                        <div className="col-md-auto">
                          <label className="form-label">Contact</label>
                        </div>
                        <div className="col-md-3">
                          {" "}
                          {formData.CustomerId ? (
                            <Contacts
                              fetctContacts={fetctContacts}
                              customerId={formData.CustomerId}
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
                          // error={submitClicked && selectedContacts.length <= 0}
                          />
                        )}
                        aria-label="Contact select"
                      />
                    </div>
                    <div className="row ">
                      {/* <div className="col-md-5 mt-2  ">
                        <label htmlFor="firstName" className="form-label">
                          Labor
                        </label>
                        <input
                          type="number"
                          className="form-control number-input number-input"
                          name="LaborRate"
                          value={formData.LaborRate}
                          onChange={handleChange}
                          placeholder="Labor"
                        />
                      </div> */}

                      {/* <div
                        className="col-md-7  mt-2  d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.isPartial} // bind to state
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isPartial: e.target.checked,
                            })
                          }
                        /> 
                        <h5
                          className="fw-normal"
                          style={{ marginLeft: "9px", marginTop: "7px" }}
                        >
                          Partial Invoice
                        </h5>
                      </div> */}
                      <div className="col-md-7  mt-2  d-flex align-items-center" style={{ cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isPartialCheckbox" // 🔑 required to link with label
                          checked={formData.isPartial}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isPartial: e.target.checked,
                            })
                          }
                        />
                        <label
                          htmlFor="isPartialCheckbox"
                          // className="fw-normal"
                          style={{ marginLeft: "9px", marginTop: "4px", cursor: "pointer" }}
                        >
                          Partial Invoice
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    {" "}
                    <div className="col-md-12  ">
                      <label className="form-label">Estimate No.</label>
                      <TextField
                        value={copyEstimates ? "" : formData.EstimateNumber}
                        name="EstimateNumber"
                        // onChange={handleInputChange}
                        type="text"
                        variant="outlined"
                        placeholder="Estimate No"
                        size="small"
                        fullWidth
                      />
                    </div>
                    <div className="col-md-12 mt-2 ">
                      <label className="form-label">Regional Manager</label>
                      <Autocomplete
                        id="staff-autocomplete"
                        size="small"
                        options={staffData.filter(
                          (staff) => {
                            return staff.Role === "Regional Manager" || staff.Role === "Account Manager" || staff?.isSuperAdmin

                          }
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
                        onChange={(event, newValue) =>
                          handleAutocompleteChange(
                            "RegionalManagerId",
                            "UserId",
                            event,
                            newValue
                          )
                        }
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
                            // error={submitClicked && !formData.RegionalManagerId}
                            placeholder="Choose..."
                            className="bg-white"
                          />
                        )}
                      />
                    </div>
                    <div className="col-md-12 mt-2">
                      <label className="form-label">Requested by</label>
                      <Autocomplete
                        id="staff-autocomplete"
                        size="small"
                        options={staffData.filter(
                          (staff) => staff.Role !== "Admin"
                        )}
                        getOptionLabel={(option) =>
                          option.FirstName + " " + option.LastName || ""
                        }
                        value={
                          staffData.find(
                            (staff) => staff.UserId === formData.RequestedBy
                          ) || null
                        }
                        onChange={(event, newValue) =>
                          handleAutocompleteChange(
                            "RequestedBy",
                            "UserId",
                            event,
                            newValue
                          )
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.UserId === value.RequestedBy
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
                            // error={submitClicked && !formData.RequestedBy}
                            placeholder="Choose..."
                            className="bg-white"
                          />
                        )}
                      />
                    </div>
                    <div className="col-md-12  mt-2">
                      <label className="form-label">Status</label>
                      <Select
                        aria-label="Default select example"
                        variant="outlined"
                        value={formData.EstimateStatusId || 4}
                        onChange={handleStatusChange}
                        name="Status"
                        size="small"
                        // error={submitClicked && !formData.EstimateStatusId}
                        placeholder="Select Status"
                        fullWidth
                      >
                        {estimateStatus.map((status, index) => (
                          <MenuItem key={index} value={status.EstimateStatusId}>
                            {status.Status}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                    <div className=" col-md-12 mt-2">
                      {formData.CreatedDate ? (
                        <label className="form-label">
                          Created Date:{" "}
                          {TblDateFormat(formData.CreatedDate, true, true)}
                        </label>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="col-md-12 ">
                      <label className="form-label">
                        {tags.length <= 1 ? "Tag" : "Tags"}
                      </label>
                      {/* <Autocomplete
                        id="inputState19"
                        size="small"
                        multiple
                        options={tags}
                        getOptionLabel={(option) => option.Tag || ""}
                        value={tags?.filter((tag) =>
                          (formData.Tags
                            ? formData.Tags.split(", ")
                            : []
                          ).includes(tag.Tag)
                        )}
                        onChange={handleTagAutocompleteChange}
                        isOptionEqualToValue={(option, value) =>
                          option.Tag === value.Tag
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label=""
                            placeholder="Tags"
                            className="bg-white"
                          />
                        )}
                        aria-label="Default select example"
                      /> */}
                      <Autocomplete
                        id="inputState19"
                        size="small"
                        multiple
                        options={tags}
                        getOptionLabel={(option) => option.Tag || ""}
                        value={tags?.filter((tag) =>
                          formData.tblEstimateEstimateTags?.some(
                            (selected) =>
                              selected.EstimateTagId === tag.EstimateTagId
                          )
                        )}
                        onChange={handleTagAutocompleteChange}
                        isOptionEqualToValue={(option, value) =>
                          option.EstimateTagId === value.EstimateTagId
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label=""
                            placeholder={tags.length <= 1 ? "Tag" : "Tags"}
                            className="bg-white"
                          />
                        )}
                        aria-label="Default select example"
                      />
                    </div>

                    {/* <div className="col-md-12  mt-2">
                        <label htmlFor="firstName" className="form-label">
                        Labor 
                        </label>
                        <input
                          type="number"
                          className="form-control number-input number-input"
                          name="Labor"
                          value={formData.Labor  }
                          onChange={handleChange}
                          placeholder="Labor"
                        />
                      </div> */}
                    {loggedInUser?.CompanyId == 2 && (
                      <div className="col-md-12">
                        <label className="form-label">Estimate Type</label>
                        <Autocomplete
                          id="inputStateEstimateType"
                          size="small"
                          options={estimateType}
                          getOptionLabel={(option) => option.Type || ""}
                          value={
                            estimateType.find(
                              (type) =>
                                type.EstimateTypeId === formData.EstimateTypeId
                            ) || null
                          }
                          onChange={(event, newValue) =>
                            handleEstimateTypeChange({
                              target: {
                                name: "EstimateTypeId",
                                value: newValue?.EstimateTypeId || "",
                              },
                            })
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.EstimateTypeId === value.EstimateTypeId
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Estimate Type"
                              className="bg-white"
                            />
                          )}
                          aria-label="Default select example"
                        />
                      </div>
                    )}
                    <div className="col-md-12  mt-2 ">
                      <label className="form-label">
                        Linked Purchase Order
                      </label>

                      <MultiSelectDD
                        property1="PurchaseOrderId"
                        property2="PurchaseOrderNumber"
                        endPoint="/PurchaseOrder/GetSearchPurchaseOrderList"
                        placeholder="Purchase Order No"
                        multiSelect={true}
                        setPayload={setSelectedPos}
                        payload={selectedPos}
                        nav="/purchase-order/add-po?id="
                      />
                    </div>
                    <div className="mt-2 " style={{ paddingLeft: "14px", paddingRight: "14px" }}>
                      <LinkingBadges
                        data={selectedPos}
                        setData={setSelectedPos}
                      />
                    </div>

                    {/* <div
                      className="col-md-12 mt-2 "
                      style={{ position: "relative" }}
                    >
                      <label className="form-label">Linked Bill</label>

                      <MultiSelectDD
                        property1="BillId"
                        property2="BillNumber"
                        endPoint=""
                        placeholder="Bill No"
                        setPayload={setSelectedBills}
                        payload={selectedBills}
                        nav="/Bills/add-bill?id="
                      />
                    </div> */}
                  </div>
                  <div className="col-md-3">
                    <div className=" col-md-12 ">
                      <label className="form-label">Approved Date</label>
                      <TextField
                        value={formatDate(formData.ApprovedDate)}
                        name="ApprovedDate"
                        // onChange={handleInputChange}
                        disabled
                        className="input-limit-datepicker"
                        type="date"
                        variant="outlined"
                        size="small"
                        // helperText={
                        //   submitClicked && !formData.CustomerId
                        //     ? "Issue Date is required"
                        //     : ""
                        // }

                        fullWidth
                      />
                    </div>


                    <div className="col-md-12  mt-2">
                      <MultiSelectAutocomplete
                        options={staffData?.filter((staff) => staff?.Role === "Foreman")}
                        property="ForemanId"
                        label="Select Foreman"
                        selectedOptions={selectedForemen}
                        setSelectedOptions={setSelectedForemen}
                        fullList={staffData || []}
                        error={false}
                        required={false}
                      />
                    </div>
                    <div className="col-md-12  mt-2">
                      <label className="form-label">
                        Linked Invoice
                      </label>
                      <MultiSelectDD
                        property1="InvoiceId"
                        property2="InvoiceNumber"
                        invoice={true}
                        endPoint="/Invoice/GetSearchInvoiceList"
                        placeholder="Invoice No"
                        multiSelect={true}
                        setPayload={setSelectedInvoice}
                        payload={selectedInvoice}
                        isPartial={formData?.isPartial}
                        idParam={idParam}
                        totalAmount={formData.TotalAmount}
                      />
                    </div>
                    <div className="mt-2 " style={{ paddingLeft: "14px", paddingRight: "14px" }}>
                      <LinkingBadges
                        data={selectedInvoice}
                        setData={setSelectedInvoice}
                        invoices
                        totalAmount={formData.TotalAmount}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* item table */}
              <div className="itemtitleBar">
                <h4>Items</h4>
              </div>
              <div className="card-body pt-0">
                <div className="estDataBox">
                  <div className="table-responsive active-projects style-1 mt-2">
                    <table id="empoloyees-tblwrapper" className="table">
                      <thead>
                        <tr>
                          <th style={{ width: "2em" }}></th>
                          <th>Item</th>
                          <th>Description</th>
                          <th
                            onClick={handleSort}
                            style={{ cursor: "pointer" }}
                          >
                            <span>
                              Qty{" "}
                              {sortOrder === "asc" ? (
                                <ArrowUpwardIcon fontSize="small" />
                              ) : (
                                <ArrowDownwardIcon fontSize="small" />
                              )}
                            </span>
                          </th>
                          <th>Rate</th>
                          <th>Amount $</th>
                          <th>Cost Price</th>
                          <th>Is Approved</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.tblEstimateItems &&
                          formData.tblEstimateItems.length > 0 ? (
                          formData.tblEstimateItems
                            .filter((item) => item.isCost === false)
                            .sort((a, b) => a.OrderBy - b.OrderBy) // Filter items with isCost equal to 1
                            .map((item, index) => (
                              <DraggableRow
                                key={index}
                                index={index}
                                item={item}
                                moveRow={moveRow}
                                handleDescriptionChange={
                                  handleDescriptionChange
                                }
                                handleQuantityChange={handleQuantityChange}
                                handleRateChange={handleRateChange}
                                handleCostChange={handleCostChange}
                                handleIsApproved={handleIsApproved}
                                deleteItem={deleteItem}
                                quantityInputRef={
                                  index === formData.tblEstimateItems.length - 1
                                    ? quantityInputRef
                                    : null
                                }
                              />
                            ))
                        ) : (
                          <></>
                        )}
                        <tr>
                          <td style={{ width: "2em" }}></td>
                          <td>
                            <>
                              <Autocomplete
                                options={searchResults}
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
                                    label="Search for items..."
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onChange={handleItemChange}
                                    onClick={() => {
                                      getItems();
                                    }}
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
                            <textarea
                              size="small"
                              rows="2"
                              style={{ width: "23em" }}
                              value={itemInput?.Description}
                              // onChange={(e) =>
                              //   setItemInput({
                              //     ...itemInput,
                              //     Description: e.target.value,
                              //   })
                              // }
                              className="form-control form-control-sm"
                              placeholder="SaleDescription"
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
                              value={itemInput.Rate || ""}
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
                                  // Handle item addition when Enter key is pressed
                                  e.preventDefault(); // Prevent form submission
                                  handleAddItem();
                                }
                              }}
                            />
                          </td>
                          <td className="text-right">
                            <h5 style={{ margin: "0" }}>
                              {itemInput
                                ? (itemInput.Rate * itemInput.Qty).toFixed(2)
                                : 0}
                            </h5>
                          </td>
                          <td>
                            <input
                              type="number"
                              name="CostPrice"
                              className="form-control form-control-sm number-input"
                              value={itemInput.PurchasePrice || ""}
                              onChange={(e) =>
                                setItemInput({
                                  ...itemInput,
                                  PurchasePrice: Number(e.target.value),
                                })
                              }
                              onClick={(e) => {
                                setSelectedItem({
                                  ...selectedItem,
                                  PurchasePrice: 0,
                                });
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  // Handle item addition when Enter key is pressed
                                  e.preventDefault(); // Prevent form submission
                                  handleAddItem();
                                }
                              }}
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Files */}

              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="row">
                      <div className="col-md-12 col-lg-12">
                        <div className="basic-form">
                          <form>
                            <label className="form-label">Estimate Notes</label>
                            <div className="mb-3">
                              <TextArea
                                placeholder="Estimate Notes"
                                value={formData.EstimateNotes}
                                name="EstimateNotes"
                                onChange={handleInputChange}
                              ></TextArea>
                            </div>
                          </form>
                        </div>
                      </div>
                      <div className="col-md-12 col-lg-12">
                        <div className="basic-form">
                          <form>
                            {/* <h4 className="card-title">Service Location Notes</h4> */}
                            <label className="form-label">
                              Service Location Notes
                            </label>
                            <div className="mb-3">
                              <TextArea
                                placeholder="Service Location Notes"
                                value={formData.ServiceLocationNotes}
                                name="ServiceLocationNotes"
                                onChange={handleInputChange}
                              ></TextArea>
                            </div>
                          </form>
                        </div>
                      </div>
                      <div className="col-md-12 col-lg-12">
                        <FileUploadButton onClick={trackFile}>
                          Upload File
                        </FileUploadButton>
                      </div>
                    </div>
                  </div>
                  {formData?.isPartial && <div className="col-md-3  ms-auto sub-total">
                    <table className="table table-clear table-borderless custom-table custom-table-row">
                      <tbody>
                        <tr>
                          <td className="left">
                            <strong>Estimate Total</strong>
                          </td>
                          <td className="right text-right">
                            ${formatAmount(subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td className="left">
                            <strong>Remaining</strong>
                          </td>
                          <td className="right text-right">
                            {formatCurrency(totalItemAmount - totalAmountSum)}
                          </td>

                        </tr>


                        <tr>
                          <td className="left custom-table-row">
                            <div
                              style={{ width: "13em" }}
                              className="input-group"
                            >
                              <strong className="mt-2">Labor</strong>
                              {/* <input
                                type="text"
                                style={{
                                  width: "5em",
                                  marginLeft: "3em",
                                  borderRadius: "8px",
                                }}
                                className="form-control form-control-sm"
                                name="laborRate"
                                value={laborRate}
                                onChange={laborRateChange}
                                placeholder="0"
                              />
                              <span className="mt-2"> &nbsp;&nbsp;$</span> */}
                              <div style={{ position: "relative", display: "inline-block", width: "6.5em", marginLeft: "3em" }}>
                                <input
                                  type="text"
                                  style={{
                                    width: "100%",
                                    paddingRight: "1.5em", // space for the $ sign
                                    borderRadius: "8px",
                                  }}
                                  className="form-control form-control-sm estimateInput"
                                  name="laborRate"
                                  value={laborRate}
                                  onChange={laborRateChange}
                                  placeholder="0"
                                />
                                <span
                                  style={{
                                    position: "absolute",
                                    right: "0.5em",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6c757d",
                                    pointerEvents: "none",
                                  }}
                                >
                                  $
                                </span>
                              </div>

                            </div>
                          </td>
                          <td className="right text-right">

                            {laborRate && totalItemAmount
                              ? `${formatAmount((laborRate / totalItemAmount) * 100)}%`
                              : '0%'}


                          </td>
                        </tr>

                        <tr>
                          <td className="left custom-table-row">
                            <div
                              style={{ width: "12em" }}
                              className="input-group"
                            >
                              <strong>Expense</strong>

                              <span span style={{ marginLeft: "13px" }}>   {`$${formatAmount(totalBillAmount)}`} </span>
                            </div>
                          </td>
                          <td className="right text-right">

                            {totalBillAmount && totalItemAmount
                              ? `${formatAmount((totalBillAmount / totalItemAmount) * 100)}%`
                              : "0%"}

                          </td>
                        </tr>


                        <tr>
                          <td className="left custom-table-row">
                            <div
                              style={{ width: "12em" }}
                              className="input-group"
                            >
                              <strong >Profit</strong>

                              <span style={{ marginLeft: "13px" }}>   {formatCurrency(totalAmountSum - totalBillAmount - laborRate)} </span>
                            </div>
                          </td>
                          <td className="right text-right">

                            {totalAmountSum && totalBillAmount && laborRate
                              ? `${formatAmount(((totalAmountSum - totalBillAmount - laborRate) / totalItemAmount) * 100)}%`
                              : "0%"}

                          </td>
                        </tr>
                        <tr>
                          <td className="left custom-table-row">
                            <div
                              style={{ width: "12em" }}
                              className="input-group"
                            >



                            </div>
                          </td>
                          <td className="right text-right">



                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>}
                  <div className="col-md-4  ms-auto sub-total">
                    <table className="table table-clear table-borderless custom-table custom-table-row">
                      <tbody>
                        <tr>
                          <td className="left">
                            <strong>Subtotal</strong>
                          </td>
                          <td className="right text-right">
                            ${formatAmount(subtotal)}
                          </td>
                        </tr>

                        <tr>
                          <td className="left custom-table-row">
                            <div
                              style={{ width: "13em" }}
                              className="input-group"
                            >
                              <strong className="mt-2">Discount</strong>
                              {/* <input
                                type="text"
                                style={{
                                  width: "5em",
                                  marginLeft: "1em",
                                  borderRadius: "8px",
                                }}
                                className="form-control form-control-sm"
                                name="Discount"
                                value={totalDiscount}
                                onChange={discountChange}
                                placeholder="Discount"
                              />
                              <strong className="mt-2"> &nbsp;&nbsp;%</strong> */}
                              <div style={{ position: "relative", display: "inline-block", width: "6.5em", marginLeft: "1em" }}>
                                <input
                                  type="text"
                                  style={{
                                    width: "100%",
                                    paddingRight: "1.5em", // leave space for the percent sign
                                    borderRadius: "8px",
                                  }}
                                  className="form-control form-control-sm estimateInput "
                                  name="Discount"
                                  value={totalDiscount}
                                  onChange={discountChange}
                                  placeholder="Discount"
                                />
                                <span
                                  style={{
                                    position: "absolute",
                                    right: "0.5em",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6c757d", // Bootstrap muted text color
                                    pointerEvents: "none",
                                  }}
                                >
                                  %
                                </span>
                              </div>

                            </div>
                          </td>
                          <td className="right text-right">
                            $
                            {totalDiscount && subtotal
                              ? ((totalDiscount * subtotal) / 100).toFixed(2)
                              : 0}
                          </td>
                        </tr>


                        <tr>
                          <td className="left">
                            <strong>Total</strong>
                          </td>
                          <td className="right text-right">
                            <strong>${formatAmount(totalItemAmount)}</strong>
                          </td>
                        </tr>

                        <tr>
                          <td className="left">Total Expenses</td>
                          <td className="right text-right">
                            ${formatAmount(totalExpense)}
                          </td>
                        </tr>
                        <tr>
                          <td className="left">Total Profit</td>
                          <td className="right text-right">
                            ${formatAmount(totalProfit)}
                          </td>
                        </tr>
                        <tr>
                          <td className="left">Profit Margin(%)</td>
                          <td className="right text-right">
                            {profitPercentage ? profitPercentage.toFixed(2) : 0}
                            %
                          </td>
                        </tr>


                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="row text-start">
                  <div className="col-xl-12 col-lg-12 text-start">
                    <div className="card-body ps-0 row text-start">
                      {formData.tblEstimateFiles?.map((file, index) => (
                        <div
                          key={index}
                          className="col-md-2 col-md-2 mt-3 me-2 image-container"
                          style={{
                            width: "115px", // Set the desired width
                            height: "110px", // Set the desired height

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
                              handleDeletePLFile(index);
                            }}
                          >
                            <span>
                              <Delete color="error" />
                            </span>
                          </span>
                        </div>
                      ))}
                      {PrevFiles.map((file, index) => (
                        <div
                          key={index}
                          className="col-md-2 col-md-2 mt-3 me-2 image-container"
                          style={{
                            width: "115px",
                            height: "110px",
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
                            <p
                              className="file-name-background"
                              style={{
                                position: "absolute",
                                bottom: "0",
                                left: "0px",
                                right: "0",
                                textAlign: "center",
                                overflow: "hidden",

                                textOverflow: "ellipsis",
                                padding: "0px 5px",
                              }}
                            >
                              {file.FileName}
                            </p>
                          </a>

                          {selectedImages.some(
                            (selectedImage) =>
                              selectedImage.EstimateFileId ===
                              file.EstimateFileId
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
                              left: "70px",
                            }}
                            onClick={() => {
                              downloadFile(file.FilePath, file.FileName);
                            }}
                          >
                            <span>
                              <Download />
                            </span>
                          </span>
                          <span
                            className="file-delete-button"
                            style={{
                              left: "90px",
                            }}
                          >
                            <span
                              onClick={() => {
                                deleteEstmFile(file.EstimateFileId);
                                fetchEstimates(idParam);
                              }}
                            >
                              <Delete color="error" />
                            </span>
                          </span>
                        </div>
                      ))}

                      {Files.map((file, index) => (
                        <>
                          <div
                            key={index}
                            className="col-md-2 col-md-2 mt-3 image-container me-2"
                            style={{
                              width: "115px", // Set the desired width
                              height: "110px", // Set the desired height

                              position: "relative",
                            }}
                          >
                            {file.name?.includes(".pdf") ? (
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
                              className="file-name-background"
                              style={{
                                position: "absolute",
                                bottom: "0",
                                left: "0px",
                                right: "0",
                                textAlign: "center",
                                overflow: "hidden",

                                textOverflow: "ellipsis",
                                padding: "0px 5px",
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
                        </>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-2 row ">
                  <div className="col-md-5 col-sm-4">
                    <BackButton
                      onClick={() => {
                        // window.history.back()
                        setPunchListData({
                          ContactIds: [],
                        });
                        navigate(`/estimates`);
                        // window.history.back();
                      }}
                    >
                      back
                    </BackButton>
                  </div>
                  {!formData.isDelete && (
                    <div className="col-md-7 col-sm-7 p-0 text-right ">
                      {!copyEstimates && idParam ? (
                        <>
                          {loggedInUser.userRole == "1" ? (
                            <>
                              <FormControl className="me-2">
                                <Select
                                  labelId="estimateLink"
                                  aria-label="Default select example"
                                  variant="outlined"
                                  className="text-left"
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
                                      handleOpenPurchaseOrderModal();
                                      // navigate("/purchase-order/add-po");
                                    }}
                                  >
                                    Purchase Order
                                  </MenuItem>

                                  {selectedInvoice.length > 0 && !formData?.isPartial ? null : <MenuItem
                                    onClick={() => {
                                      handleOpenInvoiceModal();
                                      // navigate("/invoices/add-invoices");
                                    }}
                                    value={3}
                                  >
                                    Invoice
                                  </MenuItem>}
                                </Select>
                              </FormControl>
                            </>
                          ) : (
                            <></>
                          )}

                          <PrintButton
                            varient="mail"
                            onClick={handleMainButtonClick}
                          ></PrintButton>

                          <PrintButton
                            varient="print"
                            onClick={() => {
                              navigate(
                                `/estimates/estimate-preview?id=${idParam}`
                              );
                            }}
                          ></PrintButton>
                          <PrintButton
                            varient="Download"
                            onClick={() => {
                              handleOpenPdfDownloadModal();
                            }}
                          ></PrintButton>
                          {/* <PrintButton
                          varient="Download"
                          onClick={() => {
                            const url = `/estimates/estimate-preview?id=${idParam}&download=${1}`;
                            window.open(url, "_blank");
                          }}
                        ></PrintButton> */}
                        </>
                      ) : (
                        <></>
                      )}{" "}
                      {!copyEstimates && idParam ? (
                        <>
                          <LoaderButton
                            // loading={disableButton}
                            disable={disableButton}
                            // handleSubmit={() => {
                            //   setModalOpen(true);
                            // }}
                            handleSubmit={handleOpenCopyEstimateModal}
                            color={"customColor"}
                          >
                            Save as copy
                          </LoaderButton>
                        </>
                      ) : (
                        <></>
                      )}
                      {((!isEditMode && !menuAccess.isLoading && menuAccess.canCreate) || (isEditMode && !menuAccess.isLoading && menuAccess.canEdit)) ? (
                        <LoaderButton
                          disable={disableButton || btnDisable}
                          loading={disableButton || btnDisable}
                          handleSubmit={() => {
                            handleSubmit(
                              copyEstimates ? 0 : idParam,
                              copyEstimates ? "" : formData.EstimateNumber,
                              copyEstimates ? true : false,
                              copyEstimates ? 0 : 0,
                              copyEstimates ? formData?.EstimateId : 0
                            );
                          }}
                        >
                          Save
                        </LoaderButton>
                      ) : (
                        <Tooltip 
                          title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create estimates"} 
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
                  )}
                </div>
              </div>
            </>
          )}
        </>
      </div >
    </>
  );
};

export default AddEstimateForm;
