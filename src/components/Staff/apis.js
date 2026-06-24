import axios from "axios";
import { baseUrl } from "../../apiConfig";
import Cookies from "js-cookie";
const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
  };
export const AddMisc=async(data)=>{
    const response=await axios.post(`${baseUrl}/api/Dashboard/AddMisc`,data,{headers});
    return response.data;
}

export const AddNotes=async(data)=>{
    const response=await axios.post(`${baseUrl}/api/Dashboard/AddMisc`,data,{headers});
    return response.data;
}

