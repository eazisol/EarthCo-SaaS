import React, { useContext, useEffect, useState } from "react";
import TitleBar from "../TitleBar";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TextField,
  CircularProgress,
  Select,
  FormControl,
  MenuItem,
  Radio,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Button,
} from "@mui/material";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import ArrowOutwardIcon from "@mui/icons-material/OpenInNew";
import useGetApi from "../Hooks/useGetApi";
import { NavLink, useNavigate } from "react-router-dom";
import InvoiceTableList from "./InvoiceTableList";
import { DataContext } from "../../context/AppData";

const AgingReportByQB = ({
  filteredRows,
  formData,
  setFormData,
  handleTenureChange,
  reportData,
  generateReport,
  loggedInUser,
  dateFormat,
  setFilteredRows,
  isloading,
}) => {
  const { getData } = useGetApi();
  const navigate = useNavigate();
  const {setScrollBottom, dynamicColorAndLogo} = useContext(DataContext);
  const goToCustomer = (name, invoice = false) => {
    getData(
      `/Customer/GetCustomer?DisplayName=${name}&id=${0}`,
      (data) => {
        console.log("customerdata", data);
        if (invoice) {
          setScrollBottom(true)
          // navigate(
          //   `/customers/add-customer?id=${data.Data.UserId}&tab=5&statusId=5`
          // );

          const url = `/customers/add-customer?id=${data.Data.UserId}&tab=5&statusId=5`;
          window.open(url, "_blank"); // Open the URL in a new tab
        } else {
          // navigate(`/customers/add-customer?id=${data.Data.UserId}`);
          const url = `/customers/add-customer?id=${data.Data.UserId}`;
          window.open(url, "_blank"); // Open the URL in a new tab
        }

        // window.open(`${window.location.origin}/customers/add-customer?id=${data.Data.UserId}`,'_blank', 'rel=noopener noreferrer')
      },
      (err) => {
        console.log("customer errr", err);
      }
    );
  };
  return (
    <>
      <div className="card-body p-0">
        <div className="d-flex mb-2 align-items-baseline justify-content-between">
          <div className="d-flex align-items-center mt-3">
            <div className="">
              <div className="d-flex align-items-center">
                <FormControl className="  me-2" variant="outlined">
                  <FormLabel>Report period</FormLabel>
                  <Select
                    labelId="customer-type-label"
                    variant="outlined"
                    size="small"
                    value={formData.tenure}
                    onChange={handleTenureChange}
                  >
                    <MenuItem value={"Today"}>Today</MenuItem>
                    <MenuItem value={"Custom"}>Custom</MenuItem>
                    <MenuItem value={"Yesterday"}>Yesterday</MenuItem>
                    <MenuItem value={"This Week"}>This Week</MenuItem>
                    <MenuItem value={"Last Week"}>Last Week</MenuItem>
                    <MenuItem value={"This Week-to-date"}>
                      This Week-to-date
                    </MenuItem>
                    <MenuItem value={"Last Week-to-date"}>
                      Last Week-to-date
                    </MenuItem>
                    <MenuItem value={"Next Week"}>Next Week</MenuItem>
                    <MenuItem value={"Next 4 Weeks"}>Next 4 Weeks</MenuItem>
                    <MenuItem value={"This Month"}>This Month</MenuItem>
                    <MenuItem value={"Last Month"}>Last Month</MenuItem>
                    <MenuItem value={"This Month-to-date"}>
                      This Month-to-date
                    </MenuItem>
                    <MenuItem value={"Last Month-to-date"}>
                      Last Month-to-date
                    </MenuItem>
                    <MenuItem value={"Next Month"}>Next Month</MenuItem>
                    <MenuItem value={"This Fiscal Quarter"}>
                      This Fiscal Quarter
                    </MenuItem>
                    <MenuItem value={"Last Fiscal Quarter"}>
                      Last Fiscal Quarter
                    </MenuItem>
                    <MenuItem value={"This Fiscal Quarter-to-date"}>
                      This Fiscal Quarter-to-date
                    </MenuItem>
                    <MenuItem value={"Last Fiscal Quarter-to-date"}>
                      Last Fiscal Quarter-to-date
                    </MenuItem>
                    <MenuItem value={"Next Fiscal Quarter"}>
                      Next Fiscal Quarter
                    </MenuItem>
                    <MenuItem value={"This Fiscal Year"}>
                      This Fiscal Year
                    </MenuItem>
                    <MenuItem value={"Last Fiscal Year"}>
                      Last Fiscal Year
                    </MenuItem>
                    <MenuItem value={"This Fiscal Year-to-date"}>
                      This Fiscal Year-to-date
                    </MenuItem>
                    <MenuItem value={"Last Fiscal Year-to-date"}>
                      Last Fiscal Year-to-date
                    </MenuItem>
                    <MenuItem value={"Next Fiscal Year"}>
                      Next Fiscal Year
                    </MenuItem>
                  </Select>
                </FormControl>
                as of
                <div className="mt-2">
                  <TextField
                    id="input-with-icon-adornment"
                    label=""
                    placeholder="Date"
                    className="ms-3 mt-2"
                    size="small"
                    type="date"
                    value={formatDate(formData.reportDate)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reportDate: e.target.value,
                        tenure: "Custom",
                      })
                    }
                    InputLabelProps={{ shrink: true }} // Ensure the label is always shrunk
                  />
                </div>
                <FormControl className="ms-3">
                  <FormLabel id="demo-controlled-radio-buttons-group">
                    Aging Method
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={formData.agingMethod}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        agingMethod: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Current"
                      control={<Radio />}
                      label="Current"
                    />
                    <FormControlLabel
                      value="Report_Date"
                      control={<Radio />}
                      label="Report Date"
                    />
                  </RadioGroup>
                </FormControl>
                <Button
              sx={{
                textTransform: "capitalize",
                padding: "8px 10px",
                border: `1px solid ${dynamicColorAndLogo.PrimeryColor}`,
                "&:hover": {
                  backgroundColor: dynamicColorAndLogo.PrimeryColor,
                  color: "white",
                  border: `1px solid ${dynamicColorAndLogo.PrimeryColor}`,
                  outlineColor: "black",
                },
              }}
              variant={"contained"}
              onClick={generateReport}
              className="ms-2"
              startIcon={<HiOutlineClipboardDocumentList size={"0.9em"} />}
            >
              Generate Report
            </Button>
              </div>
            </div>
          </div>
          <div className="align-content-end">
           
          </div>
        </div>

        <div className="d-flex mb-2  justify-content-between align-items-end">
          <div className="d-flex align-items-center mt-3">
            <div className="">
              <div className="d-flex align-items-center">
                <TextField
                  label="Search Customer"
                  variant="standard"
                  className="me-3"
                  size="small"
                  value={formData.search}
                  onChange={(e) => {
                    setFormData({ ...formData, search: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="d-flex flex-column text-center mt-3">
            <h2 className="font-secondry">
              {loggedInUser.CompanyName ? loggedInUser.CompanyName : ""}
            </h2>
            <h4 className="text-bold mt-2 mb-1">A/R Aging Report</h4>
            <h5 className="font-secondry">
              As of {dateFormat(reportData?.Header?.Option[0]?.Value)}
            </h5>
          </div>
          <div className="">
            <FormControl className="  me-2" variant="outlined">
              <FormLabel>Sort by</FormLabel>
              <Select
                labelId="customer-type-label"
                variant="outlined"
                size="small"
                value={formData.sort}
                onChange={(e) => {
                  let filtered = reportData?.Rows?.Row || [];

                  // Apply sorting
                  if (e.target.value !== "default") {
                    filtered.sort((a, b) => {
                      const totalA =
                        parseFloat(
                          a?.ColData?.[a?.ColData.length - 1]?.Value
                        ) || 0;
                      const totalB =
                        parseFloat(
                          b?.ColData?.[b?.ColData.length - 1]?.Value
                        ) || 0;

                      return e.target.value === "ascend"
                        ? totalA - totalB
                        : totalB - totalA;
                    });
                    setFilteredRows(filtered);
                  } else {
                    setFilteredRows(reportData?.Rows?.Row);
                  }
                  setFormData({ ...formData, sort: e.target.value });
                }}
              >
                <MenuItem value={"default"}>Default</MenuItem>
                <MenuItem value={"ascend"}>Ascending</MenuItem>
                <MenuItem value={"descend"}>Descending</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
        {isloading ? (
          <div className="center-loader">
            <CircularProgress style={{ color: dynamicColorAndLogo.PrimeryColor }} />
          </div>
        ) : (
          <TableContainer sx={{ maxHeight: "75vh", overflowX: "auto" }}>
            <Table stickyHeader>
              <TableHead className="table-header">
                <TableRow
                  sx={{ backgroundColor: "#d3dee6" }}
                  className="material-tbl-alignment"
                >
                  {reportData?.Columns?.Column?.map((col, index) => (
                    <TableCell sx={{ backgroundColor: "#d3dee6" }} key={index}>
                      {col.ColType === "Customer" ? "Customer" : col.ColTitle}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length <= 0 && (
                  <TableRow>
                    <TableCell align="center" colSpan={12}>
                      No record found
                    </TableCell>
                  </TableRow>
                )}
                {filteredRows.map((row, index) => (
                  <TableRow key={index}>
                    {row?.ColData
                      ? row?.ColData?.map((col, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              p: "5px",
                            }}
                          >
                            {index == 0 ? (
                              <>
                                {col.Value}{" "}
                                <NavLink
                                  onClick={() => {
                                    goToCustomer(col.Value);
                                  }}
                                >
                                  <ArrowOutwardIcon style={{ fontSize: 14 }} />
                                </NavLink>
                              </>
                            ) : (
                              <>
                                {index == row.ColData.length-1 ? (
                                  <NavLink
                                    onClick={() => {
                                      goToCustomer(row?.ColData[0].Value, true);
                                    }}
                                  ><span style={{color : "#000"}}>
                                    {formatAmount(parseFloat(col.Value))}</span>{" "}<ArrowOutwardIcon style={{ fontSize: 14 }} />
                                  </NavLink>
                                ) : (
                                  <>{formatAmount(parseFloat(col.Value))}</>
                                )}
                              </>
                            )}
                          </TableCell>
                        ))
                      : row?.Summary?.ColData?.map((col, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              fontWeight: "bold",
                              borderBottom: "2px solid black",
                            }}
                          >
                            {index == 0 ? (
                              col.Value
                            ) : (
                              <>{formatAmount(parseFloat(col.Value))}</>
                            )}
                          </TableCell>
                        ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </>
  );
};

export default AgingReportByQB;
