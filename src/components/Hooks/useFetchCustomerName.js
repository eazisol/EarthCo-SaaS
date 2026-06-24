import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchCustomerName = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [name, setName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [staffName, setStaffName] = useState("")

  const fetchName = async (id, anonymFunction = () => {}) => {
    if (!id) {
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/GetCustomerNameById?id=${id}`,
        { headers }
      );
      setName(response.data);
      console.log("Customer Name is", response.data)
      anonymFunction()
    } catch (error) {
      console.error("Customer API Call Error:", error);
      anonymFunction()
    }
  };

  const fetchSupplierName = async (id) => {
    if (!id) {
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Supplier/GetSupplierNameById?id=${id}`,
        { headers }
      );
      setSupplierName(response.data);
      console.log("Supplier name", response.data);
    } catch (error) {
      console.error("Supplier API Call Error:", error);
    }
  };

  const fetchStaffName = async (id) => {
    if (!id) {
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/Staff/GetStaffNameById?id=${id}`,
        { headers }
      );
      setStaffName(response.data);
      console.log("Supplier name", response.data);
    } catch (error) {
      console.error("API Call Error:", error);
    }
  };

  return {
    name,
    fetchName,
    setName,
    fetchSupplierName,
    supplierName,
    setSupplierName,
    fetchStaffName,
    staffName,

  };
};

export default useFetchCustomerName;
