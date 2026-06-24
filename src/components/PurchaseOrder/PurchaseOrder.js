import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import PoCards from "./PoCards";
import Cookies from "js-cookie";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TextField,
  TablePagination,
  TableSortLabel,
  Button,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import useFetchPo from "../Hooks/useFetchPo";
import { NavLink, useNavigate } from "react-router-dom";
import { useEstimateContext } from "../../context/EstimateContext";
import TitleBar from "../TitleBar";
import TblDateFormat from "../../custom/TblDateFormat";
import AddButton from "../Reusable/AddButton";
import formatAmount from "../../custom/FormatAmount";
import debounce from "lodash.debounce";
import { useSearchParams } from "react-router-dom";
import { DataContext } from "../../context/AppData";
import useMenuAccess from "../Hooks/useMenuAccess";
import { Tooltip } from "@mui/material";

const PurchaseOrder = () => {


  const {
    loading,
    error,
    filteredPo,
    fetchFilterPo,
    totalRecords,
  } = useFetchPo();

  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.4065 14.8714H7.78821"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M14.4065 11.0338H7.78821"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M10.3137 7.2051H7.78827"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5829 2.52066C14.5829 2.52066 7.54563 2.52433 7.53463 2.52433C5.00463 2.53991 3.43805 4.20458 3.43805 6.74374V15.1734C3.43805 17.7254 5.01655 19.3965 7.56855 19.3965C7.56855 19.3965 14.6049 19.3937 14.6168 19.3937C17.1468 19.3782 18.7143 17.7126 18.7143 15.1734V6.74374C18.7143 4.19174 17.1349 2.52066 14.5829 2.52066Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );

  const [searchParams, setSearchParams] = useSearchParams();


  const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get("rowsPerPage"))||100);



  const navigate = useNavigate();
  const { setEstimateLinkData } = useEstimateContext();
  const { dynamicColorAndLogo } = useContext(DataContext);
  // Permissions for PO (/purchase-order)
  const menuAccess = useMenuAccess();
  const canEdit = menuAccess?.canEdit && !menuAccess?.isLoading;
  const canCreate = menuAccess?.canCreate && !menuAccess?.isLoading;
  const canDelete = menuAccess?.canDelete && !menuAccess?.isLoading;
  const [tablePage, setTablePage] = useState(parseInt(searchParams.get("tablePage"))||0);
  const [statusId, setStatusId] = useState(parseInt(searchParams.get("statusId"))||0);
  const [searchPo, setSearchPo] = useState(searchParams.get("searchPo")||"");
  const [isAscending, setIsAscending] = useState(searchParams.get("isAscending") === "true");
  const debouncedGetFilteredPO = useCallback(debounce(fetchFilterPo, 500), []);
  useEffect(() => {
    setEstimateLinkData({});
  }, []);

  useEffect(() => {
    // Fetch estimates when the tablePage changes
    debouncedGetFilteredPO(
      searchPo,
      tablePage + 1,
      rowsPerPage,
      statusId,
      isAscending
    );
    setSearchParams({
      searchPo,tablePage, rowsPerPage, statusId, isAscending
    });
    console.log("search is", searchPo);
  }, [searchPo, tablePage, rowsPerPage, statusId, isAscending]);

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };


  const downloadCSV = (data) => {
    console.log("sdfsdf", data);

    const formatAmount = (amount) => {
      // Implement your amount formatting function here, for example:
      return amount ? amount.toFixed(2) : "";
    };

    const formatDate = (date) => {
      // Implement your date formatting function here, for example:
      return new Date(date).toLocaleDateString();
    };

    const csvContent = [
      [
        "Vendor",

        "Date",
        "Status",
        "Regional Manager",
        "Requested By",
        "PO#",
        "Bill#",
        "Estimate#",
        "Invoice#",

        "Amount",
      ],
      ...data.map((row) => [
        `"${row.SupplierDisplayName}"`,
        `"${formatDate(row.Date)}"`,
        `"${row.Status}"`,
        `"${row.RegionalManager}"`,
        `"${row.RequestedBy}"`,
        `"${row.PurchaseOrderNumber}"`,
        `"${row.EstimateNumber}"`,
        `"${row.BillNumber}"`,
        `"${row.InvoiceNumber}"`,

        `"${formatAmount(row.Amount)}"`,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Purchase orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };




  const sortedPoList = filteredPo;



  return (
    <>
      <TitleBar icon={icon} title="Add Purchase order" />

      <div className="container-fluid pt-3">
        <div className="row" style={{ height: "7.5em" }}>
          <PoCards
            closed={totalRecords.totalClosedRecords}
            open={totalRecords.totalOpenRecords}
            setStatusId={setStatusId}
            statusId={statusId}
          />{" "}
        </div>

        <div className="col-xl-3 mb-3 text-right"></div> 
        <div className="col-xl-12">
          <div className="card dz-card">
            <>
              <div className="card-header flex-wrap d-flex justify-content-between  border-0">
                <div>
                  <TextField
                    label="Search Purchase order"
                    variant="standard"
                    size="small"
                    value={searchPo}
                    onChange={(e) => setSearchPo(e.target.value)}
                  />
                </div>
                <div className=" me-2">
                  <button
                    className="btn btn-sm btn-outline-secondary me-2 custom-csv-link"
                   
                    onClick={() => {
                      // getAllEstimate(estmRecords.totalRecords, (data) => {
                      //   downloadCSV(data);
                      // });
                      downloadCSV(filteredPo);
                    }}
                  >
                    <i className="fa fa-download"></i>
                    CSV
                  </button>
                  <FormControl className="  me-2" variant="outlined">
                    <Select
                      labelId="customer-type-label"
                      variant="outlined"
                      value={isAscending}
                      onChange={() => {
                        setIsAscending(!isAscending);
                      }}
                      size="small"
                    >
                      <MenuItem value={true}>Ascending</MenuItem>
                      <MenuItem value={false}>Descending</MenuItem>
                    </Select>
                  </FormControl>
                  {canCreate ? (
                    <AddButton
                      onClick={() => {
                        navigate("/purchase-order/add-po");
                      }}
                    >
                      Add Purchase Order
                    </AddButton>
                  ) : (
                    <Tooltip title="You don't have create access" arrow>
                      <span>
                        <AddButton
                          disabled
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Add Purchase Order
                        </AddButton>
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="card-body pt-0">
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead className="table-header">
                      <TableRow className="material-tbl-alignment">
                        <TableCell>Vendor</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Regional Manager</TableCell>
                        <TableCell>Requested By</TableCell>
                        <TableCell>PO#</TableCell>
                        <TableCell>Estimate#</TableCell>
                        <TableCell>Bill#</TableCell>
                        <TableCell>Invoice#</TableCell>
                        <TableCell className="text-end">Amount</TableCell>
                        {/* <TableCell>Actions</TableCell> */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center">
                            <div className="center-loader">
                              <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {error ? (
                            <TableRow>
                              {" "}
                              <TableCell className="text-center" colSpan={9}>
                                {" "}
                                No records found{" "}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredPo.map((po, index) => (
                              <TableRow
                                className="material-tbl-alignment"
                                onClick={() => {
                                  const path = canEdit
                                    ? `/purchase-order/add-po?id=${po.PurchaseOrderId}`
                                    : `/purchase-order/purchase-order-preview?id=${po.PurchaseOrderId}`;
                                  navigate(path);
                                }}
                                hover
                                key={index}
                              >
                                <TableCell>{po.SupplierDisplayName}</TableCell>
                                <TableCell>{TblDateFormat(po.Date)}</TableCell>
                                <TableCell>
                                  <span
                                    style={{
                                      backgroundColor: po.StatusColor,
                                    }}
                                    className=" span-hover-pointer badge badge-pill "
                                  >
                                    {po.Status}
                                  </span>
                                </TableCell>
                                <TableCell>{po.RegionalManager}</TableCell>
                                <TableCell>{po.RequestedBy}</TableCell>
                                <TableCell>{po.PurchaseOrderNumber}</TableCell>
                                <TableCell>{po.EstimateNumber}</TableCell>
                                <TableCell>{po.BillNumber}</TableCell>
                                <TableCell>{po.InvoiceNumber}</TableCell>
                                <TableCell className="text-end">
                                  ${formatAmount(po.Amount)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[100, 200, 300]}
                  component="div"
                  count={totalRecords.totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={tablePage} // Use tablePage for the table rows
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setTablePage(0); // Reset the tablePage to 0 when rowsPerPage changes
                  }}
                />
              </div>
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseOrder;
