// import React from "react";
// import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, CircularProgress } from "@mui/material";

// export const TarynData = ({ commissionData, loader }) => {
//     return (
//         <div style={{ display: "flex",  alignItems: "center", minHeight: "100px" }}>
//             <TableContainer sx={{ overflowX: "auto", width: "100%", maxWidth: "50%" }}>
//                 <Table className="mt-2" sx={{  width: "100%" }}>
//                     <TableHead className="table-header">
//                         <TableRow className="material-tbl-alignment">
//                             <TableCell align="left" sx={{ fontWeight: "bold" }}>Name</TableCell>
//                             <TableCell align="right" sx={{ fontWeight: "bold" }}>Commission $</TableCell>
//                         </TableRow>
//                     </TableHead>
//                     <TableBody className="table-body bg-white">
//                         {loader ? (
//                             <TableRow className="material-tbl-alignment">
//                                 <TableCell colSpan={2} align="center">
//                                     <CircularProgress />
//                                 </TableCell>
//                             </TableRow>
//                         ) : (
//                             <>
//                                 {commissionData.length > 0 ? (
//                                     commissionData.map((item, idx) => (
//                                         <TableRow key={idx} className="material-tbl-alignment">
//                                             <TableCell align="left">{item?.Name}</TableCell>
//                                             <TableCell align="right">
//                                                 {item?.SaleCommission?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                                             </TableCell>
//                                         </TableRow>
//                                     ))
//                                 ) : (
//                                     <TableRow className="material-tbl-alignment">
//                                         <TableCell colSpan={2} align="center">
//                                             No Record Found
//                                         </TableCell>
//                                     </TableRow>
//                                 )}
//                                 <TableRow className="material-tbl-alignment">
//                                     <TableCell align="right" sx={{ fontWeight: "bold" }}></TableCell>
//                                     <TableCell align="right" sx={{ fontWeight: "bold" }}>
//                                         <span style={{ fontSize: "12px",marginRight: "20px" }}>Total</span>
//                                  {commissionData.reduce((sum, item) => sum + (parseFloat(item?.SaleCommission) || 0), 0)
//                                             .toLocaleString("en-US", { style: "currency", currency: "USD" })}
//                                     </TableCell>
//                                 </TableRow>
//                             </>
//                         )}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </div>
//     );
// };
import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, CircularProgress } from "@mui/material";

export const TarynData = ({ commissionData, loader, heading }) => {
    const isIrrigator = (row) => {
        console.log('row sd',row);
        const roleId = Number(row?.RoleId);
        const roleName = (row?.RoleName || "").toString().toLowerCase();
        return roleId === 5 || roleName.includes("irrigator");
    };
    const getSale = (row) => {
        const sale = parseFloat(row?.Sale) || 0;
        const misc = getMisc(row);
        // For irrigator, Sales column mirrors IrrigatorSales: Sale + (MiscAmount + misc)
        return isIrrigator(row) ? (sale + misc) : sale;
    };
    const getMisc = (row) => {
        const persisted = parseFloat(
            row?.MiscAmount ?? row?.AdditionalAdded ?? row?.AdditionalAmount
        ) || 0;
        const current = parseFloat(row?.misc) || 0;
        return persisted + current;
    };
    const computeTotalCommission = (row) => {
        console.log('row ',row);
        const miscPersistedPlusCurrent = getMisc(row);
        if (isIrrigator(row)) {
            // Mirror IrrigatorSales logic: commission is based on (Sale + misc) against threshold
            const saleWithMisc = (parseFloat(row?.Sale) || 0) + miscPersistedPlusCurrent;
            console.log('saleWithMisc ',saleWithMisc);
            const commissionPercentage = (parseFloat(heading?.SaleCommissionPercentage) || parseFloat(row?.SaleCommissionPercentage) || 0);
            console.log('commissionPercentage ',commissionPercentage);
            const commissionAmount = (parseFloat(heading?.SaleCommissionAmount) || parseFloat(row?.SaleCommissionAmount) || 0);
            console.log('commissionAmount ',commissionAmount);
            const saleCommission = saleWithMisc > commissionAmount ? (saleWithMisc * (commissionPercentage / 100)) : 0;
            console.log('saleCommission ',saleCommission);
            console.log('miscPersistedPlusCurrent saleCommission',saleCommission + miscPersistedPlusCurrent);
            // Irrigator total commission should include additional misc amounts too
            return saleCommission + miscPersistedPlusCurrent;
        }
        // Other roles: use provided components like RM/AM
        const saleCommission = parseFloat(row?.SaleCommission) || 0;
        const sprayTech = parseFloat(row?.SprayTechCommission) || 0;
        const mulchBonus = parseFloat(row?.MulchBonusAmount) || 0;
        const quarterly = parseFloat(row?.QuarterlyBonusAmount) || 0;
        return saleCommission + sprayTech + mulchBonus + quarterly + miscPersistedPlusCurrent;
    };

    const totalSales = commissionData.reduce((sum, item) => sum + getSale(item), 0);
    const totalMisc = commissionData.reduce((sum, item) => sum + getMisc(item), 0);
    const totalAll = commissionData.reduce((sum, item) => sum + computeTotalCommission(item), 0);

    return (
        <div style={{ display: "flex",  alignItems: "center", minHeight: "100px" }}>
            <TableContainer sx={{ overflowX: "auto", width: "100%", maxWidth: "50%" }}>
                <Table className="mt-2" sx={{  width: "100%" }}>
                    <TableHead className="table-header">
                        <TableRow className="material-tbl-alignment">
                            <TableCell align="left" sx={{ fontWeight: "bold" }}>Name</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Sales $</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Additional Added $</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Total Commission $</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="table-body bg-white">
                        {loader ? (
                            <TableRow className="material-tbl-alignment">
                                <TableCell colSpan={2} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {commissionData.length > 0 ? (
                                    commissionData.map((item, idx) => {
                                        const sale = getSale(item);
                                        const misc = getMisc(item);
                                        const total = computeTotalCommission(item);
                                        return (
                                            <TableRow key={idx} className="material-tbl-alignment">
                                                <TableCell align="left">{item?.Name}</TableCell>
                                                <TableCell align="right">
                                                    {sale.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {misc.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow className="material-tbl-alignment">
                                        <TableCell colSpan={4} align="center">
                                            No Record Found
                                        </TableCell>
                                    </TableRow>
                                )}
                                <TableRow className="material-tbl-alignment">
                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Total</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                        {totalSales.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                        {totalMisc.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                        {totalAll.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                                    </TableCell>
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};