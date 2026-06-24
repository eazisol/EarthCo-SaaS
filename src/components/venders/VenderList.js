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
import axios from "axios";
import Cookies from "js-cookie";
import { Delete, Create, Add } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import TitleBar from "../TitleBar";
import EventPopups from "../Reusable/EventPopups";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import { baseUrl } from "../../apiConfig";
import { DataContext } from "../../context/AppData";
import PortraitIcon from '@mui/icons-material/Portrait';
import useMenuAccess from "../Hooks/useMenuAccess";
export const VenderList = () => {
  const headers = { Authorization: `Bearer ${Cookies.get("token")}` };
  console.log("headers", headers);
  const navigate = useNavigate();
  const { dynamicColorAndLogo } = useContext(DataContext);
  const menuAccess = useMenuAccess();

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalCount, setTotalCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const displayStart = page + 1; // 1-based page number (not record offset)
      const displayLength = rowsPerPage;
      const searchParamQuoted = `%22${encodeURIComponent(search || "")}%22`; // ""
      const url = `${baseUrl}/api/Supplier/GetSupplierServerSideList?DisplayStart=${displayStart}&DisplayLength=${displayLength}&Search=${searchParamQuoted}&isAscending=false`;
      const res = await axios.get(url, { headers });
      const data = res?.data;
      const list = Array.isArray(data?.Data) ? data.Data : Array.isArray(data) ? data : [];
      setRows(list);
      setTotalCount(Number(data?.totalRecords || data?.totalRecord || list.length || 0));
    } catch (e) {
      console.error("GetSupplierServerSideList error", e);
      setRows([]);
      setTotalCount(0);
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText(e?.response?.data?.Message || "Failed to load vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [page, rowsPerPage, search]);

  const handleDelete = async (supplierId) => {
    if (!supplierId) return;
    try {
      await axios.get(`${baseUrl}/api/Supplier/DeleteSupplier?id=${supplierId}`, { headers });
      setRows(prev => prev.filter(r => r.SupplierId !== supplierId));
      setOpenSnackBar(true);
      setSnackBarColor("success");
      setSnackBarText("Vendor deleted successfully");
    } catch (e) {
      setOpenSnackBar(true);
      setSnackBarColor("error");
      setSnackBarText("Failed to delete vendor");
    }
  };

  const filtered = rows; // server-side filtered

  return (
    <>
     <TitleBar icon={<PortraitIcon />} title={"Vendors"}></TitleBar>
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <EventPopups open={openSnackBar} setOpen={setOpenSnackBar} color={snackBarColor} text={snackBarText} />
            <ConfirmationModal
              modalOpen={confirmModal.open}
              setModalOpen={(v)=> setConfirmModal({ open: false, id: null })}
              title="Confirmation"
              description="Are you sure you want to delete this vendor?"
              onConfirm={() => {
                if (confirmModal.id) {
                  handleDelete(confirmModal.id);
                }
                setConfirmModal({ open: false, id: null });
              }}
              confirmText="Delete"
              deleteButton
            />
            <div className="row mb-2">
              <div className="col-md-3">
                <TextField
                  label="Search Vendor"
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
                  style={{ backgroundColor: dynamicColorAndLogo.PrimeryColor,  textTransform: "capitalize"}}
                  startIcon={<Add />}
                  onClick={() => navigate("/venders/add-vender")}
                  disabled={!menuAccess.canCreate || menuAccess.isLoading}
                >
                  Add Vendor
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
                      <TableCell>Company Name</TableCell>
                      <TableCell>Vendor Name</TableCell>
                      <TableCell>Email</TableCell>
                      {/* <TableCell>Phone</TableCell> */}
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((row, idx) => (
                        <TableRow key={row.SupplierId || idx} className="material-tbl-alignment" hover onClick={() => navigate(`/venders/add-vender?id=${row.SupplierId}`)}>
                          <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                          <TableCell>{row.CompanyName || ""}</TableCell>
                          <TableCell>{`${row.DisplayName || ""}`}</TableCell>
                          <TableCell>{row.Email || ""}</TableCell>
                          {/* <TableCell>{row.Phone || ""}</TableCell> */}
                          <TableCell align="right">
                            {menuAccess.canDelete && !menuAccess.isLoading ? (
                              <span style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setConfirmModal({ open: true, id: row.SupplierId }); }}>
                                <Delete color="error" sx={{ fontSize: 18 }} />
                              </span>
                            ) : (
                              <Delete color="disabled" sx={{ fontSize: 18 }} />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No Record Found</TableCell>
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
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
              </TableContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
