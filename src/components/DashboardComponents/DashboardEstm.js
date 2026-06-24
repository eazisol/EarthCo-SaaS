import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import UpdateAllModal from "../Reusable/UpdateAllModal";
import DeleteAllModal from "../Reusable/DeleteAllModal";
import truncateString from "../../custom/TruncateString";
import formatAmount from "../../custom/FormatAmount";

const DashboardEstm = ({ dashBoardData, getDashboardData }) => {
  const navigate = useNavigate();

  const [selectedEstimates, setSelectedEstimates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleCheckboxChange = (event, estimateId) => {
    if (event.target.checked) {
      // Checkbox is checked, add the estimateId to the selectedEstimates array
      setSelectedEstimates((prevSelected) => [...prevSelected, estimateId]);
    } else {
      // Checkbox is unchecked, remove the estimateId from the selectedEstimates array
      setSelectedEstimates((prevSelected) =>
        prevSelected.filter((id) => id !== estimateId)
      );
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all rows
      if (
        dashBoardData &&
        dashBoardData.EstimateData &&
        Array.isArray(dashBoardData.EstimateData)
      ) {
        const allEstimateIds = dashBoardData.EstimateData.map(
          (estimate) => estimate.EstimateId
        );
        setSelectedEstimates(allEstimateIds);
        setSelectAll(true);
      } else {
        // Handle the case where dashBoardData or EstimateData is not an array
        console.error("dashBoardData.EstimateData is not an array");
      }
    } else {
      // Deselect all rows
      setSelectedEstimates([]);
      setSelectAll(false);
    }
  };

  const isRowSelected = (estimateId) => selectedEstimates.includes(estimateId);
  return (
    <div className="card">
      <div className="card-body py-0">
        <div className="row  dashboard-header bg-primary"  style={{height : "3.7em"}}>
          <div className="col-md-6  ">
            <h4 className="pt-3 pb-2" style={{ color: "white" }}>
              Estimates
            </h4>
          </div>
          <div className="col-md-6 text-end">
            {selectedEstimates.length <= 0 ? (
              <></>
            ) : (
              <FormControl
                className="py-2 me-2"
                style={{ borderColor: "transparent", color: "white" }}
                variant="outlined"
              >
                <Select
                  labelId="customer-type-label"
                  variant="outlined"
                  style={{ borderColor: "transparent", color: "white" }}
                  size="small"
                  value={1}
                >
                  <MenuItem value={1}>Group Actions</MenuItem>

                  <UpdateAllModal
                    selectedItems={selectedEstimates}
                    endpoint={"Estimate/UpdateAllSelectedEstimateStatus"}
                    bindingFunction={getDashboardData}
                  />
                  <br />

                  <DeleteAllModal
                    selectedItems={selectedEstimates}
                    endpoint={"Estimate/DeleteAllSelectedEstimate"}
                    bindingFunction={getDashboardData}
                  />
                </Select>
              </FormControl>
            )}
          </div>
        </div>
        <div className="row">
          <TableContainer sx={{ overflowX: "auto", p:0 }}>
            <Table>
              <TableHead className="table-header">
                <TableRow className="material-tbl-alignment">
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                  </TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Assign to</TableCell>
                  <TableCell>Estimate #</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Estimate Note</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashBoardData.EstimateData.length <= 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      No Record Found
                    </TableCell>
                  </TableRow>
                ) : (
                  dashBoardData.EstimateData?.map((estimate, index) => (
                    <TableRow
                      className={`material-tbl-alignment ${
                        isRowSelected(estimate.EstimateId) ? "selected-row" : ""
                      }`}
                      key={estimate.EstimateId}
                      hover
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedEstimates.includes(
                            estimate.EstimateId
                          )}
                          onChange={(e) =>
                            handleCheckboxChange(e, estimate.EstimateId)
                          }
                        />
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          navigate(
                            `/estimates/add-estimate?id=${estimate.EstimateId}`
                          );
                        }}
                      >
                        {estimate.CustomerDisplayName}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          navigate(
                            `/estimates/add-estimate?id=${estimate.EstimateId}`
                          );
                        }}
                      >
                        {estimate.RegionalManager}
                      </TableCell>

                      <TableCell
                        onClick={() => {
                          navigate(
                            `/estimates/add-estimate?id=${estimate.EstimateId}`
                          );
                        }}
                      >
                        {estimate.EstimateNumber}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          navigate(
                            `/estimates/add-estimate?id=${estimate.EstimateId}`
                          );
                        }}
                        align="right"
                      >
                        ${formatAmount(estimate.EstimateAmount)}
                      </TableCell>
                      <TableCell
                        onClick={() => {
                          navigate(
                            `/estimates/add-estimate?id=${estimate.EstimateId}`
                          );
                        }}
                      >
                        {truncateString(estimate.DescriptionofWork, 100)}
                      </TableCell>

                      <TableCell
                        onClick={() => {
                          navigate(
                            `/estimates/add-estimate?id=${estimate.EstimateId}`
                          );
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: estimate.StatusColor,
                          }}
                          className="badge badge-pill badge-success "
                        >
                          {estimate.Status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardEstm;
