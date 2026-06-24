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
} from "@mui/material";
import formatAmount from "../../custom/FormatAmount";
import { baseUrl } from "../../apiConfig";
import CreateIcon from "@mui/icons-material/Create";
import DoneIcon from "@mui/icons-material/TaskAltOutlined";
import CloseIcon from "@mui/icons-material/CancelOutlined";
import EventPopups from "../Reusable/EventPopups";
import Speedometer from "../Reusable/Speedometer";
import DaysCard from "./DaysCard";
import GoalCard from "./GoalCard";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const MonthlyGoalsTable = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const spanRefs = useRef([]);
  const { dynamicColorAndLogo } = useContext(DataContext);
  
  // Access control for Monthly Goals
  const menuAccess = useMenuAccess();
  const canEdit = (menuAccess?.canEdit || menuAccess?.canCreate) && !menuAccess?.isLoading;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const currentYear = currentDate.getFullYear();

  // Subtract one day to get the last day of the current month

  // Get the date (day of the month) which is the total number of days in the current month

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
  const [willRecords, setWillRecords] = useState(true);
  const [filteredRM, setFilteredRM] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const filteredData = data.filter((staff) =>
    staff.ReginoalManagerName.toLowerCase().includes(search.toLowerCase())
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
      ? data.filter((staff) => validIds.includes(staff.ReginoalManagerId))
      : filteredRM.length !== 0
      ? data.filter((staff) => filteredRM.includes(staff.ReginoalManagerId))
      : data;
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
    console.log("Updated target for item ID:", itemId, "to", newTarget);
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

      console.log("successfully set monthly target", response.data);
    } catch (error) {
      console.log("error setting monthly target list", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Error setting monthly target");
    }
  };
  const interpolateColor = (value) => {
    if (value == 100) {
      return `#28a745`;
    } else {
      return `#FFBF00`;
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

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="row">
        <div className="col-md-5 col-sm-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex w-100 align-items-center">
                <div className="col-6">
                  <h6 className="pb-0 mb-0">Will Records</h6>
                </div>
                <div className="col-6 text-end">
                  {/* <Checkbox
            value={willRecords}
            checked={willRecords}
            onChange={(e) => {
              setWillRecords(e.target.checked);
            }}
          /> */}

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
              <TableContainer className="mt-2" sx={{ overflowX: "auto" }}>
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
                        <TableCell className="text-center" colSpan={12}>
                          No Record Found
                        </TableCell>
                      </TableRow>
                    ) : null}
                    {displayedData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((staff, index) => (
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
                            style={{ cursor: "pointer" }}
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
                              if (canEdit) {
                                handleEditClick(index);
                                setEditableTarget({
                                  ...editableTarget,
                                  [staff.ReginoalManagerId]:
                                    staff.MonthlyGoalAmount,
                                });
                              }
                            }}
                            style={{ cursor: canEdit ? "pointer" : "default" }}
                          >
                            {editClicked && selectedindex === index ? (
                              <input
                                className="form-control form-control-sm number-input "
                                type="number"
                                value={editableTarget[staff.ReginoalManagerId]}
                                style={{
                                  height: "18px",
                                  minHeight: "18px",
                                  width: "9em",
                                }}
                                ref={(el) => (spanRefs.current[index] = el)}
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
                                      editableTarget[staff.ReginoalManagerId]
                                    ) {
                                      handleTargetBlur(staff.ReginoalManagerId);
                                    }
                                  } else if (e.key === "Escape") {
                                    setEditClicked(false);
                                    setSelectedindex(index);
                                  }
                                }}
                              />
                            ) : (
                              <span>
                                {formatAmount(staff.MonthlyGoalAmount) || 0}
                              </span>
                            )}
                          </TableCell>
                          <TableCell align="left" style={{ width: "4em" }}>
                            {editClicked && selectedindex === index ? (
                              <>
                                <DoneIcon
                                  onClick={() => {
                                    setSelectedindex(index);
                                    if (
                                      staff.MonthlyGoalAmount !==
                                      editableTarget[staff.ReginoalManagerId]
                                    ) {
                                      handleTargetBlur(staff.ReginoalManagerId);
                                    }
                                  }}
                                  style={{
                                    fontSize: "16px",
                                    color: dynamicColorAndLogo?.PrimeryColor || "#77993d",
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
                              canEdit ? (
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
                                    color: dynamicColorAndLogo?.PrimeryColor || "#77993d",
                                  }}
                                />
                              ) : (
                                <Tooltip title="You don't have access" arrow>
                                  <span>
                                    <CreateIcon
                                      style={{
                                        fontSize: "14px",
                                        color: "#ccc",
                                        cursor: "not-allowed",
                                        opacity: 0.6,
                                      }}
                                    />
                                  </span>
                                </Tooltip>
                              )
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
                      ))}
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
                        {Percentage.toFixed(2)}%
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
                      <div className="progress" style={{ width: "50%" }}>
                        <div
                          className={`progress-bar `}
                          style={{
                            width: `${Percentage}%`,
                            height: "5px",
                            borderRadius: "4px",
                            backgroundColor: interpolateColor(Percentage),
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
                    ({months[selectedMonth - 1]} - {selectedYear - 2000})
                  </h4>
                </div>
                <div className="col-md-12 text-center p-0">
                  <Speedometer
                    size={1.6}
                    value={totalAmount || selectedRow.Amount || 0}
                    maxValue={totalTarget || selectedRow.MonthlyGoalAmount || 0}
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
                      month={`${months[selectedMonth - 1]} - ${
                        selectedYear - 2000
                      }`}
                    />
                    <GoalCard
                      title="Achieved"
                      amount={selectedRow.Amount || 0}
                      target={selectedRow.MonthlyGoalAmount || 0}
                      titleAmount={selectedRow.Amount || 0}
                      color="success"
                      month={`${months[selectedMonth - 1]} - ${
                        selectedYear - 2000
                      }`}
                    />
                  </div>
      </div>
    </>
  );
};

export default MonthlyGoalsTable;
