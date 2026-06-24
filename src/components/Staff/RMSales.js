import React, { useState, useContext } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, TextField, CircularProgress, TableContainer, Modal, Box, Fade, Typography, Button } from "@mui/material";
import formatAmount, { formatCurrency } from "../../custom/FormatAmount";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EventPopups from "../Reusable/EventPopups";
import { AddMisc } from "./apis";
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { DataContext } from "../../context/AppData";
export const RMSales = ({ commissionData, loader, heading, year, month }) => {
  const { dynamicColorAndLogo } = useContext(DataContext);

    const [data, setData] = useState(
        commissionData && Array.isArray(commissionData)
            ? commissionData.map(row => ({ ...row, misc: null, notes: row?.Note ?? "" }))
            : []
    );
    const [isSaving, setIsSaving] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);
    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [snackBarColor, setSnackBarColor] = useState("success");
    const [snackBarText, setSnackBarText] = useState("");
    const [openNoteModal, setOpenNoteModal] = useState(false);
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
    const [noteText, setNoteText] = useState("");   
    React.useEffect(() => {
        if (commissionData && Array.isArray(commissionData)) {
            setData(commissionData.map(row => ({ ...row, misc: null, notes: row?.Note ?? "" })));
        } else {
            setData([]);
        }
    }, [commissionData]);

    const handleMiscChange = (idx, value) => {
        const miscValue = parseFloat(value) || null;
        const newData = [...data];
        newData[idx].misc = miscValue;
        setData(newData);
    };

    const handleOpenNoteModal = (idx) => {
        setSelectedNoteIndex(idx);
        setNoteText(data[idx]?.notes || "");
        setOpenNoteModal(true);
    };

    const handleCloseNoteModal = () => {
        setOpenNoteModal(false);
        setSelectedNoteIndex(null);
        setNoteText("");
    };

    const handleSaveNote = async () => {
        if (selectedNoteIndex === null || isSaving) return;
        
        const row = data[selectedNoteIndex];
        const payload = [{
            UserId: row.UserId,
            Year: year,
            Month: month,
            Note: noteText.trim(),
            MiscAmount: null
        }];

        try {
            setIsSaving(true);
            const res = await AddMisc(payload);
            
            // Update the note in real-time
            const newData = [...data];
            newData[selectedNoteIndex].notes = noteText.trim();
            setData(newData);
            
            setOpenSnackBar(true);
            setSnackBarColor("success");
            setSnackBarText(res?.Message || "Note saved successfully");
            handleCloseNoteModal();
        } catch (err) {
            console.error("SaveNote error:", err);
            setOpenSnackBar(true);
            setSnackBarColor("error");
            setSnackBarText("Error saving note");
        } finally {
            setIsSaving(false);
        }
    };

    
    const handleSaveMisc = async () => {
        const payload = data
            .filter(row => row && row.misc !== null && !isNaN(parseFloat(row.misc)))
            .map(row => ({
                UserId: row.UserId,
                Year: year,
                Month: month,
                MiscAmount: parseFloat(row.misc) || 0,
                Note: null
            }));
            if (payload.length === 0 || isSaving) return;
            try {
                setIsSaving(true);
                const res = await AddMisc(payload);
                setOpenSnackBar(true);
                setSnackBarColor("success");
                setSnackBarText(res?.Message);
                console.log("AddMisc response:", res?.Message);
                // Reflect immediately; only clear misc per flow
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
                        {loader ? null : <TableRow className="material-tbl-alignment">
                            <TableCell align="left">Regional Manager</TableCell>
                            <TableCell align="right">Sales $</TableCell>
                            <TableCell align="right">{`Sales * ${heading?.SaleCommissionPercentage / 100} $`}</TableCell>
                            <TableCell align="right">Spray Tech $</TableCell>
                            <TableCell align="right">{`Spray Tech * ${heading?.SprayTechPercentage / 100} $`}</TableCell>
                            <TableCell align="right">{`QTY over ${heading?.MulchBonusYards}, $${heading?.MulchBonusAmount} $`}</TableCell>
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
                            <TableCell align="right">Quarterly Accrued Bonus $</TableCell>
                            <TableCell align="center">Notes</TableCell>
                            <TableCell align="right">Total Commission $</TableCell>
                        </TableRow>}
                    </TableHead>
                    <TableBody className="table-body bg-white">
                        {loader ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : data?.length > 0 ? (
                            <>
                                {data.map((row, idx) => {
                                    // Calculate total commission including persisted MiscAmount and current misc input
                                    const totalWithMisc =
                                        (parseFloat(row.SaleCommission) || 0) +
                                        (parseFloat(row.SprayTechCommission) || 0) +
                                        (parseFloat(row.MulchBonusAmount) || 0) +
                                        (parseFloat(row.QuarterlyBonusAmount) || 0) +
                                        ((parseFloat(row.MiscAmount) || 0) + (parseFloat(row.misc) || 0));
                                    return (
                                        <TableRow key={idx} className="material-tbl-alignment">
                                            <TableCell align="left">{row.Name}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.Sale,2,false,"")}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.SaleCommission,2,false,"")}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.SprayTechAmount,2,false,"")}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.SprayTechCommission,2,false,"")}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.MulchBonusAmount,2,false,"")}</TableCell>
                                            <TableCell align="right">{formatCurrency(row.MiscAmount,2,false,"")}</TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    value={row.misc === null ? "" : row.misc}
                                                    onChange={e => handleMiscChange(idx, e.target.value)}
                                                    size="small"
                                                    variant="outlined"
                                                    inputProps={{ min: 0, style: { width: 70, textAlign: "center", height: "10px" } }}
                                                />
                                            </TableCell>
                                            
                                            <TableCell align="right">{formatCurrency(row.QuarterlyAccruedAmount, 2,false,"")}</TableCell>
                                            {/* Notes column */}
                                            <TableCell align="center">
                                                <div
                                                    onClick={() => handleOpenNoteModal(idx)}
                                                    style={{
                                                        cursor: "pointer",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        padding: "6px 10px",
                                                        // border: "1px solid #7b9b3d",
                                                        borderRadius: "4px",
                                                        backgroundColor: "#fff",
                                                        transition: "all 0.2s ease",
                                                        minWidth: "20px",
                                                        minHeight: "30px"
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f5f8f0";
                                                        const primaryColor = dynamicColorAndLogo?.PrimeryColor || "#7b9b3d";
                                                        e.currentTarget.style.borderColor = primaryColor;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#fff";
                                                        const primaryColor = dynamicColorAndLogo?.PrimeryColor || "#7b9b3d";
                                                        e.currentTarget.style.borderColor = primaryColor;
                                                    }}
                                                    title="Edit Note"
                                                >
                                                    <EditNoteIcon
                                                        style={{
                                                            color: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d",
                                                            fontSize: "20px"
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                            {/* <TableCell align="center">{formatCurrency(row.QuarterlyBonusAmount)}</TableCell> */}
                                            <TableCell align="right">{formatCurrency(totalWithMisc,2,false,"")}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {/* Total Row */}
                                <TableRow>
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell sx={{ p: 1 }} />
                                    {/* <TableCell sx={{ p: 1 }} /> */}
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell sx={{ p: 1 }} />
                                    <TableCell
                                        align="right"
                                        sx={{ fontWeight: "bold",p: 1  }}
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{
                                            fontWeight: "bold",p: 1 
                                        }}
                                    >
                                        {formatCurrency(
                                            data.reduce((sum, row) => {
                                                const totalWithMisc =
                                                    (parseFloat(row.SaleCommission) || 0) +
                                                    (parseFloat(row.SprayTechCommission) || 0) +
                                                    (parseFloat(row.MulchBonusAmount) || 0) +
                                                    (parseFloat(row.QuarterlyBonusAmount) || 0) +
                                                    ((parseFloat(row.MiscAmount) || 0) + (parseFloat(row.misc) || 0));
                                                return sum + totalWithMisc;
                                            }, 0)
                                        )}

                                    </TableCell>
                                </TableRow>
                            </>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={11} align="center">
                                    No Record Found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            
            {/* Note Edit Modal */}
            <Modal
                aria-labelledby="note-modal-title"
                aria-describedby="note-modal-description"
                open={openNoteModal}
                onClose={handleCloseNoteModal}
                style={{ zIndex: 99999 }}
                closeAfterTransition
                slotProps={{
                    backdrop: {
                        timeout: 500,
                        zIndex: 99999,
                    },
                }}
            >
                <Fade in={openNoteModal}>
                    <Box
                        sx={{
                            width: { xs: "90%", md: "40%" },
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            borderRadius: "10px",
                            backgroundColor: "white",
                            padding: "20px 24px",
                        }}
                    >
                        <Typography
                            id="note-modal-title"
                            fontWeight="600"
                            fontSize="18px"
                            color="#2c2c2c"
                            align="left"
                            sx={{ mb: 2 }}
                        >
                            Edit Note
                        </Typography>
                        
                        <TextField
                            id="note-modal-description"
                            multiline
                            rows={6}
                            fullWidth
                            value={noteText}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 500) {
                                    setNoteText(value);
                                }
                            }}
                            variant="outlined"
                            placeholder="Enter note here..."
                            inputProps={{ 
                                maxLength: 500
                            }}
                            sx={{ mb: 1 }}
                        />
                        
                        <Typography
                            variant="caption"
                            color={noteText.length === 500 ? "error" : "textSecondary"}
                            align="right"
                            sx={{ display: "block", mb: 2 }}
                        >
                            {noteText.length}/500
                        </Typography>
                        
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                            }}
                        >
                            <Button
                                sx={{ textTransform: "capitalize" }}
                                variant="outlined"
                                onClick={handleCloseNoteModal}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                sx={{ 
                                    textTransform: "capitalize",
                                    backgroundColor: dynamicColorAndLogo?.PrimeryColor || "#7b9b3d",
                                    "&:hover": {
                                        backgroundColor: dynamicColorAndLogo?.PrimeryColor || "#6a8a35",
                                    },
                                }}
                                variant="contained"
                                onClick={handleSaveNote}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
};
