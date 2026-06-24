import React, { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash.debounce";
import formatDate from "../../custom/FormatDate";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  ListSubheader,
  TableContainer,
  TableSortLabel,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import TblDateFormat from "../../custom/TblDateFormat";
import formatAmount from "../../custom/FormatAmount";

const PaymentsList = ({
  customerId,
  customerName,
  getPaymentData,
  paymentList = { Data: [] },
  loading = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDate = new Date();
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const [rowsPerPage, setRowsPerPage] = useState(
    searchParams.get("rowsPerPage") || 10
  );
  const [tablePage, setTablePage] = useState(
    searchParams.get("tablePage") || 0
  );
  const [statusId, setStatusId] = useState(searchParams.get("statusId") || 0);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isAscending, setIsAscending] = useState(
    searchParams.get("isAscending") === "true"
  );
  const [startDateFilter, setStartDateFilter] = useState(
    searchParams.get("startDateFilter") || null
  );
  const [endDateFilter, setEndDateFilter] = useState(
    formatDate(searchParams.get("endDateFilter") || currentDate)
  );
  const [orderBy, setOrderBy] = useState({
    Profit: searchParams.get("isAscending") === "true",
    issueDate: searchParams.get("isAscending") === "true",
  });

  const debouncedGetFilteredInvoices = useCallback(
    debounce(getPaymentData, 500),
    []
  );
  useEffect(() => {
    debouncedGetFilteredInvoices(
      search,
      tablePage + 1,
      rowsPerPage,
      statusId,
      isAscending,
      orderBy.issueDate,
      orderBy.Profit,
      startDateFilter,
      endDateFilter,
      0
    );
    setSearchParams({
      search,
      tablePage,
      rowsPerPage,
      statusId,
      isAscending,
      issueDate: orderBy.issueDate,
      Profit: orderBy.Profit,
      startDateFilter,
      endDateFilter,
      id: customerId,
    });
  }, [
    search,
    tablePage,
    rowsPerPage,
    statusId,
    isAscending,
    orderBy,
    startDateFilter,
    endDateFilter,
  ]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };
  return (
    <div>
      <div className="card">
        <div style={{ display: "flex" }} className="itemtitleBar ">
          <div style={{ width: "50%" }}>
            <h4>Payments</h4>
          </div>
          <div style={{ width: "50%" }} className=" text-end">
            <NavLink to={`/Payment?CustomerId=${customerId}&CustomerName=${customerName}`}>
              <p style={{ textDecoration: "underline" }} className="text-black">
                Add Payments
              </p>
            </NavLink>
          </div>
        </div>
        <div className="card-body">
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead className="table-header">
                <TableRow className="bill-tbl-alignment">
                  <TableCell>Payment Number</TableCell>
                  <TableCell>Transaction Date</TableCell>
                  <TableCell>Status</TableCell>

                  <TableCell>Amount $</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center">
                      <div className="center-loader">
                        <CircularProgress style={{ color: "#789a3d" }} />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    <TableRow>
                      {paymentList?.Data?.length <= 0 ? (
                        <TableCell className="text-center" colSpan={9}>
                          <div className="text-center">No Record Found</div>
                        </TableCell>
                      ) : null}
                    </TableRow>

                    {paymentList?.Data?.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )?.map((payment, index) => (
                      <TableRow
                        className={`bill-tbl-alignment`}
                        hover
                        key={index}
                        onClick={() => {
                          navigate(
                            `/Payment?id=${payment.PaymentId}&CustomerId=${customerId}&CustomerName=${customerName}`
                          );
                        }}
                      >
                        <TableCell>{payment.PaymentNumber}</TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                          {TblDateFormat(payment.TxnDate, true)}
                        </TableCell>
                        <TableCell>{payment.Status}</TableCell>
                        <TableCell>{formatAmount(payment.TotalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 30]}
            component="div"
            count={paymentList.totalRecords}
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
  );
};

export default PaymentsList;
