import React, { useContext, useEffect, useState } from "react";
import TitleBar from "../TitleBar";
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
} from "@mui/material";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import { DataContext } from "../../context/AppData";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import { NavLink } from "react-router-dom";
import InvoiceTableList from "./InvoiceTableList";

const AgingReportByEarthco = ({
  getEarthcoReportData,
  earthCoRepoerData,
  getEndDateForTenure,
  dateFormat,
  loading,
}) => {
  const { loggedInUser, setScrollBottom, dynamicColorAndLogo } = useContext(DataContext);
  // console.log("🚀 ~ AgingReportByEarthco ~ loggedInUser:", loggedInUser)

  const currentDate = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    search: "",
    tenure: "Today",
    reportDate: currentDate,
    sort: "default",
    agingMethod: "Report_Date",
  });
  const [columnCount, setColumnCount] = useState(4);
  const [columns, setColumns] = useState([]);
  const [period, setPeriod] = useState(30);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const generateColumns = () => {
    const newColumns = [];
    let start = 0;

    for (let i = 0; i < columnCount; i++) {
      const end = start + period;
      const rangeLabel =
        i === 0 ? `${1}-${end} days` : `${start + 1}-${end} days`;
      const key = i >= 2 ? `C${i + 1}th_Range` : `C${i + 1}st_Range`; // Key for the data
      newColumns.push({ label: rangeLabel, key });
      start = end;
    }

    // Add the dynamic "and over" column
    const overStart = columnCount * period + 1;
    newColumns.pop();
    newColumns.push({
      label: `${overStart} and over`,
      key:
        columnCount == 10
          ? "Over"
          : newColumns.length >= 2
          ? `C${newColumns.length + 1}th_Range`
          : `C${newColumns.length + 1}st_Range`,
    });

    setColumns(newColumns);
  };

  const [columnError, setColumnError] = useState(false);
  const handleColumnInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 10 || value < 1) {
      setColumnError(true);
    } else {
      setColumnError(false);
      setColumnCount(value);
    }
  };

  const [periodError, setPeriodError] = useState(false);
  const handlePeriodInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 90 || value < 1) {
      setPeriodError(true);
    } else {
      setPeriodError(false);
      setPeriod(value);
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

  const handleGenerateColumns = () => {
    generateColumns();
    getEarthcoReportData(
      formData.reportDate,
      formData.tenure,
      formData.sort,
      formData.agingMethod,
      period,
      columnCount
    );
    console.log("columnCount", columns);
  };

  // Search and Filter Data
  const filteredData = earthCoRepoerData.filter((row) => {
    const customerName = row.DisplayName || row.CompanyName || "";
    return customerName.toLowerCase().includes(formData.search.toLowerCase());
  }).sort((a, b) => {
    if (formData.sort === "default") {
      return 0; // No sorting applied
    } else if (formData.sort === "ascend") {
      return a.Total - b.Total; // Ascending order
    } else {
      return b.Total - a.Total; // Descending order
    }
  });

  // Paginated Data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )
  const columnTotals = columns.reduce((totals, column) => {
    totals[column.key] = filteredData.reduce(
      (sum, row) => sum + (row[column.key] || 0),
      0
    );
    return totals;
  }, {});

  const totalCurrent = filteredData.reduce(
    (sum, row) => sum + (row.Current || 0),
    0
  );
  const totalOverall = filteredData.reduce(
    (sum, row) => sum + (row.Total || 0),
    0
  );

  // Pagination Handlers
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

  return (
    <>
      <div className="d-flex mb-2 align-items-baseline justify-content-between">
        <div className="d-flex align-items-center mt-3">
          <div className="">
            <div className="d-flex align-items-center">
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
                  <MenuItem value={"This Fiscal Year"}>
                    This Fiscal Year
                  </MenuItem>
                  <MenuItem value={"Last Fiscal Year"}>
                    Last Fiscal Year
                  </MenuItem>
                  <MenuItem value={"This Fiscal Year-to-date"}>
                    This Fiscal Year-to-date
                  </MenuItem>
                  <MenuItem value={"Last Fiscal Year-to-date"}>
                    Last Fiscal Year-to-date
                  </MenuItem>
                  <MenuItem value={"Next Fiscal Year"}>
                    Next Fiscal Year
                  </MenuItem>
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
              </FormControl><div className="d-flex flex-column">
              <FormLabel>Days per aging period</FormLabel>
              <TextField
                label=""
                className="me-2 mt-2"
                variant="standard"
                type="number"
                size="small"

                value={period}
                onChange={handlePeriodInput}
                error={periodError}
                helperText={
                  periodError ? "Value should be between 0 and 90" : ""
                }
                
              /></div>
              <div className="d-flex flex-column">
              <FormLabel>Number of periods</FormLabel>
              <TextField
                label=""
                variant="standard"
                type="number"
                size="small"
                className="mt-2"
                value={columnCount}
                onChange={handleColumnInput}
                error={columnError}
                helperText={
                  columnError ? "Value should be between 0 and 10" : ""
                }
              />
            </div>
            <Button
            sx={{
              textTransform: "capitalize",
              padding: "8px 10px",
              border: `1px solid ${dynamicColorAndLogo.PrimeryColor}`,
              "&:hover": {
                backgroundColor: dynamicColorAndLogo.PrimeryColor,
                color: "white",
                border: `1px solid ${dynamicColorAndLogo.PrimeryColor}`,
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
          </div>
        </div>
        <div className="align-content-end">

        </div>
      </div>

      <div className="d-flex mb-2  justify-content-between align-items-end">
        <div className="d-flex align-items-center mt-3">
          <div className="">
            <div className="d-flex align-items-center">
              <TextField
                label="Search Customer"
                variant="standard"
                className="me-3"
                size="small"
                value={formData.search}
                onChange={(e) => {
                  setFormData({ ...formData, search: e.target.value });
                }}
              />
            </div>
          </div>
        </div>
        <div className="d-flex flex-column text-center mt-3">
          <h2 className="font-secondry">
            {loggedInUser.CompanyName ? loggedInUser.CompanyName : ""}
          </h2>
          <h4 className="text-bold mt-2 mb-1">A/R Aging Report</h4>
          <h5 className="font-secondry">
            As of {dateFormat(formData.reportDate)}
          </h5>
        </div>
        <div className="">
          <FormControl className="  me-2" variant="outlined">
            <FormLabel>Sort by</FormLabel>
            <Select
              labelId="customer-type-label"
              variant="outlined"
              size="small"
              value={formData.sort}
              onChange={(e) => {
                setFormData({ ...formData, sort: e.target.value });
              }}
            >default
              <MenuItem value={"default"}>Default</MenuItem>
              <MenuItem value={"ascend"}>Ascending</MenuItem>
              <MenuItem value={"descend"}>Descending</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <div className="card-body p-0">
        {loading ? (
          <div className="center-loader">
            <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
          </div>
        ) : (
          <TableContainer sx={{ maxHeight: "75vh", overflowX: "auto" }}>
            <Table stickyHeader>
              <TableHead className="table-header">
                <TableRow sx={{ backgroundColor: "#d3dee6" }}>
                  <TableCell
                    sx={{
                      p: "7px",
                      backgroundColor: "#d3dee6",
                    }}
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    sx={{
                      p: "7px",
                      backgroundColor: "#d3dee6",
                    }}
                  >
                    Current
                  </TableCell>
                  {columns.map((col, index) => (
                    <TableCell
                      sx={{
                        p: "7px",
                        backgroundColor: "#d3dee6",
                        minWidth : "8em"
                      }}
                      key={index}
                      align="center"
                    >
                      {col.label}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      p: "7px",
                      backgroundColor: "#d3dee6",
                    }}
                    align="center"
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        p: "5px",
                      }}
                    >
                      {row.DisplayName ? row.DisplayName : row.CompanyName}{" "}
                      <NavLink
                        to={`/customers/add-customer?id=${row.CustomerId}`}
                        target="_blank"
                      >
                        <ArrowOutwardIcon style={{ fontSize: 14 }} />
                      </NavLink>
                    </TableCell>
                    <TableCell
                      sx={{
                        p: "5px",
                      }}
                    >
                      {formatAmount(row.Current)}
                    </TableCell>
                    {columns.map((col, colIndex) => (
                      <TableCell
                        sx={{
                          p: "5px",
                        }}
                        key={colIndex}
                        align="center"
                      >
                        {formatAmount(row[col.key]) || 0}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        p: "5px",
                      }}
                      align="center"
                    >
                       <NavLink
                        to={`/customers/add-customer?id=${row.CustomerId}&tab=5&statusId=5`}
                        onClick={() => {
                         setScrollBottom(true)
                        }}
                      >
                        <span style={{color : "#000"}}>
                      {formatAmount(row.Total)}</span>{" "}<ArrowOutwardIcon style={{ fontSize: 14 }} />
                       </NavLink>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      borderBottom: "2px solid black",
                    }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      borderBottom: "2px solid black",
                    }}
                    l
                  >
                    {formatAmount(totalCurrent)}
                  </TableCell>
                  {columns.map((col, index) => (
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        borderBottom: "2px solid black",
                      }}
                      key={index}
                      align="center"
                    >
                      {formatAmount(columnTotals[col.key])}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      borderBottom: "2px solid black",
                    }}
                  >
                    {formatAmount(totalOverall)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={[50, 100, 200]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </>
  );
};

export default AgingReportByEarthco;
