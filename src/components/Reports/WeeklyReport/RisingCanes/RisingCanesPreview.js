import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import formatDate from "../../../../custom/FormatDate";
import logo from "../../../../assets/images/logo/earthco_logo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Print, Email, Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../../../context/AppData";
import html2pdf from "html2pdf.js";
import useSendEmail from "../../../Hooks/useSendEmail";
import EventPopups from "../../../Reusable/EventPopups";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import useFetchContactEmail from "../../../Hooks/useFetchContactEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RisingCanesPdf from "./RisingCanesPdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { baseUrl, logoUrl } from "../../../../apiConfig";
import imagePathCorrector from "../../../../custom/ImagePathCorrector";
import Authorization from "../../../Reusable/Authorization";
import { BsFiletypePdf } from "react-icons/bs";
const RisingCanesPreview = () => {
  const token = Cookies.get("token");
  const navigate = useNavigate();
 
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const { toggleFullscreen, setToggleFullscreen ,setselectedPdf, dynamicColorAndLogo} = useContext(DataContext);
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

  const [weeklyPreviewData, setWeeklyPreviewData] = useState({});
  const [files, setFiles] = useState([]);
  const { contactEmail, fetchEmail } = useFetchContactEmail();

  const getWeeklyPreview = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/WeeklyReport/GetWeeklyReportRC?id=${idParam}&CustomerId=${customerParam}`,
        { headers }
      );
      setWeeklyPreviewData(res.data.Data);
      fetchEmail(res.data.Data.ContactId);

      setFiles(res.data.FileData);
    } catch (error) {
      console.log("api call error", error);
    }
  };
  // const fetctContacts = async (id) => {
  //   if (!id) {
  //     return;
  //   }
  //   axios
  //     .get(`${baseUrl}/api/Customer/GetCustomerContact?id=${id}`, { headers })
  //     .then((res) => {
  //       console.log("contacts data isss", res.data);
  //       setContactList(res.data);
  //     })
  //     .catch((error) => {
  //       setContactList([]);
  //       console.log("contacts data fetch error", error);
  //     });
  // };
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
    const input = document.getElementById("WR-RC-preview");

    // Explicitly set the font for the PDF generation
    input.style.fontFamily = "Arial";

    // Use html2canvas to capture the content as an image with higher DPI
    const canvas = await html2canvas(input, { dpi: 300, scale: 4 }); // Adjust DPI as needed

    // Calculate the height of the PDF based on the content
    const pdfHeight = (canvas.height * 210) / canvas.width; // Assuming 'a4' format

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    // Add the captured image to the PDF
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 1.0),
      "JPEG",
      0,
      0,
      210,
      pdfHeight
    );

    // Save the PDF
    pdf.save("Weekly report - Rising Canes.pdf");

    // Reset the font to its default value
    input.style.fontFamily = "";
  };

  useEffect(() => {
    if (URLToken) {
      Cookies.set("token", URLToken, { expires: 30 });
      setShowButtons(false);
    }
    getWeeklyPreview();
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
              id="WR-RC-preview"
              className="card-body perview-pd get-preview"
            >
              <div className="row ">
                <div className="pt-4 col-xl-10 col-lg-10 col-md-10 col-sm-9 text-center">
                  <h3 className=" pb-4">
                    {" "}
                    <strong>Monthly Report - Raising Canes</strong>{" "}
                  </h3>
                </div>
                <div className="mt-4 p-0 col-xl-2 col-lg-2 col-md-2 col-sm-3 d-flex justify-content-lg-end justify-content-md-center justify-content-xs-start">
                  <div className="brand-logo mb-2 inovice-logo">
                    <img className="preview-Logo" src={dynamicColorAndLogo?.CompanyLogoPath?`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`:logo} alt="" />
                  </div>
                </div>
              </div>
              <div className="row ">
                <div
                  className="col-md-4 col-sm-4 addborder border-bottom-0 border-end-0"
                  style={{ padding: "1%", border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}
                >
                  <div>
                    <h5>
                      {" "}
                      <strong>Customer Name</strong>
                    </h5>{" "}
                  </div>
                  <div>
                    <h5>{weeklyPreviewData.CustomerCompanyName}</h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      <strong>Store Location</strong>
                    </h5>{" "}
                  </div>
                  <div>
                    <h5>{weeklyPreviewData.StoreLocationName}</h5>
                  </div>
                </div>
                <div
                  className="col-md-4 col-sm-4 border-bottom-0 border-end-0 addborder"
                  style={{ padding: "1%", border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}
                >
                  <div>
                    {" "}
                    <h5>
                      <strong>Contact Name</strong>
                    </h5>{" "}
                  </div>
                  <div>
                    <h5>{`${weeklyPreviewData.ContactFirstNameFromtblContact??''} ${weeklyPreviewData.ContactlastNameFromtblContact??''}`}</h5>{" "}
                  </div>
                  <div>
                    <h5>
                      {" "}
                      <strong>Contact Company</strong>
                    </h5>{" "}
                  </div>
                  <div>
                    <h5>{weeklyPreviewData.ContactCompany}</h5>{" "}
                  </div>
                </div>
                <div
                  className="col-md-4 col-sm-4 border-bottom-0  addborder"
                  style={{ padding: "1%", border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`   }}
                >
                  <div>
                    {" "}
                    <h5>
                      <strong>By Regional Manager</strong>
                    </h5>{" "}
                  </div>
                  <div>
                    <h5>{weeklyPreviewData.RegionalManagerName}</h5>{" "}
                  </div>
                  <div>
                    {" "}
                    <h5>
                      <strong>Report for month of</strong>
                    </h5>{" "}
                  </div>
                  <div>
                    <h5>{weeklyPreviewData.ReportForWeekOf}</h5>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="pt-2 col-md-12 border-bottom-0  addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Didyoucheckthehealthofalltheplantsandtreesontheproperty ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Did you check the health of all the plants and trees on
                      the property?
                    </h5>
                  </div>

                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Didyouremovealldeceasedplantsortrees ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Did you remove all deceased plants or trees?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Didyoucheckirrigationtomakesureallplantsarereceivingwater ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Did you check irrigation to make sure all plants are
                      receiving water?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Didyoucheckirrigationclock ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Did you check irrigation clock?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Didyoufixallleaksorflooding ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Did you fix all leaks or flooding?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Weretheweedspulledorsprayed ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Were the weeds pulled or sprayed?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Wasthetrashanddebriscollectedandproperlydisposedof ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Was the trash and debris collected and properly disposed
                      of?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Isthemulchsufficient ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Is the mulch sufficient?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Didtheparkinglotgetcleaned ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Did the parking lot get cleaned?
                    </h5>
                  </div>
                  <div>
                    <h5>
                      {" "}
                      {weeklyPreviewData.Didthedoorentrywayplantersgetaddressed ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                      Did the door entry way planters get addressed?
                    </h5>
                  </div>
                </div>
                <div className=" pt-2 col-md-12 border-bottom-0 addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    {" "}
                    <h5>
                      <strong>Are there any areas of concern?</strong>
                    </h5>{" "}
                    <h6>{weeklyPreviewData.Arethereanyareasofconcern}</h6>
                  </div>
                </div>
                <div className="pt-2 col-md-12 border-bottom-0 addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    {" "}
                    <h5>
                      <strong>
                        Describe the mulch condition and if we need to add any:
                      </strong>
                    </h5>{" "}
                    <h6>
                      {
                        weeklyPreviewData.Describethemulchconditionandifweneedtoaddany
                      }
                    </h6>
                  </div>
                </div>
                <div className="pt-2 col-md-12 border-bottom-0 addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    {" "}
                    <h5>
                      <strong>Are there any areas of concern?</strong>
                    </h5>{" "}
                    <h6>{weeklyPreviewData.Arethereanyareasofconcern}</h6>
                  </div>
                </div>
                <div className=" pt-2 col-md-12 border-bottom-0 addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    {" "}
                    <h5>
                      <strong>Describe the drive-through condition:</strong>
                    </h5>{" "}
                    <h6>
                      {weeklyPreviewData.Describethedrivethroughcondition}
                    </h6>
                  </div>
                </div>
                <div className=" pt-2 col-md-12 border-bottom-0 addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    {" "}
                    <h5>
                      <strong>
                        Describe the perimeter of building including signage,
                        street facing planters, etc condition:
                      </strong>
                    </h5>{" "}
                    <h6>
                      {
                        weeklyPreviewData.Describetheperimeterofbuildingincludingsignagestreetfacingplantersetccondition
                      }
                    </h6>
                  </div>
                </div>
                <div className=" pt-2 col-md-12 border-bottom-0 addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    {" "}
                    <h5>
                      <strong>
                        Any additional notes management should be aware of:
                      </strong>
                    </h5>{" "}
                    <h6>
                      {
                        weeklyPreviewData.Anyadditionalnotesmanagementshouldbeawareof
                      }
                    </h6>
                  </div>
                </div>
                <div className=" pt-2 col-md-12  addborder" style={{ border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}` }}>
                  <div>
                    {" "}
                    <h5>
                      <strong>Signature of RC onsite manager:</strong>
                    </h5>{" "}
                    <div className=" text-right">
                      {weeklyPreviewData.FilePath ? (
                        <img
                          src={imagePathCorrector(weeklyPreviewData.FilePath)}
                          style={{
                            height: 100,
                            width: 200,
                          }}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div>
                    {" "}
                    <h5>
                      <strong>Name of RC onsite manager:</strong>
                    </h5>{" "}
                    <h6>{weeklyPreviewData.NameofRConsitemanager}</h6>
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
                    <div
                      key={index}
                      className="col-md-3 col-sm-4"
                      style={{
                        width: "46%",
                        margin: "1em",
                        position: "relative",
                      }}
                    >
                      <a
                        href={`${baseUrl}/${file.FilePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.FilePath ? (
                          <>
                            {file.FileName.includes(".pdf") ? (
                              <div className="d-flex justify-content-center align-items-center pdf-div">
                                <BsFiletypePdf color="#ff0000" fontSize="4em" />
                              </div>
                            ) : (
                              <img
                                src={`${baseUrl}/${file.FilePath}`}
                                className="weeklyimages"
                                alt="weeklyimages"
                              />
                            )}
                          </>
                        ) : (
                          <></>
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
                        {" "}
                        {file.FileName}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {showbuttons ? (
          <>
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
                          // navigate(`/weekly-reports/rising-canes`);
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
                      document={
                        <RisingCanesPdf
                          weeklyPreviewData={weeklyPreviewData}
                          files={files}
                          dynamicColorAndLogo={dynamicColorAndLogo}
                        />
                      }
                      fileName={`Monthly Report - ${weeklyPreviewData.StoreLocationName}.pdf`}
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
                    <div className="p-2 bd-highlight">
                      <Authorization allowTo={[1, 4, 5, 6]} hide>
                        <button
                          className="btn btn-sm btn-outline-secondary custom-csv-link  estm-action-btn"
                          onClick={() => {
                            navigate(
                              `/send-mail?title=${"Monthly Report- Raising Canes"}&mail=${contactEmail}&number=${''}`
                            );
                            setselectedPdf([])
                            //   sendEmail(
                            //     `/weekly-reports/weekly-report-preview?Customer=${customerParam}&Year=${yearParam}&Month=${MonthParam}`,
                            //     customerParam,
                            //     0,
                            //     false
                            //   );
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
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default RisingCanesPreview;
