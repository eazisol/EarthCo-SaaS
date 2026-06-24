import React, { useContext, useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import Cookies from "js-cookie";
import formatDate from "../../custom/FormatDate";
import { FormControl, Select, MenuItem } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import useFetchInvoices from "../Hooks/useFetchInvoices";
import useFetchBills from "../Hooks/useFetchBills";
import { Delete, Create } from "@mui/icons-material";
import { Button } from "@mui/material";
import { Print, Email, Download } from "@mui/icons-material";
import { useEstimateContext } from "../../context/EstimateContext";
import { useNavigate, NavLink } from "react-router-dom";
import useDeleteFile from "../Hooks/useDeleteFile";
import TitleBar from "../TitleBar";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import { DataContext } from "../../context/AppData";
import useQuickBook from "../Hooks/useQuickBook";
import BackButton from "../Reusable/BackButton";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import FileUploadButton from "../Reusable/FileUploadButton";
import formatAmount from "../../custom/FormatAmount";
import PrintButton from "../Reusable/PrintButton";
import HandleDelete from "../Reusable/HandleDelete";
import { PDFDownloadLink } from "@react-pdf/renderer";
import POPdf from "./POPdf";
import { BsFiletypePdf } from "react-icons/bs";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import CustomAutocomplete from "../Reusable/CustomAutocomplete";
import imageCompresser from "../../custom/ImageCompresser";
import useGetData from "../Hooks/useGetData";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import LinkingBadges from "../Reusable/LinkingBadges";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

export const AddPO = ({ }) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const currentDate = new Date();

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  // setselectedPo = idParam;
  const { loggedInUser, setselectedPdf ,dynamicColorAndLogo} = useContext(DataContext);
  const initialFormData = {
    PurchaseOrderId: idParam,
    StatusId: 1,
    SupplierId: 0,
    BillId: 0,
    InvoiceId: 0,
    Requestedby: null,
    TermId: null,
    RegionalManager: null,
    DueDate: null,

    Date: currentDate,
    Tags: "",
    PurchaseOrderTypeId: null,
    PurchaseOrderNumber: "",
    isCreatedFromEstimate: 0,
  };

  const menuAccess = useMenuAccess();
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  
  // Determine if this is edit mode (has idParam)
  const isEditMode = !!(idParam && idParam !== 0);
  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.4065 14.8714H7.78821"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M14.4065 11.0338H7.78821"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M10.3137 7.2051H7.78827"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5829 2.52066C14.5829 2.52066 7.54563 2.52433 7.53463 2.52433C5.00463 2.53991 3.43805 4.20458 3.43805 6.74374V15.1734C3.43805 17.7254 5.01655 19.3965 7.56855 19.3965C7.56855 19.3965 14.6049 19.3937 14.6168 19.3937C17.1468 19.3782 18.7143 17.7126 18.7143 15.1734V6.74374C18.7143 4.19174 17.1349 2.52066 14.5829 2.52066Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
  const { syncQB } = useQuickBook();

  const [formData, setFormData] = useState(initialFormData);

  const [inputValue, setInputValue] = useState("");

  const [sLList, setSLList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [tags, setTags] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [terms, setTerms] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const { getListData, data } = useGetData();
  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSL, setSelectedSL] = useState(null);

  const [staffData, setStaffData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [addCustomerSuccess, setAddCustomerSuccess] = useState("");
  const [pdfTotal, setPdfTotal] = useState(0);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const navigate = useNavigate();

  const { invoiceList, fetchInvoices } = useFetchInvoices();
  const { billList, fetchBills } = useFetchBills();
  const { deletePOFile } = useDeleteFile();

  const { estimateLinkData, setEstimateLinkData } = useEstimateContext();
  const { fetchSupplierName, supplierName, setSupplierName } =
    useFetchCustomerName();
  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();

  const [isPoClosed, setIsPoClosed] = useState(false);
  const [PoPreviewData, setPoPreviewData] = useState({});
  const [qBError, setQBError] = useState("");

  const fetchpoData = async () => {
    if (idParam === 0) {
      return;
    }

    setLoading(true);
    getListData(
      `/SyncQB/CheckSyncLog?Id=${idParam}&Type=PurchaseOrder&CompanyId=${loggedInUser.CompanyId}`,
      (data) => {
        const parsedMessage = JSON.parse(data.Data.Message);
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
      const res = await axios.get(
        `${baseUrl}/api/PurchaseOrder/GetPurchaseOrder?id=${idParam}`,
        { headers }
      );
      setLoading(false);
      setPoPreviewData(res.data);
      setSelectedInvoice(res.data.EstimateInvoiceData)
      setFormData(res.data.Data);
      fetchSupplierName(res.data.Data.SupplierId);
      setInputValue(res.data.Data.CustomerId);
      if (res.data.Data.BillId) {
        setIsPoClosed(true);
      }
      setItemsList(res.data.ItemData);
      setPrevFiles(res.data.FileData);
    } catch (error) {
      setLoading(false);
      console.log("API call error", error);
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
  const fetchTags = async () => {
    axios
      .get(`${baseUrl}/api/Estimate/GetTagList`, {
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
  const fetchPurchaseOrderTypeList = async () => {
    axios
      .get(`${baseUrl}/api/PurchaseOrder/GetPurchaseOrderTypeList`, {
        headers,
      })

      .then((res) => {
        setPurchaseOrder(res.data);
      })
      .catch((error) => {
        setTags([]);
        console.log("contacts data fetch error", error);
      });
  };
  const fetchTerms = async () => {
    axios
      .get(`${baseUrl}/api/PurchaseOrder/GetTermList`, {
        headers,
      })
      .then((res) => {
        setTerms(res.data);
      })
      .catch((error) => {
        setTerms([]);
        console.log("contacts data fetch error", error);
      });
  };
  const fetchVendors = async (searchText = "") => {
    axios
      .get(
        `${baseUrl}/api/Supplier/GetSearchSupplierList?Search=${searchText}`,
        {
          headers,
        }
      )
      .then((res) => {
        setVendorList(res.data);
      })
      .catch((error) => {
        setVendorList([]);
        console.log("contacts data fetch error", error);
      });
  };

  const getEstimate = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimateList`,
        { headers }
      );
      setEstimates(response.data);
    } catch (error) {
      console.error("API Call Error:", error);
    }
  };

  const handleStaffAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "RegionalManager",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleTermsAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "TermId",
        value: newValue ? newValue.TermId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleTagAutocompleteChange = (event, newValues) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    const tagString = newValues.map((tag) => tag.Tag).join(", ");

    setFormData((prevData) => ({
      ...prevData,
      Tags: tagString,
    }));
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
  const [supplierAddress, setSupplierAddress] = useState("");
  const [btnDisable, setBtnDisable] = useState(false);

  const handlePopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
  };

  const handleVendorAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    setBtnDisable(false);
    if (newValue) {
      setFormData({
        ...formData,
        SupplierId: newValue.UserId,
        SupplierDisplayName: newValue.DisplayName,
      });
      getListData(
        `/SyncQB/CheckSync?QBID=${newValue.QBId}&Type=Vendor&CompanyId=${loggedInUser.CompanyId}`,
        (id) => {
          setBtnDisable(false);
        },
        (err) => {
          console.log("check error", err);
          setBtnDisable(true);
          handlePopup(true, "error", "This Vendor is Inactive");
          // setOpenSnackBar(true);
          // setSnackBarColor("error");
          // setSnackBarText("error changing Sale Price");
        }
      );
      // fetchSupplierName(newValue.UserId);
      setSupplierAddress(newValue.Address);
      // handleChange(simulatedEvent);
    } else {
      setSupplierAddress("");
    }

    // handleChange(simulatedEvent);
  };

  const handleEstimatesAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    if (newValue) {
      // Update the formData with both EstimateId and EstimateNumber
      setFormData((prevData) => ({
        ...prevData,
        EstimateId: newValue.EstimateId,
        EstimateNumber: newValue.EstimateNumber,
      }));
    } else {
      // Handle the case where the newValue is null (e.g., when the selection is cleared)
      // Reset both EstimateId and EstimateNumber in formData
      setFormData((prevData) => ({
        ...prevData,
        EstimateId: "",
        EstimateNumber: "",
      }));
    }
  };

  const handleContactAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    const simulatedEvent = {
      target: {
        name: "ContactId",
        value: newValue ? newValue.ContactId : "",
      },
    };

    handleInputChange(simulatedEvent);
  };

  const handleBillAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    setFormData((prevData) => ({
      ...prevData,
      BillId: newValue.BillId,
      BillNumber: newValue.BillNumber,
    }));
  };
  const handleInvoiceAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    setFormData((prevData) => ({
      ...prevData,
      InvoiceId: newValue.InvoiceId,
      InvoiceNumber: newValue.InvoiceNumber,
    }));
  };

  const handleRBAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "Requestedby",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleInputChange = (e, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    setEmptyFieldsError(false);
    setDisableButton(false);
    const { name, value } = e.target;

    setSelectedCustomer(newValue);
    setSelectedSL(newValue);

    // Initialize parsedValue with the original value
    const parsedValue = value;

    // Check if the field name is "StatusId" and convert the value to a number if it is
    if (name === "StatusId") {
      setFormData((prevData) => ({ ...prevData, [name]: parsedValue }));
    } else {
      // For other fields, just update them without modifying StatusId
      setFormData((prevData) => ({ ...prevData, [name]: parsedValue }));
    }
  };

  const handleChange = (e) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    setEmptyFieldsError(false);
    setDisableButton(false);
    // Extract the name and value from the event target
    const { name, value } = e.target;

    // Check if the field name is "StatusId"
    if (name === "StatusId") {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    } else {
      // For other fields, just update them without modifying StatusId
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  useEffect(() => {
    fetchServiceLocations(formData.CustomerId);
    fetctContacts(formData.CustomerId);
  }, [formData]);
  useEffect(() => {
    fetchSupplierName(formData.SupplierId);
  }, [formData.SupplierId]);

  useEffect(() => {
    fetchStaffList();
    fetchTags();
    fetchPurchaseOrderTypeList();
    fetchTerms();
    fetchVendors();
    // getEstimate();
    fetchpoData();
    // fetchInvoices();
    // fetchBills();
    setFormData((prevData) => ({
      ...prevData,
      StatusId: 1,
    }));

    if (estimateLinkData.tblEstimateItems) {
      setItemsList(
        estimateLinkData.tblEstimateItems.filter(
          (item) => item.IsApproved === true
        )
      );
    }
    if (estimateLinkData.FileData) {
      setEstimateFiles(estimateLinkData.FileData);
    }

    setFormData((prevData) => ({
      ...prevData,
      EstimateId: estimateLinkData.EstimateId,
      EstimateNumber: estimateLinkData.EstimateNumber,
      CustomerName: estimateLinkData.CustomerDisplayName,
      RegionalManager: estimateLinkData.RegionalManagerId,
      Requestedby: estimateLinkData.RequestedBy,
      isCreatedFromEstimate: estimateLinkData?.isCreatedFromEstimate ? 1 : 0,
    }));
  }, []);

  // items

  const [itemsList, setItemsList] = useState([]);
  const [itemInput, setItemInput] = useState({
    Name: "",
    Qty: 1,
    Description: "",
    Rate: null,
  });
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [showItem, setShowItem] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
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

  const handleAddItem = () => {
    // Adding the new item to the itemsList
    if (!itemInput.ItemId) {
      return;
    }
    setItemsList((prevItems) => [
      ...prevItems,
      { ...itemInput }, // Ensure each item has a unique 'id'
    ]);
    // Reset the input fields
    setSearchText("");
    setSelectedItem({});
    setItemInput({
      Name: "",
      Qty: 1,
      Description: "",
      Rate: null,
    });
  };

  const handleDescriptionChange = (itemId, event) => {
    const updatedItemsList = itemsList.map((item, index) => {
      if (index === itemId) {
        return {
          ...item,
          Description: event.target.value,
        };
      }
      return item;
    });
    setItemsList(updatedItemsList);
  };

  const handleQuantityChange = (itemId, event) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = itemsList.map((item, index) => {
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

      setItemsList(updatedItems);
    }
  };

  const handleRateChange = (itemId, event) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^-?[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = itemsList.map((item, index) => {
        if (index === itemId) {
          const updatedItem = { ...item };
          updatedItem.Rate = inputValue; // Keep input value as string for display

          // Calculate amount if input is a valid number
          const parsedQty = parseFloat(inputValue);

          return updatedItem;
        }
        return item;
      });

      setItemsList(updatedItems);
    }
  };
  const handleCostChange = (itemId, event) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^-?[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = itemsList.map((item, index) => {
        if (index === itemId) {
          const updatedItem = { ...item };
          updatedItem.PurchasePrice = inputValue; // Keep input value as string for display

          // Calculate amount if input is a valid number
          const parsedQty = parseFloat(inputValue);

          return updatedItem;
        }
        return item;
      });

      setItemsList(updatedItems);
    }
  };

  const handleItemChange = (event) => {
    setShowItem(true);
    setSearchText(event.target.value);

    setSelectedItem({}); // Clear selected item when input changes
  };
  const handlepurchaseTypeChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      PurchaseOrderTypeId: event.target.value, // Ensure value is a number
    }));
  };
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSearchText(item.ItemName); // Set the input text to the selected item's name

    setBtnDisable(false);
    getListData(
      `/SyncQB/CheckSync?QBID=${item.QBId}&Type=Item&CompanyId=${loggedInUser.CompanyId}`,
      (id) => { },
      (err) => {
        console.log("check error", err);
        setItemsList((prevItems) => [...prevItems.slice(0, -1)]);
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

    setItemsList((prevItems) => [
      ...prevItems,
      {
        ...itemInput,
        ItemId: item.ItemId,
        Name: item.ItemName,
        Description: item.SaleDescription,
        Rate: item.SalePrice,
        PurchasePrice: item.PurchasePrice,
      }, // Ensure each item has a unique 'id'
    ]);
    setShowItem(false);
    setSearchResults([]); // Clear the search results

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
  }, [itemsList.length]);

  const deleteItem = (id) => {
    const updatedItemsList = itemsList.filter((item, index) => index !== id);
    setItemsList(updatedItemsList);
  };

  const calculateTotalAmount = () => {
    if (itemsList) {
      const total = itemsList.reduce((acc, item) => {
        // return acc + item.PurchasePrice * item.Qty;
        return acc + item.Qty * item.Rate;
      }, 0);
      return total;
    } else {
      return 0;
    }
  };
  const calculateTotalAmountForPDF = () => {
    if (itemsList) {
      const total = itemsList.reduce((acc, item) => {
        return acc + item.Qty * item.Rate;
        // return acc + item.PurchasePrice * item.Qty;
      }, 0);
      return total;
    } else {
      return 0;
    }
  };
  useEffect(() => {
    // Calculate the total amount and update the state
    const total = calculateTotalAmount();
    const totalForPdf = calculateTotalAmountForPDF();
    setPdfTotal(totalForPdf);
    setTotalAmount(total);
  }, [itemsList]);

  // file
  const [PrevFiles, setPrevFiles] = useState([]);
  const [estimateFiles, setEstimateFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const compressedImg = await imageCompresser(uploadedFile);
      setSelectedFiles((prevFiles) => [...prevFiles, compressedImg]);
    }
  };

  const handleDeleteFile = (indexToDelete) => {
    // Create a new array without the file to be deleted
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToDelete
    );

    // Update the selectedFiles state with the new array
    setSelectedFiles(updatedFiles);
  };

  const handleDeleteEstmFile = (indexToDelete) => {
    // Make a copy of the current estimateFiles array
    const updatedFiles = [...estimateFiles];

    // Remove the file at the specified index
    updatedFiles.splice(indexToDelete, 1);

    // Update the state with the new array without the deleted file
    setEstimateFiles(updatedFiles);
  };

  // submit handler
  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check permissions before submitting
    if (isEditMode) {
      // Updating existing purchase order - need edit access
      if (!menuAccess.isLoading && !menuAccess.canEdit) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update purchase orders");
        return;
      }
    } else {
      // Creating new purchase order - need create access
      if (!menuAccess.isLoading && !menuAccess.canCreate) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create purchase orders");
        return;
      }
    }
    
    setSubmitClicked(true);

    if (
      !formData.Date ||
      !formData.SupplierId
      // !formData.RegionalManager ||
      // !formData.Requestedby
    ) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      return;
    }

    if (itemsList.length <= 0) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please Add Atleast one item");

      return;
    }
    setDisableButton(true);

    const itemArray = itemsList.map((item) => ({
      ...item,
      Rate: item.Rate ? parseFloat(item.Rate) : 0,
      Qty: item.Qty ? parseFloat(item.Qty) : 0,
      PurchasePrice: item.PurchasePrice ? parseFloat(item.PurchasePrice) : 0,
    }));

    const postData = new FormData();

    // Merge the current items with the new items for EstimateData
    const PurchaseOrderData = {
      ...formData,
      Amount: totalAmount,
      PurchaseOrderId: idParam,
      tblPurchaseOrderItems: itemArray,
      tblPurchaseOrderFiles: estimateFiles,
      CompanyId: Number(loggedInUser.CompanyId),
      PurchaseOrderTypeId: Number(formData?.PurchaseOrderTypeId),
      // CreatedBy: 2,
      // EditBy: 2,
      // isActive: true,
    };

    postData.append("PurchaseOrderData", JSON.stringify(PurchaseOrderData));
    // Appending files to postData
    selectedFiles.forEach((fileObj) => {
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
        `${baseUrl}/api/PurchaseOrder/AddPurchaseOrder`,
        postData,
        { headers }
      );
      syncQB(response.data.SyncId);

      setEstimateLinkData({});
      setAddCustomerSuccess(response.data.Message);
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      navigate(`/purchase-order/add-po?id=${response.data.Id}`);
      setTimeout(() => {
        setDisableButton(false);
        window.location.reload();
      }, 4000);
    } catch (error) {
      setError(true);
      setErrorMessage(error.response.data);
      setDisableButton(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);

      console.error("API Call Error:", error);
    }

    // Logging FormData contents (for debugging purposes)
    for (let [key, value] of postData.entries()) {
    }
    // window.location.reload();
  };

  return (
    <>
      <TitleBar icon={icon} title="Add Purchase order" />
      {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>Read-only mode:</strong> You don't have permission to update this purchase order. You can view the information but cannot make changes.
        </div>
      )}
      {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>No create access:</strong> You don't have permission to create new purchase orders.
        </div>
      )}
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
        <>
          <div className="add-item">
            <div className="card">
              {" "}
              {formData.isDelete && (
                <div class="alert alert-danger w-100 mb-0" role="alert">
                  This Purchase Order has been deleted
                </div>
              )}
              <div className="itemtitleBar d-flex ">
                <div className="w-50">
                  <h4>Purchase Order Details</h4>
                </div>
                <div className="w-50 text-end">
                  {qBError !== "" ? (
                    <CustomizedTooltips title={qBError} placement={"top"}>
                      <InfoOutlinedIcon color="error" sx={{ fontSize: 30 }} />
                    </CustomizedTooltips>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className=" row mb-3">
                  {/* <div className="col-xl-3">
                <label className="form-label">Customer<span className="text-danger">*</span></label>
                <TextField
                  type="text"
                  name="CustomerId"
                  value={inputValue} // Bind the input value state to the value of the input
                  onChange={handleAutocompleteChange}
                  error={submitClicked && !formData.CustomerId}
                  placeholder="Customers"
                  size="small"
                  className="form-control form-control-sm"
                />
                {showCustomersList && customersList && (
                  <ul
                    style={{ top: "83px" }}
                    className="search-results-container"
                  >
                    {customersList.map((customer) => (
                      <li
                        style={{ cursor: "pointer" }}
                        key={customer.UserId}
                        onClick={() => {
                          selectCustomer(customer);
                        }} // Use the selectCustomer function
                      >
                        {customer.CompanyName}
                      </li>
                    ))}
                  </ul>
                )}
              </div> */}

                  {/* <div className="col-xl-3">
                <label className="form-label">Service location</label>
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
                      className="bg-white"
                    />
                  )}
                  aria-label="Default select example"
                />
              </div> */}
                  {/* <div className="col-xl-3">
                <label className="form-label">Contact</label>

                <Autocomplete
                  id="inputState299"
                  size="small"
                  options={contactList}
                  getOptionLabel={(option) => option.FirstName || ""}
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
                      className="bg-white"
                    />
                  )}
                  aria-label="Contact select"
                />
              </div> */}
                  <div className="col-md-3">
                    <div className="row">
                      {" "}
                      <div className="col-md-12">
                        <label className="form-label">
                          Vendor<span className="text-danger">*</span>
                        </label>
                        <Autocomplete
                          id="inputState19"
                          size="small"
                          className="mb-2"
                          options={vendorList}
                          filterOptions={(options) => options}
                          getOptionLabel={(option) => option.DisplayName || ""}
                          value={
                            formData.SupplierDisplayName
                              ? { DisplayName: formData.SupplierDisplayName }
                              : ""
                          }
                          onChange={handleVendorAutocompleteChange}
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          isOptionEqualToValue={(option, value) =>
                            option.UserId === value.SupplierId
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label=""
                              onBlur={() => {
                                fetchSupplierName(formData.SupplierId);
                              }}
                              onClick={() => {
                                setSupplierName("");
                              }}
                              onChange={(e) => {
                                fetchVendors(e.target.value);
                                setFormData({
                                  ...formData,
                                  SupplierDisplayName: e.target.value,
                                });
                              }}
                              error={submitClicked && !formData.SupplierId}
                              placeholder="Vendors"
                              className="bg-white"
                              disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                            />
                          )}
                          aria-label="Default select example"
                        />
                      </div>
                      <div className=" col-md-12">
                        <label className="form-label">
                          Date<span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-2">
                          <TextField
                            type="date"
                            className="form-control"
                            name="Date"
                            value={formatDate(formData.Date)}
                            disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                            size="small"
                            error={submitClicked && !formData.Date}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="c-details">
                          <ul>
                            <li>
                              <span>Vendor Address</span>
                              <p>
                                {" "}
                                {supplierAddress ||
                                  formData.SupplierAddress ||
                                  ""}
                              </p>
                            </li>
                            <li>
                              <span>Shipping </span>
                              <p>
                                {" "}
                                {supplierAddress ||
                                  formData.SupplierAddress ||
                                  ""}
                              </p>
                            </li>
                            <li>
                              <span>Customer Name</span>
                              <p> {formData.CustomerName || ""}</p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-9">
                    <div className="row">
                      <div className="col-md-4">
                        <label className="form-label">Purchase Order #</label>
                        <div className="input-group mb-2">
                          <TextField
                            type="text"
                            size="small"
                            name="PurchaseOrderNumber"
                            onChange={handleChange}
                            value={formData.PurchaseOrderNumber}
                            className="form-control"
                            placeholder="Purchase Order No"
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Tags</label>
                        <Autocomplete
                          id="inputState19"
                          size="small"
                          multiple
                          options={tags}
                          getOptionLabel={(option) => option.Tag || ""}
                          value={tags.filter((tag) =>
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
                        />
                      </div>

                      <div className="col-md-4">
                        <div className="POInvoiceTable">
                        <LinkingBadges
                          // data={[
                          //   {
                          //     EstimateId: formData.EstimateId,
                          //     EstimateNumber: formData.EstimateNumber,
                          //     InvoiceId: formData.InvoiceId,
                          //     InvoiceNumber: formData.InvoiceNumber,
                          //   },
                          // ]}
                          data={selectedInvoice?.map((inv, idx) => ({
                            ...inv,
                            EstimateId:
                              idx === 0 ? formData.EstimateId : null,
                            EstimateNumber:
                              idx === 0 ? formData.EstimateNumber : null,
                          }))}
                          col1={{
                            header: "Estimate#",
                            number: "EstimateNumber",
                            id: "EstimateId",
                            to: "/estimates/add-estimate?id=",
                          }}
                          col2={{
                            header: "Invoice#",
                            number: "InvoiceNumber",
                            id: "InvoiceId",
                            to: "/invoices/add-invoices?id=",
                          }}
                          allowRemove={false}
                        />
                        </div> 
                      </div>
                      <div className=" col-md-4">
                        <label className="form-label">Due</label>
                        <div className="input-group mb-2">
                          <TextField
                            type="date"
                            className="form-control"
                            name="DueDate"
                            value={formatDate(formData.DueDate)}
                            size="small"
                            onChange={handleChange}
                            disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          />
                        </div>
                      </div>

                      <div className=" col-md-4">
                        <label className="form-label">Regional Manager</label>
                        <Autocomplete
                          id="staff-autocomplete"
                          size="small"
                          options={staffData.filter(
                            (staff) =>
                              staff.Role === "Regional Manager" ||staff.Role === "Account Manager"||staff?.isSuperAdmin
                          )}
                          getOptionLabel={(option) =>
                            option.FirstName + " " + option.LastName || ""
                          }
                          value={
                            staffData.find(
                              (staff) =>
                                staff.UserId === formData.RegionalManager
                            ) || null
                          }
                          onChange={handleStaffAutocompleteChange}
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          isOptionEqualToValue={(option, value) =>
                            option.UserId === value.RegionalManager
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
                              // error={submitClicked && !formData.RegionalManager}
                              placeholder="Choose..."
                              className="bg-white"
                              disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                            />
                          )}
                        />
                      </div>

                      <div className="col-md-4"></div>
                      <div className=" col-md-4">
                        <label className="form-label">Terms</label>
                        <Autocomplete
                          id="inputState19"
                          size="small"
                          options={terms}
                          className="mb-2"
                          getOptionLabel={(option) => option.Term || ""}
                          value={
                            terms.find(
                              (customer) => customer.TermId === formData.TermId
                            ) || null
                          }
                          onChange={handleTermsAutocompleteChange}
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          isOptionEqualToValue={(option, value) =>
                            option.TermId === value.TermId
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label=""
                              placeholder="Terms"
                              className="bg-white"
                              disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                            />
                          )}
                          aria-label="Default select example"
                        />
                      </div>
                      <div className=" col-md-4">
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
                              (staff) => staff.UserId === formData.Requestedby
                            ) || null
                          }
                          onChange={handleRBAutocompleteChange}
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          isOptionEqualToValue={(option, value) =>
                            option.UserId === value.Requestedby
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
                              // error={submitClicked && !formData.Requestedby}
                              placeholder="Choose..."
                              className="bg-white"
                              disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                            />
                          )}
                        />
                      </div>
                      <div className="col-md-4"></div>
                      <div className=" col-md-4">
                        <label className="form-label">Status</label>
                        <FormControl fullWidth variant="outlined">
                          <Select
                            name="StatusId"
                            size="small"
                            className="mb-2"
                            value={formData.StatusId || 1}
                            onChange={handleChange}
                            disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          >
                            <MenuItem value={1}>Open</MenuItem>
                            <MenuItem value={2}>Closed</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                      {/* <div className=" col-md-4">
                        <label className="form-label">
                          Invoice Number
                          {formData.InvoiceId ? (
                            <>
                              <a
                                href=""
                                style={{ color: "blue" }}
                                className="ms-2"
                                onClick={() => {
                                  navigate(
                                    `/invoices/add-invoices?id=${formData.InvoiceId}`
                                  );
                                }}
                              >
                                View
                              </a>
                            </>
                          ) : (
                            ""
                          )}
                        </label>

                        
                        <div style={{ position: "relative" }}>
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
                          <CustomAutocomplete
                            property1="InvoiceId"
                            property2="InvoiceNumber"
                            formData={formData}
                            setFormData={setFormData}
                            endPoint="/Invoice/GetSearchInvoiceList"
                            placeholder="Invoice No"
                          />
                        </div>
                      </div> */}
                      <div className="col-md-4">
                        <label className="form-label">Purchase Type</label>
                        <Autocomplete
                          id="inputStatePurchaseType"
                          size="small"
                          options={purchaseOrder}
                          getOptionLabel={(option) => option.Type || ""}
                          value={
                            purchaseOrder.find(
                              (type) =>
                                type.PurchaseOrderTypeId ===
                                formData.PurchaseOrderTypeId
                            ) || null
                          }
                          onChange={(event, newValue) =>
                            handlepurchaseTypeChange({
                              target: {
                                name: "PurchaseOrderTypeId",
                                value: newValue?.PurchaseOrderTypeId || "",
                              },
                            })
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.PurchaseOrderTypeId ===
                            value.PurchaseOrderTypeId
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Purchase Type"
                              className="bg-white"
                            />
                          )}
                          aria-label="Default select example"
                        />
                      </div>
                      <div className="col-md-4"></div>
                      {/* <div className=" col-md-4 mt-2">
                    <label className="form-label">Ship to</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        name="ShipTo"
                        value={formData.ShipTo}
                        onChange={handleChange}
                      />
                    </div>
                  </div> */}
                      <div className="col-md-4">
                        <label className="form-label">
                          Bill Number
                          {formData.BillId ? (
                            <>
                              <a
                                href=""
                                style={{ color: "blue" }}
                                className="ms-2"
                                onClick={() => {
                                  navigate(
                                    `/bills/add-bill?id=${formData.BillId}`
                                  );
                                }}
                              >
                                View
                              </a>
                            </>
                          ) : (
                            ""
                          )}
                        </label>

                        {/* <Autocomplete
                          size="small"
                          options={billList}
                          noOptionsText="No record found in system"
                          getOptionLabel={(option) => option.BillNumber || ""}
                          value={
                            billList.find(
                              (bill) => bill.BillId === formData.BillId
                            ) || null
                          }
                          onChange={handleBillAutocompleteChange}
                          isOptionEqualToValue={(option, value) =>
                            option.BillId === value.BillId
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label=""
                              fullWidth
                              placeholder="Bill No"
                              className="bg-white"
                            />
                          )}
                          aria-label="Contact select"
                        /> */}
                        <CustomAutocomplete
                          property1="BillId"
                          property2="BillNumber"
                          formData={formData}
                          setFormData={setFormData}
                          endPoint="/Bill/GetSearchBillList"
                          placeholder="Bill No"
                        />
                      </div>
                      <div className=" col-md-4">
                        <label className="form-label">
                          Linked Estimate
                          {formData.EstimateId ? (
                            <>
                              <a
                                href=""
                                style={{ color: "blue" }}
                                className="ms-2"
                                onClick={() => {
                                  navigate(
                                    `/estimates/add-estimate?id=${formData.EstimateId}`
                                  );
                                }}
                              >
                                View
                              </a>
                            </>
                          ) : (
                            ""
                          )}
                        </label>

                        {/* <Autocomplete
                      id="inputState19"
                      size="small"
                      options={estimates}
                      noOptionsText="No record found in system"
                      getOptionLabel={(option) => option.EstimateNumber || ""}
                      value={
                        estimates.find(
                          (customer) =>
                            customer.EstimateNumber === formData.EstimateNumber
                        ) || null
                      }
                      onChange={handleEstimatesAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.EstimateId === value.EstimateNumber
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          placeholder="Estimate No"
                        />
                      )}
                      aria-label="Default select example"
                    /> */}
                        <CustomAutocomplete
                          property1="EstimateId"
                          property2="EstimateNumber"
                          formData={formData}
                          setFormData={setFormData}
                          endPoint="/Estimate/GetSearchEstimateList"
                          placeholder="Estimate No"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* item table */}
              <div className="itemtitleBar">
                <h4>Items</h4>
              </div>
              <div className="card-body  pt-0">
                <div className="estDataBox">
                  <div className="table-responsive active-projects style-1 mt-2">
                    <table id="empoloyees-tblwrapper" className="table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Description</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount $</th>
                          <th>Cost Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsList && itemsList.length > 0 ? (
                          itemsList.map((item, index) => (
                            <tr colSpan={2} key={index}>
                              <td>{item.Name}</td>
                              <td>
                                <textarea
                                  size="small"
                                  rows="2"
                                  style={{
                                    height: "fit-content",
                                  }}
                                  value={item.Description}
                                  onChange={(e) =>
                                    handleDescriptionChange(index, e)
                                  }
                                  className="form-control form-control-sm"
                                  placeholder="Description"
                                />
                              </td>
                              <td>
                                <input
                                  name="Qty"
                                  value={item.Qty}
                                  ref={
                                    index === itemsList.length - 1
                                      ? quantityInputRef
                                      : null
                                  }
                                  onChange={(e) =>
                                    handleQuantityChange(index, e)
                                  }
                                  className="form-control form-control-sm number-input"
                                  placeholder="Quantity"
                                />
                              </td>
                              <td>
                                <input
                                  name="Rate"
                                  value={item.Rate}
                                  onChange={(e) => handleRateChange(index, e)}
                                  className="form-control form-control-sm number-input"
                                  placeholder="Rate"
                                />
                              </td>
                              <td className="text-right pe-2">
                                {item.PurchasePrice
                                  ? formatAmount(item.PurchasePrice * item.Qty)
                                  : "0.00"}
                              </td>
                              <td>
                                <input
                                  className="form-control form-control-sm number-input"
                                  value={item.PurchasePrice}
                                  onChange={(e) => handleCostChange(index, e)}
                                />
                              </td>
                              <td>
                                <div className="badgeBox">
                                  <Button
                                    onClick={() => {
                                      deleteItem(index);
                                    }}
                                  >
                                    <Delete color="error" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <></>
                        )}
                        <tr>
                          <td>
                            <>
                              <Autocomplete
                                id="search-items"
                                options={searchResults || ""}
                                getOptionLabel={(item) => item.ItemName}
                                value={selectedItem.ItemName}
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
                                    onClick={getItems}
                                  />
                                )}
                                renderOption={(props, item) => (
                                  <li
                                    style={{
                                      cursor: "pointer",
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
                              placeholder="Qty"
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
                              value={
                                selectedItem?.SalePrice || itemInput.Rate || ""
                              }
                              // onChange={(e) =>
                              //   setItemInput({
                              //     ...itemInput,
                              //     Rate: Number(e.target.value),
                              //   })
                              // }
                              onClick={(e) => {
                                setSelectedItem({
                                  ...selectedItem,
                                  SalePrice: 0,
                                });
                              }}
                              className="form-control form-control-sm number-input"
                              placeholder="Rate"
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
                            <h5 className="text-right" style={{ margin: "0" }}>
                              {itemInput.PurchasePrice
                                ? (
                                  itemInput.PurchasePrice * itemInput.Qty
                                ).toFixed(2)
                                : "0.00"}
                            </h5>
                          </td>
                          <td>
                            <h5 style={{ margin: "0" }}>
                              <input
                                type="number"
                                name="CostPrice"
                                className="form-control form-control-sm number-input"
                                value={itemInput.PurchasePrice || ""}
                                // onChange={(e) =>
                                //   setItemInput({
                                //     ...itemInput,
                                //     PurchasePrice: Number(e.target.value),
                                //   })
                                // }
                                // onClick={(e) => {
                                //   setSelectedItem({
                                //     ...selectedItem,
                                //     PurchasePrice: 0,
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
                            </h5>
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {/* <div className="itemtitleBar">
                <h4>Purchase Order Details</h4>
              </div> */}
                <div className=" row">
                  <div className="col-md-5">
                    <div className="row">
                      <div className="col-xl-12 col-lg-12">
                        <div className="basic-form">
                          <label className="form-label">Memo Internal</label>
                          <div className="mb-3">
                            <TextArea
                              value={formData.MemoInternal}
                              name="MemoInternal"
                              onChange={handleChange}
                            ></TextArea>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-12 col-lg-12">
                        <div className="basic-form">
                          <label className="form-label">Message</label>
                          <div className="mb-3">
                            <TextArea
                              name="Message"
                              value={formData.Message}
                              onChange={handleChange}
                            ></TextArea>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-12 col-lg-12">
                        <FileUploadButton onClick={handleFileChange}>
                          Upload File
                        </FileUploadButton>
                        {/* <div className="basic-form">
                          <label className="form-label">Attachments</label>
                          <h4 className="card-title">Attachments</h4>
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
                                  onChange={handleFileChange}
                                />
                              </div>
                            </form>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3"></div>
                  <div className="col-md-4">
                    <div className="col-md-10 ms-auto sub-total">
                      <table className="table table-clear">
                        <tbody>
                          {/* <tr>
                          <td className="left">
                            <strong>Subtotal</strong>
                          </td>
                          <td className="right">$8.497,00</td>
                        </tr>
                        <tr>
                          <td className="left">
                            <strong>Discount (20%)</strong>
                          </td>
                          <td className="right">$1,699,40</td>
                        </tr>
                        <tr>
                          <td className="left">
                            <strong>VAT (10%)</strong>
                          </td>
                          <td className="right">$679,76</td>
                        </tr> */}

                          <tr style={{ paddingTop: "20em" }}>
                            <td className="left">
                              <strong>Total Cost</strong>
                            </td>
                            <td className="text-right">
                              <strong>
                                $
                                {totalAmount
                                  ? formatAmount(totalAmount)
                                  : "0.00"}
                              </strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="row card-body mx-2">
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
                        <span
                          className="file-delete-button"
                          style={{
                            left: "90px",
                          }}
                          onClick={() => {
                            deletePOFile(file.PurchaseOrderFileId, fetchpoData);
                          }}
                        >
                          <span>
                            <Delete color="error" />
                          </span>
                        </span>
                      </div>
                    ))}

                    {estimateFiles.map((file, index) => (
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
                        <span
                          className="file-delete-button"
                          style={{
                            left: "90px",
                          }}
                        >
                          <span
                            onClick={() => {
                              handleDeleteEstmFile(index);
                            }}
                          >
                            <Delete color="error" />
                          </span>
                        </span>
                      </div>
                    ))}

                    {selectedFiles.map((file, index) => (
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
                  </div>

                  <div className="col-md-6">
                    <BackButton
                      onClick={() => {
                        setFormData(initialFormData);

                        setEstimateLinkData({});
                        navigate("/purchase-order");
                        // window.history.back();
                      }}
                    >
                      Back
                    </BackButton>
                    {/* {addCustomerSuccess && (
                      <Alert severity="success">
                        {addCustomerSuccess
                          ? addCustomerSuccess
                          : "Successfully added/Updated Purchase order"}
                      </Alert>
                    )}

                    {emptyFieldsError && (
                      <Alert severity="error">
                        Please fill all required fields
                      </Alert>
                    )}
                    {error && (
                      <Alert severity="error">
                        {errorMessage
                          ? errorMessage
                          : "Error submitting Purchase Order Data"}
                      </Alert>
                    )} */}
                  </div>
                  {!formData.isDelete && (
                    <div className="mb-2  col-md-6 text-end">
                      <div className="mx-2">
                        {idParam ? (
                          <>
                            {canDelete ? (
                              <HandleDelete
                                id={idParam}
                                endPoint={"PurchaseOrder/DeletePurchaseOrder?id="}
                                to="/purchase-order"
                                syncQB={syncQB}
                              />
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>
                                  <LoadingButton
                                    variant="outlined"
                                    color="error"
                                    disabled
                                    startIcon={<Delete sx={{ fontSize: 2 }} />}
                                    disableElevation
                                    sx={{
                                      marginRight: "0.6em",
                                      color: "red",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    Delete
                                  </LoadingButton>
                                </span>
                              </Tooltip>
                            )}
                            <PrintButton
                              varient="mail"
                              onClick={() => {
                                navigate(
                                  `/send-mail?title=${"Purchase Order"}&mail=${""}&customer=${supplierName.CompanyName
                                  }&number=${formData.PurchaseOrderNumber}`
                                );
                                setselectedPdf([]);
                              }}
                            >
                              <Email />
                            </PrintButton>
                            <PrintButton
                              varient="print"
                              onClick={() => {
                                navigate(
                                  `/purchase-order/purchase-order-preview?id=${idParam}`
                                );
                              }}
                            ></PrintButton>

                            <PDFDownloadLink
                              document={
                                <POPdf
                                  data={{
                                    ...PoPreviewData,
                                    Total: pdfTotal,
                                    dynamicColorAndLogo: dynamicColorAndLogo,
                                  }}
                                />
                              }
                              fileName="Purchase Order.pdf"
                            >
                              {({ blob, url, loading, error }) =>
                                loading ? (
                                  " "
                                ) : (
                                  <PrintButton
                                    varient="Download"
                                    onClick={() => {
                                      console.log("error", error);
                                    }}
                                  ></PrintButton>
                                )
                              }
                            </PDFDownloadLink>
                          </>
                        ) : (
                          <></>
                        )}

                        {((!isEditMode && !menuAccess.isLoading && menuAccess.canCreate) || (isEditMode && !menuAccess.isLoading && menuAccess.canEdit)) ? (
                          <LoaderButton
                            loading={disableButton}
                            handleSubmit={handleSubmit}
                            disable={
                              loggedInUser.userRole == 4 || btnDisable
                                ? true
                                : isPoClosed
                            }
                          >
                            Save
                          </LoaderButton>
                        ) : (
                          <Tooltip 
                            title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create purchase orders"} 
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

                        {/* 
                      <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={handleSubmit}
                      >
                        Save
                      </button> */}
                        {isPoClosed && (
                          <p>
                            This purchase order is closed because a bill is
                            linked to it
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
