import axios from "axios";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useSaveGoogleToken = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };

  const sendToken = async (token, getDashboardData) => {
    console.log("payload to calender is ", token);
    try {
      const res = await axios.post(
        `${baseUrl}/api/Dashboard/AddGoogleCalendarToken`,
        token,
        { headers }
      );

      console.log("response is", res.data);
      getDashboardData();
    } catch (error) {
      console.log("api call error", error);
    }
  };
  const sendGoogeCode = async (endpoint) => {
    console.log("payload to calender is ", endpoint);
    try {
      const res = await axios.post(
        `${baseUrl}/api${endpoint}`,
       
        { headers }
      );

      console.log("google save code response is");
    
    } catch (error) {
      console.log("google api call error", error);
    }
  };
  const deleteToken = async (id, getDashboardData) => {
    console.log("payload to calender is ", id);
    try {
      const res = await axios.get(
        `${baseUrl}/api/Dashboard/DeleteGoogleCalendarToken?UserId=${id}`,
        { headers }
      );

      console.log("response is", res.data);
      getDashboardData();
    } catch (error) {
      console.log("api call error", error);
    }
  };
  return { sendToken,sendGoogeCode, deleteToken };
};

export default useSaveGoogleToken;
