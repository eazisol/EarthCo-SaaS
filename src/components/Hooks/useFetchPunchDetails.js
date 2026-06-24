import axios from "axios";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchPunchDetails = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [pLDetail, setPLDetail] = useState({});

  const fetchPunchListDetail = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/PunchList/GetPunchlistDetail?id=${id}`,
        { headers }
      );
      //   setPLDetail(response.data);

      console.log("response punchList data is", response.data);
      //   console.log("punchData data is", punchData);
    } catch (error) {
      console.error("API Call Error punchList detail:", error);
    }
  };

  return { pLDetail, setPLDetail, fetchPunchListDetail };
};

export default useFetchPunchDetails;
