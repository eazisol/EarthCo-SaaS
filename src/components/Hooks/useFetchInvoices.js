import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchInvoices = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [invoiceList, setInvoiceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filteredInvoiceList, setfilteredInvoiceList] = useState([]);

  const fetchFilterInvoice = async (
    Search = "",
    pageNo = 1,
    PageLength = 100,
    StatusId = 0,
    isAscending = false,
    isIssueDate = false,
    profit=false, 
    startDate=null,
    endDate = null,
    customerId=0,
    isTemplate,
    agingStatusId  
  ) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${baseUrl}/api/Invoice/GetInvoiceServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&StatusId=${StatusId}&isAscending=${isAscending}&isIssueDate=${isIssueDate}&isProfit=${profit}&StartDate=${startDate}&EndDate=${endDate}&CustomerId=${customerId}&isTemplate=${isTemplate}&SEOverduedays=${agingStatusId}`,
        { headers }
      );
      setfilteredInvoiceList(res.data.Data);
      setTotalRecords(res.data.totalRecords);
      setError("");
      setLoading(false);
      console.log("purchase order", res.data);
    } catch (error) {
      setLoading(false);
      setfilteredInvoiceList([]);
      setError(error.message);
      console.log("api call error", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Invoice/GetInvoiceList`,
        { headers }
      );
      setInvoiceList(res.data);
      // setError("")
      // setLoading(false);
      console.log(res.data);
    } catch (error) {
      // setLoading(false);
      // setError(error.message);
      console.log("Api call error");
    }
  };



  return {
    invoiceList,
    loading,
    error,
    fetchInvoices,
    fetchFilterInvoice,
    filteredInvoiceList,
    totalRecords,
  };
};

export default useFetchInvoices;
