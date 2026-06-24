import React from "react";
import { GrDocumentPerformance } from "react-icons/gr";
import formatAmount from "../../custom/FormatAmount";
import CheckBoxIcon from "@mui/icons-material/BeenhereOutlined";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import PercentIcon from "@mui/icons-material/Percent";
import { HmacSHA224 } from "crypto-js";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RequestPageOutlinedIcon from "@mui/icons-material/RequestPageOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import HomeRepairServiceOutlinedIcon from "@mui/icons-material/HomeRepairServiceOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
const SrCard = ({ data, loggedInUser, sprayTechReport }) => {
  let astimateArr = [
    {
      headings: "# of Service Requests",
      icon: <HomeRepairServiceOutlinedIcon color={"warning"} />,
      value: formatAmount(data.NoOfServiceRequest),
      sprayTech: formatAmount(data.NoOfISServiceRequest),
    },
    {
      headings: "Avg Days to closed",
      icon: <CalendarTodayOutlinedIcon color={"info"} />,
      value: formatAmount(data.AvgTimeToCloseSR, 2),
      sprayTech: formatAmount(data.AvgTimeToCloseISSR, 2),
    },
  ];

  const total = sprayTechReport.reduce(
    (sum, item) => sum + item?.InvoiceAmount,
    0
  );
  return (
    <div className="row">
      {loggedInUser?.CompanyId == 2 && (
        <>
          {" "}
          <div className="col-md-4">
            <div className="mantainess-kpi-bg ">
              <div className="border-bottom border-black  d-md-block border-bottom-md">
                <h6 className=" mb-0 p-2" style={{ color: "#2c2c2c" }}>
                  {" "}
                  Maintenance
                </h6>
              </div>

              <div className="row ">
                <div
                  className="col-md-12  py-2"
                  style={{ paddingLeft: "25px", paddingRight: "27px" }}
                >
                  <div className=" ">
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className={`icon-box bg-warning-light`}
                          style={{ marginRight: "14px" }}
                        >
                          <PendingActionsOutlinedIcon color={"warning"} />
                        </div>
                        <p style={{ color: "#808080" }} className="font-w500">
                          Jobs Submitted
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        {formatAmount(data.NoOfMaintenanceEstiamteSubmitted, 2)}
                      </h6>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`icon-box bg-warning-light `}>
                          <AttachMoneyIcon color={"warning"} />
                        </div>
                        <p
                          style={{ color: "#808080", marginLeft: "9px" }}
                          className="font-w500"
                        >
                          Amount Submitted
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        <span style={{ fontSize: "16px", color: "#2c2c2c" }}>
                          $
                        </span>
                        {formatAmount(
                          data.AmountMaintenanceEstiamteSubmitted,
                          2
                        )}
                      </h6>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`icon-box bg-success-light `}>
                          <AttachMoneyIcon color={"success"} />
                        </div>
                        <p
                          style={{ color: "#808080", marginLeft: "9px" }}
                          className="font-w500"
                        >
                          Amount Approved
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        <span style={{ fontSize: "16px", color: "#2c2c2c" }}>
                          $
                        </span>
                        {formatAmount(
                          data.AmountMaintenanceEstiamteApproved,
                          2
                        )}
                      </h6>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`icon-box bg-success-light `}>
                          <CheckBoxIcon color={"success"} />
                        </div>
                        <p
                          style={{ color: "#808080", marginLeft: "9px" }}
                          className="font-w500"
                        >
                          Jobs Approved
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        {formatAmount(data.NoOfMaintenanceEstiamteApproved, 2)}
                      </h6>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between  pb-1"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`icon-box bg-warning-light `}>
                          <PercentIcon color={"warning"} />
                        </div>
                        <p
                          style={{ color: "#808080", marginLeft: "9px" }}
                          className="font-w500"
                        >
                          Close
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        {`${formatAmount(
                          data.CloseMaintenanceEstiamtePercentage,
                          2
                        )}%`}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="non-mantainess-kpi-bg ">
              <div className="border-bottom border-black  d-md-block border-bottom-md">
                {/* <h4 style={{ color: "#2c2c2c",marginLeft:"18px" }} className="pt-2">
                  Non Maintainess
                </h4> */}
                <h6 className="mb-0 p-2 " style={{ color: "#2c2c2c" }}>
                  {" "}
                  Non Maintenance
                </h6>
              </div>
              <div className="row ">
                <div
                  className="col-md-12 py-2"
                  style={{ paddingLeft: "25px", paddingRight: "27px" }}
                >
                  <div className=" ">
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`icon-box bg-warning-light `}>
                          <PendingActionsOutlinedIcon color={"warning"} />
                        </div>
                        <p
                          style={{ color: "#808080", marginLeft: "9px" }}
                          className="font-w500"
                        >
                          Jobs Submitted
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        {/* {data.NoOfNonMaintenanceEstiamteSubmitted} */}
                        {formatAmount(
                          data.NoOfNonMaintenanceEstiamteSubmitted,
                          2
                        )}
                      </h6>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className={`icon-box bg-warning-light`}
                          style={{ marginRight: "14px" }}
                        >
                          <AttachMoneyIcon color={"warning"} />
                        </div>
                        <p style={{ color: "#808080" }} className="font-w500">
                          Amount Submitted
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        <span style={{ fontSize: "16px", color: "#2c2c2c" }}>
                          $
                        </span>
                        {formatAmount(
                          data.AmountNonMaintenanceEstiamteSubmitted,
                          2
                        )}
                      </h6>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className={`icon-box bg-success-light`}
                          style={{ marginRight: "14px" }}
                        >
                          <AttachMoneyIcon color={"success"} />
                        </div>
                        <p style={{ color: "#808080" }} className="font-w500">
                          Amount Approved
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        <span style={{ fontSize: "16px", color: "#2c2c2c" }}>
                          $
                        </span>
                        {formatAmount(
                          data.AmountNonMaintenanceEstiamteApproved,
                          2
                        )}
                      </h6>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-between"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center">
                        <div className={`icon-box bg-success-light `}>
                          <CheckBoxIcon color={"success"} />
                        </div>
                        <p
                          style={{ color: "#808080", marginLeft: "9px" }}
                          className="font-w500"
                        >
                          Jobs Approved
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        {formatAmount(
                          data.NoOfNonMaintenanceEstiamteApproved,
                          2
                        )}
                      </h6>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between pb-1"
                      style={{ marginTop: "9px" }}
                    >
                      <div className="d-flex align-items-center ">
                        <div
                          className={`icon-box bg-warning-light`}
                          style={{ marginRight: "14px" }}
                        >
                          <PercentIcon color={"warning"} />
                        </div>{" "}
                        <p style={{ color: "#808080" }} className="font-w500">
                          Close
                        </p>
                      </div>

                      <h6 style={{ color: "#2c2c2c" }}>
                        {`${formatAmount(
                          data.CloseNonMaintenanceEstiamtePercentage,
                          2
                        )}%`}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="col-md-4">
        <div className="sr-kpi-bg  h-100">
          <div className="border-bottom border-black  d-md-block border-bottom-md">
            <h6 className="mb-0 p-2 " style={{ color: "#2c2c2c" }}>
              Service Requests
            </h6>
          </div>
          <div className="row">
            <div
              className="col-md-12  pb-3 pt-1"
              style={{ paddingLeft: "25px", paddingRight: "27px" }}
            >
              <div className="d-flex justify-content-end">
                <p
                  className="mb-0"
                  style={{
                    color: "#2c2c2c",
                    fontSize: "0.900rem",
                    whiteSpace: "nowrap",
                    fontWeight: "500",
                  }}
                >
                  ST / Irr.
                </p>
              </div>

              {astimateArr?.map((item, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center justify-content-between pb-1"
                  style={{
                    width: "100%",
                    marginTop: index >= 1 ? "9px" : "3px",
                  }}
                >
                  {/* Icon + Heading */}
                  <div
                    className="d-flex align-items-center"
                    style={{ width: "60%" }}
                  >
                    <div className="icon-box bg-warning-light">{item.icon}</div>
                    <p
                      style={{ color: "#808080", marginLeft: "9px" }}
                      className="font-w500 "
                    >
                      {item.headings}
                    </p>
                  </div>

                  {/* Value */}
                  <h6
                    style={{
                      color: "#2c2c2c",
                      marginRight: "20px",
                      width: "20%",
                      textAlign: "end",
                    }}
                  >
                    {item?.value}
                  </h6>

                  {/* SprayTech */}
                  <h6
                    style={{ color: "#2c2c2c", width: "20%", textAlign: "end" }}
                  >
                    {item?.sprayTech}
                  </h6>
                </div>
              ))}

              {/* <div
                className="d-flex align-items-center justify-content-between  pb-1"
                style={{ marginTop: "9px" }}
              >
                <div className="d-flex align-items-center">
                  <div className={`icon-box bg-warning-light `}>
                    <HomeRepairServiceOutlinedIcon color={"warning"} />
                  </div>
                  <p
                    style={{ color: "#808080", marginLeft: "9px" }}
                    className="font-w500"
                  >
                    # of Service Requests
                  </p>
                </div>

                <h6 style={{ color: "#2c2c2c" }}>
                  {formatAmount(data.NoOfServiceRequest)}
                </h6>
              </div>

              <div
                className="d-flex align-items-center justify-content-between  pb-1"
                style={{ marginTop: "9px" }}
              >
                <div className="d-flex align-items-center">
                  <div className={`icon-box bg-info-light `}>
                    <CalendarTodayOutlinedIcon color={"info"} />
                  </div>
                  <p
                    style={{ color: "#808080", marginLeft: "9px" }}
                    className="font-w500"
                  >
                    Avg Days to closed
                  </p>
                </div>

                <h6 style={{ color: "#2c2c2c" }}>
                  {formatAmount(data.AvgTimeToCloseSR, 2)}
                </h6>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      {loggedInUser?.userRole == 1 && (
        <div className={`col-md-4 mt-${loggedInUser?.CompanyId == 2 && 3}`}>
          <div className="sr-kpi-bg  h-100">
            <div className="border-bottom border-black  d-md-block border-bottom-md">
              {/* <h4 style={{ color: "#2c2c2c",marginLeft:"18px" }} className="pt-2">
              Service Requests
            </h4> */}
              <h6 className="mb-0 p-2 " style={{ color: "#2c2c2c" }}>
                Construction Crew Tag
              </h6>
            </div>
            <div className="row">
              <div
                className="col-md-12  pb-3 pt-1"
                style={{ paddingLeft: "25px", paddingRight: "27px" }}
              >
                <div
                  className="d-flex align-items-center justify-content-between pb-1 "
                  style={{
                    width: "100%",
                    borderBottom: "0.5px solid rgb(240, 239, 239)",
                  }}
                >
                  <p
                    className="mb-0"
                    style={{
                      color: "#2c2c2c",
                      fontSize: "0.900rem",
                      whiteSpace: "nowrap",
                      fontWeight: "400",
                    }}
                  >
                    Regional Manager
                  </p>
                  <h6
                    className="mb-0"
                    style={{
                      color: "#2c2c2c",
                      fontSize: "0.900rem",
                      whiteSpace: "nowrap",
                      fontWeight: "400",
                    }}
                  >
                    Amount
                  </h6>
                </div>

                {sprayTechReport.length <= 0 ? (
                  <div className="d-flex align-items-center justify-content-center mt-4">
                    No Record Found
                  </div>
                ) : (
                  sprayTechReport?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between   py-1"
                        style={{
                          width: "100%",
                          borderBottom: "0.5px solid rgb(240, 239, 239)",
                        }}
                      >
                        <p
                          style={{
                            color: "#2c2c2c",
                            width: "50%",
                            fontSize: "0.900rem",

                            whiteSpace: "normal",
                          }}
                        >
                          {`${item?.FirstName} ${item?.LastName}`}
                        </p>

                        {/* Value */}
                        <h6
                          style={{
                            color: "#2c2c2c",
                            width: "50%",
                            textAlign: "end",
                          }}
                        >
                          {`$${formatAmount(item.InvoiceAmount, 2)}`}
                        </h6>
                      </div>
                    );
                  })
                )}
                <div
                  className="d-flex align-items-center justify-content-between mt-2"
                  style={{
                    width: "100%",
                  }}
                >
                  <p
                    className="mb-0"
                    style={{
                      color: "#2c2c2c",
                      fontSize: "0.900rem",
                      whiteSpace: "nowrap",
                      fontWeight: "700",
                    }}
                  >
                    Total
                  </p>
                  <p
                    className="mb-0"
                    style={{
                      color: "#2c2c2c",
                      fontSize: "0.900rem",
                      whiteSpace: "nowrap",
                      fontWeight: "700",
                    }}
                  >
                    {`$${formatAmount(total, 2)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SrCard;
