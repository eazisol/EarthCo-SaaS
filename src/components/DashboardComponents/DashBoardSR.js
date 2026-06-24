import React, {  useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,

  Checkbox,
  FormControl,
  Select,
  MenuItem,

} from "@mui/material";

import TblDateFormat from "../../custom/TblDateFormat";
import {  useNavigate } from "react-router-dom";
import UpdateAllSR from "../Reusable/UpdateAllSR";
import DeleteAllModal from "../Reusable/DeleteAllModal";
import truncateString from "../../custom/TruncateString"
import ComaSpacing from "../../custom/ComaSpacing";

const DashBoardSR = ({ dashBoardData, getDashboardData }) => {
  const navigate = useNavigate();
 

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
      if (dashBoardData && dashBoardData.ServiceRequestData && Array.isArray(dashBoardData.ServiceRequestData)) {
        const allServiceRequestIds = dashBoardData.ServiceRequestData.map(
          (customer) => customer.ServiceRequestId
        );
        setSelectedServiceRequests(allServiceRequestIds);
        setSelectAll(true);
      } else {
        // Handle the case where dashBoardData or ServiceRequestData is not an array
        console.error("dashBoardData.ServiceRequestData is not an array");
      }
    } else {
      // Deselect all rows
      setSelectedServiceRequests([]);
      setSelectAll(false);
    }
  };
  
  const isRowSelected = (sr) => selectedServiceRequests.includes(sr);
  return (
    <div className="card">
      <div className="card-body py-0">
        <div className="row  dashboard-header bg-primary" style={{height : "3.7em"}}>
          <div className="col-md-6  ">
            <h4 className="pt-3 pb-2" style={{ color: "white" }}>
              Service Requests
            </h4>
          </div>
          <div className="col-md-6 text-end">
            {selectedServiceRequests.length <= 0 ? (
              <></>
            ) : (
              <FormControl
                variant="outlined"
                className="py-2 me-2"
                style={{ borderColor: "transparent", color: "white" }}
              >
                <Select
                  labelId="customer-type-label"
                  variant="outlined"
                  size="small"
                  style={{ borderColor: "transparent", color: "white" }}
                  value={1}
                >
                  <MenuItem value={1}>Group Actions</MenuItem>

                  <UpdateAllSR
                    selectedItems={selectedServiceRequests}
                    endpoint={
                      "ServiceRequest/UpdateAllSelectedServiceRequestStatus"
                    }
                    bindingFunction={getDashboardData}
                  />
                  <br />

                  <DeleteAllModal
                    selectedItems={selectedServiceRequests}
                    endpoint={"ServiceRequest/DeleteAllSelectedServiceRequest"}
                    bindingFunction={getDashboardData}
                  />
                </Select>
              </FormControl>
            )}
          </div>
        </div>
        <div className="row">
        <TableContainer sx={{ overflowX: 'auto', p:0 }}>
          <Table>
            <TableHead className="table-header">
              <TableRow className="material-tbl-alignment">
                <TableCell padding="checkbox">
                  <Checkbox checked={selectAll} onChange={handleSelectAll} />
                </TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>SR#</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Work Requested</TableCell>
                <TableCell>Date Created </TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashBoardData.ServiceRequestData.length <= 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No Record Found
                  </TableCell>
                </TableRow>
              ) : (
                dashBoardData.ServiceRequestData?.map((customer, rowIndex) => (
                  <TableRow
                    className={`material-tbl-alignment ${
                      isRowSelected(customer.ServiceRequestId)
                        ? "selected-row"
                        : ""
                    }`}
                    key={rowIndex}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedServiceRequests.includes(
                          customer.ServiceRequestId
                        )}
                        onChange={(e) =>
                          handleCheckboxChange(e, customer.ServiceRequestId)
                        }
                      />
                    </TableCell>
                    <TableCell
                      onClick={() => {
                        navigate(
                          `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                        );
                      }}
                    >
                      {customer.CustomerDisplayName}
                    </TableCell>
                    <TableCell
                      onClick={() => {
                        navigate(
                          `/service-requests/add-sRform?id=${customer.ServiceRequestId}`
                        );
                      }}
                    >
                      {ComaSpacing(customer.Assign)}
                    </TableCell>
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
                      <span
                        style={{
                          backgroundColor: customer.StatusColor,
                        }}
                        className="badge badge-pill "
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
                      {truncateString(customer.WorkRequest,100)}
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
                ))
              )}
            </TableBody>
          </Table></TableContainer>
        </div>
      </div>
    </div>
  );
};

export default DashBoardSR;
