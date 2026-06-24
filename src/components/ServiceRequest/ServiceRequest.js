import React, { useContext } from "react";
import TitleBar from "../TitleBar";
import { RoutingContext } from "../../context/RoutesContext";
import { Form } from "react-bootstrap";
import AddSRform from "./AddSRform";

const ServiceRequest = () => {
  const { SRroute } = useContext(RoutingContext);

  const icon = (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.64111 13.5497L9.38482 9.9837L12.5145 12.4421L15.1995 8.97684"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="18.3291"
        cy="3.85021"
        rx="1.76201"
        ry="1.76201"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6808 2.86012H7.01867C4.25818 2.86012 2.54651 4.81512 2.54651 7.57561V14.9845C2.54651 17.7449 4.22462 19.6915 7.01867 19.6915H14.9058C17.6663 19.6915 19.3779 17.7449 19.3779 14.9845V8.53213"
        stroke="#888888"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <TitleBar icon={icon} title={SRroute} />
      <div className="card-body">
        <div className="basic-form">
          <form>
            <div className="row">
              <div className="mb-3 col-md-4">
                <label className="form-label">Customer</label>
                <Form.Select
                  aria-label="Default select example"
                  className="bg-white"
                  size="md"
                >
                  <option>Select Custmer...</option>
                  <option>Hillandale Ave</option>
                  <option>Crest DeVille</option>
                </Form.Select>               
              </div>
              <div className="mb-3 col-md-4">
                <label className="form-label">Service Location</label>
                <Form.Select
                  aria-label="Default select example"
                  className="bg-white"
                  size="md"
                >
                  <option>Select Service Location...</option>
                  <option>Keystone Pacific</option>
                  <option>Brian Jacobs</option>
                </Form.Select>
                
              </div>
              <div className="mb-3 col-md-4">
                <label>Contact</label>
                <Form.Select
                  aria-label="Default select example"
                  className="bg-white"
                  size="md"
                >
                  <option>Select Contact...</option>
                  <option>mark334@gmail.com</option>
                  <option>Jchavis@keystonepacific.com</option>
                </Form.Select>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="container-fluid">
        <div className="card">
          <div className="card-body ">
            <AddSRform />
            <div className="mb-2 row text-end">
              <div>
                <button type="button" className="btn btn-primary me-1">
                  Submit
                </button>
                <button className="btn btn-danger light ms-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceRequest;
