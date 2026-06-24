import React, { useState, useEffect, useContext, useCallback } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  TableRow,
  TableSortLabel,
  Button,
  TablePagination,
  TableContainer,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";
import Cookies from "js-cookie";
import { DataContext } from "../../context/AppData";
import TblDateFormat from "../../custom/TblDateFormat";
import UpdateAllSR from "../Reusable/UpdateAllSR";
import DeleteAllModal from "../Reusable/DeleteAllModal";
import { baseUrl } from "../../apiConfig";
import truncateString from "../../custom/TruncateString";
import debounce from "lodash.debounce";
import formatDate from "../../custom/FormatDate";
import { useSearchParams } from "react-router-dom";
import { Delete } from "@mui/icons-material";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import AddButton from "../Reusable/AddButton";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const RecurringSrTR = ({
  setShowCards,
  statusId,
  isLoading,
  sRfetchError,
  fetchFilterServiceRequest,
  sRFilterList,
  totalRecords,
  customerId,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isTemplate = true; 

  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), 0, 1);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [regionalManager, setRegionalManager] = useState(
    parseInt(searchParams.get("regionalManager")) || 0
  );
  const [modalOpen, setModalOpen] = useState({
    open: false,
    onConfirm: null,
    message: "",
  });

  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const navigate = useNavigate();
  const { setSRData, loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  
  const theme = createTheme({
    palette: {
      primary: {
        main: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
      },
    },
    typography: {
      fontSize: 14,
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "8px 16px",
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
            "&.Mui-checked": {
              color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            "&:focus": {
              borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
            },
          },
        },
      },
    },
  });
  // Use menu access for Recurring SR (/RecurringSR-list) - auto-detect from route
  const menuAccess = useMenuAccess();
  const [tablePage, setTablePage] = useState(
    parseInt(searchParams.get("page")) || 0
  );
  const [sRsearch, setSRsearch] = useState(searchParams.get("search") || "");
  const [isAscending, setIsAscending] = useState(
    searchParams.get("isAscending") === "true"
  );
  const [startDateFilter, setStartDateFilter] = useState(
    searchParams.get("startDateFilter") || null
  );
  const [endDateFilter, setEndDateFilter] = useState(
    formatDate(searchParams.get("endDateFilter") || currentDate)
  );
  const [selectedType, setSelectedType] = useState(
    parseInt(searchParams.get("selectedType")) || 0
  );
  const [sRTypes, setSRTypes] = useState([]);
  const [orderBy, setOrderBy] = useState({
    assign: searchParams.get("assign") === "true",
    Type: searchParams.get("Type") === "true",
    customerName: searchParams.get("customerName") === "true",
  });
  const debouncedGetFilteredSR = useCallback(
    debounce(fetchFilterServiceRequest, 500),
    []
  );
  useEffect(() => {
    debouncedGetFilteredSR(
      sRsearch,
      tablePage + 1,
      rowsPerPage,
      statusId,
      isAscending,
      regionalManager,
      orderBy.assign,
      orderBy.Type,
      startDateFilter,
      endDateFilter,
      selectedType,
      customerId,
      isTemplate,
      orderBy.customerName, // Pass true when sorting by customer name
      orderBy.YearMonth
    );
    setSearchParams({
      page: tablePage,
      search: sRsearch,
      isAscending,
      regionalManager,
      assign: orderBy.assign,
      Type: orderBy.Type,
      customerName: orderBy.customerName,
      startDateFilter,
      endDateFilter,
      selectedType,
      id: customerId,
      isTemplate,
      YearMonth: orderBy.YearMonth
    });
  }, [
    sRsearch,
    tablePage,
    rowsPerPage,
    statusId,
    isAscending,
    regionalManager,
    orderBy,
    startDateFilter,
    endDateFilter,
    selectedType,
    customerId,
    isTemplate,
  ]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  // const fetchSRTypes = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${baseUrl}/api/ServiceRequest/GetServiceRequestServerSideList`,
  //       { headers }
  //     );

  //     setSRTypes(res.data);
  //   } catch (error) {
  //     console.log("error fetching SR types", error);
  //   }
  // };

  
  const fetchSRMenu = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestTypes`,
        { headers }
      );

      setSRTypes(res.data);
    } catch (error) {
      console.log("error fetching SR types", error);
    }
  };

  const deleteServiceRequest = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/DeleteServiceRequest?id=${id}`,
        { headers }
      );

      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 4000);

      console.log("ServiceRequest deleted successfully:");
      // Call fetchFilterServiceRequest with isTemplate = true for RecurringSrTR
      fetchFilterServiceRequest(
        sRsearch,
        tablePage + 1,
        rowsPerPage,
        statusId,
        isAscending,
        regionalManager,
        orderBy.assign,
        orderBy.Type,
        startDateFilter,
        endDateFilter,
        selectedType,
        customerId,
        true, // isTemplate = true
        orderBy.customerName, // Pass true when sorting by customer name
        orderBy.YearMonth
      );
    } catch (error) {
      console.error("There was an error deleting the customer:", error);
    }
  };

  const handleDelete = (id) => {
    deleteServiceRequest(id);
  };

  useEffect(() => {
    setShowCards(true);
    // fetchSRTypes();
    fetchSRMenu();
  }, []);

  const sortedAndSearchedCustomers = sRFilterList;

  const [selectedServiceRequests, setSelectedServiceRequests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleCheckboxChange = (event, serviceRequestId) => {
    if (event.target.checked) {
      setSelectedServiceRequests((prevSelected) => [
        ...prevSelected,
        serviceRequestId,
      ]);
    } else {
      setSelectedServiceRequests((prevSelected) =>
        prevSelected.filter((id) => id !== serviceRequestId)
      );
    }
  };

  const downloadCSV = (data) => {
    console.log("sdfsdf", data);

    const formatAmount = (amount) => {
      return amount ? amount.toFixed(2) : "";
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    const csvContent = [
      [
        "Service Request #",
        "Assigned to",
        "Status",
        "Work Requested",
        "Action Taken",
        "Service Location",
        "Date Created",
        "Type",
      ],
      ...data.map((row) => [
        `"${row.ServiceRequestNumber}"`,
        `"${row.Assign}"`,
        `"${row.Status}"`,
        `"${row.WorkRequest}"`,
        `"${row.ActionTaken}"`,
        `"${row.ServiceLocationName}"`,
        `"${formatDate(row.CreatedDate)}"`,
        `"${row.Type}"`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Service Requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all rows
      if (Array.isArray(sortedAndSearchedCustomers)) {
        const allServiceRequestIds = sortedAndSearchedCustomers.map(
          (customer) => customer.ServiceRequestId
        );
        setSelectedServiceRequests(allServiceRequestIds);
        setSelectAll(true);
      } else {
        console.error("sortedAndSearchedCustomers is not an array");
      }
    } else {
      setSelectedServiceRequests([]);
      setSelectAll(false);
    }
  };

  const isRowSelected = (sr) => selectedServiceRequests.includes(sr);

  return (
    <>
      <ThemeProvider theme={theme}>
        <div className="">
          <div className="card">
            <div className="card-header flex-wrap d-flex justify-content-between border-0">
              {!customerId ? (
                <>
                  <div className="d-flex align-items-end">
                    <TextField
                      label="Search by customer "
                      className="me-3"
                      variant="standard"
                      size="small"
                      value={sRsearch}
                      onChange={(e) => {
                        setSRsearch(e.target.value);
                        setStartDateFilter(null);
                        setEndDateFilter(currentDate);
                      }}
                      sx={{
                        "& .MuiInput-underline:after": {
                          borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                          borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                        },
                      }}
                    />
                    {/* <CalendarMonthOutlinedIcon /> */}
                    <TextField
                      label={"Start Date"}
                      placeholder="Start Date"
                      variant="standard"
                      className="me-3"
                      size="small"
                      type="date"
                      value={formatDate(startDateFilter)}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiInput-underline:after": {
                          borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                          borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                        },
                      }}
                    />
                    {/* <CalendarMonthOutlinedIcon /> */}
                    <TextField
                      label={"End Date"}
                      placeholder="Start Date"
                      variant="standard"
                      className="me-2"
                      size="small"
                      type="date"
                      value={formatDate(endDateFilter)}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiInput-underline:after": {
                          borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                          borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                        },
                      }}
                    />
                  </div>
                  <div className=" me-2">
                    {loggedInUser.CompanyId == 2 &&
                      loggedInUser.userRole == "1" && (
                        <FormControl className="  me-2" variant="outlined">
                          <Select
                            labelId="customer-type-label"
                            variant="outlined"
                            value={regionalManager}
                            onChange={(e) => {
                              console.log("filter value", e.target.value);
                              setRegionalManager(e.target.value);
                            }}
                            size="small"
                            sx={{
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              },
                            }}
                          >
                            <MenuItem value={0}>Filters</MenuItem>

                            <MenuItem value={6146}>Wills View</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    <FormControl className="me-2" variant="outlined">
                      <Select
                        name="SRTypeId"
                        value={selectedType || 0}
                        onChange={(e) => {
                          e.preventDefault();
                        }}
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                          },
                        }}
                      >
                        <MenuItem
                          value={0}
                          onClick={() => {
                            setSelectedType(0);
                          }}
                        >
                          All
                        </MenuItem>
                        {sRTypes.map((type) => (
                          <MenuItem
                            key={type.SRTypeId}
                            value={type.SRTypeId}
                            onClick={(e) => {
                              setSelectedType(type.SRTypeId);
                            }}
                          >
                            {type.Type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedServiceRequests.length <= 0 ? (
                      <></>
                    ) : (
                      <FormControl className="  me-2" variant="outlined">
                        <Select
                          labelId="customer-type-label"
                          variant="outlined"
                          size="small"
                          value={1}
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                            },
                          }}
                        >
                          <MenuItem value={1}>Group Actions</MenuItem>

                          {/* <UpdateAllSR
                            selectedItems={selectedServiceRequests}
                            endpoint={
                              "ServiceRequest/UpdateAllSelectedServiceRequestStatus"
                            }
                            bindingFunction={fetchFilterServiceRequest}
                          /> */}
                          {/* <br /> */}

                          <DeleteAllModal
                            selectedItems={selectedServiceRequests}
                            endpoint={
                              "ServiceRequest/DeleteAllSelectedServiceRequest"
                            }
                            bindingFunction={fetchFilterServiceRequest}
                            disabled={!menuAccess?.canDelete || menuAccess?.isLoading}
                          />
                        </Select>
                      </FormControl>
                    )}
                    {loggedInUser.userRole == "4"||loggedInUser.userRole == "8" ? (
                      <></>
                    ) : menuAccess?.canCreate && !menuAccess?.isLoading ? (
                      <AddButton
                        backgroundColor={dynamicColorAndLogo?.PrimeryColor}
                        onClick={() => {
                          navigate(`/service-requests/add-sRform?add=true`);
                        }}
                      >
                        Add Recurring SR
                      </AddButton>
                    ) : (
                      <Tooltip title="You don't have create access" arrow>
                        <span>
                          <AddButton
                            backgroundColor={dynamicColorAndLogo?.PrimeryColor}
                            disabled={true}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            Add Recurring SR
                          </AddButton>
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-end w-100">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2 custom-csv-link mb-2"
                    // disabled={allDataLoading}
                    onClick={() => {
                      // getAllEstimate(estmRecords.totalRecords, (data) => {
                      //   downloadCSV(data);
                      // });
                      downloadCSV(sortedAndSearchedCustomers);
                    }}
                  >
                    <i className="fa fa-download"></i>
                    CSV
                  </button>
                </div>
              )}
            </div>
            <div className="card-body pt-0">
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead className="table-header">
                    <TableRow className="material-tbl-alignment">
                      {/* {!customerId && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                      )} */}

                      {/* {!customerId && <TableCell>Customer Name</TableCell>}
                       */}
                       { !customerId &&  <TableCell> 
                      <TableSortLabel
                          active={orderBy.customerName}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            if (orderBy.customerName) {
                              setIsAscending(!isAscending);
                            } else {
                              setOrderBy((prevSate) => ({
                                ...prevSate,
                                customerName: true,
                                assign: false,
                                YearMonth: false,
                                Type: false,
                              }));
                              setIsAscending(!isAscending);
                            }
                          }}
                        >
                       Customer Name
                        </TableSortLabel></TableCell>}
                      <TableCell>
                        {/* <TableSortLabel
                          active={!orderBy.assign && !orderBy.Type && !orderBy.customerName}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            const isDateActive = !orderBy.assign && !orderBy.Type && !orderBy.customerName;
                            if (isDateActive) {
                              // If already sorting by date, just toggle direction
                              setIsAscending(!isAscending);
                            } else {
                              // If not sorting by date, set it and toggle direction
                              setOrderBy((prevSate) => ({
                                ...prevSate,
                                Type: false, 
                                assign: false,
                                customerName: false,
                              }));
                              setIsAscending(!isAscending);
                            }
                          }}
                        > */}
                          Date Created
                        {/* </TableSortLabel> */}
                      </TableCell>
                      <TableCell> 
                      <TableSortLabel
                          active={orderBy.assign}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            if (orderBy.assign) {
                              // If already sorting by assign, just toggle direction
                              setIsAscending(!isAscending);
                            } else {
                              // If not sorting by assign, set it and toggle direction
                              setOrderBy((prevSate) => ({
                                ...prevSate,
                                assign: true,
                                YearMonth: false,
                                Type: false,
                                customerName: false,
                              }));
                              setIsAscending(!isAscending);
                            }
                          }}
                        >
                          Regional Manager
                        </TableSortLabel></TableCell>
                      {/* <TableCell>Regional Manager</TableCell> */}
                      <TableCell>Work Requested</TableCell>
                      <TableCell>Interval</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy.YearMonth}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            if (orderBy.YearMonth) {
                              // If already sorting by assign, just toggle direction
                              setIsAscending(!isAscending);
                            } else {
                              // If not sorting by assign, set it and toggle direction
                              setOrderBy((prevSate) => ({
                                ...prevSate,
                                YearMonth: true,
                                assign: false,
                                Type: false,
                                customerName: false,
                              }));
                              setIsAscending(!isAscending);
                            }
                          }}
                        >
                           Repeat Month
                        </TableSortLabel>
                        </TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell className="text-right">Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center">
                          <div className="center-loader">
                            <CircularProgress style={{ color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d" }} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {sRfetchError ? (
                          <TableRow>
                            <TableCell className="text-center" colSpan={12}>
                              No Record found
                            </TableCell>
                          </TableRow>
                        ) : null}
                        {sortedAndSearchedCustomers
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((customer, rowIndex) => (
                            <TableRow
                              className={`material-tbl-alignment ${
                                isRowSelected(customer.ServiceRequestId)
                                  ? "selected-row"
                                  : ""
                              }`}
                              key={rowIndex}
                              hover
                            >
                              {/* {!customerId && (
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectedServiceRequests.includes(
                                      customer.ServiceRequestId
                                    )}
                                    onChange={(e) =>
                                      handleCheckboxChange(
                                        e,
                                        customer.ServiceRequestId
                                      )
                                    }
                                  />
                                </TableCell>
                              )} */}

                              {!customerId && (
                                <TableCell>
                                  {customer.CustomerDisplayName}{" "}
                                  <NavLink
                                    to={`/customers/add-customer?id=${customer.CustomerId}`}
                                    target="_blank"
                                  >
                                    <ArrowOutwardIcon
                                      style={{ fontSize: 14 }}
                                    />
                                  </NavLink>
                                </TableCell>
                              )}
                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess?.canEdit || menuAccess?.isLoading) {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId || loggedInUser.userId}`
                                    );
                                    return;
                                  }
                                  // If user role is 2, go to preview
                                  if (loggedInUser.userRole == "2") {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId}`
                                    );
                                    return;
                                  }
                                  // If edit access, go to edit form
                                  navigate(`/service-requests/add-sRform?id=${customer.ServiceRequestId}`);
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {TblDateFormat(customer.CreatedDate)}
                              </TableCell>

                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess?.canEdit || menuAccess?.isLoading) {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId || loggedInUser.userId}`
                                    );
                                    return;
                                  }
                                  // If user role is 2, go to preview
                                  if (loggedInUser.userRole == "2") {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId}`
                                    );
                                    return;
                                  }
                                  // If edit access, go to edit form
                                  navigate(`/service-requests/add-sRform?id=${customer.ServiceRequestId}`);
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {truncateString(customer.Assign, 100)}
                              </TableCell>

                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess?.canEdit || menuAccess?.isLoading) {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId || loggedInUser.userId}`
                                    );
                                    return;
                                  }
                                  // If user role is 2, go to preview
                                  if (loggedInUser.userRole == "2") {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId}`
                                    );
                                    return;
                                  }
                                  // If edit access, go to edit form
                                  navigate(`/service-requests/add-sRform?id=${customer.ServiceRequestId}`);
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {truncateString(customer.WorkRequest, 100)}
                              </TableCell>
                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess?.canEdit || menuAccess?.isLoading) {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId || loggedInUser.userId}`
                                    );
                                    return;
                                  }
                                  // If user role is 2, go to preview
                                  if (loggedInUser.userRole == "2") {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId}`
                                    );
                                    return;
                                  }
                                  // If edit access, go to edit form
                                  navigate(`/service-requests/add-sRform?id=${customer.ServiceRequestId}`);
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {truncateString(customer.Interval , 100)}
                              </TableCell>
                              <TableCell>
                                {truncateString(customer.YearMonth || "", 100)}
                              </TableCell>
                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess?.canEdit || menuAccess?.isLoading) {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId || loggedInUser.userId}`
                                    );
                                    return;
                                  }
                                  // If user role is 2, go to preview
                                  if (loggedInUser.userRole == "2") {
                                    navigate(
                                      `/service-requests/service-request-preview?id=${customer.ServiceRequestId}&customerId=${customer.CustomerId}`
                                    );
                                    return;
                                  }
                                  // If edit access, go to edit form
                                  navigate(`/service-requests/add-sRform?id=${customer.ServiceRequestId}`);
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {truncateString(customer.Day, 100)}
                              </TableCell>
                              <TableCell className="text-right">
                                {menuAccess?.canDelete && !menuAccess?.isLoading ? (
                                  <span
                                    onClick={() =>
                                      setModalOpen({
                                        open: true,
                                        message: `Are you sure you want to delete Service Request ${
                                          customer.ServiceRequestNumber ||
                                          customer.ServiceRequestId
                                        }?`,
                                        onConfirm: () =>
                                          handleDelete(customer.ServiceRequestId),
                                      })
                                    }
                                  >
                                    <Delete color="error" />
                                  </span>
                                ) : (
                                  <Tooltip title="You don't have access" arrow>
                                    <span>
                                      <span
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                        style={{ cursor: "not-allowed", opacity: 0.6 }}
                                      >
                                        <Delete color="error" />
                                      </span>
                                    </span>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[100, 200, 300]}
                component="div"
                count={totalRecords.totalRecords}
                rowsPerPage={rowsPerPage}
                page={tablePage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setTablePage(0);
                }}
              />
            </div>
          </div>
        </div>

        <ConfirmationModal
          modalOpen={modalOpen.open}
          setModalOpen={() =>
            setModalOpen({ open: false, onConfirm: null, message: "" })
          }
          title="Confirmation"
          description={modalOpen.message}
          onConfirm={() => {
            modalOpen.onConfirm();
            setModalOpen({ open: false, onConfirm: null, message: "" });
          }}
          confirmText="Delete"
          deleteButton
        />
      </ThemeProvider>
    </>
  );
};

export default RecurringSrTR;
