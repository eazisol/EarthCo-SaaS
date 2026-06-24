import React, { useState, useEffect, useCallback, useContext } from "react";



import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  ListSubheader,
  TableContainer,
  TableSortLabel,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import useFetchInvoices from "../Hooks/useFetchInvoices";
import { NavLink, useNavigate } from "react-router-dom";
import { useEstimateContext } from "../../context/EstimateContext";
import TblDateFormat from "../../custom/TblDateFormat";
import AddButton from "../Reusable/AddButton";
import formatAmount from "../../custom/FormatAmount";
import ComaSpacing from "../../custom/ComaSpacing";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import debounce from "lodash.debounce";
import formatDate from "../../custom/FormatDate";
import { useSearchParams } from "react-router-dom";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DataContext } from "../../context/AppData";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Authorization from "../Reusable/Authorization";
import { PDFDownloadLink } from "@react-pdf/renderer";
// import InvoicePDFMuliple from "./multipleInovicePDF";
import PrintButton from "../Reusable/PrintButton";
import Cookies from "js-cookie";
import axios from "axios";
import { baseUrl } from "../../apiConfig";
import InvoiceTitleBar from "../Invoice/InvoiceTitleBar";
import { AiOutlineFileSync } from "react-icons/ai";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";
export const RecurringTable = ({ customerform, customerId, mailData = {} }) => {


  const navigate = useNavigate();
  const {
    loading,
    error,
    fetchFilterInvoice,
    filteredInvoiceList,
    totalRecords,
  } = useFetchInvoices();

  const { selectedInvoices, setSelectedInvoices, loggedInUser, companyInfo, recurringInvoices, setRecurringInnvoices } =
    useContext(DataContext);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState([]);
  const [primaryColor, setPrimaryColor] = useState(""); // default

  useEffect(() => {
    const color = Cookies.get("PrimeryColor");
    if (color) setPrimaryColor(color);
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentDate = new Date();
  const [page, setPage] = useState(0);
  const { setEstimateLinkData } = useEstimateContext();

  useEffect(() => {
    // fetchInvoices();
    setEstimateLinkData({});
  }, []);

  const [rowsPerPage, setRowsPerPage] = useState(
    searchParams.get("rowsPerPage") || 100
  );
  const [tablePage, setTablePage] = useState(
    searchParams.get("tablePage") || 0
  );
  const [statusId, setStatusId] = useState(searchParams.get("statusId") || 0);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isAscending, setIsAscending] = useState(
    searchParams.get("isAscending") === "true"
  );
  const [startDateFilter, setStartDateFilter] = useState(
    searchParams.get("startDateFilter") || null
  );
  const [endDateFilter, setEndDateFilter] = useState(
    formatDate(searchParams.get("endDateFilter") || currentDate)
  );
  const [orderBy, setOrderBy] = useState({
    Profit: searchParams.get("isAscending") === "true",
    issueDate: searchParams.get("isAscending") === "true",
  });
  const [isTemplate, setIsTemplate] = useState(true);

  const [selectAll, setSelectAll] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [apiResponses, setApiResponses] = useState([]);
  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const fetchInvoiceData = async (invoiceId) => {
    setInvoiceLoading(true)
    try {
      const { data } = await axios.get(
        `${baseUrl}/api/Invoice/GetInvoice?id=${invoiceId}`,
        { headers }
      );

      setApiResponses((prevData) => [...prevData, { invoiceId, ...data }]); // Store API response
      setInvoiceLoading(false)
    } catch (error) {
      setInvoiceLoading(false)
      console.error("Error fetching data:", error);
    }
  };

  const handleCheckboxChange = async (event, invoice) => {
    const InvoiceId = invoice.InvoiceId;

    if (event.target.checked) {
      setSelectedInvoices((prev) => [...prev, InvoiceId]); // Keep selectedInvoices unchanged
      await fetchInvoiceData(InvoiceId); // Fetch API data separately
    } else {
      setSelectedInvoices((prev) => prev.filter((id) => id !== InvoiceId));
      setApiResponses((prevData) =>
        prevData.filter((item) => item.invoiceId !== InvoiceId)
      );
    }
  };
  // const handleCheckboxChange = (event, invoice) => {
  //   const InvoiceId = invoice.InvoiceId;
  //   if (event.target.checked) {
  //     // Checkbox is checked, add the estimateId to the selectedEstimates array
  //     setSelectedInvoices((prevSelected) => [...prevSelected, InvoiceId]);
  //     setSelectedInvoiceData((prevSelected) => [...prevSelected, invoice]);
  //   } else {
  //     // Checkbox is unchecked, remove the estimateId from the selectedEstimates array
  //     setSelectedInvoices(
  //       (prevSelected) => prevSelected.filter((id) => id !== InvoiceId),

  //     );
  //     setSelectedInvoiceData(
  //       (prevSelected) => prevSelected.filter((id) => id.InvoiceId !== InvoiceId),

  //     );

  //   }
  // };
  const isRowSelected = (invoice) => selectedInvoices.includes(invoice);

  // const handleSelectAll = (event) => {
  //   if (event.target.checked) {
  //     // Select all rows
  //     if (Array.isArray(filteredInvoiceList)) {
  //       const allInvoices = filteredInvoiceList.map(
  //         (invoice) => invoice.InvoiceId
  //       );
  //       setSelectedInvoices(allInvoices);
  //       setSelectAll(true);
  //     } else {
  //       // Handle the case where filteredEstimates is not an array
  //       console.error("filteredEstimates is not an array");
  //     }
  //   } else {
  //     // Deselect all rows
  //     setSelectedInvoices([]);
  //     setSelectAll(false);
  //   }
  // };
  const handleSelectAll = async (event) => {
    if (event.target.checked) {
      if (Array.isArray(filteredInvoiceList)) {
        const allInvoices = filteredInvoiceList.map((invoice) => invoice.InvoiceId);
        setSelectedInvoices(allInvoices);
        setSelectAll(true);

        // Fetch only those invoices that aren't already in apiResponses
        const existingIds = apiResponses.map((res) => res.invoiceId);
        const newInvoiceIds = allInvoices.filter((id) => !existingIds.includes(id));

        // Fetch data for new invoices
        for (const invoiceId of newInvoiceIds) {
          await fetchInvoiceData(invoiceId);
        }
      } else {
        console.error("filteredInvoiceList is not an array");
      }
    } else {
      // Deselect all
      setSelectedInvoices([]);
      setApiResponses([]); // Clear all API responses too
      setSelectAll(false);
    }
  };

  const getDueDateStatus = (status) => {
    if (!status) {
      return;
    }

    if (status.includes("Overdue")) {
      return (
        <div className="d-flex flex-nowrap align-items-center">
          <div className="me-1">
            <InfoOutlinedIcon color="warning" sx={{ fontSize: "1.7em" }} />
          </div>
          <div className="">
            <div className=" text-bold">{status}</div>
            {/* <div className="">Overdue for {daysOverdue} days</div> */}
          </div>
        </div>
      );
    } else if (status.includes("Due")) {
      return (
        <div className="d-flex flex-nowrap align-items-center">
          <div className="me-1">
            <InfoOutlinedIcon color="error" sx={{ fontSize: "1.7em" }} />
          </div>
          <div className="">
            <div className=" text-bold">{status}</div>
            {/* <div className="">Overdue for {daysOverdue} days</div> */}
          </div>
        </div>
      );
    } else if (status.includes("Partially Paid")) {
      return status;
    } else if (status.includes("Paid")) {
      return (
        <div className="d-flex flex-nowrap align-items-center">
          <div className="me-1">
            <CheckCircleIcon color="success" sx={{ fontSize: "1.7em" }} />
          </div>
          <div className="">
            <div className=" text-bold">{status}</div>
            {/* <div className="">Overdue for {daysOverdue} days</div> */}
          </div>
        </div>
      );
    } else {
      return status;
    }
  };

  const debouncedGetFilteredInvoices = useCallback(
    debounce(fetchFilterInvoice, 500),
    []
  );
  useEffect(() => {
    debouncedGetFilteredInvoices(
      search,
      tablePage + 1,
      rowsPerPage,
      statusId,
      isAscending,
      orderBy.issueDate,
      orderBy.Profit,
      startDateFilter,
      endDateFilter,
      customerId,
      isTemplate
    );
    setSearchParams({
      search,
      tablePage,
      rowsPerPage,
      statusId,
      isAscending,
      issueDate: orderBy.issueDate,
      Profit: orderBy.Profit,
      startDateFilter,
      endDateFilter,
      id: customerId,
      isTemplate
    });
  }, [
    search,
    tablePage,
    rowsPerPage,
    statusId,
    isAscending,
    orderBy,
    startDateFilter,
    endDateFilter,
    searchParams.get("id"),
    isTemplate
  ]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  // Permissions for Invoice Templates
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  return (
    <>
      <InvoiceTitleBar title={"Invoice Template"} icon={<AiOutlineFileSync fontSize={25} />} />
      <div className={customerform ? "mt-3" : "container-fluid"}>
        <div className="row">
          <div className="col-xl-12" id="bootstrap-table2">
            <div className={customerform ? "" : "card"}>
              <>
                <div className="card-header flex-wrap d-flex justify-content-between  border-0">
                  <div>
                    <TextField
                      label="Search Invoice Template"
                      variant="standard"
                      size="small"
                      style={{ width: customerform ? "10em" : "15em" }}
                      fullWidth
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* <CalendarMonthOutlinedIcon /> */}
                    {/* <TextField
                      style={{ width: customerform && "7em" }}
                      label={"Start Date"}
                      placeholder="Start Date"
                      variant="standard"
                      className="me-3"
                      size="small"
                      type="date"
                      value={formatDate(startDateFilter)}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                 
                    <TextField
                      style={{ width: customerform && "7em" }}
                      label={"End Date"}
                      placeholder="Start Date"
                      variant="standard"
                      className="me-2"
                      size="small"
                      type="date"
                      value={formatDate(endDateFilter)}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    /> */}
                  </div>
                  <div className=" pe-2">
                    {/* {customerform &&apiResponses.length > 0&& (
                      <PDFDownloadLink
                      document={
                        <InvoicePDFMuliple
                          data={apiResponses.map(item => ({
                            ...item,
                            companyInfo:companyInfo,
                            SelectedCompany:
                              loggedInUser.CompanyId === 2
                                ? loggedInUser.CompanyName
                                : "EarthCo Landscape",
                          }))}
                        />
                      }
                        fileName={`Invoices.pdf`}
                      >
                        {({ loading, error }) => (
              
                        
                          invoiceLoading ? (
                            <span className="btn btn-sm" style={{ padding:"8px 10px",marginRight:"10px",marginTop:"2px",border:"1px solid #c2c2c2" }}>
                          <i className="fa fa-spinner"></i>
                        </span>
                          ) : (
                           <PrintButton
                        
                            padding="7px 7px"
                              varient="Download"
                              onClick={() => {
                                console.log("error", error);
                              }}
                            ></PrintButton>
                          )
                          
                        )}
                      </PDFDownloadLink>
                    )} */}
                    <Authorization allowTo={[1, 4, 5, 6]} hide>
                      {customerform && (
                        <FormControl className=" me-3" variant="outlined">
                          <Select
                            labelId="customer-type-label"
                            variant="outlined"
                            value={0}
                            size="small"
                          >
                            <MenuItem value={0}>Batch Actions</MenuItem>
                            <MenuItem
                              value={1}
                              onClick={() => {
                                navigate(
                                  `/send-mail?title=${"Invoices"}&mail=${mailData.ContactMail
                                  }&customer=${mailData.Customer}`
                                );
                              }}
                            >
                              Send Mail
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Authorization>


                    <FormControl className=" me-3" variant="outlined">
                      <Select
                        labelId="customer-type-label"
                        variant="outlined"
                        value={isAscending}
                        size="small"
                      >
                        <MenuItem
                          value={true}
                          onClick={() => {
                            setIsAscending(true);
                          }}
                        >
                          Ascending
                        </MenuItem>
                        <MenuItem
                          value={false}
                          onClick={() => {
                            setIsAscending(false);
                          }}
                        >
                          Descending
                        </MenuItem>



                      </Select>
                    </FormControl>
                    {!customerform && (
                      canCreate ? (
                        <AddButton
                          onClick={() => {
                            navigate(`add-template`);
                            setRecurringInnvoices(true)
                          }}
                        >
                          Add Template
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
                              Add Template
                            </AddButton>
                          </span>
                        </Tooltip>
                      )
                    )}
                  </div>
                </div>

                <div className="card-body pt-0">
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table>
                      <TableHead className="table-header">
                        <TableRow className="bill-tbl-alignment-rec">

                          <TableCell>Customer Name</TableCell>
                          <TableCell>Template Name</TableCell>
                          <TableCell>Template Type</TableCell>
                          {/* <TableCell>TransactionType</TableCell> */}

                          <TableCell>Interval</TableCell>
                          <TableCell>Day</TableCell>


                          <TableCell >Amount</TableCell>
                          <TableCell style={{ width: "7%" }}>Action</TableCell>
                          {/* <TableCell>Status</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center">
                              <div className="center-loader">
                                <CircularProgress
                                    style={{ color: primaryColor }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            <TableRow>
                              {error ? (
                                <TableCell className="text-center" colSpan={9}>
                                  <div className="text-center">
                                    No Record Found
                                  </div>
                                </TableCell>
                              ) : null}
                            </TableRow>

                            {filteredInvoiceList
                              .slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                              )
                              .map((invoice, index) => {

                                return (
                                  <TableRow
                                    className={`bill-tbl-alignment ${isRowSelected(invoice.InvoiceId)
                                      ? "selected-row"
                                      : ""
                                      }`}
                                    hover
                                    key={index}
                                  >
                                    <TableCell
                                      sx={{ width: 210 }}
                                      className="nowrap"
                                      onClick={() => {
                                        if (!canEdit || loggedInUser.userRole == "2") {
                                          return;
                                        }
                                        navigate(
                                          `/recurring-invoices/add-template?id=${invoice.InvoiceId}`
                                        );
                                      }}
                                      style={{ 
                                        cursor: canEdit && loggedInUser.userRole != "2" ? "pointer" : "default",
                                        opacity: canEdit && loggedInUser.userRole != "2" ? 1 : 0.6
                                      }}
                                    >
                                      {invoice.CustomerDisplayName}
                                    </TableCell>
                                    <TableCell
                                      onClick={() => {
                                        if (!canEdit || loggedInUser.userRole == "2") {
                                          return;
                                        }
                                        navigate(
                                          `/recurring-invoices/add-template?id=${invoice.InvoiceId}`
                                        );
                                      }}
                                      style={{ 
                                        cursor: canEdit && loggedInUser.userRole != "2" ? "pointer" : "default",
                                        opacity: canEdit && loggedInUser.userRole != "2" ? 1 : 0.6
                                      }}
                                    >
                                      {invoice.TemplateName}
                                    </TableCell>
                                    <TableCell
                                      onClick={() => {
                                        if (!canEdit || loggedInUser.userRole == "2") {
                                          return;
                                        }
                                        navigate(
                                          `/recurring-invoices/add-template?id=${invoice.InvoiceId}`
                                        );
                                      }}
                                      style={{ 
                                        whiteSpace: "nowrap",
                                        cursor: canEdit && loggedInUser.userRole != "2" ? "pointer" : "default",
                                        opacity: canEdit && loggedInUser.userRole != "2" ? 1 : 0.6
                                      }}
                                    >
                                      <span className={`
                                    badge badge-pill  span-hover-pointer
                                      
                                     `} style={{ backgroundColor: invoice.TemplateType === 'Unscheduled' ? "#ffc107" : invoice.TemplateType === 'Scheduled' ? "#28a745" : "" }}>  {invoice.TemplateType}</span>
                                    </TableCell>
                                    {/* <TableCell
                                    // onClick={() => {
                                    //   navigate(
                                    //     `/invoices/add-invoices?id=${invoice.InvoiceId}`
                                    //   );
                                    // }}
                                    >
                                      {invoice.TransactionType}

                                    </TableCell> */}

                                    <TableCell
                                      onClick={() => {
                                        if (!canEdit || loggedInUser.userRole == "2") {
                                          return;
                                        }
                                        navigate(
                                          `/recurring-invoices/add-template?id=${invoice.InvoiceId}`
                                        );
                                      }}
                                      style={{ 
                                        cursor: canEdit && loggedInUser.userRole != "2" ? "pointer" : "default",
                                        opacity: canEdit && loggedInUser.userRole != "2" ? 1 : 0.6
                                      }}
                                    >
                                      {invoice.Interval}
                                    </TableCell>
                                    <TableCell
                                      style={{ 
                                        width: "10%",
                                        cursor: canEdit && loggedInUser.userRole != "2" ? "pointer" : "default",
                                        opacity: canEdit && loggedInUser.userRole != "2" ? 1 : 0.6
                                      }}
                                      onClick={() => {
                                        if (!canEdit || loggedInUser.userRole == "2") {
                                          return;
                                        }
                                        navigate(
                                          `/recurring-invoices/add-template?id=${invoice.InvoiceId}`
                                        );
                                      }}
                                    >
                                      {invoice.Day}
                                    </TableCell>

                                    <TableCell
                                      onClick={() => {
                                        if (!canEdit || loggedInUser.userRole == "2") {
                                          return;
                                        }
                                        navigate(
                                          `/recurring-invoices/add-template?id=${invoice.InvoiceId}`
                                        );
                                      }}
                                      style={{ 
                                        cursor: canEdit && loggedInUser.userRole != "2" ? "pointer" : "default",
                                        opacity: canEdit && loggedInUser.userRole != "2" ? 1 : 0.6
                                      }}
                                    >
                                      ${formatAmount(invoice.TotalAmount)}
                                    </TableCell>
                                    {/* <TableCell
                                      component={RouterLink}
                                      to={
                                        loggedInUser.userRole === "2"
                                          ? `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                          : `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=true`
                                      }
                                      sx={{ cursor: "pointer", padding: "16px", padding: '0px' }}
                                      
                                    >
                                      Use
                                    </TableCell> */}
                                    <TableCell sx={{ padding: '0px' }}>
                                      {canEdit && loggedInUser.userRole !== "2" ? (
                                        <Button
                                          variant="outlined"
                                          color="primary"
                                          disableElevation
                                          component={RouterLink}
                                          to={`/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=true`}
                                          sx={{
                                            textTransform: "none",
                                            fontSize: "0.875rem",
                                            padding: "0px",

                                            '&:hover': {
                                              backgroundColor: 'transparent',
                                              color: primaryColor,         // custom blue text color
                                              borderColor: primaryColor,   // optional: make border match
                                              boxShadow: 'none',
                                            }
                                          }}
                                        >
                                          Use
                                        </Button>
                                      ) : (
                                        <Tooltip title="You don't have permission to use this template" arrow>
                                          <span>
                                            <Button
                                              variant="outlined"
                                              color="primary"
                                              disableElevation
                                              disabled
                                              sx={{
                                                textTransform: "none",
                                                fontSize: "0.875rem",
                                                padding: "0px",
                                              }}
                                            >
                                              Use
                                            </Button>
                                          </span>
                                        </Tooltip>
                                      )}
                                    </TableCell>



                                    {/* <Authorization allowTo={[1, 4, 5, 6]} hide>
                                    <TableCell
                                      className="text-end"
                                      onClick={() => {
                                        if (loggedInUser.userRole == "2") {
                                          navigate(
                                            `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                          );
                                          return;
                                        }
                                        navigate(
                                          `/recurring-invoices/add-template?id=${invoice.InvoiceId}`
                                        );
                                      }}
                                    >
                                      ${formatAmount(invoice.BalanceAmount)}
                                    </TableCell>
                                  </Authorization> */}

                                    {/* <TableCell>
                                <span
                                  onClick={() => {
                                    // setInvoiceData(invoice);
                                    navigate(
                                      `/invoices/invoice-preview?id=${invoice.InvoiceId}`
                                    );
                                  }}
                                  className="  span-hover-pointer badge badge-pill badge-success "
                                >
                                  Open
                                </span>
                              </TableCell> */}
                                  </TableRow>
                                )
                              })}
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
      </div>
    </>
  );
};


