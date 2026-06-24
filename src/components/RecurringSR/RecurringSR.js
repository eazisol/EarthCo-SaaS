import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import "datatables.net";
import Cookies from "js-cookie";
import useFetchServiceRequests from "../Hooks/useFetchServiceRequests";
import { DataContext } from "../../context/AppData";
import TitleBar from "../TitleBar";
import ServiceRequestTR from "../ServiceRequest/ServiceRequestTR";
import StatusCards from "../ServiceRequest/StatusCards";
import RecurringSrTR from "./RecurringSrTR";

const RecurringSR = ({ customerId }) => {
  const {
    isLoading,
    fetchServiceRequest,
    totalRecords,
    fetchFilterServiceRequest,
    sRFilterList,
    serviceRequest,
    sRfetchError,
  } = useFetchServiceRequests();
const icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888888"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <path d="M16 2v4M8 2v4M2 10h20M10 14h4M9 18h6" />
  </svg>
);

  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const userdata = Cookies.get("userData");
  const [showCards, setShowCards] = useState(true);

  const [open, setOpen] = useState(0);
  const [closed, setClosed] = useState(0);
  const { statusId, setStatusId } = useContext(DataContext);

  useEffect(() => {
    const pendingEstimates = serviceRequest.filter(
      (estimate) => estimate.Status === "Open"
    );
    const pendingClosed = serviceRequest.filter(
      (estimate) => estimate.Status === "Closed"
    );

    setOpen(pendingEstimates.length);
    setClosed(pendingClosed.length);
  }, [serviceRequest]);

  useEffect(() => {
    return () => {
      setStatusId(0);
    };
  }, []);

  return (
    <>
      {!customerId && <TitleBar icon={icon} title="Recurring SR" />}
      <div className={customerId ? "" : "container-fluid pt-3"}>
        {/* <div className="row " style={{ height: customerId ? "0em" : "9em" }}>
          {!customerId && showCards && (
            <StatusCards
              setStatusId={setStatusId}
              statusId={statusId}
              totalRecords
              newData={1178}
              open={totalRecords.totalOpenRecords}
              closed={totalRecords.totalClosedRecords}
              total={78178}
            />
          )}
        </div> */}

        <div>
          <RecurringSrTR
            customerId={customerId}
            sRfetchError={sRfetchError}
            headers={headers}
            serviceRequest={serviceRequest}
            setShowCards={setShowCards}
            statusId={statusId}
            fetchFilterServiceRequest={fetchFilterServiceRequest}
            sRFilterList={sRFilterList}
            totalRecords={totalRecords}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default RecurringSR;
