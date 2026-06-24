import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import logo from "../../assets/images/logo/earthco_logo.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Print, Email, Download } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../context/AppData";
import html2pdf from "html2pdf.js";
import useSendEmail from "../Hooks/useSendEmail";
import EventPopups from "../Reusable/EventPopups";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import useFetchContactEmail from "../Hooks/useFetchContactEmail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { baseUrl, logoUrl  } from "../../apiConfig";
import imagePathCorrector from "../../custom/ImagePathCorrector";
import Authorization from "../Reusable/Authorization";
import { BsFiletypePdf } from "react-icons/bs";
import formatDate from "../../custom/FormatDate";
import SafetyReportPdf from "./SafetyReportPdf";
import { PreviewAddress } from "../../custom/PreviewAddress";
import useFetchCustomerEmail from "../Hooks/useFetchCustomerEmail";

const SafetyPreview = () => {
  const token = Cookies.get("token");
  const navigate = useNavigate();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const { toggleFullscreen, setToggleFullscreen, loggedInUser,companyInfo,setselectedPdf, dynamicColorAndLogo } =
    useContext(DataContext);
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
  const [files, setFiles] = useState([]);
    const { customerMail, fetchCustomerEmail } = useFetchCustomerEmail();
  
  const [safetyPreviewData, setsafetyPreviewData] = useState({});
  const regionalManager = `${
    safetyPreviewData?.AssignToFirstName == null
      ? "N/A"
      : `${safetyPreviewData?.AssignToFirstName} ${safetyPreviewData?.AssignToLastName}`
  }`;
  const getSafetyPreview = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/SafetyReport/GetSafetyReport?id=${idParam}`,
        { headers }
      );
      setsafetyPreviewData(res.data.Data || {});
      fetchCustomerEmail(res.data.Data.CustomerId);
      // fetchEmail(res.data.Data.ContactId);

      setFiles(res.data.FileData);
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

  useEffect(() => {
    if (URLToken) {
      Cookies.set("token", URLToken, { expires: 30 });
      setShowButtons(false);
    }
    getSafetyPreview();
  }, []);

  if (!safetyPreviewData || Object.keys(safetyPreviewData).length === 0||!dynamicColorAndLogo) {
    return (
      <div className="center-loader">
        <CircularProgress></CircularProgress>
      </div>
    );
  }

  // return(
  //   <SafetyReportPdf safetyPreviewData={safetyPreviewData} files={files}  companyInfo={companyInfo} />
  // )
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
                <div className="row mt-2 mb-2">
                  <div className="col-md-4 col-sm-4 ml-1">
                    {/* <h5 style={{ lineHeight: 1 }} className="mb-0">
                      {loggedInUser.CompanyName}
                    </h5>
                    <h6 style={{ lineHeight: 1.1 }} className="mb-0">
                      1225 East Wakeham Avenue
                      <br /> Santa Ana, California 92705 <br /> O 714.571.0455 F
                      714.571.0580 <br /> CL# C27 823185 / D49 1025053
                    </h6> */}
                     <PreviewAddress />
                  </div>
                  <div className="col-md-4 col-sm-4 text-center">
                    <h2>
                      <strong>Safety Report</strong>
                    </h2>
                  </div>
                  <div className="col-md-4 col-sm-4 text-right table-cell-align">
                   { dynamicColorAndLogo?.CompanyLogoPath?<img
                      className="preview-Logo"
                      style={{ width: "160px" }}
                      src={`${logoUrl}${dynamicColorAndLogo?.CompanyLogoPath}`}
                      alt=""
                    />:null}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="d-flex justify-content-between">
                  {/* Left Column */}
                  <div className="col-md-6 col-sm-6" style={{ padding: "1%" }}>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Customer Name:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.CustomerDisplayName || "N/A"}
                      </h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>City:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.City || "N/A"}
                      </h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Current Weather:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.CurrentWeather || "N/A"}
                      </h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Regional Manager:</strong>
                      </h5>

                      <h6 className="p-0 mb-0">{regionalManager}</h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Foreman:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.Foreman || "N/A"}
                      </h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Safety Inspector:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.SafetyInspector || "N/A"}
                      </h6>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div
                    className="col-md-6 col-sm-6 text-end"
                    style={{ padding: "1%", marginLeft: "10%" }}
                  >
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Report Date:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.ReportDate
                          ? new Date(
                              safetyPreviewData.ReportDate
                            ).toLocaleDateString("en-US")
                          : "N/A"}
                      </h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Report Time:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData?.ReportTime
                          ? new Date(
                              safetyPreviewData.ReportTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "N/A"}
                      </h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Truck #:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.TruckNo || "N/A"}
                      </h6>
                    </div>

                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Number of Crew:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {(safetyPreviewData.NumberOfCrew == 'undefined' ||
                        safetyPreviewData.NumberOfCrew == null)
                          ? "N/A"
                          : safetyPreviewData.NumberOfCrew}
                      </h6>
                    </div>
                    <div className="upperBox">
                      <h5 className="p-0 mb-0">
                        <strong>Status:</strong>
                      </h5>
                      <h6 className="p-0 mb-0">
                        {safetyPreviewData.Status || "N/A"}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              {/* Crew Inspection */}
              <div className="row">
                <div className="pt-2 col-md-7 border-bottom-0   ">
                  <table className="table mt-3 table-bordered">
                    <thead className="">
                      <tr className="preview-table-head preview-table-header">
                        <th className="text-center">
                          <strong>Crew Inspection</strong>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <tbody>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Did foreman have a morning 'huddle-up'?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {safetyPreviewData.ForemanHaveMorningHuddleUp === "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>

                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Does the crew have water in their water jugs?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {safetyPreviewData.CrewHaveWaterWaterJugs == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Does the foreman have 1.5 gallons of water per man?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.ForemanHaveFifteenGallonsOfWaterPerMan ==
                        "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Did the foreman identify, communicate, and correct
                        hazards?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.ForemanIdentifyCommunicateAndCorrectHazards ===
                        "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Does the foreman have the IIPP copy in truck?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {
                        safetyPreviewData.ForemanHaveTheIIPPCopyInTruck == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Does the foreman have a map to the nearest medical
                        clinic?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.ForemanHaveAMapToTheNearestMedicalClinic ==
                        "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Does the foreman have a first aid kit?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.ForemanHaveAFirstAidKit == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Does the crew have cones?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.CrewHaveCones == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Does the foreman know the weather?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.ForemanKnowTheWeather == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Did foreman conduct the latest Safety Tailgate Meeting?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.ForemanConductTheLatestSafetyTailgateMeeting ==
                        "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Did foreman give his crew correct rest and meal periods?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.ForemanGiveHisCrewCorrectRestAndMealPeriods ==
                        "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Crew is wearing safety vest?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.CrewIsWearingSafetyVest == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Safety Glass are on when needed?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.SafetyGlassAreOnWhenNeeded == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Gloves when needed?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.GlovesWhenNeeded == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Earplugs when needed?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.EarplugsWhenNeeded == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Truck is clean inside?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.TruckIsCleanInside == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        Truck is clean outside?
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {" "}
                        {safetyPreviewData.TruckIsCleanOutside == "yes"
                          ? "Yes"
                          : "No"}
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <div>
                          <h6 className="p-0  mb-0 ">
                            <strong>Job Comments / Issues</strong>
                          </h6>
                          <h6 className="p-0 mb-0 "  style={{ whiteSpace: "normal", wordWrap: "break-word"}}>
                            {safetyPreviewData.JobComments || "NA"}
                          </h6>
                        </div>
                      </td>
                    </tr>
                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                          width:"1px"
                        }}
                      >
                       
                          <h6 className="p-0  mb-0 ">
                            <strong>Action Item</strong>
                          </h6>
                          <h6 className="p-0 mb-0 " style={{ whiteSpace: "normal", wordWrap: "break-word"}}>
                            {safetyPreviewData.ActionItems || "NA"}
                          </h6>
                       
                      </td>
                    </tr>
                  </tbody>
                </div>
                {/* TRUCK INSPECTION  */}
                <div className="pt-2 col-md-5 border-bottom-0 ">
                  <table className="table  item-preview-table mt-3">
                    <thead className="">
                      <tr className="preview-table-head preview-table-header">
                        <th
                          style={{
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <strong>Truck Inspection</strong>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <tbody>
                    {[
                      { key: "EmergencyFlashers", label: "Emergency Flashers" },
                      { key: "WindshieldWipers", label: "Windshield Wipers" },
                      { key: "Horn", label: "Horn" },
                      { key: "Mirrors", label: "Mirrors" },
                      { key: "SeatBelts", label: "Seat Belts" },
                      {
                        key: "LicensePlateAndRegistration",
                        label: "License Plate and Registration",
                      },
                      { key: "FireExtinguisher", label: "Fire Extinguisher" },
                      { key: "Fluids", label: "Fluids Check" },
                      { key: "TurnSignals", label: "Turn Signals" },
                      { key: "Brakes", label: "Brakes" },
                      { key: "TruckTires", label: "Tires" },
                      { key: "SamsaraCamera", label: "Samsara Camera" },
                    ].map((item) => (
                      <tr
                        className="preview-table-row"
                        style={{ borderBottom: "1px solid red" }}
                        key={item.key}
                      >
                        <td
                          style={{
                            borderBottom: "1px solid #ddd",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {safetyPreviewData[item.key] ? (
                            <CheckBoxIcon />
                          ) : (
                            <CheckBoxOutlineBlankIcon />
                          )}
                          {item.label}
                        </td>
                      </tr>
                    ))}

                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <div>
                          <h6 className="p-0 mb-0">
                            <strong>Logo and overall truck appearance</strong>
                          </h6>
                          <h6 className="p-0 mb-0"  style={{ whiteSpace: "normal", wordWrap: "break-word"}}>
                            {safetyPreviewData.LogoAndOverallTruckAppearance ||
                              "N/A"}
                          </h6>
                        </div>
                      </td>
                    </tr>

                    <tr className="preview-table-row">
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <div>
                          <h6 className="p-0 mb-0">
                            <strong>
                              List any problems that need correction
                            </strong>
                          </h6>
                          <h6 className="p-0 mb-0"  style={{ whiteSpace: "normal", wordWrap: "break-word"}}>
                            {safetyPreviewData.TruckInspectionListAnyProblemsThatNeedCorrection ||
                              "N/A"}
                          </h6>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </div>
              </div>
              <div className="row" style={{ height: "auto" }}>
                {/* Trailer Inspection (skip if no trailer) */}
                <div className="pt-2 col-md-6  ">
                  <table className="table  item-preview-table mt-3">
                    <thead className="">
                      <tr className="preview-table-head preview-table-header">
                        <th
                          style={{
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <strong>
                            Trailer Inspection (skip if no trailer)
                          </strong>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          key: "TowHitchBallHasALock",
                          label: "Tow hitch ball has a lock",
                        },
                        {
                          key: "TrailerHasSafetyChainsConnectedToTruck",
                          label: "Trailer has safety chains connected to truck",
                        },
                        {
                          key: "TrailerIsConnectedCorrectly",
                          label: "Trailer is connected correctly",
                        },
                        {
                          key: "TurnSignalsFunctioningCorrectly",
                          label: "Turn Signals functioning correctly",
                        },
                        {
                          key: "ElectricalConnectionCorrect",
                          label: "Electrical connection correct",
                        },
                        {
                          key: "TrailerHasProperRegistrationAndLicensePlate",
                          label:
                            "Trailer has proper registration and license plate",
                        },
                        { key: "TrailerTires", label: "Tires" },
                      ].map((item, index) => (
                        <tr
                          className="preview-table-row"
                          style={{ borderBottom: "1px solid #ddd" }}
                          key={item.key}
                        >
                          <td
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {safetyPreviewData[item.key] ? (
                              <CheckBoxIcon />
                            ) : (
                              <CheckBoxOutlineBlankIcon />
                            )}
                            {item.label}
                          </td>
                        </tr>
                      ))}
                      <tr className="preview-table-row">
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <div>
                            <h6 className="p-0 mb-0">
                              <strong>
                                List any problems that need correction
                              </strong>
                            </h6>
                            <h6 className="p-0 mb-0"  style={{ whiteSpace: "normal", wordWrap: "break-word"}}>
                              {safetyPreviewData.TrailerInspectionListAnyProblemsThatNeedCorrection ||
                                "N/A"}
                            </h6>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Photo Section */}
                <div className="col-md-6" style={{ marginTop: "8px" }}>
                  <table className="table mt-3 table-bordered">
                    <thead className="">
                      <tr className="preview-table-head preview-table-header">
                        <th className="text-center">
                          <strong>Photos</strong>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <div className="row">
                    {files.map((file, index) => {
                      return (
                        <div
                          key={index}
                          className="col-md-3 col-sm-4"
                          style={{
                            width: "115px",
                            height: "110px",
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
                                    <BsFiletypePdf
                                      color="#ff0000"
                                      fontSize="4em"
                                    />
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
              {/* Signature  */}
              {/* Signature Section */}

              <div
                className="pt-2 col-md-12 "
                style={{ borderTop: "1px solid #ddd" }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  {/* Foreman Signature */}
                  <div style={{ width: "48%" }}>
                    <h5>
                      <strong>Foreman Signature:</strong>
                    </h5>
                    <div>
                      {safetyPreviewData.ForemanSignaturePath ? (
                        <img
                          src={imagePathCorrector(
                            safetyPreviewData.ForemanSignaturePath
                          )}
                          style={{
                            height: 100,
                            width: 200,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Safety Inspector Signature */}
                  <div style={{ width: "48%" }}>
                    <h5>
                      <strong>Safety Inspector Signature:</strong>
                    </h5>
                    <div>
                      {safetyPreviewData.SafetyInspectorSignaturePath ? (
                        <img
                          src={imagePathCorrector(
                            safetyPreviewData.SafetyInspectorSignaturePath
                          )}
                          style={{
                            height: 100,
                            width: 200,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
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
                        <SafetyReportPdf
                          safetyPreviewData={safetyPreviewData}
                          files={files}
                          companyInfo={companyInfo}
                          dynamicColorAndLogo={dynamicColorAndLogo}
                        />
                      }
                      fileName={`Safety Report -${
                        safetyPreviewData.TruckNo
                      }  ${formatDate(
                        safetyPreviewData.ReportDate,
                        false
                      )}.pdf`}
                      // fileName={`Monthly Report - ${safetyPreviewData.StoreLocationName}.pdf`}
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
                              `/send-mail?title=${"Safety Reports"}&mail=${customerMail}&number=${""}`
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

export default SafetyPreview;
