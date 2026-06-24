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
  Tooltip,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Cookies from "js-cookie";
import { Delete, Create } from "@mui/icons-material";
import axios from "axios";
import { DataContext } from "../../context/AppData";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import TitleBar from "../TitleBar";
import useGetApi from "../Hooks/useGetApi";
import { formatDateToCustomString } from "../Reusable/Utils";
import { formatTimeToCustomString } from "../Reusable/Utils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import JobForm from "./JobForm";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import useMenuAccess from "../Hooks/useMenuAccess";

const JobList = () => {
  const icon = <WorkOutlineIcon sx={{ color: "#888888", fontSize: 22 }} />;
  const [reports, setReports] = useState([]);

  // Calculate the sum for each numeric column
  const totalFertilizerofBag = reports.reduce(
    (sum, report) => sum + Number(report.FertilizerNoOfBags),
    0
  );
  const totalFlatsofcolour = reports.reduce(
    (sum, report) => sum + Number(report.NoOfFlatsOfColor),
    0
  );
  const totalMulchQuantity = reports.reduce(
    (sum, report) => sum + Number(report.MulchQuantity),
    0
  );
  const totalOverseedingofbags = reports.reduce(
    (sum, report) => sum + Number(report.OverseedingNoOfBags),
    0
  );
  const totalPGRgalBPS = reports.reduce(
    (sum, report) => sum + Number(report.PGR5galBPS),
    0
  );

  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
  const queryParams = new URLSearchParams(window.location.search);
  const customerParam = Number(queryParams.get("CustomerId"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const [isLoading, setIsLoading] = useState(false);
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  const [search, setSearch] = useState("");
  const [openJobPopup, setOpenJobPopup] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState({ open: false, onConfirm: null });
  
  // Get menu access dynamically based on current route
  const menuAccess = useMenuAccess(); // Auto-detects from /job/list route

  let filteredReports = reports.filter(
    (report) =>
      report.CustomerId?.toString().includes(search) ||
      report.RegionalManagerId?.toString().includes(search)
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/CustomerJobForm/GetCustomerJobFormList`,
        { headers }
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        setReports(response.data);
        setIsLoading(false);
      } else {
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // delete Api
  const deleteReport = async (reportId) => {
    try {
      if (!reportId) {
        return;
      }
      const response = await axios.get(
        `${baseUrl}/api/CustomerJobForm/DeleteCustomerJobForm?id=${reportId}`,
        { headers }
      );

      setReports(
        reports.filter((report) => report.CustomerJobFormId !== reportId)
      );
    } catch (error) {}
  };

  const handleOpenPopup = (jobId = null, customer = null) => {
    if (typeof jobId === "object") {
      jobId = null;
    }
    setSelectedJobId(jobId);
    setSelectedCustomer(customer);
    setOpenJobPopup(true);
  };

  const handleClosePopup = () => {
    setOpenJobPopup(false);
    fetchData();
  };

  return (
    <>
      <ConfirmationModal
        modalOpen={modalOpen.open}
        setModalOpen={() => setModalOpen({ open: false, onConfirm: null })}
        title="Confirmation"
        description="Are you sure you want to delete this job?"
        onConfirm={() => {
          modalOpen.onConfirm();
          setModalOpen({ open: false, onConfirm: null });
        }}
        confirmText="Delete"
        deleteButton
      />

      <TitleBar icon={icon} title={"Job List"}></TitleBar>
      <div className="container-fluid">
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
                    label="Search"
                    variant="standard"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-9">
                  <div className="custom-button-container mb-2">
                    {menuAccess.canCreate && !menuAccess.isLoading ? (
                      <AddButton
                        onClick={() => handleOpenPopup(null, selectedCustomer)}
                      >
                        Add Job
                      </AddButton>
                    ) : (
                      <Tooltip title="You don't have create access" arrow>
                        <span>
                          <AddButton
                            disabled={true}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            Add Job
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
                      {[
                        "#",
                        "Customers",
                        "Regional Manager",
                        "Start Date",
                        "Fertilizer # of Bag",
                        "# of Flats of Colour",
                        "Mulch Quantity",
                        "Overseeding # of Bags",
                        "PGR 5gal BPS",
                      ].map((headCell) => (
                        <TableCell key={headCell}>{headCell}</TableCell>
                      ))}
                      {loggedInUser.userRole == 1 && (
                        <TableCell align="right">Actions</TableCell>
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
                          <TableCell>{index + 1 || "NA"}</TableCell>

                          <TableCell>
                            {report.CustomerDisplayName || "N/A"}
                          </TableCell>
                          <TableCell>
                            {report.RegionalManagerFirstName ||
                            report.RegionalManagerLastName
                              ? `${report.RegionalManagerFirstName || ""} ${
                                  report.RegionalManagerLastName || ""
                                }`.trim()
                              : "N/A"}
                          </TableCell>
                          <TableCell
                            onClick={(e) => {
                              if (!menuAccess.canEdit || menuAccess.isLoading) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleOpenPopup(report.CustomerJobFormId);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              report.StartDate
                                ? formatDateToCustomString(report.StartDate)
                                : "N/A"
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>
                                  {report.StartDate
                                    ? formatDateToCustomString(report.StartDate)
                                    : "N/A"}
                                </span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell
                            onClick={(e) => {
                              if (!menuAccess.canEdit || menuAccess.isLoading) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleOpenPopup(report.CustomerJobFormId);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              report.FertilizerNoOfBags || "N/A"
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{report.FertilizerNoOfBags || "N/A"}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell
                            onClick={(e) => {
                              if (!menuAccess.canEdit || menuAccess.isLoading) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleOpenPopup(report.CustomerJobFormId);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              report.NoOfFlatsOfColor || "N/A"
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{report.NoOfFlatsOfColor || "N/A"}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell
                            onClick={(e) => {
                              if (!menuAccess.canEdit || menuAccess.isLoading) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleOpenPopup(report.CustomerJobFormId);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              report.MulchQuantity || "N/A"
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{report.MulchQuantity || "N/A"}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell
                            onClick={(e) => {
                              if (!menuAccess.canEdit || menuAccess.isLoading) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleOpenPopup(report.CustomerJobFormId);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              report.OverseedingNoOfBags || "N/A"
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{report.OverseedingNoOfBags || "N/A"}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell
                            onClick={(e) => {
                              if (!menuAccess.canEdit || menuAccess.isLoading) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              handleOpenPopup(report.CustomerJobFormId);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              report.PGR5galBPS || "N/A"
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{report.PGR5galBPS || "N/A"}</span>
                              </Tooltip>
                            )}
                          </TableCell>

                          {loggedInUser.userRole == 1 && (
                            <TableCell align="right">
                              {menuAccess.canDelete && !menuAccess.isLoading ? (
                                <span
                                  onClick={() => {
                                    setModalOpen(() => ({
                                      open: true,
                                      onConfirm: () =>
                                        deleteReport(report.CustomerJobFormId),
                                    }));
                                  }}
                                >
                                  <Delete color="error" />
                                </span>
                              ) : (
                                <Tooltip title="You don't have access" arrow>
                                  <span>
                                    <span
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      style={{ cursor: "not-allowed", opacity: 0.6 }}
                                    >
                                      <Delete color="error" />
                                    </span>
                                  </span>
                                </Tooltip>
                              )}

                              {/* Delete confirmation modal */}
                              {/* <div
                                className="modal fade"
                                id={`deleteModal${report.CustomerJobFormId}`}
                                tabIndex="-1"
                                aria-labelledby="deleteModalLabel"
                                aria-hidden="true"
                              >
                                <div className="modal-dialog" role="document">
                                  <div className="modal-content">
                                    <div className="modal-header">
                                      <h5 className="modal-title">
                                        Are you sure you want to delete this
                                        job?
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
                                          deleteReport(report.CustomerJobFormId)
                                        }
                                      >
                                        Delete
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
                    {/* Footer row to display the sum of numeric columns */}
                    <TableRow className="material-tbl-alignment">
                      <TableCell
                        colSpan={3}
                        align="left"
                        style={{ fontWeight: "bold" }}
                      >
                        Total:
                      </TableCell>
                      <TableCell></TableCell> {/* Empty cell for spacing */}
                      <TableCell style={{ fontWeight: "bold" }}>
                        {totalFertilizerofBag}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {totalFlatsofcolour}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {totalMulchQuantity}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {totalOverseedingofbags}
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        {totalPGRgalBPS}
                      </TableCell>
                      {loggedInUser.userRole == 1 && <TableCell></TableCell>}{" "}
                      {/* Extra cell for alignment */}
                    </TableRow>
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
      <Dialog
        open={openJobPopup}
        onClose={handleClosePopup}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: { width: "65%", maxWidth: "65%", padding: "0", margin: "0" },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            "&.MuiDialogContent-root": {
              overflowX: "hidden",
              margin: 0,
            },
          }}
        >
          <JobForm
            handleClosePopup={handleClosePopup}
            fromJobList={true}
            jobId={selectedJobId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobList;
