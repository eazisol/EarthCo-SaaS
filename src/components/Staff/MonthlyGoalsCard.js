import React, { useEffect, useState } from "react";
import Speedometer from "../Reusable/Speedometer";
import formatAmount from "../../custom/FormatAmount";
const MonthlyGoalsCard = ({ onClick, value, maxValue }) => {
  const [daysUntilEndOfMonth, setDaysUntilEndOfMonth] = useState(0);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const currentYear = currentDate.getFullYear();
  const [Percentage, setPercentage] = useState(0);
  const calculateDaysUntilEndOfMonth = () => {
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = currentDate.getDate();
    return lastDayOfMonth - today;
  };

  useEffect(() => {
    setDaysUntilEndOfMonth(calculateDaysUntilEndOfMonth());
  }, []);

  useEffect(() => {
    if (maxValue <= value) {
      setPercentage(100);
    } else {
      let percentage = (value / maxValue) * 100;
      setPercentage(percentage);
    }
  }, [value, maxValue]);

  return (
    <div className="card">
      <div className="calendertitleBar">
        <div className="row">
          <div className="col-sm-12">
            <span>
              <h5
                style={{
                  color: "white",
                }}
              >
                Monthly Goals
              </h5>
            </span>
          </div>
        </div>
      </div>
      <div
        className="card-body"
        style={{ cursor: "pointer", position: "relative", height: "23rem" }}
        onClick={onClick}
      >
        <div className="row">
          <div className={`col-md-12 text-center p-0`}>
            <Speedometer value={value} maxValue={maxValue} left={3} />
          </div>
        </div>
        <div className="ms-3" style={{ position: "absolute", top: "51%" }}>
          <div className="depostit-card-media d-flex  style-1">
            <div>
              <h6 className="mb-0 pb-0" style={{fontWeight : "400"}}>Achieved</h6>
              <div className="row">
                <h3 className="">
                  <span style={{ fontSize: "16px" }}>$</span>
                  <span style={{ fontWeight: "600" }}>
                    {formatAmount(value, 2, true)}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#333333",
                      fontWeight: "200",
                    }}
                  >
                    {" "}
                    {Percentage.toFixed(2)}%
                  </span>
                </h3>
              </div>
            </div>
            {/* <div className={`icon-box bg-${color}-light`}>
            <AttachMoneyIcon color={color == "danger" ? "warning" : "success"} />
          </div> */}
          </div>
          <div className="depostit-card-media d-flex  style-1">
          
              <h6 className="mb-0 pb-0" style={{fontWeight : "400"}}>Remaining</h6>
              <div className="row">
                <h3 className="mb-0 pb-0">
                  <span style={{ fontSize: "16px" }}>$</span>
                  <span style={{ fontWeight: "600" }}>
                    {formatAmount(maxValue - value, 2, true)}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#333333",
                      fontWeight: "200",
                    }}
                  >
                    {" "}
                    {(100 - Percentage).toFixed(2)}%
                  </span>
                </h3>
            
            </div>
            {/* <div className={`icon-box bg-${color}-light`}>
            <AttachMoneyIcon color={color == "danger" ? "warning" : "success"} />
          </div> */}
          </div>
          <div className="d-flex align-items-end ">
            <h3
              className="mb-0 "
              style={{ fontSize: "30px", fontWeight: "600" }}
            >
              {daysUntilEndOfMonth}{" "}
              <span style={{ fontSize: "10px" }}>Days left</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyGoalsCard;
