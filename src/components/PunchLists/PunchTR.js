import React, { useEffect, useState, useCallback, useContext } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Form } from "react-bootstrap";
import punchList from "../../assets/images/1.jpg";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  TableRow,
  TableSortLabel,
  Button,
  TablePagination,
  IconButton,
  TableContainer,
  Typography,
  Box,
  Checkbox,
  Paper,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Add, Delete, Create } from "@mui/icons-material";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import Cookies from "js-cookie";
import PunchListDetailRow from "./PunchListDetailRow";
import formatDate from "../../custom/FormatDate";
import TblDateFormat from "../../custom/TblDateFormat";
import EventPopups from "../Reusable/EventPopups";
import { NavLink, useNavigate } from "react-router-dom";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import debounce from "lodash.debounce";
import useGetApi from "../Hooks/useGetApi";
import Authorization from "../Reusable/Authorization";
import { DataContext } from "../../context/AppData";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const PunchTR = ({
  punchData,
  setPunchData,
  fetchFilterdPunchList,
  setselectedPL,
  statusId,
  setPlDetailId,
  totalRecords,
  setAddPunchListData,
  isLoading,
}) => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sorting, setSorting] = useState({ field: "", order: "" });
  const [modalOpen, setModalOpen] = useState({
    open: false,
    onConfirm: null,
    message: "",
  });
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const { getData, data, isloading } = useGetApi();
  const [selectedPl, setSelectedPl] = useState(null);

  const [expandedRow, setExpandedRow] = useState(-1); // By default, no row is expanded.
  const { loggedInUser, dynamicColorAndLogo } = useContext(DataContext);
  
  const theme = createTheme({
    palette: {
      primary: {
        main: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
      },
    },
    typography: {
      fontSize: 14, // Making font a bit larger
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "8px 16px", // Adjust cell padding to reduce height
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
            "&.Mui-checked": {
              color: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            "&:focus": {
              borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
            },
          },
        },
      },
    },
  });
  const queryParams = new URLSearchParams(window.location.search);
  const customerParam = Number(queryParams.get("CustomerId"));

  const navigate = useNavigate();

  // Permissions for Punchlist
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;

  const handleSearch = (data) => {
    // Always return the original data without filtering
    return data;
  };
  const closeAllPl = async (id) => {
    getData(`/PunchList/CloseAllPunchlistDetails?PunchlistId=${id}`, () => {
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText("Successfully closed Punchlist");
      fetchFilterdPunchList(
        searchPL,
        tablePage + 1,
        rowsPerPage,
        statusId,
        isAscending,
        () => {
          setStatusloading(false);
        },
        false
      );
    });
  };

  const [tablePage, setTablePage] = useState(0);
  const [searchPL, setSearchPL] = useState("");
  const [isAscending, setIsAscending] = useState(false);
  const [statusloading, setStatusloading] = useState(false);
  const debouncedGetFilteredPl = useCallback(
    debounce(fetchFilterdPunchList, 500),
    []
  );

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    debouncedGetFilteredPl(
      searchPL,
      tablePage + 1,
      rowsPerPage,
      statusId,
      isAscending,
      () => {},
      true,
      customerParam
    );
  }, [searchPL, tablePage, rowsPerPage, statusId, isAscending]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };
  const [sortedAndSearchedCustomers, setSortedAndSearchedCustomers] = useState(
    []
  );

  useEffect(() => {
    setSortedAndSearchedCustomers(
      handleSearch([...punchData]).sort((a, b) => {
        const { field, order } = sorting;

        if (field && order) {
          if (order === "asc") {
            return a[field] > b[field] ? 1 : -1;
          }
          if (order === "desc") {
            return a[field] < b[field] ? 1 : -1;
          }
        }
        return 0;
      })
    );
  }, [punchData, sorting]);
  const deletePunchList = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/PunchList/DeletePunchlist?id=${id}`,
        {
          headers,
        }
      );
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("PunchList Deleted Successfully");

      fetchFilterdPunchList();
      // Handle the response. For example, you can reload the customers or show a success message
      console.log("Customer deleted successfully:", response.data);
      // window.location.reload();
    } catch (error) {
      console.error("There was an error deleting the customer:", error);
    }
  };

  const handleDelete = (id) => {
    deletePunchList(id);
  };

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      {/* <div
        className="modal fade"
        id={`closeAllPlModal`}
        tabIndex="-1"
        aria-labelledby="closeAllPlModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Punch List Delete</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body text-center">
              <p>Are you sure you want Close this Punchlist</p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                id="closer"
                className="btn btn-danger light "
                data-bs-dismiss="modal"
                onClick={() => {
                  setSelectedPl(null);
                }}
              >
                Close
              </button>
              <button
                className="btn btn-primary "
                data-bs-dismiss="modal"
                onClick={() => {
                  closeAllPl(selectedPl);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div> */}
      <ConfirmationModal
        modalOpen={selectedPl}
        setModalOpen={setSelectedPl}
        title="Confirmation"
        description={<>Are you sure you want Close this PunchList</>}
        onConfirm={() => {
          closeAllPl(selectedPl);
          setSelectedPl(null);
        }}
        onClose={() => {
          setSelectedPl(null);
        }}
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
      <ThemeProvider theme={theme}>
        <div className="card-header flex-wrap d-flex justify-content-between  border-0">
          <div>
            <TextField
              label="Search PunchList"
              variant="standard"
              size="small"
              fullWidth
              value={searchPL}
              onChange={(e) => setSearchPL(e.target.value)}
              sx={{
                "& .MuiInput-underline:after": {
                  borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottomColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                },
              }}
            />
          </div>
          <div className=" me-2">
            <FormControl className="  me-2" variant="outlined">
              <Select
                style={{ width: "9em" }}
                labelId="customer-type-label"
                variant="outlined"
                value={isAscending}
                onChange={() => {
                  setIsAscending(!isAscending);
                }}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: dynamicColorAndLogo?.PrimeryColor || "#7c9c3d",
                  },
                }}
              >
                <MenuItem value={true}>Ascending(oldest on top)</MenuItem>
                <MenuItem value={false}>Descending(Latest on top)</MenuItem>
              </Select>
            </FormControl>
            <Authorization allowTo={[1, 4, 5, 6]} hide>
              {canCreate ? (
                <button
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#editPunch"
                  onClick={() => {
                    setAddPunchListData({});
                  }}
                >
                  + Add PunchList
                </button>
              ) : (
                <Tooltip title="You don't have create access" arrow>
                  <span>
                    <button
                      className="btn btn-primary"
                      disabled
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      + Add PunchList
                    </button>
                  </span>
                </Tooltip>
              )}
            </Authorization>
          </div>
        </div>

        <div className="card-body pt-0">
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow className="table-header">
                  <TableCell></TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Regional Manager</TableCell>
                  <TableCell>Date Created</TableCell>

                  <TableCell>Status</TableCell>
                  <Authorization allowTo={[1, 4, 5, 6]} hide>
                    <TableCell align="right">Actions</TableCell>
                  </Authorization>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center">
                      <div className="center-loader">
                        <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {sortedAndSearchedCustomers.length <= 0 && (
                      <TableRow className="material-tbl-alignment">
                        {" "}
                        <TableCell colSpan={12} align="center">
                          {" "}
                          No record Found
                        </TableCell>
                      </TableRow>
                    )}
                    {sortedAndSearchedCustomers.map((item, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        <TableRow
                          hover
                          style={{
                            backgroundColor:
                              rowIndex === expandedRow ? "#eff3f6" : "",
                            borderBottom: 0,
                          }}
                        >
                          <TableCell
                            style={{
                              borderBottom: 0,
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            {item.DetailDataList.length <= 0 ? null : (
                              <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation(); // This prevents the TableRow's onClick from being called
                                  setExpandedRow(
                                    rowIndex === expandedRow ? -1 : rowIndex
                                  );
                                }}
                              >
                                {rowIndex === expandedRow ? (
                                  <KeyboardArrowUpIcon />
                                ) : (
                                  <KeyboardArrowDownIcon />
                                )}
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell
                            style={{
                              borderBottom: 0,
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            {item.Data.CustomerDisplayName}{" "}
                            <NavLink
                              to={`/customers/add-customer?id=${item.Data.CustomerId}`}
                              target="_blank"
                            >
                              <ArrowOutwardIcon style={{ fontSize: 14 }} />
                            </NavLink>
                          </TableCell>
                          <TableCell
                            style={{
                              borderBottom: 0,
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            {item.Data.Title}
                          </TableCell>
                          <TableCell
                            style={{
                              borderBottom: 0,
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            {item.Data.AssignToName}
                          </TableCell>
                          <TableCell
                            style={{
                              borderBottom: 0,
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            {TblDateFormat(item.Data.CreatedDate)}
                          </TableCell>
                          <TableCell
                            style={{
                              borderBottom: 0,
                              borderTop: "1px solid #ccc",
                            }}
                          >
                            <span
                              style={{
                                cursor: "pointer",
                                backgroundColor: item.Data.StatusColor,
                              }}
                              onClick={() => {
                                if (loggedInUser.userRole == "2") {
                                  navigate(
                                    `/PunchlistPreview?id=${item.Data.PunchlistId}&CustomerId=${item.Data.CustomerId}`
                                  );
                                  return;
                                }
                                navigate(
                                  `/PunchlistPreview?id=${item.Data.PunchlistId}`
                                );
                              }}
                              className="badge badge-pill "
                            >
                              {item.Data.Status}
                            </span>
                          </TableCell>
                          {/* <TableCell>{item.Data.Reports}</TableCell> */}
                          <Authorization allowTo={[1, 4, 5, 6]} hide>
                            <TableCell
                              align="right"
                              style={{
                                borderBottom: 0,
                                borderTop: "1px solid #ccc",
                              }}
                            >
                              <div className="w-auto d-flex justify-content-end">
                                {item.Data.Status == "Pending" ? (
                                  <span
                                    style={{
                                      cursor: "pointer ",
                                      backgroundColor: "#77993d",
                                      height: "fit-content",
                                    }}
                                    onClick={() => {
                                      setSelectedPl(item.Data.PunchlistId);
                                    }}
                                    className="badge badge-pill me-2 closeAllPlModal"
                                    // data-bs-toggle="modal"
                                    // data-bs-target={`#closeAllPlModal`}
                                  >
                                    Close All
                                  </span>
                                ) : (
                                  <></>
                                )}
                                <Button
                                  className="delete-button"
                                  onClick={() => {
                                    navigate(
                                      `/PunchlistPreview?id=${item.Data.PunchlistId}`
                                    );
                                  }}
                                >
                                  <PrintOutlinedIcon
                                    style={{ color: "#212121" }}
                                  />
                                </Button>

                                <Button
                                  className="delete-button"
                                  data-bs-toggle="modal"
                                  data-bs-target="#addPhotos"
                                  onClick={() => {
                                    setselectedPL(item.Data.PunchlistId);
                                  }}
                                >
                                  <Add />
                                </Button>
                                {canEdit ? (
                                  <Button
                                    //  className=" btn btn-primary  btn-icon-xxs me-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#editPunch"
                                    onClick={() => {
                                      setselectedPL(item.Data.PunchlistId);
                                    }}
                                  >
                                    {/* <i className="fas fa-pencil-alt"></i> */}
                                    <Create></Create>
                                  </Button>
                                ) : (
                                  <Tooltip title="You don't have permission to edit this punchlist" arrow>
                                    <span>
                                      <Button
                                        disabled
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      >
                                        <Create style={{ opacity: 0.6 }}></Create>
                                      </Button>
                                    </span>
                                  </Tooltip>
                                )}

                                {canDelete ? (
                                  <Button
                                    onClick={() => {
                                      setModalOpen({
                                        open: true,
                                        message: `Are you sure you want to delete ${item.Data.Title}?`,
                                        onConfirm: () =>
                                          handleDelete(item.Data.PunchlistId),
                                      });
                                    }}
                                    // data-bs-toggle="modal"
                                    // data-bs-target={`#deleteModal${item.Data.PunchlistId}`}
                                    className="btn btn-danger btn-icon-xxs "
                                  >
                                    {/* <i className="fas fa-trash-alt"></i> */}
                                    <Delete color="error"></Delete>
                                  </Button>
                                ) : (
                                  <Tooltip title="You don't have permission to delete this punchlist" arrow>
                                    <span>
                                      <Button
                                        disabled
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      >
                                        <Delete color="error" style={{ opacity: 0.6 }}></Delete>
                                      </Button>
                                    </span>
                                  </Tooltip>
                                )}
                              </div>
                              {/* <div
                                className="modal fade"
                                id={`deleteModal${item.Data.PunchlistId}`}
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
                                        Punch List Delete
                                      </h5>

                                      <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                      ></button>
                                    </div>
                                    <div className="modal-body text-center">
                                      <p>
                                        Are you sure you want to delete{" "}
                                        {item.Data.Title}
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
                                          handleDelete(item.Data.PunchlistId);
                                        }}
                                      >
                                        Yes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div> */}
                            </TableCell>
                          </Authorization>
                        </TableRow>

                        <PunchListDetailRow
                          fetchFilterdPunchList={() => {
                            fetchFilterdPunchList(
                              searchPL,
                              tablePage + 1,
                              rowsPerPage,
                              statusId,
                              isAscending,
                              () => {
                                setStatusloading(false);
                              },
                              false
                            );
                          }}
                          setPunchData={setSortedAndSearchedCustomers}
                          headers={headers}
                          item={item}
                          rowIndex={rowIndex}
                          expandedRow={expandedRow}
                          setPlDetailId={setPlDetailId}
                          setselectedPL={setselectedPL}
                          plId={item.Data.PunchlistId}
                          statusloading={statusloading}
                          setStatusloading={setStatusloading}
                          customerId={item.Data.CustomerId}
                        />
                      </React.Fragment>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 50, 100, 200, 300]}
            component="div"
            count={totalRecords.totalRecords}
            rowsPerPage={rowsPerPage}
            page={tablePage} // Use tablePage for the table rows
            onPageChange={handleChangePage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setTablePage(0); // Reset the tablePage to 0 when rowsPerPage changes
            }}
          />
        </div>
      </ThemeProvider>
    </>
  );
};

export default PunchTR;
