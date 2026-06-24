import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import formatAmount from "../../custom/FormatAmount";
import TblDateFormat from "../../custom/TblDateFormat";
import { TablePagination } from "@mui/material";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
const CustomerBills = ({ data = [] }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  return (
    <div className="card">
      <h4 className="modal-title itemtitleBar" id="#gridSystemModal1">
        Bills
      </h4>

      <div className="card-body">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body p-0">
              <>
                <TableContainer>
                  <Table>
                    <TableHead className="table-header">
                      <TableRow>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Amount $</TableCell>
                        <TableCell>Memo</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Tags</TableCell>
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
                        data.sort((a, b) => b.BillId - a.BillId)
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((item, index) => (
                            <TableRow
                              key={index}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                navigate(`/bills/add-bill?id=${item.BillId}`);
                              }}
                            >
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.VendorName}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {TblDateFormat(item.DueDate)}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {formatAmount(item.Amount)}
                              </TableCell>
                              <TableCell
                                style={{
                                  padding: "0.9em 0.5em",
                                  maxWidth: "23em",
                                }}
                              >
                                {item.Memo}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.Currency}
                              </TableCell>
                              <TableCell style={{ padding: "0.9em 0.5em" }}>
                                {item.Tags}
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
      </div>
    </div>
  );
};

export default CustomerBills;
