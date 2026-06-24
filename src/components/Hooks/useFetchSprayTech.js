import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useFetchSprayTech = () => {
    const token = Cookies.get("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };


    const [sprayTechData, setSprayTechData] = useState([])

    const fetchSprayTech = async (id) => {
       
        try {
          const res = await axios.get(
            `${baseUrl}/api/ServiceRequest/GetServiceRequestAprayTechItems`,
            { headers }
          );
          console.log("spray tech data", res.data);
          setSprayTechData(res.data);
        } catch (error) {
          console.log(" spray api error", error);
        }
      };



  return {sprayTechData, fetchSprayTech}
}

export default useFetchSprayTech