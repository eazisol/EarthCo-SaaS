import {
  Autocomplete,
  Checkbox,
  CircularProgress,
  createTheme,
  FormControl,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ThemeProvider,
  TableSortLabel,
} from "@mui/material";
import TitleBar from "../TitleBar";
import { GrDocumentPerformance } from "react-icons/gr";
import { useContext, useEffect, useState } from "react";
import useGetApi from "../Hooks/useGetApi";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import axios from "axios";
import InvoicePDF from "../Invoice/InvoicePDF";
import { DataContext } from "../../context/AppData";
import { pdf } from "@react-pdf/renderer";
import RecurringTablePdf from "./RecurringBillingPdf";
export const RecurringTable = () => {
  const { loggedInUser, companyInfo, setselectedPdf, setSelectedImages, dynamicColorAndLogo } =
    useContext(DataContext);
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

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const { getData } = useGetApi();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const years = Array.from(
    { length: currentYear - 2009 },
    (_, index) => currentYear - index
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [fetchedInvoiceData, setFetchedInvoiceData] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [selectManager, setSelectManager] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [selectAll, setSelectAll] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [tablePage, setTablePage] = useState(0);
  const [sortDirection, setSortDirection] = useState("asc");
  const [customerSortDirection, setCustomerSortDirection] = useState("asc");
  const [isAscending, setIsAscending] = useState(false);
  const [isCustomerSort, setIsCustomerSort] = useState(false);
  const [isAmountSort, setIsAmountSort] = useState(false);
  const [amountSortOrder, setAmountSortOrder] = useState("");
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
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

  const handleCheckboxChange = async (invoiceNumber, invoiceData) => {
    const isSelected = selectedInvoices.includes(invoiceNumber);
    if (isSelected) {
      // Deselect: remove from states
      setSelectedInvoices((prev) =>
        prev.filter((inv) => inv !== invoiceNumber)
      );
      setSelectedInvoiceIds((prev) =>
        prev.filter((inv) => inv.invoiceId !== invoiceData.InvoiceId)
      );
    } else {
      // Select: add to states
      setSelectedInvoices((prev) => [...prev, invoiceNumber]);
      setSelectedInvoiceIds((prev) => [
        ...prev,
        {
          invoiceId: invoiceData.InvoiceId,
          editDate: invoiceData.EditDate,
          pdfgeneratorDate: invoiceData.PDFGeneratedDate,
          email: invoiceData.email,
          customerId: invoiceData.customerId,
        },
      ]);
    }
  };

  const isInvoiceSelected = (invoiceNumber) => {
    return selectedInvoices.includes(invoiceNumber);
  };
  const handleSelectAllChange = async () => {
    if (selectAll) {
      // Deselect all
      setSelectedInvoices([]);
      setSelectedInvoiceIds([]);
      setFetchedInvoiceData([]);
      setPdfFiles([]);
      setSelectAll(false);
    } else {
      // Select all invoices
      const allInvoiceNumbers = customersData.map((c) => c.InvoiceNumber);
      const allInvoiceIds = customersData.map((c) => ({
        invoiceId: c.InvoiceId,
        editDate: c.EditDate,
        pdfgeneratorDate: c.PDFGeneratedDate,
        email: c.email,
        customerId: c.customerId,
      }));

      setSelectedInvoices(allInvoiceNumbers);
      setSelectedInvoiceIds(allInvoiceIds);

      setSelectAll(true);
      setLoading(true);

      setLoading(false);
    }
  };

  const isEmailSelected = (email) => {
    return selectedEmails.split(",").includes(email);
  };
  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };
  // Now the data will be shown in the same order as received from backend (no extra sorting/grouping on frontend)
  const getRecurringBilling = async (year, search, isAscending, isCustomerSort, isAmountSort,selectManager) => {
    setLoading(true);
    getData(
      `/KPI/GetMonthlysReportForCustomer?Year=${year}&search=${search}&isAscending=${isAscending}&isCustomerSort=${isCustomerSort}&isAmountSort=${isAmountSort}&RegionalManagerId=${selectManager}`,
      (data) => {
        // Map to store customer data by CustomerId for monthlyAmounts aggregation
        const customerMap = {};

        // Month names for mapping
        const monthNames = [
          "",
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        // Prepare a list to keep the order as backend sends
        const orderedCustomers = [];

        data.forEach((item) => {
          const key = item.CustomerId;
          const monthName = monthNames[item.Month];

          // If customer not in map, add and push to orderedCustomers
          if (!customerMap[key]) {
            customerMap[key] = {
              customerId: item.CustomerId,
              name: item.DisplayName,
              email: item.Email,
              monthlyAmounts: {},
              InvoiceNumber: item.InvoiceNumber,
              InvoiceId: item.InvoiceId,
              latestMonth: item.Month,
              PDFGeneratedDate: item.PDFGeneratedDate,
              EditDate: item.EditDate,
              isEmailed: item.isEmailed
            };
            orderedCustomers.push(customerMap[key]);
          }

          // Aggregate amount for the month
          if (!customerMap[key].monthlyAmounts[monthName]) {
            customerMap[key].monthlyAmounts[monthName] = {
              amount: 0,
              invoiceIds: [],
            };
          }

          customerMap[key].monthlyAmounts[monthName].amount += item.TotalAmount;
          customerMap[key].monthlyAmounts[monthName].invoiceIds.push(item.InvoiceId);

          // For InvoiceNumber / InvoiceId - keep latest month one
          if (item.Month > customerMap[key].latestMonth) {
            customerMap[key].InvoiceNumber = item.InvoiceNumber;
            customerMap[key].InvoiceId = item.InvoiceId;
            customerMap[key].PDFGeneratedDate = item.PDFGeneratedDate;
            customerMap[key].EditDate = item.EditDate;
            customerMap[key].latestMonth = item.Month;
            customerMap[key].isEmailed = item.isEmailed;
          }
        });

        // Use the orderedCustomers array to preserve backend order
        setCustomersData(orderedCustomers);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
      }
    );
  };
  const downloadCSV = (data) => {
    // Define the months in order
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    const formatAmount = (amount) => {
      return amount ? amount.toFixed(2) : "";
    };

    // Helper to escape CSV fields that contain commas, quotes, or newlines
    const escapeCSV = (field) => {
      if (typeof field === "string" && (field.includes(",") || field.includes('"') || field.includes('\n'))) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    // Header row: Customer Name, Jan, Feb, ..., Dec
    const csvHeader = ["Customer Name", ...months];

    // Data rows
    const csvRows = data.map((row) => {
      // For each month, get the amount if exists, else empty string
      const monthAmounts = months.map((month) => {
        const monthData = row.monthlyAmounts[month];
        return monthData ? formatAmount(monthData.amount) : "";
      });
      // Escape the customer name to handle commas (e.g., "OC131 - Pacifica, San Clemente")
      return [escapeCSV(row.name), ...monthAmounts];
    });

    const csvContent = [
      csvHeader,
      ...csvRows
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "RecurringBilling.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Amount sort controlled via dropdown now
  const handleAmountSortChange = (value) => {
    setAmountSortOrder(value);
    if (!value) {
      setIsAmountSort(false);
      return;
    }
    setIsCustomerSort(false);
    setIsAmountSort(true);
    setSortDirection(value);
    setIsAscending(value === "asc");
  };

  const handleSortByName = () => {
    setIsCustomerSort(true);
    setIsAmountSort(false);
    setCustomerSortDirection(prev => prev === "asc" ? "desc" : "asc");
    setIsAscending(prev => !prev);
  };

  // Server-side search: rely solely on API response in customersData
  const selectedEmails = customersData
    .filter((c) => selectedInvoices.includes(c.InvoiceNumber))
    .map((c) => c.email)
    .join(",");

  const selectedInvoiceNumbers = selectedInvoices.join(",");
  const generatePdfForInvoice = async (invoiceData) => {
    const formData = invoiceData;
    const blob = await pdf(
      <RecurringTablePdf
        data={{
          ...formData,
          companyInfo: companyInfo,
        }}
      />
    ).toBlob();

    return new File([blob], `Invoice.pdf`, {
      type: "application/pdf",
    });
  };
  const fetchInvoiceById = async (invoiceId) => {
    const exists = fetchedInvoiceData.some(
      (inv) => inv.Data?.InvoiceId === invoiceId
    );
    if (exists) {
      return fetchedInvoiceData.find(
        (inv) => inv.Data?.InvoiceId === invoiceId
      );
    }

    try {
      const res = await axios.get(
        `${baseUrl}/api/Invoice/GetInvoice?id=${invoiceId}`,
        { headers }
      );
      setFetchedInvoiceData((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      return null;
    }
  };
  useEffect(() => {
    const processInvoices = async () => {
      for (const item of customersData) {
        const { InvoiceId, EditDate, PDFGeneratedDate, email, customerId } =
          item;
        const invoiceEditDate = EditDate ? new Date(EditDate) : null;
        const invoicePdfDate = PDFGeneratedDate
          ? new Date(PDFGeneratedDate)
          : null;

        if (
          invoiceEditDate > invoicePdfDate ||
          (invoiceEditDate == null && invoicePdfDate == null)
        ) {
          const invoiceData = await fetchInvoiceById(InvoiceId);
          const pdfFile = await generatePdfForInvoice(invoiceData);
          const invoiceNumberFromAPI = invoiceData?.Data?.InvoiceNumber;
          await uploadInvoicePdf(InvoiceId, pdfFile, invoiceNumberFromAPI);
        }
      }
    };

    if (customersData && customersData.length > 0) {
      processInvoices();
    }
  }, [customersData]);
  const fetchStaffList = async () => {
    getData(
      `/Staff/GetStaffList`,
      (data) => {
        setStaffData(data);
      },
      (err) => {

      }
    );
  };

  useEffect(() => {
    fetchStaffList();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectManager(value);
  };
  useEffect(() => {
    getRecurringBilling(selectedYear, search, isAscending, isCustomerSort, isAmountSort,selectManager);
  }, [selectedYear, search, isAscending, isCustomerSort, isAmountSort,selectManager]);



  const handleAutocompleteChange = (
    fieldName,
    valueProperty,
    event,
    newValue
  ) => {
    const simulatedEvent = {
      target: {
        name: fieldName,
        value: newValue ? newValue[valueProperty] : "",
      },
    };
    handleInputChange(simulatedEvent);
  };
  // Ensure pagination resets when server-side query inputs change
  useEffect(() => {
    setTablePage(0);
  }, [search, selectedYear, isAscending, isCustomerSort, isAmountSort]);

  return (
    <>
      <TitleBar
        icon={<ReceiptLongIcon fontSize="large" />}
        title={"Monthly Maintenance Billings"}
      ></TitleBar>
      <div className="container-fluid">
        <div className="row">
          <ThemeProvider theme={theme}>
            <div className="card">
              <div
                className="card-header border-0 d-flex justify-content-between align-items-center flex-wrap"
                style={{ gap: "10px", marginRight: "9px" }}
              >
                {/* LEFT SIDE: Search + Batch Actions */}
                <div
                  className="d-flex align-items-center gap-2 flex-wrap"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <TextField
                    className="mt-2"
                    label="Search Customer"
                    variant="standard"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ minWidth: 220 }}
                  />

                  {selectedEmails && (
                    <FormControl
                      variant="outlined"
                      className="mt-2"
                      style={{ minWidth: 150 }}
                    >
                      <Select
                        labelId="customer-type-label"
                        variant="outlined"
                        value={0}
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
                        <MenuItem value={0}>Batch Actions</MenuItem>
                        <MenuItem
                          value={1}
                          onClick={() => {
                            navigate(
                              `/send-mail?title=Recurring Bill&mail=${selectedEmails}&number=${selectedInvoiceNumbers}&invoiceIds=${encodeURIComponent(
                                JSON.stringify(selectedInvoiceIds)
                              )}`
                            );
                            setselectedPdf([]);
                            setSelectedImages([]);
                          }}
                        >
                          Send Mail
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </div>

                {/* RIGHT SIDE: CSV, Manager, Sort, Year */}
                <div
                  className="d-flex align-items-center gap-2 flex-wrap justify-content-end"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <button
                    className="btn btn-sm btn-outline-secondary custom-csv-link"
                    disabled={loading}
                    onClick={() => downloadCSV(customersData)}
                  >
                    {loading ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa fa-download"></i>
                    )}{" "}
                    CSV
                  </button>

                  <div style={{ minWidth: 200 }}>
                    <Autocomplete
                      id="staff-autocomplete"
                      size="small"
                      options={staffData.filter(
                        (staff) =>
                          staff.Role === "Regional Manager" ||
                          staff.Role === "Account Manager" ||
                          staff?.isSuperAdmin
                      )}
                      getOptionLabel={(option) =>
                        option.FirstName + " " + option.LastName || ""
                      }
                      value={
                        staffData.find((staff) => staff.UserId === selectManager) || null
                      }
                      onChange={(event, newValue) =>
                        handleAutocompleteChange("selectManager", "UserId", event, newValue)
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.UserId === value.selectManager
                      }
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div className="customer-dd-border">
                            <div className="row">
                              <div className="col-md-auto">
                                <h6 className="pb-0 mb-0">
                                  {option.FirstName} {option.LastName}
                                </h6>
                              </div>
                              <div className="col-md-auto">
                                <small>({option.Role})</small>
                              </div>
                            </div>
                          </div>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          placeholder="Choose..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": {
                                borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              },
                              "&:hover fieldset": {
                                borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </div>

                  <FormControl style={{ minWidth: 130 }}>
                    <Select
                      size="small"
                      value={amountSortOrder}
                      displayEmpty
                      renderValue={(selected) =>
                        !selected ? "Sort by Amount" : selected === "asc" ? "Low to High" : "High to Low"
                      }
                      onChange={(e) => handleAmountSortChange(e.target.value)}
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
                      <MenuItem value="">Sort by Amount</MenuItem>
                      <MenuItem value="asc">Low to High</MenuItem>
                      <MenuItem value="desc">High to Low</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl style={{ minWidth: 80 }}>
                    <Select
                      size="small"
                      name="Year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
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
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>


              <div className="card-body pt-0">
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead className="table-header">
                      <TableRow className="material-tbl-alignment">
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAllChange}
                            sx={{
                              color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              "&.Mui-checked": {
                                color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                              },
                            }}
                            inputProps={{
                              "aria-label": "select all customers",
                            }}
                          />
                        </TableCell>
                        <TableCell>Customer Name   <TableSortLabel
                          active={true}
                          direction={customerSortDirection}
                          onClick={() => handleSortByName(customerSortDirection)}
                        /></TableCell>
                        {months.map((month, idx) => {
                          return (
                            <TableCell key={month} align="center">
                              {`${month} $`}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={months.length + 3} align="center">
                            <CircularProgress size={30} style={{ color: dynamicColorAndLogo.PrimeryColor }} />
                          </TableCell>
                        </TableRow>
                      ) : customersData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={months.length + 3} align="center">
                            No records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        customersData
                          .slice(
                            tablePage * rowsPerPage,
                            tablePage * rowsPerPage + rowsPerPage
                          )
                          .map((customer, index) => {
                            return (
                              <TableRow key={index} hover>
                                <TableCell
                                  padding="checkbox"
                                  style={{ padding: "0px 0px 0px 5px" }}
                                >
                                  <Checkbox
                                    checked={isInvoiceSelected(
                                      customer.InvoiceNumber
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        customer.InvoiceNumber,
                                        customer
                                      )
                                    }
                                    sx={{
                                      color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                      "&.Mui-checked": {
                                        color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                                      },
                                    }}
                                    inputProps={{
                                      "aria-label": `select customer ${customer.name}`,
                                    }}
                                    disabled={loading}
                                  />
                                </TableCell>
                                <TableCell style={{ padding: "8px 5px" }}>
                                  {customer.name}{" "}
                                  <NavLink
                                    to={`/customers/add-customer?id=${customer.customerId}`}
                                    target="_blank"
                                  >
                                    <ArrowOutwardIcon
                                      style={{ fontSize: 14 }}
                                    />
                                  </NavLink>{" "}
                                </TableCell>
                                {months.map((month, idx) => {
                                  const currentMonthIdx = new Date().getMonth();
                                  const currentMonthName = months[currentMonthIdx];
                                  const monthData = customer.monthlyAmounts?.[month];
                                  const amount = monthData?.amount || 0;
                                  const invoiceIds = monthData?.invoiceIds || [];
                                  const prevMonthIdx = currentMonthIdx - 1;
                                  const prevMonthName = prevMonthIdx >= 0 ? months[prevMonthIdx] : null;
                                  let highlightYellow = false;
                                  if (month === currentMonthName && prevMonthName) {
                                    const prevAmount = customer.monthlyAmounts?.[prevMonthName]?.amount || 0;
                                    if (amount !== prevAmount) {
                                      highlightYellow = true;
                                    }
                                  }
                                  const isEmailed = customer.isEmailed;
                                  const shouldHighlight = isEmailed == 0 && month === currentMonthName;
                                  return (
                                    <TableCell
                                      key={month}
                                      align="right"
                                      style={{
                                        cursor: "pointer",
                                        backgroundColor: highlightYellow
                                          ? "#fffd78"
                                          : shouldHighlight
                                            ? "#FFEBEE"
                                            : "",
                                      }}
                                      onClick={() => {
                                        if (invoiceIds.length > 0) {
                                          navigate(
                                            `/invoices/add-invoices?id=${invoiceIds[0]}`
                                          );
                                        }
                                      }}
                                    >
                                      {amount.toLocaleString()}
                                      {amount > 0 && (
                                        <NavLink>
                                          <ArrowOutwardIcon
                                            style={{
                                              fontSize: 14,
                                              marginLeft: "2px",
                                            }}
                                          />
                                        </NavLink>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                    <TableFooter>
                      {!loading && (
                        <TableRow>
                          <TableCell />
                          <TableCell className="p-0">
                            <p
                              className="total-amount"
                              style={{ width: "134px" }}
                            >
                              Total
                            </p>
                          </TableCell>
                          {months.map((month) => {
                            const total = customersData.reduce(
                              (sum, customer) => {
                                const value =
                                  parseFloat(
                                    customer.monthlyAmounts?.[month]?.amount
                                  ) || 0;
                                return sum + value;
                              },
                              0
                            );
                            return (
                              <TableCell key={month} align="right">
                                <p className="total-amount">
                                  ${total.toLocaleString()}
                                </p>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      )}
                    </TableFooter>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[100, 200, 300]}
                  component="div"
                  count={customersData.length}
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
          </ThemeProvider>
        </div>
      </div>
    </>
  );
};
