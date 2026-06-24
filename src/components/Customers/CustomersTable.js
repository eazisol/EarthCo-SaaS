import React, { useContext, useEffect, useState } from "react";
import CustomerTR from "./CustomerTR";
import { Link } from "react-router-dom";
import axios from "axios";
import "datatables.net";
import CustomerModal from "../Modals/CustomerModal";
import { CustomerContext } from "../../context/CustomerData";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const CustomersTable = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { selectedCustomer } = useContext(CustomerContext);
  const [customers, setCustomers] = useState([]);
  const [customerAddSuccess, setCustomerAddSuccess] = useState(false);
  const [customerUpdateSuccess, setCustomerUpdateSuccess] = useState(false);

  const [customerFetchError, setcustomerFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchFilterCustomers = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    isAscending = false
  ) => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/GetCustomersServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&isAscending=${isAscending}`,
        { headers }
      );
      setcustomerFetchError(false);
      setCustomers(response.data.Data);
      setTotalRecords(response.data.totalRecords);
      if (response.data != null) {
        setIsLoading(false);
      }
    } catch (error) {
      console.log("EEEEEEEEEEEEEEEEE", error);

      setIsLoading(false);
      setcustomerFetchError(true);
      setCustomers([]);
      console.error("API Call Error:", error);
    }
  };



  return (
    <div className="container-fluid">
      <div className="row">
        <div className="">
          <div className="">
            {customerAddSuccess && (
              <Alert severity="success">Customer Added Successfuly</Alert>
            )}
            {customerUpdateSuccess && (
              <Alert severity="success">Customer Updated Successfuly</Alert>
            )}
          </div>

           
              <div>
                <CustomerTR
                  customerFetchError={customerFetchError}
                  headers={headers}
                  customers={customers}
                  setCustomerAddSuccess={setCustomerAddSuccess}
                  setCustomerUpdateSuccess={setCustomerUpdateSuccess}
                  fetchCustomers={fetchFilterCustomers}
                  totalRecords={totalRecords}
                  isLoading={isLoading}
                />
              </div>
         
        </div>
      </div>

   

    
    </div>
  );
};

export default CustomersTable;
