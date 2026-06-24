import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Cookies from "js-cookie";
import { Delete, Add } from "@mui/icons-material";
import axios from "axios";
import { DataContext } from "../../context/AppData";
import { baseUrl } from "../../apiConfig";
import TitleBar from "../TitleBar";
import EventPopups from "../Reusable/EventPopups";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import useMenuAccess from "../Hooks/useMenuAccess";
export const AccountList = () => {
  const headers = { Authorization: `Bearer ${Cookies.get("token")}` };
  const navigate = useNavigate();
  const { dynamicColorAndLogo } = useContext(DataContext);
  const menuAccess = useMenuAccess();

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const displayStart = page + 1; // 1-based page number
      const displayLength = rowsPerPage;
      const searchParamQuoted = `%22${encodeURIComponent(search || "")}%22`;
      const url = `${baseUrl}/api/Item/GetAccountServerSideList?DisplayStart=${displayStart}&DisplayLength=${displayLength}&Search=${searchParamQuoted}&isAscending=false`;
      const res = await axios.get(url, { headers });
      const data = res?.data;
      const list = Array.isArray(data?.Data) ? data.Data : [];
      setRows(list);
      setTotalCount(Number(data?.totalRecords || data?.totalRecord || list.length || 0));
    } catch (e) {
      setRows([]);
      setTotalCount(0);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(e?.response?.data?.Message || "Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [page, rowsPerPage, search]);

  const handleDelete = async (accountId) => {
    if (!accountId) return;
    try {
      await axios.delete(`${baseUrl}/api/Item/DeleteAccount?id=${accountId}`, { headers });
      setRows((prev) => prev.filter((r) => r.AccountId !== accountId));
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText("Account deleted successfully");
    } catch (e) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Failed to delete account");
    }
  };

  return (
    <>
      <TitleBar icon={<AccountBalanceIcon />} title={"Account Details"}></TitleBar>
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <EventPopups open={openSnackBar} setOpen={setOpenSnackBar} color={snackBarColor} text={snackBarText} />
            <ConfirmationModal
              modalOpen={confirmModal.open}
              setModalOpen={() => setConfirmModal({ open: false, id: null })}
              title="Confirmation"
              description="Are you sure you want to delete this account?"
              onConfirm={() => {
                if (confirmModal.id) handleDelete(confirmModal.id);
                setConfirmModal({ open: false, id: null });
              }}
              confirmText="Delete"
              deleteButton
            />
            <div className="row mb-2">
              <div className="col-md-3">
                <TextField
                  label="Search Account"
                  variant="standard"
                  className="me-3"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-9 text-end">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  style={{ backgroundColor: dynamicColorAndLogo.PrimeryColor, textTransform: "capitalize" }}
                  onClick={() => navigate("/accounts/add-account")}
                  disabled={!menuAccess.canCreate || menuAccess.isLoading}
                >
                  Add Account
                </Button>
              </div>
            </div>
            {isLoading ? (
              <div className="center-loader">
                <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead className="table-header">
                    <TableRow className="material-tbl-alignment">
                      <TableCell>#</TableCell>
                      <TableCell>Account Name</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Active</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow
                        key={row.AccountId || idx}
                        className="material-tbl-alignment"
                        hover
                        onClick={() => navigate(`/accounts/add-account?id=${row.AccountId}`)}
                      >
                        <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                        <TableCell>{row.Name || ""}</TableCell>
                        <TableCell>{row.Code || ""}</TableCell>
                        <TableCell>{row.Type || ""}</TableCell>
                        <TableCell>{row.isActive ? "Yes" : "No"}</TableCell>
                        <TableCell align="right">
                          {menuAccess.canDelete && !menuAccess.isLoading ? (
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmModal({ open: true, id: row.AccountId });
                              }}
                            >
                              <Delete color="error" sx={{ fontSize: 18 }} />
                            </span>
                          ) : (
                            <Delete color="disabled" sx={{ fontSize: 18 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No Record Found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}