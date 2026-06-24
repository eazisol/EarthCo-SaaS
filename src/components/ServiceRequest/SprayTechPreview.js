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
import { PDFDownloadLink } from "@react-pdf/renderer";
import SprayTechPdf from "./SprayTechPdf";
import { baseUrl, logoUrl } from "../../apiConfig";

const SprayTechPreview = () => {
  const token = Cookies.get("token");
  const navigate = useNavigate();
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const queryParams = new URLSearchParams(window.location.search);
  const idParam = Number(queryParams.get("id"));
  const isMail = queryParams.get("isMail");
  const URLToken = queryParams.get("URLToken");

  const { sRData, toggleFullscreen, setToggleFullscreen, dynamicColorAndLogo } =
    useContext(DataContext);

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

  const [pdfClicked, setPdfClicked] = useState(false);

  const pdfDownload = () => {
    setPdfClicked(true);
    setTimeout(() => {
      handleDownload();
    }, 1000);
  };
  const handleDownload = async () => {
    const input = document.getElementById("ST-preview");

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

    pdf.save("Spray Tech.pdf");
    setTimeout(() => {
      setPdfClicked(false);
    }, 3000);

    input.style.fontFamily = "";
  };

  //   const handleDownload = async () => {
  //     const input = document.getElementById("ST-preview");

  //     input.style.fontFamily = "Arial";

  //     const canvas = await html2canvas(input, { dpi: 300, scale: 4 }); // Adjust DPI as needed

  //     const pdfHeight = (canvas.height * 210) / canvas.width; // Assuming 'a4' format

  //     const pdf = new jsPDF({
  //       unit: "mm",
  //       format: "a4",
  //       orientation: "portrait",
  //     });

  //     pdf.addImage(
  //       canvas.toDataURL("image/jpeg", 1.0),
  //       "JPEG",
  //       0,
  //       0,
  //       210,
  //       pdfHeight
  //     );

  //     pdf.save("Spray Tech.pdf");

  //     input.style.fontFamily = "";
  //   };

  const fetchSR = async () => {
    if (idParam === 0) {
      return;
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/ServiceRequest/GetServiceRequest?id=${idParam}`,
        { headers }
      );
      setSRPreviewData(response.data);
      fetchEmail(response.data.Data.ContactId);

      console.log("response.data.Data", response.data);

      console.log(" list is///////", response.data.Data);
    } catch (error) {
      console.error("API Call Error:", error);
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

  if (!sRPreviewData || Object.keys(sRPreviewData).length === 0) {
    return (
      <div className="center-loader">
        <CircularProgress></CircularProgress>
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
              <div id="ST-preview" className=" get-preview ">
                <div
                  className="card-body perview-pd"
                  style={{ minHeight: "23cm" }}
                >
                  <div className="row my-2">
                    <div className="col-md-4 col-sm-4"></div>
                    <div className="col-md-4 col-sm-4 text-center">
                      <h3 className="mt-4">
                        <strong>Spray Tech Form </strong>
                      </h3>
                    </div>

                    {/* <div className="col-md-4 col-sm-4 text-center table-cell-align"></div> */}
                    <div className="col-md-4 col-sm-4 text-end pe-2 ">
                      <img
                        className="preview-Logo"
                        style={{ width: "120px" }}
                          src={dynamicColorAndLogo?.CompanyLogoPath?`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`:logo}
                        alt=""
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div
                      className="col-md-2 col-sm-2 me-0 pe-0"
                      style={{ width: "16%" }}
                    >
                      <h6>
                        <strong>Customer Name:</strong>
                      </h6>
                    </div>
                    <div
                      style={{ width: "20%" }}
                      className="col-md-3 col-sm-3 me-0 pe-0"
                    >
                      <h6>
                        <strong>{sRPreviewData.Data.CustomerDisplayName}</strong>
                      </h6>
                    </div>
                    <div style={{ width: "7%" }} className="col-md-1 col-sm-1 me-0 pe-0 ">
                      <h6>
                        <strong>Type:</strong>
                      </h6>
                    </div>
                    <div style={{ width: "18%" }} className="col-md-3 col-sm-3 me-0 pe-0">
                      <h6>
                        <strong>Spray Tech Form</strong>
                      </h6>
                    </div>
                    <div className="col-md-1 col-sm-1 me-0 pe-0 ">
                      <h6>
                        <strong>Date:</strong>
                      </h6>
                    </div>
                    <div className="col-md-2 col-sm-2 me-0 pe-0">
                      <h6>
                        {formatDate(sRPreviewData.Data.CreatedDate, false)}
                      </h6>
                    </div>
                  </div>
                  <div className="row mt-1">
                    <div
                      style={{ width: "17%" }}
                      className="col-md-2 col-sm-2 me-0 pe-0"
                    >
                      <h6>
                        <strong>Service Location:</strong>
                      </h6>
                    </div>
                    <div style={{ width: "44%" }} className="col-md-4 col-sm-4 me-0 pe-0">
                      <h6>
                        <strong>
                          {sRPreviewData.Data.ServiceLocationAddress}
                        </strong>
                      </h6>
                    </div>
                    <div
                      className="col-md-3 col-sm-3 me-0 pe-0 "
                      style={{ width: "18%" }}
                    >
                      <h6>
                        <strong>Regional Manager:</strong>
                      </h6>
                    </div>
                    <div
                      style={{ width: "20%" }}
                      className="col-md-3 col-sm-3 me-0 pe-0"
                    >
                      <h6>
                        <strong>
                          {sRPreviewData.Data.ReginoalManagerName}
                        </strong>
                      </h6>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-9 col-sm-9">
                      <div className="table-responsive">
                        <table className="table-bordered table  LandScape-TablePadding">
                          <thead>
                            <th
                              colSpan={"12"}
                              className="landscap-preview-heading text-center"
                            >
                              Chemicals
                            </th>
                          </thead>
                          <tbody>
                            {sRPreviewData.SRSTIData.map((item, index) => (
                              <>
                                {index === 0 ||
                                item.Type !==
                                  sRPreviewData.SRSTIData[index - 1].Type ? (
                                  <tr style={{ backgroundColor: "#F0F4F9" }}>
                                    <td className="landscap-preview-heading">
                                      #
                                    </td>
                                    <td className="landscap-preview-heading">
                                      {item.Type}
                                    </td>
                                    <td className="landscap-preview-heading">
                                      Rate
                                    </td>
                                    <td className="landscap-preview-heading">
                                      Notes
                                    </td>
                                  </tr>
                                ) : null}
                                <tr
                                  key={item.SprayTechItemId}
                                  style={{
                                    height: "fit-content",
                                    color: item.isOrganic ? "red" : "black",
                                  }}
                                >
                                  <td>{item.isUsed ? <>&#10003;</> : <></>}</td>
                                  <td>{item.ItemName}</td>
                                  <td>
                                    {item.Rate} {item.Unit}
                                  </td>
                                  <td style={{ whiteSpace: "nowrap" }}>
                                    {item.Notes}
                                  </td>
                                </tr>
                                {index === 22 && pdfClicked && (
                                  <tr
                                    style={{ height: "9em" }}
                                    className="preview-table-row"
                                    key={`empty-row-${index}`}
                                  ></tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-3">
                      <div className="row" style={{ color: "black" }}>
                        <div
                          className="col-md-12 "
                          style={{ backgroundColor: "#cccccc" }}
                        >
                          <h4
                            style={{ backgroundColor: "#cccccc" }}
                            className="mb-1 pb-0 mt-1"
                          >
                            <strong style={{ backgroundColor: "#cccccc" }}>
                              Sprayed Hours
                            </strong>
                          </h4>
                        </div>
                        <div className="col-md-12 mt-3">
                          <label className="form-label mt-2 me-1">
                            Hours: {sRPreviewData.SRSTData[0].Hours}
                          </label>
                          {/* <TextField
                size="small"
                name="Hours"
                type="number"
                onChange={handleChange}
                value={sideData.Hours}
              /> */}
                        </div>
                        <div
                          className="col-md-12 mt-3"
                          style={{ backgroundColor: "#cccccc" }}
                        >
                          <h4
                            style={{ backgroundColor: "#cccccc" }}
                            className="mb-1 pb-0 mt-1"
                          >
                            <strong style={{ backgroundColor: "#cccccc" }}>
                              Landscape treated
                            </strong>
                          </h4>
                        </div>
                        <div className="col-md-1">
                          {/* <Checkbox
                name="isTurf"
                onChange={handleChange}
                value={sideData.isTurf}
              /> */}
                        </div>
                        <div className="col-md-11">
                          <h5 className="mb-0 pb-0 mt-1">
                            {sRPreviewData.SRSTData[0].isTurf ? (
                              <>&#128505;</>
                            ) : (
                              <>&#9744;</>
                            )}
                            Turf
                          </h5>
                        </div>
                        <div className="col-md-1">
                          {/* <Checkbox
                name="isShrubs"
                onChange={handleChange}
                value={sideData.isShrubs}
                checked={sideData.isShrubs}
              /> */}
                        </div>
                        <div className="col-md-11">
                          <h5 className="mb-0 pb-0 mt-1">
                            {sRPreviewData.SRSTData[0].isShrubs ? (
                              <>&#128505;</>
                            ) : (
                              <>&#9744;</>
                            )}
                            Shrubs
                          </h5>
                        </div>
                        <div className="col-md-1">
                          {/* <Checkbox
                name="isParkways"
                onChange={handleChange}
                value={sideData.isParkways}
                checked={sideData.isParkways}
              /> */}
                        </div>
                        <div className="col-md-11">
                          <h5 className="mb-0 pb-0 mt-1">
                            {sRPreviewData.SRSTData[0].isParkways ? (
                              <>&#128505;</>
                            ) : (
                              <>&#9744;</>
                            )}
                            Parkways
                          </h5>
                        </div>
                        <div className="col-md-1">
                          {/* <Checkbox
                name="isTrees"
                onChange={handleChange}
                value={sideData.isTrees}
                checked={sideData.isTrees}
              /> */}
                        </div>
                        <div className="col-md-11">
                          <h5 className="mb-0 pb-0 mt-1">
                            {sRPreviewData.SRSTData[0].isTrees ? (
                              <>&#128505;</>
                            ) : (
                              <>&#9744;</>
                            )}
                            Trees
                          </h5>
                        </div>
                        <div
                          className="col-md-12 mt-3"
                          style={{ backgroundColor: "#cccccc" }}
                        >
                          <h4
                            style={{ backgroundColor: "#cccccc" }}
                            className="mb-1 pb-0 mt-1"
                          >
                            <strong style={{ backgroundColor: "#cccccc" }}>
                              Quantity
                            </strong>
                          </h4>
                        </div>
                        <div className="col-md-12 mt-3">
                          <label className="form-label mt-2 me-1">
                            Ounces: {sRPreviewData.SRSTData[0].Ounces}
                          </label>
                          {/* <TextField
                size="small"
                name="Ounces"
                onChange={handleChange}
                value={sideData.Ounces}
              /> */}
                        </div>
                        <div className="col-md-12 mt-3">
                          <label className="form-label mt-2 me-1">
                            Pounds: {sRPreviewData.SRSTData[0].Pounds}
                          </label>
                          {/* <TextField
                size="small"
                name="Pounds"
                onChange={handleChange}
                value={sideData.Pounds}
              /> */}
                        </div>
                        <div className="col-md-12 mt-3">
                          <label className="form-label mt-2 me-2">
                            Others: {sRPreviewData.SRSTData[0].Other}
                          </label>
                          {/* <TextField
                size="small"
                name="Other"
                onChange={handleChange}
                value={sideData.Other}
              /> */}
                        </div>
                      </div>
                    </div>
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
                <div className="card-footer border-0 text-center">
                  <h6 style={{ fontSize: "12px" }}></h6>
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
                      navigate(`/service-requests`);
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
                  onClick={pdfDownload}
                >
                  <i className="fa fa-download"></i>
                </button> */}
                <PDFDownloadLink
                  document={
                    <SprayTechPdf
                      sRPreviewData={{ ...sRPreviewData, name: sRPreviewData.Data.CustomerDisplayName }}
                    />
                  }
                  fileName="Spray Tech.pdf"
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
                          sRPreviewData.Data.CustomerName
                        }&number=${sRPreviewData.Data.ServiceRequestNumber}`
                      );
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

export default SprayTechPreview;
