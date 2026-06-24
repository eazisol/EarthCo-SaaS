import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchPunchListPhotos = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };

  const [tableData, setTableData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true)

  const fetchFilterPLPhoto = async (
    Search = "",
    pageNo = 1,
    PageLength = 10,
    isAscending = false,
    customerParam = 0
  ) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/PunchlistPhotoOnly/GetPunchlistPhotoOnlyServerSideList?DisplayStart=${pageNo}&DisplayLength=${PageLength}&Search="${Search}"&isAscending=${isAscending}&CustomerId=${customerParam}`,
        { headers }
      );

      setTableData(res.data.Data);
      setTotalRecords(res.data.totalRecords);
      setIsLoading(false)

      console.log("purchase order", res.data);
    } catch (error) {
      console.log("api call error", error);
      setIsLoading(false)

    }
  };

  return { fetchFilterPLPhoto, tableData, totalRecords, isLoading };
};

export default useFetchPunchListPhotos;
