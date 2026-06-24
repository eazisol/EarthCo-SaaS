import { Table, TableHead, TableBody, TableRow, TableCell, TextField, CircularProgress, TableContainer } from "@mui/material";
import formatAmount, { formatCurrency } from "../../custom/FormatAmount";
import { useState, useEffect, useContext } from "react";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { AddMisc } from "./apis";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EventPopups from "../Reusable/EventPopups";
import { DataContext } from "../../context/AppData";
export const AMSales = ({ commissionData, loader , heading,year,month}) => {
  const { dynamicColorAndLogo } = useContext(DataContext);
    const [data, setData] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarColor, setSnackBarColor] = useState("success");
    const [snackBarText, setSnackBarText] = useState("");   
    useEffect(() => {
        if (commissionData && Array.isArray(commissionData)) {
            const mapped = commissionData.map(row => ({
                ...row,
                misc: null
            }));
            setData(mapped);
        } else {
            setData([]);
        }
    }, [commissionData]);

    const handleMiscChange = (idx, value) => {
        const newData = [...data];
        const miscValue = value === "" ? null : parseFloat(value);
        newData[idx].misc = miscValue;
        setData(newData);
    };

    const handleSaveMisc = async () => {
        const payload = data
            .filter(row => row && row.misc !== null && !isNaN(parseFloat(row.misc)))
            .map(row => ({
                UserId: row.UserId,
                Year: year,
                Month: month,
                MiscAmount: parseFloat(row.misc) || 0
            }));
        if (payload.length === 0 || isSaving) return;
        try {
            setIsSaving(true);
            const res = await AddMisc(payload);
            setOpenSnackBar(true);
            setSnackBarColor("success");
            setSnackBarText(res?.Message);
            console.log("AddMisc response:", res?.Message);
            // Reflect immediately: move misc into MiscAmount and clear inputs
            setData(prev => prev.map(row => {
                if (row.misc !== null && !isNaN(parseFloat(row.misc))) {
                    const added = parseFloat(row.misc) || 0;
                    const existing = parseFloat(row.MiscAmount) || 0;
                    return { ...row, MiscAmount: existing + added, misc: null };
                }
                return row;
            }));
        } catch (err) {
            console.error("AddMisc error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <EventPopups
                open={openSnackBar}
                setOpen={setOpenSnackBar}
                color={snackBarColor}
                text={snackBarText}
            />
            <TableContainer sx={{ overflowX: "auto" }}> 
            <Table className="mt-2" sx={{ minWidth: 650 }}>
                <TableHead className="table-header">
                   {loader ?null: <TableRow className="material-tbl-alignment">
                        <TableCell align="left">Account Manager</TableCell>
                        <TableCell align="right">Sales $</TableCell>
                        <TableCell align="right">{`Sales * ${heading?.SaleCommissionPercentage/100} $`}</TableCell>
                        <TableCell align="right">Additional Added $</TableCell>
                        <TableCell align="center">
                        <div className="d-flex justify-content-center align-items-center" style={{ gap: 8 }}>
                                        <span>Misc</span>
                                        {data.some(r => r.misc !== null && !isNaN(parseFloat(r.misc))) ? (
                                            <BookmarkBorderIcon 
                                                onClick={handleSaveMisc}
                                                style={{ cursor: isSaving ? "not-allowed" : "pointer", color: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d" }}
                                                titleAccess="Save"
                                            />
                                        ) : (
                                            <BookmarkIcon 
                                                onClick={handleSaveMisc}
                                                style={{ cursor: isSaving ? "not-allowed" : "pointer", color: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d" }}
                                                titleAccess="Save"
                                            />
                                        )}
                                    </div>
                        </TableCell>
                        <TableCell align="right">Total Commission $</TableCell>
                    </TableRow>}
                </TableHead>
                <TableBody className="table-body bg-white">
                    {loader ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : data && data.length > 0 ? (
                        <>
                        {data.map((row, idx) => {
                            const saleCommission = parseFloat(row.SaleCommission) || 0;
                            const misc = parseFloat(row.misc) || 0;
                            const persistedMisc = parseFloat(row.MiscAmount) || 0;
                            const totalWithMisc = saleCommission + (persistedMisc + misc);
                            return (
                                <TableRow key={row.UserId || idx} className="material-tbl-alignment">
                                    <TableCell align="left">{row.Name}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.Sale,2,false,"")}</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(row.SaleCommission,2,false,"")}
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(row.MiscAmount,2,false,"")}
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            type="number"
                                            value={row.misc === null ? "" : row.misc}
                                            onChange={e => handleMiscChange(idx, e.target.value)}
                                            size="small"
                                            variant="outlined"
                                            inputProps={{ min: 0, style: { width: 70, textAlign: "center" ,height: "10px"} }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">{formatCurrency(totalWithMisc,2,false,"")}</TableCell>
                                </TableRow>
                            );
                        })}
                         {/* Total Sum Row */}
                         <TableRow>
                            <TableCell sx={{ p: 1 }} />
                            <TableCell sx={{ p: 1 }} />
                            {/* <TableCell sx={{ p: 1 }} /> */}
                            <TableCell sx={{ p: 1 }} />
                            <TableCell sx={{ p: 1 }} />
                            <TableCell align="center" sx={{ fontWeight: "bold", p: 1 }}>
                                Total
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold", p: 1 }}>
                                {
                                    formatCurrency(
                                        data.reduce((sum, row) => {
                                            const saleCommission = parseFloat(row.SaleCommission) || 0;
                                            const misc = parseFloat(row.misc) || 0;
                                            const persistedMisc = parseFloat(row.MiscAmount) || 0;
                                            return sum + (saleCommission + (persistedMisc + misc));
                                        }, 0)
                                    )
                                }
                            </TableCell>
                        </TableRow>
                        </>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No Record Found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </TableContainer>
        </div>
    );
}