import React, { useState, useEffect, useCallback, useContext } from "react";

import InvoiceTitleBar from "./InvoiceTitleBar";

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
} from "@mui/material";
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
import InvoicePDFMuliple from "./multipleInovicePDF";
import PrintButton from "../Reusable/PrintButton";
import Cookies from "js-cookie";
import axios from "axios";
import { baseUrl } from "../../apiConfig";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";
import DeleteAllModal from "../Reusable/DeleteAllModal";
const Invoices = ({ customerform, customerId, mailData = {} }) => {

  const navigate = useNavigate();
  const {
    loading,
    error,
    fetchFilterInvoice,
    filteredInvoiceList,
    totalRecords,
  } = useFetchInvoices();

  const { selectedInvoices, setSelectedInvoices, loggedInUser, companyInfo ,dynamicColorAndLogo} =
    useContext(DataContext);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState([]);

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
  const [agingStatusId, setAgingStatusId] = useState(
    statusId === 2 ? searchParams.get("agingStatusId") || 0 : 0
  );
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
  const [isTemplate, setIsTemplate] = useState(
    searchParams.get("isTemplate") === false // URL ?isTemplate=true → true
  );
  useEffect(() => {
    if (statusId !== 2) {
      setAgingStatusId(0);
    }
  }, [statusId]);
  useEffect(() => {
    setIsTemplate(searchParams.get("isTemplate") === false);
  }, []);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedInvoicesId, setSelectedInvoicesId] = useState([]);
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
    event.stopPropagation(); // Prevent navigation when clicking checkbox
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
  const handleCheckboxInvoicesChange = async (event, invoice) => {
    event.stopPropagation(); // Prevent navigation when clicking checkbox

    if (event.target.checked) {
      setSelectedInvoicesId((prev) => [...prev, invoice]); // Keep selectedInvoices unchanged
      // await fetchInvoiceData(invoice); // Fetch API data separately
    } else {
      setSelectedInvoicesId((prev) => prev.filter((id) => id !== invoice));
   
      // setApiResponses((prevData) =>
      //   prevData.filter((item) => item.invoiceId !== invoice)
      // );
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
  const handleSelectAllInvoices = (event) => {
    event.stopPropagation(); // Prevent any unwanted navigation
    if (event.target.checked) {
      // Select all rows
      if (Array.isArray(filteredInvoiceList)) {
        const allEstimateIds = filteredInvoiceList.map(
          (invoice) => invoice.InvoiceId
        );
        setSelectedInvoicesId(allEstimateIds);
        setSelectAll(true);
      } else {
        // Handle the case where filteredEstimates is not an array
        console.error("filteredEstimates is not an array");
      }
    } else {
      // Deselect all rows
      setSelectedInvoicesId([]);
      setSelectAll(false);
    }
  };
  const handleSelectAll = async (event) => {
    event.stopPropagation(); // Prevent any unwanted navigation
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
      isTemplate,
      agingStatusId
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
      isTemplate,
      agingStatusId
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
    isTemplate,
    agingStatusId
  ]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  // Permissions for Invoices
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const navigateInvoice = (invoice) => {
    if (!canEdit || loggedInUser.userRole == "2") {
      navigate(`/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`);
      return;
    }
    navigate(`/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`);
  };

  return (
    <>
      {!customerform && <InvoiceTitleBar />}
      <div className={customerform ? "mt-3" : "container-fluid"}>
        <div className="row">
          <div className="col-xl-12" id="bootstrap-table2">
            <div className={customerform ? "" : "card"}>
              <>
                <div className="card-header flex-wrap d-flex justify-content-between  border-0">
                  <div style={{ display: "flex", gap: "1.5em", alignItems: "center" }}>
                    <TextField
                      label="Search Invoices"
                      variant="standard"
                      size="small"
                      style={{ width: customerform ? "10em" : "12em" }}
                      fullWidth
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {/* <CalendarMonthOutlinedIcon /> */}
                    <TextField
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
                    {/* <CalendarMonthOutlinedIcon /> */}
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
                    />
                  </div>
                  <div className=" pe-2 d-flex align-items-center">
                    {customerform && apiResponses.length > 0 && (
                      <PDFDownloadLink
                        document={
                          <InvoicePDFMuliple
                            data={apiResponses.map(item => ({
                              ...item,
                              companyInfo: companyInfo,
                              SelectedCompany:
                                loggedInUser.CompanyId === 2
                                  ? loggedInUser.CompanyName
                                  : "EarthCo Landscape",
                                  dynamicColorAndLogo: dynamicColorAndLogo,
                                IncludePrices:true
                            }))}
                          />
                        }
                        fileName={`Invoices.pdf`}
                      >
                        {({ loading, error }) => (


                          invoiceLoading ? (
                            <span className="btn btn-sm" style={{ padding: "8px 10px", marginRight: "10px", marginTop: "2px", border: "1px solid #c2c2c2" }}>
                                <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} size={20} />
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
                    )}
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
                   
                    <Authorization allowTo={[1, 4, 5, 6]} hide>
                       <div className="me-2 " >
                        {selectedInvoicesId?.length >= 1 && (
                          <DeleteAllModal
                       clearSelection={setSelectedInvoicesId}
                          invoice
                            selectedItems={selectedInvoicesId}
                            endpoint="Invoice/DeleteAllSelectedInvoice"
                            disabled={!canDelete}
                            tooltipMessage="You don't have permission to delete invoices"
                            bindingFunction={(
                              search = "",
                              page = 1,
                              isAsc = false
                            ) =>
                              fetchFilterInvoice()
                            }
                          />
                        )}
                      </div>
                     {statusId == 2 && (
                      <FormControl className="me-3" variant="outlined">
                        <Select
                          labelId="aging-status-label"
                          displayEmpty
                          variant="outlined"
                          value={agingStatusId}
                          onChange={(e) => {
                            setAgingStatusId(e.target.value);
                          }}
                          size="small"
                          renderValue={
                            agingStatusId !== 0 && agingStatusId !== "" 
                              ? undefined 
                              : () => <span>All Aging Ranges</span>
                          }
                        >
                          <MenuItem value={0}>
                            <span>All Aging Ranges</span>
                          </MenuItem>
                          <MenuItem value={'1-30'}>1-30</MenuItem>
                          <MenuItem value={'31-60'}>31-60</MenuItem>
                          <MenuItem value={'61-90'}>61-90</MenuItem>
                          <MenuItem value={'91-0'}>91+</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                      <FormControl className=" me-3" variant="outlined">
                        <Select
                          labelId="customer-type-label"
                          variant="outlined"
                          value={statusId}
                          onChange={(e) => {
                            setStatusId(e.target.value);
                          }}
                          size="small"
                        >
                          <MenuItem value={0}>All</MenuItem>
                          <MenuItem value={1}>Due</MenuItem>
                          <MenuItem value={2}>Overdue</MenuItem>

                          <MenuItem value={3}>Paid</MenuItem>
                          <MenuItem value={4}>Partilly Paid</MenuItem>
                          <MenuItem value={8}>Voided</MenuItem>
                        </Select>
                      </FormControl>
                    </Authorization>
                    <Authorization allowTo={[2]} hide>
                      <FormControl className=" me-3" variant="outlined">
                        <Select
                          labelId="customer-type-label"
                          variant="outlined"
                          value={statusId}
                          onChange={(e) => {
                            setStatusId(e.target.value);
                          }}
                          size="small"
                        >
                          <MenuItem value={0}>All</MenuItem>
                          <MenuItem value={1}>Due</MenuItem>
                          <MenuItem value={2}>Overdue</MenuItem>
                        </Select>
                      </FormControl>
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
                        <ListSubheader>Sort By</ListSubheader>
                        <MenuItem
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              Profit: true,
                              issueDate: true,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          <>
                            <Checkbox checked={orderBy.issueDate} /> Issue Date
                          </>{" "}
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setOrderBy((prevSate) => ({
                              ...prevSate,
                              Profit: true,
                              issueDate: false,
                            }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          {" "}
                          <>
                            <Checkbox checked={!orderBy.issueDate} /> Created
                            Date
                          </>
                        </MenuItem>
                      </Select>
                    </FormControl>
                    {!customerform && (
                      canCreate ? (
                        <AddButton
                          onClick={() => {
                            navigate(`/invoices/add-invoices`);
                          }}
                        >
                          Add Invoice
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
                              Add Invoice
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
                        <TableRow className="invoice-tbl-alignment">
                          <Authorization allowTo={[1, 4, 5, 6]} hide>
                            {!customerform && (
                              <TableCell>
                                {canDelete ? (
                                  <Checkbox
                                    checked={selectAll}
                                    onChange={handleSelectAllInvoices}
                                  />
                                ) : (
                                  <Tooltip title="You don't have access" arrow>
                                    <span>
                                      <Checkbox checked={selectAll} onChange={handleSelectAllInvoices} disabled />
                                    </span>
                                  </Tooltip>
                                )}
                              </TableCell>
                            )}
                            {customerform && (
                              <TableCell>
                                {canDelete ? (
                                  <Checkbox checked={selectAll} onChange={handleSelectAll} />
                                ) : (
                                  <Tooltip title="You don't have access" arrow>
                                    <span>
                                      <Checkbox checked={selectAll} onChange={handleSelectAll} disabled />
                                    </span>
                                  </Tooltip>
                                )}
                              </TableCell>
                            )}
                          </Authorization>
                          <TableCell>Invoice</TableCell>
                          <TableCell>Issue Date</TableCell>
                          <TableCell>Customer</TableCell>

                          <TableCell>Estimate#</TableCell>
                        {loggedInUser.userRole != "2"&&<TableCell>Bill#</TableCell>}  
                          <TableCell sx={{ width: 210 }}>Status</TableCell>
                          <Authorization allowTo={[1, 4, 5, 6]} hide>
                            <TableCell>
                              <TableSortLabel
                                // active={orderBy.Profit}
                                active={true}
                                direction={isAscending ? "asc" : "desc"}
                                onClick={() => {
                                  setOrderBy((prevSate) => ({
                                    ...prevSate,
                                    Profit: true,
                                    issueDate: false,
                                  }));
                                  setIsAscending(!isAscending);
                                }}
                              >
                                Profit%
                              </TableSortLabel>
                            </TableCell>
                          </Authorization>
                          <TableCell className="text-end">Balance</TableCell>
                          <TableCell className="text-end">Total</TableCell>
                          {/* <TableCell>Status</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center">
                              <div className="center-loader">
                                <CircularProgress
                                    style={{ color: dynamicColorAndLogo.PrimeryColor }}
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
                              .map((invoice, index) => (
                                <TableRow
                                  className={`bill-tbl-alignment ${isRowSelected(invoice.InvoiceId)
                                      ? "selected-row"
                                      : ""
                                    }`}
                                  hover
                                  key={index}
                                  onClick={() => navigateInvoice(invoice)}
                                >
                                  {!customerform && (
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                      {canDelete ? (
                                        <Checkbox
                                          checked={selectedInvoicesId.includes(
                                            invoice.InvoiceId
                                          )}
                                          onChange={(e) =>
                                            handleCheckboxInvoicesChange(e, invoice.InvoiceId)
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : (
                                        <Tooltip title="You don't have access" arrow>
                                          <span>
                                            <Checkbox
                                              checked={selectedInvoicesId.includes(invoice.InvoiceId)}
                                              onChange={(e) => handleCheckboxInvoicesChange(e, invoice.InvoiceId)}
                                              onClick={(e) => e.stopPropagation()}
                                              disabled
                                            />
                                          </span>
                                        </Tooltip>
                                      )}
                                    </TableCell>
                                  )}
                                  <Authorization allowTo={[1, 4, 5, 6]} hide>
                                    {customerform && (
                                      <TableCell onClick={(e) => e.stopPropagation()}>
                                        {canDelete ? (
                                          <Checkbox
                                            checked={selectedInvoices.includes(
                                              invoice.InvoiceId
                                            )}
                                            onChange={(e) =>
                                              handleCheckboxChange(e, invoice)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        ) : (
                                          <Tooltip title="You don't have access" arrow>
                                            <span>
                                              <Checkbox
                                                checked={selectedInvoices.includes(invoice.InvoiceId)}
                                                onChange={(e) => handleCheckboxChange(e, invoice)}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled
                                              />
                                            </span>
                                          </Tooltip>
                                        )}
                                      </TableCell>
                                    )}
                                  </Authorization>
                                  <TableCell
                                    onClick={() => {
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                      );
                                    }}
                                  >
                                    {invoice.InvoiceNumber}
                                  </TableCell>
                                  <TableCell
                                    onClick={() => {
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                      );
                                    }}
                                    style={{ whiteSpace: "nowrap" }}
                                  >
                                    {TblDateFormat(invoice.IssueDate)}
                                  </TableCell>
                                  <TableCell
                                  // onClick={() => {
                                  //   navigate(
                                  //     `/invoices/add-invoices?id=${invoice.InvoiceId}`
                                  //   );
                                  // }}
                                  >
                                    {invoice.CustomerDisplayName}{" "}
                                    <NavLink
                                      to={`/customers/add-customer?id=${invoice.CustomerId}`}
                                      target="_blank"
                                    >
                                      <ArrowOutwardIcon
                                        style={{ fontSize: 14 }}
                                      />
                                    </NavLink>
                                  </TableCell>

                                  <TableCell
                                    onClick={() => {
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                      );
                                    }}
                                  >
                                    {invoice.EstimateNumber}
                                  </TableCell>
                                { loggedInUser.userRole != "2"&& <TableCell
                                    style={{ width: "10%" }}
                                    onClick={() => {
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                      );
                                    }}
                                  >
                                    {ComaSpacing(invoice.BillNumber)}
                                  </TableCell>}
                                  <TableCell
                                    sx={{ width: 210 }}
                                    className="nowrap"
                                    onClick={() => {
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                      );
                                    }}
                                  >
                                    {getDueDateStatus(invoice.Status)}
                                  </TableCell>
                                  <TableCell
                                    onClick={() => {
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/invoices/invoice-preview?id=${invoice.InvoiceId}&customerId=${invoice.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                      );
                                    }}
                                  >
                                    {invoice.ProfitPercentage?.toFixed(2)}
                                  </TableCell>
                                  <Authorization allowTo={[1, 4, 5, 6]} hide>
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
                                          `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                        );
                                      }}
                                    >
                                      ${formatAmount(invoice.BalanceAmount)}
                                    </TableCell>
                                  </Authorization>
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
                                        `/invoices/add-invoices?id=${invoice.InvoiceId}&isTemplate=false`
                                      );
                                    }}
                                  >
                                    ${formatAmount(invoice.TotalAmount)}
                                  </TableCell>
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
                              ))}
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

export default Invoices;
