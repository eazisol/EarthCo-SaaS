import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useSendEmail = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [emailAlertTxt, setEmailAlertTxt] = useState("");
  const [emailAlertColor, setEmailAlertColor] = useState("");

  const sendEmail = async (Link, CustomerId, ContactId, isVendor) => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/Email/SendEmail?Link="https://earth-co.vercel.app${Link}"&UserId=${CustomerId}&ContactId=${ContactId}&isVendor=${isVendor}`,
        { headers }
      );
      setEmailAlertTxt(res.data);
      setShowEmailAlert(true);
      setEmailAlertColor("success");

      console.log("Email response is", res.data);
    } catch (error) {
      // setLoading(false);
      // setError(error.message);
      setShowEmailAlert(true);
      setEmailAlertColor("error");
      setEmailAlertTxt(error.response.data);
      console.log("api call error", error);
    }
  };

  return {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  };
};

export default useSendEmail;
