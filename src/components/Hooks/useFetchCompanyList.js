import axios from "axios";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchCompanyList = () => {
  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
  const [companies, setCompanies] = useState([]);
  const [loading, setloading] = useState(false)
  const fetchCompanies = async () => {
    setloading(true)
    try {
      const res = await axios.get(
        `${baseUrl}/api/Staff/GetCompanyList`,
        { headers }
      );
      setCompanies(res.data);
      setloading(false)
      console.log("company list is", res.data);
    } catch (error) {
      setloading(false)
      console.log("api call error", error);
    }
  };

  return {loading, setloading, companies, fetchCompanies };
};

export default useFetchCompanyList;
