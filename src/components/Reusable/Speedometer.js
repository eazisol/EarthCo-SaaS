import React, { useEffect, useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";
import formatAmount from "../../custom/FormatAmount";

const Speedometer = ({ size = 1.1, maxValue = 100, value = 0 , left=0}) => {
  const [percentvalue, setPercentvalue] = useState(0);
  useEffect(() => {
    if (value !== 0) {
      if (value <= maxValue) {
        let percentage = (value / maxValue) * 100;
        setPercentvalue(percentage);
        console.log(percentage);
      } else if (value >= maxValue) {
        setPercentvalue(100);
      }
    }
    if (value == 0 && maxValue == 0) {
      setPercentvalue(100);
    }else if (value == 0 && maxValue !== 0) {
      setPercentvalue(0);
    }
  }, [value, maxValue]);

  const interpolateColor = (value) => {
    if (value == 100) {
      return `#28a745`;
    } else {
      return `#FFBF00`;
    }
    // const red = Math.min(255, 255 * (1 - value / 100));
    // const green = 255; // Green is always 255 in both yellow and green
    // const blue = 0; // Blue is always 0 in both yellow and green
    // return `rgb(${red},${green},${blue})`;
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <ReactSpeedometer
          key={percentvalue}
          segments={2}
          segmentColors={[interpolateColor(percentvalue), "#ccc"]}
          customSegmentStops={[0, percentvalue, 100]}
          needleHeightRatio={0.8}
          needleColor={"#102C57"}
          value={percentvalue}
          minValue={0}
          ringWidth={30}
          maxValue={100}
          currentValueText={` `}
          customSegmentLabels={[
            {
              text: ``,
              position: "OUTSIDE",
              color: "#666666",
            },

            {
              text: ``,
              position: "OUTSIDE",
              color: "#666666",
            },
          ]}
          width={220 * size}
          height={150 * size}
          labelFontSize={"0px"}
          valueTextFontSize={"0px"}
        />
        <div style={{ position: "absolute", bottom: "14%", left: `${78-left}%` }}>
          <p style={{ fontSize: 12 }}>${formatAmount(maxValue, 2, true)}</p>
        </div>
        <div style={{ position: "absolute", bottom: "13%", left:  `${40-left}%` }}>
          <p style={{ fontSize: 12 }}>{`Ach. $${formatAmount(value, 2, true)}`}</p>
        </div>
      </div>
    </>
  );
};

export default Speedometer;
