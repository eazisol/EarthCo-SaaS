import React, { useContext, useEffect, useState } from "react";
import useFetchProposalReports from "../Hooks/useFetchProposalReports";
import { DataContext } from "../../context/AppData";
import { CircularProgress } from "@mui/material";
import formatDate from "../../custom/FormatDate";
import logo from "../../assets/images/logo/earthco_logo.png";
import { Print, Email, Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import ProposalSummaryPdf from "./ProposalSummaryPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import Authorization from "../Reusable/Authorization";
import { PreviewAddress } from "../../custom/PreviewAddress";

const ProposalSummary = ({ setShowProposal }) => {
  const {
    sRProposalData,
    setsRProposalData,
    toggleFullscreen,
    setToggleFullscreen,
    setselectedPdf,
    companyInfo
  } = useContext(DataContext);
  const navigate = useNavigate();
  const { contactEmail, fetchEmail } =  useFetchContactEmail()
  const isGeneralReport = window.location.pathname.includes("general-report");

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));

  const customerParam = Number(queryParams.get("Customer"));
  const MonthParam = Number(queryParams.get("Month"));
  const yearParam = Number(queryParams.get("Year"));
  const isMail = queryParams.get("isMail");

  const { loading, reportError, reportData, fetchReport } =
    useFetchProposalReports();
  const { customerMail, fetchCustomerEmail } = useFetchCustomerEmail();
  const { name, setName, fetchName } = useFetchCustomerName();
  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();

  useEffect(() => {
    fetchReport(customerParam, yearParam, MonthParam, "proposal");
    // fetchEmail(reportData[0].ContactId);
    fetchCustomerEmail(customerParam);

    console.log("sr propoal dala", reportData);
  }, []);

  // useEffect(() => {
  //   if (reportData[0]?.CustomerId) {
  //     fetchName(reportData[0].CustomerId || 0);
  //   }
  // }, [reportData]);

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
  useEffect(() => {
    if (reportData[0]?.ContactId) {
      fetchEmail(reportData[0].ContactId)
    }

  }, [reportData]);

  const handleDownload = async () => {
    const input = document.getElementById("PS-preview");

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

      pdf.save("download.pdf");
    });
  };

  const handleMainButtonClick = async () => {
    try {
      const blob = await pdf(
        <ProposalSummaryPdf
        companyInfo={companyInfo}
          reportData={reportData}
          CustomerName={reportData[0].CustomerCompanyName}
        />
      ).toBlob();

      // Create a File object from the blob
      const pdfFile = new File([blob], "Proposal Report.pdf", {
        type: "application/pdf",
      });

      // Store the File object in state
      setselectedPdf(pdfFile); // Now, pdfBlob is a File object with a name and type

      navigate(
        `/send-mail?title=${"Proposal Summary"}&mail=${contactEmail}&customer=${
          reportData[0].CustomerCompanyName
        }`
      );

      console.log("pdfFile", pdfFile);
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };

  if (reportError) {
    if (isGeneralReport) {
      setShowProposal(false);
    }
    return (
      <div className="text-center">
        {" "}
        <h3>No record found</h3>
      </div>
    );
  }

  return (
    <>
      <EventPopups
        open={showEmailAlert}
        setOpen={setShowEmailAlert}
        color={emailAlertColor}
        text={emailAlertTxt}
      />
      {loading ? (
        <div className="center-loader">
          <CircularProgress style={{ color: "#789a3d" }} />
        </div>
      ) : (
        <div className="container-fluid ">
          {toggleFullscreen && !isGeneralReport ? (
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
                          //  navigate(`/summary-report`);
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
                 </button> */}
                    <PDFDownloadLink
                      document={
                        <ProposalSummaryPdf
                        companyInfo={companyInfo}
                          reportData={reportData}
                          CustomerName={reportData[0].CustomerCompanyName}
                        />
                      }
                      fileName="Proposal Summary Report.pdf"
                    >
                      {({ blob, url, loading, error }) =>
                        loading ? (
                          " "
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
                      <Authorization allowTo={[1,4,5,6]} hide>
                      <button
                        className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn"
                        onClick={() => {
                          // sendEmail(
                          //   `/PunchlistPreview?id=${idParam}`,
                          //   pLData.CustomerId,
                          //   pLData.ContactId,
                          //   false
                          // );
                          // navigate(
                          //   `/send-mail?title=${"Proposal Summary"}&mail=${customerMail}&customer=${
                          //     reportData[0].CustomerCompanyName
                          //   }`
                          // );
                          handleMainButtonClick();
                        }}
                      >
                        <i className="fa-regular fa-envelope"></i>
                      </button></Authorization>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div style={{ fontFamily: "Arial" }} className="print-page-width">
            <div className="PageLandscape mt-2">
              <div className="card">
                {/* <div className="card-header"> Invoice <strong>01/01/01/2018</strong> <span className="float-end">
                                    <strong>Status:</strong> Pending</span> </div> */}
                <div
                  id="PS-preview"
                  className="card-body perview-pd get-preview"
                >
                  <div className="row mb-5">
                    <div className="mt-2 col-xl-3 col-lg-3 col-md-3 col-sm-3 ">
                      <div style={{ color: "black" }}>
                        {/* EarthCo <br />
                        1225 E Wakeham <br />
                        Santa Ana , Ca 92705 */}
                            <PreviewAddress    />
                      </div>
                      <div style={{ color: "black" }}></div>

                      <div className="mt-4" style={{ color: "black" }}>
                        Submitted To:{" "}
                      </div>
                      <div style={{ color: "black" }}>
                        {reportData[0].CustomerCompanyName}
                      </div>
                      <div style={{ color: "black" }}>
                        {reportData[0].Address}
                      </div>
                    </div>
                    <div className="mt-5 col-xl-7 col-lg-7 col-md-7 col-sm-6 text-center">
                      <h3>
                        {" "}
                        <strong>Proposal Summary Report</strong>{" "}
                      </h3>
                      <h3></h3>
                    </div>
                    <div className="mt-2 col-xl-2 col-lg-2 col-md-2 col-sm-3 d-flex justify-content-lg-end justify-content-md-center justify-content-xs-start">
                      <div className="brand-logo mb-2 inovice-logo">
                        <img
                          className="preview-Logo"
                          style={{ width: "13em" }}
                          src={logo}
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="table-responsive">
                    <table className="text-center table table-bordered ">
                      <thead>
                        <tr
                          style={{ padding: "0.5rem 0.5rem" }}
                          className="preview-table-head text-start"
                        >
                          <th>SUBMITTED</th>
                          <th>PROPOSAL #</th>
                          <th style={{ maxWidth: "20em" }}>DESCRIPTION</th>
                          <th className="text-end">AMOUNT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((report, index) => {
                          return (
                            <>
                              <tr
                                className="preview-table-row text-start"
                                key={index}
                              >
                                <td>{formatDate(report.CreatedDate, false)}</td>
                                <td className="left strong">
                                  {report.EstimateNumber}
                                </td>
                                <td style={{ maxWidth: "20em" }}>
                                  {report.EstimateNotes}
                                </td>
                                <td className="text-end">
                                  $
                                  {report &&
                                    report.TotalAmount &&
                                    report.TotalAmount.toFixed(2).replace(
                                      /\B(?=(\d{3})+(?!\d))/g,
                                      ","
                                    )}
                                </td>
                                <td>{report.Status}</td>
                              </tr>
                              {index === 11 && pdfClicked && (
                                <tr
                                  style={{ height: "6em" }}
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
          </div>
        </div>
      )}
    </>
  );
};

export default ProposalSummary;
