import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField, 
  TablePagination,
  Checkbox,
  Button,
  Grid,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Cookies from "js-cookie";
import { Delete, Create } from "@mui/icons-material";
import axios from "axios";
import TblDateFormat from "../../custom/TblDateFormat";
import { DataContext } from "../../context/AppData";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import DeleteModal from "../CommonComponents/DeleteModal";
import Authorization from "../Reusable/Authorization";
import TitleBar from "../TitleBar";
import useGetApi from "../Hooks/useGetApi";
import { formatDateToCustomString } from "../Reusable/Utils";
import { formatTimeToCustomString } from "../Reusable/Utils";
import StatusCards from "../Landscape/StatusCards";
import { PDFViewer } from "@react-pdf/renderer";
import SafetyReportPdf from "./SafetyReportPdf";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";
import { ConfirmationModal } from "../../custom/ConfirmationModal";

const SafetyList = () => {
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
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  }; 
  const queryParams = new URLSearchParams(window.location.search);
  const customerParam = Number(queryParams.get("CustomerId"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [statusList, setStatusList] = useState([]);
  const [statusId, setStatusId] = useState(0);
  const [records, setRecords] = useState({});
  console.log("🚀 ~ records:", records)
  
  const [modalOpen, setModalOpen] = useState({ open: false, onConfirm: null });
  const [reports, setReports] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  const { getData } = useGetApi();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  // Permissions for Safety Reports
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  // let filteredReports = reports
  let filteredReports = reports
    .filter((report) => {
      return report.TruckNo?.toLowerCase().includes(search.toLowerCase());
    })
    .filter((report) => statusId === 0 || report.StatusId === statusId);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/SafetyReport/GetSafetyReportList?Search=&DisplayStart=${1}&DisplayLength=${60}&StatusId=${0}&isAscending=${false}`,

        { headers }
      );
      setReports(response?.data);
      // if (Array.isArray(response?.data) && response.data.length > 0) {
      //   setReports(response.data);
      // } else {
      // }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to delete a report
  const deleteReport = async (reportId) => {
    try {
      if (!reportId) {
        return; // Stop execution if reportId is missing
      }

      const response = await axios.get(
        `${baseUrl}/api/SafetyReport/DeleteSafetyReport?id=${reportId}`,
        {
          headers,
          // data: { SafetyFormId: reportId },
        }
      );

      setReports(reports.filter((report) => report.SafetyFormId !== reportId));
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleRowClick = (reportId) => {
    // If no edit access, go to preview
    if (!canEdit) {
      navigate(`/safety-reports/preview?id=${reportId}`);
      return;
    }
    // If edit access, go to edit form
    navigate(`/safety-reports/add?id=${reportId}`);
  };
  const getRecords = (reports) => {
    return {
      open: reports.filter((report) => report.StatusId === 1).length, // Count open reports
      repairs: reports.filter((report) => report.StatusId === 3).length, // Count closed reports
      closed: reports.filter((report) => report.StatusId === 2).length, // Count closed reports
    };
  };

  useEffect(() => {
    setRecords(getRecords(reports)); // Update record counts when reports change
  }, [reports]);

  const fetchStatusList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/SafetyReport/GetSafetyReportStatusList`,
        { headers }
      );

      setStatusList(response.data);
    } catch (error) {
      setStatusList([]);
    }
  };

  useEffect(() => {
    fetchStatusList();
  }, []);
  const truncateString = (str, length) => {
    if (str) {
      if (str.length <= length) {
        return str;
      } else {
        return str.slice(0, length) + "......";
      }
    }
  };
  return (
    <>
      <TitleBar safetyIcon title={"Safety Reports"}></TitleBar>
      <ConfirmationModal
        modalOpen={modalOpen.open}
        setModalOpen={() => setModalOpen({ open: false, onConfirm: null })}
        title="Confirmation"
        description="Are you sure you want to delete this report?"
        onConfirm={() => {
          modalOpen.onConfirm();
          setModalOpen({ open: false, onConfirm: null });
        }}
        confirmText="Delete"
        deleteButton
      />
      <div className="container-fluid">
        <div className="row">
          {" "}
          <StatusCards
            repaircard
            setStatusId={setStatusId}
            statusId={statusId}
            records={records}
          />
        </div>
        {isLoading ? (
          <div className="center-loader">
            <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
          </div>
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="row ">
                <div className="col-md-3">
                  <TextField
                    type="number"
                    label="Search"
                    variant="standard"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-9">
                  <div className="custom-button-container mb-2">
                    {canCreate ? (
                      <AddButton
                        onClick={() => {
                          navigate("/safety-reports/add");
                        }}
                      >
                        Add Safety Report
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
                            Add Safety Report
                          </AddButton>
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>{" "}
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead className="table-header ">
                    <TableRow className="material-tbl-alignment">
                      {/* <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell> */}
                      {[
                        "#",
                        "Date Created",
                        "Foreman",
                        "Truck #",
                        "Status",
                        "Action Items",
                        // "#",
                        // "Customer Name",
                        // "Truck #",
                        // "Date Created",
                        // "Time",
                        // "Safety Inspector",
                        // "City",
                        // "Foreman",
                        // "Status",
                      ].map((headCell) => (
                        <TableCell key={headCell}>{headCell}</TableCell>
                      ))}
                      {loggedInUser.userRole == 1 && (
                        <TableCell align="right">Action</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReports.length <= 0 ? (
                      <TableRow>
                        {" "}
                        <TableCell align="center" colSpan={12}>
                          No Record Found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report, index) => (
                        <TableRow
                          key={index}
                          hover
                          className="material-tbl-alignment"
                        >
                          <TableCell
                            onClick={() => handleRowClick(report.SafetyFormId)}
                            style={{ cursor: "pointer" }}
                          >
                            {index + 1 || "N/A"}
                          </TableCell>
                          <TableCell
                            onClick={() => handleRowClick(report.SafetyFormId)}
                            style={{ cursor: "pointer" }}
                          >
                            {formatDateToCustomString(
                              report.ReportDate || "N/A"
                            )}
                          </TableCell>
                          <TableCell
                            onClick={() => handleRowClick(report.SafetyFormId)}
                            style={{ cursor: "pointer" }}
                          >
                            {report.Foreman || "N/A"}
                          </TableCell>
                          <TableCell
                            onClick={() => handleRowClick(report.SafetyFormId)}
                            style={{ cursor: "pointer" }}
                          >
                            {report.TruckNo || "N/A"}
                          </TableCell>
                          <TableCell
                            onClick={() => handleRowClick(report.SafetyFormId)}
                            style={{ cursor: "pointer" }}
                          >
                            <span
                              style={{
                                backgroundColor: report.ReportStatusColor,
                              }}
                              className="span-hover-pointer badge badge-pill  "
                            >
                              {report.StatusId === 1
                                ? "Open"
                                : report.StatusId === 2
                                ? "Closed"
                                : "Repairs"}
                            </span>
                          </TableCell>
                          <TableCell
                            onClick={() => handleRowClick(report.SafetyFormId)}
                            style={{ cursor: "pointer", maxWidth: "1px" }}
                          >
                            {truncateString(report.ActionItems, 50) || "N/A"}
                          </TableCell>
                         
                          {loggedInUser.userRole == 1 && (
                            <TableCell align="right">
                              {/* Added delete button here */}
                              {canDelete ? (
                                <span
                                  onClick={() => {
                                    setModalOpen(() => ({
                                      open: true,
                                      onConfirm: () =>
                                        deleteReport(report.SafetyFormId),
                                    }));
                                  }}
                                >
                                  <Delete color="error" />
                                </span>
                              ) : (
                                <Tooltip title="You don't have permission to delete safety reports" arrow>
                                  <span>
                                    <Delete color="error" style={{ cursor: "not-allowed", opacity: 0.6 }} />
                                  </span>
                                </Tooltip>
                              )}

                              {/* Delete confirmation modal */}
                              {/* <div
                                className="modal fade"
                                id={`deleteModal${report.SafetyFormId}`}
                                tabIndex="-1"
                                aria-labelledby="deleteModalLabel"
                                aria-hidden="true"
                              >
                                <div className="modal-dialog" role="document">
                                  <div className="modal-content">
                                    <div className="modal-header">
                                      <h5 className="modal-title">
                                        Are you sure you want to delete this
                                        report?
                                      </h5>
                                      <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                      ></button>
                                    </div>
                                    <div className="modal-body text-center">
                                      <button
                                        type="button"
                                        className="btn btn-danger light m-3"
                                        data-bs-dismiss="modal"
                                      >
                                        Close
                                      </button>
                                      <button
                                        className="btn btn-primary m-3"
                                        data-bs-dismiss="modal"
                                        onClick={() =>
                                          deleteReport(report.SafetyFormId)
                                        }
                                      >
                                        Yes, Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div> */}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[100, 200, 300]}
                component="div"
                count={filteredReports.length}
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
        )}
      </div>
    </>
  );
};

export default SafetyList;
