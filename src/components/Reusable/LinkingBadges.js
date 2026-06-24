import React, { useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import formatAmount from "../../custom/FormatAmount";
import { ConfirmationModal } from "../../custom/ConfirmationModal";
import { Tooltip } from "@mui/material";

const LinkingBadges = ({
  data,
  setData,
  invoices = false,
  totalAmount = 0,
  col1 = {
    header: invoices ? "Invoice#" : "PO#",
    number: invoices ? "InvoiceNumber" : "PurchaseOrderNumber",
    id: invoices ? "InvoiceId" : "PurchaseOrderId",
    to: invoices ? "/invoices/add-invoices?id=" : "/purchase-order/add-po?id=",
  },
  col2 = {
    header: invoices ? "Amount" : "Bill#",
    number: invoices ? "TotalAmount" : "BillNumber",
    id: "BillId",
    to: "/bills/add-bill?id=",
  },
  col3 = {
    header: "Percentage",
    number: "InvoiceNumber",
  },
  allowRemove = true,
}) => {
  const num = (v) => Number(v) || 0;
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  const handleChipDelete = (index) => {
    const newPayload = [...data];
    newPayload.splice(index, 1);
    setData(newPayload);
  };
  const grandTotal = useMemo(
    () => data.reduce((sum, item) => sum + num(item[col2.number]), 0),
    [data, col2.number]
  );
  const totalPercent = grandTotal > 0 ? 100 : 0;
  const rowPercent = (amt) => totalAmount > 0 ? (num(amt) / num(totalAmount)) * 100 : 0;
  const footerPercent = totalAmount > 0 ? (grandTotal / num(totalAmount)) * 100 : 0;

  // const totalPercent = grandTotal > 0
  //   ? data.reduce((sum, item) => sum + ((item.TotalAmount / grandTotal) * 100), 0)
  //   : 0;

  return (
    <>
      <ConfirmationModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        title="Confirmation"
        deleteButton
        description={
          <>
          {invoices?`Do you want to unlink the invoice? If yes, please click "Confirm".`:`Do you want to unlink the PO? If yes, please click "Confirm".`}
          </>
        }

        onConfirm={() => {
          handleChipDelete(pendingDeleteIndex);
          setPendingDeleteIndex(null);
          setModalOpen(false)
        }}


      />
      <div
        className="mb-1 row"
        style={{
          borderBottom: "1px solid #cccccc",
        }}
      >
        <div
          className={`col ${invoices ? "col-md-3" : "col-md-5"
            } col-sm-5 pe-0 my-1`}
        >
          {/* <p
      
            className="py-0   "
            style={{ lineHeight: 1, cursor: "pointer", fontWeight: "bold",color: '#6e6e6e'}}
          >
            {col1.header}
          </p> */}
          <label className="form-label">  {col1.header}</label>
        </div>
        <div className=" col col-md-1 col col-sm-1 px-0 my-1">
          <p className="py-0 " style={{ lineHeight: 1 }}>
            {/* - */}
          </p>
        </div>
        <div
          className={`col ${invoices ? "col-md-3" : "col-md-5"
            } col-sm-5 pe-0 my-1`}
        >
          {/* <p
            className="py-0  "
            style={{ lineHeight: 1, cursor: "pointer", fontWeight: "bold",color:' #6e6e6e' }}
          >
            {col2.header}
          </p> */}
          <label className="form-label">  {col2.header}</label>
        </div>
        {invoices && (
          <div className=" col col-md-1 col col-sm-1 px-0 my-1">
            <p className="py-0 " style={{ lineHeight: 1 }}>
              {/* - */}
            </p>
          </div>
        )}
        {invoices && (
          <div className="col col-md-4 col col-sm-5 pe-0 my-1">
            {/* <p
              className="py-0 "
              style={{ lineHeight: 1, cursor: "pointer", fontWeight: "bold",color:' #6e6e6e' }}
            >
              {col3.header}
            </p> */}
            <label className="form-label">  {col3.header}</label>
          </div>
        )}

        {/* <div className=" col col-md-1 col col-sm-1 pe-0 my-1"></div> */}
      </div>
      {data.map((item, index) => (
        <div key={index}>
          <div

            className="row  mb-1"
            style={{
              // borderBottom: "1px solid #cccccc",
              paddingRight: 0,
            }}
          >
            <div
              className={`col ${invoices ? "col-md-3" : "col-md-5"
                } col-sm-5 pe-0 my-1`}
              style={{ alignContent: "center" }}
            >
              <NavLink to={`${col1.to}${item[col1.id]}`}>
                {/* <p
                className="py-0  "
                style={{
                  lineHeight: 1,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {item[col1.number]}
              </p> */}
                <label className="form-label cursor-pointer" style={{ fontSize: "12px" }}>  {item[col1.number]}</label>
              </NavLink>
            </div>
            <div className="col col-md-1 col col-sm-1 px-0 my-1">
              <p className="py-0 " style={{ lineHeight: 1 }}>
                {/* - */}
              </p>
            </div>
            <div
              className={`col ${invoices ? "col-md-3" : "col-md-5"
                } col-sm-5 pe-0 my-1`}
              style={{ alignContent: "center" }}
            >
              {invoices ? (
                <div>
                  {/* <p
                  className="py-0  "
                  style={{
                    lineHeight: 1,
                    // cursor: "pointer",
                    // textDecoration: "underline",
                  }}
                >
                ${item[col2.number]?.toFixed(2)} 
                </p> */}
                  <label className="form-label cursor-pointer" style={{ fontSize: "12px" }}> ${formatAmount(item[col2.number])} </label>
                </div>
              ) : (
                <NavLink to={`${col2.to}${item[col2.id]}`}>
                  {/* <p
                  className="py-0  "
                  style={{
                    lineHeight: 1,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {item[col2.number]}
                </p> */}  <label className="form-label cursor-pointer" style={{ fontSize: "12px" }}>{item[col2.number]} </label>
                </NavLink>
              )}
            </div>
            {invoices && (
              <div className="col col-md-1 col col-sm-1 px-0 my-1">
                <p className="py-0 " style={{ lineHeight: 1 }}>
                  {/* - */}
                </p>
              </div>
            )}
            {invoices && (
              <div
                className="col col-md-3 col col-sm-5 pe-0 my-1"
                style={{ alignContent: "center" }}
              >
                {/* <NavLink to={`${col3.to}${item[col3.id]}`}> */}
                {/* <p
                className="py-0 "
                style={{
                  lineHeight: 1,
                }}
              >
    
                {totalAmount > 0
                  ? `${((item.TotalAmount / totalAmount) * 100).toFixed(2)} %`
                  : "0 %"}
              </p> */}
                <label className="form-label" style={{ fontSize: "12px" }}>
                  {formatAmount(rowPercent(item[col2.number]))}%
                </label>

                {/* </NavLink> */}
              </div>
            )}

            <div className="col col-md-1 col col-sm-1 px-0 my-1 text-center">
              {allowRemove && (
                    <Tooltip title={"Unlink"} arrow><span
                  className="fa fa-times"
                  style={{
                    // backgroundColor: "#FDEAEA",
                    padding: "2px 4px",
                    color: "#D32F2F",
                    borderRadius: "50px",
                    cursor: "pointer",
                    // border: "1px solid #D32F2F"
                  }}
                  // onClick={()=>handleChipDelete(index)}
                  onClick={() => {
                    setModalOpen(true);
                    setPendingDeleteIndex(index); // Store which item user wants to delete
                  }}

                ></span></Tooltip>
              )}
            </div>
          </div>


        </div>
      ))}
      {invoices && data.length > 0 && (
        <div
          className="row fw-bold mt-2"
          style={{ borderTop: "1px solid #cccccc" }}
        >
          {/* Column 1: Label */}
          <div className="col col-md-3 col-sm-5 pe-0 my-1">
            <label className="form-label">Total</label>
          </div>
          <div className=" col col-md-1 col col-sm-1 px-0 my-1">
            <p className="py-0 " style={{ lineHeight: 1 }}>
              {/* - */}
            </p>
          </div>
          {/* Column 2: Grand total amount */}
          <div className="col col-md-3 col-sm-5 pe-0 my-1">
            <label className="form-label">${formatAmount(grandTotal)}</label>
          </div>
          <div className=" col col-md-1 col col-sm-1 px-0 my-1">
            <p className="py-0 " style={{ lineHeight: 1 }}>
              {/* - */}
            </p>
          </div>
          {/* Column 3: % total (rounded to 2 decimals) */}
          <div className="col col-md-3 col-sm-5 pe-0 my-1">
            <label className="form-label">
              {formatAmount(footerPercent)}%
            </label>

          </div>


        </div>
      )}

    </>
  );
};

export default LinkingBadges;
