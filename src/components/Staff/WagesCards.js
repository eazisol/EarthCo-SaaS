import React, { useEffect, useState } from "react";
import OpenWithIcon from '@mui/icons-material/PendingActions';
import TaskIcon from '@mui/icons-material/EngineeringOutlined';
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
const WagesCards = ({total, Hours}) => {
  return (
    <div className="col-xl-12  col-lg-12 col-sm-12 mt-3">
        <div className="widget-stat card">
          <div
            className={
           "card-body "
            }
            style={{ cursor: "pointer" }}
            onClick={() => {
              
            }}
          >
            <div className="media ai-icon">
              <span className="me-3 bgl-info text-info">
                
                <AttachMoneyOutlinedIcon fontSize="large" />
              </span>
              <div className="media-body">
                <div className="row">
                  <div className="col-md-4 col-sm-4">
                <p className="mb-1">Hours</p>
                    
                    <h5 className="mb-0">{Hours}</h5>
                    
                  </div>
                  <div className="col-md-8 col-sm-8 text-end">
                  <p className="mb-1 me-3">Total</p>
                    
                    <h5 className="mb-0">${total}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default WagesCards