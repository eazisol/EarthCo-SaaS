import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";

const useGetApi = () => {
    const headers = {
        Authorization: `Bearer ${Cookies.get("token")}`,
      };
      const [data, setData] = useState([]);
      const [isloading, setIsloading] = useState(true);
    
      const getData = async (
        endPoint,
        success = () => {},
        errorFun = () => {}
      ) => {
        // setIsloading(true)
        try {
          const response = await axios.get(`${baseUrl}/api${endPoint}`, {
            headers,
          });
          setData(response.data);
          setIsloading(false);
            success(response.data);
         

          console.log("response getListData", response.data);
        } catch (error) {
          console.error("Error fetching list data:", error);
          setIsloading(false);
          errorFun(error);
        }
      };
      return { getData, data, isloading, };
}

export default useGetApi