import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/AppData";

const useFetchDashBoardData = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const navigate = useNavigate();
  const {  setLoggedInUser } = useContext(DataContext);
  const [dashBoardData, setdashBoardData] = useState({
    isQBToken : true,
    EstimateData: [],
    ServiceRequestData: [],
  });

  const [loading, setLoading] = useState(true);

  const getDashboardData = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Dashboard/GetDashboardData`,
        { headers }
      );
      console.log("dashboard response is", response.data);
      setdashBoardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("API Call Error:", error);
      if (error.response && error.response.status === 401) {
        navigate("/");
        Cookies.set("userRole","");
        Cookies.set("userId","");
        Cookies.set("CompanyName","");
        Cookies.set("CompanyId","");
        Cookies.set("ProviderToken","");
        Cookies.set("RefreshToken","");
        Cookies.set("AccessToken","");
        Cookies.set("UserEmailGoogle","");
        Cookies.set("userEmail","")
        Cookies.set("userName","")
 Cookies.set("EstimateAccess", "");
        Cookies.set("token","");
        setLoggedInUser({})
   
        console.error("API Call Error:", error.response.status);
      }
      setLoading(false);
    }
  };

  const sendGoogleCode = async (code, callback = () => {}) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Dashboard/ExternalLoginCallback?code=${code}`,
      
        { headers }
      );
      callback()
      console.log("google api call success", res.data);
    } catch (error) {
      console.log("google api call error", error);
    }
  };

  

  return { dashBoardData, getDashboardData, loading, sendGoogleCode };
};

export default useFetchDashBoardData;
