import React, { useState, useEffect } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import formatAmount from "../../custom/FormatAmount";

const GoalCard = ({
  title,
  target,
  amount,
  titleAmount,
  color,
  remainingDays,
  month
}) => {
  const [Percentage, setPercentage] = useState(0);
  useEffect(() => {
    if (target <= amount) {
      setPercentage(100);
    } else {
      let percentage = (amount / target) * 100;
      setPercentage(percentage);
    }
  }, [amount, target]);

  const interpolateColor = (value) => {
    if (value == 100) {
      return `#28a745`;
    } else {
      return `#FFBF00`;
    }}

  return (
    <div className="card">
      <div className="card-body depostit-card">
        <div className="depostit-card-media d-flex justify-content-between style-1">
          <div>
            <h6 className="mb-1">{title} ({month})</h6>
            <h3>
              <span style={{ fontSize: "16px" }}>$</span>
              {formatAmount(titleAmount, 2 , true)}
            </h3>
          </div>
          <div className={`icon-box bg-${color}-light`}>
            <AttachMoneyIcon color={color == "danger" ? "error" : "success"} />
          </div>
        </div>
        <div className="progress-box mt-0">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <p className="mb-0" style={{ fontSize: "10px" }}>
              {Percentage == 100 ? "Target Achieved" : "Target Pending"} 
            </p>
            <p className="mb-0">
              {formatAmount(amount, 2, true)}/{formatAmount(target, 2, true)}
            </p>
          </div>

          <div className="progress">
            <div
              className={`progress-bar `}
              style={{
                width: `${Percentage}%`,
                height: "5px",
                borderRadius: "4px",
                backgroundColor : interpolateColor(Percentage)
              }}
              role="progressbar"
            ></div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0" style={{ fontSize: "10px" }}></p>
            <p className="mb-0">{Percentage.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
