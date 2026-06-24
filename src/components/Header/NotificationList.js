import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/DataSaverOffOutlined";
import { TblDateFormat } from "./utills";
import useGetData from "../Hooks/useGetData";

const NotificationList = ({ data, setSeenStatus, seenStatus }) => {
  const navigate = useNavigate();
  const { postData } = useGetData();

  const [seenIds, setSeenIds] = useState([]);
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
      <div>
        <div
          className="widget-media dz-scroll p-3"
          style={{ height: "380px", width: "25em" }}
        >
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
            {data.Data ? <>
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
                    navigate(`/service-requests/add-sRform?id=${item.Id}`);
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
                {!item.isRead && <i className="fa fa-circle text-primary"></i>}
              </li>
            ))} </> : <div className="text-center mt-2"><h6>No Notification to show</h6></div>} 

            {/* <h6 style={{ fontWeight: "bold" }}>Earlier</h6> */}
          </ul>
        </div>
      </div>
      {data.Data ?
      <div className="all-notification-container">
        <NavLink to="/Notifications" className="all-notification">
          See all notifications <i className="ti-arrow-end"></i>
        </NavLink>
      </div> : <></>}
    </>
  );
};

export default NotificationList;
