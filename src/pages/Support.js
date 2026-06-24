import React, { useEffect, useState } from "react";
import logo1 from "../assets/images/background/earthco_logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wraper">
      <div className="browse-job login-style3">
        <div
          className="bg-white row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <div className="login-form style-2" style={{ maxWidth: "500px" }}>
            <div className="card-body">
              <div className="logo-header">
                <img
                  src={logo1}
                  alt=""
                  className="width-230 light-logo"
                  style={{ width: "35%", marginLeft: "30%" }}
                />
                <img
                  src={logo1}
                  alt=""
                  className="width-230 dark-logo"
                  style={{ width: "35%", marginLeft: "30%" }}
                />
              </div>

              <div>
                <div>
                  <div>
                    <div>
                      <div>
                        <div>
                          <div>
                            <div className="row">
                              <div
                                className="col-md-1 col-sm-1 mt-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  navigate(`/`);
                                  // window.close();
                                }}
                              >
                                <ArrowBackIcon />
                              </div>
                              <div className="col-md-11 col-sm-11">
                                <h3>Support</h3>
                                <h6>
                                  For support related to our website or mobile
                                  app, please write us an email 
                                  <a href="mailto:admin@earthcompany.org">
                                     {" "}admin@earthcompany.org
                                  </a>
                                  .
                                </h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
