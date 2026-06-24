import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import formatDate from "../../custom/FormatDate";
import { CircularProgress } from "@mui/material";
import { Print, Email, Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo/earthco_logo.png";
import { DataContext } from "../../context/AppData";
import html2pdf from "html2pdf.js";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AuditPdf from "./AuditPdf";
import { baseUrl, logoUrl } from "../../apiConfig";
import Authorization from "../Reusable/Authorization";

const Audit = () => {
  const token = Cookies.get("token");
  const userData = Cookies.get("userData");

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const navigate = useNavigate();

  const { toggleFullscreen, setToggleFullscreen,setselectedPdf ,dynamicColorAndLogo} = useContext(DataContext);

  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const customerParam = Number(queryParams.get("CustomerId"));
  const isMail = queryParams.get("isMail");
  const URLToken = queryParams.get("URLToken");

  const [showbuttons, setShowButtons] = useState(true);

  const [irrDetails, setIrrDetails] = useState({});
  const { customerMail, fetchCustomerEmail } = useFetchCustomerEmail();

  const fetchIrrigation = async () => {
    if (idParam === 0) {
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/Irrigation/GetIrrigation?id=${idParam}&CustomerId=${customerParam}`,
        { headers }
      );
      console.log("selected irrigation is", res.data);
      setIrrDetails(res.data);
      fetchCustomerEmail(res.data.IrrigationData.CustomerId);
      // fetchName(res.data.IrrigationData.CustomerId);
    } catch (error) {
      console.log("fetch irrigation api call error", error);
    }
  };

  useEffect(() => {
    if (URLToken) {
      Cookies.set("token", URLToken, { expires: 30 });
      setShowButtons(false);
    }
    fetchIrrigation();
    // console.log("user data izzz", JSON.parse(userData));
  }, []);

  const handlePrint = () => {
    setToggleFullscreen(false);
    setTimeout(() => {
      window.print();
    }, 1000);
    setTimeout(() => {
      setToggleFullscreen(true);
    }, 3000);
  };

  const [pdfClicked, setPdfClicked] = useState(false);

  const pdfDownload = () => {
    setPdfClicked(true);
    setTimeout(() => {
      handleDownload();
    }, 1000);
  };

  const handleDownload = async () => {
    const input = document.getElementById("irrigation-preview");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Get the width and height of the input content
    const contentWidth = input.offsetWidth;
    const contentHeight = input.offsetHeight;

    // Convert the dimensions from pixels to millimeters for PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scale to fit the content width to the pdf width
    const scale = pdfWidth / contentWidth;
    const scaledHeight = contentHeight * scale;

    // Render the canvas with the calculated scale
    html2canvas(input, { scale: 4, logging: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg");

      // Check if scaled height is greater than pdf page height
      if (scaledHeight > pdfHeight) {
        // Content will take more than one page
        let position = 0;
        while (position < scaledHeight) {
          // Crop and add part of the image that fits into one page
          let pageSection = Math.min(scaledHeight - position, pdfHeight);
          pdf.addImage(imgData, "JPEG", 0, -position, pdfWidth, scaledHeight);
          position += pdfHeight;

          // Add a new page if there is more content to add
          if (position < scaledHeight) {
            pdf.addPage();
          }
        }
      } else {
        // Content fits into one page
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, scaledHeight);
      }

      pdf.save("Irrigation.pdf");
    });
    setTimeout(() => {
      setPdfClicked(false);
    }, 2000);
  };

  if (!irrDetails.IrrigationData) {
    return (
      <div className="center-loader">
        <CircularProgress></CircularProgress>
      </div>
    );
  }

  return (
    <>
      {" "}
      <EventPopups
        open={showEmailAlert}
        setOpen={setShowEmailAlert}
        color={emailAlertColor}
        text={emailAlertTxt}
      />
      <div style={{ fontFamily: "Arial" }} className="container-fluid ">
        {toggleFullscreen ? (
          <>
            {showbuttons ? (
              <div className="print-page-width">
                <div style={{ width: "28.7cm" }}>
                  <div className="row ">
                    <div className="col-md-1">
                      {isMail ? (
                        <></>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-secondary custom-csv-link estm-action-btn mb-2 mt-3 "
                          onClick={() => {
                            // navigate(`/irrigation`);
                            window.history.back();
                          }}
                        >
                          <ArrowBackIcon sx={{ fontSize: 17 }} />
                        </button>
                      )}
                    </div>
                    <div className="col-md-11 text-end">
                      {" "}
                      <button
                        className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn"
                        onClick={handlePrint}
                      >
                        <i className="fa fa-print"></i>
                      </button>
                      {/* <button
                    className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn"
                    onClick={pdfDownload}
                  >
                    <i className="fa fa-download"></i>
                  </button>{" "} */}
                      <PDFDownloadLink
                        document={
                          <AuditPdf
                            irrDetails={irrDetails}
                            CustomerName={
                              irrDetails?.IrrigationData.CustomerCompanyName
                            }
                            dynamicColorAndLogo={dynamicColorAndLogo}
                          />
                        }
                        fileName="Irrigation Audit.pdf"
                      >
                        {({ blob, url, loading, error }) =>
                          loading ? (
                            <span className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn">
                              <i className="fa fa-spinner"></i>
                            </span>
                          ) : (
                            <button className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn">
                              <i className="fa fa-download"></i>
                            </button>
                          )
                        }
                      </PDFDownloadLink>
                      {isMail ? (
                        <></>
                      ) : (
                        <Authorization allowTo={[1, 4, 5, 6]} hide>
                          <button
                            className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn"
                            onClick={() => {
                              // sendEmail(
                              //   `/irrigation/audit-report?id=${idParam}`,
                              //   irrDetails.IrrigationData.CustomerId,
                              //   0,
                              //   false
                              // );
                              navigate(
                                `/send-mail?title=${"Irrigation"}&mail=${customerMail}&number=${""}`
                              );
                              setselectedPdf([])
                            }}
                          >
                            <i className="fa-regular fa-envelope"></i>
                          </button>
                        </Authorization>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}

        <div className="print-page-width">
          {irrDetails ? (
            <div className="PageLandscape mt-2">
              <div className="card">
                {/* <div className="card-header"> Invoice <strong>01/01/01/2018</strong> <span className="float-end">
                                <strong>Status:</strong> Pending</span> </div> */}
                <div
                  id="irrigation-preview"
                  className="card-body get-preview perview-pd"
                >
                  <div className="row mb-5">
                    <div className="mt-2 col-xl-3 col-lg-3 col-md-3 col-sm-3 d-flex justify-content-lg-end justify-content-md-center justify-content-xs-start">
                      <div className="brand-logo mb-2 inovice-logo">
                        <img
                          className="irr-preview-Logo ms-3"
                          src={dynamicColorAndLogo?.CompanyLogoPath?`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`:logo}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="mt-5 col-xl-6 col-lg-6 col-md-6 col-sm-6 text-center">
                      <h3>
                        {" "}
                        <strong>Irrigation Audit</strong>{" "}
                      </h3>
                    </div>
                  </div>
                  <div
                    className="row mb-2 mx-2"
                    style={{ padding: "2px", border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}
                  >
                    <div
                      style={{
                        color: "black",
                        borderRight: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                      }}
                      className="col-md-4 col-sm-6"
                    >
                      {" "}
                      <strong>Customer Name</strong>{" "}
                      <div>
                        {irrDetails?.IrrigationData.CustomerCompanyName}
                      </div>
                    </div>
                    <div
                      style={{ color: "black" }}
                      className="col-md-8 col-sm-6"
                    >
                      {" "}
                      <strong>Created</strong>{" "}
                      <div>
                        {formatDate(
                          irrDetails?.IrrigationData.CreatedDate,
                          false
                        )}
                      </div>
                    </div>
                  </div>

                  {/* controller table  */}

                  <div className="mx-2">
                    <table className="table table-bordered ">
                      <thead>
                        <tr
                          className="preview-table-row"
                          style={{
                              backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                            color: "black",
                          }}
                        >
                          <th className="text-center">Controller</th>
                          <th className="text-center">Meter Info</th>
                          <th className="text-center">Valve</th>
                          <th className="text-center">Repairs / Upgrades</th>
                        </tr>
                      </thead>
                      <tbody>
                        {irrDetails.ControllerData.map((item, index) => {
                          return (
                            <>
                              <tr
                                key={item.ControllerId}
                                className="Irr-preview-table-row"
                              >
                                <td
                                  style={{ verticalAlign: "top" }}
                                  className="tdbreak"
                                >
                                  <strong>Controller Number:</strong>
                                  <br />
                                  {item.ControllerNumber}
                                  <br />
                                  <strong>Controller Make/ Model:</strong>
                                  <br />
                                  {item.MakeAndModel}
                                  <br />
                                  <strong>Serial:</strong>
                                  <br />
                                  {item.SerialNumber}
                                  <br />
                                  <strong>Location:</strong>
                                  <br />
                                  {item.LoacationClosestAddress}
                                  <br />
                                  <strong>Satellite Based?:</strong>
                                  <br />
                                  {item.isSatelliteBased ? "yes" : "No"}
                                  <br />
                                  <strong>Type of Water:</strong>
                                  <br />
                                  {item.TypeofWater}
                                  <br />

                                  <strong>Controller photo:</strong>
                                  <br />
                                  {item.ControllerPhotoPath ? (
                                    <>
                                      <img
                                        src={`${baseUrl}/${item.ControllerPhotoPath}`}
                                        style={{
                                          width: "115px",
                                          height: "110px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                  <br />
                                </td>
                                <td
                                  style={{ verticalAlign: "top" }}
                                  className="tdbreak"
                                >
                                  <strong>Meter Number:</strong>
                                  <br />
                                  {item.MeterNumber}
                                  <br />
                                  <strong>Meter Size:</strong>
                                  <br />
                                  {item.MeterSize}
                                  <br />
                                </td>
                                <td
                                  style={{ verticalAlign: "top" }}
                                  className="tdbreak"
                                >
                                  <strong>Master Valve?:</strong>
                                  <br />
                                  {item.MakeAndModel}
                                  <br />
                                  <strong>Flow Sensor?:</strong>
                                  <br />

                                  <br />
                                  <strong>No. of Valves:</strong>
                                  <br />
                                  {item.NumberofValves}
                                  <br />
                                  <strong>No. Stations:</strong>
                                  <br />
                                  {item.NumberofStation}
                                  <br />
                                  <strong>Number of Broken Main Lines:</strong>
                                  <br />
                                  {item.NumberofBrokenMainLines}
                                  <br />
                                  <strong>Type of Valves</strong>
                                  <br />
                                  {item.TypeofValves}
                                  <br />
                                  <strong>Number of Leaking Valves:</strong>
                                  <br />
                                  {item.LeakingValves}
                                  <br />
                                  <strong>Number Malfunctioning:</strong>
                                  <br />
                                  {item.MalfunctioningValves}
                                  <br />
                                  <strong>
                                    Number of Broken Lateral Lines:
                                  </strong>
                                  <br />
                                  {item.NumberofBrokenLateralLines}
                                  <br />
                                  <strong>Number of Broken Heads:</strong>
                                  <br />
                                  {item.NumberofBrokenHeads}
                                  <br />
                                </td>
                                <td
                                  style={{ verticalAlign: "top" }}
                                  className="tdbreak"
                                >
                                  <strong>Repairs:</strong>
                                  <br />
                                  {item.RepairsMade}
                                  <br />
                                  <strong>Upgrades:</strong>
                                  <br />
                                  {item.UpgradesMade}

                                  <br />
                                  <strong>photo:</strong>
                                  <br />
                                  {item.PhotoPath ? (
                                    <>
                                      <img
                                        src={`${baseUrl}/${item.PhotoPath}`}
                                        style={{
                                          width: "115px",
                                          height: "110px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <></>
                                  )}

                                  <br />
                                </td>
                              </tr>
                              {index === 0 && pdfClicked && (
                                <tr
                                  style={{ height: "12em" }}
                                  key={`empty-${index}`}
                                  className="empty-row"
                                >
                                  <td colSpan="4"></td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>Loading....</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Audit;
