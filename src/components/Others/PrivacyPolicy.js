import React, { useEffect, useState } from "react";
import logo1 from "../../assets/images/background/earthco_logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PrivacyPolicy = () => {
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
                      <div className="row">
                        <div
                          className="col-md-1 col-sm-1 mt-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            //   setShowPrivacyPolicy(false);
                            window.close();
                          }}
                        >
                          <ArrowBackIcon />
                        </div>
                        <div className="col-md-11 col-sm-11">
                          <h2>Privacy Policy</h2>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4>Introduction</h4>
                      <li>
                        Earthco Landscape ("we," "us," or "our") operates
                        Earthco Web Application ("Application"). This Privacy
                        Policy outlines the types of information collected from
                        users of the Application and how we use, disclose, and
                        protect that information.
                      </li>
                      <h5 className="mb-0">Information We Collect</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Personal Information:</strong> When you use
                          the Application, we may collect certain personally
                          identifiable information, such as names, email
                          addresses, or other contact information voluntarily
                          provided by users.
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Usage Data: </strong>: We may collect
                          information on how the Application is accessed and
                          used ("Usage Data"). This Usage Data may include
                          information such as your computer's Internet Protocol
                          address, browser type, browser version, pages visited,
                          time and date of your visit, and other diagnostic
                          data.
                        </div>
                      </div>

                      <h5 className="mb-0">Use of Information</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          We may use the collected information for various
                          purposes, including but not limited to providing and
                          maintaining the Application, improving user
                          experience, sending updates or notifications, and
                          analyzing usage trends.
                        </div>
                      </div>
                      <h5 className="mb-0">Data Security</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          EarthCo takes reasonable measures to secure and
                          protect the information collected. However, no method
                          of transmission over the internet or electronic
                          storage is completely secure. We cannot guarantee
                          absolute security of your data.
                        </div>
                      </div>

                      <h5 className="mb-0">Disclosure of Information</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          We do not disclose or share personal information
                          except in cases required by law or to protect our
                          rights or property.
                        </div>
                      </div>

                      <h5 className="mb-0">Changes to This Privacy Policy</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          We reserve the right to update or change our Privacy
                          Policy at any time. Your continued use of the
                          Application after we post any modifications to the
                          Privacy Policy on this page will constitute your
                          acknowledgment of the modifications and your consent
                          to abide and be bound by the updated Privacy Policy.
                        </div>
                      </div>

                      <h5 className="mb-0">Contact Us</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          If you have any questions about this Privacy Policy,
                          please contact us at [Contact Information]
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

export default PrivacyPolicy;
