import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../context/AppData";
import SummaryReportPreview from "./SummaryReportPreview";
import ProposalSummary from "./ProposalSummary";
import Landscape from "../Landscape/Landscape";
import { Print, Email, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import { PDFDownloadLink } from "@react-pdf/renderer";
import GenralReportPdf from "./GenralReportPdf";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import { pdf } from "@react-pdf/renderer";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import Authorization from "../Reusable/Authorization";


const GenralReport = () => {
  const token = Cookies.get("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const {
    sRProposalData,
    setsRProposalData,
    toggleFullscreen,
    setToggleFullscreen,
    setselectedPdf,
    companyInfo
  } = useContext(DataContext);

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const [showProposal, setShowProposal] = useState(true);
  const [showSummaryReport, setShowSummaryReport] = useState(true)
  const customerParam = Number(queryParams.get("Customer"));
  const MonthParam = Number(queryParams.get("Month"));
  const yearParam = Number(queryParams.get("Year"));
  const { customerMail, fetchCustomerEmail } = useFetchCustomerEmail();
  const { name, setName, fetchName } = useFetchCustomerName();

  const isMail = queryParams.get("isMail");
  const { contactEmail, fetchEmail } = useFetchContactEmail();


  const navigate = useNavigate();
  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();


  const [reportData, setReportData,] = useState([]);
  const fetchReport = async (customerId, year, month, type = "proposal") => {
   
    try {
      const res = await axios.get(
        `${baseUrl}/api/Report/GetReportList?CustomerId=${customerParam}&Year=${yearParam}&Month=${MonthParam}&Type=${type}`,
        { headers }
      );
      fetchEmail(res.data[0].ContactId);
      setReportData(res.data)
      console.log("proposal report data is", res.data);
    } catch (error) {
     
     

      console.log("report api call error fetching summary report", error);
    }
  };
const [SummaryReportData, setSummaryReportData] = useState([])
  const fetchSummaryReport = async (customerId, year, month, type =  "Service Request") => {
   
    try {
      const res = await axios.get(
        `${baseUrl}/api/Report/GetReportList?CustomerId=${customerParam}&Year=${yearParam}&Month=${MonthParam}&Type=${type}`,
        { headers }
      );
   
      setSummaryReportData(res.data)
      fetchEmail(res.data[0].ContactId);
      console.log("proposal report data is", res.data);
    } catch (error) {
     
     

      console.log("report api call error fetching summary report", error);
    }
  };
  const [landscapeData, setLandscapeData] = useState({});
  const getLandscape = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/MonthlyLandsacpe/GetMonthlyLandsacpe?id=${idParam}&CustomerId=${customerParam}&Year=${yearParam}&Month=${MonthParam}`,
        { headers }
      );
      setLandscapeData(res.data);
      fetchEmail(res.data.ContactId);
      console.log("reponse landscape is", res.data);
    } catch (error) {
      console.log("api call error", error);
    }
  };


  
  const handleMainButtonClick = async () => {
    try {
      const blob = await pdf(
        <GenralReportPdf companyInfo={companyInfo} SummaryReportData={SummaryReportData} reportData={reportData} landscapeData={landscapeData} CustomerName={name.CompanyName} />
      ).toBlob();

      // Create a File object from the blob
      const pdfFile = new File([blob], "Monthly Report.pdf", {
        type: "application/pdf",
      });

      // Store the File object in state
      setselectedPdf(pdfFile); // Now, pdfBlob is a File object with a name and type

      navigate(`/send-mail?title=${"Monthly Report"}&mail=${contactEmail}&customer=${name.CompanyName}`);
    } catch (err) {
      console.error("Error generating PDF", err);
    }
  };



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
    const input = document.getElementById("General-preview");

    input.style.fontFamily = "Arial";

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "landscape",
    });

    const contentHeight = input.offsetHeight;
    const pageHeightInPixels = 1122; // Approximate pixel height of an A4 page in landscape at 300 DPI
    let remainingHeight = contentHeight;

    let position = 0; // Position to start slicing the content vertically

    while (remainingHeight > 0) {
      // Create a canvas for each page segment
      const canvas = await html2canvas(input, {
        dpi: 300,
        scale: 3,
        windowHeight: pageHeightInPixels,
        y: position,
      });

      // Add the canvas to the PDF
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const imgWidth = 297; // A4 width in mm in landscape mode
      let imgHeight = 650;

      if (position !== 0) {
        // Add a new page after the first
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

      // Update the position and remaining height
      position += pageHeightInPixels;
      remainingHeight -= pageHeightInPixels;
    }

    pdf.save("General.pdf");

    input.style.fontFamily = ""; // Reset font style
  };

  useEffect(() => {
    console.log("sr data", sRProposalData);
    fetchCustomerEmail(customerParam);
    fetchName(customerParam);
    getLandscape()
    fetchSummaryReport()
    fetchReport()
  }, []);

  return (
    <>
      <EventPopups
        open={showEmailAlert}
        setOpen={setShowEmailAlert}
        color={emailAlertColor}
        text={emailAlertTxt}
      />
      <div className="container-fluid ">
        {toggleFullscreen ? (
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
                        // navigate(`/summary-report`);
                        window.history.back();
                      }}
                      style={{ padding: "5px 10px" }}
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
                  </button> */}
                  <PDFDownloadLink
                  document={<GenralReportPdf companyInfo={companyInfo} SummaryReportData={SummaryReportData} reportData={reportData} landscapeData={landscapeData} CustomerName={name.CompanyName} />}
                  fileName="Monthly Report.pdf"
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
                    <Authorization allowTo={[1,4,5,6]} hide>
                    <button
                      className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn"
                      onClick={() => {
                        // sendEmail(
                        //   `/general-report?Customer=${customerParam}&Year=${yearParam}&Month=${MonthParam}`,
                        //   customerParam,
                        //   0,
                        //   false
                        // );
                        // navigate(
                        //   `/send-mail?title=${"Report"}&mail=${customerMail}&customer=${name.CompanyName}`
                        // );
                        handleMainButtonClick()
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
        <div id="General-preview">
          {showSummaryReport && 
          <div
            style={{ minHeight: "30cm" }}
            className={toggleFullscreen ? "" : "full-page-print-height "}
          >
            <SummaryReportPreview setShowSummaryReport={setShowSummaryReport} />
          </div>}
          {showProposal && 
          <div
            style={{ minHeight: "30cm" }}
            className={toggleFullscreen ? "" : "full-page-print-height"}
          >
            <ProposalSummary setShowProposal={setShowProposal} />
          </div>}
          <div className={toggleFullscreen ? "" : "full-page-print-height"}>
            <Landscape />
          </div>
        </div>
      </div>
    </>
  );
};

export default GenralReport;
