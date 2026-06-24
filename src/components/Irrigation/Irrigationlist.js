import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import IrrigationForm from "./IrrigationForm";
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
  Checkbox,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { NavLink, useNavigate } from "react-router-dom";
import { Delete, Create } from "@mui/icons-material";
import { Button } from "@mui/material";
import formatDate from "../../custom/FormatDate";
import TblDateFormat from "../../custom/TblDateFormat";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import debounce from "lodash.debounce";
import { DataContext } from "../../context/AppData";
import Authorization from "../Reusable/Authorization";
import HandleDelete from "../Reusable/HandleDelete";
import DeleteAllModal from "../Reusable/DeleteAllModal";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const Irrigationlist = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  const queryParams = new URLSearchParams(window.location.search);
  const customerParam = Number(queryParams.get("CustomerId"));
  const navigate = useNavigate();

  // Permissions for Irrigation
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const [irrigationlist, setIrrigationlist] = useState([]);
  const [showContent, setShowContent] = useState(true);
  const [selectedIrr, setSelectedIrr] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successres, setSuccessres] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [orderBy, setOrderBy] = useState("IrrigationId");
  const [order, setOrder] = useState("asc");
  const [searchText, setSearchText] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIrrigation, setSelectedIrrigation] = useState([]);
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrderBy(property);
    setOrder(isAsc ? "desc" : "asc");
  };

  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        `${baseUrl}/api/Irrigation/GetIrrigationServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&isAscending=${isAscending}&CustomerId=${customerParam}`,
        { headers }
      );
      console.log("🚀 ~ Irrigationlist ~ res:", res);

      setIrrigationlist(res.data.Data);
      setTotalRecords(res.data.totalRecords);
      setIsLoading(false);
      setSelectedIrrigation([]);
    } catch (error) {
      setIsLoading(false);
      setIrrigationlist([]);
      setError(error.response.data.Message);
      setSelectedIrrigation([]);
      console.log("error fetching irrigations", error);
    }
  };
  const debouncedGetFilteredIrrigation = useCallback(
    debounce(fetchFilteredIrrigation, 500),
    []
  );
  const [tablePage, setTablePage] = useState(0);

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    debouncedGetFilteredIrrigation(
      search,
      tablePage + 1,
      rowsPerPage,
      isAscending
    );
  }, [search, tablePage, rowsPerPage, isAscending]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  const filteredIrrigationList = irrigationlist;

  const sortedIrrigationList = filteredIrrigationList;

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, sortedIrrigationList.length - page * rowsPerPage);
  const handleCheckboxChange = (event, IrrigationId) => {
    if (event.target.checked) {
      // Checkbox is checked, add the estimateId to the selectedEstimates array
      setSelectedIrrigation((prevSelected) => [...prevSelected, IrrigationId]);
    } else {
      // Checkbox is unchecked, remove the estimateId from the selectedEstimates array
      setSelectedIrrigation((prevSelected) =>
        prevSelected.filter((id) => id !== IrrigationId)
      );
    }
  };
  const isRowSelected = (IrrigationId) =>
    selectedIrrigation.includes(IrrigationId);
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all rows
      if (Array.isArray(irrigationlist)) {
        const allirrigation = irrigationlist?.map(
          (irrigation) => irrigation?.IrrigationId
        );

        setSelectedIrrigation(allirrigation);
        setSelectAll(true);
      } else {
        // Handle the case where filteredEstimates is not an array
        console.error("filteredEstimates is not an array");
      }
    } else {
      // Deselect all rows
      setSelectedIrrigation([]);
      setSelectAll(false);
    }
  };
  return (
    <>
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
                    <div className="me-2">
                      {selectedIrrigation?.length >= 1 && (
                        <DeleteAllModal
                          selectedItems={selectedIrrigation}
                          endpoint="Irrigation/DeleteAllSelectedIrrigation"
                          bindingFunction={(
                            search = "",
                            page = 1,
                            isAsc = false
                          ) =>
                            fetchFilteredIrrigation(search, page, 100, isAsc)
                          }
                          disabled={!canDelete || menuAccess?.isLoading}
                          tooltipMessage="You don't have permission to delete irrigation records"
                        />
                      )}
                    </div>
                    <FormControl className=" mt-2 me-2" variant="outlined">
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
                            navigate(`/Irrigation/add-irrigation`);
                            // setShowContent(false);
                          }}
                        >
                          Add Irrigation
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
                              Add Irrigation
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
                          <TableCell>
                            {" "}
                            <Checkbox
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          </TableCell>
                          <TableCell>#</TableCell>
                          <TableCell>Customer Name</TableCell>
                          <TableCell>Regional Manager</TableCell>

                          <TableCell>Controllers #</TableCell>
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
                                  className={`material-tbl-alignment ${
                                    isRowSelected(irr.IrrigationId)
                                      ? "selected-row"
                                      : ""
                                  }`}
                                  key={index}
                                  hover
                                >
                                  <TableCell>
                                    {" "}
                                    <Checkbox
                                      checked={selectedIrrigation?.includes(
                                        irr.IrrigationId
                                      )}
                                      onChange={(e) =>
                                        handleCheckboxChange(
                                          e,
                                          irr.IrrigationId
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>{irr.IrrigationId}</TableCell>
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
                                          `/Irrigation/audit-report?id=${irr.IrrigationId}${irr.CustomerId ? `&CustomerId=${irr.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/Irrigation/audit-report?id=${irr.IrrigationId}&CustomerId=${irr.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/Irrigation/add-irrigation?id=${irr.IrrigationId}`
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
                                          `/Irrigation/audit-report?id=${irr.IrrigationId}${irr.CustomerId ? `&CustomerId=${irr.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/Irrigation/audit-report?id=${irr.IrrigationId}&CustomerId=${irr.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/Irrigation/add-irrigation?id=${irr.IrrigationId}`
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
                                          `/Irrigation/audit-report?id=${irr.IrrigationId}${irr.CustomerId ? `&CustomerId=${irr.CustomerId}` : ''}`
                                        );
                                        return;
                                      }
                                      if (loggedInUser.userRole == "2") {
                                        navigate(
                                          `/Irrigation/audit-report?id=${irr.IrrigationId}&CustomerId=${irr.CustomerId}`
                                        );
                                        return;
                                      }
                                      navigate(
                                        `/Irrigation/add-irrigation?id=${irr.IrrigationId}`
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
                                          ? `/Irrigation/audit-report?id=${irr.IrrigationId}&CustomerId=${irr.CustomerId}`
                                          : `/Irrigation/audit-report?id=${irr.IrrigationId}`
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
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Irrigationlist;
