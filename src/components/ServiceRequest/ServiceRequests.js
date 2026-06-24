import React, { useContext } from "react";
import ServiceRequestTR from "./ServiceRequestTR";
import { useEffect, useState } from "react";
import StatusCards from "./StatusCards";
import { Form } from "react-bootstrap";
import "datatables.net";
import Cookies from "js-cookie";
import useFetchServiceRequests from "../Hooks/useFetchServiceRequests";
import { DataContext } from "../../context/AppData";
import TitleBar from "../TitleBar";

const ServiceRequests = ({customerId}) => {
  const {
    isLoading,
    fetchServiceRequest,
    totalRecords,
    fetchFilterServiceRequest,
    sRFilterList,
    serviceRequest,
    sRfetchError,
  } = useFetchServiceRequests();
  const icon = <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.64111 13.5497L9.38482 9.9837L12.5145 12.4421L15.1995 8.97684" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
  <ellipse cx="18.3291" cy="3.85021" rx="1.76201" ry="1.76201" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M13.6808 2.86012H7.01867C4.25818 2.86012 2.54651 4.81512 2.54651 7.57561V14.9845C2.54651 17.7449 4.22462 19.6915 7.01867 19.6915H14.9058C17.6663 19.6915 19.3779 17.7449 19.3779 14.9845V8.53213" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
</svg>
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
    {!customerId && <TitleBar icon={icon} title='Service Requests' />}
      <div className={customerId ?"" : "container-fluid pt-3"}>
        <div className="row " style={{height : customerId ?"0em":"9em"}}>
          {!customerId &&showCards && (
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
        </div>

        <div>
          <ServiceRequestTR
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

export default ServiceRequests;
