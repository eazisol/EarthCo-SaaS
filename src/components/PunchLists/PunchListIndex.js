import React, { useContext, useEffect, useState } from "react";
import TitleBar from "../TitleBar";
import { NavLink } from "react-router-dom";
import { Form } from "react-bootstrap";
import PunchTR from "./PunchTR";
import { baseUrl } from "../../apiConfig";

import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Cookies from "js-cookie";
import useFetchCustomers from "../Hooks/useFetchCustomers";
import useFetchServiceLocations from "../Hooks/useFetchServiceLocations";
import useFetchPunchList from "../Hooks/useFetchPunchList";
import { FormControl, Select, MenuItem } from "@mui/material";
import PunchListCards from "./PunchListCards";
import PunchListModal1 from "./PunchListModal1";
import PunchlistModal2 from "./PunchlistModal2";
import { DataContext } from "../../context/AppData";

const PunchListIndex = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const {
    punchData,
    setPunchData,
    isLoading,
    totalRecords,
    fetchFilterdPunchList,
  } = useFetchPunchList();


  const [selectedPL, setselectedPL] = useState(0);
  const [plDetailId, setPlDetailId] = useState(0);

  const [addPunchListData, setAddPunchListData] = useState({
    Title: "",
    ContactName: "",
    ContactCompany: "",
    ContactEmail: "",
    AssignedTo: "",
    CustomerId: null,
  });
  const { statusId, setStatusId } = useContext(DataContext);





  const icon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.634 13.4211C18.634 16.7009 16.7007 18.6342 13.4209 18.6342H6.28738C2.99929 18.6342 1.06238 16.7009 1.06238 13.4211V6.27109C1.06238 2.99584 2.26688 1.06259 5.54763 1.06259H7.38096C8.03913 1.06351 8.65879 1.37242 9.05296 1.89951L9.88988 3.01234C10.2859 3.53851 10.9055 3.84834 11.5637 3.84926H14.1579C17.446 3.84926 18.6596 5.52309 18.6596 8.86984L18.634 13.4211Z"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M5.85754 12.2577H13.8646"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );


  return (
    <>
      <TitleBar icon={icon} title="Punchlists" />
      <div className="container-fluid pt-3">
        <div className="row" style={{height : "9em"}}>
          <PunchListCards
            setStatusId={setStatusId}
            statusId={statusId}
            totalRecords={totalRecords}
          /></div>
         
            <div className="col-xl-12">
              <div className="card">
                <PunchTR
                  punchData={punchData}
                  setPunchData={setPunchData}
                  fetchFilterdPunchList={fetchFilterdPunchList}
                  statusId={statusId}
                  totalRecords={totalRecords}
                  setselectedPL={setselectedPL}
                  setPlDetailId={setPlDetailId}
                  setAddPunchListData={setAddPunchListData}
                  isLoading={isLoading}
                />
              </div>
            </div>
         
        

        {/* modal */}

        <PunchListModal1
          plDetailId={plDetailId}
          selectedPL={selectedPL}
          fetchFilterdPunchList={fetchFilterdPunchList}
        />
        {/* modal2 */}
        <PunchlistModal2
          headers={headers}
          fetchFilterdPunchList={fetchFilterdPunchList}
          setselectedPL={setselectedPL}
          selectedPL={selectedPL}
          setAddPunchListData={setAddPunchListData}
          addPunchListData={addPunchListData}
        />
      </div>
    </>
  );
};

export default PunchListIndex;
