import {
  createTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import TitleBar from "../TitleBar";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../apiConfig";
import Cookies from "js-cookie";

const laborData = [
  {
    jobNumber: 23433,
    customerName: "ABC Constructions",
    foremanName: "John Doe",
    estimateHours: 100,
    actualHours: 90,
    variance: 100 - 90,
    estimateCost: 5000,
    actualCost: 4500,
    grossProfit: 5000 - 4500,
    percentage: ((5000 - 4500) / 5000 * 100).toFixed(2),
  },
  {
    jobNumber: 23434,
    customerName: "Skyline Builders",
    foremanName: "Michael Smith",
    estimateHours: 80,
    actualHours: 85,
    variance: 80 - 85,
    estimateCost: 4000,
    actualCost: 4200,
    grossProfit: 4000 - 4200,
    percentage: ((4000 - 4200) / 4000 * 100).toFixed(2),
  },
  {
    jobNumber: 23435,
    customerName: "GreenTech Solutions",
    foremanName: "Sarah Johnson",
    estimateHours: 120,
    actualHours: 110,
    variance: 120 - 110,
    estimateCost: 6000,
    actualCost: 5500,
    grossProfit: 6000 - 5500,
    percentage: ((6000 - 5500) / 6000 * 100).toFixed(2),
  },
  {
    jobNumber: 23436,
    customerName: "Nova Engineering",
    foremanName: "David Lee",
    estimateHours: 150,
    actualHours: 160,
    variance: 150 - 160,
    estimateCost: 8000,
    actualCost: 8200,
    grossProfit: 8000 - 8200,
    percentage: ((8000 - 8200) / 8000 * 100).toFixed(2),
  },
  {
    jobNumber: 23437,
    customerName: "Urban Builders",
    foremanName: "Emma Brown",
    estimateHours: 95,
    actualHours: 90,
    variance: 95 - 90,
    estimateCost: 4800,
    actualCost: 4600,
    grossProfit: 4800 - 4600,
    percentage: ((4800 - 4600) / 4800 * 100).toFixed(2),
  },
  {
    jobNumber: 23438,
    customerName: "Bright Homes",
    foremanName: "Robert Wilson",
    estimateHours: 130,
    actualHours: 125,
    variance: 130 - 125,
    estimateCost: 7000,
    actualCost: 6900,
    grossProfit: 7000 - 6900,
    percentage: ((7000 - 6900) / 7000 * 100).toFixed(2),
  },
  {
    jobNumber: 23439,
    customerName: "NextGen Builders",
    foremanName: "Olivia Davis",
    estimateHours: 110,
    actualHours: 115,
    variance: 110 - 115,
    estimateCost: 5500,
    actualCost: 5800,
    grossProfit: 5500 - 5800,
    percentage: ((5500 - 5800) / 5500 * 100).toFixed(2),
  },
  {
    jobNumber: 23440,
    customerName: "Zenith Construction",
    foremanName: "William Taylor",
    estimateHours: 140,
    actualHours: 130,
    variance: 140 - 130,
    estimateCost: 7500,
    actualCost: 7000,
    grossProfit: 7500 - 7000,
    percentage: ((7500 - 7000) / 7500 * 100).toFixed(2),
  },
  {
    jobNumber: 23441,
    customerName: "EcoBuild Projects",
    foremanName: "Sophia Miller",
    estimateHours: 90,
    actualHours: 100,
    variance: 90 - 100,
    estimateCost: 4600,
    actualCost: 5000,
    grossProfit: 4600 - 5000,
    percentage: ((4600 - 5000) / 4600 * 100).toFixed(2),
  },
  {
    jobNumber: 23442,
    customerName: "Prime Constructors",
    foremanName: "Liam Anderson",
    estimateHours: 125,
    actualHours: 120,
    variance: 125 - 120,
    estimateCost: 6500,
    actualCost: 6300,
    grossProfit: 6500 - 6300,
    percentage: ((6500 - 6300) / 6500 * 100).toFixed(2),
  },
];

export const CostCenter = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#7c9c3d",
      },
    },
    typography: {
      fontSize: 14,
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: "8px 16px",
          },
        },
      },
    },
  });

  const token = Cookies.get("token");
  const [costCenterData, setCostCenterData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // keep api logic, but only map laborData for now
  const getCostCenter = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/Geofence/GetCostCenterData`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCostCenterData(response.data);
    } catch (error) {
      setCostCenterData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCostCenter();
  }, []);
  const filteredData = laborData.filter((item) => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return true;
    const customerName = (item.customerName || "").toLowerCase();
    const foremanName = (item.foremanName || "").toLowerCase();
    return (
      customerName.includes(searchValue) ||
      foremanName.includes(searchValue)
    );
  });

  const formatCurrency = (value) =>
    value != null
      ? `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "-";
  const formatPercent = (value) =>
    value != null ? `${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : "-";
  const formatNumber = (value) => {
    if (value == null) return "-";
    return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  return (
    <>
      <TitleBar
        icon={<ReceiptLongIcon fontSize="large" />}
        title={"Cost Center"}
      />
      <div className="container-fluid">
        <div className="row">
          <ThemeProvider theme={theme}>
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-2">
                    <TextField
                      placeholder="Search"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead className="table-header">
                      <TableRow className="material-tbl-alignment">
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Foreman Name</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Estimate Number" arrow>
                            <span>Job Number</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">Estimated Hours</TableCell>
                        <TableCell align="right">Actual Hours</TableCell>
                        <TableCell align="right">Variance (hrs)</TableCell>
                        <TableCell align="right">Billable Amount&nbsp;($)</TableCell>
                        <TableCell align="right">Labor Cost&nbsp;($)</TableCell>
                        <TableCell align="right">Gross Profit&nbsp;($)</TableCell>
                        <TableCell align="right">Gross Profit&nbsp;(%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            <CircularProgress size={28} />
                          </TableCell>
                        </TableRow>
                      ) : filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            No data found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((item, idx) => (
                          <TableRow key={item.jobNumber || idx} hover>
                            <TableCell>
                              {item.customerName}
                            </TableCell>
                            <TableCell>
                              {item.foremanName}
                            </TableCell>
                            <TableCell align="right">
                              {item.jobNumber}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(item.estimateHours)}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(item.actualHours)}
                            </TableCell>
                            <TableCell align="right">
                              {formatNumber(
                                item.estimateHours != null && item.actualHours != null
                                  ? item.estimateHours - item.actualHours
                                  : null
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.estimateCost)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.actualCost)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(item.grossProfit)}
                            </TableCell>
                            <TableCell align="right">
                              {formatPercent(item.percentage)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </ThemeProvider>
        </div>
      </div>
    </>
  );
};
