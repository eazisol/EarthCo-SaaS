import React, { useEffect, useState,useContext } from "react";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/DataSaverOffOutlined";
import TitleBar from "../TitleBar";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CustomPopover from "../Reusable/CustomPopover";
import DoneIcon from "@mui/icons-material/Done";
import useGetData from "../Hooks/useGetData";
import { NavLink, useNavigate } from "react-router-dom";
import { TblDateFormat } from "./utills";
import {

  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataContext } from "../../context/AppData";

const NotificationPage = () => {
  const navigate = useNavigate();
  const {loggedInUser } = useContext(DataContext);

  const icon = <NotificationsOutlinedIcon />;
  const { getListData, data, isloading, postData } = useGetData();
  const [seenIds, setSeenIds] = useState([]);
  const [rows, setRows] = useState(50);
  const [seenStatus, setSeenStatus] = useState(0)

  useEffect(() => {
    getListData(
      `/Notification/GetServiceRequestServerSideList?Search=${""}&RegionalManagerId=${loggedInUser.userRole == "1"? 0:loggedInUser.userId }&DisplayStart=${1}&DisplayLength=${rows}&StatusId=${seenStatus}&isAscending=${false}&StartDate=${null}&EndDate=${null}`
    );
    if (data.Data) {
      const notificationIds = data?.Data.map((item) => item.NotificationId);
      setSeenIds(notificationIds);
    }
  }, [rows,seenStatus]);

  useEffect(() => {
    console.log("seenIds", seenIds);
    if (data.Data) {
      const notificationIds = data?.Data.map((item) => item.NotificationId);
      setSeenIds(notificationIds);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      postData(`/Notification/UpdateNotificationStatus`, {
        Ids: seenIds,
        Type: 2,
      });
    };
  }, []);

  return (
    <>
      <TitleBar icon={icon} title="Notifications" />
      <div className="d-flex justify-content-center">
        <div className="card">
          <div className="card-body">
            <li className="nav-item dropdown align-items-center notification_dropdown header-border">
              <div
                id="DZ_W_Notification1"
                className="widget-media  p-3"
                style={{  width: "40vw" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                <ArrowBackIcon sx={{color : "#000", cursor : "pointer"}} onClick={() => {
                 window.history.back();
                }} />
                  <h5 style={{ fontWeight: "bold", width: "90%" }} className="mb-0" >
                    Notifications
                  </h5>
                  <CustomPopover trigger={<MoreHorizIcon />}>
                    <span className="py-3">
                      <div className="d-flex justify-content-between align-items-center py-1 px-3 hover-bg"
                      style={{cursor : "pointer"}}
                      onClick={() => {
                        postData(`/Notification/UpdateNotificationStatus`, {
                          Ids: [],
                          Type: 1,
                        },() => {
                          getListData(
                            `/Notification/GetServiceRequestServerSideList?Search=${""}&RegionalManagerId=${loggedInUser.userRole == "1"? 0:loggedInUser.userId }&DisplayStart=${1}&DisplayLength=${rows}&StatusId=${seenStatus}&isAscending=${false}&StartDate=${null}&EndDate=${null}`
                          );
                        });
                      }}
                      >
                        <span className="me-2">
                          <DoneIcon fontSize="small" />
                        </span>
                        <h6 style={{ width: "90%" }} className="mb-0 pb-0">
                          Mark all as read
                        </h6>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-1 px-3 hover-bg"
                      style={{cursor : "pointer"}}
                      onClick={() => {
                        postData(`/Notification/UpdateNotificationStatus`, {
                          Ids: [],
                          Type: 2,
                        }, () => {
                          getListData(
                            `/Notification/GetServiceRequestServerSideList?Search=${""}&RegionalManagerId=${loggedInUser.userRole == "1"? 0:loggedInUser.userId }&DisplayStart=${1}&DisplayLength=${rows}&StatusId=${seenStatus}&isAscending=${false}&StartDate=${null}&EndDate=${null}`
                          );
                        });
                      }}
                      >
                        <span className="me-2">
                          <DoneIcon fontSize="small" />
                        </span>
                        <h6 style={{ width: "90%" }} className="mb-0 pb-0">
                          Mark all as Seen
                        </h6>
                      </div>
                    </span>
                  </CustomPopover>
                </div>
                <ul className="timeline">
                <h6 style={{ fontWeight: "bold" }}>
              <span
              onClick={() => {
                setSeenStatus(1)
              }}
                className={
                  seenStatus == 1 ? `noti-tag noti-tag-selected` : `noti-tag `
                }
              >
                New
              </span>{" "}
              <span
              onClick={() => {
                setSeenStatus(2)
              }}
                className={
                  seenStatus == 2 ? `noti-tag noti-tag-selected` : `noti-tag `
                }
              >
                Earlier
              </span>{" "}
              <span
              onClick={() => {
                setSeenStatus(0)
              }}
                className={
                  seenStatus == 0 ? `noti-tag noti-tag-selected` : `noti-tag `
                }
              >
                All
              </span>
            </h6>
                  {isloading ? (
                    <div className="center-loader">
                    <CircularProgress style={{ color: "#789a3d" }} />
                  </div>
                  ) : (
                    <>
                      {data?.Data?.map((item, index) => (
                        <li
                          key={index}
                          className="d-flex justify-content-between align-items-center mb-3"
                          onClick={() => {
                            postData(`/Notification/UpdateNotificationStatus`, {
                              Ids: [item.NotificationId],
                              Type: 1,
                            });
                            if (item.Name == "Estimate") {
                              navigate(`/estimates/add-estimate?id=${item.Id}`);
                            } else if (item.Name == "ServiceRequest") {
                              navigate(
                                `/service-requests/add-sRform?id=${item.Id}`
                              );
                            }
                          }}
                        >
                          <div className="timeline-panel">
                            <div className="media me-2 media-success">
                              <PieChartOutlineOutlinedIcon />
                            </div>
                            <div className="media-body">
                              <h6 className="mb-1 noti-font">
                                {/* <span className="noti-font-highlight">
                        Estimate# 5679
                      </span>{" "}
                      has been pending since{" "}
                      <span className="noti-font-highlight">90 Days</span> */}
                                {item.Message}
                              </h6>
                              <small
                                className="d-block"
                                style={{ color: "#77993d", fontSize: "9px" }}
                              >
                                {TblDateFormat(item.CreatedDate)}
                              </small>
                            </div>
                          </div>
                          {!item.isRead && (
                            <i className="fa fa-circle text-primary"></i>
                          )}
                        </li>
                      ))}
                    </>
                  )}

                  {/* <h6 style={{ fontWeight: "bold" }}>Earlier</h6> */}
                  {data.Data && data?.Data.length !== data.totalRecord &&
                  <div className="all-notification-container">
                    <div
                      className="all-notification"
                      style={{ cursor: "pointer", color: "#77993d" }}
                      onClick={() => {
                        setRows(rows + 5);
                      }}
                    >
                      View More
                    </div>
                  </div>}
                </ul>
              </div>
            </li>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPage;
