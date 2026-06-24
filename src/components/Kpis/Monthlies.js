import React from 'react'
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Monthlies = ({monthReport}) => {
    
  // const data = [
  //   { month: "January", total: Number(parseFloat(monthReport[0]).toFixed(2)) },
  //   { month: "February", total: Number(parseFloat(monthReport[1]).toFixed(2)) },
  //   { month: "March", total: Number(parseFloat(monthReport[2]).toFixed(2)) },
  //   { month: "April", total: Number(parseFloat(monthReport[3]).toFixed(2)) },
  //   { month: "May", total: Number(parseFloat(monthReport[4]).toFixed(2)) },
  //   { month: "June", total: Number(parseFloat(monthReport[5]).toFixed(2)) },
  //   { month: "July", total: Number(parseFloat(monthReport[6]).toFixed(2)) },
  //   { month: "August", total: Number(parseFloat(monthReport[7]).toFixed(2)) },
  //   { month: "September", total: Number(parseFloat(monthReport[8]).toFixed(2)) },
  //   { month: "October", total: Number(parseFloat(monthReport[9]).toFixed(2)) },
  //   { month: "November", total: Number(parseFloat(monthReport[10]).toFixed(2)) },
  //   { month: "December", total: Number(parseFloat(monthReport[11]).toFixed(2)) },
  // ];
  const data = monthReport
  .map((value, index) => {
    const total = Number(parseFloat(value).toFixed(2));
    return {
      month: new Date(0, index).toLocaleString('default', { month: 'long' }),
      total: total > 0 ? total : null,
    };
  })
  .filter(item => item.total !== null); 
  const chartOptions = {
    title: {
      text: '',
    },
    xAxis: {
      categories: data.map((item) => item.month),
      title: {
        text: 'Months',
      },
    },
    yAxis: {
      title: {
        text: 'Total',
      },
    },
    series: [
      {
        name: 'Total',
        data: data.map((item) => item.total),
      },
    ],
    chart: {
      type: 'line',
    },
    tooltip: {
      valueDecimals: 2,
    },
  };

      // const chartOptions = {
      //   title: {
      //     text: '',
      //   },
      //   xAxis: {
      //     categories: data.map((item) => item.month),
      //     title: {
      //       text: 'Months',
      //     },
      //   },
      //   yAxis: {
      //     title: {
      //       text: 'Total',
      //     },
      //   },
      //   series: [
      //     {
      //       name: 'Total',
      //       data: data.map((item) => item.total),
      //     },
      //   ],
      //   chart: {
      //     type: 'line',
      //   },
      // };
  return (
    // <div className="card Cost-Tracking-chart"  >
    //   <div className="border-bottom border-black  d-md-block border-bottom-md" >
    //         {/* <h4 style={{ color: "#2c2c2c",marginLeft:"18px" }} className="pt-2">
    //         Monthly Invoice Totals
    //         </h4> */}
    //         <h6 className="mb-0 p-2 "> Monthly Invoice Totals</h6>
    //       </div>
    //      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    // </div>
    <div className="card Cost-Tracking-chart">
    <div className="border-bottom border-black d-md-block border-bottom-md">
      <h6 className="mb-0 p-2">Monthly Invoice Totals</h6>
    </div>
    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
  </div>
  )
}

export default Monthlies