import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchCustomerEmail = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [customerMail, setCustomerMail] = useState("");
  const fetchCustomerEmail = async (id) => {
    if (!id) {
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/Customer/GetCustomerEmailById?id=${id}`,
        { headers }
      );
      console.log("email", res.data);
      setCustomerMail(res.data);
    } catch (error) {
      console.log("customer search api error", error);
    }
  };

  return { customerMail, fetchCustomerEmail };
};

export default useFetchCustomerEmail;
