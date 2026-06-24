import React, { useState, useEffect, useCallback, useContext } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UpdateCustomer from "./UpdateCustomer";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Button,
  TablePagination,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { debounce } from "lodash";
import { Create, Delete, Update } from "@mui/icons-material";

import axios from "axios";
import useQuickBook from "../Hooks/useQuickBook";
import EventPopups from "../Reusable/EventPopups";
import AddButton from "../Reusable/AddButton";
import { baseUrl } from "../../apiConfig";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";

const CustomerTR = ({
  customers,
  setCustomerAddSuccess,
  setCustomerUpdateSuccess,
  fetchCustomers,
  headers,
  customerFetchError,
  totalRecords,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { dynamicColorAndLogo } = useContext(DataContext);
  
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

  const [selectedItem, setSelectedItem] = useState(null);
  const [showContent, setShowContent] = useState(true);
  const [modalOpen, setModalOpen] = useState({
    open: false,
    onConfirm: null,
    message: "",
  });
  const [sorting, setSorting] = useState({ field: "", order: "" });
  const [filtering, setFiltering] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  
  // Get menu access dynamically based on current route
  const menuAccess = useMenuAccess(); // Auto-detects from /customers route
  
  // Debug logging
  useEffect(() => {
    console.log("CustomerTR - Menu Access:", menuAccess);
  }, [menuAccess]);

  // Sorting logic here...
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sorting.order === "asc") {
      return a.CustomerId > b.CustomerId ? 1 : -1;
    } else if (sorting.order === "desc") {
      return a.CustomerId < b.CustomerId ? 1 : -1;
    }
    return 0;
  });

  const [tablePage, setTablePage] = useState(0);
  const [search, setSearch] = useState("");
  const [isAscending, setIsAscending] = useState(false);
  const debouncedGetFilteredCustomers = useCallback(
    debounce(fetchCustomers, 500),
    []
  );
  const { syncQB } = useQuickBook();

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    debouncedGetFilteredCustomers(
      search,
      tablePage + 1,
      rowsPerPage,
      isAscending
    );
  }, [search, tablePage, rowsPerPage, isAscending]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  // Filtering logic here...
  const filteredCustomers = sortedCustomers;

  const deleteCustomer = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/DeleteCustomer?id=${id}`,
        {
          headers,
        }
      );
      console.log("customer deleted successfuly", response.data);

      // Handle the response. For example, you can reload the customers or show a success message
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 4000);
      // fetchCustomers();
      // window.location.reload();
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(response.data.Message);
      syncQB(response.data.SyncId);
    } catch (error) {
      console.error("There was an error deleting the customer:", error);
    }
  };

  const handleDelete = (id) => {
    deleteCustomer(id);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
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
        {showContent ? (
          <div className="card">
            <div className="card-header flex-wrap d-flex justify-content-between  border-0">
              <div>
                <TextField
                  label="Search Customer"
                  variant="standard"
                  size="small"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
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
              <div className="pt-2 me-2">
                <FormControl className="  me-2" variant="outlined">
                  <Select
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
                    <MenuItem value={true}>Ascending</MenuItem>
                    <MenuItem value={false}>Descending</MenuItem>
                  </Select>
                </FormControl>
                {menuAccess.canCreate && !menuAccess.isLoading ? (
                  <AddButton
                    backgroundColor={dynamicColorAndLogo.PrimeryColor}  
                    onClick={() => {
                      navigate(`/customers/add-customer`);
                      setSelectedItem(0);
                      // setShowContent(false);
                    }}
                  >
                    Add Customer
                  </AddButton>
                ) : (
                  <Tooltip title="You don't have create access" arrow>
                    <span>
                      <AddButton
                        backgroundColor={dynamicColorAndLogo.PrimeryColor}
                        disabled={true}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        Add Customer
                      </AddButton>
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="card-body pt-0">
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead className="table-header">
                    <TableRow className="material-tbl-alignment">
                      {/* Map through columns here */}
                      {[
                        // "Select",
                        "Customer Id",
                        // "Contact Company",
                        // "Contact Name",
                        "Customer Name",
                        "Contact Email",
                      ].map((column, index) => (
                        <TableCell className="table-cell-align" key={index}>
                          {column}
                        </TableCell>
                      ))}
                      <TableCell className="table-cell-align" align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody align="center">
                    {customerFetchError ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center">
                          {" "}
                          No Record Found
                        </TableCell>
                      </TableRow>
                    ) : null}
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
                        {filteredCustomers
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((customer, rowIndex) => (
                            <TableRow
                              className="material-tbl-alignment"
                              key={rowIndex}
                              hover
                            >
                              {/* <TableCell>
                    <Checkbox
                      checked={selectedItem === customer.CustomerId}
                      onChange={() => setSelectedItem(customer.CustomerId)}
                    />
                  </TableCell>*/}
                              <TableCell
                                className="table-cell-align"
                                onClick={(e) => {
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                  }
                                  navigate(
                                    `/customers/add-customer?id=${customer.CustomerId}`
                                  );
                                }}
                                style={{
                                  cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                                  opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                                }}
                              >
                                {menuAccess.canEdit && !menuAccess.isLoading ? (
                                  customer.CustomerId
                                ) : (
                                  <Tooltip title="You don't have access" arrow>
                                    <span>{customer.CustomerId}</span>
                                  </Tooltip>
                                )}
                              </TableCell>

                              {/* <TableCell
                        onClick={() => {
                          navigate(
                            `/customers/add-customer?id=${customer.CustomerId}`
                          );
                        }}
                      >
                        {customer.CompanyName}
                      </TableCell> 
                      <TableCell
                        onClick={() => {
                          navigate(
                            `/customers/add-customer?id=${customer.CustomerId}`
                          );
                        }}
                      >
                        {customer.ContactName}
                      </TableCell>*/}
                              <TableCell
                                onClick={(e) => {
                                  if (!menuAccess.canEdit || menuAccess.isLoading) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                  }
                                  navigate(
                                    `/customers/add-customer?id=${customer.CustomerId}`
                                  );
                                }}
                                style={{
                                  cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                                  opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                                }}
                              >
                                {menuAccess.canEdit && !menuAccess.isLoading ? (
                                  customer.CompanyName
                                ) : (
                                  <Tooltip title="You don't have access" arrow>
                                    <span>{customer.CompanyName}</span>
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
                                  navigate(
                                    `/customers/add-customer?id=${customer.CustomerId}`
                                  );
                                }}
                                style={{
                                  cursor: (menuAccess.canEdit && !menuAccess.isLoading) ? "pointer" : "not-allowed",
                                  opacity: (menuAccess.canEdit && !menuAccess.isLoading) ? 1 : 0.6,
                                }}
                              >
                                {menuAccess.canEdit && !menuAccess.isLoading ? (
                                  customer.Email
                                ) : (
                                  <Tooltip title="You don't have access" arrow>
                                    <span>{customer.Email}</span>
                                  </Tooltip>
                                )}
                              </TableCell>
                              <TableCell
                                className="table-cell-align"
                                align="right"
                              >
                                {menuAccess.canDelete && !menuAccess.isLoading ? (
                                  <span
                                    onClick={() => {
                                      setModalOpen({
                                        open: true,
                                        message: `Are you sure you want to delete ${customer.CompanyName}?`,
                                        onConfirm: () =>
                                          handleDelete(customer.CustomerId),
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

                                <div
                                  className="modal fade"
                                  id={`deleteModal${customer.CustomerId}`}
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
                                          Customer Delete
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
                                          {customer.CompanyName}
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
                                          onClick={() =>
                                            handleDelete(customer.CustomerId)
                                          }
                                        >
                                          Yes
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
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
          </div>
        ) : (
          <UpdateCustomer
            headers={headers}
            setCustomerAddSuccess={setCustomerAddSuccess}
            setCustomerUpdateSuccess={setCustomerUpdateSuccess}
            selectedItem={selectedItem}
            setShowContent={setShowContent}
            fetchCustomers={fetchCustomers}
          />
        )}
      </ThemeProvider>
    </>
  );
};

export default CustomerTR;
