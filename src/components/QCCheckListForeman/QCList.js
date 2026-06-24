import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TablePagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Cookies from "js-cookie";
import { Delete } from "@mui/icons-material";
import axios from "axios";
import { DataContext } from "../../context/AppData";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import TitleBar from "../TitleBar";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import EventPopups from "../Reusable/EventPopups";
import StatusCards from "../Landscape/StatusCards";
import TblDateFormat from "../../custom/TblDateFormat";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

export const QCList = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reports, setReports] = useState([]);
  const [recordCounts, setRecordCounts] = useState({
    open: 0,
    issue: 0,
    closed: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { loggedInUser } = useContext(DataContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState({ open: false, onConfirm: null });
  
  // Permissions for QC List
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const searchTimeout = useRef(null);
  const [statusId, setStatusId] = useState(0);
  const fetchData = async (
    searchValue = search,
    pageValue = page,
    rowsValue = rowsPerPage,
    statusValue = statusId
  ) => {
    setIsLoading(true);
    try {
      const displayStart = pageValue * rowsValue + 1;
      const response = await axios.get(
        `${baseUrl}/api/ForemanQCChecklist/GetForemanQCChecklistFormServerSideList?Search=${encodeURIComponent(
          searchValue
        )}&DisplayStart=${displayStart}&DisplayLength=${rowsValue}&StatusId=${statusValue}`,
        { headers }
      );
      if(response?.data?.Data){
        setReports(response?.data?.Data || []);
        setTotalCount(response?.data?.totalRecords || 0);
        setRecordCounts({
          open: response?.data?.totalOpenRecords ?? 0,
          issue: response?.data?.totalIssueRecords ?? 0,
          closed: response?.data?.totalClosedRecords ?? 0,
          needApproval: response?.data?.totalNeedApprovalRecords ?? 0,
        });
      }
      else{
        setReports([]);
        setTotalCount(0);
        setRecordCounts({
          open: 0,
          issue: 0,
          closed: 0,
          needApproval: 0,
        });
      }
      setIsLoading(false);
    } catch (error) {
      if (error?.response?.status === 404) {
        setReports([]);
        setTotalCount(0);
        setRecordCounts({
          open: 0,
          issue: 0,
          closed: 0,
          needApproval: 0,
          });
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchData(search, page, rowsPerPage, statusId);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search, page, rowsPerPage, statusId]);

  const deleteReport = async (reportId) => {
    try {
      if (!reportId) return;
      const response = await axios.get(
        `${baseUrl}/api/ForemanQCChecklist/DeleteForemanQCChecklist?id=${reportId}`,
        { headers }
      );
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText(response.data.Message);
      fetchData(search, page, rowsPerPage, statusId);
    } catch (error) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(error.response?.data || "Failed to delete QC Checklist");
    }
  };

  const handleRowClick = (reportId) => {
    // If no edit access, don't navigate
    if (!canEdit) {
      return;
    }
    // If edit access, navigate to edit form
    navigate(`/qc-checklist-foreman/add?id=${reportId}`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <ConfirmationModal
        modalOpen={modalOpen.open}
        setModalOpen={() => setModalOpen({ open: false, onConfirm: null })}
        title="Confirmation"
        description="Are you sure you want to delete this QC checklist?"
        onConfirm={() => {
          modalOpen.onConfirm();
          setModalOpen({ open: false, onConfirm: null });
        }}
        deleteButton
      />
      <TitleBar safetyIcon title={"QC List"} />
      <div className="container-fluid">
        <div className="row">
          {" "}
          <StatusCards
            qcchecklistcard
            setStatusId={setStatusId}
            statusId={statusId}
            records={recordCounts}
          />
        </div>
        <div className="card">
          <div className="card-body">
            <div className="row ">
              <div className="col-md-2">
                <TextField
                  label="Search"
                  variant="standard"
                  size="small"
                  value={search}
                  onChange={handleSearchChange}
                  
                />
              </div>
              <div className="col-md-9">
                {/* <div className="custom-button-container mb-2">
                  <AddButton
                    onClick={() => {
                      navigate("/qc-checklist-foreman/add");
                    }}
                  >
                    Add QC List
                  </AddButton>
                </div> */}
              </div>
            </div>
            <TableContainer sx={{ overflowX: "auto", marginTop: "10px" }}>
              <Table>
                <TableHead className="table-header">
                  <TableRow className="material-tbl-alignment">
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Foreman Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Update</TableCell>
                    {loggedInUser.userRole == 1 && (
                      <TableCell align="right">Action</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={loggedInUser.userRole == 1 ? 6 : 5} className="text-center">
                        <div className="center-loader">
                          <CircularProgress style={{ color: "#789a3d" }} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : reports && reports.length > 0 ? (
                    reports.map((report, index) => (
                      <TableRow
                        key={report.ForemanQCChecklistFormId}
                        hover
                        className="material-tbl-alignment"
                      >
                      
                        <TableCell
                          onClick={() => handleRowClick(report.ForemanQCChecklistFormId)}
                          style={{ 
                            cursor: canEdit ? "pointer" : "default",
                            opacity: canEdit ? 1 : 0.6
                          }}
                        >
                          {report.CustomerCompanyName || "N/A"}
                        </TableCell>
                        <TableCell
                          onClick={() => handleRowClick(report.ForemanQCChecklistFormId)}
                          style={{ 
                            cursor: canEdit ? "pointer" : "default",
                            opacity: canEdit ? 1 : 0.6
                          }}
                        >
                          {(report.ForemanFirstName || "") + (report.ForemanLastName ? " " + report.ForemanLastName : "") || "N/A"}
                        </TableCell>
                        <TableCell
                          onClick={() => handleRowClick(report.ForemanQCChecklistFormId)}
                          style={{ 
                            cursor: canEdit ? "pointer" : "default",
                            opacity: canEdit ? 1 : 0.6
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: report.StatusColor,
                            }}
                            className="span-hover-pointer badge badge-pill  "
                          >
                            {report.Status || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell
                          onClick={() => handleRowClick(report.ForemanQCChecklistFormId)}
                          style={{ 
                            cursor: canEdit ? "pointer" : "default",
                            opacity: canEdit ? 1 : 0.6
                          }}
                        >
                            {TblDateFormat(report?.EditDate)}
                          {/* {report?.EditDate || "N/A"} */} 
                        </TableCell>
                        {loggedInUser.userRole == 1 && (
                          <TableCell align="right">
                            {canDelete ? (
                              <span
                                onClick={() => {
                                  setModalOpen({
                                    open: true,
                                    onConfirm: () => deleteReport(report.ForemanQCChecklistFormId)
                                  });
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <Delete color="error" />
                              </span>
                            ) : (
                              <Tooltip title="You don't have permission to delete QC checklists" arrow>
                                <span>
                                  <Delete color="error" style={{ cursor: "not-allowed", opacity: 0.6 }} />
                                </span>
                              </Tooltip>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell align="center" colSpan={loggedInUser.userRole == 1 ? 6 : 5}>
                        No Record Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};


