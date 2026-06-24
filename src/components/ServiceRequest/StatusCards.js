import React from "react";
import OpenWithIcon from '@mui/icons-material/PendingActions';
import TaskIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
const StatusCards = ({
  setStatusId,
  statusId,
  newData,
  open,
  closed,
  total,
}) => {
  return (
    <>
  

      <div className="col-xl-3  col-lg-6 col-sm-6 "  >
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
                {/* <span className="badge badge-warning">30%</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-3  col-lg-6 col-sm-6 ">
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
                <p className="mb-1">Closed</p>
                <h4 className="mb-0">{closed}</h4>
                {/* <span className="badge badge-danger">55%</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default StatusCards;
