import React, { useEffect, useState } from "react";
import logo1 from "../../assets/images/background/earthco_logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TermsandConditions = () => {
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
                                  //   navigate(`/`);
                                  window.close();
                                }}
                              >
                                <ArrowBackIcon />
                              </div>
                              <div className="col-md-11 col-sm-11">
                                <h2>End User License Agreement</h2>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h6>
                              IMPORTANT: READ CAREFULLY BEFORE USING THE
                              APPLICATION
                            </h6>
                            <>
                              This End User License Agreement ("Agreement") is a
                              legal agreement between you (either an individual
                              or an entity) and Earthco Landscape governing your
                              use of Earthco Web Application ("Application"). By
                              accessing or using this Application, you agree to
                              be bound by the terms and conditions of this
                              Agreement.
                            </>
                            <div className="row mt-2">
                              <div className="col-md-1 text-end">1.</div>
                              <div className="col-md-11">
                                {" "}
                                <strong>License Grant: </strong>Earthco grants
                                you a non-exclusive, non-transferable, limited
                                license to use the Application solely for
                                internal purposes in accordance with this
                                Agreement.{" "}
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-1 text-end">2.</div>
                              <div className="col-md-11">
                                {" "}
                                <strong>Restrictions: </strong>You shall not (a)
                                sublicense, sell, rent, lease, or distribute the
                                Application; (b) modify, adapt, translate,
                                reverse engineer, decompile, or disassemble the
                                Application; (c) remove any copyright,
                                trademark, or other proprietary rights notices
                                contained in or on the Application; (d) use the
                                Application in any unlawful manner or for any
                                illegal purpose; (e) use the Application to
                                infringe upon any third-party rights; (f) use
                                the Application to transmit viruses or any
                                harmful code that may damage the Application or
                                third-party systems.
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-1 text-end">3.</div>
                              <div className="col-md-11">
                                {" "}
                                <strong>Intellectual Property: </strong>
                                Earthco retains all rights, title, and interest
                                in and to the Application, including all
                                intellectual property rights. This Agreement
                                does not grant you any rights to patents,
                                copyrights, trade secrets, trademarks, or any
                                other rights in respect to the Application.
                              </div>
                            </div>{" "}
                            <div className="row">
                              <div className="col-md-1 text-end">4.</div>
                              <div className="col-md-11">
                                {" "}
                                <strong>Termination: </strong>This Agreement is
                                effective until terminated. Earthco may
                                terminate this Agreement at any time without
                                notice if you fail to comply with any term of
                                this Agreement. Upon termination, you must cease
                                all use of the Application and destroy all
                                copies of the Application in your possession or
                                control.
                              </div>
                            </div>{" "}
                            <div className="row">
                              <div className="col-md-1 text-end">5.</div>
                              <div className="col-md-11">
                                {" "}
                                <strong>Disclaimer of Warranty: </strong>The
                                Application is provided "as is" without any
                                warranty, express or implied. Earthco disclaims
                                all warranties and conditions with regard to the
                                Application, including but not limited to,
                                fitness for a particular purpose,
                                merchantability, non-infringement, or accuracy.
                              </div>
                            </div>{" "}
                            <div className="row">
                              <div className="col-md-1 text-end">6.</div>
                              <div className="col-md-11">
                                {" "}
                                <strong>Limitation of Liability: </strong>no
                                event shall Earthco be liable for any direct,
                                indirect, incidental, special, consequential, or
                                punitive damages arising out of or in any way
                                connected with the use or inability to use the
                                Application.
                              </div>
                            </div>{" "}
                            <div className="row">
                              <div className="col-md-1 text-end">7.</div>
                              <div className="col-md-11">
                                {" "}
                                <strong>Governing Law: </strong>This Agreement
                                shall be governed by and construed in accordance
                                with the laws of California, without regard to
                                its conflict of law principles.
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

export default TermsandConditions;
