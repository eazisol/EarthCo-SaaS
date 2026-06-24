import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchPo = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [PoList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filteredPo, setFilteredPo] = useState([]);
  const [totalRecords, setTotalRecords] = useState({});
  const fetchPo = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/PurchaseOrder/GetPurchaseOrderList`,
        { headers }
      );
      setPoList(res.data);
      // setLoading(false);
      // setError("")
      console.log("purchase order", res.data);
    } catch (error) {
      // setLoading(false);
      // setError(error.message);
      console.log("Purchase api call error", error);
    }
  };

  const fetchFilterPo = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    StatusId = 0,
    isAscending = false
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/PurchaseOrder/GetPurchaseOrderServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&StatusId=${StatusId}&isAscending=${isAscending}`,
        { headers }
      );
      setFilteredPo(res.data.Data);
      setTotalRecords(res.data);
      setLoading(false);
      // setError("");
      console.log("purchase order", res.data);
    } catch (error) {
      setLoading(false);
      setError(true);
      setFilteredPo([]);
      console.log("api call error", error);
    }
  };

  return {
    PoList,
    loading,
    error,
    fetchPo,
    filteredPo,
    fetchFilterPo,
    totalRecords,
  };
};

export default useFetchPo;
