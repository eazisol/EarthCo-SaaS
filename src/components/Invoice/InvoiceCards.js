import React from "react";

const InvoiceCards = () => {
  return (
    <>
      <div className="col-lg-2 ">
        <div className="widget-stat card">
          <div className="card-body ">
            <div className="media ai-icon smaller-widget">
              <span className=" bgl-primary text-primary smaller-widget">
                <i className="la la-edit smaller-widget"></i>
              </span>
              <div className="media-body">
                <p className="mb-1 ">Draft</p>
                <h4 className="mb-0 smaller-widget">0</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-2 ">
        <div className="widget-stat card">
          <div className="card-body ">
            <div className="media ai-icon smaller-widget">
              <span className=" bgl-warning text-warning smaller-widget">
                <i className="la la-send smaller-widget"></i>
              </span>
              <div className="media-body">
                <p className="mb-1">Sent</p>
                <h4 className="mb-0 smaller-widget">0</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-2  ">
        <div className="widget-stat card">
          <div className="card-body   ">
            <div className="media ai-icon smaller-widget">
              <span className=" bgl-danger text-danger smaller-widget">
                <i className="la la-stack-overflow "></i>
              </span>
              <div className="media-body">
                <p className="mb-1 ">Overdue</p>
                <h4 className="mb-0 smaller-widget">0</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-2  ">
        <div className="widget-stat card">
          <div className="card-body  ">
            <div className="media ai-icon smaller-widget">
              <span className=" bgl-success text-success smaller-widget">
                <i className="la la-thumbs-up"></i>
              </span>
              <div className="media-body">
                <p className="mb-1 ">Paid</p>
                <h4 className="mb-0 smaller-widget">0</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-2  ">
        <div className="widget-stat card">
          <div className="card-body  ">
            <div className="media ai-icon smaller-widget">
              <span className=" bgl-secondary text-secondary smaller-widget">
                <i className="la la-dollar-sign"></i>
              </span>
              <div className="media-body">
                <p className="mb-1">Total</p>
                <h4 className="mb-0 smaller-widget">0</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceCards;
