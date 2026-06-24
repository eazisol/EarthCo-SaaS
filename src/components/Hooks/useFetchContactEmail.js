import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchContactEmail = () => {

    const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [contactEmail, setContactEmail] = useState([]);

  const fetchEmail = async (id) => {
    if (!id) {
       return 
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/Customer/GetCustomerContactEmailById?id=${id}`,
        { headers }
      );
      console.log("/api/Customer/GetCustomerContactEmailById", res.data);
      setContactEmail(res.data);
      console.log("contact mail is", res.data);
    } catch (error) {
      console.log("customer search api error", error);
    }
  };
  useEffect(() => {
    fetchEmail();
  }, []);

  return { contactEmail, fetchEmail };
};

export default useFetchContactEmail