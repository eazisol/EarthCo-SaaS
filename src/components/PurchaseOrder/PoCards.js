import React from "react";
import OpenWithIcon from '@mui/icons-material/PendingActions';
import TaskIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
const PoCards = ({ closed, open, statusId, setStatusId }) => {
  return (
    <>
      <div className="col-xl-3  col-lg-6 col-sm-6">
        <div className="widget-stat card">
          <div
            className={
              statusId === 1 ? "card-body selected-Card " : "card-body "
            }
            style={{ cursor: "pointer" }}
            onClick={() => {
              setStatusId(1);
            }}
          >
            <div className="media ai-icon">
              <span className="me-3 bgl-warning text-warning">
              <OpenWithIcon fontSize="large" />
              </span>
              <div className="media-body">
                <p className="mb-1">Open</p>
                <h4 className="mb-0">{open}</h4>
              </div>
            </div>
          </div>
        </div>{" "}
      </div>

      {/* <div className="col-xl-3  col-lg-6 col-sm-6">
        <div className="widget-stat card">
          <div
            className={
              statusId === 3 ? "card-body selected-Card " : "card-body "
            }
            style={{ cursor: "pointer" }}
            // onClick={() => {
            //   setStatusId(1);
            // }}
          >
            <div className="media ai-icon">
              <span className="me-3 bgl-warning text-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-file-text"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <div className="media-body">
                <p className="mb-1">Open Approved</p>
                <h4 className="mb-0">{open}</h4>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="col-xl-3  col-lg-6 col-sm-6">
        <div className="widget-stat card">
          <div
            className={
              statusId === 2 ? "card-body selected-Card " : "card-body "
            }
            style={{ cursor: "pointer" }}
            onClick={() => {
              setStatusId(2);
            }}
          >
            <div className="media ai-icon">
              <span className="me-3 bgl-primary text-primary">
              <TaskIcon fontSize="large" />
              </span>
              <div className="media-body">
                <p className="mb-1">Closed Billed</p>
                <h4 className="mb-0">{closed}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoCards;
