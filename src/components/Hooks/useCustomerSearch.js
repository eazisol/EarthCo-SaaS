import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useCustomerSearch = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [customerSearch, setCustomerSearch] = useState([]);

  const fetchCustomers = async (e = "") => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Customer/GetSearchCustomersList?Search=${e}`,
        { headers }
      );
      console.log("customers search list", res.data);
      setCustomerSearch(res.data);
    } catch (error) {
      console.log("customer search api error", error);
    }
  };


  return { customerSearch, fetchCustomers };
};

export default useCustomerSearch;
