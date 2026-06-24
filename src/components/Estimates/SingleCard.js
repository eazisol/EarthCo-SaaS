import React from "react";
import formatAmount from "../../custom/FormatAmount";
import { Icon } from "@mui/material";
const SingleCard = ({
  setStatusId = () => {},
  statusId = null,
  status = 0,
  title,
  number,
  amount,
  color,
  icon,
  iconColor,
  width = "18em"
}) => {
  return (
    <div className="me-3" style={{ width: width }}>
      <div className="widget-stat card ">
        <div
          className={
            statusId === status
              ? "card-body ps-2 pe-1 selected-Card "
              : "card-body ps-2 pe-1 "
          }
          style={{ cursor: "pointer" }}
          onClick={() => {
            setStatusId(status);
          }}
        >
            <div className="media ai-icon mb-2">
              <span
                style={{
                  minWidth: "4.3rem",
                  height: "4.3rem",
                  width: "4.3rem",
                }}
                className={`me-1 bgl-${color} text-${color}`}
              >
              {/* <i className="ti-user"></i>  */}
              <Icon
                component={icon}
                fontSize="large"
                sx={{ color: iconColor }}
              />
            </span>
            <div className="media-body">
              <p style={{ whiteSpace: "nowrap" }}>{title}</p>
              <div className="row">
                <div className="col-md-12 col-sm-12">
                  <h4 className="mb-0 ms-2">{number}</h4>
                  {/* <span className="badge badge-primary">15%</span> */}
                </div>
                <div className="col-md-12 col-sm-12  text-end">
                  <p style={{ color: "black", marginRight: "8px" }}>
                    ${formatAmount(amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCard;
