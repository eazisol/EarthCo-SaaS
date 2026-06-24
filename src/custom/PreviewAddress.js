import { useContext, useEffect, useState } from "react";
import { DataContext } from "../context/AppData";
import { Text } from "@react-pdf/renderer";
import s from "../components/CommonComponents/PdfStyles";
import axios from "axios";
import { baseUrl } from "../apiConfig";
import Cookies from "js-cookie";
export const PreviewAddress = ({ website, email, invoice}) => {
  const { loggedInUser } = useContext(DataContext);
   const [companyInfo, setCompanyInfo] = useState({});
  const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };
  const address = companyInfo?.Address || "";
  const words = address.split(" ");

  let firstLine = address;
  let secondLine = "";
    if (words.length > 4) {
      firstLine = words.slice(0, 4).join(" "); // "130 W. Central Ave."
      secondLine = words.slice(4).join(" "); // "Santa Ana CA 92707"
    }

  const phone = companyInfo?.PhoneNo || "";
  const fax = companyInfo?.SecondPhoneNo || "";
 useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${baseUrl}/api/Staff/GetCompany?CompanyId=${loggedInUser?.CompanyId}`,
          { headers }
        );
    

        setCompanyInfo(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
      }
    };

    fetchUser();
  }, []);
  return (
    <div>
      <h6 className="mb-0"> {companyInfo?.DsiplayName} </h6>
      <h6 className="mb-0">{firstLine}</h6>
      <h6 className="mb-0">{secondLine}</h6>
    {companyInfo?.DsiplayName&&  <h6 className="mb-0"> {`O ${phone} F ${fax}`} </h6>} 
      <h6 className="mb-0"> {website && companyInfo?.Website} </h6>
      <h6 className="mb-0"> {email && companyInfo.Email} </h6>
    </div>
  );
};

export const PdfAddress = ({ companyInfo, website, license, email }) => {
  const address = companyInfo?.Address || "";
  const words = address.split(" ");

  let firstLine = address;
  let secondLine = "";

  if (words.length > 4) {
    firstLine = words.slice(0, 4).join(" "); // "130 W. Central Ave."
    secondLine = words.slice(4).join(" "); // "Santa Ana CA 92707"
  }

  return (
    <>
      <Text style={s.text}>{companyInfo?.DsiplayName}</Text>
      <Text style={[s.text]}>{firstLine}</Text>
      <Text style={[s.text]}>{secondLine}</Text>
      <Text
        style={s.text}
      >{`O ${companyInfo?.PhoneNo} F ${companyInfo?.SecondPhoneNo}`}</Text>
      {website && <Text style={s.text}>{companyInfo?.Website}</Text>}
      {email && <Text style={s.text}>{companyInfo?.Email}</Text>}
      {license && <Text style={s.text}>CL# C27 823185 / D49 1025053</Text>}
    </>
  );
};


