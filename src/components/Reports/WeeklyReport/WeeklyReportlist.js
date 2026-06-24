import React, { useEffect, useState, useContext } from "react";

import TitleBar from "../../TitleBar";
import Cookies from "js-cookie";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  IconButton,
  TablePagination,
  TextField,
} from "@mui/material";
import formatDate from "../../../custom/FormatDate";
import { NavLink, useNavigate } from "react-router-dom";
import TblDateFormat from "../../../custom/TblDateFormat";
import { DataContext } from "../../../context/AppData";
import StatusCards from "../../Landscape/StatusCards";
import AddButton from "../../Reusable/AddButton";
import { baseUrl } from "../../../apiConfig";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import DeleteModal from "../../CommonComponents/DeleteModal";
import Authorization from "../../Reusable/Authorization";
import useMenuAccess from "../../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const WeeklyReportlist = () => {
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
        d="M13.5096 2.53165H7.41104C5.50437 2.52432 3.94146 4.04415 3.89654 5.9499V15.7701C3.85437 17.7071 5.38979 19.3121 7.32671 19.3552C7.35512 19.3552 7.38262 19.3561 7.41104 19.3552H14.7343C16.6538 19.2773 18.1663 17.6915 18.1525 15.7701V7.36798L13.5096 2.53165Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.2688 2.52084V5.18742C13.2688 6.48909 14.3211 7.54417 15.6228 7.54784H18.1482"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0974 14.0786H8.1474"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.2229 10.6388H8.14655"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const navigate = useNavigate();

  const [statusId, setStatusId] = useState(0);
  const [records, setRecords] = useState({});

  const token = Cookies.get("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const queryParams = new URLSearchParams(window.location.search);
  const customerParam = Number(queryParams.get("CustomerId"));

    const { loggedInUser,dynamicColorAndLogo } = useContext(DataContext);
  //   const [weeklyreportsError, setstaffFetchError] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [WeeklyReportData, setWeeklyReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchWeeklyReports = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/WeeklyReport/GetWeeklyReportList?CustomerId=${customerParam}`,
        { headers }
      );
      res.data.sort((a, b) => b.WeeklyReportId - a.WeeklyReportId);
      setWeeklyReportData(res.data);
      setLoading(false);

      setRecords({
        open: res.data.filter((report) => report.StatusId === 1).length,
        closed: res.data.filter((report) => report.StatusId === 2).length,
      });

      setWeeklyReport(false);
      console.log("proposal report data is", res.data);
    } catch (error) {
      console.log("report api call error", error);
      setWeeklyReport(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReports();
  }, []);

  const [search, setSearch] = useState("");

  let filteredReports = WeeklyReportData.filter(
    (report) => statusId === 0 || report.StatusId === statusId
  ).filter(
    (report) =>
      report.RegionalManagerName?.toLowerCase().includes(
        search.toLowerCase()
      ) || report.DisplayName?.toLowerCase().includes(search.toLowerCase())
  );

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

  // Sorting
  const [orderBy, setOrderBy] = useState("UserId");
  const [order, setOrder] = useState("asc");

  // Permissions for Weekly Report
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <>
      <TitleBar icon={icon} title="Weekly Landscape" />
      <div className="container-fluid">
        <div className="row">
          <StatusCards
            setStatusId={setStatusId}
            statusId={statusId}
            records={records}
          />

          <div className="col-md-12">
            <div className="card">
              <div className="card-header flex-wrap d-flex justify-content-between  border-0">
                <div className="col-md-3">
                  <TextField
                    label="Search"
                    variant="standard"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className=" me-2">
                  {/* {loggedInUser.userRole == "1" && ( */}
                  <Authorization allowTo={[1,4,5,6]} hide>
                    {canCreate ? (
                      <AddButton
                        onClick={() => {
                          navigate("/weekly-reports/add-weekly-report");
                        }}
                      >
                        Add Weekly Report
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
                            Add Weekly Report
                          </AddButton>
                        </span>
                      </Tooltip>
                    )}
                  </Authorization>
                 {/* )} */}
                </div>
              </div>
              <div className="card-body pt-0">
                <div className="table-responsive">
                  {loading ? (
                    <div className="center-loader">
                      <CircularProgress />
                    </div>
                  ) : (
                    <TableContainer sx={{ overflowX: "auto" }}>
                      <Table>
                        <TableHead className="table-header">
                          <TableRow className="material-tbl-alignment">
                            <TableCell className="ms-3">#</TableCell>

                            <TableCell>Assign / Appointment</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            {loggedInUser.userRole == 1 && (
                              <TableCell align="right">Actions</TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {weeklyReport ? (
                            <TableRow>
                              <TableCell className="text-center" colSpan={12}>
                                No Record Found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredReports
                              .slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                              )
                              .map((staff) => (
                                <TableRow
                                  className="material-tbl-alignment"
                                  hover
                                  key={staff.WeeklyReportId}
                                >
                                  <TableCell
                                    onClick={() => {
                                      if (!canEdit) {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}${staff.CustomerId ? `&CustomerId=${staff.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole=="2") {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}&CustomerId=${staff.CustomerId}`
                                        );
                                        return
                                      }
                                      navigate(
                                        `/weekly-reports/add-weekly-report?id=${staff.WeeklyReportId}`
                                      );
                                    }}
                                    className="ms-3"
                                    style={{ 
                                      cursor: canEdit ? "pointer" : "default",
                                      opacity: canEdit ? 1 : 0.6
                                    }}
                                  >
                                    {staff.WeeklyReportId}
                                  </TableCell>
                                  <TableCell
                                    onClick={() => {
                                      if (!canEdit) {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}${staff.CustomerId ? `&CustomerId=${staff.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole=="2") {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}&CustomerId=${staff.CustomerId}`
                                        );
                                        return
                                      }
                                      navigate(
                                        `/weekly-reports/add-weekly-report?id=${staff.WeeklyReportId}`
                                      );
                                    }}
                                    style={{ 
                                      cursor: canEdit ? "pointer" : "default",
                                      opacity: canEdit ? 1 : 0.6
                                    }}
                                  >
                                    {staff.RegionalManagerName}
                                  </TableCell>
                                  <TableCell>
                                    {staff.DisplayName}{" "}
                                    <NavLink
                                      to={`/customers/add-customer?id=${staff.CustomerId}`}
                                      target="_blank"
                                    >
                                      <ArrowOutwardIcon
                                        style={{ fontSize: 14 }}
                                      />
                                    </NavLink>
                                  </TableCell>
                                  <TableCell
                                    onClick={() => {
                                      if (!canEdit) {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}${staff.CustomerId ? `&CustomerId=${staff.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole=="2") {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}&CustomerId=${staff.CustomerId}`
                                        );
                                        return
                                      }
                                      navigate(
                                        `/weekly-reports/add-weekly-report?id=${staff.WeeklyReportId}`
                                      );
                                    }}
                                    style={{ 
                                      cursor: canEdit ? "pointer" : "default",
                                      opacity: canEdit ? 1 : 0.6
                                    }}
                                  >
                                    <span
                                      style={{
                                        backgroundColor:
                                          staff.ReportStatusColor,
                                      }}
                                      className="span-hover-pointer badge badge-pill  "
                                    >
                                      {staff.ReportStatus}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    onClick={() => {
                                      if (!canEdit) {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}${staff.CustomerId ? `&CustomerId=${staff.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole=="2") {
                                        navigate(
                                          `/weekly-reports/weekly-report-preview?id=${staff.WeeklyReportId}&CustomerId=${staff.CustomerId}`
                                        );
                                        return
                                      }
                                      navigate(
                                        `/weekly-reports/add-weekly-report?id=${staff.WeeklyReportId}`
                                      );
                                    }}
                                    style={{ 
                                      cursor: canEdit ? "pointer" : "default",
                                      opacity: canEdit ? 1 : 0.6
                                    }}
                                  >
                                    {TblDateFormat(staff.CreatedDate)}
                                  </TableCell>
                                  {loggedInUser.userRole == 1 && (
                                    <TableCell align="right">
                                      {canDelete ? (
                                        <DeleteModal
                                          endPoint={`WeeklyReport/DeleteWeeklyReport`}
                                          successFun={fetchWeeklyReports}
                                          deleteId={staff.WeeklyReportId}
                                        />
                                      ) : (
                                        <Tooltip title="You don't have permission to delete weekly reports" arrow>
                                          <span>
                                            <DeleteModal
                                              endPoint={`WeeklyReport/DeleteWeeklyReport`}
                                              successFun={fetchWeeklyReports}
                                              deleteId={staff.WeeklyReportId}
                                              disabled={true}
                                            />
                                          </span>
                                        </Tooltip>
                                      )}
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  <TablePagination
                    rowsPerPageOptions={[100, 200, 300]}
                    component="div"
                    count={filteredReports.length}
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
      </div>
    </>
  );
};

export default WeeklyReportlist;
