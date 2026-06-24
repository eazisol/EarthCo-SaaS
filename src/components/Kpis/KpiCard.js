import React from 'react'
import formatAmount from '../../custom/FormatAmount'

const KpiCard = ({title, amount=0, icon, color, isString=false}) => {
  return (
    <div className="col-md-3">
      <div className="widget-stat card ">
        <div
          className={"card-body ps-2 pe-1 cursor-pointer"
          }
          onClick={() => {
          }}
        >
            <div className="media ai-icon mb-2">
              <span
                style={{
                  minWidth: "4.3rem",
                  height: "4.3rem",
                  width: "4.3rem",
                }}
                className={`me-1 bgl-${color} text-${color}`}
              >
              {/* <i className="ti-user"></i>  */}
              {icon}
               
            </span>
            <div className="media-body">
                <div className='d-flex align-items-center' style={{height : "4em"}}>
              <p >{title}</p></div>
              <div className="row">
                <div className="col-md-12 col-sm-12">
                  <h4 className="mb-0 ms-2">{isString? amount:formatAmount(amount)}</h4>
                  {/* <span className="badge badge-primary">15%</span> */}
                </div>
                {/* <div className="col-md-12 col-sm-12  text-end">
                  <p style={{ color: "black", marginRight: "8px" }}>
                    ${formatAmount(amount)}
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KpiCard