import { CircularProgress, Popover } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetApi from "../Hooks/useGetApi";

const InvoiceTableList = ({ text, customerId=0,CustomerName="" }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const { getData } = useGetApi();

  const navigate = useNavigate();
  const handlePopoverOpen = (event) => {
    getInvoices()
    setAnchorEl(event.currentTarget);
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
  };

  const getInvoices = (
    Search = "",
    pageNo = 1,
    PageLength = 200,
    StatusId = 5,
    isAscending = false,
    isIssueDate = false,
    profit = false,
    startDate = null,
    endDate = null,

  ) => {
    setInvoiceLoading(true)
    getData(
      `/Invoice/GetInvoiceServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&StatusId=${StatusId}&isAscending=${isAscending}&isIssueDate=${isIssueDate}&isProfit=${profit}&StartDate=${startDate}&EndDate=${endDate}&CustomerId=${customerId}&DisplayName=${CustomerName}`,
      (data) => {
        setInvoiceLoading(false)
        setSelectedRow(data.Data)
        console.log("invoice data", data);
      },
      (err) => {
        setInvoiceLoading(false)
        console.log("invoice err" ,err);
      }
    );
  };


  

  return (
    <React.Fragment>
      <span onClick={handlePopoverOpen} style={{ cursor: "pointer" }}>
        {text}
      </span>
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div
          className="p-2"
          style={{
            width: "10em",
            height: "35vh",
            overflowY: "auto",
          }}
        >
          <h4>
            <>Invoices</>
          </h4>
          {invoiceLoading ? (
            <>
              <CircularProgress style={{ color: "#789a3d" }} size={20} />
            </>
          ) : (
            <>
              {selectedRow.length <= 0 ? (
                <div className="row text-center">
                  <p>No Record found</p>
                </div>
              ) : (
                selectedRow.map((item, index) => (
                  <div className=" wages-invoice" key={index}>
                    <div
                      style={{ cursor: "pointer" }}
                      className="row "
                      onClick={() => {
                        navigate(`/invoices/add-invoices?id=${item.InvoiceId}`);
                      }}
                    >
                      <div style={{ width: "100%" }} className="row">
                        <p>
                          <span style={{ fontWeight: "bold" }}>#</span>{" "}
                          {item.InvoiceNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </Popover>
    </React.Fragment>
  );
};

export default InvoiceTableList;
