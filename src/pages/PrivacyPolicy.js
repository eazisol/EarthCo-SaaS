import React, { useEffect, useState } from "react";
import logo1 from "../assets/images/background/earthco_logo.png";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { companyDetail, getCompanySubdomain, STATIC_SUBDOMAIN } from "../API/companydetail";
import { setPrimaryColor } from "../custom/theme";
import { CircularProgress } from "@mui/material";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [companyLogoPath, setCompanyLogoPath] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getCompanyDetail = async () => {
      setLoading(true);
      const subdomain = getCompanySubdomain();
      const response = await companyDetail(STATIC_SUBDOMAIN);
      if (response?.data?.PrimeryColor) {
        setPrimaryColor(response?.data?.PrimeryColor,response?.data?.SecondaryColor)
      }
      let companyTermAndPrivacy = {
        CompanyLogoPath: response?.data?.CompanyLogoPath,
        PrivacyPolicy: response?.data?.PrivacyPolicy,
        TermsAndCondition: response?.data?.TermsAndCondition

      }
      setCompanyLogoPath(companyTermAndPrivacy)
      setLoading(false);
    }
    getCompanyDetail();
  }, []);
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
            paddingTop: "40px",
            paddingBottom: "40px",
          }}
        >
          <div className="login-form style-2" style={{ maxWidth: "500px" }}>
            <div className="card-body">
              <div className="logo-header">
                <img
                  src={companyLogoPath ? `https://admin.earthcoapp.com${companyLogoPath?.CompanyLogoPath}` : logo1}
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
                            // window.close();
                            navigate(`/`);
                          }}
                        >
                          <ArrowBackIcon />
                        </div>
                        <div className="col-md-11 col-sm-11">
                          <h2>Privacy Policy</h2>
                        </div>
                      </div>
                    </div>
                    {loading ? <div className="card-body" style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CircularProgress />
                    </div> : <div
                      dangerouslySetInnerHTML={{ __html: companyLogoPath?.PrivacyPolicy }}
                    />}
                    {/* <div>
                      <h4>Introduction</h4>
                      <li>
                        Welcome to Earthco. This privacy policy outlines how we
                        collect, use, disclose, and protect your information
                        within our mobile application, Earthco. This app is
                        intended for internal use by employees of Earthco
                        Commercial Landscape only. There are no subscriptions,
                        payments, or public access to the app.
                      </li>
                      <h5>Information We Collect</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Personal Information:</strong> Username and
                          password for login purposes.
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Location Data: </strong> The app uses Google
                          Maps to allow users to add markers and drop pins on
                          service locations. This data is used solely for
                          operational purposes within Earthco.
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Financial and Business Data: </strong> Data
                          related to invoices, estimates, purchase orders,
                          bills, customers, vendors, and items.
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Usage Data: </strong> Information about your
                          interactions with the app, such as features used and
                          actions taken.
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>
                            Data Synchronization with QuickBooks:{" "}
                          </strong>{" "}
                          We use APIs to sync data between Earthco and
                          QuickBooks. This synchronization allows us to
                          efficiently manage financial transactions and business
                          records. All data exchanged with QuickBooks is handled
                          securely and used only for internal purposes.
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Google Maps Usage: </strong> Our app
                          integrates Google Maps to enhance functionality for
                          managing service locations. Google Maps may collect
                          and process certain information, including location
                          data, as outlined in Google’s Privacy Policy. By using
                          our app, you agree to Google’s terms of service and
                          privacy policy.
                        </div>
                      </div>

                      <h5 className="mb-0">Data Security</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          We implement industry-standard security measures to
                          protect your personal information. Access to the app
                          is restricted to authorized users only.
                        </div>
                      </div>
                      <h5>Data Sharing and Disclosure</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          We do not share your personal information with third
                          parties, except as necessary to comply with legal
                          obligations or protect our rights. Data synchronized
                          with QuickBooks is shared only within the organization
                          and is not disclosed externally.
                        </div>
                      </div>

                      <h5>How We Use Your Information</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          To provide and maintain the app.
                        </div>
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          To manage service requests, estimates, purchase
                          orders, bills, and track progress.
                        </div>
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          To review and update service locations via Google
                          Maps.
                        </div>
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          o sync data with QuickBooks, including invoices,
                          estimates, purchase orders, bills, customers, vendors,
                          and items, for accurate financial and business
                          management.
                        </div>
                      </div>

                      <h5 className="mb-0">Contact Information</h5>
                      <p>
                        For any questions or concerns ,
                        please contact us at:
                      </p>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Admin Email:</strong>{" "}
                          <a href="mailto:admin@earthcompany.org">
                            {" "}
                            admin@earthcompany.org
                          </a>
                        </div>
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Address:</strong> 1225 E Wakeham Ave, Santa
                          Ana, CA 92705, United States
                        </div>
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Phone:</strong> +1 714-571-0455
                        </div>
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          <strong>Website:</strong>{" "}
                          <a href="earthcolandscape.com">
                            {" "}
                            Earthco Commercial Landscape
                          </a>
                        </div>
                      </div>
                      <h5>Changes to This Privacy Policy</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          We may update this privacy policy from time to time.
                          Any changes will be posted within the app, and the
                          date of the latest revision will be indicated.
                        </div>
                      </div>
                      <h5>Acceptance of This Policy</h5>
                      <div className="row">
                        <div className="col-md-1 text-end">&#9679;</div>
                        <div className="col-md-11">
                          By using the Earthco app, you signify your acceptance
                          of this privacy policy. If you do not agree with this
                          policy, please do not use our app.
                        </div>
                      </div>
                    </div> */}
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
