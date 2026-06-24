import React, { useEffect, useState } from "react";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TextField,
  CircularProgress,
  Select,
  FormControl,
  MenuItem,
  Radio,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Button,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
const getEndDateForTenure = (tenure) => {
  const today = new Date();
  let endDate;

  const getWeekEndDate = (date, offset = 0) => {
    const currentDay = date.getDay();
    return new Date(date.setDate(date.getDate() - currentDay + 6 + offset));
  };

  const getMonthEndDate = (date, offset = 0) => {
    return new Date(date.getFullYear(), date.getMonth() + 1 + offset, 0);
  };

  const getQuarterEndDate = (date, offset = 0) => {
    const quarter = Math.floor((date.getMonth() + offset * 3) / 3);
    return new Date(date.getFullYear(), (quarter + 1) * 3, 0);
  };

  const getYearEndDate = (date, offset = 0) => {
    return new Date(date.getFullYear() + offset, 11, 31);
  };

  switch (tenure) {
    case "Today":
      endDate = today;
      break;
    case "Yesterday":
      endDate = new Date(today.setDate(today.getDate() - 1));
      break;
    case "This Week":
      endDate = getWeekEndDate(today);
      break;
    case "Last Week":
      endDate = getWeekEndDate(today, -7);
      break;
    case "This Week-to-date":
      endDate = today;
      break;
    case "Last Week-to-date":
      endDate = new Date(today.setDate(today.getDate() - 7));
      break;
    case "Next Week":
      endDate = getWeekEndDate(today, 7);
      break;
    case "Next 4 Weeks":
      endDate = new Date(today.setDate(today.getDate() + 28));
      break;
    case "This Month":
      endDate = getMonthEndDate(today);
      break;
    case "Last Month":
      endDate = getMonthEndDate(today, -1);
      break;
    case "This Month-to-date":
      endDate = today;
      break;
    case "Last Month-to-date":
      endDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      );
      break;
    case "Next Month":
      endDate = getMonthEndDate(today, 1);
      break;
    case "This Fiscal Quarter":
      endDate = getQuarterEndDate(today);
      break;
    case "Last Fiscal Quarter":
      endDate = getQuarterEndDate(today, -1);
      break;
    case "This Fiscal Quarter-to-date":
      endDate = today;
      break;
    case "Last Fiscal Quarter-to-date":
      endDate = new Date(today.setMonth(today.getMonth() - 3));
      break;
    case "Next Fiscal Quarter":
      endDate = getQuarterEndDate(today, 1);
      break;
    case "This Fiscal Year":
      endDate = getYearEndDate(today);
      break;
    case "Last Fiscal Year":
      endDate = getYearEndDate(today, -1);
      break;
    case "This Fiscal Year-to-date":
      endDate = today;
      break;
    case "Last Fiscal Year-to-date":
      endDate = new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      );
      break;
    case "Next Fiscal Year":
      endDate = getYearEndDate(today, 1);
      break;
    default:
      endDate = today;
  }

  return endDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

const formatDate = (dateString, reverse = true) => {
  if (!dateString) return ""; // Handle empty or undefined input

  // Split the dateString to get only the date part
  if (typeof dateString !== "string") {
    const formattedDate = dateString.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    console.log("formattedDate", formattedDate);
    return formattedDate;
  }
  const datePart = dateString?.split("T")[0];
  const date = new Date(datePart + "T00:00:00Z"); // Ensure it's treated as UTC

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Add leading zero if needed
  const day = String(date.getUTCDate()).padStart(2, "0"); // Add leading zero if needed

  if (reverse) {
    return `${year}-${month}-${day}`;
  } else {
    return `${month}/${day}/${year}`;
  }
};
const AgingReportTableTest = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("Customer");
  const currentDate = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    search: "",
    tenure: "Today",
    reportDate: currentDate,
    sort: "default",
    agingMethod: "Report_Date",
  });

  const [columnCount, setColumnCount] = useState(3);
  const [columns, setColumns] = useState([]);
  const [period, setPeriod] = useState(30);
  const [rows, setRows] = useState([
    { Customer: "John Doe", "0-30 days": 1500, "31-60 days": 1200 },
    {
      Customer: "Jane Smith",
      "0-31 days": 2000,
      "0-30 days": 2000,
      "31-60 days": 800,
      "91-120 days": 3543,
    },
    {
      Customer: "Sam Wilson",
      "0-1 days": 990,
      "0-30 days": 1000,
      "31-60 days": 600,
      "61-90 days": 2356,
      "91-120 days": 600,
    },
    { Customer: "Alice Johnson", "0-30 days": 500, "31-60 days": 700, "61-90 days": 400 },
    { Customer: "Bob Brown", "0-30 days": 1200, "31-60 days": 1500, "91-120 days": 300 },
    { Customer: "Charlie Davis", "0-30 days": 100, "31-60 days": 200, "61-90 days": 300 },
    { Customer: "Diana Evans", "0-30 days": 800, "31-60 days": 1000, "61-90 days": 700, "91-120 days": 400 },
    { Customer: "Eve Foster", "0-30 days": 300, "31-60 days": 400, "61-90 days": 500, "91-120 days": 600 },
    { Customer: "Frank Green", "0-30 days": 250, "31-60 days": 350, "61-90 days": 450 },
    { Customer: "Grace Hall", "0-30 days": 700, "31-60 days": 800, "61-90 days": 900 },
    { Customer: "Henry Irving", "0-30 days": 1100, "31-60 days": 1200, "91-120 days": 1300 },
  ]);

  const generateColumns = () => {
    const newColumns = [];
    let start = 0;

    for (let i = 0; i < columnCount; i++) {
      const end = start + period;
      if (i === 0) {
        newColumns.push(`${start}-${end} days`);
      } else {
        newColumns.push(`${start + 1}-${end} days`);
      }
      start = end;
    }

    setColumns(newColumns);
  };
  const [columnError, setColumnError] = useState(false);
  const handleColumnInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 50 || value < 1) {
      setColumnError(true);
    } else {
      setColumnError(false);

      setColumnCount(value);
    }
  };
  const handleTenureChange = (e) => {
    const selectedTenure = e.target.value;
    const updatedDate = getEndDateForTenure(selectedTenure);

    setFormData({
      ...formData,
      tenure: selectedTenure,
      reportDate: updatedDate,
    });
  };
  const [periodError, setPeriodError] = useState(false);
  const handlePeriodInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 500 || value < 1) {
      setPeriodError(true);
    } else {
      setPeriodError(false);
      setPeriod(value);
    }
  };

  const handleGenerateColumns = () => {
    // if (columnCount > 0 && period > 0) {
    //   generateColumns();
    // } else {
    //   alert("Please enter valid values for columns and period (greater than 0).");
    // }
    generateColumns();
  };

  const calculateTotal = (row) => {
    let total = 0;
    columns.forEach((col) => {
      total += row[col] || 0;
    });
    return total;
  };
  const handleSortRequest = (property) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortRows = (rows, comparator) => {
    const stabilizedRows = rows.map((row, index) => [row, index]);
    stabilizedRows.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedRows.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === "Total") {
      return calculateTotal(b) - calculateTotal(a);
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    generateColumns();
  }, []);

  const paginatedRows = sortRows(rows, getComparator(order, orderBy)).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    // generateColumns();
  }, [columnCount, period]);

  return (
    <>
      <div className="container-fluid pt-3">
        <div className="card p-3">
          {/* Input for Number of Columns */}
          <div className="d-flex align-items-center mb-3">
            <FormControl className="  me-2" variant="outlined">
              <FormLabel>Report period</FormLabel>
              <Select
                labelId="customer-type-label"
                variant="outlined"
                size="small"
                value={formData.tenure}
                onChange={handleTenureChange}
              >
                <MenuItem value={"Today"}>Today</MenuItem>
                <MenuItem value={"Custom"}>Custom</MenuItem>
                <MenuItem value={"Yesterday"}>Yesterday</MenuItem>
                <MenuItem value={"This Week"}>This Week</MenuItem>
                <MenuItem value={"Last Week"}>Last Week</MenuItem>
                <MenuItem value={"This Week-to-date"}>
                  This Week-to-date
                </MenuItem>
                <MenuItem value={"Last Week-to-date"}>
                  Last Week-to-date
                </MenuItem>
                <MenuItem value={"Next Week"}>Next Week</MenuItem>
                <MenuItem value={"Next 4 Weeks"}>Next 4 Weeks</MenuItem>
                <MenuItem value={"This Month"}>This Month</MenuItem>
                <MenuItem value={"Last Month"}>Last Month</MenuItem>
                <MenuItem value={"This Month-to-date"}>
                  This Month-to-date
                </MenuItem>
                <MenuItem value={"Last Month-to-date"}>
                  Last Month-to-date
                </MenuItem>
                <MenuItem value={"Next Month"}>Next Month</MenuItem>
                <MenuItem value={"This Fiscal Quarter"}>
                  This Fiscal Quarter
                </MenuItem>
                <MenuItem value={"Last Fiscal Quarter"}>
                  Last Fiscal Quarter
                </MenuItem>
                <MenuItem value={"This Fiscal Quarter-to-date"}>
                  This Fiscal Quarter-to-date
                </MenuItem>
                <MenuItem value={"Last Fiscal Quarter-to-date"}>
                  Last Fiscal Quarter-to-date
                </MenuItem>
                <MenuItem value={"Next Fiscal Quarter"}>
                  Next Fiscal Quarter
                </MenuItem>
                <MenuItem value={"This Fiscal Year"}>This Fiscal Year</MenuItem>
                <MenuItem value={"Last Fiscal Year"}>Last Fiscal Year</MenuItem>
                <MenuItem value={"This Fiscal Year-to-date"}>
                  This Fiscal Year-to-date
                </MenuItem>
                <MenuItem value={"Last Fiscal Year-to-date"}>
                  Last Fiscal Year-to-date
                </MenuItem>
                <MenuItem value={"Next Fiscal Year"}>Next Fiscal Year</MenuItem>
              </Select>
            </FormControl>
            as of
            <div className="mt-2">
              <TextField
                id="input-with-icon-adornment"
                label=""
                placeholder="Date"
                className="ms-3 mt-2"
                size="small"
                type="date"
                value={formatDate(formData.reportDate)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reportDate: e.target.value,
                    tenure: "Custom",
                  })
                }
                InputLabelProps={{ shrink: true }} // Ensure the label is always shrunk
              />
            </div>
            <FormControl className="ms-3">
              <FormLabel id="demo-controlled-radio-buttons-group">
                Aging Method
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={formData.agingMethod}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    agingMethod: e.target.value,
                  });
                }}
              >
                <FormControlLabel
                  value="Current"
                  control={<Radio />}
                  label="Current"
                />
                <FormControlLabel
                  value="Report_Date"
                  control={<Radio />}
                  label="Report Date"
                />
              </RadioGroup>
            </FormControl>
            <TextField
              label="Days per aging period"
              className="me-2"
              variant="standard"
              type="number"
              size="small"
              value={period}
              onChange={handlePeriodInput}
              error={periodError}
              helperText={periodError ? "Value should be between 0 and 90" : ""}
            />
            <TextField
              label="Number of periods"
              variant="standard"
              type="number"
              size="small"
              value={columnCount}
              onChange={handleColumnInput}
              error={columnError}
              helperText={columnError ? "Value should be between 0 and 10" : ""}
            />
             <Button
              sx={{
                textTransform: "capitalize",
                padding: "8px 10px",
                border: "1px solid #77993D",
                "&:hover": {
                  backgroundColor: "#77993D",
                  color: "white",
                  border: "1px solid #77993D",
                  outlineColor: "black",
                },
              }}
              variant={"contained"}
              onClick={handleGenerateColumns}
              className="ms-2"
              startIcon={<HiOutlineClipboardDocumentList size={"0.9em"} />}
            >
              Generate Report
            </Button>
          </div>
         

          {/* Display Table */}
          <div className="card-body p-0">
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead className="table-header">
                  <TableRow className="material-tbl-alignment">
                    <TableCell>
                      {" "}
                      <TableSortLabel
                        active={orderBy === "Customer"}
                        direction={orderBy === "Customer" ? order : "asc"}
                        onClick={() => handleSortRequest("Customer")}
                      >
                        Customer
                      </TableSortLabel>
                    </TableCell>
                    {columns.map((col, index) => (
                      <TableCell key={index} align="center">
                        {col}
                      </TableCell>
                    ))}
                    {columnCount > 0 && (
                      <TableCell align="center">
                        {columnCount * period + 1} days and over
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <TableSortLabel
                        active={orderBy === "Total"}
                        direction={orderBy === "Total" ? order : "asc"}
                        onClick={() => handleSortRequest("Total")}
                      >
                        Total
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <>
                    {paginatedRows.map((row, index) => (
                      <TableRow
                        className="material-tbl-alignment"
                        hover
                        key={index}
                      >
                        <TableCell>{row.Customer}</TableCell>
                        {columns.map((col, colIndex) => (
                          <TableCell key={colIndex} align="center">
                            {row[col] || 0}
                          </TableCell>
                        ))}
                        {columnCount > 0 && (
                          <TableCell align="center">0</TableCell>
                        )}
                        <TableCell align="center">
                          {calculateTotal(row)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
          </div>
        </div>
      </div>
    </>
  );
};

export default AgingReportTableTest;
