import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../apiConfig";

const useQuickBook = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [loading, setLoading] = useState(false);
  const [showTick, setShowTick] = useState(false)

  const connectToQB = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/SyncQB/ConnectToQB`,
        { headers }
      );

      // Extract the URL from res.data and navigate to it without the base URL
      const url = new URL(res.data);
      window.location.href = url.href;

      // Open the URL in a new tab
      //   window.open(url.href, "_blank");

      console.log("Email response is", res.data);
    } catch (error) {
      console.log("error connecting to QB", error);
    }
  };

  const genetareQBToken = async (code, realmId, state) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/SyncQB/GenerateToken?code="${code}"&realmId="${realmId}"&state="${state}"`,
        { headers }
      );

      console.log("qb response is", res.data);
    } catch (error) {
      console.log("error connecting to QB", error);
    }
  };

  const syncQB = async (id = 0, callBack = () => {}) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/SyncQB/SyncDataAPI?synclogId=${id}`
      );

      setLoading(false);
      setShowTick(true)
      setTimeout(() => {
      setShowTick(false)
        
      }, 1500);

      console.log("synced qb", res.data);
      callBack(true, "success", "Synced Successfully")
    } catch (error) {
      setLoading(false);
      console.log("error connecting to QB", error);
      callBack(true, "error", "Sync Unsuccessfull")
    }
  };

  return {
    connectToQB,
    genetareQBToken,
    syncQB,
    loading,
    showTick
  };
};

export default useQuickBook;
