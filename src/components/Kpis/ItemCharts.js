import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import formatAmount from "../../custom/FormatAmount";
import { CircularProgress } from "@mui/material";

const ItemCharts = ({ PLReport, PLloading,dynamicColorAndLogo }) => {
  const getMonth = (monthNum) => {
    const monthObj = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };
    return monthObj[monthNum] || "Unknown";
  };

  const categories = PLReport.map((item) => getMonth(item.Month));

  const series = [
    {
      name: "Irrigation Material",
      data: PLReport.map((item) => +item.IrrigationMaterial || 0),
      stack: "Irrigation",
    },
    {
      name: "Irrigation Expense",
      data: PLReport.map((item) => +item.IrrigationMaterialExpense || 0),
      stack: "Irrigation",
    },
    {
      name: "Irrigation Profit",
      data: PLReport.map(
        (item) =>
          (item.IrrigationMaterialProfit / 100) * item.IrrigationMaterial
      ),
      stack: "Irrigation",
    },
    {
      name: "Plant Material",
      data: PLReport.map((item) => +item.PlantMaterial || 0),
      stack: "Plant",
    },
    {
      name: "Plant Expense",
      data: PLReport.map((item) => +item.PlantMaterialExpense || 0),
      stack: "Plant",
    },
    {
      name: "Plant Profit",
      data: PLReport.map(
        (item) => (item.PlantMaterialProfit / 100) * item.PlantMaterial
      ),
      stack: "Plant",
    },
    {
      name: "Mulch Material",
      data: PLReport.map((item) => +item.Mulch || 0),
      stack: "Mulch",
    },
    {
      name: "Mulch Expense",
      data: PLReport.map((item) => +item.MulchExpense || 0),
      stack: "Mulch",
    },
    {
      name: "Mulch Profit",
      data: PLReport.map((item) => (item.MulchProfit / 100) * item.Mulch),
      stack: "Mulch",
    },
    {
      name: "General Material",
      data: PLReport.map((item) => +item.GeneralMaterial || 0),
      stack: "General",
    },
    {
      name: "General Expense",
      data: PLReport.map((item) => +item.GeneralMaterialExpense || 0),
      stack: "General",
    },
    {
      name: "General Profit",
      data: PLReport.map((item) => {
        return (item.GeneralMaterialProfit / 100) * item.GeneralMaterial;
      }),
      stack: "General",
    },
  ];

  const options = {
    chart: { type: "column", height: 500 },
    title: { text: "" },
    xAxis: { categories, title: { text: "Months" } },
    yAxis: {
      min: 0,
      title: { text: "Amount (USD)" },
      stackLabels: {
        enabled: false, // Show values on top of bars
      },
    },
    legend: { enabled: true }, // Hides the legend
    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: {
          // enabled: true, // Show numbers on bars
          formatter: function () {
            return this.y > 0 ? this.y : ""; // Hide if zero
          },
        },
      },
    },
    tooltip: {
      formatter: function () {
        // Get the category (Month) from x-axis
        const category = this.x;

        // Identify which stack (General, Irrigation, Plant, Mulch) the hovered item belongs to
        const stackName = this.series.options.stack; // This will be "General", "Irrigation", etc.

        // Find related series for the current stack
        const materialSeries = this.series.chart.series.find(
          (s) => s.options.stack === stackName && s.name.includes("Material")
        );
        const expenseSeries = this.series.chart.series.find(
          (s) => s.options.stack === stackName && s.name.includes("Expense")
        );
        const profitSeries = this.series.chart.series.find(
          (s) => s.options.stack === stackName && s.name.includes("Profit")
        );

        // Extract values based on the current index
        const materialValue = materialSeries?.data[this.point.index]?.y || 0;
        const expenseValue = expenseSeries?.data[this.point.index]?.y || 0;
        const profitValue = profitSeries?.data[this.point.index]?.y || 0;

        // Generate tooltip content
        return `<b>${stackName}</b><br>       
                <b>Material:</b> $${formatAmount(materialValue)}<br>
                <b>Expense:</b> $${formatAmount(expenseValue)}<br>
                <b>Profit:</b> $${formatAmount(profitValue)} (${formatAmount(profitValue/materialValue*100)}%)<br>`;
      },
      useHTML: true,
    },

    series,
  };
  return (
    <div className="card material-Tracking-chart">
      <div className="border-bottom border-black  d-md-block border-bottom-md">
        <h6 className="mb-0 p-2 "> Material and Expense Data</h6>
      </div>
      {PLloading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: dynamicColorAndLogo?.PrimeryColor }} />
        </div>
      ) : (
        //  <div >
        <HighchartsReact highcharts={Highcharts} options={options} />
        // </div>
      )}
    </div>
  );
};

export default ItemCharts;
