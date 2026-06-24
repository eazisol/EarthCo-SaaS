import React from "react";
import { TbReportAnalytics } from "react-icons/tb";

const TitleBar = ({ icon, title,safetyIcon=false }) => {
  return (
    <div style={{height : "40px"}}>
    <div className="page-titles" style={{position : "fixed", width : "100%", }}>
      <ol className="breadcrumb">
        <div className="menu-icon  me-2">{safetyIcon?<TbReportAnalytics  size={"20px"} color="#8c8b8b" />:icon}</div>
        <li>
          <h5 className="bc-title ">{title}</h5>
        </li>
      </ol>
    </div></div>
  );
};

export default TitleBar;
