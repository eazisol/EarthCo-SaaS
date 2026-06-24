import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

function useFetchCustomers() {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [customers, setCustomers] = useState([]);


  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/Customer/GetCustomersList`,{headers}
      );
      setCustomers(response.data);
    
    } catch (error) {
      console.error("API Call Error:", error);
   
    }
  };
  useEffect(() => {

    fetchCustomers();
  }, []);

  return { customers,fetchCustomers};
}

export default useFetchCustomers;
