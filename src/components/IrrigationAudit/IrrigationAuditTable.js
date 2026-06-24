import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { NavLink, useNavigate } from "react-router-dom";
import { Delete, Create } from "@mui/icons-material";
import { Button } from "@mui/material";
import formatDate from "../../custom/FormatDate";
import TblDateFormat from "../../custom/TblDateFormat";
import TitleBar from "../TitleBar";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import debounce from "lodash.debounce";
import Authorization from "../Reusable/Authorization";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const IrrigationAuditTable = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  const queryParams = new URLSearchParams(window.location.search);
  const customerParam = Number(queryParams.get("CustomerId"));
  const navigate = useNavigate();

  // Permissions for Irrigation Audit
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.64111 13.5497L9.38482 9.9837L12.5145 12.4421L15.1995 8.97684"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="18.3291"
        cy="3.85021"
        rx="1.76201"
        ry="1.76201"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6808 2.86012H7.01867C4.25818 2.86012 2.54651 4.81512 2.54651 7.57561V14.9845C2.54651 17.7449 4.22462 19.6915 7.01867 19.6915H14.9058C17.6663 19.6915 19.3779 17.7449 19.3779 14.9845V8.53213"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const [irrigationlist, setIrrigationlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [isAscending, setIsAscending] = useState(false);

  const fetchFilteredIrrigation = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    isAscending = false
  ) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/IrrigationAuditReport/GetIrrigationAuditReportServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&isAscending=${isAscending}&CustomerId=${customerParam}`,
        { headers }
      );
      console.log("irrigation data", res.data);
      setIrrigationlist(res.data.Data);
      setTotalRecords(res.data.totalRecords);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIrrigationlist([]);
      setError(error.response.data.Message);
      console.log("error fetching irrigations", error);
    }
  };

  const [tablePage, setTablePage] = useState(0);
  const debouncedGetFilteredIrr = useCallback(
    debounce(fetchFilteredIrrigation, 500),
    []
  );

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    debouncedGetFilteredIrr(search, tablePage + 1, rowsPerPage, isAscending);
  }, [search, tablePage, rowsPerPage, isAscending]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  const filteredIrrigationList = irrigationlist;

  const sortedIrrigationList = filteredIrrigationList;

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, sortedIrrigationList.length - page * rowsPerPage);

  return (
    <>
      <TitleBar icon={icon} title="Controller - Audit" />
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <>
                <div className="card-header flex-wrap d-flex justify-content-between  border-0">
                  <div>
                    <TextField
                      label="Search irrigation"
                      variant="standard"
                      size="small"
                      fullWidth
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="d-flex me-2">
                    <FormControl className="  me-2" variant="outlined">
                      <Select
                        labelId="customer-type-label"
                        variant="outlined"
                        value={isAscending}
                        onChange={() => {
                          setIsAscending(!isAscending);
                        }}
                        size="small"
                      >
                        <MenuItem value={true}>Ascending</MenuItem>
                        <MenuItem value={false}>Descending</MenuItem>
                      </Select>
                    </FormControl>
                    <Authorization allowTo={[1, 4, 5, 6]} hide>
                      {canCreate ? (
                        <AddButton
                          backgroundColor={dynamicColorAndLogo.PrimeryColor}
                          onClick={() => {
                            navigate(`/irrigation-audit/add`);
                            // setShowContent(false);
                          }}
                        >
                          Add Controller Audit
                        </AddButton>
                      ) : (
                        <Tooltip title="You don't have create access" arrow>
                          <span>
                            <AddButton
                              backgroundColor={dynamicColorAndLogo.PrimeryColor}
                              disabled
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              Add Controller Audit
                            </AddButton>
                          </span>
                        </Tooltip>
                      )}
                    </Authorization>
                  </div>
                </div>
                <div className="card-body pt-0">
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table>
                      <TableHead className="table-header">
                        <TableRow className="material-tbl-alignment">
                          <TableCell>#</TableCell>
                          <TableCell>Customer Name</TableCell>
                          <TableCell>Regional Manager</TableCell>
                          <TableCell>Controller Numbers</TableCell>
                          <TableCell>Created Date</TableCell>

                          <TableCell>Report</TableCell>
                          {/* <TableCell align="center">Actions</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center">
                              <div className="center-loader">
                                <CircularProgress
                                    style={{ color: dynamicColorAndLogo.PrimeryColor }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {irrigationlist.length <= 0 && (
                              <TableRow className="material-tbl-alignment">
                                {" "}
                                <TableCell colSpan={12} align="center">
                                  {" "}
                                  No record Found
                                </TableCell>
                              </TableRow>
                            )}
                            {irrigationlist ? (
                              irrigationlist.map((irr, index) => (
                                <TableRow
                                  className="material-tbl-alignment"
                                  hover
                                  key={index}
                                >
                                  <TableCell>
                                    {irr.IrrigationAuditReportId}
                                  </TableCell>
                                  <TableCell>
                                    {irr.CustomerDisplayName}{" "}
                                    <NavLink
                                      to={`/customers/add-customer?id=${irr.CustomerId}`}
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
                                          `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}${irr.CustomerId ? `&CustomerId=${irr.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}&CustomerId=${irr.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/irrigation-audit/add?id=${irr.IrrigationAuditReportId}`
                                      );
                                    }}
                                    style={{ 
                                      cursor: canEdit ? "pointer" : "default",
                                      opacity: canEdit ? 1 : 0.6
                                    }}
                                  >
                                    {irr.RegionalManagerName}
                                  </TableCell>
                                  <TableCell
                                    onClick={() => {
                                      if (!canEdit) {
                                        navigate(
                                          `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}${irr.CustomerId ? `&CustomerId=${irr.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}&CustomerId=${irr.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/irrigation-audit/add?id=${irr.IrrigationAuditReportId}`
                                      );
                                    }}
                                    style={{ 
                                      cursor: canEdit ? "pointer" : "default",
                                      opacity: canEdit ? 1 : 0.6
                                    }}
                                  >
                                    {irr.ControllerNumbers.map(
                                      (number, index) =>
                                        index ===
                                        irr.ControllerNumbers.length - 1
                                          ? number
                                          : number + ", "
                                    )}
                                  </TableCell>

                                  <TableCell
                                    onClick={() => {
                                      if (!canEdit) {
                                        navigate(
                                          `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}${irr.CustomerId ? `&CustomerId=${irr.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}&CustomerId=${irr.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/irrigation-audit/add?id=${irr.IrrigationAuditReportId}`
                                      );
                                    }}
                                    style={{ 
                                      cursor: canEdit ? "pointer" : "default",
                                      opacity: canEdit ? 1 : 0.6
                                    }}
                                  >
                                    {TblDateFormat(irr.CreatedDate)}
                                  </TableCell>

                                  <TableCell>
                                    <NavLink
                                      to={
                                        loggedInUser.userRole == "2"
                                          ? `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}`
                                          : `/irrigation-audit/preview?id=${irr.IrrigationAuditReportId}&CustomerId=${irr.CustomerId}`
                                      }
                                    >
                                      <span className="badge badge-pill badge-success ">
                                        Open
                                      </span>
                                    </NavLink>
                                  </TableCell>
                                  {/* <TableCell>
                                  <div className="flex-box">
                                    <Button
                                      title="Edit"
                                      type="button"
                                      // className="btn btn-primary btn-icon-xxs mx-1"
                                      onClick={() => {
                                        setShowContent(false);
                                        setSelectedIrr(irr.IrrigationId);
                                      }}
                                    >
                                       <i className="fa fa-pen"></i> 
                                      <Create></Create>
                                    </Button>
  
                                    <Button
                                      title="Delete"
                                      type="button"
                                      data-bs-toggle="modal"
                                      data-bs-target={`#deleteModal${irr.IrrigationId}`}
                                      // className="btn btn-danger btn-icon-xxs mx-1"
                                    >
                                 <i className="fa fa-trash"></i> 
                                      <Delete color="error"></Delete>
                                    </Button>
  
                                    <div
                                      className="modal fade"
                                      id={`deleteModal${irr.IrrigationId}`}
                                      tabIndex="-1"
                                      aria-labelledby="deleteModalLabel"
                                      aria-hidden="true"
                                    >
                                      <div
                                        className="modal-dialog modal-dialog-centered"
                                        role="document"
                                      >
                                        <div className="modal-content">
                                          <div className="modal-header">
                                            <h5 className="modal-title">
                                              Irrigation Delete
                                            </h5>
  
                                            <button
                                              type="button"
                                              className="btn-close"
                                              data-bs-dismiss="modal"
                                            ></button>
                                          </div>
                                          <div className="modal-body text-left">
                                            <p>
                                              Are you sure you want to delete{" "}
                                              {irr.IrrigationId}
                                            </p>
                                          </div>
  
                                          <div className="modal-footer">
                                            <button
                                              type="button"
                                              id="closer"
                                              className="btn btn-danger light "
                                              data-bs-dismiss="modal"
                                            >
                                              Close
                                            </button>
                                            <button
                                              className="btn btn-primary "
                                              data-bs-dismiss="modal"
                                              onClick={() => {
                                                deleteIrrigation(
                                                  irr.IrrigationId
                                                );
                                              }}
                                            >
                                              Yes
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell> */}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={12}>
                                  No records found
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[100, 200, 300]}
                    component="div"
                    count={totalRecords}
                    rowsPerPage={rowsPerPage}
                    page={tablePage} // Use tablePage for the table rows
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={(event) => {
                      setRowsPerPage(parseInt(event.target.value, 10));
                      setTablePage(0); // Reset the tablePage to 0 when rowsPerPage changes
                    }}
                  />
                </div>{" "}
              </>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IrrigationAuditTable;
