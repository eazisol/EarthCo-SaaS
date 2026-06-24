import React, { useState, useEffect, useContext, useCallback } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";

import UpdateSRForm from "./UpdateSRForm";
import { Form } from "react-bootstrap";
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
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";
import Cookies from "js-cookie";
import Alert from "@mui/material/Alert";
import { DataContext } from "../../context/AppData";
import TblDateFormat from "../../custom/TblDateFormat";
import UpdateAllSR from "../Reusable/UpdateAllSR";
import DeleteAllModal from "../Reusable/DeleteAllModal";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import truncateString from "../../custom/TruncateString";
import ComaSpacing from "../../custom/ComaSpacing";
import debounce from "lodash.debounce";
import formatDate from "../../custom/FormatDate";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useSearchParams } from "react-router-dom";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const ServiceRequestTR = ({
  setShowCards,
  statusId,
  isLoading,
  sRfetchError,
  fetchFilterServiceRequest,
  sRFilterList,
  totalRecords,
  customerId,
}) => {
  const [searchParams , setSearchParams] = useSearchParams();
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), 0, 1);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [regionalManager, setRegionalManager] = useState(
    parseInt(searchParams.get("regionalManager")) || 0
  );

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
      fontSize: 14, // Making font a bit larger
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "8px 16px", // Adjust cell padding to reduce height
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
  
  // Get menu access dynamically based on current route
  const menuAccess = useMenuAccess(); // Auto-detects from /service-requests route
  
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
  });
  const debouncedGetFilteredSR = useCallback(
    debounce(fetchFilterServiceRequest, 500),
    []
  );

  useEffect(() => {
    // Fetch estimates when the tablePage changes
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
      customerId
    );
    setSearchParams({
      page: tablePage,
      search: sRsearch,
      isAscending,
      regionalManager,
      assign: orderBy.assign,
      Type: orderBy.Type,
      startDateFilter,
      endDateFilter,
      selectedType,
      id: customerId,
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
  ]);

  const handleChangePage = (event, newPage) => {
    // Update the tablePage state
    setTablePage(newPage);
  };

  const fetchSRTypes = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequestTypes`,
        { headers }
      );

      // Initialize with the original data

      setSRTypes(res.data);
    } catch (error) {
      console.log("error fetching SR types", error);
    }
  };

  //

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

      // Handle the response. For example, you can reload the customers or show a success message
      console.log("ServiceRequest deleted successfully:");
      fetchFilterServiceRequest();
    } catch (error) {
      console.error("There was an error deleting the customer:", error);
    }
  };

  const handleDelete = (id) => {
    deleteServiceRequest(id);
  };

  useEffect(() => {
    setShowCards(true);
    fetchSRTypes();
  }, []);

  const sortedAndSearchedCustomers = sRFilterList;

  const [selectedServiceRequests, setSelectedServiceRequests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleCheckboxChange = (event, serviceRequestId) => {
    // Disable checkbox if no edit access
    if (!menuAccess.canEdit || menuAccess.isLoading) {
      event.preventDefault();
      return;
    }
    
    if (event.target.checked) {
      // Checkbox is checked, add the serviceRequestId to the selectedServiceRequests array
      setSelectedServiceRequests((prevSelected) => [
        ...prevSelected,
        serviceRequestId,
      ]);
    } else {
      // Checkbox is unchecked, remove the serviceRequestId from the selectedServiceRequests array
      setSelectedServiceRequests((prevSelected) =>
        prevSelected.filter((id) => id !== serviceRequestId)
      );
    }
  };

  const downloadCSV = (data) => {
    console.log("sdfsdf", data);

    const formatAmount = (amount) => {
      // Implement your amount formatting function here, for example:
      return amount ? amount.toFixed(2) : "";
    };

    const formatDate = (date) => {
      // Implement your date formatting function here, for example:
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
    // Disable select all if no edit access
    if (!menuAccess.canEdit || menuAccess.isLoading) {
      event.preventDefault();
      return;
    }
    
    if (event.target.checked) {
      // Select all rows
      if (Array.isArray(sortedAndSearchedCustomers)) {
        const allServiceRequestIds = sortedAndSearchedCustomers.map(
          (customer) => customer.ServiceRequestId
        );
        setSelectedServiceRequests(allServiceRequestIds);
        setSelectAll(true);
      } else {
        // Handle the case where sortedAndSearchedCustomers is not an array
        console.error("sortedAndSearchedCustomers is not an array");
      }
    } else {
      // Deselect all rows
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
                      label="Search Service request"
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
                    {/* <FormControl className="  me-2" variant="outlined">
                  <Select
                    labelId="customer-type-label"
                    variant="outlined"
                    value={isAscending}
                    onChange={() => {
                      setIsAscending(!isAscending);
                      setOrderBy({
                        assign: false,
                        Type: false,
                      });
                    }}
                    size="small"
                  >
                    <MenuItem value={true}>Ascending</MenuItem>
                    <MenuItem value={false}>Descending</MenuItem>
                  </Select>
                </FormControl> */}
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

                          <UpdateAllSR
                            selectedItems={selectedServiceRequests}
                            endpoint={
                              "ServiceRequest/UpdateAllSelectedServiceRequestStatus"
                            }
                            bindingFunction={fetchFilterServiceRequest}
                          />
                          <br />

                          <DeleteAllModal
                            selectedItems={selectedServiceRequests}
                            endpoint={
                              "ServiceRequest/DeleteAllSelectedServiceRequest"
                            }
                            bindingFunction={fetchFilterServiceRequest}
                            disabled={!menuAccess.canDelete || menuAccess.isLoading}
                          />
                        </Select>
                      </FormControl>
                    )}
                    {loggedInUser.userRole == "4"||loggedInUser.userRole == "8" ? (
                      <></>
                    ) : menuAccess.canCreate && !menuAccess.isLoading ? (
                      <AddButton
                        backgroundColor={dynamicColorAndLogo.PrimeryColor}
                        onClick={() => {
                          navigate(`/service-requests/add-sRform`);
                        }}
                      >
                        Add Service Request
                      </AddButton>
                    ) : (
                      <Tooltip title="You don't have create access" arrow>
                        <span>
                          <AddButton
                            backgroundColor={dynamicColorAndLogo.PrimeryColor}
                            disabled={true}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            Add Service Request
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
                      {!customerId && (
                        <TableCell padding="checkbox">
                          {menuAccess.canEdit && !menuAccess.isLoading ? (
                            <Checkbox
                              checked={selectAll}
                              onChange={handleSelectAll}
                              sx={{
                                color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                "&.Mui-checked": {
                                  color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                },
                              }}
                            />
                          ) : (
                            <Tooltip title="You don't have access" arrow>
                              <span>
                                <Checkbox
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                  disabled
                                  sx={{
                                    color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                    "&.Mui-checked": {
                                      color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                    },
                                  }}
                                />
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>
                      )}

                      <TableCell>Service Request #</TableCell>
                      {!customerId && <TableCell>Customer Name</TableCell>}
                      <TableCell>
                        <TableSortLabel
                          active={orderBy.assign}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              assign: true,
                              Type: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Assigned to
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Status</TableCell>
                      {!customerId && <TableCell>Estimate#</TableCell>}
                      <TableCell>Work Requested</TableCell>
                      <TableCell>Action Taken</TableCell>
                      {customerId ? (
                        <TableCell>Service Location</TableCell>
                      ) : (
                        <></>
                      )}
                      <TableCell>
                        <TableSortLabel
                          active={isAscending}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              Type: false,
                              assign: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Date Created
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy.Type}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              Type: true,
                              assign: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Type
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center">
                          <div className="center-loader">
                            <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
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
                              {!customerId && (
                                <TableCell padding="checkbox">
                                  {menuAccess.canEdit && !menuAccess.isLoading ? (
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
                                      sx={{
                                        color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                        "&.Mui-checked": {
                                          color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Tooltip title="You don't have access" arrow>
                                      <span>
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
                                          disabled
                                          sx={{
                                            color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                            "&.Mui-checked": {
                                              color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                            },
                                          }}
                                        />
                                      </span>
                                    </Tooltip>
                                  )}
                                </TableCell>
                              )}
                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                  navigate(
                                    `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                  );
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {customer.ServiceRequestNumber}
                              </TableCell>
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
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                  navigate(
                                    `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                  );
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {ComaSpacing(customer.Assign)}
                              </TableCell>
                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                  navigate(
                                    `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                  );
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                <span
                                  style={{
                                    backgroundColor: customer.StatusColor,
                                  }}
                                  className="span-hover-pointer badge badge-pill  "
                                >
                                  {customer.Status}
                                </span>
                              </TableCell>
                              {!customerId && (
                                <TableCell
                                  onClick={() => {
                                    // If no edit access, go to preview
                                    if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                    navigate(
                                      `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                    );
                                  }}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                >
                                  {customer.EstimateLinkedNumber}
                                </TableCell>
                              )}
                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                  navigate(
                                    `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                  );
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
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                  navigate(
                                    `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                  );
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {truncateString(customer.ActionTaken, 100)}
                              </TableCell>
                              {customerId ? (
                                <TableCell
                                  onClick={() => {
                                    // If no edit access, go to preview
                                    if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                    navigate(
                                      `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                    );
                                  }}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                >
                                  {customer.ServiceLocationName}
                                </TableCell>
                              ) : (
                                <></>
                              )}
                              <TableCell
                                onClick={() => {
                                  // If no edit access, go to preview
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                  navigate(
                                    `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                  );
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
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
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
                                  navigate(
                                    `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                                  );
                                }}
                                style={{
                                  cursor: "pointer",
                                }}
                              >
                                {customer.Type}
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
                page={tablePage} // Use tablePage for the table rows
                onPageChange={handleChangePage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setTablePage(0); // Reset the tablePage to 0 when rowsPerPage changes
                }}
              />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
};

export default ServiceRequestTR;
