
import CircularProgress from "@mui/material/CircularProgress";
import useFetchServiceRequests from "../Hooks/useFetchServiceRequests";
import React, { useState, useEffect, useContext } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
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
  TableContainer,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { Create, Delete, Visibility } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";
import Alert from "@mui/material/Alert";
import { DataContext } from "../../context/AppData";
import TblDateFormat from "../../custom/TblDateFormat";
import AddButton from "../Reusable/AddButton";
import StatusCards from "./StatusCards";
import TitleBar from "../TitleBar";
import { baseUrl } from "../../apiConfig";

const SprayTechList = () => {
  const {
    isLoading,
    fetchServiceRequest,
    totalRecords,
    fetchFilterServiceRequest,
    sRFilterList,
    serviceRequest,
    sRfetchError,
  } = useFetchServiceRequests();

  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const icon = <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.64111 13.5497L9.38482 9.9837L12.5145 12.4421L15.1995 8.97684" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
  <ellipse cx="18.3291" cy="3.85021" rx="1.76201" ry="1.76201" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M13.6808 2.86012H7.01867C4.25818 2.86012 2.54651 4.81512 2.54651 7.57561V14.9845C2.54651 17.7449 4.22462 19.6915 7.01867 19.6915H14.9058C17.6663 19.6915 19.3779 17.7449 19.3779 14.9845V8.53213" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
</svg>

  const userdata = Cookies.get("userData");
  const [showCards, setShowCards] = useState(true);

  // const [locationOptions, setLocationOptions] = useState();
  const [open, setOpen] = useState(0);
  const [closed, setClosed] = useState(0);
  const { statusId, setStatusId } = useContext(DataContext);

  useEffect(() => {
    // Filter the estimates array to get only the entries with Status === "Pending"
    const pendingEstimates = serviceRequest.filter(
      (estimate) => estimate.Status === "Open"
    );
    const pendingClosed = serviceRequest.filter(
      (estimate) => estimate.Status === "Closed"
    );

    // Update the state variable with the number of pending estimates
    setOpen(pendingEstimates.length);
    setClosed(pendingClosed.length);
  }, [serviceRequest]);

  useEffect(() => {
  
    return () => {
      setStatusId(0);
    };
  }, []);


  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const [deleteSuccess, setDeleteSuccess] = useState(false);
 
  const navigate = useNavigate();
  const { setSRData, loggedInUser } = useContext(DataContext);

  const [tablePage, setTablePage] = useState(0);
  const [sRsearch, setSRsearch] = useState("");
  const [isAscending, setIsAscending] = useState(false);
  useEffect(() => {
    // Initial fetch of estimates
    fetchFilterServiceRequest();
  }, []);

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    fetchFilterServiceRequest(
      sRsearch,
      tablePage + 1,
      rowsPerPage,
      statusId,
      isAscending
    );
  }, [sRsearch, tablePage, rowsPerPage, statusId, isAscending]);

  const handleChangePage = (event, newPage) => {
    // Update the tablePage state
    setTablePage(newPage);
  };

  //

  const deleteServiceRequest = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/DeleteServiceRequest?id=${id}`,
        { headers }
      );
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 4000);

      // Handle the response. For example, you can reload the customers or show a success message
      console.log("ServiceRequest deleted successfully:");
      fetchFilterServiceRequest();
    } catch (error) {
      console.error("There was an error deleting the customer:", error);
    }
  };

  const handleDelete = (id) => {
    deleteServiceRequest(id);
  };

  useEffect(() => {
    setShowCards(true);
  }, []);

  const sortedAndSearchedCustomers = sRFilterList;

  const [selectedServiceRequests, setSelectedServiceRequests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleCheckboxChange = (event, serviceRequestId) => {
    if (event.target.checked) {
      // Checkbox is checked, add the serviceRequestId to the selectedServiceRequests array
      setSelectedServiceRequests((prevSelected) => [
        ...prevSelected,
        serviceRequestId,
      ]);
    } else {
      // Checkbox is unchecked, remove the serviceRequestId from the selectedServiceRequests array
      setSelectedServiceRequests((prevSelected) =>
        prevSelected.filter((id) => id !== serviceRequestId)
      );
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all rows
      if (Array.isArray(sortedAndSearchedCustomers)) {
        const allServiceRequestIds = sortedAndSearchedCustomers.map(
          (customer) => customer.ServiceRequestId
        );
        setSelectedServiceRequests(allServiceRequestIds);
        setSelectAll(true);
      } else {
        // Handle the case where sortedAndSearchedCustomers is not an array
        console.error("sortedAndSearchedCustomers is not an array");
      }
    } else {
      // Deselect all rows
      setSelectedServiceRequests([]);
      setSelectAll(false);
    }
  };
  
  const isRowSelected = (sr) => selectedServiceRequests.includes(sr);



  return (
    <>
     <TitleBar icon={icon} title='Spray Tech' />
      <div className="container-fluid">
        <div className="row">
          {showCards && (
            <StatusCards
              setStatusId={setStatusId}
              statusId={statusId}
              totalRecords
              newData={1178}
              open={totalRecords.totalOpenRecords}
              closed={totalRecords.totalClosedRecords}
              total={78178}
            />
          )}

          {isLoading ? (
            <div className="center-loader">
              <CircularProgress style={{ color: "#789a3d" }} />
            </div>
          ) : (
            <div>
             <div className="card">
            <div className="card-header flex-wrap d-flex justify-content-between  border-0">
              <div>
                <TextField
                  label="Search Spray Tech"
                  variant="standard"
                  size="small"
                  value={sRsearch}
                  onChange={(e) => setSRsearch(e.target.value)}
                />
              </div>
              <div className=" me-2">
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
                {loggedInUser.userRole == "4" ? (
                  <></>
                ) : (
                  <>
                   
                    <AddButton
                      onClick={() => {
                        navigate(`/spray-tech/add`);
                      }}
                    >
                      Add Spray Tech
                    </AddButton>
                  </>
                )}
              </div>
            </div>
            <div className="card-body pt-0">
              <Table>
                <TableHead className="table-header">
                  <TableRow className="material-tbl-alignment">
                   
                    {[
                      "Spray Tech #",
                      "Customer Name",
                      "Assigned to",
                      "Status",
                      "Work Requested",
                      "Date Created",
                      "Type",
                    ].map((column, index) => (
                      <TableCell key={index}>{column}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sRfetchError ? (
                    <TableRow>
                      <TableCell className="text-center" colSpan={12}>
                        No Record found
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {sortedAndSearchedCustomers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((customer, rowIndex) => (
                      <TableRow
                        className={`material-tbl-alignment ${
                          isRowSelected(customer.ServiceRequestId)
                            ? "selected-row"
                            : ""
                        }`}
                        key={rowIndex}
                        hover
                      >
                       
                        <TableCell
                          onClick={() => {
                            navigate(
                              `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                            );
                          }}
                        >
                          {customer.ServiceRequestNumber}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            navigate(
                              `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                            );
                          }}
                        >
                          {customer.CustomerName}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            navigate(
                              `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                            );
                          }}
                        >
                          {customer.Assign}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            navigate(
                              `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                            );
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: customer.StatusColor,
                            }}
                            className="span-hover-pointer badge badge-pill  "
                          >
                            {customer.Status}
                          </span>
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            navigate(
                              `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                            );
                          }}
                        >
                          {customer.WorkRequest}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            navigate(
                              `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                            );
                          }}
                        >
                          {TblDateFormat(customer.CreatedDate)}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            navigate(
                              `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                            );
                          }}
                        >
                          {customer.Type}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[100, 200, 300]}
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
          </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


export default SprayTechList