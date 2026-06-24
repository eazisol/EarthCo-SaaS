import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { companyDetail, getCompanySubdomain, STATIC_SUBDOMAIN } from "../API/companydetail";
import {
  applyCachedCompanyBranding,
  applyCompanyBranding,
  getCachedCompanyLogoPath,
  getCompanyLogoUrl,
} from "../custom/companyBranding";
import { CircularProgress } from "@mui/material";

const TermsandConditions = () => {
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(() => {
    const logoPath = getCachedCompanyLogoPath();
    return logoPath ? { CompanyLogoPath: logoPath } : null;
  });
  const [loading, setLoading] = useState(() => !getCachedCompanyLogoPath());

  useEffect(() => {
    applyCachedCompanyBranding();

    const getCompanyDetail = async () => {
      const hasCache = !!getCachedCompanyLogoPath();
      if (!hasCache) {
        setLoading(true);
      }
      const subdomain = getCompanySubdomain();
      const response = await companyDetail(STATIC_SUBDOMAIN);
      applyCompanyBranding(response?.data);
      setCompanyData({
        CompanyLogoPath: response?.data?.CompanyLogoPath,
        PrivacyPolicy: response?.data?.PrivacyPolicy,
        TermsAndCondition: response?.data?.TermsAndCondition,
      });
      setLoading(false);
    };
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
            {loading ? (
              <div
                className="card-body"
                style={{
                  height: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              <div className="card-body">
                <div className="logo-header">
                  <img
                    src={getCompanyLogoUrl(companyData?.CompanyLogoPath)}
                    alt=""
                    className="width-230 light-logo"
                    style={{ width: "35%", marginLeft: "30%" }}
                  />
                </div>

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
                                }}
                              >
                                <ArrowBackIcon />
                              </div>
                              <div className="col-md-11 col-sm-11">
                                <h3>End User License Agreement (EULA)</h3>
                              </div>
                            </div>
                          </div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: companyData?.TermsAndCondition,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsandConditions;
