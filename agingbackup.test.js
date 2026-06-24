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
} from "@mui/material";

const AgingReportTableTest = () => {
  
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

  useEffect(() => {
    // generateColumns();
  }, [columnCount, period]);


  

  return (
    <>
  
      <div className="container-fluid pt-3">
        <div className="card p-3">
          {/* Input for Number of Columns */}
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
                helperText={
                  periodError ? "Value should be between 0 and 90" : ""
                }
              />
              <TextField
                label="Number of periods"
                variant="standard"
                type="number"
                size="small"
                value={columnCount}
                onChange={handleColumnInput}
                error={columnError}
                helperText={
                  columnError ? "Value should be between 0 and 10" : ""
                }
              />
            </div>
          <div className="d-flex mb-2 align-items-center">
            <TextField
              label="Days per aging period"
              className="me-2"
              variant="standard"
              type="number"
              size="small"
              value={period}
              onChange={handlePeriodInput}
              error={periodError}
              helperText={
                periodError ? "Value shoule be between 0 and 500" : ""
              }
            />
            <TextField
              label="Number of periods"
              variant="standard"
              type="number"
              size="small"
              value={columnCount}
              onChange={handleColumnInput}
              error={columnError}
              helperText={columnError ? "Value shoule be between 0 and 50" : ""}
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
                    <TableCell>Customer</TableCell>
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
                    <TableCell align="center">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <>
                    {rows.map((row, index) => (
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AgingReportTableTest;
