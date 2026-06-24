import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useGetData = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
 
  const [data, setData] = useState([]);
  const [isloading, setIsloading] = useState(true);

  const getListData = async (
    endPoint,
    success = () => {},
    errorFun = () => {}
  ) => {
    // setIsloading(true)
    try {
      const response = await axios.get(`${baseUrl}/api${endPoint}`, {
        headers,
      });
      setData(response.data);
      setIsloading(false);
      if (response.data.SyncId) {
        success(response.data.SyncId);
      }else{
        success(response.data) 
      }
      console.log("response getListData", response.data);
    } catch (error) {
      console.error("Error fetching list data:", error);
      setIsloading(false);
      errorFun(error);
    }
  };

  const postData = async (
    endPoint,
    data,
    success = () => {},
    errorFun = () => {}
  ) => {
    // setIsloading(true)
    try {
      const response = await axios.post(`${baseUrl}/api${endPoint}`,data, {
        headers,
      });
      setData(response.data);
      success()
      console.log("response getListData", response.data);
    } catch (error) {
      console.error("Error fetching list data:", error);
     
      errorFun();
    }
  };

  return { getListData, data, isloading, postData };
};

export default useGetData;
