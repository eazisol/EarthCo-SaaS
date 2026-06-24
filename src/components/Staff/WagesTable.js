import React, { useContext, useEffect, useState } from "react";
import TitleBar from "../TitleBar";
import axios from "axios";
import Cookies from "js-cookie";
import CircularProgress from "@mui/material/CircularProgress";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Popover,
  Typography,
  TableContainer,
  Button,
} from "@mui/material";
import WagesCards from "./WagesCards";
import formatAmount from "../../custom/FormatAmount";
import { baseUrl } from "../../apiConfig";
import { DataContext } from "../../context/AppData";

const WagesTable = () => {
  const token = Cookies.get("token");
  const { dynamicColorAndLogo } = useContext(DataContext);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const currentYear = currentDate.getFullYear();

  const years = Array.from(
    { length: currentYear - 2009 },
    (_, index) => currentYear - index
  );

  const [staffData, setStaffData] = useState([]);
  const [mulchData, setMulchData] = useState([]);
  const [orignalStaffData, setOrignalStaffData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [mulchTotal, setMulchTotal] = useState(0);
  const [selectedRoleId, setSelectedRoleId] = useState(5);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const navigate = useNavigate();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [staffFetchError, setstaffFetchError] = useState(false);

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

  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.986 14.0673C7.4407 14.0673 4.41309 14.6034 4.41309 16.7501C4.41309 18.8969 7.4215 19.4521 10.986 19.4521C14.5313 19.4521 17.5581 18.9152 17.5581 16.7693C17.5581 14.6234 14.5505 14.0673 10.986 14.0673Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.986 11.0054C13.3126 11.0054 15.1983 9.11881 15.1983 6.79223C15.1983 4.46564 13.3126 2.57993 10.986 2.57993C8.65944 2.57993 6.77285 4.46564 6.77285 6.79223C6.76499 9.11096 8.63849 10.9975 10.9563 11.0054H10.986Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const getStaffList = async (year = currentYear, month = currentMonth) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Dashboard/GetIrrigatorReport?year=${year}&month=${month}`,
        { headers }
      );
      setstaffFetchError(false);
      const filteredData = response.data.filter((item) => item.ItemId !== 5001);
      const mulchData = response.data.filter((item) => item.ItemId == 5001);
      setStaffData(filteredData);
      console.log("mulch", mulchData);
      setMulchData(mulchData);

      setOrignalStaffData(response.data);
      if (response.data != null) {
        setIsLoading(false);
      }
      console.log("staff list iss", response.data);
    } catch (error) {
      console.log("error getting staff list", error);
      setstaffFetchError(true);
      setIsLoading(false);
    }
  };

  const getInvoiceList = async (id, year, month = currentMonth) => {
    setInvoiceLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/Invoice/GetInvoiceNumberList?itemId=${id}&Year=${year}&Month=${month}`,
        { headers }
      );
      setSelectedRow(response.data);
      setInvoiceLoading(false);

      console.log("invoice list iss", response.data);
    } catch (error) {
      console.log("error getting invoice list", error);
      setInvoiceLoading(false);
    }
  };

  useEffect(() => {
    getStaffList();
  }, []);
  useEffect(() => {
    getStaffList(selectedYear, selectedMonth);
  }, [selectedMonth, selectedYear]);
  useEffect(() => {
    // Calculate total amount
    const total = staffData.filter((staff) => staff.RoleId === selectedRoleId).reduce(
      (accumulator, staff) => accumulator + staff.Amount,
      0
    );
    const totalMunch = mulchData.reduce(
      (accumulator, staff) => accumulator + staff.Amount,
      0
    );
    const totalHours = staffData.reduce(
      (accumulator, staff) => accumulator + staff.Hours,
      0
    );
    // Set total amount to state
    setTotalAmount(formatAmount(total));
    setMulchTotal(formatAmount(totalMunch));
    setTotalHours(totalHours);
  }, [staffData,selectedRoleId]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePopoverOpen = (event, data) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(data);
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
  };

  return (
    <>
      <TitleBar icon={icon} title="Wages" />
      {isLoading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="card">
            <div className="card-body ">
              <div className="row">
                <div className="col-md-4">
                  <div className="row">
                    <div className="col-md-12">
                      <label className="form-label">Regional Manager</label>
                      <Autocomplete
                        id="staff-autocomplete"
                        size="small"
                        options={orignalStaffData.filter(
                          (option, index, self) =>
                            self.findIndex(
                              (item) =>
                                item.ReginoalManagerName ===
                                option.ReginoalManagerName
                            ) === index
                        )}
                        getOptionLabel={(option) => option.ReginoalManagerName}
                        onChange={(e, value) => {
                          if (value) {
                            // Filter originalMapData based on the selected customer
                            const filteredData = orignalStaffData.filter(
                              (item) =>
                                item.ReginoalManagerName ===
                                value.ReginoalManagerName
                            );
                            setStaffData(filteredData); // Update mapData with the filtered data
                          } else {
                            // If value is null (text field cleared), reset mapData to original data
                            setStaffData(orignalStaffData);
                          }
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.ReginoalManagerName ===
                          value.ReginoalManagerName
                        }
                        renderOption={(props, option) => (
                          <li {...props}>
                            <div className="customer-dd-border-map">
                              <h6>{option.ReginoalManagerName}</h6>
                            </div>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label=""
                            fullWidth
                            onClick={() => {}}
                            placeholder="Select Regional Manager"
                            className="bg-white"
                          />
                        )}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Year</label>
                      <FormControl fullWidth>
                        <Select
                          size="small"
                          name="Year"
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(e.target.value);
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
                    <div className="col-md-6">
                      <label className="form-label">Month</label>
                      <FormControl fullWidth>
                        <Select
                          size="small"
                          name="Month"
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value);
                          }}
                        >
                          {months.map((month, index) => (
                            <MenuItem key={index} value={index + 1}>
                              {month}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>

                    <WagesCards
                      total={totalAmount}
                      Hours={totalHours.toFixed(2)}
                    />
                    
                    <TableContainer sx={{ overflowX: "auto" }}>
                      <Table>
                        <TableHead className="table-header">
                          <TableRow className="material-tbl-alignment">
                            <TableCell colSpan={12}>
                              <h4 className="mb-0">Mulch</h4>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableHead className="table-header">
                          <TableRow className="material-tbl-alignment">
                            <TableCell>Regional Manager</TableCell>
                            <TableCell align="center">Yards</TableCell>

                            <TableCell align="right">Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mulchData.length == 0 ? (
                            <TableRow>
                              <TableCell className="text-center" colSpan={12}>
                                No Record Found
                              </TableCell>
                            </TableRow>
                          ) : null}
                          {mulchData.map((staff, index) => (
                              <TableRow
                                className="material-tbl-alignment"
                                style={{ cursor: "pointer" }}
                                hover
                                key={staff.UserId}
                                onClick={(event) => {
                                  handlePopoverOpen(event, []);
                                  getInvoiceList(
                                    staff.ItemId,
                                    selectedYear,
                                    selectedMonth
                                  );
                                }}
                              >
                                <TableCell>
                                  {staff.ReginoalManagerName}
                                </TableCell>

                                <TableCell align="center">
                                  {staff.Hours.toFixed(2)}
                                </TableCell>

                                <TableCell align="right">
                                  ${formatAmount(staff.Amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          <TableRow className="material-tbl-alignment" hover>
                            <TableCell></TableCell>

                            <TableCell align="right">
                              <strong>Total</strong>
                            </TableCell>

                            <TableCell align="right">
                              <strong>${mulchTotal}</strong>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row justify-content-end mb-2">
                      <Button
                        variant={selectedRoleId == 5 ? "contained" : "outlined"}
                        className="w-auto me-2"
                        sx={{ textTransform: "none" }}
                        onClick={() => {
                          setSelectedRoleId(5);
                        }}
                      >
                        Irrigator
                      </Button>
                      <Button
                        variant={selectedRoleId == 6 ? "contained" : "outlined"}
                        className="w-auto me-3"
                        sx={{ textTransform: "none" }}
                        onClick={() => {
                          setSelectedRoleId(6);
                        }}
                      >
                        Spray Techs
                      </Button>
                    </div>
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table>
                      <TableHead className="table-header">
                        <TableRow className="material-tbl-alignment">
                          <TableCell>Name</TableCell>

                          <TableCell>Regional Manager</TableCell>
                          <TableCell align="center">Hours</TableCell>

                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {staffFetchError || staffData.length == 0 ? (
                          <TableRow>
                            <TableCell className="text-center" colSpan={12}>
                              No Record Found
                            </TableCell>
                          </TableRow>
                        ) : null}
                        {staffData.filter((staff) => staff.RoleId === selectedRoleId)
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((staff, index) => (
                            <TableRow
                              className="material-tbl-alignment"
                              style={{ cursor: "pointer" }}
                              hover
                              key={staff.UserId}
                              onClick={(event) => {
                                handlePopoverOpen(event, []);
                                getInvoiceList(
                                  staff.ItemId,
                                  selectedYear,
                                  selectedMonth
                                );
                              }}
                            >
                              <TableCell>{staff.IrrigatorName}</TableCell>

                              <TableCell>{staff.ReginoalManagerName}</TableCell>

                              <TableCell align="center">
                                {staff.Hours.toFixed(2)}
                              </TableCell>

                              <TableCell align="right">
                                ${formatAmount(staff.Amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        <TableRow className="material-tbl-alignment" hover>
                          <TableCell></TableCell>

                          <TableCell></TableCell>

                          <TableCell align="right">
                            <strong>Total</strong>
                          </TableCell>

                          <TableCell align="right">
                            <strong>${totalAmount}</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Popover
                    open={popoverOpen}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <div
                      className="p-2"
                      style={{
                        width: "10em",
                        height: "35vh",
                        overflowY: "auto",
                      }}
                    >
                      <h4>
                        <>Invoices</>
                      </h4>
                      {invoiceLoading ? (
                        <>
                          <CircularProgress
                            style={{ color: dynamicColorAndLogo.PrimeryColor }}
                            size={20}
                          />
                        </>
                      ) : (
                        <>
                          {selectedRow.length <= 0 ? (
                            <div className="row text-center">
                              <p>No Record found</p>
                            </div>
                          ) : (
                            selectedRow.map((item, index) => (
                              <div className=" wages-invoice" key={index}>
                                <div
                                  style={{ cursor: "pointer" }}
                                  className="row "
                                  onClick={() => {
                                    navigate(
                                      `/invoices/add-invoices?id=${item.InvoiceId}`
                                    );
                                  }}
                                >
                                  <div
                                    style={{ width: "100%" }}
                                    className="row"
                                  >
                                    <p>
                                      <span style={{ fontWeight: "bold" }}>
                                        #
                                      </span>{" "}
                                      {item.InvoiceNumber}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </>
                      )}
                    </div>
                  </Popover>
                  <TablePagination
                    rowsPerPageOptions={[100, 200, 300]}
                    component="div"
                    count={staffData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default WagesTable;
