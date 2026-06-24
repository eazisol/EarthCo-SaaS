import React, { useContext, useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Form } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import formatDate from "../../custom/FormatDate";
import useGetEstimate from "../Hooks/useGetEstimate";
import useFetchBills from "../Hooks/useFetchBills";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import { useNavigate, NavLink } from "react-router-dom";
import { useEstimateContext } from "../../context/EstimateContext";
import useDeleteFile from "../Hooks/useDeleteFile";
import { Print, Email, Download } from "@mui/icons-material";
import EventPopups from "../Reusable/EventPopups";
import { Delete, Create } from "@mui/icons-material";
import { Button } from "@mui/material";
import InvoiceTitleBar from "./InvoiceTitleBar";
import useSendEmail from "../Hooks/useSendEmail";
import LoaderButton from "../Reusable/LoaderButton";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";
import { DataContext } from "../../context/AppData";
import useQuickBook from "../Hooks/useQuickBook";
import BackButton from "../Reusable/BackButton";
import FileUploadButton from "../Reusable/FileUploadButton";
import formatAmount from "../../custom/FormatAmount";
import { AiOutlineFileSync } from "react-icons/ai";
import PrintButton from "../Reusable/PrintButton";
import ActivityLog from "../Reusable/ActivityLog";
import HandleDelete from "../Reusable/HandleDelete";
import useGetActivityLog from "../Hooks/useGetActivityLog";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import useFetchPo from "../Hooks/useFetchPo";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";
import { BsFiletypePdf } from "react-icons/bs";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import MultiSelectAutocomplete from "../Reusable/MultiSelectAutocomplete";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import CustomAutocomplete from "../Reusable/CustomAutocomplete";
import CustomerAutocomplete from "../Reusable/CustomerAutocomplete";
import LinkingBadges from "../Reusable/LinkingBadges";
import imageCompresser from "../../custom/ImageCompresser";
import useGetData from "../Hooks/useGetData";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import TblDateFormat from "../../custom/TblDateFormat";
import RecurringTablePdf from "../RecurringBilling/RecurringBillingPdf";
import { useLocation } from 'react-router-dom';
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import useMenuAccess from "../Hooks/useMenuAccess";
const AddInvioces = ({ }) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const location = useLocation();
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
  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const copyIsTemplate = queryParams.get("isTemplate") === "true";
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "Confirmation",
    description: "Click Yes if you’d like to update the invoice template as well. Any price changes made will automatically be reflected in the template.",
    onConfirm: () => { },
    confirmText: "Yes",
    cancelText: "No",
  });
  // conosle.log()
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceModalConfig, setPriceModalConfig] = useState({
    title: "",
    description: "",
    onConfirm: () => { },
    confirmText: "",
    cancelText: "",
    onClose: undefined,
    onCancel: undefined,
  });
  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleOpenInvoicePdfDownloadModal = () => {
    setPriceModalConfig({
      title: "PDF Download Options",
      description: (
        <>
          You can download the invoice with or without pricing.
          Select Yes to include pricing, or No to exclude it. 
        </>
      ),
      onConfirm: async () => {
        try {
          setPriceModalOpen(false);
          await downloadInvoicePdf(true);
        } catch (e) { }
      },
      confirmText: "Yes",
      cancelText: "No",
      onClose: () => {
        setPriceModalOpen(false);
      },
      onCancel: async () => {
        try {
          setPriceModalOpen(false);
          await downloadInvoicePdf(false);
        } catch (e) { }
      },
    });
    setPriceModalOpen(true);
  };

  const downloadInvoicePdf = async (includePrices) => {
    try {
      const dataPayload = {
        ...formData,
        companyInfo: companyInfo,
        BillTotal: BillTotal,
        laborAmount: laborAmount,
        SelectedCompany: loggedInUser.CompanyId == 2 ? loggedInUser.CompanyName : "EarthCo Landscape",
        CustomerName: formData.CustomerCompanyName,
        ApprovedItems: formData.tblInvoiceItems.filter((item) => !item.IsMisc),
        Amount: totalItemAmount,
        TotalAmount: formData.TotalAmount,
        IncludePrices: includePrices,
      };

      const blob = await pdf(<InvoicePDF data={dataPayload} />).toBlob();
      saveAs(blob, `Invoice ${formData.InvoiceNumber}.pdf`);
    } catch (err) {
      console.error("Error generating invoice PDF", err);
    }
  };
  const {
    loggedInUser,
    selectedImages,
    setSelectedImages,
    setselectedPdf,
    companyInfo,
    recurringInvoices,
    setRecurringInnvoices,
    dynamicColorAndLogo
  } = useContext(DataContext);
  const [recurringData, setrecurringData] = useState({
    TransactionTypeId: 1,
    TemplateName: "",
    StartDate: null,
    EndDate: null,
    RecurringTemplateId: 1,
    RecurringTemplateTypeId: 1,
    isEmailSend: false,
    isIssueDateNext: false,
  });
  const currentDate = new Date();
  const calculateDueDate = (date) => {
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate;
  };

  const getNextMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  };

  const getNextMonthEnd = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 2, 0);
  };

  const [formData, setFormData] = useState({
    TermId: 21,
    Term: "Net 30",
    tblInvoiceItems: [],
    isCreatedFromEstimate: 0,
    IssueDate: currentDate,
    DueDate: calculateDueDate(currentDate),
    CustomerMessage:location?.pathname == '/recurring-invoices/add-template' ? 'This is the recurring monthly maintenance invoice.' : '',
    ForemanId: null,
  });
  console.log("🚀 ~ AddInvioces ~ formData:", formData)
  useEffect(() => {
    const isUpdateMode = !!idParam && !recurringData;
    if (isUpdateMode) return;

    let updatedFormData = { ...formData };

    if (
      idParam !== 0 &&
      copyIsTemplate === true &&
      recurringData.isIssueDateNext === true
    ) {
      const nextMonthStart = getNextMonthStart();
      const nextMonthEnd = getNextMonthEnd();
      updatedFormData = {
        ...updatedFormData,
        currentDate: nextMonthStart,
        IssueDate: nextMonthStart,
        DueDate: nextMonthEnd,
      };
    } else if (
      idParam !== 0 &&
      copyIsTemplate === true &&
      recurringData.isIssueDateNext === false
    ) {
      updatedFormData = {
        ...updatedFormData,
        currentDate,
        IssueDate: currentDate,
        DueDate: calculateDueDate(currentDate),
      };
    } else if (
      idParam !== 0 &&
      copyIsTemplate === false &&
      recurringData.isIssueDateNext === true
    ) {
      updatedFormData = {
        ...updatedFormData,
        currentDate,
        IssueDate: currentDate,
        DueDate: calculateDueDate(currentDate),
      };
    }

    setFormData(updatedFormData);
  }, [recurringData, idParam]);

  // useEffect(() => {


  //   const isUpdateMode = !!idParam&&!recurringData; 

  //   if (isUpdateMode) return; 
  //   let updatedFormData = {...formData}
  //    if(idParam!=0&&copyIsTemplate==true&&recurringData.isIssueDateNext==true){
  //     updatedFormData = {
  //       ...updatedFormData,

  //     };

  //    } else if (idParam==0&&copyIsTemplate == false) {
  //     updatedFormData = {
  //       ...updatedFormData,
  //       currentDate,
  //       IssueDate: currentDate,
  //       DueDate: calculateDueDate(currentDate),
  //     }}else if (
  //     !recurringData ||
  //     recurringData.isIssueDateNext == null ||
  //     recurringData.isIssueDateNext == undefined
  //   ) {
  //     updatedFormData = {
  //       ...updatedFormData,
  //       currentDate,
  //       IssueDate: currentDate,
  //       DueDate: calculateDueDate(currentDate),
  //     };
  //   } else if (recurringData.isIssueDateNext === false) {
  //     updatedFormData = {
  //       ...updatedFormData,
  //       currentDate,
  //       IssueDate: currentDate,
  //       DueDate: calculateDueDate(currentDate),
  //     };

  //   } else if (recurringData.isIssueDateNext === true) {
  //     const nextMonthStart = getNextMonthStart();
  //     const nextMonthEnd = getNextMonthEnd();
  //     updatedFormData = {
  //       ...updatedFormData,
  //       currentDate: nextMonthStart,
  //       IssueDate: nextMonthStart,
  //       DueDate: nextMonthEnd,
  //     };
  //   }

  //   setFormData(updatedFormData);
  // }, [recurringData, idParam]);




  const [staffData, setStaffData] = useState([]);
  const [terms, setTerms] = useState([]);
  const [tags, setTags] = useState([]);
  const [RepeatIntervalList, setRepeatIntervalList] = useState([]);
  const [getTemplateTypeList, setGetTemplateTypeList] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [customerAddress, setCustomerAddress] = useState("");
  const [poAndBills, setPoAndBills] = useState([]);

  const [btnDisable, setBtnDisable] = useState(false);
  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { customerMail, fetchCustomerEmail } = useFetchCustomerEmail();
  const { getLogs, activityLogs } = useGetActivityLog();
  const { getListData } = useGetData();

  const [totalItemAmount, setTotalItemAmount] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  // TOP-LEVEL (baaki useState hooks ke saath)


  // const { estimates, getEstimate } = useGetEstimate();
  const { billList, fetchBills } = useFetchBills();
  const { deleteInvoiceFile } = useDeleteFile();

  const navigate = useNavigate();
  const { estimateLinkData, setEstimateLinkData } = useEstimateContext();
  const { syncQB } = useQuickBook();
  const { PoList, fetchPo } = useFetchPo();
  
  // Access control
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  
  // Determine if this is edit mode (has idParam)
  const isEditMode = !!(idParam && idParam !== 0);

  // Foreman multiselect state; keep legacy ForemanId synced to first selection
  const [selectedForemen, setSelectedForemen] = useState([]);

  // const [error, seterror] = useState("")
  const [qBError, setQBError] = useState("");
  const handleRepeatChange = (event) => {
    setrecurringData(prev => ({
      ...prev,
      RepeatIntervalId: event.target.value
    }));
  };
  const handleTemplateType = (event) => {
    setrecurringData(prev => ({
      ...prev,
      RecurringTemplateTypeId: event.target.value
    }));
  };
  const handleDayChange = (event) => {
    setrecurringData((prev) => ({
      ...prev,
      Day: event.target.value,
    }));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setrecurringData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formatDate = (date) => {
    if (!date) return "";

    if (typeof date === "string") {
      if (date.includes("T")) {
        return date.split("T")[0];  // remove time part
      }
      return date; // already YYYY-MM-DD
    }

    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return "";
  };

  const fetchInvoiceById = async (invoiceId) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Invoice/GetInvoice?id=${invoiceId}`,
        { headers }
      );
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch invoice ${invoiceId}:`, error);
      return null;
    }
  };
  const generatePdfForInvoice = async (invoiceData) => {
    const formData = invoiceData;

    // // Prepare your props (adapt as needed)
    const blob = await pdf(
      <RecurringTablePdf
        data={{
          ...formData,
          companyInfo: companyInfo,
          dynamicColorAndLogo: dynamicColorAndLogo,
        }}
      />
    ).toBlob();

    return new File([blob], `Invoice.pdf`, {
      type: "application/pdf",
    });
  };
  const uploadInvoicePdf = async (invoiceId, pdfFile, invoiceNumberFromAPI) => {
    const formData = new FormData();
    formData.append("InvoiceId", invoiceId);
    formData.append("Files", pdfFile);
    formData.append("InvoiceNumber", invoiceNumberFromAPI);
    try {
      const response = await axios.post(
        `${baseUrl}/api/Invoice/UploadInvoicePDF`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
  const getInvoice = async () => {
    if (!idParam) {
      return;
    }

    setLoading(true);
    getListData(
      `/SyncQB/CheckSyncLog?Id=${idParam}&Type=Invoice&CompanyId=${loggedInUser.CompanyId}`,
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
        `${baseUrl}/api/Invoice/GetInvoice?id=${idParam}`,
        { headers }
      );

      // setFormData(res.data.Data);
      // fetchName(res.data.Data.CustomerId);

      setTotalDiscount(res.data.Data.Discount);
      setPrevFiles(res.data.FileData);
      //  setSelectedImages(res.data.FileData);
      setPoAndBills(res.data.EstimatePurchaseOrderData);
      setLoading(false);
      // setItemsList(res.data.ItemData)
      const isRecurringTemplatePath = location?.pathname === '/recurring-invoices/add-template';

      const invoiceData = {
        ...res.data.Data,
        tblInvoiceItems: [...res.data.CostItemData, ...res.data.ItemData],
        InvoiceNumber: isRecurringTemplatePath ? null : res.data.Data.InvoiceNumber
      };

      setFormData((prev) => ({
        ...prev,
        ...invoiceData,
        // keep IssueDate/DueDate if API doesn’t send them
        IssueDate: invoiceData.IssueDate || prev.IssueDate,
        DueDate: invoiceData.DueDate || prev.DueDate,
      }));

      // Populate multiselect foremen if API returns them
      try {
        const apiForemen = res?.data?.InvoiceForemanData || res?.data?.EstimateForemanData || [];
        const foremanIds = apiForemen.map((f) => f.ForemanId).filter((id) => !!id);
        if (foremanIds.length > 0) {
          setSelectedForemen(foremanIds);
        }
      } catch (e) {
        // ignore
      }

      // const combinedItems = [...res.data.CostItemData, ...res.data.ItemData];

      // setFormData((prevState) => ({
      //   ...prevState,
      //   ...res.data.Data,
      //   tblInvoiceItems: combinedItems,
      // }));

      setrecurringData(res.data.RecurringTemplateData)
    } catch (error) {
      setLoading(false);
      setError(true);
      setErrorMessage(error.message);
      console.log("API call error", error);
    }
  };

  const handleCustomerAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "CustomerId",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event

    setCustomerAddress(newValue?.Address || "");
    handleChange(simulatedEvent);
  };

  const handlePoAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      PurchaseOrderId: newValue.PurchaseOrderId,
      PurchaseOrderNumber: newValue.PurchaseOrderNumber,
    }));
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
  const getRepeatIntervalList = async () => {
    axios
      .get(`${baseUrl}/api/RecurringTempelate/GetRepeatIntervalList`, {
        headers,
      })
      .then((res) => {
        setRepeatIntervalList(res.data);
      })
      .catch((error) => {
        setRepeatIntervalList([]);
        console.log("contacts data fetch error", error);
      });
  };
  const getTemplateTypeListData = async () => {
    axios
      .get(`${baseUrl}/api/RecurringTempelate/GetTemplateTypeList`, {
        headers,
      })
      .then((res) => {
        setGetTemplateTypeList(res.data);
      })
      .catch((error) => {
        setGetTemplateTypeList([]);
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

  useEffect(() => {
    console.log("🚀 ~ getInvoice useeffect ~ res:")
    fetchStaffList();
    fetchTerms();
    fetchTags();
    getRepeatIntervalList();
    getTemplateTypeListData();
    // getEstimate();
    getInvoice();
    // fetchBills();
    fetchCustomers();
    getLogs(idParam, "Invoice");
    // fetchPo();
    return () => {
      setEstimateLinkData({});
    };
  }, []);

  // Initialize selectedForemen from existing ForemanId when available
  useEffect(() => {
    if (formData?.ForemanId && !selectedForemen?.length) {
      setSelectedForemen([formData.ForemanId]);
    }
  }, [formData?.ForemanId]);

  // Keep legacy single ForemanId synced as first selection
  useEffect(() => {
    const firstSelected = selectedForemen && selectedForemen.length > 0 ? selectedForemen[0] : null;
    if (formData.ForemanId !== firstSelected) {
      setFormData(prev => ({ ...prev, ForemanId: firstSelected }));
    }
  }, [selectedForemen]);

  useEffect(() => {
    let approvedItems = [...formData.tblInvoiceItems];
    if (estimateLinkData && estimateLinkData.tblEstimateItems) {
      approvedItems = estimateLinkData.tblEstimateItems.filter(
        (item) => item.IsApproved === true
      );

      setFormData((prevData) => ({
        ...prevData,
        CustomerId: estimateLinkData.CustomerId,
        EstimateId: estimateLinkData.EstimateId,
        CustomerDisplayName: estimateLinkData.CustomerDisplayName,
        AssignTo: estimateLinkData.RegionalManagerId,
        BillId: estimateLinkData.BillId,
        PurchaseOrderId: estimateLinkData.PurchaseOrderId,
        PurchaseOrderNumber: estimateLinkData.PurchaseOrderNumber,
        EstimateNumber: estimateLinkData.EstimateNumber,
        CustomerMessage: estimateLinkData.EstimateNotes,
        tblInvoiceItems: [...approvedItems],
        tblInvoiceFiles: estimateLinkData.FileData,
        isCreatedFromEstimate: estimateLinkData?.isCreatedFromEstimate ? 1 : 0,
      }));
    }
  }, [estimateLinkData]);

  const handleBillAutocompleteChange = (event, newValue) => {
    setFormData((prevData) => ({
      ...prevData,
      BillId: newValue.BillId,
      BillNumber: newValue.BillNumber,
    }));
  };
  const handleEstimatesAutocompleteChange = (event, newValue) => {
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

  const handleStaffAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "AssignTo",
        value: newValue ? newValue.UserId : "",
      },
    };
    handleChange(simulatedEvent);
  };

  const increaseDueDate = (Term, IssueDate) => {
    if (Term) {
      const lastTwoDigits = parseInt(Term.substring(Term.length - 2));

      let dueDate = new Date(IssueDate);
      dueDate.setDate(dueDate.getDate() + lastTwoDigits);
      return dueDate.toISOString().slice(0, 10);
    }
  };
  const handleTermsAutocompleteChange = (event, newValue) => {
    if (formData.IssueDate && newValue && newValue.Term.includes("Net")) {
      const newDueDate = increaseDueDate(newValue.Term, formData.IssueDate);

      setFormData((prevFormData) => ({
        ...prevFormData,
        DueDate: newDueDate,
        TermId: newValue ? newValue.TermId : "",
        Term: newValue ? newValue.Term : "",
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        TermId: newValue ? newValue.TermId : "",
        Term: newValue ? newValue.Term : "",
      }));
    }
  };

  const handleTagAutocompleteChange = (event, newValues) => {
    const tagString = newValues.map((tag) => tag.Tag).join(", ");

    setFormData((prevData) => ({
      ...prevData,
      Tags: tagString,
    }));
  };

  const handleChange = (e) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    setSubmitClicked(false);
    setDisableButton(false);
    setEmptyFieldsError(false);
    // Extract the name and value from the event target
    const { name, value } = e.target;

    // Create a new copy of formData with the updated key-value pair
    const updatedFormData = { ...formData, [name]: value };

    // Update the formData state
    setFormData(updatedFormData);
  };
  useEffect(() => {
    // fetchName(formData.CustomerId);
    fetchCustomerEmail(formData.CustomerId);
  }, [formData.CustomerId]);

  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check permissions before submitting
    if (isEditMode) {
      // Updating existing invoice - need edit access
      if (!menuAccess.isLoading && !menuAccess.canEdit) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update invoices");
        return;
      }
    } else {
      // Creating new invoice - need create access
      if (!menuAccess.isLoading && !menuAccess.canCreate) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create invoices");
        return;
      }
    }
    
    setSubmitClicked(true);

    let InvoiceData = {}; // Declare InvoiceData in the outer scope

    if (!formData.CustomerId || !formData.IssueDate) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");

      return;
    }
    //  RecurringTemplateId: 1,
    // RecurringTemplateTypeId: 1,
    if (location?.pathname == '/recurring-invoices/add-template' && recurringData?.RecurringTemplateTypeId == 1 && recurringData?.StartDate == null) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Start date field is required ");

      return;
    }
    if (location?.pathname == '/recurring-invoices/add-template' && recurringData?.RecurringTemplateTypeId == 1 && recurringData?.RepeatIntervalId == null) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Interval field is required ");

      return;
    }
    if (location?.pathname == '/recurring-invoices/add-template' && recurringData?.RecurringTemplateTypeId == 1 && recurringData?.RepeatIntervalId != 1 && !recurringData?.Day) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Day field is required ");

      return;
    }
    if (location?.pathname == '/recurring-invoices/add-template' && !recurringData?.RecurringTemplateTypeId) {
      setEmptyFieldsError(true);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Recurring type field is required");

      return;
    }
    if (formData.tblInvoiceItems.length <= 0) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please add atleast one item");

      return;
    }

    // Merge the current items with the new items for EstimateData
    const itemArray = formData.tblInvoiceItems.map((item) => ({
      ...item,
      Rate: item.Rate ? parseFloat(item.Rate) : 0,
      Qty: item.Qty ? parseFloat(item.Qty) : 0,
      PurchasePrice: item.PurchasePrice ? parseFloat(item.PurchasePrice) : 0,
      Amount: item.Amount ? parseFloat(item.Amount) : 0,
    }));
    // add the key only if we are NOT on the add‑template page


    if (idParam) {
      InvoiceData = {
        ...formData,
        InvoiceId: copyIsTemplate == true ? 0 : copyIsTemplate == null ? (idParam || 0) : (idParam || 0),
        TotalAmount: parseFloat(totalItemAmount) || 0,
        BalanceAmount: parseFloat(totalItemAmount) || 0,
        Discount: totalDiscount || 0,
        ProfitPercentage: Number(profitPercentage) || 0,
        CompanyId: Number(loggedInUser.CompanyId),
        tblInvoiceItems: itemArray,
        tblInvoiceForemen: (selectedForemen || []).map((id) => ({ ForemanId: id })),
        isTemplate: recurringInvoices,
        isCreatedFromTemplate: copyIsTemplate ? true : false,
        TemplateId: formData.InvoiceId,
      };
    } else {
      InvoiceData = {
        ...formData,
        // InvoiceId: copyIsTemplate==true ? 0 : (idParam || 0),
        InvoiceId: copyIsTemplate == true ? 0 : copyIsTemplate == null ? (idParam || 0) : (idParam || 0),
        TotalAmount: totalItemAmount || 0,
        BalanceAmount: totalItemAmount || 0,
        Discount: totalDiscount || 0,
        ProfitPercentage: Number(profitPercentage) || 0,
        CompanyId: Number(loggedInUser.CompanyId),
        tblInvoiceItems: itemArray,
        tblInvoiceForemen: (selectedForemen || []).map((id) => ({ ForemanId: id })),
        isTemplate: recurringInvoices,
        isCreatedFromTemplate: copyIsTemplate ? true : false,
        TemplateId:formData.InvoiceId,
      };
    }

    const postData = new FormData();
    postData.append("InvoiceData", JSON.stringify(InvoiceData));

    if (location?.pathname == '/recurring-invoices/add-template') {
      postData.append("RecurringTemplateData", JSON.stringify(recurringData));

    }

    // Appending files to postData
    selectedFiles.forEach((fileObj) => {
      postData.append("Files", fileObj);
    });

    setDisableButton(true);
    submitData(postData);
  };

  const handlePopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
  };

  const submitData = async (postData) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // Important for multipart/form-data requests
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/Invoice/AddInvoice`,
        postData,
        {
          headers,
        }
      );

      const invoiceData = await fetchInvoiceById(response.data.Id);
      const invoiceNumberFromAPI = invoiceData?.Data?.InvoiceNumber;
      const pdfFile = await generatePdfForInvoice(invoiceData);
      await uploadInvoicePdf(response.data.Id, pdfFile, invoiceNumberFromAPI);
      setModalOpen(false);
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);

      syncQB(response.data.SyncId);


      navigate(response.data?.isTemplate ? `/recurring-invoices/add-template?id=${response.data.Id}` : `/invoices/add-invoices?id=${response.data.Id}`);
      // navigate(recurringInvoices ? `/recurring-invoices/add-template?id=${response.data.Id}` : `/invoices/add-invoices?id=${response.data.Id}`);

      setTimeout(() => {
        setDisableButton(false);
        window.location.reload();
      }, 3000);

      setEstimateLinkData({});
    } catch (error) {
      setDisableButton(false);
      setModalOpen(false);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
    }

    // Logging FormData contents (for debugging purposes)
    for (let [key, value] of postData.entries()) {
    }
    // window.location.reload();

    // console.log("post data izzz",postData);
  };

  // new items
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
  const [showItem, setShowItem] = useState(true);
  const [itemBtnDisable, setItemBtnDisable] = useState(true);
  const [shippingCost, setShippingCost] = useState(0);
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

  const deleteItem = (itemId) => {
    const updatedArr = formData.tblInvoiceItems.filter(
      (item, index) => index !== itemId
    );
    setFormData((prevData) => ({
      ...prevData,
      tblInvoiceItems: updatedArr,
    }));
  };

  const handleItemChange = (event) => {
    setShowItem(true);
    setSearchText(event.target.value);

    setSelectedItem({}); // Clear selected item when input changes
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
        setFormData((prevData) => ({
          ...prevData,
          tblInvoiceItems: prevData.tblInvoiceItems.slice(0, -1),
        }));
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
      Description: item.ItemName == "Maintenance" && location?.pathname == '/recurring-invoices/add-template' ? item.SaleDescription + ' {NextMonth}' : item.SaleDescription,
      Rate: item.SalePrice,
      PurchasePrice: item.PurchasePrice,
      isCost: false,
    });

    setFormData((prevData) => ({
      ...prevData,
      tblInvoiceItems: [
        ...(prevData.tblInvoiceItems || []),
        {
          ...itemInput,
          ItemId: item.ItemId,
          Name: item.ItemName,
          Description: item.ItemName == "Maintenance" && location?.pathname == '/recurring-invoices/add-template' ? item.SaleDescription + ' {NextMonth}' : item.SaleDescription,
          Rate: item.SalePrice,
          PurchasePrice: item.PurchasePrice,
          isCost: false,
        },
      ], // Initialize as an empty array if undefined
    }));

    itemInput ? setItemBtnDisable(false) : setItemBtnDisable(true);

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
  }, [formData.tblInvoiceItems.length]);

  const handleAddItem = () => {
    if (!itemInput.ItemId) {
      return;
    }
    const newAmount = itemInput.Qty * itemInput.Rate;
    const newItem = {
      ...itemInput,
      Amount: newAmount,
    };

    setFormData((prevData) => ({
      ...prevData,
      tblInvoiceItems: [...(prevData.tblInvoiceItems || []), newItem], // Initialize as an empty array if undefined
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
  const voidInvoice = (itemId, event, add) => {
    const updatedItems = formData.tblInvoiceItems.map((item, index) => {
      const updatedItem = { ...item };
      updatedItem.Rate = 0;
      updatedItem.Qty = 0;
      updatedItem.PurchasePrice = 0;
      return updatedItem;
    });
    setFormData((prevData) => ({
      ...prevData,
      isVoid: true,
      tblInvoiceItems: updatedItems,
    }));
  };
  const handleDescriptionChange = (itemId, event, add) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }

    if (add === 0) {
      const updatedItems = formData.tblInvoiceItems.map((item, index) => {

        if (index === itemId && item.isCost == false) {
          const updatedItem = { ...item };
          updatedItem.Description = event.target.value;

          return updatedItem;
        }
        return item;
      });

      setFormData((prevData) => ({
        ...prevData,
        tblInvoiceItems: updatedItems,
      }));
    }
    if (add === 1) {
      const updatedItems = formData.tblInvoiceItems.map((item, index) => {

        if (index === itemId && item.isCost == true) {
          const updatedItem = { ...item };
          updatedItem.Description = event.target.value;
          return updatedItem;
        }
        return item;
      });

      setFormData((prevData) => ({
        ...prevData,
        tblInvoiceItems: updatedItems,
      }));
    }
  };

  useEffect(() => {
    if (totalItemAmount !== 0) {
      setFormData({ ...formData, isVoid: false });
    }
  }, [totalItemAmount]);

  const handleQuantityChange = (i, event, add) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = formData.tblInvoiceItems.map((item, index) => {
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
        tblInvoiceItems: updatedItems,
      }));
    }
  };

  const handleRateChange = (i, event, add) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^-?[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = formData.tblInvoiceItems.map((item, index) => {
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
        tblInvoiceItems: updatedItems,
      }));
    }
  };

  const handleCostChange = (i, event, add) => {
    let inputValue = event.target.value;

    // Sanitize the input to allow only digits and one decimal point
    if (inputValue === "" || /^-?[0-9]*\.?[0-9]*$/.test(inputValue)) {
      const updatedItems = formData.tblInvoiceItems.map((item, index) => {
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
        tblInvoiceItems: updatedItems,
      }));
    }
  };

  const handleIsMisc = (i, event, add, item) => {
    const updatedItems = formData.tblInvoiceItems.map((item, index) => {
      if (index === i) {
        // Check if the condition for isCost matches the `add` parameter
        if (
          (add === 0 && item.isCost === false) ||
          (add === 1 && item.isCost === true)
        ) {
          // Copy the item and update IsApproved based on the checkbox's checked state

          const updatedItem = {
            ...item,
            IsMisc: event.target.checked, // Use checked for boolean state
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
      tblInvoiceItems: updatedItems,
    }));
  };

  useEffect(() => {
    fetchCustomerEmail(formData.CustomerId);
  }, [formData]);

  // calculations

  const [subtotal, setSubtotal] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalACAmount, setTotalACAmount] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [paymentCredit, setPaymentCredit] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);

  const shippingcostChange = (e) => {
    if (parseFloat(e.target.value) > 0) {
      setShippingCost(parseFloat(e.target.value));
    } else {
      setShippingCost(0);
    }
  };
// test
  const discountChange = (e) => {
    const newValue = parseFloat(e.target.value);

    if (isNaN(newValue) || newValue < 0) {
      setDiscountPercentage(0);
      return;
    }
    if (newValue === 0 || newValue === "") {
      setDiscountPercentage(0);
    } else {
      // Cap percentage at 100
      const cappedValue = Math.min(newValue, 100);
      setDiscountPercentage(cappedValue);
    }
  };

  const [BillTotal, setBillTotal] = useState(0);
  const [laborAmount, setLaborAmount] = useState(0);

  useEffect(() => {
    const filteredACItems = formData.tblInvoiceItems?.filter(
      (item) => item.isCost === true
    );
    const filteredItems = formData.tblInvoiceItems?.filter(
      (item) => item.isCost === false
    );
    const filteredLaborItems = formData.tblInvoiceItems?.filter((item) =>
      item.Name?.toLowerCase().includes("labor:is")
    );
    const newLaborTotalAmount = filteredLaborItems?.reduce(
      (acc, item) => acc + item.PurchasePrice * item.Qty,
      0
    );
    setLaborAmount(newLaborTotalAmount);
    const billtotal = poAndBills.reduce(
      (acc, item) => acc + item.BillAmount,
      0
    );
    setBillTotal(billtotal);

    const newACTotalAmount = filteredACItems?.reduce(
      (acc, item) => acc + item.Rate * item.Qty,
      0
    );

    const newTotalAmount = filteredItems?.reduce(
      (acc, item) => acc + item.Rate * item.Qty,
      0
    );

    let filteredDiscountItem = [];
    filteredDiscountItem = formData.tblInvoiceItems?.filter(
      (item) => item.ItemId === 3705
    );

    let calculatedDiscountAmount = 0;
    
    // If discount item exists, use item-based discount (don't use percentage)
    if (
      filteredDiscountItem.length > 0 ||
      filteredDiscountItem[0] !== undefined
    ) {
      const newDiscountAmount = filteredDiscountItem?.reduce(
        (acc, item) => acc + item.Rate * item.Qty,
        0
      );
      calculatedDiscountAmount = newDiscountAmount;
      setTotalDiscount(newDiscountAmount);
      // Reset percentage when using item-based discount
      setDiscountPercentage(0);
    } else {
      // If discountPercentage is 0 but totalDiscount was set (from loaded invoice), calculate percentage
      if (discountPercentage === 0 && totalDiscount > 0 && newTotalAmount > 0) {
        const calculatedPercentage = (totalDiscount / newTotalAmount) * 100;
        setDiscountPercentage(calculatedPercentage);
        calculatedDiscountAmount = totalDiscount;
      } else {
        // Calculate discount amount from percentage: percentage × subtotal = discount amount
        calculatedDiscountAmount = (discountPercentage / 100) * newTotalAmount;
        setTotalDiscount(calculatedDiscountAmount);
      }
    }

    const newCostTotalAmount = filteredItems?.reduce(
      (acc, item) => acc + item.PurchasePrice * item.Qty,
      0
    );
    
    const totalamount = newTotalAmount + shippingCost - calculatedDiscountAmount;

    let calculatedTotalProfit = 0;
    if (subtotal > 0) {
      calculatedTotalProfit = newTotalAmount - calculatedDiscountAmount - totalExpense;
    }
    let calculatedProfitPercentage = 0;
    // if (totalExpense > 0) {
    //   calculatedProfitPercentage = (calculatedTotalProfit / totalExpense) * 100;
    // } earlier calculations
    if (totalamount > 0) {
      calculatedProfitPercentage = (calculatedTotalProfit / totalamount) * 100;
    }
    // setTotalExpense(newCostTotalAmount + newACTotalAmount + billtotal);
    setTotalExpense(newLaborTotalAmount + billtotal);

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
    formData.tblInvoiceItems,
    shippingCost,
    discountPercentage,
    totalItemAmount,
    subtotal,
    totalExpense,
    formData,
  ]);

  // files

  const [PrevFiles, setPrevFiles] = useState([]);

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

  const handleDeletePLFile = (indexToDelete) => {
    // Create a copy of the formData.tblEstimateFiles array
    const updatedFiles = [...estimateLinkData.FileData];

    // Remove the file at the specified index
    updatedFiles.splice(indexToDelete, 1);

    // Update the formData with the new array without the deleted file
    setEstimateLinkData({ ...estimateLinkData, FileData: updatedFiles });
  };

  const handleImageSelect = (image) => {
    // Check if the image is already selected
    const isSelected = selectedImages.some(
      (selectedImage) => selectedImage.InvoiceFileId === image.InvoiceFileId
    );

    if (isSelected) {
      // If already selected, remove it from the selectedImages state
      setSelectedImages((prevSelectedImages) =>
        prevSelectedImages.filter(
          (selectedImage) => selectedImage.InvoiceFileId !== image.InvoiceFileId
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
        <InvoicePDF
          data={{
            ...formData,
            BillTotal: BillTotal,
            companyInfo: companyInfo,
            laborAmount: laborAmount,
            dynamicColorAndLogo: dynamicColorAndLogo,
            SelectedCompany:
              loggedInUser.CompanyId == 2
                ? loggedInUser.CompanyName
                : "EarthCo Landscape",
            CustomerName: formData.CustomerCompanyName,
            ApprovedItems: formData.tblInvoiceItems.filter(
              (item) => !item.IsMisc
            ),
            Amount: totalItemAmount,
            IncludePrices:true
          }}
        // files={selectedImages.filter(file => !file.FileName?.toLowerCase().endsWith('.pdf'))}
        />
      ).toBlob();

      // Create a File object from the blob
      const pdfFile = new File(
        [blob],
        `Invoice ${formData.InvoiceNumber}.pdf`,
        {
          type: "application/pdf",
        }
      );
      setselectedPdf(pdfFile);
      const customer = encodeURIComponent(formData.CustomerCompanyName);

      navigate(
        `/send-mail?title=${"Invoice"}&mail=${customerMail}&customer=${customer}&number=${formData.InvoiceNumber}`
      );
      setSelectedImages(selectedImages);
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };
  const handleTemplateInvoice = async (idParam) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/Invoice/UpdateTemplateFromInvoice`,
        { InvoiceId: idParam },
        { headers }
      );
    } catch (error) {
        console.error("Error fetching invoice", error);
    }
  }
  return (
    <>
      <ConfirmationModal
        modalOpen={priceModalOpen}
        setModalOpen={setPriceModalOpen}
        title={priceModalConfig.title}
        description={priceModalConfig.description}
        onConfirm={priceModalConfig.onConfirm}
        confirmText={priceModalConfig.confirmText}
        cancelText={priceModalConfig.cancelText}
        onClose={priceModalConfig.onClose}
        onCancel={priceModalConfig.onCancel}
      />
      <InvoiceTitleBar title={location?.pathname == '/recurring-invoices/add-template' ? "Invoice Template" : "Invoices"} icon={location?.pathname == '/recurring-invoices/add-template' ? <AiOutlineFileSync fontSize={25} /> : (<svg
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
      </svg>)} />
      {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>Read-only mode:</strong> You don't have permission to update this invoice. You can view the information but cannot make changes.
        </div>
      )}
      {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>No create access:</strong> You don't have permission to create new invoices.
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

      <div
        className="modal fade"
        id={`voidModal`}
        tabIndex="-1"
        aria-labelledby="voidModaLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Are you sure you want to Void this invoice
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <div className="text-center">
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
                  onClick={voidInvoice}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        modalOpen={modalOpen}
        setModalOpen={handleModalClose}
        title={modalConfig.title}
        description={modalConfig.description}
        onConfirm={(e) => {
          handleSubmit(e);
          handleTemplateInvoice(formData.InvoiceId);
        }}
        onClose={(e)=> handleSubmit(e)}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        loading={btnDisable}
        disabled={disableButton}
      />
      {loading ? (
        <div className="center-loader">
          <CircularProgress />
        </div>
      ) : (
        <div className="add-item">
          <div className="card">
            {formData.isDelete && (
              <div class="alert alert-danger w-100 mb-0" role="alert">
                This Invoice has been deleted
              </div>
            )}
            <div className="itemtitleBar d-flex ">
              <div className="w-50">
                <h4>Invoice Details</h4>
              </div>

              <div className="w-50 text-end ">
                {qBError !== "" ? (
                  <CustomizedTooltips title={qBError} placement={"top"}>
                    <InfoOutlinedIcon color="error" sx={{ fontSize: 30 }} />
                  </CustomizedTooltips>
                ) : (
                  <></>
                )}
              </div>
              <div className="w-50 text-end">
                {formData.CreatedDate ? (
                  <label className="form-label">
                    <span style={{ fontWeight: "600" }}>Created Date: </span>
                    <span style={{ fontWeight: "400" }}>
                      {TblDateFormat(formData.CreatedDate, true, true)}
                    </span>
                  </label>
                ) : null}
              </div>

            </div>
            <div className="">
              <div className=" card-body mb-3 ">
                <div className="row">
                  <div className="col-md-3">
                    <label className="form-label">
                      Customer<span className="text-danger">*</span>
                    </label>
                    {/* <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={customerSearch}
                      getOptionLabel={(option) =>
                        option.FirstName
                          ? option.FirstName
                          : option.DisplayName || ""
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
                      value={name ? { FirstName: name } : null}
                      onChange={handleCustomerAutocompleteChange}
                      disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === value.CustomerId
                      }
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div className="customer-dd-border">
                            <h6>
                              #{option.UserId} - {option.FirstName}
                            </h6>
                            <small> {option.DisplayName}</small>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          onBlur={() => {
                            fetchName(formData.CustomerId);
                          }}
                          onClick={() => {
                            setName("");
                          }}
                          onChange={(e) => {
                            fetchCustomers(e.target.value);
                          }}
                          placeholder="Choose..."
                          error={submitClicked && !formData.CustomerId}
                          className="bg-white"
                        />
                      )}
                    /> */}
                    <CustomerAutocomplete
                      formData={formData}
                      setFormData={setFormData}
                      submitClicked={submitClicked}
                      handlePopup={handlePopup}
                      setBtnDisable={setBtnDisable}
                      checkQb={true}
                    />
                  </div>
                  <div className=" col-md-3">
                    <label className="form-label">Customer Email</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        name="BillEmail"
                        value={formData.BillEmail}
                        onChange={handleChange}
                        placeholder="Customer Email"
                        disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                      />
                    </div>
                  </div>

                  {location?.pathname == '/invoices/add-invoices' && <div className=" col-md-3">
                    <label className="form-label">Invoice Number </label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        name="InvoiceNumber"
                        value={formData.InvoiceNumber}
                        // onChange={handleChange}
                        placeholder="Invoice number"
                      />
                    </div>
                  </div>}
                  <div className="col-md-3">
                    <label className="form-label">Assigned To</label>
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={staffData.filter(
                        (staff) =>
                          staff.Role === "Regional Manager" || staff.Role === "Account Manager" || staff?.isSuperAdmin
                      )}
                      getOptionLabel={(option) =>
                        option.FirstName + " " + option.LastName || ""
                      }
                      value={
                        staffData.find(
                          (staff) => staff.UserId === formData.AssignTo
                        ) || null
                      }
                      onChange={handleStaffAutocompleteChange}
                      disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
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
                          placeholder="Choose..."
                          className="bg-white"
                        />
                      )}
                    />
                  </div>
                
                  {location?.pathname !== '/invoices/add-invoices' && <div className="col-md-3">
                    {" "}
                    <label className="form-label">Terms</label>
                    <Autocomplete
                      id="inputState19"
                      size="small"
                      options={terms}
                      getOptionLabel={(option) => option.Term || ""}
                      value={
                        terms.find(
                          (customer) => customer.TermId === formData.TermId
                        ) || null
                      }
                      onChange={handleTermsAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.TermId === value.TermId
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          placeholder="Terms"
                          className="bg-white"
                        />
                      )}
                      aria-label="Default select example"
                    />
                  </div>}
                </div>
                <div className="row">
                  {location?.pathname !== '/recurring-invoices/add-template' && <><div className="col-md-3">
                    <label className="form-label">
                      Issue Date<span className="text-danger">*</span>
                    </label>
                    <div className="input-group mb-2">
                      <TextField
                        type="date"
                        className="form-control"
                        name="IssueDate"
                        size="small"
                        value={formatDate(formData.IssueDate)}
                        error={submitClicked && !formData.IssueDate}
                        disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            IssueDate: e.target.value,
                            DueDate: increaseDueDate(
                              formData.Term,
                              e.target.value
                            ),
                          });
                        }}
                      />

                    </div>
                  </div>
                    <div className=" col-md-3">
                      <label className="form-label">Due Date</label>
                      <div className="input-group mb-2">
                        <TextField
                          type="date"
                          className="form-control"
                          size="small"
                          name="DueDate"
                          value={formatDate(formData.DueDate)}
                          onChange={handleChange}
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                        />
                      </div>
                    </div>
                    <div className=" col-md-3">
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
                    </div></>}
                  {location?.pathname == '/invoices/add-invoices' && <div className="col-md-3">
                    {" "}
                    <label className="form-label">Terms</label>
                    <Autocomplete
                      id="inputState19"
                      size="small"
                      options={terms}
                      getOptionLabel={(option) => option.Term || ""}
                      value={
                        terms.find(
                          (customer) => customer.TermId === formData.TermId
                        ) || null
                      }
                      onChange={handleTermsAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.TermId === value.TermId
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          placeholder="Terms"
                          className="bg-white"
                        />
                      )}
                      aria-label="Default select example"
                    />
                  </div>}
                </div>
                <div className="row">
                  <div className="col-md-3">
                    <div className="c-details">
                      <ul>
                        <li>
                          <span>Billing Address</span>
                          <p>
                            {customerAddress || formData.CustomerAddress || ""}
                          </p>
                        </li>
                        <li>
                          <span>Shipping Address</span>
                          <p>
                            {customerAddress || formData.CustomerAddress || ""}
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row">
                      <div className=" col-md-6">
                        <div className="row">
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
                      </div>
                      {/*  <div className=" col-md-6">
                        <label className="form-label">
                          Related Bills
                          {formData.BillId ? (
                            <>
                              <a
                                href=""
                                style={{ color: "blue" }}
                                className="ms-2"
                                onClick={() => {
                                  navigate(
                                    `/Bills/add-bill?id=${formData.BillId}`
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
                        <Autocomplete
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
                              placeholder="Bill No"
                              className="bg-white"
                            />
                          )}
                          aria-label="Contact select"
                        /> 
                        <CustomAutocomplete
                          property1="BillId"
                          property2="BillNumber"
                          formData={formData}
                          setFormData={setFormData}
                          endPoint="/Bill/GetSearchBillList"
                          placeholder="Bill No"
                        />
                      </div>*/}
                      {location?.pathname == '/invoices/add-invoices' && <div className=" col-md-6 mt-2">
                        <LinkingBadges
                          data={poAndBills}
                          setData={setPoAndBills}
                        />
                      </div>}

                      {/* <div className="mt-2 col-md-6">
                        <label className="form-label">
                          Purchase Order
                          {formData.PurchaseOrderId ? (
                            <>
                              <a
                                href=""
                                style={{ color: "blue" }}
                                className="ms-2"
                                onClick={() => {
                                  navigate(
                                    `/purchase-order/add-po?id=${formData.PurchaseOrderId}`
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
                        <Autocomplete
                          size="small"
                          options={PoList}
                          noOptionsText="No record found in system"
                          getOptionLabel={(option) =>
                            option.PurchaseOrderNumber || ""
                          }
                          value={
                            PoList.find(
                              (po) =>
                                po.PurchaseOrderId === formData.PurchaseOrderId
                            ) || null
                          }
                          onChange={handlePoAutocompleteChange}
                          disabled={isEditMode && !menuAccess.isLoading && !menuAccess.canEdit}
                          isOptionEqualToValue={(option, value) =>
                            option.PurchaseOrderId === value.PurchaseOrderId
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label=""
                              placeholder="Purchase order No"
                              className="bg-white"
                            />
                          )}
                          aria-label="Contact select"
                        /> 
                        <CustomAutocomplete
                          property1="PurchaseOrderId"
                          property2="PurchaseOrderNumber"
                          formData={formData}
                          setFormData={setFormData}
                          endPoint="/PurchaseOrder/GetSearchPurchaseOrderList"
                          placeholder="Purchase Order No"
                        />
                      </div>*/}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <MultiSelectAutocomplete
                      options={staffData.filter((staff) => staff.Role === "Foreman")}
                      property="ForemanId"
                      label="Select Foreman"
                      selectedOptions={selectedForemen}
                      setSelectedOptions={setSelectedForemen}
                      fullList={staffData}
                      error={false}
                      required={false}
                    />
                  </div>
                  {/* <div className="col-md-3 mt-2">
                    {formData.CreatedDate ? (
                      <label className="form-label">
                        Created Date:{" "}
                        {TblDateFormat(formData.CreatedDate, true, true)}
                      </label>
                    ) : (
                      <></>
                    )}
                  </div> */}
                  {/* <div className="col-md-3 mt-2">
                      {formData.CreatedDate ? <h6>Created Date: {TblDateFormat(formData.CreatedDate, true)}</h6>:<></>}
                      </div> */}
                </div>
              </div>
            </div>
            {location?.pathname == '/recurring-invoices/add-template' && <> <div className="itemtitleBar">
              <h4>Invoice Template</h4>
            </div>
              <div className="card-body pt-0">
                <div className="row">
                  <div className="col-md-2 mt-2">
                    <label className="form-label">Template Name</label>
                    <TextField
                      name="TemplateName"
                      value={recurringData?.TemplateName}
                      onChange={handleInputChange}
                      placeholder="Enter template name"
                      size="small"
                      fullWidth
                      className="bg-white"
                    />
                  </div>
                  <div className="col-md-2 mt-2 ">
                    <label className="form-label">Type</label>

                    <Autocomplete
                      id="inputTemplateRepeat"
                      size="small"
                      options={getTemplateTypeList}
                      getOptionLabel={(option) => option.RecurringTemplateType || ""}

                      value={
                        getTemplateTypeList.find(
                          (opt) => opt.RecurringTemplateTypeId === recurringData?.RecurringTemplateTypeId
                        ) || null
                      }

                      onChange={(event, newValue) =>
                        handleTemplateType({
                          target: {
                            name: "RecurringTemplateTypeId",
                            value: newValue?.RecurringTemplateTypeId || ""
                          }
                        })
                      }

                      isOptionEqualToValue={(option, value) =>
                        option?.RecurringTemplateTypeId === value?.RecurringTemplateTypeId
                      }

                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Type"
                          className="bg-white"
                        />
                      )}
                    />
                  </div>
                  {recurringData?.RecurringTemplateTypeId == 1 && <>
                    <div className="col-md-2  mt-2">
                      <label className="form-label">
                        Start Date
                      </label>
                      <div className="input-group mb-2">
                        <TextField
                          type="date"
                          className="form-control "
                          name="StartDate"
                          size="small"
                          value={formatDate(recurringData?.StartDate)} // same as IssueDate
                          error={submitClicked && !recurringData?.StartDate}
                          onChange={(e) => {
                            setrecurringData({
                              ...recurringData,
                              StartDate: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-2  mt-2">
                      <label className="form-label">
                        End Date
                      </label>
                      <div className="input-group mb-2">
                        <TextField
                          type="date"
                          className="form-control "
                          name="StartDate"
                          size="small"
                          value={formatDate(recurringData?.EndDate)} // same as IssueDate
                          // error={submitClicked && !recurringData?.EndDate}
                          onChange={(e) => {
                            setrecurringData({
                              ...recurringData,
                              EndDate: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-md-2  mt-2">
                      <label className="form-label">Repeat Interval</label>

                      <Autocomplete

                        id="inputStateRepeat"
                        size="small"
                        options={RepeatIntervalList}
                        getOptionLabel={(option) => option.Repeat || ""}

                        value={
                          RepeatIntervalList.find(
                            (opt) => opt.RepeatIntervalId === recurringData?.RepeatIntervalId
                          ) || null
                        }

                        onChange={(event, newValue) =>
                          handleRepeatChange({
                            target: {
                              name: "RepeatIntervalId",
                              value: newValue?.RepeatIntervalId || ""
                            }
                          })
                        }

                        isOptionEqualToValue={(option, value) =>
                          option.RepeatIntervalId === value.RepeatIntervalId
                        }

                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Repeat Interval"
                            className="bg-white"
                            error={submitClicked && !recurringData?.RepeatIntervalId}
                          />
                        )}
                      />
                    </div>
                    {recurringData.RepeatIntervalId === 2 && (
                      <div className="col-md-2  mt-2">
                        <label className="form-label">Repeat Day</label>
                        <Autocomplete
                          id="inputStateRepeatDay"
                          size="small"
                          options={daysOfWeek}
                          getOptionLabel={(option) => option.name || ""}
                          value={
                            daysOfWeek.find((day) => day.id === recurringData?.Day) || null
                          }
                          onChange={(event, newValue) =>
                            handleDayChange({
                              target: {
                                name: "Day",
                                value: newValue?.id || "",
                              },
                            })
                          }
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Day"
                              className="bg-white"
                              error={submitClicked && !recurringData?.Day}
                            />
                          )}
                        />
                      </div>
                    )}
                    {recurringData.RepeatIntervalId === 3 && (
                      <div className="col-md-2 mt-1">
                        <label className="form-label">Repeat Date</label>
                        <Autocomplete
                          id="inputStateRepeatDate"
                          size="small"
                          options={monthDates}
                          getOptionLabel={(option) => option.label || ""}
                          value={
                            monthDates.find((date) => date.id === recurringData?.Day) || null
                          }
                          onChange={(event, newValue) =>
                            handleDayChange({
                              target: {
                                name: "Day",
                                value: newValue?.id || "",
                              },
                            })
                          }
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Date"
                              className="bg-white"
                              error={submitClicked && !recurringData?.Day}
                            />
                          )}
                        />
                      </div>
                    )}</>}
                  {/* 
                      Option for Issue Date selection: 
                      Radio buttons for "Current Month" and "Next Month"
                    */}
                  {recurringData?.RecurringTemplateTypeId == 1 && <div className="col-md-6 mt-2">
                    <label className="form-label">Issue Date?</label>
                    <div className="d-flex align-items-center">
                      <div className="form-check me-3 d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="isIssueDateNext"
                          id="issueDateCurrentMonth"
                          value="current"
                          checked={recurringData?.isIssueDateNext === false || recurringData?.isIssueDateNext === undefined}
                          onChange={() =>
                            setrecurringData({
                              ...recurringData,
                              isIssueDateNext: false,
                            })
                          }
                        />
                        <label className="form-check-label ms-1" htmlFor="issueDateCurrentMonth">
                          Current Month
                        </label>
                        <Tooltip
                          title={
                            <div>
                              <strong>Current Month:</strong> The issue date will be set to the current month.
                            </div>
                          }
                          placement="top"
                          arrow
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            color="action"
                            style={{ marginLeft: 4, verticalAlign: 'middle', cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </div>
                      <div className="form-check d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="isIssueDateNext"
                          id="issueDateNextMonth"
                          value="next"
                          checked={recurringData?.isIssueDateNext === true}
                          onChange={() =>
                            setrecurringData({
                              ...recurringData,
                              isIssueDateNext: true,
                            })
                          }
                        />
                        <label className="form-check-label ms-1" htmlFor="issueDateNextMonth">
                          Next Month
                        </label>
                        <Tooltip
                          title={
                            <div>
                              <strong>Next Month:</strong> The issue date will be set to the next month.
                            </div>
                          }
                          placement="top"
                          arrow
                        >
                          <InfoOutlinedIcon
                            fontSize="small"
                            color="action"
                            style={{ marginLeft: 4, verticalAlign: 'middle', cursor: 'pointer' }}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </div>}
                  {/* <div className="col-md-2 mt-2 d-flex align-items-center" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="sendEmailCheckbox"
                      checked={recurringData?.isEmailSend}
                      onChange={(e) =>
                        setrecurringData({
                          ...recurringData,
                          isEmailSend: e.target.checked,
                        })
                      }
                    />
                    <label
                      htmlFor="sendEmailCheckbox"
                      // className="fw-normal"
                      style={{ marginLeft: "9px", marginTop: "4px", cursor: "pointer" }}
                    >
                      Send Email
                    </label>
                  </div> */}
                </div>
              </div></>}

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
                        <th>Item</th>
                        <th>
                          Description{' '}
                          {location?.pathname == '/recurring-invoices/add-template' && (
                            <Tooltip
                              title={
                                <div>
                                  <strong>{'{CurrentMonth}'}:</strong> This variable will be replaced with the name of the current month, e.g. {new Date().toLocaleString('default', { month: 'long' }).toUpperCase()}.<br />
                                  <strong>{'{NextMonth}'}:</strong> This variable will be replaced with the name of the next month, e.g. {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'long' }).toUpperCase()}.
                                </div>
                              }
                              placement="top"
                              arrow
                            >
                              <InfoOutlinedIcon
                                fontSize="small"
                                color="action"
                                style={{ marginLeft: 4, verticalAlign: 'middle', cursor: 'pointer' }}
                              />
                            </Tooltip>
                          )}
                        </th>

                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount $</th>
                        <th>Cost Price</th>
                        <th>Is Misc</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.tblInvoiceItems &&
                        formData.tblInvoiceItems.length > 0 ? (
                        formData.tblInvoiceItems
                          .filter((item) => item.isCost === false) // Filter items with isCost equal to 1
                          .map((item, index) => {
                            return (

                              <tr colSpan={2} key={index}>
                                <td>{item.Name}</td>
                                <td>
                                  <textarea
                                    size="small"
                                    rows="2"
                                    style={{ height: "fit-content" }}
                                    className="form-control form-control-sm"
                                    value={item.Description}
                                    onChange={(e) =>
                                      handleDescriptionChange(index, e, 0, item)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm number-input"
                                    value={item.Qty}
                                    ref={
                                      index ===
                                        formData.tblInvoiceItems.length - 1
                                        ? quantityInputRef
                                        : null
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(index, e, 0)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm number-input"
                                    value={item.Rate}
                                    onChange={(e) =>
                                      handleRateChange(index, e, 0)
                                    }
                                  />
                                </td>
                                <td className="text-right pe-2">
                                  {formatAmount(item.Qty * item.Rate)}
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm number-input"
                                    value={item.PurchasePrice}
                                    onChange={(e) =>
                                      handleCostChange(index, e, 0)
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <Checkbox
                                    value={item.IsMisc}
                                    checked={item.IsMisc}
                                    onChange={(e) => {
                                      handleIsMisc(index, e, 0, item);
                                    }}
                                  />
                                </td>
                                <td>
                                  <div className="badgeBox">
                                    <Button
                                      onClick={() => {
                                        deleteItem(index, item.isCost);
                                      }}
                                    >
                                      <Delete color="error" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                      ) : (
                        <></>
                      )}
                      <tr>
                        <td>
                          <>
                            <Autocomplete
                              id="search-items"
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
                        <td>
                          <h5 className="text-right" style={{ margin: "0" }}>
                            {itemInput
                              ? ((itemInput.Rate || 0) * (itemInput.Qty || 0)).toFixed(2)
                              : 0}
                          </h5>
                        </td>
                        <td>
                          <input
                            type="number"
                            name="Rate"
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
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className=" row">
                <div className={location?.pathname == '/recurring-invoices/add-template' ? "col-md-4" : "col-md-5"}>
                  <div className="row">
                    <div className="col-xl-12 col-lg-12">
                      <div className="basic-form">
                        <form>
                          <label className="form-label">Memo Internal</label>
                          <div className="mb-3">
                            <textarea
                              placeholder=" Memo Internal"
                              value={formData.MemoInternal}
                              name="MemoInternal"
                              onChange={handleChange}
                              className=" form-control"
                              rows="3"
                            ></textarea>
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12">
                      <div className="basic-form">
                        <form>
                          <label className="form-label">Customer Message</label>
                          <div className="mb-3">
                            <TextArea
                              placeholder=" Customer Message"
                              value={formData.CustomerMessage}
                              name="CustomerMessage"
                              onChange={handleChange}
                            ></TextArea>
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12">
                      <FileUploadButton onClick={handleFileChange}>
                        Upload File
                      </FileUploadButton>
                    </div>
                  </div>
                </div>
                {/* Reacurring Form */}
                {/* {location?.pathname == '/recurring-invoices/add-template' && <div className="col-md-3  ms-auto sub-total" style={{ padding: "22px" }}>
                  <div className="col-md-12">
                    <label className="form-label">Template Name</label>
                    <TextField
                      name="TemplateName"
                      value={recurringData?.TemplateName}
                      onChange={handleInputChange}
                      placeholder="Enter template name"
                      size="small"
                      fullWidth
                      className="bg-white"
                    />
                  </div>
                  <div className="col-md-12  mt-2">
                    <label className="form-label">Type</label>

                    <Autocomplete
                      id="inputTemplateRepeat"
                      size="small"
                      options={getTemplateTypeList}
                      getOptionLabel={(option) => option.RecurringTemplateType || ""}

                      value={
                        getTemplateTypeList.find(
                          (opt) => opt.RecurringTemplateTypeId === recurringData?.RecurringTemplateTypeId
                        ) || null
                      }

                      onChange={(event, newValue) =>
                        handleTemplateType({
                          target: {
                            name: "RecurringTemplateTypeId",
                            value: newValue?.RecurringTemplateTypeId || ""
                          }
                        })
                      }

                      isOptionEqualToValue={(option, value) =>
                        option?.RecurringTemplateTypeId === value?.RecurringTemplateTypeId
                      }

                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Type"
                          className="bg-white"
                        />
                      )}
                    />
                  </div>
                  {recurringData?.RecurringTemplateTypeId == 1 && <>
                    <div className="col-md-12  mt-2">
                      <label className="form-label">
                        Start Date
                      </label>
                      <div className="input-group mb-2">
                        <TextField
                          type="date"
                          className="form-control "
                          name="StartDate"
                          size="small"
                          value={formatDate(recurringData?.StartDate)} // same as IssueDate
                          error={submitClicked && !recurringData?.StartDate}
                          onChange={(e) => {
                            setrecurringData({
                              ...recurringData,
                              StartDate: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-md-12  mt-2">
                      <label className="form-label">Repeat Interval</label>

                      <Autocomplete
                        id="inputStateRepeat"
                        size="small"
                        options={RepeatIntervalList}
                        getOptionLabel={(option) => option.Repeat || ""}

                        value={
                          RepeatIntervalList.find(
                            (opt) => opt.RepeatIntervalId === recurringData?.RepeatIntervalId
                          ) || null
                        }

                        onChange={(event, newValue) =>
                          handleRepeatChange({
                            target: {
                              name: "RepeatIntervalId",
                              value: newValue?.RepeatIntervalId || ""
                            }
                          })
                        }

                        isOptionEqualToValue={(option, value) =>
                          option.RepeatIntervalId === value.RepeatIntervalId
                        }

                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Repeat Interval"
                            className="bg-white"
                          />
                        )}
                      />
                    </div>
                    {recurringData.RepeatIntervalId === 2 && (
                      <div className="col-md-12  mt-2">
                        <label className="form-label">Repeat Day</label>
                        <Autocomplete
                          id="inputStateRepeatDay"
                          size="small"
                          options={daysOfWeek}
                          getOptionLabel={(option) => option.name || ""}
                          value={
                            daysOfWeek.find((day) => day.id === recurringData?.Day) || null
                          }
                          onChange={(event, newValue) =>
                            handleDayChange({
                              target: {
                                name: "Day",
                                value: newValue?.id || "",
                              },
                            })
                          }
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Day"
                              className="bg-white"
                            />
                          )}
                        />
                      </div>
                    )}
                    {recurringData.RepeatIntervalId === 3 && (
                      <div className="col-md-12 mt-2">
                        <label className="form-label">Repeat Date</label>
                        <Autocomplete
                          id="inputStateRepeatDate"
                          size="small"
                          options={monthDates}
                          getOptionLabel={(option) => option.label || ""}
                          value={
                            monthDates.find((date) => date.id === recurringData?.Day) || null
                          }
                          onChange={(event, newValue) =>
                            handleDayChange({
                              target: {
                                name: "Day",
                                value: newValue?.id || "",
                              },
                            })
                          }
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Date"
                              className="bg-white"
                            />
                          )}
                        />
                      </div>
                    )}</>}

                  <div
                    className="col-md-7  mt-2  d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={recurringData?.isEmailSend} // bind to state
                      onChange={(e) =>
                        setrecurringData({
                          ...recurringData,
                          isEmailSend: e.target.checked,
                        })
                      }
                    />
                    <h5
                      className="fw-normal"
                      style={{ marginLeft: "9px", marginTop: "14px" }}
                    >
                      Send Email
                    </h5>
                  </div>


                </div>} */}
                <div className="col-md-4  ms-auto sub-total">
                  {formData.isVoid && (
                    <div className="border border-warning rounded text-warning p-2 text-center">
                      This invoice has been voided
                    </div>
                  )}
                  <table className="table table-clear table-borderless custom-table custom-table-row">
                    <tbody>
                      <tr>
                        <td className="left">
                          <strong>Subtotal</strong>
                        </td>
                        <td className="right text-right">
                          ${subtotal ? subtotal?.toFixed(2) : 0.0}
                        </td>
                      </tr>

                      <tr>
                        <td className="left custom-table-row">
                          <div
                            style={{ width: "12em" }}
                            className="input-group"
                          >
                            <strong className="mt-2">Discount</strong>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              style={{
                                width: "5em",
                                marginLeft: "1em",
                                borderRadius: "8px",
                              }}
                              className="form-control form-control-sm"
                              name="Discount"
                              value={discountPercentage >= 0 ? discountPercentage : ""}
                              onKeyDown={e => {
                                // Prevent minus key, e key (for exponential), and other invalid keys
                                if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                                  e.preventDefault();
                                }
                              }}
                              onChange={e => {
                                // Always ensure only non-negative numbers go to state
                                let val = e.target.value;
                                // Remove any minus signs
                                val = val.replace(/-/g, "");
                                if (val === "") {
                                  setDiscountPercentage("");
                                } else {
                                  let parsed = Number(val);
                                  if (!isNaN(parsed) && parsed >= 0) {
                                    // Cap at 100%
                                    const cappedValue = Math.min(parsed, 100);
                                    setDiscountPercentage(cappedValue);
                                  }
                                }
                              }}
                              placeholder="0.00"
                              onWheel={e => e.target.blur()}
                              inputMode="decimal"
                            />
                            <strong className="mt-2"> &nbsp;&nbsp;%</strong>
                          </div>
                          {/* {discountPercentage > 0 && (
                            <small style={{ display: "block", marginTop: "4px", color: "#666" }}>
                              Discount Amount: ${totalDiscount.toFixed(2)}
                            </small>
                          )} */}
                        </td>
                        <td className="right text-right">${(totalDiscount || 0).toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="left">
                          <strong>Total</strong>
                        </td>
                        <td className="right text-right">
                          {formData.isVoid ? (
                            <strong>Voided</strong>
                          ) : (
                            <strong>${formatAmount(totalItemAmount)}</strong>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="left">
                          <strong>Balance Due</strong>
                        </td>
                        <td className="right text-right">
                          <strong>
                            ${formatAmount(formData.BalanceAmount)}
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="left">
                          <strong>Bill Total</strong>
                        </td>
                        <td className="right text-right">
                          <strong>${formatAmount(BillTotal)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="left">
                          <strong>Labor Cost</strong>
                        </td>
                        <td className="right text-right">
                          <strong>${formatAmount(laborAmount)}</strong>
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
                          {(profitPercentage || 0).toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              <div className="row mx-2">
                {estimateLinkData.FileData?.map((file, index) => (
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
                      onClick={() => handleDeletePLFile(index)}
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
                    className="col-md-2 col-md-2 mt-3 image-container"
                    style={{
                      width: "115px",
                      height: "110px",
                      marginLeft: "10px",
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
                        selectedImage.InvoiceFileId === file.InvoiceFileId
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
                    >
                      <span
                        onClick={() => {
                          deleteInvoiceFile(file.InvoiceFileId, getInvoice);
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
                    {file.type === 'application/pdf' ? (
                      <div style={{
                        width: "115px",
                        height: "110px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5"
                      }}>
                        <BsFiletypePdf size={50} color="#dc3545" />
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
                ))}
              </div>
            </div>

            <div className="mb-3 row ">
              <div className="col-md-6">
                <div className="ms-2">
                  <BackButton
                    onClick={() => {
                      navigate(location?.pathname == '/recurring-invoices/add-template' ? "/recurring-invoices" : "/invoices");
                      setRecurringInnvoices(false)
                      // window.history.back();
                    }}
                  >
                    Back
                  </BackButton>
                </div>
              </div>

              {!formData.isDelete && (
                <div className="col-md-6 text-right">
                  {/* {loggedInUser.userRole == "1" && location?.pathname == '/invoices/add-invoices' && idParam !== 0 ? (
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

                              navigate(`/recurring-invoices/add-template?id=${idParam}&isTemplate=true`);
                            }}
                          >
                            Invoice Template
                          </MenuItem>


                        </Select>
                      </FormControl>
                    </>
                  ) : (
                    <></>
                  )} */}
                  {/* const idData=copyIsTemplate===true?0:idParam */}
                  {idParam && copyIsTemplate === false ? (
                    <>
                      {location?.pathname !== '/recurring-invoices/add-template' && <><Button
                        className="me-2"
                        variant="outlined"
                        color="warning"
                        data-bs-toggle="modal"
                        data-bs-target={`#voidModal`}
                        disabled={formData.isVoid}
                      // onClick={voidInvoice}
                      >
                        Void
                      </Button>
                        <ActivityLog activityLogs={activityLogs} type="Invoice" /></>}
                      {canDelete && (
                        <HandleDelete
                          id={idParam}
                          endPoint={"Invoice/DeleteInvoice?id="}
                          to="/invoices"
                          syncQB={syncQB}
                        />
                      )}
                      {location?.pathname !== '/recurring-invoices/add-template' && <> <PrintButton
                        varient="mail"
                        onClick={() => {
                          handleMainButtonClick();
                        }}
                      ></PrintButton>
                        <PrintButton
                          varient="print"
                          onClick={() => {
                            navigate(`/invoices/invoice-preview?id=${idParam}`);
                          }}
                        ></PrintButton>

                        <PrintButton
                          varient="Download"
                          onClick={handleOpenInvoicePdfDownloadModal}
                        ></PrintButton></>}
                    </>
                  ) : (
                    <></>
                  )}

                  {((!isEditMode && !menuAccess.isLoading && menuAccess.canCreate) || (isEditMode && !menuAccess.isLoading && menuAccess.canEdit)) ? (
                    <LoaderButton
                      disable={btnDisable}
                      loading={disableButton}
                      handleSubmit={(e) => {
                        if (formData?.isCreatedFromTemplate && idParam != 0) {
                          handleModalOpen();
                        } else {
                          handleSubmit(e);
                        }
                      }}
                    >
                      Save
                    </LoaderButton>
                  ) : (
                    <Tooltip 
                      title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create invoices"} 
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
        </div>
      )}
    </>
  );
};

export default AddInvioces;
