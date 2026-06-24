import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

import axios from "axios";
import LandscapeTR from "./LandscapeTR";
import StatusCards from "./StatusCards";

const Landscapelist = () => {
  const navigate = useNavigate();
  const [statusId, setStatusId] = useState(0);
  const [records, setRecords] = useState({});
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <StatusCards
            setStatusId={setStatusId}
            statusId={statusId}
            records={records}
          />
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body">
                <LandscapeTR setRecords={setRecords} statusId={statusId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landscapelist;
