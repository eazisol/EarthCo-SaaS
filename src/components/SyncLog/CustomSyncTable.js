import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  TableSortLabel,
  CircularProgress,
  TableContainer,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Tick from "@mui/icons-material/CheckCircleOutline";
import DoneIcon from "@mui/icons-material/Sync";
import useQuickBook from "../Hooks/useQuickBook";
import TblDateFormat from "../../custom/TblDateFormat";
import EventPopups from "../Reusable/EventPopups";

const CustomSyncTable = ({ data, lable, getData, filterName }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const { syncQB, loading, showTick } = useQuickBook();
  const [selectedId, setSelectedId] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const handlepopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
    getData();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getNavigationPath = (name, id) => {
    switch (name) {
      case "Estimate":
        return `/estimates/add-estimate?id=${id}`;
      case "PurchaseOrder":
        return `/purchase-order/add-po?id=${id}`;
      case "Bill":
        return `/bills/add-bill?id=${id}`;
      case "Invoice":
        return `/invoices/add-invoices?id=${id}`;
      case "Customer":
        return `/customers/add-customer?id=${id}`;
      case "Item":
        return `/items/add-item?id=${id}`;
      case "Vendor":
        return `/Sync-log`;
      default:
        return `/Sync-log`; // Default path if no match
    }
  };

  useEffect(() => {
    const filteredData = data.filter((staff) => {
      const parsedMessage = JSON.parse(staff.Message || "{}"); // Provide a default value if Message is null
      const searchMatch =
        (staff.DocNumber && staff.DocNumber.includes(search)) ||
        (staff.Operation && staff.Operation.includes(search)) ||
        (staff.Name && staff.Name.includes(search)) ||
        (parsedMessage &&
          parsedMessage.Fault &&
          parsedMessage.Fault.Error &&
          parsedMessage.Fault.Error[0] &&
          parsedMessage.Fault.Error[0].Detail &&
          parsedMessage.Fault.Error[0].Detail.includes(search)); // Add null checks
      return filterName === "All"
        ? searchMatch
        : searchMatch && staff.Name === filterName;
    });
    setFilteredData(filteredData);
  }, [search, data, filterName]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (sortConfig.key) {
      const sorted = [...filteredData].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "SyncResponse") {
          aValue = JSON.parse(a.Message)?.Fault?.Error?.[0]?.Detail || "";
          bValue = JSON.parse(b.Message)?.Fault?.Error?.[0]?.Detail || "";
        }

        if (sortConfig.key === "EditDate") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
      return sorted;
    }
    return filteredData;
  }, [filteredData, sortConfig]);

  return (
    <>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <div className="row mb-2" style={{ justifyContent: "space-between" }}>
        <div className="col-md-3">
          <h4 className="mt-2 pb-0 mb-0">{lable}</h4>
        </div>
        <div className="col-md-3 text-end">
          <TextField
            label="Search Synclog"
            variant="standard"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead className="table-header">
            <TableRow className="material-tbl-alignment">
              <TableCell className="ms-3">
                <TableSortLabel
                  active={sortConfig.key === "Name"}
                  direction={
                    sortConfig.key === "Name" ? sortConfig.direction : "asc"
                  }
                  onClick={() => handleSort("Name")}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "DocNumber"}
                  direction={
                    sortConfig.key === "DocNumber"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() => handleSort("DocNumber")}
                >
                  Doc#
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "Operation"}
                  direction={
                    sortConfig.key === "Operation"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() => handleSort("Operation")}
                >
                  Operation
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "SyncResponse"}
                  direction={
                    sortConfig.key === "SyncResponse"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() => handleSort("SyncResponse")}
                >
                  Sync Response
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "EditDate"}
                  direction={
                    sortConfig.key === "EditDate" ? sortConfig.direction : "asc"
                  }
                  onClick={() => handleSort("EditDate")}
                >
                  Last Sync
                </TableSortLabel>
              </TableCell>
              <TableCell>Retry Count</TableCell>
              <TableCell align="center">Sync</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length <= 0 ? (
              <TableRow>
                <TableCell className="text-center" colSpan={12}>
                  No Record Found
                </TableCell>
              </TableRow>
            ) : null}
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((staff, i) => {
                const parsedMessage = JSON.parse(staff.Message);
                return (
                  <TableRow
                    className="material-tbl-alignment"
                    style={{ cursor: "default" }}
                    hover
                    key={i}
                  >
                    <TableCell style={{ cursor: "default" }} onClick={() => {}}>
                      {staff.Name}
                    </TableCell>
                    <TableCell
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        navigate(getNavigationPath(staff.Name, staff.Id));
                      }}
                    >
                      {staff.DocNumber}
                    </TableCell>
                    <TableCell style={{ cursor: "default" }} onClick={() => {}}>
                      {staff.Operation}
                    </TableCell>
                    <TableCell style={{ cursor: "default" }} onClick={() => {}}>
                      {parsedMessage &&
                      parsedMessage.Fault &&
                      parsedMessage.Fault.Error &&
                      parsedMessage.Fault.Error[0] &&
                      parsedMessage.Fault.Error[0].Detail
                        ? parsedMessage.Fault.Error[0].Detail
                        : ""}
                    </TableCell>
                    <TableCell style={{ cursor: "default" }} onClick={() => {}}>
                      {TblDateFormat(staff.EditDate)}
                    </TableCell>
                    <TableCell style={{ cursor: "default" }} onClick={() => {}}>
                      {staff.RetryCount}
                    </TableCell>

                    <TableCell align="center">
                      <>
                        {loading && selectedId === staff.SyncLogId ? (
                          <>
                            <CircularProgress
                              sx={{
                                color: "#2C9F1C",
                              }}
                              size={20}
                            />
                          </>
                        ) : (
                          <>
                            {showTick && selectedId === staff.SyncLogId ? (
                              <>
                                <Tick
                                  sx={{
                                    fontSize: 25,
                                    color: "#2C9F1C",
                                    cursor: "pointer",
                                  }}
                                />
                              </>
                            ) : (
                              <>
                                <DoneIcon
                                  onClick={() => {
                                    syncQB(staff.SyncLogId, handlepopup);
                                    setSelectedId(staff.SyncLogId);
                                  }}
                                  sx={{
                                    fontSize: 20,
                                    color: "#2C9F1C",
                                    cursor: "pointer",
                                  }}
                                />
                              </>
                            )}
                          </>
                        )}
                      </>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[100, 200, 300]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default CustomSyncTable;
