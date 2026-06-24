import React from "react";
import { GrDocumentPerformance } from "react-icons/gr";
import formatAmount from "../../custom/FormatAmount";
import CheckBoxIcon from "@mui/icons-material/BeenhereOutlined";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import { LuFileCheck2 } from "react-icons/lu";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TaskIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PercentIcon from "@mui/icons-material/Percent";
import DescriptionIcon from "@mui/icons-material/Description";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
const EstimateData = ({ data }) => {
  return (
    <div className="estimatedata-kpi-bg">
      <div className="border-bottom border-black  d-md-block border-bottom-md">
        <h6 className="mb-0 p-2 " style={{ color: "#2c2c2c" }}>
          Estimates
        </h6>
      </div>
      <div
        className="row  "
        style={{ paddingTop: "15px", paddingBottom: "15px" }}
      >
        <div className="col-md-3 p-5 py-2">
          <div className="border-end border-black border-1 d-md-block border-end-md">
            <div className="mb-2 ">
              <div className="d-flex align-items-center justify-content-between ">
                <div>
                  <p style={{ color: "#808080" }} className="font-w500">
                    Submitted
                  </p>
                  <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                    {formatAmount(data.NoOfEstimateSubmitted, 0)}
                  </h3>
                </div>

                <div
                  className={`icon-box bg-warning-light`}
                  style={{ marginRight: "20px" }}
                >
                  <PendingActionsOutlinedIcon color={"warning"} />
                </div>
              </div>
            </div>
            <div className=" mt-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p style={{ color: "#808080" }} className="font-w500">
                    Approved
                  </p>

                  <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                    {data.NoOfEstimateApproved || 0}
                  </h3>
                </div>
                <div
                  className={`icon-box bg-success-light`}
                  style={{ marginRight: "20px" }}
                >
                  <CheckBoxIcon color={"success"} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 p-5 py-2 ps-lg-2  ps-md-0">
          <div className="border-end border-black border-1 d-md-block border-end-md">
            <div className="">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p style={{ color: "#808080" }} className="font-w500">
                    Amount Submitted
                  </p>

                  <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                    {formatAmount(data?.AmountSubmitted)}
                  </h3>
                </div>
                <div
                  className={`icon-box bg-warning-light`}
                  style={{ marginRight: "20px" }}
                >
                  <AttachMoneyIcon color={"warning"} />
                </div>
              </div>
            </div>

            <div className="mt-3 ">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p style={{ color: "#808080" }} className="font-w500">
                    Amount Approved
                  </p>

                  <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                    <span style={{ fontSize: "16px", color: "#2c2c2c" }}>
                      $
                    </span>
                    {formatAmount(data.AmountApproved)}
                  </h3>
                </div>
                <div
                  className={`icon-box bg-success-light`}
                  style={{ marginRight: "20px" }}
                >
                  <CheckBoxIcon color={"success"} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 p-5 py-2 ps-lg-2  ps-md-0">
          <div className="border-end border-black border-1 d-md-block border-end-md">
            <div className="mb-2 ">
              <div className="d-flex align-items-center justify-content-between ">
                <div>
                  <p style={{ color: "#808080" }} className="font-w500">
                    Close
                  </p>
                  <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                    {`${formatAmount(data?.ClosePercentage, 2)}%`}
                  </h3>
                </div>

                <div
                  className={`icon-box bg-success-light`}
                  style={{ marginRight: "20px" }}
                >
                  <TaskIcon color={"success"} />
                </div>
              </div>
            </div>
            <div className="mt-3 ">
              <div className="d-flex align-items-center justify-content-between ">
                <div>
                  <p style={{ color: "#808080" }} className="font-w500">
                    Avg Days to closed
                  </p>
                  <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                    {formatAmount(data?.AvgTimeToClose, 2)}
                  </h3>
                </div>

                <div
                  className={`icon-box bg-info-light`}
                  style={{ marginRight: "20px" }}
                >
                  <PendingActionsIcon color={"info"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 p-5 py-2 ps-lg-0 ">
          {/* <div>
            <p style={{ color: "#808080" }} className="font-w500">
              Avg # Days Spent in Approved
            </p>
            <div className="d-flex align-items-center mb-2 mt-2">
              <CheckBoxIcon fontSize="large" sx={{ color: "#808080" }} />
              <div className="ms-3">
                <h4 className="mb-0 font-w600" style={{ color: "#404040" }}>
                  {(Number(data?.AvgDaysInApprove) || 0).toFixed(2)}
                </h4>
              </div>
            </div>
          </div> */}
          <div className="d-flex align-items-center justify-content-between ">
            <div>
              <p style={{ color: "#808080" }} className="font-w500">
                Avg Days Spent in Approved
              </p>
              <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                {formatAmount(data?.AvgDaysInApprove, 2)}
              </h3>
            </div>

            <div className={`icon-box bg-warning-light`}>
              <PercentIcon color={"warning"} />
            </div>
          </div>
          {/* <div className=" mt-3">
            <p style={{ color: "#808080" }} className="font-w500">
              Avg # Days Spent in Ready to Invoice
            </p>
            <div className="d-flex align-items-center mb-2 mt-2">
              <PlaylistAddCheckIcon
                fontSize="large"
                sx={{ color: "#808080" }}
              />
              <div className="ms-3">
                <h4 className="mb-0 font-w600" style={{ color: "#404040" }}>
                  {(Number(data?.AvgDaysInReadyToInvoice) || 0).toFixed(2)}
                </h4>
              </div>
            </div>
          </div> */}
          <div className="d-flex align-items-center justify-content-between ">
            <div>
              <p style={{ color: "#808080" }} className="font-w500">
                Avg Days Spent in Ready to Invoice
              </p>
              <h3 style={{ marginTop: "6px", color: "#2c2c2c" }}>
                {formatAmount(data?.AvgDaysInReadyToInvoice, 2)}
              </h3>
            </div>

            <div className={`icon-box bg-success-light`}>
              <DescriptionOutlinedIcon color={"success"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateData;
