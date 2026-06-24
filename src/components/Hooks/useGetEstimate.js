import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { DataContext } from "../../context/AppData";
import { baseUrl } from "../../apiConfig";

const useGetEstimate = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { statusId, setStatusId } = useContext(DataContext);

  const [estimates, setEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allDataLoading, setAllDataLoading] = useState(false);
  const [tableError, setTableError] = useState(false);
  const [estmRecords, setEstmRecords] = useState({});
  const [filterdEstm, setFilterdEstm] = useState([]);
  const [estimateStatus, setEstimateStatus] = useState([]);

  const getEstimate = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimateList`,
        { headers }
      );
      console.log("🚀 ~ getEstimate ~ response:", response)
      // setTableError(false)
      // setEstimates(response.data);
      // if (response.data != null) {
      //   setIsLoading(false);
      // }
    } catch (error) {
      // setTableError(true);
      // setTimeout(() => {
      //   setTableError(false);
      // }, 4000);
      // setIsLoading(false);
      console.error("API Call Error:", error);
    }
  };

  const getFilteredEstimate = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    StatusId = statusId,
    isAscending = false,
    poFilter = 2,
    invoiceFilter = 2,
    billFilter = 2,
    isRegionalManager = false,
    isBillSort = false,
    isInvoiceSort = false,
    isProfit = false,
    isApprovedDate = false,
    StartDate = null,
    EndDate = null,
    EstimateTypeId
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimateServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&StatusId=${StatusId}&isAscending=${isAscending}&isPurchaseOrder=${poFilter}&isBill=${billFilter}&isInvoice=${invoiceFilter}&isRegionalManager=${isRegionalManager}&isBillSort=${isBillSort}&isInvoiceSort=${isInvoiceSort}&isProfit=${isProfit}&isApprovedDate=${isApprovedDate}&StartDate=${StartDate}&EndDate=${EndDate}&EstimateTypeId=${EstimateTypeId}`,
        { headers }
      );
      
      setTableError(false);
      setFilterdEstm(response.data.Data);
      setEstmRecords(response.data);

      setIsLoading(false);
    } catch (error) {
      setTableError(true);
      setFilterdEstm([]);
      // setTimeout(() => {
      //   setTableError(false);
      // }, 4000);
      setIsLoading(false);
      console.error("API Call Error:", error);
    }
  };
  const getAllEstimate = async (
    PageLength = 10,
    successCallback = () => {},
    Search = "",
    pageNo = 1,
    StatusId = 0,
    isAscending = false,
    poFilter = 2,
    invoiceFilter = 2,
    billFilter = 2,
    isRegionalManager = false,
    isBillSort = false,
    isInvoiceSort = false,
    isProfit = false,
    StartDate = null,
    EndDate = null,
    EstimateTypeId
  ) => {
    setAllDataLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimateServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&StatusId=${StatusId}&isAscending=${isAscending}&isPurchaseOrder=${poFilter}&isBill=${billFilter}&isInvoice=${invoiceFilter}&isRegionalManager=${isRegionalManager}&isBillSort=${isBillSort}&isInvoiceSort=${isInvoiceSort}&isProfit=${isProfit}&StartDate=${StartDate}&EndDate=${EndDate}&EstimateTypeId=${EstimateTypeId}`,
        { headers }
      );
      console.log(" estimate response is", response.data);

      setEstimates(response.data.Data);
      successCallback(response.data.Data);

      setAllDataLoading(false);
    } catch (error) {
      setEstimates([]);
      setAllDataLoading(false);
      console.error("API Call Error:", error);
    }
  };

  const getEstimateStatus = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Estimate/GetEstimateStatusList`,
        { headers }
      );
      console.log("estimate response is", response.data);
      setEstimateStatus(response.data);
      // setTableError(false)
      // setEstimates(response.data);
      // if (response.data != null) {
      //   setIsLoading(false);
      // }
    } catch (error) {
      // setTableError(true);
      // setTimeout(() => {
      //   setTableError(false);
      // }, 4000);
      // setIsLoading(false);
      console.error("API Call Error:", error);
    }
  };

  return {
    estmRecords,
    estimates,
    filterdEstm,
    isLoading,
    tableError,
    getEstimate,
    getFilteredEstimate,
    getEstimateStatus,
    estimateStatus,
    getAllEstimate,
    allDataLoading,
  };
};

export default useGetEstimate;
