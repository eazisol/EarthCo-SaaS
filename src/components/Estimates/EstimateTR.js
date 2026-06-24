import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  TablePagination,
  Checkbox,
  InputLabel,
  Grid,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import Cookies from "js-cookie";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TblDateFormat from "../../custom/TblDateFormat";
import useGetEstimate from "../Hooks/useGetEstimate";
import { DataContext } from "../../context/AppData";
import UpdateAllModal from "../Reusable/UpdateAllModal";
import DeleteAllModal from "../Reusable/DeleteAllModal";
import AddButton from "../Reusable/AddButton";
import formatAmount from "../../custom/FormatAmount";
import { CSVLink } from "react-csv";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import TableFilterPopover from "../Reusable/TableFilterPopover";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import { baseUrl } from "../../apiConfig";
import truncateString from "../../custom/TruncateString";
import ComaSpacing from "../../custom/ComaSpacing";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import CircularProgress from "@mui/material/CircularProgress";
import { debounce } from "lodash";
import formatDate from "../../custom/FormatDate";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import useGetApi from "../Hooks/useGetApi";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const EstimateTR = ({ 
  headers,
  estmRecords,
  tableError,
  filterdEstm,
  getFilteredEstimate,
  statusId,
  isLoading,
  getAllEstimate,
  estimates,
  allDataLoading,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
console.log('Cookies.get("EstimateAccess")',Cookies.get("EstimateAccess"))
  const currentDate = new Date();
  const { PunchListData, setPunchListData, setselectedPdf, loggedInUser ,setSelectedImages, dynamicColorAndLogo} =
    useContext(DataContext);
  
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(searchParams.get("rowsPerPage")) || 100
  );

  const [poFilter, setPoFilter] = useState(
    parseInt(searchParams.get("poFilter")) || 2
  );
  const [invoiceFilter, setInvoiceFilter] = useState(
    parseInt(searchParams.get("invoiceFilter")) || 2
  );
  const [billFilter, setBillFilter] = useState(
    parseInt(searchParams.get("billFilter")) || 2
  );

  const [startDateFilter, setStartDateFilter] = useState(
    searchParams.get("startDateFilter") || null
  );
  const [endDateFilter, setEndDateFilter] = useState(
    formatDate(searchParams.get("endDateFilter") || currentDate)
  );
  const [isAscending, setIsAscending] = useState(
    searchParams.get("isAscending") === "true"
  );
  const [estimateTypes, setEstimateTypes] = useState([]);
  const [EstimateTypeId, setEstimateTypeId] = useState(
    parseInt(searchParams.get("EstimateTypeId")) || 0
  );
  const [orderBy, setOrderBy] = useState({
    regionalManager: searchParams.get("regionalManager") === "true",
    bill: searchParams.get("bill") === "true",
    invoice: searchParams.get("invoice") === "true",
    profit: searchParams.get("profit") === "true",
    approvedDate: searchParams.get("approvedDate") === "true",
  });

  const debouncedGetFilteredEstimate = useCallback(
    debounce(getFilteredEstimate, 500),
    []
  );
  const navigate = useNavigate();

  const filteredEstimates = filterdEstm;
  const [tablePage, setTablePage] = useState(
    parseInt(searchParams.get("tablePage")) || 0
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Menu access controls will be defined after forReadOnlyAccess
  useEffect(() => {
    setPunchListData({});
    setselectedPdf({});
  }, []);

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    debouncedGetFilteredEstimate(
      search,
      tablePage + 1,
      rowsPerPage,
      statusId,
      isAscending,
      poFilter,
      invoiceFilter,
      billFilter,
      orderBy.regionalManager,
      orderBy.bill,
      orderBy.invoice,
      orderBy.profit,
      orderBy.approvedDate,
      startDateFilter,
      endDateFilter,
      EstimateTypeId
    );
    setSearchParams({
      search,
      tablePage,
      rowsPerPage,
      isAscending,
      poFilter,
      invoiceFilter,
      billFilter,
      startDateFilter,
      endDateFilter,
      regionalManager: orderBy.regionalManager,
      bill: orderBy.bill,
      invoice: orderBy.invoice,
      profit: orderBy.profit,
      approvedDate: orderBy.approvedDate,
      EstimateTypeId,
    });
  }, [
    search,
    tablePage,
    rowsPerPage,
    statusId,
    isAscending,
    poFilter,
    invoiceFilter,
    billFilter,
    orderBy,
    startDateFilter,
    endDateFilter,
    EstimateTypeId,
  ]);

  const handleChangePage = (event, newPage) => {
    // Update the tablePage state
    setTablePage(newPage);
  };
  const { getData } = useGetApi();
  const [selectedEstimates, setSelectedEstimates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const forReadOnlyAccess = (
    Cookies.get("EstimateAccess") === null ||
    Cookies.get("EstimateAccess") === "null" ||
    Cookies.get("EstimateAccess") === false ||
    Cookies.get("EstimateAccess") === "false"
  );
  // Menu access controls (auto-detect from /estimates route)
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  const fetchEstimateTypes = async () => {
    getData(
      `/Estimate/GetEstimateTypeList`,
      (data) => {
        setEstimateTypes(data);
      },
      (err) => {}
    );
  };
  const handleCheckboxChange = (event, estimateId) => {
    if (event.target.checked) {
      // Checkbox is checked, add the estimateId to the selectedEstimates array
      setSelectedEstimates((prevSelected) => [...prevSelected, estimateId]);
    } else {
      // Checkbox is unchecked, remove the estimateId from the selectedEstimates array
      setSelectedEstimates((prevSelected) =>
        prevSelected.filter((id) => id !== estimateId)
      );
    }
  };
  const isRowSelected = (estimateId) => selectedEstimates.includes(estimateId);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all rows
      if (Array.isArray(filteredEstimates)) {
        const allEstimateIds = filteredEstimates.map(
          (estimate) => estimate.EstimateId
        );
        setSelectedEstimates(allEstimateIds);
        setSelectAll(true);
      } else {
        // Handle the case where filteredEstimates is not an array
        console.error("filteredEstimates is not an array");
      }
    } else {
      // Deselect all rows
      setSelectedEstimates([]);
      setSelectAll(false);
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCell, setSelectedCell] = useState("");

  const handleCellClick = (cellValue) => (event) => {
    setAnchorEl(event.currentTarget);
    setSelectedCell(cellValue);
  };
  function filterBytext(number) {
    if (number === 0) {
      return "Not generated";
    } else if (number == 2) {
      return "All";
    } else if (number == 1) {
      return "Generated";
    } else {
      return "Invalid number";
    }
  }
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const downloadCSV = (data) => {
    

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
        "Customer",
        "Regional Manager",
        "Date",
        "Status",
        "Estimate Number",
        "Description of Work",
        "PO#",
        "Bill#",
        "Invoice#",
        "Profit %",
        "Amount",
      ],
      ...data.map((row) => [
        `"${row.CustomerDisplayName}"`,
        `"${row.RegionalManager}"`,
        `"${formatDate(row.Date)}"`,
        `"${row.Status}"`,
        `"${row.EstimateNumber}"`,
        `"${row.DescriptionofWork}"`,
        `"${row.PurchaseOrderNumber}"`,
        `"${row.BillNumber}"`,
        `"${row.InvoiceNumber}"`,
        `"${row.ProfitPercentage?.toFixed(2) || ""}"`,
        `"${formatAmount(row.EstimateAmount)}"`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Estimates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    fetchEstimateTypes();
  }, []);
  return (
    <>
      <ThemeProvider theme={theme}>
        <TableFilterPopover
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          selectedCell={selectedCell}
          setPoFilter={setPoFilter}
          setInvoiceFilter={setInvoiceFilter}
          setBillFilter={setBillFilter}
          billFilter={billFilter}
          invoiceFilter={invoiceFilter}
          poFilter={poFilter}
        />
        <div className="card">
          <div className="card-header flex-wrap d-flex justify-content-between  border-0">
            <div className="d-flex align-items-end">
              <TextField
                label="Search Estimate"
                variant="standard"
                className="me-3"
                size="small"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
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
              <div>
                <TextField
                  id="input-with-icon-adornment"
                  label="Start Date"
                  placeholder="Start Date"
                  variant="standard"
                  className="me-3"
                  size="small"
                  type="date"
                  value={formatDate(startDateFilter)}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }} // Ensure the label is always shrunk
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
              {loggedInUser?.CompanyId == 2 && (
                <FormControl className="me-2" variant="outlined">
                  <Select
                    name="EstimateTypeId"
                    value={EstimateTypeId || 0}
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
                        setEstimateTypeId(0);
                      }}
                    >
                      All
                    </MenuItem>
                    {estimateTypes?.map((type) => {
                      return (
                        <MenuItem
                          key={type.EstimateTypeId}
                          value={type.EstimateTypeId}
                          onClick={(e) => {
                            setEstimateTypeId(type.EstimateTypeId);
                          }}
                        >
                          {type.Type}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )} 
              <button
                className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                disabled={allDataLoading}
                onClick={() => {
                  // getAllEstimate(estmRecords.totalRecords, (data) => {
                  //   downloadCSV(data);
                  // });
                  downloadCSV(filteredEstimates);
                }}
              >
                {allDataLoading ? (
                  <i className="fa fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa fa-download"></i>
                )}{" "}
                CSV
              </button>

              {/* <CSVLink
                className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                data={filteredEstimates.map((estimate) => ({
                  Customer: estimate.CustomerDisplayName,
                  "Regional Manager": estimate.RegionalManager,
                  Date: estimate.Date,
                  Status: estimate.Status,
                  "Estimate Number": estimate.EstimateNumber,
                  "Description of Work": estimate.DescriptionofWork,
                  "PO#": estimate.PurchaseOrderNumber,
                  "Bill#": estimate.BillNumber,
                  "Invoice#": estimate.InvoiceNumber,
                  "Profit %": estimate.ProfitPercentage?.toFixed(2),
                  Amount: formatAmount(estimate.EstimateAmount),
                }))}
                filename={"Estimates.csv"}
                target="_blank"
                separator={","}
              >
                <i className="fa fa-download"></i> CSV
              </CSVLink> */}

              {/* <FormControl className="  me-2" variant="outlined">
                <Select
                  labelId="customer-type-label"
                  variant="outlined"
                  value={isAscending}
                  onChange={() => {
                    setIsAscending(!isAscending);
                    setOrderBy((prevSate) => ({
                      ...prevSate,
                      regionalManager: false,
                      bill: false,
                      invoice: false,
                      profit: false,
                    }));
                  }}
                  size="small"
                >
                  <MenuItem value={true}>Ascending</MenuItem>
                  <MenuItem value={false}>Descending</MenuItem>
                </Select>
              </FormControl> */}

              {selectedEstimates.length <= 0 ? (
                <></>
              ) : ( forReadOnlyAccess && (
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

                      <UpdateAllModal
                        selectedItems={selectedEstimates}
                        endpoint={"Estimate/UpdateAllSelectedEstimateStatus"}
                        bindingFunction={getFilteredEstimate}
                      />
                      <br />

                      <DeleteAllModal
                        selectedItems={selectedEstimates}
                        endpoint={"Estimate/DeleteAllSelectedEstimate"}
                        bindingFunction={getFilteredEstimate}
                        disabled={!canDelete}
                        tooltipMessage="You don't have permission to delete estimates"
                      />
                    </Select>
                  </FormControl>
                )
              )}
              {canCreate ? (
                  <AddButton
                    backgroundColor={dynamicColorAndLogo.PrimeryColor}
                    onClick={() => {
                      navigate("/estimates/add-estimate");
                      setSelectedImages([])
                    }}
                  >
                    Add Estimates
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
                      Add Estimates
                    </AddButton>
                  </span>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="card-body pt-0">
            <div className="row ">
              <div
                className="modal fade"
                id="deleteAllModal"
                tabIndex="-1"
                aria-labelledby="deleteAllModalLabel"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Delete Estimates</h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete Estimate</p>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        // id="closer"
                        className="btn btn-danger light"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        className="btn btn-primary "
                        data-bs-dismiss="modal"
                        onClick={() => {}} 
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="modal fade"
                id="updateAllModal"
                tabIndex="-1"
                aria-labelledby="updateAllModalLabel"
                aria-hidden="true"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Update Estimates</h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to Update selected Estimate</p>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        // id="closer"
                        className="btn btn-danger light"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        className="btn btn-primary "
                        data-bs-dismiss="modal"
                        onClick={() => {}}
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead className="table-header">
                    <TableRow className="material-tbl-alignment">
                      <TableCell padding="checkbox">
                        {canEdit ? (
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
                      {/* <TableCell>Id</TableCell> */}
                      <TableCell>Customer</TableCell>
                      <TableCell className="table-cell-align">
                        <TableSortLabel
                          active={orderBy.regionalManager}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              regionalManager: true,
                              bill: false,
                              invoice: false,
                              profit: false, 
                              approvedDate: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Regional Manager
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={isAscending}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              regionalManager: false,
                              bill: false,
                              invoice: false,
                              profit: false,
                              approvedDate: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy.approvedDate}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              regionalManager: false,
                              bill: false,
                              invoice: false,
                              profit: false,
                              approvedDate: true,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Approved Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center" className="table-cell-align">
                        Estimate #
                      </TableCell>
                      <TableCell className="table-cell-align">
                        Description Of Work
                      </TableCell>
                      <TableCell
                        align="center"
                        className="table-cell-align pe-2"
                        style={{ cursor: "pointer" }}
                      >
                        <span onClick={handleCellClick("PO filter by")}>
                          <CustomizedTooltips
                            title={`PO filter:-${filterBytext(poFilter)}`}
                            placement="top"
                          >
                            {filterBytext(poFilter) == "All" ? (
                              <FilterAltOffIcon sx={{ color: "#424242" }} />
                            ) : (
                              <FilterAltIcon sx={{ color: "#424242" }} />
                            )}
                          </CustomizedTooltips>
                        </span>
                        PO #
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ cursor: "pointer" }}
                        className="table-cell-align"
                      >
                        <span onClick={handleCellClick("Bill filter by")}>
                          <CustomizedTooltips
                            title={`Bill filter:- ${filterBytext(billFilter)}`}
                            placement="top"
                          >
                            {filterBytext(billFilter) == "All" ? (
                              <FilterAltOffIcon sx={{ color: "#424242" }} />
                            ) : (
                              <FilterAltIcon sx={{ color: "#424242" }} />
                            )}
                          </CustomizedTooltips>
                        </span>
                        <TableSortLabel
                          active={orderBy.bill}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              regionalManager: false,
                              bill: true,
                              invoice: false,
                              profit: false,
                              approvedDate: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Bill #
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ cursor: "pointer" }}
                        className="table-cell-align"
                      >
                        <span onClick={handleCellClick("Invoice filter by")}>
                          <CustomizedTooltips
                            title={`Invoice filter:-${filterBytext(
                              invoiceFilter
                            )}`}
                            placement="top"
                          >
                            {filterBytext(invoiceFilter) == "All" ? (
                              <FilterAltOffIcon sx={{ color: "#424242" }} />
                            ) : (
                              <FilterAltIcon sx={{ color: "#424242" }} />
                            )}
                          </CustomizedTooltips>
                        </span>
                        <TableSortLabel
                          active={orderBy.invoice}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              regionalManager: false,
                              bill: false,
                              invoice: true,
                              profit: false,
                              approvedDate: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Invoice #
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        align="center"
                        className=" text-end table-cell-align"
                      >
                        <TableSortLabel
                          active={orderBy.profit}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              regionalManager: false,
                              bill: false,
                              invoice: false,
                              profit: true,
                              approvedDate: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Profit %
                        </TableSortLabel>
                      </TableCell>
                      <TableCell className="text-end">Amount</TableCell>
                      {/* <TableCell>Actions</TableCell> */}
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
                        {tableError ? (
                          <TableRow>
                            <TableCell className="text-center" colSpan={12}>
                              No record Found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEstimates
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                            .map((estimate, index) => {
                         
                              return(
                              <TableRow
                                className={`material-tbl-alignment ${
                                  isRowSelected(estimate.EstimateId)
                                    ? "selected-row"
                                    : ""
                                }`}
                                key={index}
                                hover
                              >
                                <TableCell padding="checkbox">
                                  {canEdit ? (
                                    <Checkbox
                                      checked={selectedEstimates.includes(
                                        estimate.EstimateId
                                      )}
                                      onChange={(e) =>
                                        handleCheckboxChange(
                                          e,
                                          estimate.EstimateId
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
                                          checked={selectedEstimates.includes(
                                            estimate.EstimateId
                                          )}
                                          onChange={(e) =>
                                            handleCheckboxChange(
                                              e,
                                              estimate.EstimateId
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
                                {/* <TableCell
                              onClick={() => {
                                navigate(
                                  `/estimates/add-estimate?id=${estimate.EstimateId}`
                                );
                              }}
                            >
                              {estimate.EstimateId}
                            </TableCell> */}

                                {/* <TableCell className="table-cell-align">

                                  {index+1}
                                </TableCell> */}
                                <TableCell className="table-cell-align">

                                  {estimate.CustomerDisplayName}{" "}
                               {forReadOnlyAccess&&   <NavLink
                                    to={`/customers/add-customer?id=${estimate.CustomerId}`}
                                    target="_blank"
                                  >
                                    <ArrowOutwardIcon
                                      style={{ fontSize: 14 }}
                                    />
                                  </NavLink>}
                                </TableCell>



                                <TableCell
                                  className="table-cell-align"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {estimate.RegionalManager}
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: "nowrap" }}
                                  className="table-cell-align"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {TblDateFormat(estimate.Date)}
                                </TableCell>
                                <TableCell
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  <span
                                    style={{
                                      backgroundColor: estimate.StatusColor,
                                    }}
                                    className="badge badge-pill  span-hover-pointer"
                                  >
                                    {estimate.Status}
                                  </span>
                                </TableCell>
                                <TableCell
                                  style={{ whiteSpace: "nowrap" }}
                                  className="table-cell-align"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {TblDateFormat(estimate.ApprovedDate)}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  className="table-cell-align"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {estimate.EstimateNumber}
                                </TableCell>
                                {/* <TableCell>{estimate.EstimateAmount}</TableCell> */}
                                <TableCell
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {truncateString(
                                    estimate.DescriptionofWork,
                                    100
                                  )}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {ComaSpacing(estimate.PurchaseOrderNumber)}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {ComaSpacing(estimate.BillNumber)}
                                </TableCell>
                                <TableCell
                                  align="center"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {estimate.InvoiceNumber}
                                </TableCell>
                                <TableCell
                                  className="text-end"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  {estimate.ProfitPercentage?.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  className="text-end"
                                  onClick={() => {
                                    navigate(canEdit ? `/estimates/add-estimate?id=${estimate.EstimateId}` : `/estimates/estimate-preview?id=${estimate.EstimateId}`);
                                  }}
                                >
                                  <div >
                                  ${formatAmount(estimate.TotalAmount)}

                                  </div>
                                  <div style={{color:"#898686",fontSize:"12px"}}>
                                  ${formatAmount(estimate.BalanceAmount)}

                                  </div>
                                </TableCell>
                              </TableRow>
                            )})
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {estmRecords.totalRecords && (
                <TablePagination
                  rowsPerPageOptions={[100, 200, 300]}
                  component="div"
                  count={estmRecords.totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={tablePage} // Use tablePage for the table rows
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setTablePage(0); // Reset the tablePage to 0 when rowsPerPage changes
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
};

export default EstimateTR;
