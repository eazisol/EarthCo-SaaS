import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { Print, Email, Download } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Cookies from "js-cookie";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import { Delete, Create } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { Button } from "@mui/material";
import formatDate from "../../custom/FormatDate";
import useFetchInvoices from "../Hooks/useFetchInvoices";
import useFetchBills from "../Hooks/useFetchBills";
import useFetchPo from "../Hooks/useFetchPo";
import useCustomerSearch from "../Hooks/useCustomerSearch";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import { useNavigate } from "react-router-dom";
import { useEstimateContext } from "../../context/EstimateContext";
import useDeleteFile from "../Hooks/useDeleteFile";
import { DataContext } from "../../context/AppData";
import { RoutingContext } from "../../context/RoutesContext";
import { baseUrl } from "../../apiConfig";

const UpdateEstimateForm = ({
  headers,
  setShowContent,
  estimateId,
  setShowStatusCards,
  setSubmitsuccess,
  setUpdateSuccess,
  getEstimate,
  getFilteredEstimate,
}) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    EstimateNumber: "",
    IssueDate: formatDate(currentDate),
    EstimateNotes: "",
    ServiceLocationNotes: "",

    EstimateStatusId: 1,
    tblEstimateItems: [],
  });

  const { setestmPreviewId } = useContext(RoutingContext);
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const isEstimateUpdateRoute =
    window.location.pathname.includes("Update-Estimate");

  const { PunchListData, setPunchListData } = useContext(DataContext);

  useEffect(() => {
    if (PunchListData.ItemData) {
      fetchName(PunchListData.CustomerId);

      setFormData((prevState) => ({
        ...prevState,
        ...PunchListData,
        tblEstimateItems: PunchListData.ItemData,
      }));
    }
    fetchStaffList();
    fetctContacts(PunchListData.CustomerId);
    console.log("PunchList Data link", PunchListData);
  }, [PunchListData]);

  const inputFile = useRef(null);
  const [Files, setFiles] = useState([]);

  const [sLList, setSLList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [tags, setTags] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSL, setSelectedSL] = useState(null);

  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);
  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = Cookies.get("token");

  const { invoiceList, fetchInvoices } = useFetchInvoices();
  const { billList, fetchBills } = useFetchBills();
  const { PoList, fetchPo } = useFetchPo();

  const [totalItemAmount, setTotalItemAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);

  const { customerSearch, fetchCustomers } = useCustomerSearch();
  const { deleteEstmFile } = useDeleteFile();

  const { name, setName, fetchName } = useFetchCustomerName();

  const [estimateFiles, setEstimateFiles] = useState([]);

  const { setEstimateLinkData } = useEstimateContext();

  const [PrevFiles, setPrevFiles] = useState([]);

  const fetchEstimates = async () => {
    if (estimateId === 0 && idParam === 0) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimate?id=${
          estimateId || idParam
        }`,
        { headers }
      );

      console.log("selected estimate is", response.data);
      setPrevFiles(response.data.EstimateFileData);
      fetchName(response.data.EstimateItemData.CustomerId);

      // Combine EstimateItemData and EstimateCostItemData into tblEstimateItems
      const combinedItems = [
        ...response.data.EstimateItemData,
        ...response.data.EstimateCostItemData,
      ];

      setFormData((prevState) => ({
        ...prevState,
        ...response.data.EstimateData,
        tblEstimateItems: combinedItems,
      }));

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
    axios
      .get(
        `${baseUrl}/api/Customer/GetCustomerServiceLocation?id=${id}`,
        { headers }
      )
      .then((res) => {
        setSLList(res.data);
        console.log("service locations are", res.data);
      })
      .catch((error) => {
        setSLList([]);
        console.log("service locations fetch error", error);
      });
  };

  const fetctContacts = async (id) => {
    if(!id){return}
    axios
      .get(
        `${baseUrl}/api/Customer/GetCustomerContact?id=${id}`,
        { headers }
      )
      .then((res) => {
        console.log("contacts data isss", res.data);
        setContactList(res.data);
      })
      .catch((error) => {
        setContactList([]);
        console.log("contacts data fetch error", error);
      });
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

  const [disableSubmit, setDisableSubmit] = useState(true);
  const [staffData, setStaffData] = useState([]);

  const handleSLAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "ServiceLocationId",
        value: newValue ? newValue.ServiceLocationId : "",
      },
    };

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

  const handleInvoiceAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "InvoiceId",
        value: newValue ? newValue.InvoiceId : "",
      },
    };

    handleInputChange(simulatedEvent);
  };
  const handleBillAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "BillId",
        value: newValue ? newValue.BillId : "",
      },
    };

    handleInputChange(simulatedEvent);
  };

  const handlePoAutocompleteChange = (event, newValue) => {
    const simulatedEvent = {
      target: {
        name: "PurchaseOrderId",
        value: newValue ? newValue.PurchaseOrderId : "",
      },
    };

    handleInputChange(simulatedEvent);
  };

  const handleTagAutocompleteChange = (event, newValues) => {
    const tagString = newValues.map((tag) => tag.Tag).join(", ");

    setFormData((prevData) => ({
      ...prevData,
      Tags: tagString,
      ProfitPercentage: 0,
    }));
  };
  const fetchStaffList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Staff/GetStaffList`,
        { headers }
      );
      setStaffData(response.data);

      console.log("staff list iss", response.data);
    } catch (error) {
      console.log("error getting staff list", error);
    }
  };
  const handleStaffAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "AssignTo",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleCustomerAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "CustomerId",
        value: newValue ? newValue.UserId : "",
      },
    };
    handleInputChange(simulatedEvent);
  };

  const handleClearSelection = () => {
    setSelectedCustomer(null);
  };

  const handleRBAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "RequestedBy",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleRMAutocompleteChange = (event, newValue) => {
    // Construct an event-like object with the structure expected by handleInputChange
    const simulatedEvent = {
      target: {
        name: "RegionalManagerId",
        value: newValue ? newValue.UserId : "",
      },
    };

    // Assuming handleInputChange is defined somewhere within YourComponent
    // Call handleInputChange with the simulated event
    handleInputChange(simulatedEvent);
  };

  const handleInputChange = (e, newValue) => {
    setEmptyFieldsError(false);
    const { name, value } = e.target;

    setSelectedCustomer(newValue);
    setSelectedSL(newValue);

    // Convert to number if the field is CustomerId, Qty, Rate, or EstimateStatusId
    const adjustedValue = [
      "UserId",
      "ServiceLocationId",
      "ContactId",
      "Qty",
      "Rate",
      "EstimateStatusId",
      "RequestedBy",
    ].includes(name)
      ? Number(value)
      : value;

    setFormData((prevData) => ({ ...prevData, [name]: adjustedValue }));

    // if (name === "UserId" && value != 0) {
    //   console.log(value);
    //   fetchServiceLocations(value);
    //   fetctContacts(value);
    // }
    // console.log("opopopopopop", formData);
  };

  const LinkToPO = () => {
    setEstimateLinkData((prevState) => ({
      ...prevState,
      ...formData,
    }));
  };

  const handleSubmit = (e) => {
    setSubmitClicked(true);
    e.preventDefault();
    if (
      !formData.IssueDate ||
      !formData.CustomerId ||
      !formData.ServiceLocationId ||
      !formData.ContactId ||
      !formData.RequestedBy ||
      !formData.RegionalManagerId ||
      !formData.RequestedBy ||
      !formData.AssignTo ||
      !formData.EstimateStatusId
    ) {
      setEmptyFieldsError(true);
      console.log("Required fields are empty");
      return;
    }
    const postData = new FormData();

    // Merge the current items with the new items for EstimateData
    const mergedEstimateData = {
      ...formData,
      EstimateId: estimateId || idParam,
      TotalAmount: totalItemAmount || 0,
      ProfitPercentage: profitPercentage || 0,
      Shipping: shippingCost || 0,
      // CreatedBy: 2,
      // EditBy: 2,
      // isActive: true,
    };

    console.log("mergedEstimateData:", mergedEstimateData);
    // console.log("data:", data);

    postData.append("EstimateData", JSON.stringify(mergedEstimateData));
    console.log(JSON.stringify(mergedEstimateData));
    // Appending files to postData
    Files.forEach((fileObj) => {
      postData.append("Files", fileObj);
    });
    estimateFiles.forEach((fileObj) => {
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
        `${baseUrl}/api/Estimate/AddEstimate`,
        postData,
        {
          headers,
        }
      );
      if (isEstimateUpdateRoute) {
        navigate(`/estimates`);
        return;
      }

      getFilteredEstimate();
      setShowContent(true);
      setShowStatusCards(true);
      formData.CustomerId === 0
        ? setSubmitsuccess(true)
        : setUpdateSuccess(true);
      setTimeout(() => {
        setSubmitsuccess(false);
        setUpdateSuccess(false);
      }, 4000);

      console.log("Data submitted successfully:", response.data);
    } catch (error) {
      console.error("API Call Error:", error);
      setErrorMessage(error.response.data);
      setSubmitError(true);
    }

    // Logging FormData contents (for debugging purposes)
    for (let [key, value] of postData.entries()) {
      console.log("fpayload....", key, value);
    }
    // window.location.reload();

    // console.log("post data izzz",postData);
  };

  useEffect(() => {
    fetchEstimates();
    fetchStaffList();
    fetchTags();
    fetchInvoices();
    fetchBills();
    fetchPo();
    fetchCustomers();

    if (!isEstimateUpdateRoute) {
      setShowStatusCards(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceLocations(formData.CustomerId);
    fetctContacts(formData.CustomerId);
    fetchName(formData.CustomerId);
    console.log("selected customer name iss......", name);
    console.log("main payload isss", formData);
  }, [formData.CustomerId]);

  const handleStatusChange = (e) => {
    const value = parseInt(e.target.value, 10); // This converts the string to an integer

    setFormData((prevData) => ({
      ...prevData,
      EstimateStatusId: value,
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItem, setShowItem] = useState(true);
  const [itemBtnDisable, setItemBtnDisable] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    // Make an API request when the search text changes

    axios
      .get(
        `${baseUrl}/api/Item/GetSearchItemList?Search=${searchText}`,
        { headers }
      )
      .then((response) => {
        setSearchResults(response.data);
        console.log("item list is", response.data);
      })
      .catch((error) => {
        console.error("Error fetching itemss data:", error);
      });
  }, [searchText]);

  const deleteItem = (itemId) => {
    const updatedArr = formData.tblEstimateItems.filter(
      (item) => item.ItemId !== itemId
    );

    console.log("Item to delete:", itemId);
    console.log("Updated Array:", updatedArr);

    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: updatedArr,
    }));
  };

  const handleItemChange = (event) => {
    setShowItem(true);
    setSearchText(event.target.value);

    setSelectedItem(null); // Clear selected item when input changes
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSearchText(item.ItemName); // Set the input text to the selected item's name
    setItemInput({
      ...itemInput,
      ItemId: item.ItemId,
      Name: item.ItemName,
      Description: item.SaleDescription,
      Rate: item.SalePrice,

      isCost: false,
    });
    itemInput ? setItemBtnDisable(false) : setItemBtnDisable(true);

    setShowItem(false);
    setSearchResults([]); // Clear the search results

    console.log("selected item is", itemInput);
  };

  const handleAddItem = () => {
    const newAmount = itemInput.Qty * itemInput.Rate;
    const newItem = {
      ...itemInput,
      Amount: newAmount,
    };

    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: [...prevData.tblEstimateItems, newItem],
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
    console.log("new items are", formData);
  };

  const handleQuantityChange = (itemId, event) => {
    const updatedItems = formData.tblEstimateItems.map((item) => {
      if (item.ItemId === itemId) {
        const updatedItem = { ...item };
        updatedItem.Qty = parseInt(event.target.value, 10);
        updatedItem.Amount = updatedItem.Qty * updatedItem.Rate;
        return updatedItem;
      }
      return item;
    });

    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: updatedItems,
    }));
  };

  const handleRateChange = (itemId, event) => {
    const updatedItems = formData.tblEstimateItems.map((item) => {
      if (item.ItemId === itemId) {
        const updatedItem = { ...item };
        updatedItem.Rate = parseFloat(event.target.value);
        updatedItem.Amount = updatedItem.Qty * updatedItem.Rate;
        return updatedItem;
      }
      return item;
    });

    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: updatedItems,
    }));
  };

  useEffect(() => {
    console.log(" testing....", formData);
  }, [formData]);

  // AC

  const [aCInput, setACInput] = useState({
    Name: "",
    Qty: 1,
    Description: "",
    Rate: null,
  });
  const [searchACText, setSearchACText] = useState("");
  const [searchACResults, setSearchACResults] = useState([]);
  const [selectedACItem, setSelectedACItem] = useState(null);
  const [showACItem, setShowACItem] = useState(true);
  const [itemACBtnDisable, setItemACBtnDisable] = useState(true);
  const inputACRef = useRef(null);

  useEffect(() => {
    if (searchACText) {
      // Make an API request when the search text changes

      axios
        .get(
          `${baseUrl}/api/Item/GetSearchItemList?Search=${searchACText}`,
          { headers }
        )
        .then((response) => {
          setSearchACResults(response.data);
        })
        .catch((error) => {
          console.error("Error fetching itemss data:", error);
        });
    } else {
      setSearchACResults([]); // Clear the search results when input is empty
    }
  }, [searchACText]);

  const handleACItemChange = (event) => {
    setShowACItem(true);
    setSearchACText(event.target.value);

    setSelectedACItem(null); // Clear selected item when input changes
  };
  const handleACAddItem = () => {
    // setTblSRItems([...tblSRItems, itemInput]);
    setFormData((prevData) => ({
      ...prevData,
      tblEstimateItems: [...prevData.tblEstimateItems, aCInput],
    }));
    setSearchACText("");
    setSelectedACItem({
      SalePrice: "",
      SaleDescription: "",
    });
    setACInput({
      Name: "",
      Qty: 1,
      Description: "",
      Rate: 0,
    }); // Reset the modal input field
    console.log("new items aree", formData);
  };
  const handleACItemClick = (item) => {
    setSelectedACItem(item);
    setSearchACText(item.ItemName); // Set the input text to the selected item's name
    setACInput({
      ...aCInput,
      ItemId: item.ItemId,
      Name: item.ItemName,
      Description: item.SaleDescription,
      Rate: item.PurchasePrice,
      isCost: true,
    });
    aCInput ? setItemACBtnDisable(false) : setItemACBtnDisable(true);

    setShowACItem(false);
    setSearchACResults([]); // Clear the search results
    console.log("selected item is", item);
  };

  // calculations

  const [subtotal, setSubtotal] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalACAmount, setTotalACAmount] = useState(0);

  useEffect(() => {
    const filteredACItems = formData.tblEstimateItems?.filter(
      (item) => item.isCost === true
    );

    const newACTotalAmount = filteredACItems?.reduce(
      (acc, item) => acc + item.Rate * item.Qty,
      0
    );
    const filteredItems = formData.tblEstimateItems?.filter(
      (item) => item.isCost === false
    );

    const newTotalAmount = filteredItems?.reduce(
      (acc, item) => acc + item.Rate * item.Qty,
      0
    );

    setSubtotal(newTotalAmount);
    setTotalACAmount(newACTotalAmount);
    const calculatedTotalProfit = newTotalAmount - newACTotalAmount;
    setTotalProfit(calculatedTotalProfit);
    setTotalItemAmount(newTotalAmount + shippingCost);
    const calculatedProfitPercentage =
      (calculatedTotalProfit / newACTotalAmount) * 100;
    setProfitPercentage(calculatedProfitPercentage);
    // console.log("amounts are", calculatedProfitPercentage, shippingCost, calculatedTotalProfit, totalACAmount, totalItemAmount, subtotal);
  }, [formData.tblEstimateItems]);

  // filesss........

  const handleDeleteFile = (index) => {
    // Create a copy of the Files array without the file to be deleted
    const updatedFiles = [...Files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
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

  const trackFile = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      // const newFile = {
      // actualFile: uploadedFile,
      // name: uploadedFile.name,
      // caption: uploadedFile.name,
      // date: new Date().toLocaleDateString(),
      // };
      setFiles((prevFiles) => [...prevFiles, uploadedFile]);
    }
  };

  useEffect(() => {
    formData.CustomerId &&
    formData.ServiceLocationId &&
    formData.ContactId &&
    formData.EstimateNumber
      ? setDisableSubmit(false)
      : setDisableSubmit(true);
  }, [formData]);

  return (
    <>
      <div className="card row mx-4">
        <div className="itemtitleBar ">
          <h4>Estimate Details</h4>
        </div>

        <>
          {loading ? (
            <div className="center-loader">
              <CircularProgress />
            </div>
          ) : (
            <>
              <div className="card-body">
                <div className="row mt-2">
                  <div className="col-md-3">
                    <label className="form-label">
                      Customers <span className="text-danger">*</span>
                    </label>
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={customerSearch}
                      getOptionLabel={(option) => option.CompanyName || ""}
                      value={name ? { CompanyName: name } : null}
                      onChange={handleCustomerAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === value.CustomerId
                      }
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div className="customer-dd-border">
                            <h6> {option.CompanyName}</h6>
                            <small># {option.UserId}</small>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
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
                    />
                  </div>
                  <div className="col-md-3 ">
                    <label className="form-label">Estimate No.</label>
                    <TextField
                      value={formData.EstimateNumber}
                      name="EstimateNumber"
                      onChange={handleInputChange}
                      type="text"
                      variant="outlined"
                      placeholder="Estimate No"
                      size="small"
                      fullWidth
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Tags</label>
                    <Autocomplete
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
                    />
                  </div>
                  <div className=" col-md-3">
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
                </div>
                <div className="row mt-2 mb-3">
                  <div className="col-md-3 ">
                    <label className="form-label">
                      Service location <span className="text-danger">*</span>
                    </label>
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
                          error={submitClicked && !formData.ServiceLocationId}
                          className="bg-white"
                        />
                      )}
                      aria-label="Default select example"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      Assigned To<span className="text-danger">*</span>
                    </label>
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={staffData}
                      getOptionLabel={(option) => option.FirstName || ""}
                      value={
                        staffData.find(
                          (staff) => staff.UserId === formData.AssignTo
                        ) || null
                      }
                      onChange={handleStaffAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === value.AssignTo
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={submitClicked && !formData.AssignTo}
                          placeholder="Choose..."
                          className="bg-white"
                        />
                      )}
                    />
                  </div>
                  <div className="col-md-3 ">
                    <label className="form-label">
                      Regional Manager<span className="text-danger">*</span>
                    </label>
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={staffData}
                      getOptionLabel={(option) => option.FirstName || ""}
                      value={
                        staffData.find(
                          (staff) => staff.UserId === formData.RegionalManagerId
                        ) || null
                      }
                      onChange={handleRMAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === value.RegionalManagerId
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={submitClicked && !formData.RegionalManagerId}
                          placeholder="Choose..."
                          className="bg-white"
                        />
                      )}
                    />
                  </div>
                  <div className="col-md-3 ">
                    <label className="form-label">
                      Linked Invoice
                      {formData.InvoiceId ? (
                        <>
                          <br />
                          <a
                            href=""
                            style={{ color: "blue" }}
                            onClick={() => {
                              navigate(
                                `/invoices/add-invoices?id=${formData.InvoiceId}`
                              );
                            }}
                          >
                            Go to Invoice
                          </a>
                        </>
                      ) : (
                        ""
                      )}
                    </label>
                    <Autocomplete
                      size="small"
                      options={invoiceList}
                      getOptionLabel={(option) => option.InvoiceNumber || ""}
                      value={
                        invoiceList.find(
                          (invoice) => invoice.InvoiceId === formData.InvoiceId
                        ) || null
                      }
                      onChange={handleInvoiceAutocompleteChange}
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
                  </div>
                  <div className="col-md-3 mt-2">
                    <label className="form-label">
                      Contact<span className="text-danger">*</span>
                    </label>
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
                          error={submitClicked && !formData.ContactId}
                          className="bg-white"
                        />
                      )}
                      aria-label="Contact select"
                    />
                  </div>
                  <div className="col-md-3 mt-2">
                    <label className="form-label">
                      Status<span className="text-danger">*</span>
                    </label>
                    <Select
                      aria-label="Default select example"
                      variant="outlined"
                      value={formData.EstimateStatusId || 1}
                      onChange={handleStatusChange}
                      name="Status"
                      size="small"
                      error={submitClicked && !formData.EstimateStatusId}
                      placeholder="Select Status"
                      fullWidth
                    >
                      <MenuItem value={1}>Accepted</MenuItem>
                      <MenuItem value={2}>Closed</MenuItem>
                      <MenuItem value={3}>Converted</MenuItem>
                      <MenuItem value={4}>Pending</MenuItem>
                      <MenuItem value={5}>Rejected</MenuItem>
                    </Select>
                  </div>
                  <div className="col-md-3 mt-2">
                    <label className="form-label">
                      Requested by <span className="text-danger">*</span>
                    </label>
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={staffData}
                      getOptionLabel={(option) => option.FirstName || ""}
                      value={
                        staffData.find(
                          (staff) => staff.UserId === formData.RequestedBy
                        ) || null
                      }
                      onChange={handleRBAutocompleteChange}
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === value.RequestedBy
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          error={submitClicked && !formData.RequestedBy}
                          placeholder="Choose..."
                          className="bg-white"
                        />
                      )}
                    />
                  </div>
                  <div className="col-md-3 mt-2 ">
                    <label className="form-label">
                      Linked Bill
                      {formData.BillId ? (
                        <>
                          <br />
                          <a
                            href=""
                            style={{ color: "blue" }}
                            onClick={() => {
                              navigate(`/bills/add-bill?id=${formData.BillId}`);
                            }}
                          >
                            Go to Bill
                          </a>
                        </>
                      ) : (
                        ""
                      )}
                    </label>
                    <Autocomplete
                      size="small"
                      options={billList}
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
                  </div>
                  <div className="col-md-3 mt-2 ">
                    <label className="form-label">
                      Linked To purchase order
                      {formData.PurchaseOrderId ? (
                        <>
                          <br />
                          <a
                            href=""
                            style={{ color: "blue" }}
                            onClick={() => {
                              navigate(
                                `/purchase-order/add-po?id=${formData.PurchaseOrderId}`
                              );
                            }}
                          >
                            Go to Purchase order
                          </a>
                        </>
                      ) : (
                        ""
                      )}
                    </label>
                    <Autocomplete
                      size="small"
                      options={PoList}
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
                  </div>
                </div>
              </div>
              {/* item table */}
              <div className="itemtitleBar">
                <h4>Items</h4>
              </div>
              <div className="card-body">
                <div className="estDataBox">
                  <div className="table-responsive active-projects style-1 mt-2">
                    <table id="empoloyees-tblwrapper" className="table">
                      <thead>
                        <tr>
                          <th className="itemName-width">Item</th>
                          <th>Description</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount $</th>
                          <th>Tax</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.tblEstimateItems &&
                        formData.tblEstimateItems.length > 0 ? (
                          formData.tblEstimateItems
                            .filter((item) => item.isCost === false) // Filter items with isCost equal to 1
                            .map((item, index) => (
                              <tr colSpan={2} key={item.ItemId}>
                                <td className="itemName-width">{item.Name}</td>
                                <td>{item.Description}</td>
                                <td>
                                  <input
                                    type="number"
                                    style={{ width: "7em" }}
                                    className="form-control form-control-sm number-input"
                                    value={item.Qty}
                                    onChange={(e) =>
                                      handleQuantityChange(item.ItemId, e)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    style={{ width: "7em" }}
                                    className="form-control form-control-sm number-input"
                                    value={item.Rate}
                                    onChange={(e) =>
                                      handleRateChange(item.ItemId, e)
                                    }
                                  />
                                </td>
                                <td>
                                  {item ? (item.Qty * item.Rate).toFixed(2) : 0}
                                </td>
                                <td>NaN</td>
                                <td>
                                  <div className="badgeBox">
                                    <Button
                                      onClick={() => {
                                        deleteItem(item.ItemId);
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
                          <td className="itemName-width">
                            <>
                              <Autocomplete
                                id="search-items"
                                options={searchResults}
                                getOptionLabel={(item) => item.ItemName}
                                value={selectedItem} // This should be the selected item, not searchText
                                onChange={(event, newValue) => {
                                  if (newValue) {
                                    handleItemClick(newValue);
                                  } else {
                                    setSelectedItem(null);
                                  }
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Search for items..."
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onChange={handleItemChange}
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
                            <p>{selectedItem?.SaleDescription || " "}</p>
                          </td>
                          <td>
                            <input
                              type="number"
                              name="Qty"
                              value={itemInput.Qty}
                              onChange={(e) =>
                                setItemInput({
                                  ...itemInput,
                                  Qty: Number(e.target.value),
                                })
                              }
                              style={{ width: "7em" }}
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
                            <div className="col-sm-9">
                              <input
                                type="number"
                                name="Rate"
                                style={{ width: "7em" }}
                                className="form-control form-control-sm number-input"
                                value={
                                  selectedItem?.SalePrice ||
                                  itemInput.Rate ||
                                  ""
                                }
                                onChange={(e) =>
                                  setItemInput({
                                    ...itemInput,
                                    Rate: Number(e.target.value),
                                  })
                                }
                                onClick={(e) => {
                                  setSelectedItem({
                                    ...selectedItem,
                                    SalePrice: 0,
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
                            </div>
                          </td>
                          <td>
                            <h5 style={{ margin: "0" }}>
                              {itemInput
                                ? (itemInput.Rate * itemInput.Qty).toFixed(2)
                                : 0}
                            </h5>
                          </td>
                          <td>
                            <input
                              type="number"
                              name="tax"
                              style={{ width: "7em" }}
                              disabled
                              className="form-control form-control-sm number-input"
                              placeholder="tax"
                            />
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="itemtitleBar">
                <h4>Additional Costs</h4>
              </div>
              <div className="card-body">
                <div className="estDataBox">
                  <div className="table-responsive active-projects style-1 mt-2">
                    <table id="empoloyees-tblwrapper mx-2" className="table">
                      <thead>
                        <tr>
                          <th className="itemName-width">Item</th>
                          <th>Description</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount $</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.tblEstimateItems &&
                        formData.tblEstimateItems.length > 0 ? (
                          formData.tblEstimateItems
                            .filter((item) => item.isCost === true) // Filter items with isCost equal to 1
                            .map((item, index) => (
                              <tr className="itemName-width" key={item.ItemId}>
                                <td>{item.Name}</td>
                                <td>{item.Description}</td>
                                <td>
                                  <input
                                    type="number"
                                    style={{ width: "7em" }}
                                    className="form-control form-control-sm number-input"
                                    value={item.Qty}
                                    onChange={(e) =>
                                      handleQuantityChange(item.ItemId, e)
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    style={{ width: "7em" }}
                                    className="form-control form-control-sm number-input"
                                    value={item.Rate}
                                    onChange={(e) =>
                                      handleRateChange(item.ItemId, e)
                                    }
                                  />
                                </td>
                                <td>
                                  {item ? (item.Qty * item.Rate).toFixed(2) : 0}
                                </td>
                                <td>
                                  <div className="badgeBox">
                                    <Button
                                      onClick={() => {
                                        deleteItem(item.ItemId);
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
                          <td className="itemName-width">
                            <>
                              <Autocomplete
                                id="search-ac-items"
                                options={searchACResults}
                                getOptionLabel={(item) => item.ItemName}
                                value={selectedACItem}
                                onChange={(event, newValue) => {
                                  if (newValue) {
                                    handleACItemClick(newValue);
                                  } else {
                                    setSelectedACItem(null);
                                  }
                                }}
                                inputValue={searchACText}
                                onInputChange={(event, newInputValue) => {
                                  setShowACItem(true);
                                  setSearchACText(newInputValue);
                                  setSelectedACItem(null); // Clear selected item when input changes
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Search for items..."
                                    variant="outlined"
                                    size="small"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        // Handle item addition when Enter key is pressed
                                        e.preventDefault(); // Prevent form submission
                                        handleACAddItem();
                                      }
                                    }}
                                    fullWidth
                                  />
                                )}
                                renderOption={(props, item) => (
                                  <li
                                    style={{ cursor: "pointer" }}
                                    {...props}
                                    onClick={() => handleACItemClick(item)}
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
                              />
                            </>
                          </td>
                          <td>
                            <p>{selectedACItem?.SaleDescription || " "}</p>
                          </td>
                          <td>
                            <input
                              type="number"
                              name="Qty"
                              value={aCInput.Qty}
                              onChange={(e) =>
                                setACInput({
                                  ...aCInput,
                                  Qty: Number(e.target.value),
                                })
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  // Handle item addition when Enter key is pressed
                                  e.preventDefault(); // Prevent form submission
                                  handleACAddItem();
                                }
                              }}
                              style={{ width: "7em" }}
                              className="form-control form-control-sm"
                              placeholder="Quantity"
                            />
                          </td>
                          <td>
                            <div className="col-sm-9">
                              <input
                                type="number"
                                name="Rate"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    // Handle item addition when Enter key is pressed
                                    e.preventDefault(); // Prevent form submission
                                    handleACAddItem();
                                  }
                                }}
                                onChange={(e) =>
                                  setACInput({
                                    ...aCInput,
                                    Rate: Number(e.target.value),
                                  })
                                }
                                onClick={(e) => {
                                  setSelectedACItem({
                                    ...selectedACItem,
                                    PurchasePrice: 0,
                                  });
                                }}
                                style={{ width: "7em" }}
                                className="form-control form-control-sm"
                                value={
                                  selectedACItem?.PurchasePrice ||
                                  aCInput.Rate ||
                                  ""
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <h5 style={{ margin: "0" }}>
                              {aCInput
                                ? (aCInput.Rate * aCInput.Qty).toFixed(2)
                                : 0}
                            </h5>
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Files */}

              <div className="row card-body">
                <div className="col-md-5">
                  <div className="row">
                    <div className="col-md-12 col-lg-12">
                      <div className="basic-form">
                        <form>
                          {/* <h4 className="card-title">Estimate Notes</h4> */}
                          <label className="form-label">Estimate Notes</label>
                          <div className="mb-3">
                            <textarea
                              placeholder=" EstimateNotes"
                              value={formData.EstimateNotes}
                              name="EstimateNotes"
                              onChange={handleInputChange}
                              className="form-txtarea form-control form-control-sm"
                              rows="6"
                            ></textarea>
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
                            <textarea
                              placeholder="Service Location Notes"
                              value={formData.ServiceLocationNotes}
                              name="ServiceLocationNotes"
                              onChange={handleInputChange}
                              className="form-txtarea form-control form-control-sm"
                              rows="6"
                            ></textarea>
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="col-md-12 col-lg-12">
                      <div className="basic-form">
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
                                onChange={trackFile}
                              />
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/*<div className="col-md-12 col-lg-12">
                        <div className="basic-form">
                          <form>
                             <h4 className="card-title">Private Notes</h4>
                            <label className="form-label">Private Notes</label>
                            <div className="mb-3">
                              <textarea
                                placeholder= "PrivateNotes"
                                value={formData.PrivateNotes}
                                name="PrivateNotes"
                                onChange={handleInputChange}
                                className="form-txtarea form-control form-control-sm"
                                rows="2"
                              ></textarea>
                            </div>
                          </form>
                        </div>
                      </div> */}
                  </div>
                </div>
                <div className="col-md-4 ms-auto sub-total">
                  <table className="table table-clear table-borderless custom-table custom-table-row">
                    <tbody>
                      <tr>
                        <td className="left">
                          <strong>Subtotal</strong>
                        </td>
                        <td className="right text-right">
                          ${subtotal?.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="left custom-table-row">
                          <label className="form-label">Taxes</label>
                          <div
                            style={{ width: "10em" }}
                            className="input-group"
                          >
                            <input
                              style={{ width: "10em" }}
                              type="text"
                              className="form-control form-control-sm "
                              name="Taxes"
                              placeholder="Taxes"
                            />
                          </div>
                        </td>
                        <td className="right text-right">$0.00</td>
                      </tr>
                      {/* <tr>
                            <td className="left custom-table-row">
                              <label className="form-label">Discount(%)</label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  name="Discount"
                                  placeholder="Discount"
                                />
                              </div>
                            </td>
                            <td className="right text-right">$00</td>
                          </tr> */}
                      <tr>
                        <td className="left custom-table-row">
                          <label className="form-label">Shipping</label>
                          <div
                            style={{ width: "10em" }}
                            className="input-group"
                          >
                            <input
                              type="number"
                              value={shippingCost}
                              className="form-control form-control-sm"
                              onChange={(e) => {
                                setShippingCost(parseFloat(e.target.value));
                                setTotalItemAmount(shippingCost + subtotal);
                              }}
                              name="Shipping"
                              placeholder="Shipping"
                            />
                          </div>
                        </td>
                        <td className="right text-right">
                          ${shippingCost || 0.0}
                        </td>
                      </tr>

                      <tr>
                        <td className="left">
                          <strong>Total</strong>
                        </td>
                        <td className="right text-right">
                          <strong>${totalItemAmount?.toFixed(2)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="left">Payment/Credit</td>
                        <td className="right text-right">$0.00</td>
                      </tr>
                      <tr>
                        <td className="left">
                          <h3>Balance due</h3>
                        </td>
                        <td className="right text-right">
                          <h3>$0.00</h3>
                        </td>
                      </tr>
                      <tr>
                        <td className="left">Total Expenses</td>
                        <td className="right text-right">$0.00</td>
                      </tr>
                      <tr>
                        <td className="left">Total Profit(%)</td>
                        <td className="right text-right">
                          {profitPercentage?.toFixed(2) || 0}%
                        </td>
                      </tr>
                      <tr>
                        <td className="left">Profit Margin(%)</td>
                        <td className="right text-right">$0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <div className="card-body row">
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
                        <img
                          src={`${baseUrl}/${file.FilePath}`}
                          alt={file.FileName}
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
                          {file.FileName}
                        </p>
                        <span
                          className="file-delete-button"
                          style={{
                            left: "90px",
                          }}
                          // onClick={() => {
                          //   handleDeleteFile(index);
                          // }}
                        >
                          <span
                            onClick={() => {
                              deleteEstmFile(file.EstimateFileId);
                              fetchEstimates();
                            }}
                          >
                            <Delete color="error" />
                          </span>
                        </span>
                      </div>
                    ))}

                    {Files.map((file, index) => (
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
                </div>
              </div>
              <div className="mb-2 row text-right">
                <div className="col-md-6 col-sm-4">
                  {submitError && (
                    <Alert severity="error">
                      {errorMessage ? errorMessage : "Error Adding Estimates"}
                    </Alert>
                  )}
                  {emptyFieldsError && (
                    <Alert severity="error">
                      Please fill all required fields
                    </Alert>
                  )}
                </div>

                <div className="col-md-4 col-sm-5">
                  {estimateId ? (
                    <div>
                      <FormControl>
                        <InputLabel size="small" id="estimateLink">
                          Create
                        </InputLabel>
                        <Select
                          labelId="estimateLink"
                          aria-label="Default select example"
                          variant="outlined"
                          className="text-left estimate-Link-Button"
                          // color="success"

                          name="Status"
                          size="small"
                          placeholder="Select Status"
                          fullWidth
                        >
                          <MenuItem
                            onClick={() => {
                              // setEstimateLinkData("PO clicked")
                              LinkToPO();
                              navigate("/purchase-order/add-po");
                            }}
                            value={2}
                          >
                            Purchase Order
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              LinkToPO();
                              navigate("/invoices/add-invoices");
                            }}
                            value={3}
                          >
                            Invoice
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <button
                        type="button"
                        className="mt-1 btn btn-sm btn-outline-primary estm-action-btn"
                      >
                        <Email />
                      </button>
                      <button
                        type="button"
                        className="mt-1 btn btn-sm btn-outline-primary estm-action-btn"
                        onClick={() => {
                          navigate("/estimates/estimate-preview");
                          setestmPreviewId(estimateId);
                          // console.log(estimate.EstimateId);
                        }}
                      >
                        <Print></Print>
                      </button>
                      <button
                        type="button"
                        className="mt-1 btn btn-sm btn-outline-primary estm-action-btn"
                        // style={{ minWidth: "120px" }}
                      >
                        <Download />
                      </button>
                    </div>
                  ) : (
                    <></>
                  )}{" "}
                </div>

                <div className="col-md-2 col-sm-3 p-0 ">
                  <button
                    type="submit"
                    className="btn btn-primary me-1"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                  <NavLink to="/estimates">
                    <button
                      className="btn btn-danger light ms-1 me-3"
                      onClick={() => {
                        if (isEstimateUpdateRoute) {
                          navigate(`/estimates`);
                          setPunchListData({});
                          return;
                        }
                        setShowContent(true);
                        setShowStatusCards(true);
                      }}
                    >
                      Cancel
                    </button>
                  </NavLink>
                </div>
              </div>
            </>
          )}
        </>
      </div>
    </>
  );
};

export default UpdateEstimateForm;
