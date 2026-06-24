import React, { useContext, useEffect, useState } from "react";
import TitleBar from "../TitleBar";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Create, Delete } from "@mui/icons-material";
import AddStaff from "./AddStaff";
import Alert from "@mui/material/Alert";
import Cookies from "js-cookie";
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
  TableSortLabel,
  TextField,
  Tooltip,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import useQuickBook from "../Hooks/useQuickBook";
import AddButton from "../Reusable/AddButton";
import EventPopups from "../Reusable/EventPopups";
import { baseUrl } from "../../apiConfig";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";

const StaffList = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { dynamicColorAndLogo } = useContext(DataContext);
  const [staffData, setStaffData] = useState([]);
  const [toggleAddStaff, settoggleAddStaff] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(0);
  const [addStaffSuccess, setAddStaffSuccess] = useState(false);
  const [updateStaffSuccess, setUpdateStaffSuccess] = useState(false);
  const [deleteStaffSuccess, setDeleteStaffSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffFetchError, setstaffFetchError] = useState(false);
  const [modalOpen, setModalOpen] = useState({
    open: false,
    onConfirm: null,
    message: "",
  });

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  
  // Get menu access dynamically based on current route
  const menuAccess = useMenuAccess(); // Auto-detects from /staff route

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

  const { syncQB } = useQuickBook();

  const navigate = useNavigate();

  const getStaffList = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Staff/GetStaffList`, {
        headers,
      });
      setstaffFetchError(false);
      setStaffData(response.data);
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

  useEffect(() => {
    getStaffList();
  }, []);

  const deleteStaff = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Staff/DeleteStaff?id=${id}`,
        { headers }
      );

      syncQB(response.data.SyncId);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(response.data.Message);

      // console.log("staff deleted successfully");
      getStaffList();
    } catch (error) {
      console.log("error deleting staff", error);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("error deleting staff");
    }
  };

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [search, setSearch] = useState("");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredStaffData = staffData.filter((staff) => {
    return (
      staff.Email.toLowerCase().includes(search.toLowerCase()) ||
      staff.FirstName.toLowerCase().includes(search.toLowerCase()) ||
      staff.LastName.toLowerCase().includes(search.toLowerCase())
      // ||staff.Role.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <TitleBar icon={icon} title="Staff Management" />
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <ConfirmationModal
        modalOpen={modalOpen.open}
        setModalOpen={() =>
          setModalOpen({ open: false, onConfirm: null, message: "" })
        }
        title="Confirmation"
        description={modalOpen.message}
        onConfirm={() => {
          modalOpen.onConfirm();
          setModalOpen({ open: false, onConfirm: null, message: "" });
        }}
        confirmText="Delete"
        deleteButton
      />

      {isLoading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
        </div>
      ) : (
        <div className="container-fluid">
          <div className="card">
            {addStaffSuccess && (
              <Alert severity="success">Staff Added Successfully</Alert>
            )}
            {updateStaffSuccess && (
              <Alert severity="success">Staff Updated Successfully</Alert>
            )}
            {deleteStaffSuccess && (
              <Alert severity="success">Staff Deleted Successfully</Alert>
            )}

            <div className="card-header border-0">
              <div className="col-md-3">
                <TextField
                  label="Search Staff"
                  variant="standard"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <div className="text-right mt-2  ">
                  {(menuAccess.canCreate || menuAccess.canEdit) && !menuAccess.isLoading ? (
                    <AddButton
                      onClick={() => {
                        navigate(`/staff/add-staff`);
                      }}
                    >
                      Add Staff
                    </AddButton>
                  ) : (
                    <Tooltip title="You don't have access" arrow>
                      <span>
                        <AddButton
                          disabled={true}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Add Staff
                        </AddButton>
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body pt-0">
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead className="table-header">
                    <TableRow className="material-tbl-alignment">
                      <TableCell className="ms-3">#</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>User Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffFetchError ? (
                      <TableRow>
                        <TableCell className="text-center" colSpan={12}>
                          No Record Found
                        </TableCell>
                      </TableRow>
                    ) : null}
                    {filteredStaffData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((staff) => (
                        <TableRow
                          className="material-tbl-alignment"
                          hover
                          key={staff.UserId}
                        >
                          <TableCell
                            onClick={(e) => {
                              if (!menuAccess.canEdit || menuAccess.isLoading) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              navigate(`/Staff/Add-Staff?id=${staff.UserId}`);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              staff.UserId
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{staff.UserId}</span>
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
                              navigate(`/Staff/Add-Staff?id=${staff.UserId}`);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              staff.FirstName
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{staff.FirstName}</span>
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
                              navigate(`/Staff/Add-Staff?id=${staff.UserId}`);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              staff.LastName
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{staff.LastName}</span>
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
                              navigate(`/Staff/Add-Staff?id=${staff.UserId}`);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              staff.Email
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{staff.Email}</span>
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
                              navigate(`/Staff/Add-Staff?id=${staff.UserId}`);
                            }}
                            style={{
                              cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                              opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                            }}
                          >
                            {menuAccess.canEdit && !menuAccess.isLoading ? (
                              staff.Role
                            ) : (
                              <Tooltip title="You don't have access" arrow>
                                <span>{staff.Role}</span>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {menuAccess.canDelete && !menuAccess.isLoading ? (
                              <span
                                onClick={() => {
                                  setModalOpen({
                                    open: true,
                                    message: `Are you sure you want to delete ${staff.FirstName}?`,
                                    onConfirm: () => deleteStaff(staff.UserId),
                                  });
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
                            {/* <div
                              className="modal fade"
                              id={`deleteModal${staff.UserId}`}
                              tabIndex="-1"
                              aria-labelledby="deleteModalLabel"
                              aria-hidden="true"
                            >
                              <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title">
                                      Are you sure you want to delete{" "}
                                      {staff.FirstName}
                                    </h5>
                                    <button
                                      type="button"
                                      className="btn-close"
                                      data-bs-dismiss="modal"
                                    ></button>
                                  </div>
                                  <div className="modal-body">
                                    <div className="basic-form text-center">
                                      <button
                                        type="button"
                                        id="closer"
                                        className="btn btn-danger light m-3"
                                        data-bs-dismiss="modal"
                                      >
                                        Close
                                      </button>
                                      <button
                                        className="btn btn-primary m-3"
                                        data-bs-dismiss="modal"
                                        onClick={() => {
                                          deleteStaff(staff.UserId);
                                        }}
                                      >
                                        Yes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div> */}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[
                  10,
                  25,
                  50,
                  { label: "All", value: staffData.length },
                ]}
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
      )}
    </>
  );
};

export default StaffList;
