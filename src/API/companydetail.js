import axios from "axios";

export const getCompanySubdomain = () => {
  if (typeof window === "undefined") {
    return "eazisolscompany";
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost";
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

  if (!hostname || isLocalhost || isIpAddress) {
    return "eazisolscompany";
  }

  return hostname.split(".")[0];
};

export const companyDetail = async (domain) => {
  const response = await axios.get(`https://admin.earthcoapp.com/admin/api/Settings/GetSettingFromSubDomain?SubDomain=${domain}`);
  return response;
};






