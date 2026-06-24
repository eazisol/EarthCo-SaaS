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
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PDFDownloadLink } from "@react-pdf/renderer";
import IrrigationAuditPdf from "./IrrigationAuditPdf";
import { baseUrl, logoUrl } from "../../apiConfig";
import Authorization from "../Reusable/Authorization";

const IrrigationAuditPreview = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const navigate = useNavigate();
  const { toggleFullscreen, setToggleFullscreen, setselectedPdf, dynamicColorAndLogo } =
    useContext(DataContext);
  const { contactEmail, fetchEmail } = useFetchContactEmail();

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
  const [controllerData, setControllerData] = useState([]);

  const fetchIrrigation = async () => {
    if (idParam === 0) {
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/IrrigationAuditReport/GetIrrigationAuditReport?id=${idParam}&CustomerId=${customerParam}`,
        { headers }
      );
      setIrrDetails(res.data[0]);
      fetchEmail(res.data[0].Data.ContactId);
      setControllerData(res.data);
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

  const handleDownload = async () => {
    const input = document.getElementById("irrigation-audit-preview");

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

      pdf.save("Controller Audit.pdf");
    });
  };
  if (!irrDetails.Data) {
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
            {showbuttons && (
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
                            // navigate(`/irrigation-audit`);
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
                    onClick={handleDownload}
                  >
                    <i className="fa fa-download"></i>
                  </button>{" "} */}
                      <PDFDownloadLink
                        document={
                          <IrrigationAuditPdf controllerData={controllerData} dynamicColorAndLogo={dynamicColorAndLogo}  />
                        }
                        fileName="Controller Audit.pdf"
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
                              //   irrDetails.Data.CustomerId,
                              //   0,
                              //   false
                              // );
                              // navigate(
                              //   `/send-mail?title=${"Irrigation-Audit"}&mail=${contactEmail}`
                              // );
                              navigate(
                                `/send-mail?title=${"Irrigation Audit"}&mail=${contactEmail}&number=${""}`
                              );
                              setselectedPdf([]);
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
                  id="irrigation-audit-preview"
                  className="card-body get-preview perview-pd"
                >
                  <div className="row mb-2">
                    <div className="mt-5  col-md-9 col-sm-9 text-center">
                      <h3>
                        {" "}
                        <strong>Irrigation Audit Form</strong>{" "}
                      </h3>
                    </div>
                    <div className="mt-4  py-0  col-md-3 col-sm-3 text-end">
                      <div className="brand-logo me-3 mb-2 inovice-logo">
                        <img
                          className="irr-preview-Logo ms-3"
                          src={dynamicColorAndLogo?.CompanyLogoPath?`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`:logo}
                          alt=""
                        />
                      </div>
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
                      <div>{irrDetails?.Data.CustomerDisplayName}</div>
                    </div>
                    <div
                      style={{
                        color: "black",
                        borderRight: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                      }}
                      className="col-md-4 col-sm-6"
                    >
                      {" "}
                      <strong>Contact Name</strong>{" "}
                      <div>{irrDetails?.Data.ContactName}</div>
                      <strong>Contact Company</strong>{" "}
                      <div>{irrDetails?.Data.ContactCompany}</div>
                    </div>
                    <div
                      style={{ color: "black" }}
                      className="col-md-4 col-sm-4"
                    >
                      {" "}
                      <strong>By Regional Manager</strong>{" "}
                      <div>{irrDetails?.Data.RegionalManagerName}</div>
                      <strong>Created</strong>{" "}
                      <div>
                        {formatDate(irrDetails?.Data.CreatedDate, false)}
                      </div>
                    </div>
                  </div>
                  <div className="row mx-2">
                    <div className="col-md-4 col-sm-4">
                      <h5>
                        <strong>Controller Name</strong>
                      </h5>
                      <h5>{irrDetails?.Data.Title}</h5>
                    </div>
                    <div className="col-md-4 col-sm-4"></div>
                    <div className="col-md-4 col-sm-4"></div>
                  </div>
                  {/* controller table  */}

                  <div className="mx-2">
                    <table className="table table-bordered ">
                      <thead>
                        <tr
                          className="preview-table-row"
                          style={{
                              backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                            color: "white",
                            verticalAlign: "top",
                          }}
                        >
                          <th className="text-center">Station #</th>
                          <th className="text-center">Broken Valve?</th>
                          <th className="text-center">Broken Latrals?</th>
                          <th className="text-center">Broken Heads?</th>
                          <th className="text-center">How many?</th>
                          <th className="text-center">
                            Repairs Made or Needed / <br /> Recommendations
                          </th>
                          <th className="text-center">Controller Photo</th>
                          <th className="text-center">Photo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {controllerData ? (
                          controllerData?.map((item) => {
                            if (item?.ControllerData) {
                              return (
                                <tr
                                  key={
                                    item?.ControllerData.ControllerAuditReportId
                                  }
                                  className="Irr-preview-table-row"
                                >
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {
                                      item?.ControllerData
                                        .ControllerAuditReportId
                                    }
                                  </td>
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {item?.ControllerData.BrokenValve
                                      ? "Yes"
                                      : "No"}
                                  </td>
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {item?.ControllerData.BrokenLaterals
                                      ? "Yes"
                                      : "No"}
                                  </td>
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {item?.ControllerData.BrokenHeads
                                      ? "Yes"
                                      : "No"}
                                  </td>
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {item?.ControllerData.HowMany}
                                  </td>
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {item?.ControllerData.RepairMadeOrNeeded}
                                  </td>
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {item?.ControllerData
                                      .ControllerPhotoPath ? (
                                      <>
                                        <img
                                          src={`${baseUrl}/${item?.ControllerData.ControllerPhotoPath}`}
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
                                  </td>
                                  <td
                                    style={{ verticalAlign: "top" }}
                                    className="tdbreak"
                                  >
                                    {item?.ControllerData.PhotoPath ? (
                                      <>
                                        <img
                                          src={`${baseUrl}/${item?.ControllerData.PhotoPath}`}
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
                                  </td>
                                </tr>
                              );
                            }
                          })
                        ) : (
                          <></>
                        )}
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

export default IrrigationAuditPreview;
