import React from "react";
import Invoices from "../Invoice/Invoices";
const CustomerInvoice = ({ customerId=0,mailData }) => {

  return (
    <div className="card">
      <h4 className="modal-title itemtitleBar" id="#gridSystemModal1">
       Invoices
      </h4>
     <Invoices customerform={true} customerId={customerId} mailData={mailData}/>
    </div>
  );
};

export default CustomerInvoice;
