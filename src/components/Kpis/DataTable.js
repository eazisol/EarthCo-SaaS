import { CircularProgress } from "@mui/material";
import React from "react";

const DataTable = ({ data, PLloading,dynamicColorAndLogo }) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const filteredMonths = data.map((item) => months[item.Month - 1]);

  return (
    <div style={{ overflowX: "auto" }} className="estimatedata-kpi-bg">
      <div className="border-bottom border-black d-md-block border-bottom-md">
        <h6 className="mb-0 p-2" style={{ color: "#2c2c2c" }}>
          Material and Expense Data
        </h6>
      </div>
      {PLloading ? (
       <div className="center-loader">  <CircularProgress style={{ color: dynamicColorAndLogo?.PrimeryColor }} /></div>
      ) : (    <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <td style={tableHeaderStyle}>
              <h6 style={{ color: "#2c2c2c" ,textAlign:"start"}}>Category</h6>
            </td>
            {filteredMonths.map((month, index) => (
              <td key={index} style={tableHeaderStyle}>
                <h6 style={{ color: "#2c2c2c",textAlign:"center" }}>{month}</h6>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
  {renderCategoryRows("Irrigation Data", "Material", "IrrigationMaterial", data, "#C8E6C9")}
  {renderCategoryRows("Plant Data", "Material", "PlantMaterial", data, "#BBDEFB")}
  {renderCategoryRows("Mulch Data", "Material", "Mulch", data, "#FFE0B2")}
  {renderCategoryRows("General Data", "Material", "GeneralMaterial", data, "#E1BEE7")}
</tbody>


      </table>)}
    </div>
  );
};

const renderCategoryRows = (heading,category, key, data,bgColor) => (
  <>
  <tr>
      <td colSpan={data.length + 1} style={{ 
        padding: "8px", 
        // fontWeight: "500", 
        backgroundColor: bgColor,
      }}>
        <h6 style={{ color: "#2c2c2c" ,textAlign:"start"}}>
        {heading}
        </h6>
      </td>
    </tr>

    <tr>
      <td style={categoryCellStyle}>
        <h6 style={{ color: "#2c2c2c" ,textAlign:"start"}}>{category}</h6>
      </td>
      {data.map((item, index) => {
  const rawValue = item[key];
  const formattedValue =
    !isNaN(rawValue) && rawValue !== null
      ? Number(rawValue).toLocaleString()
      : "0";

  return (
    <td key={index} style={categoryCellStyle}>
      ${formattedValue}
    </td>
  );
})}

    </tr>
    <tr>
      <td style={tableCellStyle}>
        {" "}
        <h6 style={{ color: "#2c2c2c",textAlign:"start" }}>Expense</h6>
      </td>
      {data.map((item, index) => {
  const rawValue = item[`${key}Expense`];
  const formattedValue =
    !isNaN(rawValue) && rawValue !== null
      ? Number(rawValue).toLocaleString()
      : "0";

  return (
    <td key={index} style={tableCellStyle}>
      ${formattedValue}
    </td>
  );
})}

    </tr>
    <tr>
  <td style={tableCellStyle}>
    <h6 style={{ color: "#2c2c2c" ,textAlign:"start"}}>Profit</h6>
  </td>
  {data.map((item, index) => {
  const profitValue = item[`${key}Profit`];

  if (typeof profitValue === 'number' && !isNaN(profitValue)) {
    const formattedProfit = profitValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <td key={index} style={tableCellStyle}>
        {formattedProfit}%
      </td>
    );
  } else {
    return (
      <td key={index} style={tableCellStyle}>
        0%
      </td>
    );
  }
})}

</tr>
  </>
);

const tableHeaderStyle = {
  borderBottom: "1px solid #d3d3d3",
  padding: "10px",
};

const tableCellStyle = {
  border: "1px solid #d3d3d3",
  // borderBottom: "1px solid #d3d3d3",
  padding: "2px 8px",
  textAlign:"end",
  color:"#2c2c2c"
};

const categoryCellStyle = {
  ...tableCellStyle,
  borderTop: "1px solid #d3d3d3",
 
};

export default DataTable;
