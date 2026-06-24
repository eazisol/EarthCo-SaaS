import React, { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import TblDateFormat from "../../custom/TblDateFormat";
import { TablePagination } from "@mui/material";
import { DataContext } from "../../context/AppData";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import ServiceRequests from "../ServiceRequest/ServiceRequests";
import Authorization from "../Reusable/Authorization";
const CustomerSR = ({ data = [], customer }) => {

  const { PunchListData, setPunchListData } = useContext(DataContext);
  const downloadCSV = (data) => {
    console.log("sdfsdf", data);

    const formatAmount = (amount) => {
      // Implement your amount formatting function here, for example:
      return amount ? amount.toFixed(2) : "";
    };

    const formatDate = (date) => {
      // Implement your date formatting function here, for example:
      return new Date(date).toLocaleDateString();
    };

    const csvContent = [
      [
        "Service Request #",
        "Assigned to",
        "Status",
        "Work Requested",
        "Service Location",
        "Date Created",
        "Type",
      ],
      ...data.map((row) => [
        `"${row.ServiceRequestNumber}"`,
        `"${row.AssignToName}"`,
        `"${row.Status}"`,
        `"${row.WorkRequest}"`,
        `"${row.ServiceLocation}"`,
        `"${formatDate(row.CreatedDate)}"`,
        `"${row.Type}"`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Service Requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    setPunchListData(customer);
  }, []);
  return (
    <div className="card">
      <div style={{ display: "flex" }} className="itemtitleBar ">
        <div style={{ width: "50%" }}>
          <h4>Service Request</h4>
        </div>
        <div style={{ width: "50%" }} className=" text-end">
        <Authorization allowTo={[1, 4, 5, 6]} hide>
          <NavLink to={`/service-requests/add-sRform`}>
            <p style={{ textDecoration: "underline" }} className="text-black">
              Add Service Request
            </p>
          </NavLink></Authorization>
        </div>
      </div>

      {/* <div className="card-body">
        <div className="col-xl-12">
          <div className="card  border-0">
            <div className="card-body p-0 border-0">
              <>
              <div className="text-end">
              <button
                className="btn btn-sm btn-outline-secondary me-2 custom-csv-link mb-2"
                // disabled={allDataLoading}
                onClick={() => {
                  // getAllEstimate(estmRecords.totalRecords, (data) => {
                  //   downloadCSV(data);
                  // });
                  downloadCSV(data);
                }}
              >
                  <i className="fa fa-download"></i>
                CSV
              </button></div>
                <TableContainer>
                  <Table>
                    <TableHead className="table-header">
                      <TableRow>
                        <TableCell>Service Request #</TableCell>
                        <TableCell> Assigned to</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Work Requested</TableCell>
                        <TableCell>Service Location</TableCell>
                        <TableCell>Date Created </TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.length === 0 ? (
                        <TableRow>
                          <TableCell className="text-center" colSpan={12}>
                            No Record Found
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.sort((a, b) => b.ServiceRequestId - a.ServiceRequestId)
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((item, index) => (
                            <TableRow
                              key={index}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                navigate(
                                  `/service-requests/add-sRform?id=${item.ServiceRequestId}`
                                );
                              }}
                            >
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.ServiceRequestNumber}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.AssignToName}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                <span
                                  style={{
                                    backgroundColor: item.Color,
                                  }}
                                  className="span-hover-pointer badge badge-pill  "
                                >
                                  {item.Status}
                                </span>
                              </TableCell>
                              <TableCell
                                style={{
                                  maxWidth: "23em",
                                  padding: "0.9em 0.5em",
                                }}
                              >
                                {item.WorkRequest}
                              </TableCell>
                              <TableCell
                                style={{
                                  maxWidth: "23em",
                                  padding: "0.9em 0.5em",
                                }}
                              >
                                {item.ServiceLocation}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {" "}
                                {TblDateFormat(item.CreatedDate)}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.Type}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                      setRowsPerPage(parseInt(event.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableContainer>
              </>
            </div>
          </div>
        </div>
      </div> */}
      <ServiceRequests customerId={customer.CustomerId} />
    </div>
  );
};

export default CustomerSR;
