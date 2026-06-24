import React, { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import formatAmount from "../../custom/FormatAmount";
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
import Authorization from "../Reusable/Authorization";
const CustomerEstimates = ({ data = [], customer }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { loggedInUser, setPunchListData } = useContext(DataContext);
  useEffect(() => {
    setPunchListData(customer);
  }, []);

  return (
    <div className="card">
      <div style={{ display: "flex" }} className="itemtitleBar ">
        <div style={{ width: "50%" }}>
          <h4>Estimates</h4>
        </div>
        <div style={{ width: "50%" }} className=" text-end">
        <Authorization allowTo={[1, 4, 5, 6]} hide>
          <NavLink to={`/estimates/add-estimate`}>
            <p style={{ textDecoration: "underline" }} className="text-black">
              Add Estimate
            </p>
          </NavLink></Authorization>
        </div>
      </div>

      <div className="card-body">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body p-0">
              <>
                <TableContainer>
                  <Table>
                    <TableHead className="table-header">
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Regional Manager</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Estimate #</TableCell>
                        <TableCell>Description Of Work </TableCell>

                        <TableCell>Amount $</TableCell>
                        <Authorization allowTo={[1, 4, 5, 6]} hide>
                          <TableCell>Profit %</TableCell>
                        </Authorization>
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
                        data
                          .sort((a, b) => b.EstimateId - a.EstimateId)
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((item, index) => (
                            <TableRow
                              key={index}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                if (loggedInUser.userRole == "2") {
                                  navigate(
                                    `/estimates/estimate-preview?id=${item.EstimateId}&customerId=${customer.CustomerId}`
                                  );
                                  return
                                }
                                navigate(
                                  `/estimates/add-estimate?id=${item.EstimateId}`
                                );
                              }}
                            >
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.EstimateId}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.RegionalManagerName}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {TblDateFormat(item.IssueDate)}
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
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.EstimateNumber}
                              </TableCell>
                              <TableCell
                                style={{
                                  maxWidth: "23em",
                                  padding: "0.9em 0.5em",
                                }}
                              >
                                {item.EstimateNotes}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {formatAmount(item.TotalAmount)}
                              </TableCell>
                              <Authorization allowTo={[1, 4, 5, 6]} hide>
                                <TableCell style={{ padding: "0.9em 0.5em" }}>
                                  {item.ProfitPercentage
                                    ? item.ProfitPercentage.toFixed(2)
                                    : ""}
                                </TableCell>
                              </Authorization>
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
      </div>
    </div>
  );
};

export default CustomerEstimates;
