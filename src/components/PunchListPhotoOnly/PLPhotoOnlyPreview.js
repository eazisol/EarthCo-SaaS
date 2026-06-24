import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import formatDate from "../../custom/FormatDate";
import logo from "../../assets/images/logo/earthco_logo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Print, Email, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/AppData";
import html2pdf from "html2pdf.js";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PunchListPOPdf from "./PunchListPOPdf";
import { baseUrl, logoUrl  } from "../../apiConfig";

const PLPhotoOnlyPreview = () => {
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const { toggleFullscreen, setToggleFullscreen ,setselectedPdf, dynamicColorAndLogo } = useContext(DataContext);
  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const customerIdParam = Number(queryParams.get("CustomerId"));

  const customerParam = Number(queryParams.get("Customer"));
  const MonthParam = Number(queryParams.get("Month"));
  const yearParam = Number(queryParams.get("Year"));
  const isMail = queryParams.get("isMail");

  const { customerMail, fetchCustomerEmail } = useFetchCustomerEmail();

  const [weeklyPreviewData, setWeeklyPreviewData] = useState({});
  const [files, setFiles] = useState([]);
  const getPlPhotosOnly = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/PunchlistPhotoOnly/GetPunchlistPhotoOnly?id=${idParam}&CustomerId=${customerIdParam}`,
        { headers }
      );
      setWeeklyPreviewData(res.data.Data);
      setFiles(res.data.FileData);
      fetchCustomerEmail(res.data.Data.CustomerId);
      console.log("reponse weekly is", res.data);
    } catch (error) {
      console.log("api call error", error);
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
    const input = document.getElementById("PL-photos-only-preview");
  
  
    input.style.fontFamily = "Arial";
  
    const canvas = await html2canvas(input, { dpi: 300, scale: 3 });
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
  
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
  
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
  
    let position = 0;
  
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  
    pdf.save("PunchList.pdf");
    
  
    input.style.fontFamily = "";
  };
  
  
  useEffect(() => {
    getPlPhotosOnly();
  }, []);

  return (
    <>
      <EventPopups
        open={showEmailAlert}
        setOpen={setShowEmailAlert}
        color={emailAlertColor}
        text={emailAlertTxt}
      />
      <div
        style={{ fontFamily: "Arial" }}
        className="container-fluid print-page-width"
      >
        <div className="row PageA4 mt-2">
          <div className="card">
            <div
              id="PL-photos-only-preview"
              className="card-body perview-pd get-preview"
            >
              <div className="row mb-5">
                <div className="mt-4 col-xl-2 col-lg-2 col-md-2 col-sm-2 d-flex justify-content-lg-end justify-content-md-center justify-content-xs-start">
                  <div className="brand-logo mb-2 inovice-logo">
                    <img className="preview-Logo" src={dynamicColorAndLogo?.CompanyLogoPath?`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`:logo} alt="" />
                  </div>
                </div>
                <div className="mt-5 col-xl-10 col-lg-10 col-md-10 col-sm-10 text-center">
                  <h2>
                    {" "}
                    <strong>PunchList Photos only</strong>{" "}
                  </h2>
                </div>
              </div>

              <div className="row bg-primary">
                <div className="col-md-12 text-center">
                  <h3 style={{ color: "white" }} className="pb-0 mb-0">
                    Photos
                  </h3>
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-md-12 ">
                  <div>
                    {" "}
                    <h5>
                      <strong>Add note:</strong>
                    </h5>{" "}
                  </div>
                  <div>
                    {" "}
                    <h5>{weeklyPreviewData.Notes}</h5>{" "}
                  </div>
                </div>

                <div className="col-md-12">
                  <div>
                    {" "}
                    <h5>
                      <strong>Photos:</strong>
                    </h5>{" "}
                  </div>
                </div>

                {files.map((file, index) => {
                  return (
                    <div key={index} className="col-md-6 col-sm-6">
                      {file.FilePath ? (
                        <>
                          <img
                            src={`${baseUrl}/${file.FilePath}`}
                            className="weeklyimages"
                            alt="weeklyimages"
                          />
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {toggleFullscreen ? (
          <div className="row ms-2">
            <div className="d-flex align-items-end flex-column bd-highlight mb-3">
              {isMail ? (
                <></>
              ) : (
                <div className="p-2 bd-highlight">
                  <button
                    className="btn btn-sm btn-outline-secondary custom-csv-link estm-action-btn"
                    style={{ padding: "5px 10px" }}
                    onClick={() => {
                      // navigate(`/punchList-photos-only`);
                      window.history.back();
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 17 }} />
                  </button>
                </div>
              )}

              <div className="p-2 bd-highlight">
                {" "}
                <button
                  className="btn btn-sm btn-outline-secondary custom-csv-link   estm-action-btn"
                  onClick={handlePrint}
                >
                  <i className="fa fa-print"></i>
                </button>
              </div>
              <div className="p-2 bd-highlight">
                {" "}
                {/* <button
                  className="btn btn-sm btn-outline-secondary custom-csv-link  estm-action-btn"
                  onClick={handleDownload}
                >
                  <i className="fa fa-download"></i>
                </button> */}
                <PDFDownloadLink
                  document={<PunchListPOPdf weeklyPreviewData={weeklyPreviewData} />}
                  fileName="PunchList.pdf"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? (
                      <span className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn">
                          <i className="fa fa-spinner"></i>
                        </span>
                    ) : (
                      <button
                className="btn btn-sm btn-outline-secondary custom-csv-link  estm-action-btn"
               
              >
                <i className="fa fa-download"></i>
              </button>
                    )
                  }
                </PDFDownloadLink> 
              </div>

              {isMail ? (
                <></>
              ) : (
                <div className="p-2 bd-highlight">
                  <button
                    className="btn btn-sm btn-outline-secondary custom-csv-link  estm-action-btn"
                    onClick={() => {
                      navigate(
                        `/send-mail?title=${"PunchList - Photos only"}&mail=${customerMail}&number=${''}`
                      );
                      setselectedPdf([])
                      // sendEmail(
                      //   `/weekly-reports/weekly-report-preview?Customer=${customerParam}&Year=${yearParam}&Month=${MonthParam}`,
                      //   customerParam,
                      //   0,
                      //   false
                      // );
                    }}
                  >
                    <i className="fa-regular fa-envelope"></i>
                  </button>
                </div>
              )}
            </div>
            ;
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default PLPhotoOnlyPreview;
