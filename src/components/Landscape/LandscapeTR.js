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
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const LandscapeTR = ({ setRecords, statusId }) => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
  
  const queryParams = new URLSearchParams(window.location.search);
  const customerParam = Number(queryParams.get("CustomerId"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);


  const [reports, setReports] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);

  const navigate = useNavigate();

  // Permissions for Monthly Landscape
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/MonthlyLandsacpe/GetMonthlyLandsacpeList?CustomerId=${customerParam}`,
        { headers }
      );
      response.data.sort((a, b) => b.MonthlyLandsacpeId - a.MonthlyLandsacpeId);
      setReports(response.data);

      setRecords({
        open: response.data.filter((report) => report.StatusId === 1).length,
        closed: response.data.filter((report) => report.StatusId === 2).length,
      });

     
      if (response.data != null) {
        setIsLoading(false);
      }
    } catch (error) {
      console.log("api call error", error);
      setIsLoading(false);
    }
  };

  const [search, setSearch] = useState("");

  let filteredReports = reports
    .filter((report) => statusId === 0 || report.StatusId === statusId)
    .filter(
      (report) =>
        report.RequestByName?.toLowerCase().includes(search.toLowerCase()) ||
        report.DisplayName?.toLowerCase().includes(search.toLowerCase())
    );

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
        </div>
      ) : (
        <div>
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
                {/* {loggedInUser.userRole == "1" && ( */}
                <Authorization allowTo={[1,4,5,6]} hide>
                  {canCreate ? (
                    <AddButton
                      onClick={() => {
                        navigate("/landscape/add-landscape");
                      }}
                    >
                      Add Monthly Landscape
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
                          Add Monthly Landscape
                        </AddButton>
                      </span>
                    </Tooltip>
                  )}
                </Authorization>
                {/* )} */}
              </div>
            </div>
          </div>{" "}
          <TableContainer sx={{ overflowX: "auto",mt:1 }}>
            <Table>
              <TableHead className="table-header ">
                <TableRow className="material-tbl-alignment">
                  {/* <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell> */}
                  {[
                    "#",
                    "Customer Name",
                    "Requested by",
                    "Status",
                    "Date Created",
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
                      key={report.MonthlyLandsacpeId}
                      hover
                      className="material-tbl-alignment"
                    >
                      <TableCell
                        onClick={() => {
                          if (!canEdit) {
                            navigate(`/landscape/landscape-report?id=${report.MonthlyLandsacpeId}${report.CustomerId ? `&CustomerId=${report.CustomerId}` : ''}`);
                            return;
                          }
                          navigate(
                            `/landscape/add-landscape?id=${report.MonthlyLandsacpeId}`
                          );
                        }}
                        style={{ 
                          cursor: canEdit ? "pointer" : "default",
                          opacity: canEdit ? 1 : 0.6
                        }}
                      >
                        {report.MonthlyLandsacpeId}
                      </TableCell>
                      <TableCell>
                        {report.DisplayName}{" "}
                        <NavLink
                          to={`/customers/add-customer?id=${report.CustomerId}`}
                          target="_blank"
                        >
                          <ArrowOutwardIcon style={{ fontSize: 14 }} />
                        </NavLink>
                      </TableCell>

                      <TableCell
                        onClick={() => {
                          if (!canEdit) {
                            navigate(`/landscape/landscape-report?id=${report.MonthlyLandsacpeId}${report.CustomerId ? `&CustomerId=${report.CustomerId}` : ''}`);
                            return;
                          }
                          if (loggedInUser.userRole=="2") {
                            navigate(`/landscape/landscape-report?id=${report.MonthlyLandsacpeId}&CustomerId=${report.CustomerId}`)
                            return
                          }
                          navigate(
                            `/landscape/add-landscape?id=${report.MonthlyLandsacpeId}`
                          );
                        }}
                        style={{ 
                          cursor: canEdit ? "pointer" : "default",
                          opacity: canEdit ? 1 : 0.6
                        }}
                      >
                        {report.RequestByName}
                      </TableCell>

                      <TableCell
                        onClick={() => {
                          if (!canEdit) {
                            navigate(`/landscape/landscape-report?id=${report.MonthlyLandsacpeId}${report.CustomerId ? `&CustomerId=${report.CustomerId}` : ''}`);
                            return;
                          }
                          if (loggedInUser.userRole=="2") {
                            navigate(`/landscape/landscape-report?id=${report.MonthlyLandsacpeId}&CustomerId=${report.CustomerId}`)
                            return
                          }
                          navigate(
                            `/landscape/add-landscape?id=${report.MonthlyLandsacpeId}`
                          );
                        }}
                        style={{ 
                          cursor: canEdit ? "pointer" : "default",
                          opacity: canEdit ? 1 : 0.6
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: report.ReportStatusColor,
                          }}
                          className="span-hover-pointer badge badge-pill  "
                        >
                          {report.ReportStatus}
                        </span>
                      </TableCell>

                      <TableCell
                        onClick={() => {
                          if (!canEdit) {
                            navigate(`/landscape/landscape-report?id=${report.MonthlyLandsacpeId}${report.CustomerId ? `&CustomerId=${report.CustomerId}` : ''}`);
                            return;
                          }
                          if (loggedInUser.userRole=="2") {
                            navigate(`/landscape/landscape-report?id=${report.MonthlyLandsacpeId}&CustomerId=${report.CustomerId}`)
                            return
                          }
                          navigate(
                            `/landscape/add-landscape?id=${report.MonthlyLandsacpeId}`
                          );
                        }}
                        style={{ 
                          cursor: canEdit ? "pointer" : "default",
                          opacity: canEdit ? 1 : 0.6
                        }}
                      >
                        {TblDateFormat(report.MonthDate)}
                      </TableCell>

                      {loggedInUser.userRole == 1 && (
                        <TableCell align="right">
                          {canDelete ? (
                            <DeleteModal
                              endPoint={`MonthlyLandsacpe/DeleteMonthlyLandsacpe`}
                              successFun={fetchReports}
                              deleteId={report.MonthlyLandsacpeId}
                            />
                          ) : (
                            <Tooltip title="You don't have permission to delete monthly landscape reports" arrow>
                              <span>
                                <DeleteModal
                                  endPoint={`MonthlyLandsacpe/DeleteMonthlyLandsacpe`}
                                  successFun={fetchReports}
                                  deleteId={report.MonthlyLandsacpeId}
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
      )}
    </>
  );
};

export default LandscapeTR;
