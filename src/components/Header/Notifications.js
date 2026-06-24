import React, { useEffect,useContext, useState } from "react";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import CustomizedTooltips from "../Reusable/CustomizedTooltips";
import Badge from "@mui/material/Badge";
import CustomPopover from "../Reusable/CustomPopover";
import NotificationList from "./NotificationList";
import useGetData from "../Hooks/useGetData";
import { DataContext } from "../../context/AppData";

const Notifications = () => {
  const { getListData, data,isloading } = useGetData();
  const { loggedInUser } = useContext(DataContext);
  const [seenStatus, setSeenStatus] = useState(0)

  useEffect(() => {
    getListData(
      `/Notification/GetServiceRequestServerSideList?Search=${""}&RegionalManagerId=${loggedInUser.userRole == "1"? 0:loggedInUser.userId }&DisplayStart=${1}&DisplayLength=${10}&StatusId=${seenStatus}&isAscending=${false}&StartDate=${null}&EndDate=${null}`
    );
    console.log("loggedInUser",loggedInUser);
  }, [seenStatus]);
  return (
    <li className="nav-item dropdown align-items-center notification_dropdown header-border">
      <CustomPopover
        trigger={
          <CustomizedTooltips title="See Notifications">
            <span>
              <Badge badgeContent={data.totalUnSeen} color="error" max={99}>
                <NotificationsOutlinedIcon
                  sx={{ color: "white", cursor: "pointer" }}
                />
              </Badge>
            </span>
          </CustomizedTooltips>
        }
      >
        <NotificationList data={data} setSeenStatus={setSeenStatus} seenStatus={seenStatus}/>
      </CustomPopover>
    </li>
  );
};

export default Notifications;
