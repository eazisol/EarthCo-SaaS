import React, { useEffect, useState } from "react";
import useGetData from "../Hooks/useGetData";
import TitleBar from "../TitleBar";
import CircularProgress from "@mui/material/CircularProgress";
import CustomSyncTable from "./CustomSyncTable";
import FilterCards from "./FilterCards";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CardContainer from "./CardContainer";

const SyncLogTable = () => {
  const { getListData, data, isloading } = useGetData();
  const [statusId, setStatusId] = useState("All");
  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.986 14.0673C7.4407 14.0673 4.41309 14.6034 4.41309 16.7501C4.41309 18.8969 7.4215 19.4521 10.986 19.4521C14.5313 19.4521 17.5581 18.9152 17.5581 16.7693C17.5581 14.6234 14.5505 14.0673 10.986 14.0673Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.986 11.0054C13.3126 11.0054 15.1983 9.11881 15.1983 6.79223C15.1983 4.46564 13.3126 2.57993 10.986 2.57993C8.65944 2.57993 6.77285 4.46564 6.77285 6.79223C6.76499 9.11096 8.63849 10.9975 10.9563 11.0054H10.986Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  useEffect(() => {
    getListData(`/SynsQbLog/GetSyncLogs`);
  }, []);

  const getData = () => {
    getListData(`/SynsQbLog/GetSyncLogs`);
  };
  // const [invoices, setInvoices] = useState([]);
  // const [bills, setBills] = useState([]);
  // const [estimates, setEstimates] = useState([]);
  // const [POs, setPOs] = useState([]);
  // const [Customers, setCustomers] = useState([])
  const [totalRecords, setTotalRecords] = useState({
    EstimateTotal: 12,
    PoTotal: 13,
    BillTotal: 14,
    InvoiceTotal: 15,
    CustomerTotal: 16,
    ItemsTotal: 17,
    VendorTotal: 18,
  });
  useEffect(() => {
    // Initialize counts
    let estimateCount = 0;
    let poCount = 0;
    let billCount = 0;
    let invoiceCount = 0;
    let CustomerCount = 0;
    let ItemCount = 0;
    let VendorCount = 0;

    // Iterate through the data to count each type
    data.forEach((element) => {
      if (element.Name === "Invoice") {
        invoiceCount++;
      } else if (element.Name === "Bill") {
        billCount++;
      } else if (element.Name === "Estimate") {
        estimateCount++;
      } else if (element.Name === "PurchaseOrder") {
        poCount++;
      }
      else if (element.Name === "Customer") {
        CustomerCount++;
      }
      else if (element.Name === "Item") {
        ItemCount++;
      }
      else if (element.Name === "Vendor") {
        VendorCount++;
      }
    });

    // Update the state with the new counts
    setTotalRecords((prevRecords) => ({
      ...prevRecords,
      EstimateTotal: estimateCount,
      PoTotal: poCount,
      BillTotal: billCount,
      InvoiceTotal: invoiceCount,
      CustomerTotal: CustomerCount,
      ItemsTotal: ItemCount,
      VendorTotal: VendorCount,
      total: data.length 
    }));
  }, [data]);

  useEffect(() => {
   console.log("data",data)
  }, [data]);

  return (
    <>
      <TitleBar icon={icon} title="Quickbooks Sync Logs" />

      {isloading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: "#789a3d" }} />
        </div>
      ) : (
        <>
          <div className="container-fluid">
            <CardContainer
              setStatusId={setStatusId}
              statusId={statusId}
              totalRecords={totalRecords}
            />
          </div>
          <div className="container-fluid">
            <div className="card">
              <div className="card-body pt-0">
                <CustomSyncTable
                  data={data}
                  lable="Sync Logs"
                  getData={getData}
                  filterName={statusId}
                />
                {/* <CustomSyncTable
                data={POs}
                lable="Purchase Orders"
                to="/purchase-order/add-po?id="
              />
              <CustomSyncTable
                data={bills}
                lable="Bills"
                to="/bills/add-bill?id="
              />
              <CustomSyncTable
                data={invoices}
                lable="Invoices"
                to="/invoices/add-invoices?id="
              /> */}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SyncLogTable;
