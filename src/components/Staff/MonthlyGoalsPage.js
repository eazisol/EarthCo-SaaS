import React, { useEffect, useState, useRef, useContext } from "react";
import useGetData from "../Hooks/useGetData";
import TitleBar from "../TitleBar";
import axios from "axios";
import Cookies from "js-cookie";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  MenuItem,
  Select,
  TablePagination,
  TableContainer,
  TextField,
  Button,
} from "@mui/material";
import formatAmount from "../../custom/FormatAmount";
import Speedometer from "../Reusable/Speedometer";
import { baseUrl } from "../../apiConfig";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/TaskAltOutlined";
import CloseIcon from "@mui/icons-material/CancelOutlined";
import EventPopups from "../Reusable/EventPopups";
import GoalCard from "./GoalCard";
import DaysCard from "./DaysCard";
import Checkbox from "@mui/material/Checkbox";
import { DataContext } from "../../context/AppData";
import MonthlyGoalsTable from "./MonthlyGoalsTable";
import { RMSales } from "./RMSales";
import { AMSales } from "./AMSales";
import { IrrigatorSales } from "./IrrigatorSales";
import SelectRolesDataModal from "./SelectRolesDataModal"
import { TarynData } from "./tarynData";
import { CSVLink } from "react-csv";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const MonthlyGoalsPage = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  const spanRefs = useRef([]);
  
  // Access control for Monthly Goals
  const menuAccess = useMenuAccess();
  const canEdit = (menuAccess?.canEdit || menuAccess?.canCreate) && !menuAccess?.isLoading;
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
        d="M15.8381 12.7317C16.4566 12.7317 16.9757 13.2422 16.8811 13.853C16.3263 17.4463 13.2502 20.1143 9.54009 20.1143C5.43536 20.1143 2.10834 16.7873 2.10834 12.6835C2.10834 9.30245 4.67693 6.15297 7.56878 5.44087C8.19018 5.28745 8.82702 5.72455 8.82702 6.36429C8.82702 10.6987 8.97272 11.8199 9.79579 12.4297C10.6189 13.0396 11.5867 12.7317 15.8381 12.7317Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.8848 9.1223C19.934 6.33756 16.5134 1.84879 12.345 1.92599C12.0208 1.93178 11.7612 2.20195 11.7468 2.5252C11.6416 4.81493 11.7834 7.78204 11.8626 9.12713C11.8867 9.5459 12.2157 9.87493 12.6335 9.89906C14.0162 9.97818 17.0914 10.0862 19.3483 9.74467C19.6552 9.69835 19.88 9.43204 19.8848 9.1223Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const currentYear = currentDate.getFullYear();
  const [activeTab, setActiveTab] = useState("1");
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);

  // Subtract one day to get the last day of the current month
  const lastDayOfCurrentMonth = new Date(nextMonth - 1);

  // Get the date (day of the month) which is the total number of days in the current month
  const totalDays = lastDayOfCurrentMonth.getDate();

  function getTotalDaysInCurrentMonth(month, year) {
    // Create a date object for the first day of the next month
    let nextMonth = new Date(year, month, 1);

    // Subtract one day to get the last day of the given month
    let lastDayOfMonth = new Date(nextMonth - 1);

    // Get the day of the month, which is the total number of days in the given month
    let totalDays = lastDayOfMonth.getDate();

    // Get current date
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1;
    let currentYear = currentDate.getFullYear();

    let remainingDays = 0;

    if (month === currentMonth && year === currentYear) {
      remainingDays = totalDays - currentDate.getDate();
    }

    return {
      totalDays,
      remainingDays,
    };
  }

  const years = Array.from(
    { length: currentYear - 2009 },
    (_, index) => currentYear - index
  );
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
  const validIds = [6147, 6146, 6148];
  const { getListData, data, isloading } = useGetData();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedMonthName, setSelectedMonthName] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedRow, setSelectedRow] = useState({});
  const [daysUntilEndOfMonth, setDaysUntilEndOfMonth] = useState(0);
  const [willRecords, setWillRecords] = useState(false);
  const [filteredRM, setFilteredRM] = useState([2, 5, 3251, 4, 3253, 9668]);
  const [selectedFilter, setSelectedFilter] = useState(2);
  const [commissionData, setCommissionData] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(4);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [openSelectRolesModal, setOpenSelectRolesModal] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [selectCommissionMonth, setSelectCommissionMonth] = useState(currentMonth);
  const [selectCommissionYear, setSelectCommissionYear] = useState(currentYear);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionHeading, setCommissionHeading] = useState({});
  const [isTaryn, setIsTarynDat] = useState(false);
  const csvData = commissionData.map((row) => ({
    Name: row?.Name || "",
    SaleCommission: formatAmount(Number(row?.SaleCommission ?? 0)),
  }));
  const filteredData = data.filter(
    (staff) =>
      staff.ReginoalManagerName.toLowerCase().includes(search.toLowerCase()) &&
      staff.CompanyId === Number(loggedInUser.CompanyId)
  );

  const calculateDaysUntilEndOfMonth = () => {
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = currentDate.getDate();
    return lastDayOfMonth - today;
  };
  useEffect(() => {
    setSelectedMonthName(months[selectedMonth - 1]);
    setDaysUntilEndOfMonth(calculateDaysUntilEndOfMonth());
  }, [selectedYear, selectedRow, page, rowsPerPage, search]);

  useEffect(() => {
    setEditClicked(false);
  }, [selectedYear, page, search]);

  // --- FIX: Add error handling for 404/other errors in getStaffSaleCommissionCalculation ---
  const getStaffSaleCommissionCalculation = async (selectedRoleId, selectedYear, selectedMonth, isTaryn) => {
    setCommissionLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/Dashboard/GetStaffSaleCommissionCalculation?RoleId=${selectedRoleId}&Year=${selectedYear}&Month=${selectedMonth}&IsTaryn=${isTaryn}`,
        { headers }
      );
      // Always fetch commission heading needed for percentage/thresholds.
      // For Taryn (tab 4), we want Irrigator rules (RoleId 5).
      const headingRoleId = activeTab == 4 ? 5 : selectedRoleId;
      try {
        const { data: headingData } = await axios.get(
          `${baseUrl}/api/Dashboard/GetStaffCommission?RoleId=${headingRoleId}`,
          { headers }
        );
        setCommissionHeading(headingData);
      } catch (e) {
        setCommissionHeading({});
      }

      if (response.status === 200 && response.data) {
        setCommissionData(response.data);

      } else {
        setCommissionData([]);
        setCommissionHeading({});
      }
    } catch (error) {
      setCommissionData([]);
      setCommissionHeading({});
      setOpenSnackBar(true);
      setSnackBarColor("error");
    } finally {
      setCommissionLoading(false);
    }
  };

  useEffect(() => {
    if (!openSelectRolesModal) {
      getStaffSaleCommissionCalculation(selectedRoleId, selectCommissionYear, selectCommissionMonth, isTaryn);
    }
  }, [selectedRoleId, selectCommissionYear, selectCommissionMonth, openSelectRolesModal]);

  const [Percentage, setPercentage] = useState(0);
  useEffect(() => {
    if (selectedRow.MonthlyGoalAmount <= selectedRow.Amount) {
      setPercentage(100);
    } else {
      let percentage =
        (selectedRow.Amount / selectedRow.MonthlyGoalAmount) * 100;
      setPercentage(percentage);
    }
  }, [selectedRow.MonthlyGoalAmount, selectedRow.Amount]);
  const percentageCalculator = (total, ach) => {
    if (total == 0 && ach == 0) {
      return (0.0).toFixed(2);
    }
    if (total <= ach) {
      return 100;
    } else {
      let percentage = (ach / total) * 100;
      return percentage.toFixed(2);
    }
  };
  // useEffect(() => {
  // if (loggedInUser.userId == 6146 || loggedInUser.CompanyId == 2) {
  // setWillRecords(true);
  // }
  // }, []);

  useEffect(() => {
    getListData(
      `/Dashboard/GetMonthlyGoalList?Year=${selectedYear}&Month=${selectedMonth}`
    );
    const monthName = months[selectedMonth - 1];
    setSelectedMonthName(monthName);
    setSelectedRow({});
  }, [selectedMonth, selectedYear]);
  useEffect(() => {
    const displayedData = willRecords
      ? filteredData.filter((staff) => validIds.includes(staff.ReginoalManagerId))
      : filteredRM.length !== 0
        ? filteredData.filter((staff) => filteredRM.includes(staff.ReginoalManagerId))
        : filteredData;
    if (willRecords) {
      setSelectedFilter(1);
    }
    const total = displayedData.reduce(
      (accumulator, staff) => accumulator + staff.Amount,
      0
    );
    const totalTarget = displayedData.reduce(
      (accumulator, staff) => accumulator + staff.MonthlyGoalAmount,
      0
    );
    setTotalTarget(totalTarget);
    setTotalAmount(total);
    if (!selectedRow.Amount) {
      setSelectedRow({
        Amount: total,
        MonthlyGoalAmount: totalTarget,
        ReginoalManagerName: "Overall",
      });
    }
  }, [data, willRecords, filteredRM]);
  // useEffect(() => {
  //   const total = displayedData.reduce(
  //     (accumulator, staff) => accumulator + staff.Amount,
  //     0
  //   );
  //   setSelectedRow({
  //     Amount: total,
  //     MonthlyGoalAmount: totalTarget,
  //     ReginoalManagerName: "Overall",
  //   });
  // }, [ willRecords, filteredRM])

  const [editClicked, setEditClicked] = useState(false);
  const [selectedindex, setSelectedindex] = useState(0);

  const [editableTarget, setEditableTarget] = useState({});

  useEffect(() => {
    // Initialize the refs array length based on the data length
    spanRefs.current = spanRefs.current.slice(0, data.length);
  }, [data]);
  const handleEditClick = (index) => {
    setEditClicked(true);
    setSelectedindex(index);
    setTimeout(() => {
      if (spanRefs.current[index]) {
        spanRefs.current[index].focus();
      }
    }, 0);
  };
  const handleTargetPriceChange = (event, itemId) => {
    const value = parseFloat(event.target.value);
    setEditableTarget({
      ...editableTarget,
      [itemId]: value,
    });
  };
  const handleTargetBlur = async (itemId) => {
    let newTarget = parseFloat(editableTarget[itemId]);
    if (isNaN(newTarget)) {
      newTarget = 0;
    }

    if (!itemId) {
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Dashboard/UpdateMonthlyGoal?Id=${itemId}&Year=${selectedYear}&Month=${selectedMonth}&Amount=${newTarget}`,
        { headers }
      );

      getListData(
        `/Dashboard/GetMonthlyGoalList?Year=${selectedYear}&Month=${selectedMonth}`
      );
      setSelectedRow({
        ...selectedRow,

        MonthlyGoalAmount: newTarget,
      });
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText("Monthly target set Successfuly");
      setEditClicked(false);
      setSelectedindex(0);

    } catch (error) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Error setting monthly target");
    }
  };

  // Filtered data based on willRecords state
  const displayedData = willRecords
    ? filteredData.filter((staff) => validIds.includes(staff.ReginoalManagerId))
    : filteredRM.length !== 0
      ? filteredData.filter((staff) =>
        filteredRM.includes(staff.ReginoalManagerId)
      )
      : filteredData;

  const interpolateColor = (value) => {
    if (value == 100) {
      return `#28a745`;
    } else {
      return `#FFBF00`;
    }
  };

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <TitleBar icon={icon} title="Monthly Goals" />
      {isloading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
        </div>
      ) : (
        <>
          <div className="container-fluid">
            <div className="">
              <div className="">
                <div className="row">
                  <div className="col-md-5" style={{ height: "fit-content" }}>
                    <div className="card">
                      <div className="card-header">
                        <div className="d-flex w-100 align-items-center">
                          <div className="col-6">
                            <h6 className="pb-0 mb-0">Regional Managers</h6>
                          </div>
                          <div className="col-6 text-end">
                            {/* <Checkbox
                              value={willRecords}
                              checked={willRecords}
                              onChange={(e) => {
                                setWillRecords(e.target.checked);
                              }}
                            /> */}
                            <FormControl style={{ height: "30px" }}>
                              <Select
                                size="small"
                                name="Month"
                                style={{
                                  backgroundColor: "transparent",
                                  width: "fit-content",
                                  height: "30px",
                                }}
                                value={selectedFilter}
                                onChange={(e) => {
                                  setSelectedFilter(e.target.value);
                                }}
                              >
                                <MenuItem
                                  value={2}
                                  onClick={() => {
                                    setFilteredRM([2, 5, 3251, 9485, 3253, 9668]);
                                    setWillRecords(false);
                                  }}
                                >
                                  Eco Records
                                </MenuItem>
                                <MenuItem
                                  value={0}
                                  onClick={() => {
                                    setFilteredRM([]);
                                    setWillRecords(false);
                                  }}
                                >
                                  All
                                </MenuItem>
                              </Select>
                            </FormControl>
                            {/* <span className="pb-0 mb-0">Will Records</span> */}
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4">
                            <label className="form-label">Search</label>
                            <TextField
                              name="search"
                              variant="outlined"
                              style={{ backgroundColor: "transparent" }}
                              size="small"
                              value={search || ""}
                              onChange={(e) => {
                                setSearch(e.target.value);
                              }}
                              className="form-txtarea form-control form-control-sm"
                              placeholder="Search"
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Year</label>
                            <FormControl fullWidth>
                              <Select
                                size="small"
                                style={{ backgroundColor: "transparent" }}
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
                          <div className="col-md-4">
                            <label className="form-label">Month</label>
                            <FormControl fullWidth>
                              <Select
                                size="small"
                                name="Month"
                                style={{ backgroundColor: "transparent" }}
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
                        </div>
                        <TableContainer
                          className="mt-2"
                          sx={{ overflowX: "auto" }}
                        >
                          <Table>
                            <TableHead className="table-header">
                              <TableRow className="material-tbl-alignment">
                                <TableCell>Regional Manager</TableCell>

                                <TableCell align="right">Target $</TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right">Achieved $</TableCell>
                                <TableCell align="center">%</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {displayedData.length == 0 ? (
                                <TableRow>
                                  <TableCell
                                    className="text-center"
                                    colSpan={12}
                                  >
                                    No Record Found
                                  </TableCell>
                                </TableRow>
                              ) : null}
                              {displayedData
                                .slice(
                                  page * rowsPerPage,
                                  page * rowsPerPage + rowsPerPage
                                )
                                .map((staff, index) => {
                                  return (
                                    <TableRow
                                      className="material-tbl-alignment"
                                      style={{
                                        cursor: "pointer",
                                        backgroundColor:
                                          selectedRow.ReginoalManagerId ==
                                            staff.ReginoalManagerId
                                            ? "#eff3f6"
                                            : "inherit",
                                      }}
                                      hover
                                      key={index}
                                    >
                                      <TableCell
                                        onClick={(event) => {
                                          setSelectedRow(staff);
                                        }}
                                      >
                                        {staff.ReginoalManagerName}
                                      </TableCell>

                                      <TableCell
                                        className="d-flex align-items-right"
                                        align="right"
                                        // style={{width: "9em"}}
                                        onClick={(event) => {
                                          setSelectedRow(staff);
                                        }}
                                        onDoubleClick={() => {
                                          handleEditClick(index);
                                          setEditableTarget({
                                            ...editableTarget,
                                            [staff.ReginoalManagerId]:
                                              staff.MonthlyGoalAmount,
                                          });
                                        }}
                                      >
                                        {editClicked &&
                                          selectedindex === index ? (
                                          <input
                                            className="form-control form-control-sm number-input "
                                            type="number"
                                            value={
                                              editableTarget[
                                              staff.ReginoalManagerId
                                              ]
                                            }
                                            style={{
                                              height: "18px",
                                              minHeight: "18px",
                                              width: "9em",
                                            }}
                                            ref={(el) =>
                                              (spanRefs.current[index] = el)
                                            }
                                            onChange={(event) =>
                                              handleTargetPriceChange(
                                                event,
                                                staff.ReginoalManagerId
                                              )
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                // Handle item addition when Enter key is pressed
                                                e.preventDefault(); // Prevent form submission

                                                setSelectedindex(index);
                                                if (
                                                  staff.MonthlyGoalAmount !==
                                                  editableTarget[
                                                  staff.ReginoalManagerId
                                                  ]
                                                ) {
                                                  handleTargetBlur(
                                                    staff.ReginoalManagerId
                                                  );
                                                }
                                              } else if (e.key === "Escape") {
                                                setEditClicked(false);
                                                setSelectedindex(index);
                                              }
                                            }}
                                          />
                                        ) : (
                                          <span>
                                            {formatAmount(
                                              staff.MonthlyGoalAmount
                                            ) || 0}
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        style={{ width: "4em" }}
                                      >
                                        {editClicked &&
                                          selectedindex === index ? (
                                          <>
                                            <DoneIcon
                                              onClick={() => {
                                                setSelectedindex(index);
                                                if (
                                                  staff.MonthlyGoalAmount !==
                                                  editableTarget[
                                                  staff.ReginoalManagerId
                                                  ]
                                                ) {
                                                  handleTargetBlur(
                                                    staff.ReginoalManagerId
                                                  );
                                                }
                                              }}
                                              style={{
                                                fontSize: "16px",
                                                color: "#77993d",
                                                marginRight: "5px",
                                              }}
                                            />
                                            <CloseIcon
                                              onClick={() => {
                                                setEditClicked(false);
                                                setSelectedindex(index);
                                              }}
                                              style={{
                                                fontSize: "16px",
                                                color: "red",
                                              }}
                                            />
                                          </>
                                        ) : (
                                          <CreateIcon
                                            onClick={() => {
                                              handleEditClick(index);
                                              setEditableTarget({
                                                ...editableTarget,
                                                [staff.ReginoalManagerId]:
                                                  staff.MonthlyGoalAmount,
                                              });
                                            }}
                                            style={{
                                              fontSize: "14px",
                                              color: "#77993d",
                                            }}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        onClick={(event) => {
                                          setSelectedRow(staff);
                                        }}
                                      >
                                        {formatAmount(staff.Amount)}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: "5em" }}
                                        onClick={(event) => {
                                          setSelectedRow(staff);
                                        }}
                                      >
                                        {percentageCalculator(
                                          staff.MonthlyGoalAmount,
                                          staff.Amount
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              <TableRow
                                className="material-tbl-alignment"
                                hover
                                onClick={() => {
                                  setSelectedRow({
                                    Amount: totalAmount,
                                    MonthlyGoalAmount: totalTarget,
                                    ReginoalManagerName: "Overall",
                                  });
                                }}
                              >
                                <TableCell align="right">
                                  <strong>Total</strong>
                                </TableCell>

                                <TableCell align="right">
                                  <strong>${formatAmount(totalTarget)}</strong>
                                </TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right">
                                  <strong>${formatAmount(totalAmount)}</strong>
                                </TableCell>
                                <TableCell align="right">
                                  {((totalAmount / totalTarget) * 100).toFixed(
                                    2
                                  ) > 100
                                    ? 100
                                    : (
                                      (totalAmount / totalTarget) *
                                      100
                                    ).toFixed(2)}
                                  %
                                </TableCell>
                              </TableRow>
                              {/* <TableRow
                                className="material-tbl-alignment"
                                hover
                              >
                                <TableCell align="right">
                                  <strong>Days remaining</strong>
                                </TableCell>

                                <TableCell align="right"></TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right">
                                  <strong>{daysUntilEndOfMonth}</strong>
                                </TableCell>
                                <TableCell align="right"></TableCell>
                              </TableRow> */}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <TablePagination
                          rowsPerPageOptions={[10, 25, 50]}
                          component="div"
                          labelRowsPerPage="Rows"
                          count={displayedData.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={(event, newPage) => setPage(newPage)}
                          onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4" style={{ height: "fit-content" }}>
                    <div className="card">
                      <div className="card-header">
                        <div
                          className="d-flex justify-content-between align-items-center"
                          style={{ width: "100%" }}
                        >
                          <div style={{ width: "50%" }}>
                            <h6 className="pb-0 mb-0">Monthly Goals</h6>
                          </div>
                          <div style={{ width: "50%" }} className="text-end">
                            {/* <div
                              style={{ width: "auto" }}
                              className={`icon-box bg-primary-light align-content-center px-1`}
                            >
                              <h4 className="pb-0 mb-0 text-primary">
                                {Percentage.toFixed(2)}%
                              </h4>
                            </div> */}
                            <div className="row align-items-center ">
                              <div className="col-8 p-0 d-flex justify-content-end">
                                <div
                                  className="progress"
                                  style={{ width: "50%" }}
                                >
                                  <div
                                    className={`progress-bar `}
                                    style={{
                                      width: `${Percentage}%`,
                                      height: "5px",
                                      borderRadius: "4px",
                                      backgroundColor:
                                        interpolateColor(Percentage),
                                    }}
                                    role="progressbar"
                                  ></div>
                                </div>
                              </div>
                              <div className="col-4 p-0 pe-3 nowrap">
                                <p className="mb-0">{Percentage.toFixed(2)}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="row">
                          <div className="col-md-12 mt-2 text-center">
                            <h4>
                              {selectedRow.ReginoalManagerName
                                ? selectedRow.ReginoalManagerName
                                : "Overall"}{" "}
                              ({months[selectedMonth - 1]} -{" "}
                              {selectedYear - 2000})
                            </h4>
                          </div>
                          <div className="col-md-12 text-center p-0">
                            <Speedometer
                              size={1.6}
                              value={totalAmount || selectedRow.Amount || 0}
                              maxValue={
                                totalTarget ||
                                selectedRow.MonthlyGoalAmount ||
                                0
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 " style={{ height: "fit-content" }}>
                    <DaysCard
                      title="Target"
                      amount={daysUntilEndOfMonth || 0}
                      target={
                        getTotalDaysInCurrentMonth(selectedMonth, selectedYear)
                          .totalDays || 0
                      }
                      titleAmount={selectedRow.MonthlyGoalAmount || 0}
                      amountTotal={selectedRow.Amount || 0}
                      color="danger"
                      amountPercentage={Percentage}
                      remainingDays={
                        getTotalDaysInCurrentMonth(selectedMonth, selectedYear)
                          .remainingDays
                      }
                      month={`${months[selectedMonth - 1]} - ${selectedYear - 2000
                        }`}
                    />
                    <GoalCard
                      title="Achieved"
                      amount={selectedRow.Amount || 0}
                      target={selectedRow.MonthlyGoalAmount || 0}
                      titleAmount={selectedRow.Amount || 0}
                      color="success"
                      month={`${months[selectedMonth - 1]} - ${selectedYear - 2000
                        }`}
                    />
                  </div>
                  {/* Will records  */}
                  <div className="col-md-12" style={{ height: "fit-content" }}>
                    <MonthlyGoalsTable />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {loggedInUser.userRole == 1 && <>
            <div className="container-fluid" style={{ marginTop: "-2%" }}>
              <div className="row">
                <div className="col-md-12" style={{ height: "fit-content" }}>
                  <div className="card">

                    <div className="card-header">
                      <div className="row w-100 align-items-center">
                        <div className="col-12 col-md-4 d-flex align-items-center mb-2 mb-md-0">
                          <h6 className="pb-0 mb-0 text-center text-md-start w-100">Sales Commission Calculation</h6>
                        </div>
                        <div className="col-12 col-md-8 d-flex align-items-center">
                          <div className="d-flex w-100 flex-wrap flex-md-nowrap align-items-center justify-content-end">
                            <div className="me-2" style={{ minWidth: "82px" }}>
                              <FormControl fullWidth>
                                <Select
                                  size="small"
                                  style={{ backgroundColor: "transparent" }}
                                  name="Year"
                                  value={selectCommissionYear}
                                  onChange={(e) => {
                                    setSelectCommissionYear(e.target.value);
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
                            <div className="me-2" style={{ minWidth: "117px" }}>
                              <FormControl fullWidth>
                                <Select
                                  size="small"
                                  name="Month"
                                  style={{ backgroundColor: "transparent", width: "100%" }}
                                  value={selectCommissionMonth}
                                  onChange={(e) => {
                                    setSelectCommissionMonth(e.target.value);
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
                            {(isTaryn == true && activeTab == 4) ? <div style={{ minWidth: "fit-content" }}>
                              <CSVLink
                                data={csvData}
                                headers={[
                                  { label: "Name", key: "Name" },
                                  { label: "Commission", key: "SaleCommission" }
                                ]}
                                filename={"TarynData.csv"}
                              >
                                <button
                                  className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                                >
                                  <i className="fa fa-download" style={{marginRight: "5px"}}></i>
                                  CSV
                                </button>
                              </CSVLink>
                            </div> : <div style={{ minWidth: "fit-content" }}>
                              {canEdit ? (
                                <button
                                  className="btn btn-success"
                                  variant="contained"
                                  color="primary"
                                  style={{
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                    transition: "none",
                                    backgroundColor: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d",
                                    borderColor: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d",
                                    color: "#fff"
                                  }}
                                  onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = dynamicColorAndLogo?.PrimeryColor || "#7b9b3d";
                                    e.currentTarget.style.borderColor = dynamicColorAndLogo?.PrimeryColor || "#7b9b3d";
                                    e.currentTarget.style.color = "#fff";
                                  }}
                                  onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = dynamicColorAndLogo?.PrimeryColor || "#7b9b3d";
                                    e.currentTarget.style.borderColor = dynamicColorAndLogo?.PrimeryColor || "#7b9b3d";
                                    e.currentTarget.style.color = "#fff";
                                  }}
                                  onClick={(e) => {
                                    e.currentTarget.blur();
                                    setOpenSelectRolesModal(true);
                                  }}
                                  type="button"
                                >
                                  Update Commission
                                </button>
                              ) : (
                                <Tooltip title="You don't have access" arrow>
                                  <span>
                                    <button
                                      className="btn btn-success"
                                      disabled
                                      style={{
                                        minWidth: "fit-content",
                                        whiteSpace: "nowrap",
                                        transition: "none",
                                        backgroundColor: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d",
                                        borderColor: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d",
                                        color: "#fff",
                                        cursor: "not-allowed",
                                        opacity: 0.6
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      type="button"
                                    >
                                      Update Commission
                                    </button>
                                  </span>
                                </Tooltip>
                              )}
                            </div>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      {/* Tabs */}
                      <ul className="nav nav-tabs mb-3" role="tablist">
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === "1" ? "active" : ""}`}
                            onClick={() => { setActiveTab("1"); setSelectedRoleId(4); setIsTarynDat(false) }}
                            style={{ color: "#000" }}
                            type="button"
                            role="tab"
                          >
                            Regional Manager Sales
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === "2" ? "active" : ""}`}
                            onClick={() => { setActiveTab("2"); setSelectedRoleId(8); setIsTarynDat(false) }}
                            style={{ color: "#000" }}
                            type="button"
                            role="tab"
                          >
                            Account Manager Sales
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === "3" ? "active" : ""}`}
                            onClick={() => { setActiveTab("3"); setSelectedRoleId(5); setIsTarynDat(false) }}
                            style={{ color: "#000" }}
                            type="button"
                            role="tab"
                          >
                            Irrigator Sales
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === "4" ? "active" : ""}`}
                            onClick={() => { setActiveTab("4"); setSelectedRoleId(0); setIsTarynDat(true); }}
                            style={{ color: "#000" }}
                            type="button"
                            role="tab"
                          >
                            Taryn
                          </button>
                        </li>
                      </ul>

                      <div className="tab-content">
                        <div className={`tab-pane fade ${activeTab === "1" ? "show active" : ""}`}>
                          <RMSales commissionData={commissionData} loader={commissionLoading} heading={commissionHeading} year={selectCommissionYear}
                            month={selectCommissionMonth} />
                        </div>
                        <div className={`tab-pane fade ${activeTab === "2" ? "show active" : ""}`}>
                          <AMSales commissionData={commissionData} loader={commissionLoading} heading={commissionHeading} year={selectCommissionYear}
                            month={selectCommissionMonth} />
                        </div>
                        <div className={`tab-pane fade ${activeTab === "3" ? "show active" : ""}`}>
                          <IrrigatorSales
                            commissionData={commissionData}
                            loader={commissionLoading}
                            heading={commissionHeading}
                            year={selectCommissionYear}
                            month={selectCommissionMonth}
                          />
                        </div>
                        <div className={`tab-pane fade ${activeTab === "4" ? "show active" : ""}`}>
                          <TarynData commissionData={commissionData} loader={commissionLoading} heading={commissionHeading} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal */}
              {openSelectRolesModal && <SelectRolesDataModal
                open={openSelectRolesModal}
                handleClose={() => setOpenSelectRolesModal(false)}
                onSave={(data) => setOpenSelectRolesModal(false)}
              />}
            </div>

          </>}
        </>
      )}
    </>
  );
};

export default MonthlyGoalsPage;
