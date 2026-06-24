import React, { useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/AppData";
const CostTracking = ({ chartData, selectedMonth, selectedYear }) => {
  const { POICAmount, POJCAmount, POOCAmount, POTCAmount, POUCAmount } =
    chartData;
     const { setPurchaseOrderTypeId,setbillYear,setbillMonth} = useContext(DataContext);
  const navigate = useNavigate();
  const data = [
    { title: "Job Cost", total: POJCAmount, PurchaseOrderTypeId: 1 },
    { title: "Truck Cost", total: POTCAmount, PurchaseOrderTypeId: 2 },
    { title: "Incident Cost", total: POICAmount, PurchaseOrderTypeId: 3 },
    { title: "Uniform Cost", total: POUCAmount, PurchaseOrderTypeId: 4 },
    { title: "Office Cost", total: POOCAmount, PurchaseOrderTypeId: 5 },
  ];
  const handlePointClick = function () {
    const id = this.custom?.PurchaseOrderTypeId;
          setPurchaseOrderTypeId(id)
        setbillYear(selectedYear)
        setbillMonth(selectedMonth)
      navigate(`/bills`);

  };

  const chartOptions = {
    chart: {
      type: "pie",
    },
    title: {
      text: "",
    },
    tooltip: {
      pointFormatter: function () {
        return `
        <span style="color:${this.color}">\u25CF</span> 
        <b>${this.name}</b>: $${this.y.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}<br/> 
        Percentage: <b>${this.percentage.toFixed(1)}%</b>
      `;
      },
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        size: "55%",
        dataLabels: {
          enabled: true,
          formatter: function () {
            return `<b>${this.point.name}</b>: $${this.y.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`;
          },
        },
        point: {
          events: {
            click: handlePointClick,
          },
        },
      },
    },
    series: [
      {
        name: "Cost Share",
        colorByPoint: true,
        data: data.map((item) => ({
          name: item.title,
          y: item.total,
          custom: {
            PurchaseOrderTypeId: item.PurchaseOrderTypeId,
          },
        })),
      },
    ],
  };

  // const chartOptions = {
  //   chart: {
  //     type: "pie",
  //   },
  //   title: {
  //     text: '',
  //   },
  //   tooltip: {
  //     pointFormatter: function () {
  //       return `
  //         <span style="color:${this.color}">\u25CF</span>
  //         <b>${this.name}</b>: $${this.y.toLocaleString("en-US", {
  //           minimumFractionDigits: 2,
  //           maximumFractionDigits: 2
  //         })}<br/>
  //         Percentage: <b>${this.percentage.toFixed(1)}%</b>
  //       `;
  //     }
  //   },
  //   accessibility: {
  //     point: {
  //       valueSuffix: "%",
  //     },
  //   },
  //   plotOptions: {
  //     pie: {
  //       allowPointSelect: true,
  //       cursor: "pointer",
  //       size: "55%",
  //       dataLabels: {
  //         enabled: true,
  //         formatter: function () {
  //           return `<b>${this.point.name}</b>: $${this.y.toLocaleString("en-US", {
  //             minimumFractionDigits: 2,
  //             maximumFractionDigits: 2
  //           })}`;
  //         },
  //       },
  //     },
  //   },
  //   series: [
  //     {
  //       name: "Cost Share",
  //       colorByPoint: true,
  //       data: data.map((item) => ({
  //         name: item.title,
  //         y: item.total,
  //       })),
  //     },
  //   ],
  // };

  return (
    <div className="card Cost-Tracking-chart">
      <div className="border-bottom border-black  d-md-block border-bottom-md">
        {/* <h4 style={{ color: "#2c2c2c",marginLeft:"18px" }} className="pt-2">
            Cost Tracking
            </h4> */}
        <h6 className="mb-0 p-2 ">Cost Tracking</h6>
      </div>

      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default CostTracking;
