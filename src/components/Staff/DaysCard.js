import React, { useState, useEffect, useContext } from "react";
import AttachMoneyIcon from "@mui/icons-material/Update";
import formatAmount from "../../custom/FormatAmount";
import { DataContext } from "../../context/AppData";

const DaysCard = ({
  title,
  target,
  amount,
  titleAmount,
  color,
  remainingDays,
  amountPercentage,
  amountTotal,
  month
}) => {
  const { dynamicColorAndLogo } = useContext(DataContext);
  const [Percentage, setPercentage] = useState(0);
  useEffect(() => {
    if (target <= amount) {
      setPercentage(100);
    } else {
      let percentage = (amount / target) * 100;
      setPercentage(percentage);
    }
    if (remainingDays == 0) {
      setPercentage(0);
    }
  }, [amount, target]);

  return (
    <div className="card">
      <div className="card-body depostit-card">
        <div className="depostit-card-media d-flex justify-content-between style-1">
          <div>
            <h6 className="mb-1">Remaining ({month})</h6>
            <div className="row">
              <h3>
              <span style={{ fontSize : "16px"}}>$</span>
                {titleAmount> amountTotal? formatAmount(titleAmount-amountTotal, 2, true) :"0.00"}
                <span style={{ fontSize : "12px", color : "#333333", fontWeight : "200" }}> {(100 - amountPercentage).toFixed(2)}%</span>
              </h3>
            </div>
          </div>
          <div className={`icon-box bg-${color}-light`}>
            <AttachMoneyIcon color={color == "danger" ? "warning" : "success"} />
          </div>
        </div>
        <div className="progress-box mt-0">
          <div className="d-flex align-items-end ">
            <h2
              className="mb-0 "
              style={{ fontSize: "30px", fontWeight: "600" }}
            >
              {remainingDays}{" "}
              <span style={{  fontSize: "12px" }}>
                Days left
              </span>
            </h2>
          </div>

          <div className="progress" style={{backgroundColor: dynamicColorAndLogo?.PrimeryColor || "#77993d"}}>
            <div
              className={`progress-bar `}
              style={{
                width: `${(100-Percentage)}%`,
                height: "5px",
                borderRadius: "4px",
                backgroundColor : '#ccc'
                
              }}
              role="progressbar"
            ></div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0" style={{ fontSize: "10px" }}></p>
            <p className="mb-0">{target-remainingDays}/{target}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaysCard;
