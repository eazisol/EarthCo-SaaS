import React, { useContext, useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import logo from "../../assets/images/logo/earthco_logo.png";
import { DataContext } from "../../context/AppData";
import formatDate from "../../custom/FormatDate";
import { CircularProgress } from "@mui/material";
import { Print, Email, Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useFetchCustomerName from "../Hooks/useFetchCustomerName";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import SRPdf from "./SRPdf";
import { baseUrl, logoUrl } from "../../apiConfig";
import Authorization from "../Reusable/Authorization";
import { BsFiletypePdf } from "react-icons/bs";
import { PreviewAddress } from "../../custom/PreviewAddress";

const SRPreview = () => {
  const token = Cookies.get("token");
  const navigate = useNavigate();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const customerParam = Number(queryParams.get("customerId"));
  const isMail = queryParams.get("isMail");
  const URLToken = queryParams.get("URLToken");
  const { sRData, toggleFullscreen, loggedInUser,companyInfo, dynamicColorAndLogo  } = useContext(DataContext);

  const { name, setName, fetchName } = useFetchCustomerName();

  const {
    sendEmail,
    showEmailAlert,
    setShowEmailAlert,
    emailAlertTxt,
    emailAlertColor,
  } = useSendEmail();
  const [sRPreviewData, setSRPreviewData] = useState({});

  const [showbuttons, setShowButtons] = useState(true);

  const { contactEmail, fetchEmail } = useFetchContactEmail();

  const handlePrint = () => {
    // setToggleFullscreen(false);
    setShowButtons(false);
    setTimeout(() => {
      window.print();
    }, 1000);
    setTimeout(() => {
      //setToggleFullscreen(true);
      setShowButtons(true);
    }, 3000);
  };

  const componentRef = useRef();
  // const handlePrint = useReactToPrint({
  //   content: () => componentRef.current,
  // });

  const handleDownload = async () => {
    const input = document.getElementById("SR-preview");

    input.style.fontFamily = "Arial";

    const canvas = await html2canvas(input, { dpi: 300, scale: 4 }); // Adjust DPI as needed

    const pdfHeight = (canvas.height * 210) / canvas.width; // Assuming 'a4' format

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    pdf.addImage(
      canvas.toDataURL("image/jpeg", 1.0),
      "JPEG",
      0,
      0,
      210,
      pdfHeight
    );

    pdf.save("Service request.pdf");

    input.style.fontFamily = "";
  };
  const [error, setError] = useState("");

  const fetchSR = async () => {
    if (idParam === 0) {
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequest?id=${idParam}&CustomerId=${customerParam}`,
        { headers }
      );
      setSRPreviewData(response.data);
      fetchEmail(response.data.Data.ContactId);
      fetchName(response.data.Data.CustomerId);

      console.log("response.data.Data", response.data);

      console.log(" list is///////", response.data.Data);
    } catch (error) {
      setError(true);
      console.error("API Call Error:", error.response.data);
      if (error.response.status == 401) {
        console.error(" Error:", error.response.data.Message);
        setError(error.response.data.Message);
      }
    }
  };

  useEffect(() => {
    if (URLToken) {
      Cookies.set("token", URLToken, { expires: 30 });
      setShowButtons(false);
    }
    fetchSR();
    console.log(sRData);
  }, []);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Calculate the total amount when previewData changes
    if (sRPreviewData && sRPreviewData.ItemData) {
      const total = sRPreviewData.ItemData.reduce(
        (accumulator, item) => accumulator + item.Qty * item.Rate,
        0
      );
      setTotalAmount(total);
    }
  }, [sRPreviewData]);
// return(
//   <>
//    <SRPdf
//                       data={{
//                         ...sRPreviewData,
//                         name: sRPreviewData?.Data?.CustomerCompanyName,
//                         companyInfo:companyInfo,
//                         dynamicColorAndLogo:dynamicColorAndLogo
//                       }}
//                     />
                    
//   </>
// )
  if (!sRPreviewData || Object.keys(sRPreviewData).length === 0) {
    return (
      <div className="center-loader">
        {error == "" ? (
          <CircularProgress></CircularProgress>
        ) : (
          <>
            <h3>{error}</h3>
          </>
        )}
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
      <div
        style={{ fontFamily: "Arial" }}
        className={
          toggleFullscreen
            ? "container-fluid custom-font-style print-page-width "
            : ""
        }
      >
        <div className="row PageA4 mt-2">
          <div className="card">
            <div className={toggleFullscreen ? "" : ""}>
              <div ref={componentRef} id="SR-preview" className=" get-preview ">
                <div
                  className="card-body perview-pd"
                  style={{ minHeight: "23cm" }}
                >
                  <div className="row mt-2">
                    <div className="col-md-4 col-sm-4">
                      {/* <h5 className="mb-0">Earthco Landscape</h5>
                      <h6 className="mb-0">
                        1225 East Wakeham Avenue <br /> Santa Ana, California
                        92705
                      </h6>
                      <h6 className="mb-0">
                        <strong>Phone: </strong> 714.571.0455
                      </h6>
                      <h6 className="mb-0">www.earthcompany.org</h6> */}
                       <PreviewAddress website/>
                    </div>
                    <div className="col-md-4 col-sm-4 text-center"></div>
                    <div className="col-md-4 col-sm-4 text-center table-cell-align">
                      <img
                        className="preview-Logo"
                        style={{ width: "160px" }}
                        src={dynamicColorAndLogo?.CompanyLogoPath?`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`:logo}
                        alt=""
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12 text-center">
                      <h3>
                        <strong>Service Request </strong>
                      </h3>
                    </div>
                  </div>

                  <div className="row my-2">
                    <div className="col-md-7 col-sm-7">
                      <div className="table-responsive">
                        <table className="table-striped table table-bordered text-start">
                          <thead>
                            <tr
                              style={{ backgroundColor: "gray" }}
                              className="preview-table-head LandScape-TablePadding"
                            >
                              <th
                                className="landscap-preview-heading"
                                style={{ width: "50%" }}
                              >
                                Requested By:
                              </th>
                              <th
                                className="landscap-preview-heading"
                                style={{ width: "50%" }}
                              >
                                Service Location:
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="preview-table-row">
                              <td style={{ color: "black", width: "50%" }}>
                                {sRPreviewData.Data.CustomerCompanyName}
                                <br />
                                {sRPreviewData.Data.ContactCompanyName}
                              </td>
                              <td
                                style={{ color: "black", width: "50%" }}
                                className="left strong"
                              >
                                {sRPreviewData.Data.ServiceLocationAddress}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div
                      style={{ color: "black" }}
                      className="col-md-5 col-sm-5 "
                    >
                      <div className="row">
                        <div className="col-md-6 col-sm-6 p-0 text-end">
                          <strong>Date Created:</strong>
                        </div>
                        <div className="col-md-6 col-sm-6 p-0 text-start">
                          <div style={{ color: "black" }}>
                            <p>
                              &nbsp;
                              {formatDate(
                                sRPreviewData.Data.CreatedDate,
                                false
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6 col-sm-6 text-end p-0">
                          {/* <strong>Target completion:</strong> */}
                        </div>
                        <div className="col-md-6 col-sm-6 p-0 text-start">
                          <div style={{ color: "black" }} className="">
                            <p className="">
                              {/* &nbsp;
                              {formatDate(sRPreviewData.Data.DueDate, false)} */}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table-bordered table  LandScape-TablePadding">
                      <thead></thead>
                      <tbody>
                        <tr>
                          <td className="landscap-preview-heading" colSpan={2}>
                            <>Service Request Details</>
                          </td>
                        </tr>
                        <tr className="preview-table-row">
                          <td style={{ width: "18em" }}>
                            <strong>Service Request Number: </strong>
                          </td>
                          <td> {sRPreviewData.Data.ServiceRequestNumber}</td>
                        </tr>

                        <tr className="preview-table-row">
                          <td style={{ width: "18em" }}>
                            <strong>Date Completed: </strong>
                          </td>
                          <td>
                            {" "}
                            {formatDate(
                              sRPreviewData.Data.CompletedDate,
                              false
                            )}{" "}
                          </td>
                        </tr>
                        <tr>
                          <td className="landscap-preview-heading" colSpan={2}>
                            <>Actions</>
                          </td>
                        </tr>

                        <tr className="preview-table-row">
                          <td style={{ width: "18em" }}>
                            <strong>Work Requested: </strong>
                          </td>
                          <td> {sRPreviewData.Data.WorkRequest}</td>
                        </tr>
                        <tr className="preview-table-row">
                          <td style={{ width: "18em" }}>
                            <strong>Action taken </strong>
                          </td>
                          <td> {sRPreviewData.Data.ActionTaken}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="row">
                    {sRPreviewData.FileData.map((file, index) => (
                      <div
                        key={index}
                        className="col-md-2 col-md-2 mt-3 image-container"
                        style={{
                          width: "115px", // Set the desired width
                          height: "110px", // Set the desired height
                          margin: "1em",
                          position: "relative",
                        }}
                      >
                        <a
                          href={`${baseUrl}/${file.FilePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.FileName.includes(".pdf") ? (
                            <div className="d-flex justify-content-center align-items-center pdf-div">
                              <BsFiletypePdf color="#ff0000" fontSize="4em" />
                            </div>
                          ) : (
                            <img
                              src={`${baseUrl}/${file.FilePath}`}
                              alt={file.FileName}
                              style={{
                                width: "115px",
                                height: "110px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </a>
                        <p
                          className="file-name-overlay"
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0px",
                            right: "0",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            textAlign: "center",
                            overflow: "hidden",

                            textOverflow: "ellipsis",
                            padding: "5px",
                          }}
                        >
                          {file.FileName}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* <table id="empoloyees-tblwrapper" className="table mt-2">
                    <thead className="table-header">
                      <tr className="preview-table-head">
                        <th>
                          <strong>DESCRIPTION</strong>
                        </th>
                        <th className="text-right">
                          <strong>QTY</strong>
                        </th>
                        <th className="text-right">
                          <strong>RATE</strong>
                        </th>

                        <th className="text-right">
                          <strong>AMOUNT</strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sRPreviewData.ItemData.map((item, index) => {
                        return (
                          <tr className="preview-table-row" key={index}>
                            <td>{item.Description}</td>
                            <td className="text-right">{item.Qty}</td>
                            <td className="text-right">{item.Rate}</td>
                            <td className="text-right">
                              {(item.Rate * item.Qty).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table> */}

                  {/* <div className="row ">
                    <div className="col-md-8 col-sm-6"></div>
                    <div className="col-md-2 col-sm-3">
                      <h6 className="mb-0">
                        
                        <strong>SUBTOTAL:</strong>
                      </h6>
                    </div>
                    <div className="col-md-2 col-sm-3">
                      <h6 className="mb-0 text-end">
                        {totalAmount.toFixed(2)}
                      </h6>
                    </div>
                    <div className="col-md-8 col-sm-6"></div>
                    <div className="col-md-2 col-sm-3">
                  <h6 className="mb-0">
                    
                    <strong>DISCOUNT:</strong>
                  </h6>
                </div> 
                    <hr className="mb-1" />
                    <div className="col-md-8 col-sm-6 text-end"></div>
                    <div className="col-md-2 col-sm-3 ">
                      <h6 className="table-cell-align mt-2">
                        <strong>TOTAL USD</strong>
                      </h6>
                    </div>
                    <div className="col-md-2 col-sm-3 mt-2">
                      <h6 className=" text-end">{totalAmount.toFixed(2)}</h6>
                    </div>
                    <div
                      style={{
                        borderBottom: "5px solid #012a47",
                        margin: "0em 0em 3em 0em",
                      }}
                    ></div>
                  </div>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
        {showbuttons ? (
          <div className={toggleFullscreen ? "row ms-2" : ""}>
            <div className="d-flex align-items-end flex-column bd-highlight mb-3">
              {isMail ? (
                <></>
              ) : (
                <div className="p-2 bd-highlight">
                  <button
                    className="btn btn-sm btn-outline-secondary custom-csv-link estm-action-btn"
                    style={{ padding: "5px 10px" }}
                    onClick={() => {
                      // navigate(`/service-requests`);
                      window.history.back();
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 17 }} />
                  </button>
                </div>
              )}

              <div className="p-2 pt-0 bd-highlight">
                <button
                  className="btn btn-sm btn-outline-secondary custom-csv-link  estm-action-btn"
                  onClick={handlePrint}
                >
                  <i className="fa fa-print"></i>
                </button>
              </div>
              <div className="p-2 pt-0 bd-highlight">
                {/* <button
                  className="btn btn-sm btn-outline-secondary  custom-csv-link estm-action-btn"
                  onClick={handleDownload}
                >
                  <i className="fa fa-download"></i>
                </button> */}
                <PDFDownloadLink
                  document={
                    <SRPdf
                      data={{
                        ...sRPreviewData,
                        name: sRPreviewData.Data.CustomerCompanyName,
                        companyInfo:companyInfo,
                        dynamicColorAndLogo:dynamicColorAndLogo
                      }}
                    />
                  }
                  fileName="Service Request.pdf"
                >
                  {({ blob, url, loading, error }) =>
                    loading ? (
                      <span className="btn btn-sm btn-outline-secondary custom-csv-link mb-2 mt-3 estm-action-btn">
                        <i className="fa fa-spinner"></i>
                      </span>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary custom-csv-link  estm-action-btn">
                        <i className="fa fa-download"></i>
                      </button>
                    )
                  }
                </PDFDownloadLink>
              </div>
              {isMail ? (
                <></>
              ) : (
                <div className="p-2 pt-0 bd-highlight">
                  <Authorization allowTo={[1, 4, 5, 6]} hide>
                    <button
                      className="btn btn-sm btn-outline-secondary  custom-csv-link estm-action-btn"
                      onClick={() => {
                        // sendEmail(
                        //   `/service-requests/service-request-preview?id=${idParam}`,
                        //   sRPreviewData.Data.CustomerId,
                        //   sRPreviewData.Data.ContactId,
                        //   false
                        // );
                        navigate(
                          `/send-mail?title=${"Service Request"}&mail=${contactEmail}&customer=${
                            sRPreviewData.Data.CustomerCompanyName
                          }&number=${sRPreviewData.Data.ServiceRequestNumber}`
                        );
                      }}
                    >
                      <i className="fa-regular fa-envelope"></i>
                    </button>
                  </Authorization>
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

export default SRPreview;
