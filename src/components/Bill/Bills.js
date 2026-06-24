import React, { useContext, useEffect, useState, useCallback } from "react";
import AddBill from "./AddBill";
import BillTitle from "./BillTitle";
import axios from "axios";
import Cookies from "js-cookie";
import { Delete, Create, Visibility } from "@mui/icons-material";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  TextField,
  TablePagination,
  TableSortLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import useFetchBills from "../Hooks/useFetchBills";
import { NavLink, useNavigate } from "react-router-dom";
import { DataContext } from "../../context/AppData";
import formatDate from "../../custom/FormatDate";
import TblDateFormat from "../../custom/TblDateFormat";
import AddButton from "../Reusable/AddButton";
import formatAmount from "../../custom/FormatAmount";
import debounce from "lodash.debounce";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const Bills = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDate = new Date();
  const { PurchaseOrderTypeId, billYear, billMonth, dynamicColorAndLogo } = useContext(DataContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    parseInt(searchParams.get("rowsPerPage")) || 100
  );
  const [startDateFilter, setStartDateFilter] = useState(
    searchParams.get("startDateFilter") || null
  );
  const [endDateFilter, setEndDateFilter] = useState(
    formatDate(searchParams.get("endDateFilter") || currentDate)
  );
  const {
    billList,
    loading,

    billError,
    fetchFilterBills,
    filteredBillsList,
    totalRecords,
  } = useFetchBills();
  useEffect(() => {
    if (billMonth && billYear) {
      const firstDay = new Date(billYear, billMonth - 1, 1);
      const lastDay = new Date(billYear, billMonth, 0); // 0th day of next month = last day of current month

      setStartDateFilter(formatDate(firstDay));
      setEndDateFilter(formatDate(lastDay));
    }
  }, [billMonth, billYear]);
  const navigate = useNavigate();
  // Permissions for Bills (/bills)
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  const [activeSortField, setActiveSortField] = useState("");

  const [tablePage, setTablePage] = useState(
    parseInt(searchParams.get("tablePage")) || 0
  );
  const [searchBill, setSearchBill] = useState(
    searchParams.get("searchBill") || ""
  );

  // const [orderBy, setOrderBy] = useState({
  //   Profit: searchParams.get("isAscending") === "true",
  //   issueDate: searchParams.get("isAscending") === "true",
  // });
  // const [orderBy, setOrderBy] = useState({
  //   Profit: searchParams.get("isProfit") === "true",
  //   RegionalManager: searchParams.get("isRegionalManager") === "true",
  //   Tags: searchParams.get("isTag") === "true",
  // });
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "Profit");

  const [isAscending, setIsAscending] = useState(
    searchParams.get("isAscending") === "true"
  );
  const [isProfit, setIsProfit] = useState(
    searchParams.get("isProfit") === "true"
  );

  const [isRegionalManager, setIsRegionalManager] = useState(
    searchParams.get("isRegionalManager") === "true"
  );

  const [isTag, setIsTag] = useState(searchParams.get("isTag") === "true");

  const debouncedGetFilteredBills = useCallback(
    debounce(fetchFilterBills, 500),
    []
  );

  useEffect(() => {
    debouncedGetFilteredBills(
      searchBill,
      tablePage + 1,
      rowsPerPage,
      isAscending,
      startDateFilter,
      endDateFilter,
      isProfit,
      PurchaseOrderTypeId,
      isTag,
      isRegionalManager
    );
    setSearchParams({
      searchBill,
      tablePage,
      rowsPerPage,
      isAscending,
      startDateFilter,
      endDateFilter,
      isProfit,
      PurchaseOrderTypeId,
      isRegionalManager,
      isTag,
    });
  }, [
    searchBill,
    tablePage,
    rowsPerPage,
    isAscending,
    startDateFilter,
    endDateFilter,
    isProfit,
    PurchaseOrderTypeId,
    isRegionalManager,
    isTag,
  ]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };
  const downloadCSV = (data) => {
    const formatAmount = (amount) => {
      return amount ? amount?.toFixed(2) : "";
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    const csvContent = [
      [
        "Vendor",
        "Customer",
        "Invoice#",
        "Bill#",
        "PO#",
        "Estimate Status",
        "Inv Created Date",
        "Bill Created Date",
        "Inv Amount",
        "Bill Amount",
        "Margin%",
        "Regional Manager",
        "Tags",
      ],
      ...data.map((row) => [
        `"${row.VendorDisplayName}"`,
        `"${row.CustomerDisplayName}"`,
        `"${row.tblInvoiceNumber}"`,
        `"${row.BillNumber}"`,
        `"${row.tblPurchaseOrderNumber}"`,
        `"${row.EstimateStatus}"`,
        `"${formatDate(row.InvoiceIssueDate)}"`,
        `"${formatDate(row.BillDate)}"`,
        `"${formatAmount(row.InvoiceTotalAmount)}"`,
        `"${formatAmount(row.Amount)}"`,
        `"${formatAmount(row.MarginPercentage)}"`,
        `"${row.ReginalManagerFirstName} ${row.ReginalManagerLastName}"`,
        `"${row.Tag}"`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Bills.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      <BillTitle />
      <div className="container-fluid">
        <div className="card " id="bootstrap-table2">
          <>
            <div className="card-header flex-wrap d-flex justify-content-between  border-0">
              <div className="d-flex align-items-end">
                <TextField
                  label="Search Bill"
                  variant="standard"
                  size="small"
                  value={searchBill}
                  onChange={(e) => setSearchBill(e.target.value)}
                />
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
                />
              </div>
              <div className=" me-2">
                <button
                  className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                  disabled={loading}
                  onClick={() => {
                    // getAllEstimate(estmRecords.totalRecords, (data) => {
                    //   downloadCSV(data);
                    // });
                    downloadCSV(filteredBillsList);
                  }}
                >
                  {loading ? (
                    <i className="fa fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa fa-download"></i>
                  )}{" "}
                  CSV
                </button>
                {/* <FormControl className="  me-2" variant="outlined">
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
                </FormControl> */}
                <FormControl className="me-2" variant="outlined">
                  <Select
                    labelId="customer-type-label"
                    variant="outlined"
                    // Show only when any sort is active, else show descending by default
                    value={
                      isProfit || isRegionalManager || isTag
                        ? isAscending
                        : false // default to descending
                    }
                    onChange={() => {
                      // Only allow toggle if a sort is active
                      if (isProfit || isRegionalManager || isTag) {
                        setIsAscending(!isAscending);
                      }
                    }}
                    size="small"
                  >
                    <MenuItem value={true}>Ascending</MenuItem>
                    <MenuItem value={false}>Descending</MenuItem>
                  </Select>
                </FormControl>

                {canCreate ? (
                  <AddButton
                    onClick={() => {
                      navigate(`/bills/add-bill`);
                    }}
                  >
                    Add Bill
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
                        Add Bill
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
                      <TableCell>Vendor</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Invoice#</TableCell>
                      <TableCell>Bill#</TableCell>
                      <TableCell>PO#</TableCell>
                      <TableCell>Estimate Status</TableCell>
                      <TableCell>Inv Created Date</TableCell>
                      <TableCell>Bill Created Date</TableCell>
                      <TableCell className="text-end">Inv Amount</TableCell>
                      <TableCell>Bill Amount</TableCell>
                      {/* <TableCell>Margin%</TableCell> */}
                      {/* <TableCell>
                        <TableSortLabel
                          hideSortIcon={false}
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
                          Margin%
                        </TableSortLabel>
                      </TableCell> */}
                      <TableCell>
                        <TableSortLabel
                          hideSortIcon={false}
                          active={true}
                          direction={
                            sortBy === "Profit" && isAscending ? "asc" : "desc"
                          }
                          onClick={() => {
                            setSortBy("Profit");
                            setIsProfit(true);
                            setIsRegionalManager(false);
                            setIsTag(false);
                            setIsAscending(
                              sortBy === "Profit" ? !isAscending : true
                            );
                          }}
                        >
                          Margin%
                        </TableSortLabel>
                      </TableCell>

                      <TableCell>
                        <TableSortLabel
                          hideSortIcon={false}
                          active={true}
                          direction={
                            sortBy === "RegionalManager" && isAscending
                              ? "asc"
                              : "desc"
                          }
                          onClick={() => {
                            setSortBy("RegionalManager");
                            setIsRegionalManager(true);
                            setIsProfit(false);
                            setIsTag(false);
                            setIsAscending(
                              sortBy === "RegionalManager" ? !isAscending : true
                            );
                          }}
                        >
                          Regional Manager
                        </TableSortLabel>
                      </TableCell>

                      <TableCell>
                        <TableSortLabel
                          hideSortIcon={false}
                          active={true}
                          direction={
                            sortBy === "Tag" && isAscending ? "asc" : "desc"
                          }
                          onClick={() => {
                            setSortBy("Tag");
                            setIsTag(true);
                            setIsProfit(false);
                            setIsRegionalManager(false);
                            setIsAscending(
                              sortBy === "Tag" ? !isAscending : true
                            );
                          }}
                        >
                          Tags
                        </TableSortLabel>
                      </TableCell>

                      {/* <TableCell>
                        {" "}
                        <TableSortLabel
                          hideSortIcon={false}
                          // active={orderBy.Profit}
                          active={true}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            // setOrderBy((prevSate) => ({
                            //   ...prevSate,
                            //   Profit: true,
                            //   issueDate: false,
                            // }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Regional Manager
                        </TableSortLabel>
                      </TableCell> */}

                      {/* <TableCell>
                        {" "}
                        <TableSortLabel
                          hideSortIcon={false}
                          // active={orderBy.Profit}
                          active={true}
                          direction={isAscending ? "asc" : "desc"}
                          onClick={() => {
                            // setOrderBy((prevSate) => ({
                            //   ...prevSate,
                            //   Profit: true,
                            //   issueDate: false,
                            // }));
                            setIsAscending(!isAscending);
                          }}
                        >
                          Tags
                        </TableSortLabel>
                      </TableCell> */}

                      {/* <TableCell align="center">Preview</TableCell> */}
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
                        {billError ? (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center">
                              No Record Found
                            </TableCell>
                          </TableRow>
                        ) : null}
                        {filteredBillsList
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((bill) => (
                            <TableRow
                              className="bill-tbl-alignment"
                              onClick={() => {
                                const path = canEdit
                                  ? `/bills/add-bill?id=${bill.BillId}`
                                  : `/bills/bill-preview?id=${bill.BillId}`;
                                navigate(path);
                              }}
                              hover
                              key={bill.BillId}
                            >
                              <TableCell style={{ minWidth: "159px" }}>
                                {bill.VendorDisplayName}
                              </TableCell>
                              <TableCell style={{ minWidth: "159px" }}>
                                {bill.CustomerDisplayName}
                              </TableCell>
                              <TableCell>{bill.tblInvoiceNumber}</TableCell>
                              <TableCell>{bill.BillNumber}</TableCell>
                              <TableCell>
                                {bill.tblPurchaseOrderNumber}
                              </TableCell>
                              <TableCell>
                                <span
                                  style={{
                                    backgroundColor: bill.EstimatrStatusColor,
                                  }}
                                  className="badge badge-pill  span-hover-pointer"
                                >
                                  {bill.EstimateStatus}
                                </span>
                              </TableCell>
                              <TableCell>
                                {TblDateFormat(bill.InvoiceIssueDate)}
                              </TableCell>
                              <TableCell>
                                {TblDateFormat(bill.BillDate)}
                              </TableCell>
                              <TableCell className="text-end ">
                                ${formatAmount(bill.InvoiceTotalAmount)}
                              </TableCell>
                              <TableCell>
                                {" "}
                                ${formatAmount(bill.Amount)}
                              </TableCell>
                              <TableCell>
                                {formatAmount(bill.MarginPercentage)}
                              </TableCell>
                              <TableCell>{`${bill.ReginalManagerFirstName} ${bill.ReginalManagerLastName}`}</TableCell>
                              <TableCell>{bill.Tag}</TableCell>
                              {/* <TableCell align="center">
                            <Button
                              onClick={() => {
                                navigate(
                                  `/bills/bill-preview?id=${bill.BillId}`
                                );
                              }}
                            >
                              <Visibility />
                            </Button>
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
    </>
  );
};

export default Bills;
