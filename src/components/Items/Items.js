import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  IconButton,
  TablePagination,
  TableSortLabel,
  TextField,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Delete, Create } from "@mui/icons-material";
import { useNavigate } from "react-router";
import AddButton from "../Reusable/AddButton";
import EventPopups from "../Reusable/EventPopups";
import useQuickBook from "../Hooks/useQuickBook";
import { baseUrl } from "../../apiConfig";
import useGetData from "../Hooks/useGetData";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/TaskAltOutlined";
import CloseIcon from "@mui/icons-material/CancelOutlined";
import debounce from "lodash.debounce";
import { CSVLink } from "react-csv";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const Items = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };

  const { syncQB } = useQuickBook();
  const { getListData, data } = useGetData();
  const { dynamicColorAndLogo } = useContext(DataContext);
  const saleRefs = useRef([]);
  const PurchaseRefs = useRef([]);

  const navigate = useNavigate();

  // Access control for Items (/items)
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const [itemsList, setItemsList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAscending, setIsAscending] = useState(false);
  const [tablePage, setTablePage] = useState(0);

  const getFilteredItemsList = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    isAscending = false
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/Item/GetItemServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&isAscending=${isAscending}`,
        { headers }
      );
      console.log("filtered items data", res.data);
      setSaleEdit(false);
      setPurchaseEdit(false);
      setItemsList(res.data.Data);
      setTotalRecords(res.data.totalRecords);
      setLoading(false);
    } catch (error) {
      setItemsList([]);
      setLoading(false);

      console.log("Api call error", error);
    }
  };
  const [allDataLoading, setAllDataLoading] = useState(false);
  const getAllItemsList = async (
    PageLength = 10,
    Search = "",
    pageNo = 1,
    isAscending = false
  ) => {
    setAllDataLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/Item/GetItemServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${totalRecords}&isAscending=${isAscending}`,
        { headers }
      );
      console.log("filtered items data", res.data);
      downloadCSV(res.data.Data);
      setAllDataLoading(false);
    } catch (error) {
      setAllDataLoading(false);
      console.log("Api call error", error);
    }
  };
  const downloadCSV = (data) => {
    console.log("sdfsdf", data);

    const csvContent = [
      [
        "ItemId",
        "ActualName",
        "SaleDescription",
        "IncomeAccount",
        "ExpenseAccountName",
        "SalePrice",
        "PurchaseDescription",
        "PurchasePrice",
      ],
      ...data.filter((row) => !row.ActualName.toLowerCase().includes("deleted")).map((row) => [
        `"${row.ItemId}"`,
        `"${row.ActualName}"`,
        `"${row.SaleDescription}"`,
        `"${row.IncomeAccountName}"`,
        `"${row.ExpenseAccountName}"`,
        `"${row.SalePrice}"`,
        `"${row.PurchaseDescription}"`,
        `"${row.PurchasePrice}"`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const debouncedGetFilteredItems = useCallback(
    debounce(getFilteredItemsList, 500),
    []
  );
  const deleteItem = async (id) => {
    try {
      const res = await axios.get(`${baseUrl}/api/Item/DeleteItem?id=${id}`, {
        headers,
      });
      console.log("item deleted", res.data);
      syncQB(res.data.SyncId);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Item Deleted Successfuly");
      debouncedGetFilteredItems(
        search,
        tablePage + 1,
        rowsPerPage,
        isAscending
      );
    } catch (error) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Error deleting item");
      console.log("Api call error", error);
    }
  };

  const [editableSalePrice, setEditableSalePrice] = useState({});
  const [saleEdit, setSaleEdit] = useState(false);
  const handleSalePriceChange = (event, itemId) => {
    const value = parseFloat(event.target.value);
    setEditableSalePrice({
      ...editableSalePrice,
      [itemId]: value,
    });
  };

  const handleSaleBlur = (itemId) => {
    const newSalePrice = parseFloat(editableSalePrice[itemId]);
    if (!isNaN(newSalePrice)) {
      // Update the item's sale price in your data store
      // For example, you can call a function passed via props or update the state
      getListData(
        `/Item/UpdateItemPrice?ItemId=${itemId}&Price=${newSalePrice}&Type=Sale`,
        (id) => {
          syncQB(id);
          debouncedGetFilteredItems(
            search,
            tablePage + 1,
            rowsPerPage,
            isAscending
          );
          setOpenSnackBar(true);
          setSnackBarColor("success");
          setSnackBarText("Sale Price changed Successfuly");
        },
        () => {
          setOpenSnackBar(true);
          setSnackBarColor("error");
          setSnackBarText("error changing Sale Price");
        }
      );
      console.log(
        "Updated sale price for item ID:",
        itemId,
        "to",
        newSalePrice
      );
    }
  };
  const handleSaleEditClick = (index, id, price) => {
    console.log("id", id, "price", price);
    setSaleEdit(true);
    setSelectedRow(index);
    setEditableSalePrice({
      ...editableSalePrice,
      [id]: price,
    });

    setTimeout(() => {
      if (saleRefs.current[index]) {
        saleRefs.current[index].focus();
      }
    }, 0);
  };

  const [editablePurchasePrice, setEditablePurchasePrice] = useState({});

  const handlePurchasePriceChange = (event, itemId) => {
    const value = parseFloat(event.target.value);
    setEditablePurchasePrice({
      ...editablePurchasePrice,
      [itemId]: value,
    });
  };

  const handlePurchaseBlur = (itemId) => {
    const newPurchasePrice = parseFloat(editablePurchasePrice[itemId]);
    if (!isNaN(newPurchasePrice)) {
      // Update the item's sale price in your data store
      // For example, you can call a function passed via props or update the state
      getListData(
        `/Item/UpdateItemPrice?ItemId=${itemId}&Price=${newPurchasePrice}&Type=Purchase`,
        (id) => {
          syncQB(id);
          debouncedGetFilteredItems(
            search,
            tablePage + 1,
            rowsPerPage,
            isAscending
          );
          setOpenSnackBar(true);
          setSnackBarColor("success");
          setSnackBarText("Purchase Price changed Successfuly");
        },
        () => {
          setOpenSnackBar(true);
          setSnackBarColor("error");
          setSnackBarText("Purchase changing Sale Price");
        }
      );
      console.log(
        "Updated sale price for item ID:",
        itemId,
        "to",
        newPurchasePrice
      );
    }
  };

  const [purchaseEdit, setPurchaseEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);

  const handlePurchaseEditClick = (index, id, price) => {
    setPurchaseEdit(true);
    setSelectedRow(index);
    setEditablePurchasePrice({
      ...editablePurchasePrice,
      [id]: price,
    });
    setTimeout(() => {
      if (PurchaseRefs.current[index]) {
        PurchaseRefs.current[index].focus();
      }
    }, 0);
  };

  useEffect(() => {
    // Initialize the refs array length based on the data length
    saleRefs.current = saleRefs.current.slice(0, itemsList.length);
    PurchaseRefs.current = PurchaseRefs.current.slice(0, itemsList.length);
  }, [itemsList]);

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    debouncedGetFilteredItems(search, tablePage + 1, rowsPerPage, isAscending);
  }, [search, tablePage, rowsPerPage, isAscending]);

  useEffect(() => {
    setSaleEdit(false);
    setPurchaseEdit(false);
  }, [search, rowsPerPage, tablePage]);

  const handleChangePage = (event, newPage) => {
    console.log("New Page:", newPage);
    setTablePage(newPage);
  };
  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };

  const filteredItems = itemsList;

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredItems.length - page * rowsPerPage);

 const [uploadCsvLoading, setUploadCsvLoading] = useState(false)

  const handleUpload = (event) => {
    setUploadCsvLoading(true)
    const file = event.target.files[0];
    // setCsvFile(file);
    // parseCSV(file);
    uploadCsv(file)
  };

  const uploadCsv = async (file) => {
    const formData = new FormData();
    formData.append("File", file);
    const headers = {
      Authorization: `Bearer ${Cookies.get("token")}`,
      "Content-Type": "multipart/form-data",
    };
    try {
      const response = await axios.post(
        `${baseUrl}/api/Item/UploadCSV`,
        formData,
        {
          headers,
        }
      );
      console.log(response);
      setUploadCsvLoading(false)
      setOpenSnackBar(true);
          setSnackBarColor("success");
          setSnackBarText("Sussessfully Uploaded Csv file");
          debouncedGetFilteredItems(search, tablePage + 1, rowsPerPage, isAscending);

      // Handle successful submission
      // window.location.reload();
    } catch (error) {
      setUploadCsvLoading(false)
      setOpenSnackBar(true);
          setSnackBarColor("error");
          setSnackBarText("Error Uploading Csv file");
      console.error("API Call Error:", error);
    }
  };

  // const parseCSV = (file) => {
  //   const reader = new FileReader();
  //   reader.onload = (event) => {
  //     const csvString = event.target.result;
  //     const data = parseCSVString(csvString);
  //     setCsvData(data);
  //   };
  //   reader.readAsText(file);
  // };

  // const parseCSVString = (csvString) => {
  //   const rows = csvString.split("\n");
  //   const data = rows.map((row) => {
  //     return row.split(",");
  //   });
  //   return data;
  // };

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="container-fluid">
        <div className="col-xl-12">
          <div className="card" id="bootstrap-table2">
            <>
              <div className="card-header flex-wrap d-flex justify-content-between  border-0">
                <div>
                  <TextField
                    label="Search Item"
                    variant="standard"
                    size="small"
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className=" me-2">
                  {/* <CSVLink
                      className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                      data={filteredItems.map((item) => ({
                        Id : item.ItemId,
                        Name: item.ActualName,
                        SKU: item.SKU,
                        "Income Account": item.IncomeAccountName,
                        "Expense Account": item.ExpenseAccountName,
                        "Sale Price $": item.SalePrice,
                        "Cost Price $": item.PurchasePrice,
                      }))}
                      filename={"Items.csv"}
                      target="_blank"
                      separator={","}
                    >
                      <i className="fa fa-download"></i> CSV
                    </CSVLink> */}
                  <button
                    className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                    disabled={uploadCsvLoading}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".csv";
                      input.onchange = handleUpload;
                      input.click();
                    }}
                  >
                    {uploadCsvLoading ? <i className="fa fa-spinner fa-spin"></i> : 
                    <i className="fa fa-upload"></i>} Upload CSV
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                    disabled={allDataLoading}
                    onClick={() => {
                      getAllItemsList();
                    }}
                  >
                    {allDataLoading ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa fa-download"></i>
                    )}{" "}
                    Download CSV
                  </button>
                  <FormControl className="  me-2" variant="outlined">
                    <Select
                      labelId="customer-type-label"
                      variant="outlined"
                      value={isAscending}
                      onChange={() => {
                        setIsAscending(!isAscending);
                      }}
                      size="small"
                    >
                      <MenuItem value={true}>Ascending</MenuItem>
                      <MenuItem value={false}>Descending</MenuItem>
                    </Select>
                  </FormControl>
                  {canCreate ? (
                    <AddButton onClick={() => navigate(`/items/add-item`)}>
                      Add Item
                    </AddButton>
                  ) : (
                    <Tooltip title="You don't have create access" arrow>
                      <span>
                        <AddButton
                          disabled
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Add Item
                        </AddButton>
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="card-body pt-0">
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead className="table-header">
                      <TableRow className="material-tbl-alignment">
                        <TableCell>Name</TableCell>
                        <TableCell>Sale Description</TableCell>
                        <TableCell align="center">Income Account</TableCell>
                        <TableCell align="center">Expense Account</TableCell>
                        <TableCell align="right">Sale Price $</TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell align="right">Cost Price $</TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell className="text-end">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center">
                            <div className="center-loader">
                              <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {(rowsPerPage > 0
                            ? filteredItems.slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                              )
                            : filteredItems
                          ).map((item, index) => (
                            <TableRow
                              className="material-tbl-alignment"
                              key={index}
                              hover
                            >
                              <TableCell
                                onClick={() => {
                                  if (!canEdit) {
                                  ;
                                    return;
                                  }
                                  navigate(`/items/add-item?id=${item.ItemId}`);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {item.ActualName}
                              </TableCell>
                              <TableCell
                                onClick={() => {
                                  if (!canEdit) {
                                 
                                    return;
                                  }
                                  navigate(`/items/add-item?id=${item.ItemId}`);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {item.SaleDescription}
                              </TableCell>
                              <TableCell
                                align="center"
                                onClick={() => {
                                  if (!canEdit) {
                                 
                                    return;
                                  }
                                  navigate(`/items/add-item?id=${item.ItemId}`);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {item.IncomeAccountName} 
                              </TableCell>
                              <TableCell
                                align="center"
                                onClick={() => {
                                  if (!canEdit) {
                                  
                                    return;
                                  }
                                  navigate(`/items/add-item?id=${item.ItemId}`);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {item.ExpenseAccountName}
                              </TableCell>
                              <TableCell
                                className="text-end"
                                onDoubleClick={() => {
                                  if (canEdit) {
                                    handleSaleEditClick(
                                      index,
                                      item.ItemId,
                                      item.SalePrice
                                    );
                                  }
                                }}
                              >
                                {saleEdit && selectedRow === index ? (
                                  <input
                                    className="form-control form-control-sm number-input "
                                    type="number"
                                    ref={(el) => (saleRefs.current[index] = el)}
                                    value={editableSalePrice[item.ItemId]}
                                    style={{
                                      height: "18px",
                                      minHeight: "18px",
                                      width: "9em",

                                      marginLeft: "auto",
                                    }}
                                    onChange={(event) =>
                                      handleSalePriceChange(event, item.ItemId)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        // Handle item addition when Enter key is pressed
                                        e.preventDefault(); // Prevent form submission

                                        setSelectedRow(index);
                                        if (
                                          item.SalePrice !==
                                          editableSalePrice[item.ItemId]
                                        ) {
                                          handleSaleBlur(item.ItemId);
                                        }
                                      } else if (e.key === "Escape") {
                                        setSaleEdit(false);
                                        setSelectedRow(index);
                                      }
                                    }}
                                  />
                                ) : (
                                  <span>{item.SalePrice}</span>
                                )}
                              </TableCell>
                              <TableCell align="left" style={{ width: "4em" }}>
                                {saleEdit && selectedRow === index ? (
                                  <>
                                    <DoneIcon
                                      onClick={(event) => {
                                        setSelectedRow(index);
                                        if (
                                          item.SalePrice !==
                                          editableSalePrice[item.ItemId]
                                        ) {
                                          handleSaleBlur(item.ItemId);
                                        }
                                      }}
                                      style={{
                                        fontSize: "16px",
                                        color: "#77993d",
                                        marginRight: "5px",
                                      }}
                                    />
                                    <CloseIcon
                                      onClick={() => {
                                        setSaleEdit(false);
                                        setSelectedRow(index);
                                      }}
                                      style={{
                                        fontSize: "16px",
                                        color: "red",
                                      }}
                                    />
                                  </>
                                ) : (
                                  canEdit ? (
                                    <CreateIcon
                                      onClick={() => {
                                        handleSaleEditClick(
                                          index,
                                          item.ItemId,
                                          item.SalePrice
                                        );
                                      }}
                                      style={{
                                        fontSize: "14px",
                                        color: "#77993d",
                                      }}
                                    />
                                  ) : (
                                    <Tooltip title="You don't have access" arrow>
                                      <span>
                                        <CreateIcon
                                          style={{
                                            fontSize: "14px",
                                            color: "#ccc",
                                            cursor: "not-allowed",
                                            opacity: 0.6,
                                          }}
                                        />
                                      </span>
                                    </Tooltip>
                                  )
                                )}
                              </TableCell>
                              <TableCell
                                className="text-end"
                                onDoubleClick={() => {
                                  if (canEdit) {
                                    handlePurchaseEditClick(
                                      index,
                                      item.ItemId,
                                      item.PurchasePrice
                                    );
                                  }
                                }}
                              >
                                {purchaseEdit && selectedRow === index ? (
                                  <input
                                    className="form-control form-control-sm number-input "
                                    type="number"
                                    ref={(el) =>
                                      (PurchaseRefs.current[index] = el)
                                    }
                                    value={editablePurchasePrice[item.ItemId]}
                                    style={{
                                      height: "18px",
                                      minHeight: "18px",
                                      width: "9em",

                                      marginLeft: "auto",
                                    }}
                                    onChange={(event) =>
                                      handlePurchasePriceChange(
                                        event,
                                        item.ItemId
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        // Handle item addition when Enter key is pressed
                                        e.preventDefault(); // Prevent form submission

                                        setSelectedRow(index);
                                        if (
                                          item.PurchasePrice !==
                                          editablePurchasePrice[item.ItemId]
                                        ) {
                                          handlePurchaseBlur(item.ItemId);
                                        }
                                      } else if (e.key === "Escape") {
                                        setPurchaseEdit(false);
                                        setSelectedRow(index);
                                      }
                                    }}
                                  />
                                ) : (
                                  <span

                                  // onBlur={() => handlePurchaseBlur(item.ItemId)}
                                  >
                                    {item.PurchasePrice}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell style={{ width: "4em" }}>
                                {purchaseEdit && selectedRow === index ? (
                                  <>
                                    <DoneIcon
                                      onClick={(event) => {
                                        setSelectedRow(index);
                                        if (
                                          item.PurchasePrice !==
                                          editablePurchasePrice[item.ItemId]
                                        ) {
                                          handlePurchaseBlur(item.ItemId);
                                        }
                                      }}
                                      style={{
                                        fontSize: "16px",
                                        color: "#77993d",
                                        marginRight: "5px",
                                      }}
                                    />
                                    <CloseIcon
                                      onClick={() => {
                                        setPurchaseEdit(false);
                                        setSelectedRow(index);
                                      }}
                                      style={{
                                        fontSize: "16px",
                                        color: "red",
                                      }}
                                    />
                                  </>
                                ) : (
                                  canEdit ? (
                                    <CreateIcon
                                      onClick={() =>
                                        handlePurchaseEditClick(
                                          index,
                                          item.ItemId,
                                          item.PurchasePrice
                                        )
                                      }
                                      style={{
                                        fontSize: "14px",
                                        color: "#77993d",
                                      }}
                                    />
                                  ) : (
                                    <Tooltip title="You don't have access" arrow>
                                      <span>
                                        <CreateIcon
                                          style={{
                                            fontSize: "14px",
                                            color: "#ccc",
                                            cursor: "not-allowed",
                                            opacity: 0.6,
                                          }}
                                        />
                                      </span>
                                    </Tooltip>
                                  )
                                )}
                              </TableCell>
                              <TableCell className="text-end">
                                <Button
                                  //  className=" btn btn-primary  btn-icon-xxs me-2"
                                  size="small"
                                  onClick={() => {}}
                                ></Button>
                                {canDelete ? (
                                  <Button
                                    //  className="btn btn-danger btn-icon-xxs "
                                    size="small"
                                    data-bs-toggle="modal"
                                    // className="btn btn-danger btn-icon-xxs mr-2"
                                    data-bs-target={`#deleteItemModal${item.ItemId}`}
                                  >
                                    <Delete color="error" />
                                  </Button>
                                ) : (
                                  <Tooltip title="You don't have access" arrow>
                                    <span>
                                      <Button
                                        size="small"
                                        disabled
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        style={{ cursor: "not-allowed", opacity: 0.6 }}
                                      >
                                        <Delete color="error" />
                                      </Button>
                                    </span>
                                  </Tooltip>
                                )}

                                <div
                                  className="modal fade"
                                  id={`deleteItemModal${item.ItemId}`}
                                  tabIndex="-1"
                                  aria-labelledby="deleteModalLabel"
                                  aria-hidden="true"
                                >
                                  <div
                                    className="modal-dialog modal-dialog-centered"
                                    role="document"
                                  >
                                    <div className="modal-content">
                                      <div className="modal-header">
                                        <h5 className="modal-title">
                                          Delete Item
                                        </h5>
                                        <button
                                          type="button"
                                          className="btn-close"
                                          data-bs-dismiss="modal"
                                        ></button>
                                      </div>
                                      <div className="modal-body text-center">
                                        <p>
                                          Are you sure you want to delete{" "}
                                          {item.ItemName}
                                        </p>
                                      </div>
                                      <div className="modal-footer">
                                        <button
                                          type="button"
                                          id="closer"
                                          className="btn btn-danger light me-"
                                          data-bs-dismiss="modal"
                                        >
                                          Close
                                        </button>
                                        <button
                                          className="btn btn-primary"
                                          data-bs-dismiss="modal"
                                          onClick={() =>
                                            deleteItem(item.ItemId)
                                          }
                                        >
                                          Yes
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {emptyRows > 0 && (
                            <TableRow>
                              <TableCell colSpan={5} />
                            </TableRow>
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[100, 200, 300]}
                  component="div"
                  count={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={tablePage} // Use tablePage for the table rows
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setTablePage(0); // Reset the tablePage to 0 when rowsPerPage changes
                  }}
                />
              </div>
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default Items;
