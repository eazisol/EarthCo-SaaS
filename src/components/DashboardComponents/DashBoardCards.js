import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/AppData";
import SingleCard from "./SingleCard";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import CheckBoxIcon from "@mui/icons-material/BeenhereOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import MonthlyGoalsCard from "../Staff/MonthlyGoalsCard";
import TaskIcon from "@mui/icons-material/EngineeringOutlined";

const DashBoardCards = ({ dashBoardData }) => {
  const navigate = useNavigate();
  const { loggedInUser, setStatusId } = useContext(DataContext);

  return (
    <div className="col-xl-12 wid-100">
      <div className="row">
        <div className="col-xl-3  col-lg-6 col-sm-6">
          <SingleCard
            title={"Open Service Requests"}
            color="warning"
            count={dashBoardData.OpenServiceRequestCount}
            onClick={() => {
              navigate(`/service-requests`);
              setStatusId(1);
            }}
          >
            <PaymentsOutlinedIcon fontSize="large" sx={{ color: "white" }} />
          </SingleCard>
        </div>
        {loggedInUser.userRole == "5" || loggedInUser.userRole == "6" ? (
          <></>
        ) : (
          <>
            {" "}
            <div className="col-xl-3  col-lg-6 col-sm-6">
              <SingleCard
                title={"Pending Estimates"}
                color="info"
                count={dashBoardData.OpenEstimateCount}
                total={dashBoardData.OpenEstimateSum || "$ 0.00"}
                onClick={() => {
                  navigate(`/estimates`);
                  setStatusId(4);
                }}
              >
                {" "}
                <PendingActionsIcon fontSize="large" sx={{ color: "white" }} />
              </SingleCard>
            </div>
            <div className="col-xl-3  col-lg-6 col-sm-6">
              <SingleCard
                title={"Approved Estimates"}
                color="success"
                count={dashBoardData.ApprovedEstimateCount}
                total={dashBoardData.ApprovedEstimateSum || "$ 0.00"}
                onClick={() => {
                  navigate(`/estimates`);
                  setStatusId(1);
                }}
              >
                {" "}
                <CheckBoxIcon fontSize="large" sx={{ color: "white" }} />
              </SingleCard>
            </div>
            <div className="col-xl-3  col-lg-6 col-sm-6">
              <SingleCard
                title={"Ready to Invoice"}
                color="secondary"
                count={dashBoardData.ReadyToInvoiceCount}
                total={dashBoardData.ReadyToInvoiceSum || "$ 0.00"}
                onClick={() => {
                  navigate(`/estimates`);
                  setStatusId(7);
                }}
              >
                <PlaylistAddCheckIcon
                  fontSize="large"
                  sx={{ color: "white" }}
                />
              </SingleCard>
            </div>
            <div className="col-xl-3  col-lg-6 col-sm-6">
              <SingleCard
                title={" Closed Billed"}
                color="#99be5b"
                count={dashBoardData.ClosedBillCount}
                total={dashBoardData.ClosedBillSum || "$ 0.00"}
                onClick={() => {
                  navigate(`/estimates`);
                  setStatusId(2);
                }}
              >
                <FactCheckIcon fontSize="large" sx={{ color: "white" }} />
              </SingleCard>
            </div>
            <div className="col-xl-3  col-lg-6 col-sm-6">
              <SingleCard
                title={"Open Punchlist"}
                color="danger"
                count={dashBoardData.OpenPunchlistCount}
                onClick={() => {
                  navigate(`/punchlist`);
                  setStatusId(2);
                }}
              >
                <DnsOutlinedIcon fontSize="large" sx={{ color: "white" }} />
              </SingleCard>
            </div>
          </>
        )}
        {loggedInUser.userRole == "1" ? (
          <></>
        ) : (
          <div className="col-xl-3  col-lg-6 col-sm-6">
            <SingleCard
              title={"Wages"}
              color="#2059AE"
              count={" "}
              total={dashBoardData.WagesAmount || "$ 0.00"}
              onClick={() => {
                navigate(`/wages`);
              }}
            >
              <TaskIcon fontSize="large" sx={{ color: "white" }} />
            </SingleCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoardCards;
