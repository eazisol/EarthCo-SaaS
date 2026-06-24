import React, { useContext, useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

import Cookies from "js-cookie";
import BillTitle from "./BillTitle";
import formatDate from "../../custom/FormatDate";
import Alert from "@mui/material/Alert";
import useFetchPo from "../Hooks/useFetchPo";
import { Delete, Create } from "@mui/icons-material";
import { Button } from "@mui/material";
import { Print, Email, Download } from "@mui/icons-material";
import useDeleteFile from "../Hooks/useDeleteFile";
import { useNavigate, NavLink } from "react-router-dom";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import LoaderButton from "../Reusable/LoaderButton";
import CircularProgress from "@mui/material/CircularProgress";
import { DataContext } from "../../context/AppData";
import useQuickBook from "../Hooks/useQuickBook";
import useFetchCatagories from "../Hooks/useFetchCatagories";
import BackButton from "../Reusable/BackButton";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import FileUploadButton from "../Reusable/FileUploadButton";
import formatAmount from "../../custom/FormatAmount";
import PrintButton from "../Reusable/PrintButton";
import HandleDelete from "../Reusable/HandleDelete";
import useFetchInvoices from "../Hooks/useFetchInvoices";
import BillPdf from "./BillPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import TextArea from "../Reusable/TextArea";
import { baseUrl } from "../../apiConfig";
import CustomAutocomplete from "../Reusable/CustomAutocomplete";
import LinkingBadges from "../Reusable/LinkingBadges";
import imageCompresser from "../../custom/ImageCompresser";
import useGetData from "../Hooks/useGetData";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const AddBill = ({}) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const menuAccess = useMenuAccess();
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  
  const currentDate = new Date();

  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  
  // Determine if this is edit mode (has idParam)
  const isEditMode = !!(idParam && idParam !== 0);
  const navigate = useNavigate();
  const { loggedInUser, companyInfo, setselectedPdf, dynamicColorAndLogo } = useContext(DataContext);
  const [formData, setFormData] = useState({
    BillDate: currentDate,
    DueDate: null,
    PurchaseOrderId: null,
  });

  const { syncQB } = useQuickBook();
  const { getListData } = useGetData();
  const { fetchCatagories, catagories } = useFetchCatagories();
  const { fetchSupplierName, supplierName, setSupplierName } =
    useFetchCustomerName();

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [btnDisable, setBtnDisable] = useState(false);

  const [vendorList, setVendorList] = useState([]);
  const [supplierAddress, setSupplierAddress] = useState("");
  const [tags, setTags] = useState([]);
  const [terms, setTerms] = useState([]);
  const [estimates, setEstimates] = useState([]);

  const { PoList, fetchPo } = useFetchPo();
  const { deleteBillFile } = useDeleteFile();

  const [loading, setLoading] = useState(false);
  const [billPreviewData, setBillPreviewData] = useState({});
  const [qBError, setQBError] = useState("");
  const getBill = async () => {
    setLoading(true);
    if (!idParam) {
      setLoading(false);

      return;
    }

    getListData(
      `/SyncQB/CheckSyncLog?Id=${idParam}&Type=Bill&CompanyId=${loggedInUser.CompanyId}`,
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

        console.log("datadtadtadatd", data);
      },
      (err) => {
        console.log("qb errorrrr", err);
      }
    );
    try {
      const res = await axios.get(`${baseUrl}/api/Bill/GetBill?id=${idParam}`, {
        headers,
      });
      setBillPreviewData(res.data);
      setFormData(res.data.Data);
      fetchSupplierName(res.data.Data.SupplierId);
      setItemsList(res.data.ItemData);
      setCatagoryList(res.data.AccountData);
      setSelectedInvoice(res.data.EstimateInvoiceData);
      setLoading(false);

      setPrevFiles(res.data.FileData);
      console.log("selected bill is", res.data);
    } catch (error) {
      setLoading(false);

      console.log("api call error", error);
    }
  };
  useEffect(() => {
    getBill();
    fetchCatagories();
    fetchVendors();
    fetchTags();
    fetchTerms();
    // fetchPo();
    // getEstimate();
    // fetchInvoices();
  }, []);

  const fetchVendors = async (searchText = "") => {
    axios
      .get(
        `${baseUrl}/api/Supplier/GetSearchSupplierList?Search=${searchText}`,
        {
          headers,
        }
      )
      .then((res) => {
        console.log("Vendor are ", res.data);
        setVendorList(res.data);
      })
      .catch((error) => {
        setVendorList([]);
        console.log("contacts data fetch error", error);
      });
  };
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

  const fetchTags = async () => {
    axios
      .get(`${baseUrl}/api/Estimate/GetTagList`, {
        headers,
      })
      .then((res) => {
        console.log("tags are ", res.data);
        setTags(res.data);
      })
      .catch((error) => {
        setTags([]);
        console.log("contacts data fetch error", error);
      });
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

  const fetchTerms = async () => {
    axios
      .get(`${baseUrl}/api/PurchaseOrder/GetTermList`, {
        headers,
      })
      .then((res) => {
        console.log("tags are ", res.data);
        setTerms(res.data);
      })
      .catch((error) => {
        setTerms([]);
        console.log("contacts data fetch error", error);
      });
  };
  const handleTermsAutocompleteChange = (event, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    if (newValue) {
      // Update the formData with both EstimateId and EstimateNumber
      setFormData((prevData) => ({
        ...prevData,
        TermId: newValue.TermId,
      }));
    } else {
      // Handle the case where the newValue is null (e.g., when the selection is cleared)
      // Reset both EstimateId and EstimateNumber in formData
      setFormData((prevData) => ({
        ...prevData,

        TermId: null,
      }));
    }
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
    
    setFormData((prevData) => ({
      ...prevData,
      InvoiceId: newValue.InvoiceId,
      InvoiceNumber: newValue.InvoiceNumber,
    }));
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

  const handleInputChange = (e, newValue) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    setSubmitClicked(false);

    setDisableButton(false);
    const { name, value } = e.target;

    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId
  };
  const handleChange = (e) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    setSubmitClicked(false);

    setDisableButton(false);

    // Extract the name and value from the event target
    const { name, value } = e.target;

    // Create a new copy of formData with the updated key-value pair
    const updatedFormData = {
      ...formData,
      [name]: value,

      Amount: 0.0,
      Currency: "usd",

      Amount: totalAmount,
    };

    // Update the formData state
    setFormData(updatedFormData);
  };

  useEffect(() => {
    fetchSupplierName(formData.SupplierId);
  }, [formData.SupplierId]);

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
      (id) => {},
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
    });

    setItemsList((prevItems) => [
      ...prevItems,
      {
        ...itemInput,
        ItemId: item.ItemId,
        Name: item.ItemName,
        Description: item.SaleDescription,
        Rate: item.SalePrice,
      }, // Ensure each item has a unique 'id'
    ]);

    setSearchResults([]); // Clear the search results

    console.log("selected item is", item);
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
    const total = itemsList.reduce((acc, item) => {
      return acc + item.Rate * item.Qty;
    }, 0);
    return total;
  };

  const handleItemDescriptionChange = (itemId, event) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
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
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
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

  useEffect(() => {
    // Calculate the total amount and update the state
    const total = calculateTotalAmount();
    setTotalAmount(total);
  }, [itemsList]);

  // Catagories

  const [catagoryList, setCatagoryList] = useState([]);
  const [catagoryInput, setCatagoryInput] = useState({
    AccountId: 0,
    Name: "",
    Description: "",
    Amount: 0,
  });

  const [selectedCatagory, setSelectedCatagory] = useState({});

  const [totalCatagoryAmount, setTotalCatagoryAmount] = useState(0);

  const handleCatagoryClick = (item) => {
    console.log("selected catagory", item);
    setSelectedCatagory(item);
    if (item) {
      setCatagoryList((prevItems) => [
        ...prevItems,
        {
          AccountId: item.AccountId,
          Name: item.Code + " " + item.Name,
          Description: "",
          Amount: 0,
        },
      ]);
    }
  };

  const handleDescriptionChange = (index, value) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    setCatagoryList((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index].Description = value;
      return updatedItems;
    });
  };

  // Function to handle amount change in upper rows
  const handleAmountChange = (index, event) => {
    // Prevent changes if no edit access
    if (isEditMode && !menuAccess.isLoading && !menuAccess.canEdit) {
      return;
    }
    
    const inputValue = event.target.value; // Allow only numbers and dots
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      setCatagoryList((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[index].Amount = inputValue === "" ? "" : inputValue; // Convert value to a float if needed
        return updatedItems;
      });
    }
  };

  const deleteCatagory = (id) => {
    const updatedItemsList = catagoryList.filter((item, index) => index !== id);
    setCatagoryList(updatedItemsList);
  };

  const calculateCategoriesAmount = () => {
    let totalAmount = 0;
    for (const item of catagoryList) {
      totalAmount += item.Amount;
    }
    return totalAmount;
  };
  useEffect(() => {
    const total = calculateCategoriesAmount();
    setTotalCatagoryAmount(total);
  }, [catagoryList]);
  // files

  const [selectedFiles, setSelectedFiles] = useState([]);
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
    console.log("Deleted file at index:", indexToDelete);
  };

  // submit handler

  const [submitClicked, setSubmitClicked] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check permissions before submitting
    if (isEditMode) {
      // Updating existing bill - need edit access
      if (!menuAccess.isLoading && !menuAccess.canEdit) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to update bills");
        return;
      }
    } else {
      // Creating new bill - need create access
      if (!menuAccess.isLoading && !menuAccess.canCreate) {
        setOpenSnackBar(true);
        setSnackBarColor("error");
        setSnackBarText("You don't have permission to create bills");
        return;
      }
    }
    
    setSubmitClicked(true);
    console.log("formData", formData);

    if (!formData.SupplierId || !formData.BillDate) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please fill all required fields");
      return;
    }
    if (catagoryList.length <= 0) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Please Add Atleast one  category");

      return;
    }
    setDisableButton(true);

    const itemArray = itemsList.map((item) => ({
      ...item,
      Rate: item.Rate ? parseFloat(item.Rate) : 0,
      Qty: item.Qty ? parseFloat(item.Qty) : 0,
    }));
    const catagoriesArray = catagoryList.map((item) => ({
      ...item,
      Amount: item.Amount ? parseFloat(item.Amount) : 0,
    }));

    const postData = new FormData();

    // Merge the current items with the new items for EstimateData
    const BillData = {
      ...formData,
      BillId: idParam,
      tblBillItems: itemArray,
      tblBillAccounts: catagoriesArray,
      Currency: "usd",
      Amount: parseFloat(totalAmount) + parseFloat(totalCatagoryAmount),
      CompanyId: Number(loggedInUser.CompanyId),
    };

    console.log("BillData:", BillData);

    // console.log("data:", data);

    postData.append("BillData", JSON.stringify(BillData));
    console.log(JSON.stringify(BillData));
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
        `${baseUrl}/api/Bill/AddBill`,
        postData,
        {
          headers,
        }
      );
      syncQB(response.data.SyncId);

      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);

      navigate(`/bills/add-bill?id=${response.data.Id}`);
      setTimeout(() => {
        setDisableButton(false);
        window.location.reload();
      }, 4000);

      console.log("Data submitted successfully:", response.data.Message);
    } catch (error) {
      console.error("API Call Error:", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response.data);
      setDisableButton(false);
    }

    // Logging FormData contents (for debugging purposes)
    for (let [key, value] of postData.entries()) {
      console.log("fpayload....", key, value);
    }
    // window.location.reload();

    // console.log("post data izzz",postData);
  };

  return (
    <>
      <BillTitle />
      {isEditMode && !menuAccess.isLoading && !menuAccess.canEdit && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>Read-only mode:</strong> You don't have permission to update this bill. You can view the information but cannot make changes.
        </div>
      )}
      {!isEditMode && !menuAccess.isLoading && !menuAccess.canCreate && (
        <div className="alert alert-warning m-3" role="alert">
          <strong>No create access:</strong> You don't have permission to create new bills.
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

      <div className="add-item">
        {/* <div className="tabSwitch">
          <button type="button" className="btn btn-secondary btn-sm">
            Estimate
          </button>
          <button type="button" className="btn btn-secondary btn-sm">
            + Add Service Request
          </button>
          <button type="button" className="btn btn-secondary btn-sm">
            + Add Invoice
          </button>
        </div> */}
        {loading ? (
          <div className="center-loader">
            <CircularProgress />
          </div>
        ) : (
          <div className="card">
            {formData.isDelete && (
              <div class="alert alert-danger w-100 mb-0" role="alert">
                This Bill has been deleted
              </div>
            )}
            <div className="itemtitleBar d-flex ">
              <div className="w-50">
                <h4>Bill Details</h4>
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
              <div className="row mt-2">
                <div className="basic-form ">
                  <form>
                    <div className="row">
                      <div className="mb-3 col-md-3">
                        <div className="col-md-12">
                          <label className="form-label">
                            Vendor<span className="text-danger">*</span>
                          </label>
                          <Autocomplete
                            id="inputState19"
                            size="small"
                            options={vendorList}
                            filterOptions={(options) => options}
                            getOptionLabel={(option) =>
                              option.DisplayName || ""
                            }
                            value={
                              formData.SupplierDisplayName
                                ? { DisplayName: formData.SupplierDisplayName }
                                : ""
                            }
                            onChange={handleVendorAutocompleteChange}
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
                              />
                            )}
                            aria-label="Default select example"
                          />
                        </div>
                        <div className="col-md-12">
                          <div className="c-details">
                            <ul>
                              <li>
                                <span>Vendor Address</span>
                                <p>
                                  {supplierAddress ||
                                    formData.SupplierAddress ||
                                    " "}
                                </p>
                              </li>
                              <li>
                                <span>Shipping </span>
                                <p>
                                  {" "}
                                  {supplierAddress ||
                                    formData.SupplierAddress ||
                                    " "}
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-9">
                        <div className="row">
                          <div className=" col-md-4">
                            <label className="form-label">Bill # </label>
                            <div className="input-group mb-2">
                              <TextField
                                type="text"
                                name="BillNumber"
                                value={formData.BillNumber}
                                onChange={handleChange}
                                size="small"
                                className="form-control"
                                placeholder="Bill No"
                              />
                            </div>
                          </div>
                          {/* <div className=" col-md-4">
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
                          </div> */}
                          <div className=" col-md-4">
                            <label className="form-label">
                              Date<span className="text-danger">*</span>
                            </label>
                            <div className="input-group mb-2">
                              <TextField
                                type="date"
                                size="small"
                                className="form-control"
                                name="BillDate"
                                error={submitClicked && !formData.BillDate}
                                value={formatDate(formData.BillDate)}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className=" col-md-4">
                            <label className="form-label">Due</label>
                            <div className="input-group mb-2">
                              <input
                                type="date"
                                className="form-control"
                                name="DueDate"
                                value={formatDate(formData.DueDate)}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div className=" col-md-4">
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
                            {/* <Autocomplete
                              size="small"
                              options={PoList}
                              noOptionsText="No record found in system"
                              getOptionLabel={(option) =>
                                option.PurchaseOrderNumber || ""
                              }
                              value={
                                PoList.find(
                                  (po) =>
                                    po.PurchaseOrderId ===
                                    formData.PurchaseOrderId
                                ) || null
                              }
                              onChange={handlePoAutocompleteChange}
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
                            /> */}
                            <CustomAutocomplete
                              property1="PurchaseOrderId"
                              property2="PurchaseOrderNumber"
                              formData={formData}
                              setFormData={setFormData}
                              endPoint="/PurchaseOrder/GetSearchPurchaseOrderList"
                              placeholder="Purchase Order No"
                            />
                          </div>
                          <div className=" col-md-4">
                            <label className="form-label">Terms</label>
                            <Autocomplete
                              id="inputState19"
                              size="small"
                              options={terms}
                              getOptionLabel={(option) => option.Term || ""}
                              value={
                                terms.find(
                                  (customer) =>
                                    customer.TermId === formData.TermId
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
                          </div>
                          {/* <div className=" col-md-4">
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

                            <Autocomplete
                              id="inputState19"
                              size="small"
                              options={estimates}
                              noOptionsText="No record found in system"
                              getOptionLabel={(option) =>
                                option.EstimateNumber || ""
                              }
                              value={
                                estimates.find(
                                  (customer) =>
                                    customer.EstimateNumber ===
                                    formData.EstimateNumber
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
                            />
                            <CustomAutocomplete
                              property1="EstimateId"
                              property2="EstimateNumber"
                              formData={formData}
                              setFormData={setFormData}
                              endPoint="/Estimate/GetSearchEstimateList"
                              placeholder="Estimate No"
                            />
                          </div> */}
                          {/*<div className="col-md-4 ">
                            <label className="form-label">
                              Linked Invoice
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
                             <Autocomplete
                              size="small"
                              options={invoiceList}
                              noOptionsText="No record found in system"
                              getOptionLabel={(option) =>
                                option.InvoiceNumber || ""
                              }
                              value={
                                invoiceList.find(
                                  (invoice) =>
                                    invoice.InvoiceId === formData.InvoiceId
                                ) || null
                              }
                              onChange={(event, newValue) =>
                                handleAutocompleteChange(
                                  "InvoiceId",
                                  "InvoiceId",
                                  event,
                                  newValue
                                )
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.InvoiceId === value.InvoiceId
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label=""
                                  placeholder="Invoice No"
                                  className="bg-white"
                                />
                              )}
                              aria-label="Contact select"
                            /> 
                            <CustomAutocomplete
                              property1="InvoiceId"
                              property2="InvoiceNumber"
                              formData={formData}
                              setFormData={setFormData}
                              endPoint="/Invoice/GetSearchInvoiceList"
                              placeholder="Invoice No"
                            />
                          </div>*/}
                          <div className="col-md-4">
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
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <>
              <div className="itemtitleBar">
                <h4>Categories</h4>
              </div>
              <div className="card-body pt-0">
                <div className="estDataBox">
                  <div className="table-responsive active-projects style-1 mt-2">
                    <table id="empoloyees-tblwrapper" className="table">
                      <thead>
                        <tr>
                          <th className="itemName-width">Catagory</th>
                          <th>Description</th>

                          <th>Amount</th>

                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catagoryList && catagoryList.length > 0 ? (
                          catagoryList.map((item, index) => (
                            <tr>
                              <td className="itemName-width">
                                {item?.Name || ""}
                              </td>
                              <td>
                                <textarea
                                  size="small"
                                  rows="2"
                                  style={{ height: "fit-content" }}
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={item.Description}
                                  onChange={(e) =>
                                    handleDescriptionChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Description"
                                />
                              </td>
                              <td>
                                <input
                                  className="form-control form-control-sm number-input"
                                  value={item.Amount}
                                  onChange={(e) => handleAmountChange(index, e)}
                                  placeholder="Amount"
                                />
                              </td>
                              <td>
                                <Button onClick={() => deleteCatagory(index)}>
                                  <Delete color="error" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <></>
                        )}
                        <tr>
                          <td className="itemName-width">
                            <Autocomplete
                              options={catagories}
                              getOptionLabel={(item) => {
                                return item.Code
                                  ? `${item.Code} ${item.Name}`
                                  : item.Name;
                              }}
                              value={selectedCatagory?.Name}
                              onChange={(event, newValue) => {
                                handleCatagoryClick(newValue);
                              }}
                              filterOptions={(options, { inputValue }) => {
                                return options.filter(
                                  (option) =>
                                    option.Name?.toLowerCase().includes(
                                      inputValue.toLowerCase()
                                    ) ||
                                    option.Code?.toLowerCase().includes(
                                      inputValue.toLowerCase()
                                    )
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Search for categories..."
                                  variant="outlined"
                                  size="small"
                                  onChange={(e) => {
                                    fetchCatagories(e.target.value);
                                  }}
                                  fullWidth
                                />
                              )}
                            />
                          </td>
                          <td>
                            <textarea
                              size="small"
                              rows="2"
                              style={{ height: "fit-content" }}
                              type="text"
                              value={catagoryInput.Description}
                              className="form-control form-control-sm"
                              // onChange={(e) =>
                              //   setCatagoryInput({
                              //     ...catagoryInput,
                              //     Description: e.target.value,
                              //   })
                              // }
                              placeholder="Description"
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm number-input"
                              value={catagoryInput.Amount}
                              // onChange={(e) =>
                              //   setCatagoryInput({
                              //     ...catagoryInput,
                              //     Amount: Number(e.target.value),
                              //   })
                              // }
                              placeholder="Amount"
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
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
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount $</th>

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
                                style={{ height: "fit-content" }}
                                className="form-control form-control-sm"
                                value={item.Description}
                                onChange={(e) =>
                                  handleItemDescriptionChange(index, e)
                                }
                              />
                            </td>
                            <td>
                              <input
                                className="form-control form-control-sm number-input"
                                value={item.Qty}
                                ref={
                                  index === itemsList.length - 1
                                    ? quantityInputRef
                                    : null
                                }
                                onChange={(e) => handleQuantityChange(index, e)}
                              />
                            </td>
                            <td>
                              <input
                                value={item.Rate}
                                className="form-control form-control-sm number-input"
                                onChange={(e) => handleRateChange(index, e)}
                              />
                            </td>
                            <td className="text-right pe-2">
                              {formatAmount(item.Rate * item.Qty)}
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
                                  // // onClick={() => handleItemClick(item)}
                                >
                                  <div className="customer-dd-border">
                                    <p>
                                      <strong>{item.ItemName}</strong>{" "}
                                    </p>
                                    <small>{item.Type}</small>
                                    <br />
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
                            value={itemInput?.Description}
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
                            value={
                              selectedItem?.SalePrice || itemInput.Rate || ""
                            }
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
                            {(itemInput.Rate * itemInput.Qty).toFixed(2)}
                          </h5>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card-body row">
              <div className="col-md-4">
                <div className="row">
                  <div className="col-xl-12 col-lg-12">
                    <div className="basic-form">
                      <label className="form-label">Memo</label>

                      <div className="mb-3">
                        <TextArea
                          name="Memo"
                          value={formData.Memo}
                          onChange={handleChange}
                        ></TextArea>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-12 col-lg-12">
                    <FileUploadButton onClick={handleFileChange}>
                      Upload File
                    </FileUploadButton>
                  </div>
                </div>
              </div>

              <div className="col-md-4  ms-auto sub-total">
                <table className="table table-borderless table-clear">
                  <tbody>
                    <tr>
                      <td className="left">
                        <strong>Items Subtotal</strong>
                      </td>
                      <td className="right">${formatAmount(totalAmount)}</td>
                    </tr>
                    <tr>
                      <td className="left">
                        <strong>Categories Total</strong>
                      </td>
                      <td className="right">
                        ${formatAmount(totalCatagoryAmount)}
                      </td>
                    </tr>

                    <tr>
                      <td className="left">
                        <strong>Total</strong>
                      </td>
                      <td className="right">
                        <strong>
                          ${formatAmount(totalAmount + totalCatagoryAmount)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="row mx-2">
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
                    <img
                      src={`${baseUrl}/${file.FilePath}`}
                      alt={file.FileName}
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
                      whiteSpace: "nowrap",
                      width: "100%",
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
                      deleteBillFile(file.BillFileId, getBill);
                    }}
                  >
                    <span>
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
                      whiteSpace: "nowrap",
                      width: "100%",
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

            <div className="row mb-3 ">
              <div className="col-md-6">
                <div className="ms-3">
                  <BackButton
                    onClick={() => {
                      navigate(`/bills`);
                      // window.history.back()
                    }}
                  >
                    Back
                  </BackButton>
                </div>
                {/* {addCustomerSuccess && (
                <Alert severity="success">
                  {addCustomerSuccess
                    ? addCustomerSuccess
                    : "Susseccfully added/Updated customer"}
                </Alert>
              )}
              {errorMessage && (
                <Alert severity="error">
                  {errorMessage ? errorMessage : "Error Submitting Bill Data"}
                </Alert>
              )}
              {emptyFieldsError && (
                <Alert severity="error">please fill all required fields</Alert>
              )} */}
              </div>
              <div className=" col-md-6 text-end">
                {!formData.isDelete && (
                  <div>
                    {idParam ? (
                      <>
                        {canDelete ? (
                          <HandleDelete
                            id={idParam}
                            endPoint={"Bill/DeleteBill?id="}
                            to="/bills"
                            syncQB={syncQB}
                          />
                        ) : (
                          <Tooltip title="You don't have access" arrow>
                            <span>
                              <Button
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
                              </Button>
                            </span>
                          </Tooltip>
                        )}
                        <PrintButton
                          varient="mail"
                          onClick={() => {
                            navigate(
                              `/send-mail?title=${"Bill"}&mail=${""}&customer=${
                                formData.SupplierCompanyName
                              }&number=${formData.BillNumber}`
                            );
                            setselectedPdf([]);
                          }}
                        ></PrintButton>
                        <PrintButton
                          varient="print"
                          onClick={() => {
                            navigate(`/bills/bill-preview?id=${idParam}`);
                          }}
                        ></PrintButton>
                        <PDFDownloadLink
                          document={
                            <BillPdf
                              data={{
                                ...billPreviewData,
                                Total: totalAmount,
                                companyInfo: companyInfo,
                                  dynamicColorAndLogo: dynamicColorAndLogo,
                              }}
                            />
                          }
                          fileName="Bill.pdf"
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
                        disable={btnDisable}
                        loading={disableButton}
                        handleSubmit={handleSubmit}
                      >
                        Save
                      </LoaderButton>
                    ) : (
                      <Tooltip 
                        title={isEditMode ? "You don't have permission to update this record." : "You don't have permission to create bills"} 
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
                  onClick={handleSubmit}
                >
                  Save
                </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddBill;
