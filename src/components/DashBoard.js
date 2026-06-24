import React, { useContext, useEffect } from "react";
import { DataContext } from "../context/AppData";
import TitleBar from "./TitleBar";
import DashBoardSR from "./DashboardComponents/DashBoardSR";
import DashboardEstm from "./DashboardComponents/DashboardEstm";
import DashBoardCards from "./DashboardComponents/DashBoardCards";
import useFetchDashBoardData from "./Hooks/useFetchDashBoardData";
import DashBoardCalender from "./DashboardComponents/DashBoardCalender";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import MonthlyGoalsCard from "./Staff/MonthlyGoalsCard";

const DashBoard = () => {
  const { dashBoardData, getDashboardData, loading, sendGoogleCode } =
    useFetchDashBoardData();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(window.location.search);
  const code = queryParams.get("code");

  const { loggedInUser, dashBoardRefresh, setDashBoardRefresh } =
    useContext(DataContext);

  useEffect(() => {
    if (dashBoardRefresh) {
      window.location.reload();
    }
    if (code) {
      console.log("google code", code);
      sendGoogleCode(code, () => {
        navigate(`/dashboard`);
      });
    }
    getDashboardData();
  }, []);
  const icon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 7.49999L10 1.66666L17.5 7.49999V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.49999Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 18.3333V10H12.5V18.3333"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <TitleBar icon={icon} title="Dashboard" />
      <div className="container-fluid " >
        {loading ? (
          <div className="center-loader">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-9">
                <div className="">
                  <DashBoardSR
                    dashBoardData={dashBoardData}
                    getDashboardData={getDashboardData}
                  />
                </div>
                <div className="">
                  {loggedInUser.userRole == 5 || loggedInUser.userRole == 6 ? (
                    <></>
                  ) : (
                    <>
                      <DashboardEstm
                        dashBoardData={dashBoardData}
                        getDashboardData={getDashboardData}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="col-md-3">
                {(loggedInUser.userRole == "1" ||
                  loggedInUser.userRole == "4") && (
                  <div>
                    <MonthlyGoalsCard
                      onClick={() => {
                        if (loggedInUser.userRole == "1") {
                          navigate(`/monthly-goals`);
                        }
                      }}
                      value={dashBoardData.AchivedAmount}
                      maxValue={dashBoardData.MonthlyGoalAmount}
                    />
                  </div>
                )}
                <div>
                  <DashBoardCalender
                    dashBoardData={dashBoardData}
                    getDashboardData={getDashboardData}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <DashBoardCards dashBoardData={dashBoardData} />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashBoard;
