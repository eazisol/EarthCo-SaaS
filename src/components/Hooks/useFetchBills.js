import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchBills = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };

  const [billList, setBillList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billError, setBillError] = useState(false);
  const [filteredBillsList, setFilteredBillsList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/Bill/GetBillList`, {
        headers,
      });
      // setBillError(false)
      // setLoading(false);
      setBillList(res.data);
      console.log("bill list is", res.data);
    } catch (error) {
      // setLoading(false);
      // setBillError(true)
      console.log("api call error", error);
    }
  };

  const fetchFilterBills = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    isAscending = false,
    StartDate = null,
    EndDate = null,
    profit,
    PurchaseOrderTypeId,
    isTag,
    isRegionalManager
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/Bill/GetBillServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&isAscending=${isAscending}&isProfit=${profit}&StartDate=${StartDate}&EndDate=${EndDate}&PurchaseOrderTypeId=${PurchaseOrderTypeId}&isTag=${isTag}&isRegionalManager=${isRegionalManager}`,
        { headers }
      );
      setBillError(false);
      setLoading(false);
      setFilteredBillsList(res.data.Data);
      setTotalRecords(res.data.totalRecords);
      console.log("purchase order", res.data);
    } catch (error) {
      setLoading(false);
      setBillError(true);
      setFilteredBillsList([]);
      console.log("api call error", error.message);
    }
  };

  return {
    billError,
    billList,
    loading,
    fetchBills,
    fetchFilterBills,
    filteredBillsList,
    totalRecords,
  };
};

export default useFetchBills;
