import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../apiConfig";

export const getRolePermission = async (id) => {
  const token = Cookies.get("token");
  try {
    
    const data = await axios.get(`${baseUrl}/api/Staff/RolesPermission?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    return error;
  }
};

