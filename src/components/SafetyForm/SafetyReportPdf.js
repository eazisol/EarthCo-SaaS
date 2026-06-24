import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import { formatTimeToCustomString } from "../Reusable/Utils";
import tick from "../../assets/images/Tick.png";
import square from "../../assets/images/square.png";
import { PdfAddress } from "../../custom/PreviewAddress";
import { pdfLogoPath } from "../../apiConfig";
import { getFileName } from "../../custom/pdfLogoCorrect";
const Tick = () => <Image style={{ width: "10px" }} src={tick}></Image>;

const Square = () => <Image style={{ width: "8px" }} src={square}></Image>;
const SafetyReportPdf = ({ safetyPreviewData, files,companyInfo ,dynamicColorAndLogo}) => {
  const firstName = safetyPreviewData?.AssignToFirstName;
  const lastName = safetyPreviewData?.AssignToLastName;
  const logoPath = dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  const regionalManager =
    !firstName || firstName === "null"
      ? "N/A"
      : `${firstName} ${lastName ?? ""}`.trim();

  const imagePathCorrector = (string) => {
    if (string) {
      const correctedString = `https://image.earthcoapp.com/${string
        ?.replace("\\Uploading", "")
        ?.replace(/\\/g, "/")
        .replace(".jpg", ".png")
        .replace(".jpeg", ".png")
        .replace("SafetyReport", "SafetyReport/Thumbnail")}`;
      // .replace("WeeklyReportRC", "WeeklyReportRC/Thumbnail")}`;
      // return `https://34.94.249.102/GetImages${(string)?.replace('\\Uploading', '')}`
      // const correctedString = "https://api.earthcoapp.com//Uploading/Punchlist/PunchlistFile0139.png"

      return correctedString;
      // return `https://i.ibb.co/zP2bw4q/6-Snapchat-17794545842.jpg`
    } else {
      return "";
    }
  };
  const signaturePathCorrector = (string) => {
    if (string) {
      const correctedString = `https://image.earthcoapp.com/${string
        .replace(/^\/?Uploading\//, "") // Remove leading "/Uploading/"
        .replace(/\\/g, "/") // Replace backslashes with forward slashes
        .replace(".jpg", ".png") // Convert .jpg to .png
        .replace(".jpeg", ".png")}`; // Convert .jpeg to .png

      return correctedString;
    } else {
      return "";
    }
  };
  const InfoRow = ({ label, value }) => (
    <View
      style={{ display: "flex", flexDirection: "row", textAlign: "center" }}
    >
      <Text style={s.textBold}>{label}:</Text>
      <Text style={[s.text, { marginLeft: 3 }]}>{value}</Text>
    </View>
  );
  const crewInspectionData = [
    {
      question: "Did foreman have a morning 'huddle-up'?",
      answer: safetyPreviewData?.ForemanHaveMorningHuddleUp,
    },
    {
      question: "Does the crew have water in their water jugs?",
      answer: safetyPreviewData?.CrewHaveWaterWaterJugs,
    },
    {
      question: "Does the foreman have 1.5 gallons of water per man?",
      answer: safetyPreviewData?.ForemanHaveFifteenGallonsOfWaterPerMan,
    },
    {
      question: "Did the foreman identify, communicate, and correct hazards?",
      answer: safetyPreviewData?.ForemanIdentifyCommunicateAndCorrectHazards,
    },
    {
      question: "Does the foreman have the IIPP copy in truck?",
      answer: safetyPreviewData?.ForemanHaveTheIIPPCopyInTruck,
    },
    {
      question: "Does the foreman have a map to the nearest medical clinic?",
      answer: safetyPreviewData?.ForemanHaveAMapToTheNearestMedicalClinic,
    },
    {
      question: "Does the foreman have a first aid kit?",
      answer: safetyPreviewData?.ForemanHaveAFirstAidKit,
    },
    {
      question: "Does the crew have cones?",
      answer: safetyPreviewData?.CrewHaveCones,
    },
    {
      question: "Does the foreman know the weather?",
      answer: safetyPreviewData?.ForemanKnowTheWeather,
    },
    {
      question: "Did foreman conduct the latest Safety Tailgate Meeting?",
      answer: safetyPreviewData?.ForemanConductTheLatestSafetyTailgateMeeting,
    },
    {
      question: "Did foreman give his crew correct rest and meal periods?",
      answer: safetyPreviewData?.ForemanGiveHisCrewCorrectRestAndMealPeriods,
    },
    {
      question: "Power tools are in good condition?",
      answer: safetyPreviewData?.PowerToolsAreInGoodCondition,
    },
    {
      question: "Crew is wearing safety vest?",
      answer: safetyPreviewData?.CrewIsWearingSafetyVest,
    },
    {
      question: "Safety Glass are on when needed?",
      answer: safetyPreviewData?.SafetyGlassAreOnWhenNeeded,
    },
    {
      question: "Gloves when needed?",
      answer: safetyPreviewData?.GlovesWhenNeeded,
    },
    {
      question: "Earplugs when needed?",
      answer: safetyPreviewData?.EarplugsWhenNeeded,
    },
    {
      question: "Truck is clean inside?",
      answer: safetyPreviewData?.TruckIsCleanInside,
    },
    {
      question: "Truck is clean outside?",
      answer: safetyPreviewData?.TruckIsCleanOutside,
    },
  ];

  const truckInspectionData = [
    {
      label: "Emergency Flashers",
      checked: safetyPreviewData?.EmergencyFlashers,
    },
    {
      label: "Windshield Wipers",
      checked: safetyPreviewData?.WindshieldWipers,
    },
    { label: "Horn", checked: safetyPreviewData?.Horn },
    { label: "Mirrors", checked: safetyPreviewData?.Mirrors },
    { label: "Seat Belts", checked: safetyPreviewData?.SeatBelts },
    {
      label: "License Plate and Registration",
      checked: safetyPreviewData?.LicensePlateAndRegistration,
    },
    {
      label: "Fire Extinguisher",
      checked: safetyPreviewData?.FireExtinguisher,
    },
    { label: "Fluids Check", checked: safetyPreviewData?.Fluids },
    { label: "Turn Signals", checked: safetyPreviewData?.TurnSignals },
    { label: "Brakes", checked: safetyPreviewData?.Brakes },
    { label: "Tires", checked: safetyPreviewData?.TruckTires },
    { label: "Samsara Camera", checked: safetyPreviewData?.SamsaraCamera },
  ];
  const TrailerInspectionOption = [
    {
      label: "Tow hitch ball has a lock",
      checked: safetyPreviewData?.TowHitchBallHasALock,
    },
    {
      label: "Trailer has safety chains connected to truck",
      checked: safetyPreviewData?.TrailerHasSafetyChainsConnectedToTruck,
    },
    {
      label: "Trailer is connected correctly",
      checked: safetyPreviewData?.TrailerIsConnectedCorrectly,
    },
  ];
  const TrailerInspectionOptionTwo = [
    {
      label: "Turn Signals functioning correctly",
      checked: safetyPreviewData?.TurnSignalsFunctioningCorrectly,
    },
    {
      label: "Electrical connection correct",
      checked: safetyPreviewData?.ElectricalConnectionCorrect,
    },
    {
      label: "Trailer has proper registration and license plate",
      checked: safetyPreviewData?.TrailerHasProperRegistrationAndLicensePlate,
    },
    { label: "Tires", checked: safetyPreviewData?.TrailerTires },
  ];

  return (
    // <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="LETTER" orientation="portrait">
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <View
            style={[
              s.containerFluid,
              {
                marginHorizontal: 0,
              },
            ]}
          >
            <View style={[s.row]}>
              <View style={[s.col4Letter]}>
                {/* <Text style={s.text}>EarthCo</Text> */}

                {/* <Text style={[s.text, { marginTop: 2 }]}>
                    1225 East Wakeham Avenue
                  </Text>

                  <Text style={s.text}>Santa Ana, California 92705</Text>
                  <Text style={s.text}>O 714.571.0455 F 714.571.0580</Text>
                  <Text style={s.text}>CL# C27 823185 / D49 1025053</Text> */}
                 <PdfAddress companyInfo={companyInfo} license={true}/>
                   
              </View>
              <View style={[s.col4Letter, s.textCenter, { marginTop: "0px" }]}>
                <Text
                  style={[s.textBold, { fontSize: "16px", fontWeight: "bold" }]}
                >
                  Safety Report
                </Text>
              </View>

              <View style={[s.col4Letter, s.textCenter]}>
                <Image
                  style={{ width: "130px", marginLeft: "60px" }}
                  src={imageUrl}
                ></Image>
              </View>
              <View style={[s.col8Letter, { marginTop: "30px" }]}>
                <InfoRow
                  label="Customer Name"
                  value={safetyPreviewData.CustomerCompanyName}
                />
                <InfoRow label="City" value={safetyPreviewData.City} />
                <InfoRow
                  label="Current Weather"
                  value={safetyPreviewData.CurrentWeather}
                />
                <InfoRow
                  label="Regional Manager"
                  value={regionalManager}
                />
                <InfoRow label="Foreman" value={safetyPreviewData.Foreman} />
                <InfoRow
                  label="Safety Inspector"
                  value={safetyPreviewData.SafetyInspector}
                />
              </View>

              <View style={[s.col4Letter, { marginTop: "30px" }]}>
                <InfoRow
                  label="Report Date"
                  value={formatDate(safetyPreviewData.ReportDate, false)}
                />
                <InfoRow
                  label="Report Time"
                  value={formatTimeToCustomString(safetyPreviewData.ReportTime)}
                />

                <InfoRow
                  label="Number of Crew"
                  value={safetyPreviewData.NumberOfCrew== 'undefined' ||
                        safetyPreviewData.NumberOfCrew == null? ""
                          : safetyPreviewData.NumberOfCrew}
                />
                <InfoRow label="Truck #" value={safetyPreviewData.TruckNo} />
                <InfoRow label="Status" value={safetyPreviewData.Status} />
              </View>
              <View
                style={{ flexDirection: "row", marginTop: 20, width: "100%" }}
              >
                {/* Crew Inspection Column */}
                <View
                  style={{
                    width: "60%",
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                  }}
                >
                  <Text
                    style={[
                      s.tblHeading,
                      {
                        backgroundColor: "#e6e6e6",
                        padding: 7,
                        textAlign: "center",
                        marginTop: 0,
                      },
                    ]}
                  >
                    Crew Inspection
                  </Text>

                  {crewInspectionData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        borderBottomWidth: 1,
                        borderBottomColor: "#ccc",
                        paddingVertical: 2,
                        paddingHorizontal: 5,
                      }}
                    >
                      <Text style={[s.tblText, { flex: 1 }]}>
                        {item.question}
                      </Text>
                      <Text style={[s.tblText, { fontWeight: "bold" }]}>
                        {item.answer == "yes" ? "Yes" : "No"}
                      </Text>
                    </View>
                  ))}
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#ccc",
                      paddingVertical: 2,
                      paddingHorizontal: 5,
                    }}
                  >
                    <Text style={[s.tblTextSafety]}>Job Comments / Issues</Text>
                    <Text
                      style={[s.tblText, { fontWeight: "bold", marginTop: 5 }]}
                    >
                      {safetyPreviewData?.JobComments
                        ? safetyPreviewData?.JobComments
                        : "N/A"}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#ccc",
                      paddingVertical: 2,
                      paddingHorizontal: 5,
                    }}
                  >
                    <Text style={[s.tblTextSafety]}>Action Item</Text>
                    <Text
                      style={[s.tblText, { fontWeight: "bold", marginTop: 5 }]}
                    >
                      {safetyPreviewData?.ActionItems
                        ? safetyPreviewData?.ActionItems
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Truck Inspection Column */}
                <View
                  style={{
                    width: "40%",
                    marginLeft: 10,
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderTopWidth: 0,
                  }}
                >
                  <Text
                    style={[
                      s.tblHeading,
                      {
                        backgroundColor: "#e6e6e6",
                        padding: 7,
                        textAlign: "center",
                        marginTop: 0,
                      },
                    ]}
                  >
                    Truck Inspection
                  </Text>

                  {truckInspectionData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 3,
                        borderBottomWidth: 1,
                        borderBottomColor: "#ccc",
                      }}
                    >
                      <Text
                        style={[
                          s.tblText,
                          { fontWeight: "bold", paddingLeft: 5 },
                        ]}
                      >
                        {item.checked ? <Tick /> : <Square />} {/* Checkbox */}
                      </Text>
                      <Text style={[s.tblText]}>{item.label}</Text>
                    </View>
                  ))}
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#ccc",
                      paddingVertical: 4,
                      paddingLeft: 5,
                    }}
                  >
                    <Text style={[s.tblTextSafety]}>
                      Logo and overall truck appearance
                    </Text>
                    <Text
                      style={[s.tblText, { fontWeight: "bold", marginTop: 5 }]}
                    >
                      {safetyPreviewData?.LogoAndOverallTruckAppearance
                        ? safetyPreviewData?.LogoAndOverallTruckAppearance
                        : "N/A"}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#ccc",
                      paddingVertical: 4,
                      paddingLeft: 5,
                    }}
                  >
                    <Text style={[s.tblTextSafety]}>
                      List any problems that need correction
                    </Text>
                    <Text
                      style={[s.tblText, { fontWeight: "bold", marginTop: 5 }]}
                    >
                      {safetyPreviewData?.TruckInspectionListAnyProblemsThatNeedCorrection
                        ? safetyPreviewData?.TruckInspectionListAnyProblemsThatNeedCorrection
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{ flexDirection: "row", marginTop: 20, width: "100%" }}
              >
                {/* Trailer Inspection (skip if no trailer) Column */}
                <View style={{ width: "100%" }}>
                  <Text
                    style={[
                      s.tblHeading,
                      {
                        backgroundColor: "#e6e6e6",
                        padding: 7,
                        textAlign: "center",
                        marginTop: 0,
                      },
                    ]}
                  >
                    Trailer Inspection (skip if no trailer)
                  </Text>
                  {TrailerInspectionOption.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 3,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderTopWidth: 0,
                        marginTop: index == 0 ? -4 : 0,
                      }}
                    >
                      <Text
                        style={[
                          s.tblText,
                          {
                            fontWeight: "bold",
                            paddingLeft: 5,
                            marginRight: 5,
                          },
                        ]}
                      >
                        {item.checked ? <Tick /> : <Square />} {/* Checkbox */}
                      </Text>
                      <Text style={[s.tblText]}>{item.label}</Text>
                    </View>
                  ))}
                  <View break style={{ marginTop: 15 }} />

                  {TrailerInspectionOptionTwo.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 3,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderBottomWidth: 0,
                      }}
                    >
                      <Text
                        style={[
                          s.tblText,
                          {
                            fontWeight: "bold",
                            paddingLeft: 5,
                            marginRight: 5,
                          },
                        ]}
                      >
                        {item.checked ? <Tick /> : <Square />} {/* Checkbox */}
                      </Text>
                      <Text style={[s.tblText]}>{item.label}</Text>
                    </View>
                  ))}
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      paddingVertical: 2,
                      paddingHorizontal: 5,
                    }}
                  >
                    <Text style={[s.tblTextSafety]}>
                      List any problems that need correction
                    </Text>
                    <Text
                      style={[s.tblText, { fontWeight: "bold", marginTop: 5 }]}
                    >
                      {safetyPreviewData?.TrailerInspectionListAnyProblemsThatNeedCorrection
                        ? safetyPreviewData?.TrailerInspectionListAnyProblemsThatNeedCorrection
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* PHOTOS */}
              <View
                style={{ flexDirection: "row", marginTop: 20, width: "100%" }}
              >
                <View style={{ width: "100%" }}>
                  <Text
                    style={[
                      s.tblHeading,
                      {
                        backgroundColor: "#e6e6e6",
                        padding: 7,
                        textAlign: "center",
                        marginTop: 0,
                      },
                    ]}
                  >
                    Photos
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
  {files.map((img, index) => (
    <View
      style={[s.col3, { marginRight: 10, marginTop: 10 }]}
      key={index}
    >
      {img.FilePath ? (
        <Image
          source={{ uri: imagePathCorrector(img.FilePath) }}
          style={{ width: '100%',minHeight:100}}
          resizeMode="contain"
        />
      ) : null}
    </View>
  ))}
</View>

                </View>
              </View>
              {/* SIGNATURE */}
              <View
                style={{ flexDirection: "row", marginTop: 20, width: "100%" }}
              >
                {/* Foreman Signature */}
                <View
                  style={{
                    width: "50%",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRightWidth: 0,
                  }}
                >
                  <Text
                    style={[
                      s.tblHeading,
                      {
                        backgroundColor: "#e6e6e6",
                        padding: 7,
                        textAlign: "center",
                        marginTop: 0,
                      },
                    ]}
                  >
                    Foreman Signature
                  </Text>

                  <View style={{ alignItems: "center" }}>
                    {safetyPreviewData.ForemanSignaturePath ? (
                      <Image
                        source={{
                          uri: signaturePathCorrector(
                            safetyPreviewData.ForemanSignaturePath
                          ),
                        }}
                        style={{ width: 100, height: 50 }}
                      />
                    ) : null}
                  </View>
                </View>

                {/* Safety Inspector Signature */}
                <View
                  style={{ width: "50%", borderWidth: 1, borderColor: "#ccc" }}
                >
                  <Text
                    style={[
                      s.tblHeading,
                      {
                        backgroundColor: "#e6e6e6",
                        padding: 7,
                        textAlign: "center",
                        marginTop: 0,
                      },
                    ]}
                  >
                    Safety Inspector Signature
                  </Text>

                  <View style={{ alignItems: "center" }}>
                    {safetyPreviewData.SafetyInspectorSignaturePath ? (
                      <Image
                        source={{
                          uri: signaturePathCorrector(
                            safetyPreviewData.SafetyInspectorSignaturePath
                          ),
                        }}
                        style={{ width: 100, height: 50 }}
                      />
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  //  </PDFViewer> 
  );
};

export default SafetyReportPdf;
