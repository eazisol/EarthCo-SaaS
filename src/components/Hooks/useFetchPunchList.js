import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { DataContext } from "../../context/AppData";
import { baseUrl } from "../../apiConfig";

function useFetchPunchList() {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [punchData, setPunchData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState({});
  const { statusId, setStatusId } = useContext(DataContext);

  const fetchPunchList = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/PunchList/GetPunchlistList`,
        { headers }
      );
      // setPunchData(response.data);
      // console.log("response data is", response.data);
      //   console.log("punchData data is", punchData);
      // setIsLoading(false);
    } catch (error) {
      // console.error("API Call Error:", error);
      // setIsLoading(false);
    }
  };

  const fetchFilterdPunchList = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    StatusId = statusId,
    isAscending = false,
    callback = () => {},
    reload=true,
    customer
  ) => {
    if (reload) {
      
      setIsLoading(true)
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/PunchList/GetPunchlistServerSideList?Search="${Search}"&DisplayStart=${pageNo}&DisplayLength=${PageLength}&StatusId=${StatusId}&isAscending=${isAscending}&CustomerId=${customer}`,
        { headers }
      );
      setPunchData(response.data.Data);
      setTotalRecords(response.data);
      console.log("response punchList data is", response.data);
      //   console.log("punchData data is", punchData);
      setIsLoading(false);
      callback()
    } catch (error) {
      console.error("API Call Error punchList:", error);
      setIsLoading(false);
      setPunchData([]);
      callback()
    }
  };

  return {
    punchData,
    setPunchData,
    isLoading,
    fetchPunchList,
    totalRecords,
    fetchFilterdPunchList,
  };
}

export default useFetchPunchList;
