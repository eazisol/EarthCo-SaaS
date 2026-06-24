import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import { baseUrl } from "../../apiConfig";
import { pdfLogoPath } from "../../apiConfig";
import { getFileName } from "../../custom/pdfLogoCorrect";

const IrrigationAuditPdf = ({ controllerData = [] ,dynamicColorAndLogo}) => {
  const imagePathCorrector = (string) => {
    if (string) {
      const correctedString = `https://image.earthcoapp.com/${string
        ?.replace("\\Uploading", "")
        ?.replace(/\\/g, "/")
        .replace(".jpg", ".png")
        .replace(".jpeg", ".png")
        .replace("IrrigationAuditReport", "IrrigationAuditReport/Thumbnail")}`;
      // return `https://34.94.249.102/GetImages${(string)?.replace('\\Uploading', '')}`
      // const correctedString = "https://api.earthcoapp.com//Uploading/Punchlist/PunchlistFile0139.png"

      return correctedString;
      // return `https://i.ibb.co/zP2bw4q/6-Snapchat-17794545842.jpg`
    } else {
      return "";
    }
  };
  const logoPath = dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath?.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  return (
    //  <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="A4" orientation="landscape">
        <View style={[s.containerFluid]}>
          <View style={[s.row]}>
            <View style={[s.colXL4, { paddingRight: "80px" }]}></View>
            <View style={[s.colXL4, s.textCenter, { marginTop: "30px" }]}>
              <Text style={s.title}>Irrigation Audit Form </Text>
            </View>

            <View style={[s.colXL4, s.textEnd, { paddingLeft: "100px" }]}>
              {" "}
              <Image
                style={{ width: "100px", marginLeft: "50px" }}
                src={imageUrl}
              ></Image>
            </View>

            <View
              style={[
                s.colXL4,

                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Customer Name
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {controllerData[0]?.Data.CustomerDisplayName}
              </Text>
            </View>
            <View
              style={[
                s.colXL4,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Contact Name
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {controllerData[0]?.Data.ContactName}
              </Text>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Contact Company
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {controllerData[0]?.Data.ContactCompany}
              </Text>
            </View>
            <View
              style={[
                s.colXL4,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                By Regional Manager
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {controllerData[0]?.Data.RegionalManagerName}
              </Text>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Created
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {formatDate(controllerData[0]?.Data.CreatedDate, false)}
              </Text>
            </View>

            <View
              style={[
                s.colXL12,

                {
                  marginTop: " 10px",

                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.heading]}>Controller Name</Text>
              <Text style={[s.text]}>{controllerData[0]?.Data.Title}</Text>
            </View>

            <View
              style={[
                s.colXL1,

                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
                Station #
              </Text>
            </View>
            <View
              style={[
                s.colXL1,

                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
                Broken Valve?
              </Text>
            </View>
            <View
              style={[
                s.colXL1,

                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
                Broken Latrals?
              </Text>
            </View>
            <View
              style={[
                s.colXL1,

                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
                Broken Heads?
              </Text>
            </View>
            <View
              style={[
                s.colXL1,

                {
                  marginTop: " 10px",
                    border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
                How Many?
              </Text>
            </View>
            <View
              style={[
                s.colXL3,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
                Repairs Made Or Needed / Recommendations
              </Text>
            </View>

            <View
              style={[
                s.colXL2,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
              Controller Photo
              </Text>
            </View>
            <View
              style={[
                s.colXL2,
                s.borderLight,
                {
                  marginTop: " 10px",
                    border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text
                style={[
                  s.tblHeading,
                  { marginBottom: 8, marginTop: 8, color: "white" },
                ]}
              >
                Photo
              </Text>
            </View>

            {controllerData[0]?.ControllerData == null
              ? ""
              : controllerData?.map((item, index) => {
                  return (
                    <>
                      <View
                        style={[
                          s.borderLight,
                          { flexDirection: "row", flexWrap: "wrap" },
                        ]}
                      >
                        <View
                          style={[
                            s.colXL1,
                            s.borderLight,

                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblText,
                              { marginBottom: 4, marginTop: 0 },
                            ]}
                          >
                            {item?.ControllerData?.ControllerAuditReportId ||
                              ""}
                          </Text>
                        </View>
                        <View
                          style={[
                            s.colXL1,
                            s.borderLight,

                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblText,
                              { marginBottom: 4, marginTop: 0 },
                            ]}
                          >
                            {item?.ControllerData.BrokenValve ? "Yes" : "No"}
                          </Text>
                        </View>
                        <View
                          style={[
                            s.colXL1,
                            s.borderLight,

                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblText,
                              { marginBottom: 4, marginTop: 0 },
                            ]}
                          >
                            {item?.ControllerData.BrokenLaterals ? "Yes" : "No"}
                          </Text>
                        </View>
                        <View
                          style={[
                            s.colXL1,
                            s.borderLight,

                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblText,
                              { marginBottom: 4, marginTop: 0 },
                            ]}
                          >
                            {item?.ControllerData.BrokenHeads ? "Yes" : "No"}
                          </Text>
                        </View>
                        <View
                          style={[
                            s.colXL1,
                            s.borderLight,

                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblText,
                              { marginBottom: 4, marginTop: 0 },
                            ]}
                          >
                            {item?.ControllerData.HowMany}
                          </Text>
                        </View>
                        <View
                          style={[
                            s.colXL3,
                            s.borderLight,
                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblText,
                              { marginBottom: 4, marginTop: 0 },
                            ]}
                          >
                            {item?.ControllerData.RepairMadeOrNeeded}
                          </Text>
                        </View>

                        <View
                          style={[
                            s.colXL2,
                            s.borderLight,
                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          {item?.ControllerData.ControllerPhotoPath ? (
                            <Image
                              src={imagePathCorrector(
                                item?.ControllerData.ControllerPhotoPath
                              )}
                            ></Image>
                          ) : (
                            <></>
                          )}
                        </View>
                        <View
                          style={[
                            s.colXL2,
                            s.borderLight,
                            {
                              paddingLeft: " 10px",
                            },
                          ]}
                        >
                          {item?.ControllerData.PhotoPath ? (
                            <Image
                              src={imagePathCorrector(
                                item?.ControllerData.PhotoPath
                              )}
                            ></Image>
                          ) : (
                            <></>
                          )}
                        </View>
                      </View>
                    </>
                  );
                })}
          </View>
        </View>
      </Page>
    </Document>
    //    </PDFViewer>
  );
};

export default IrrigationAuditPdf;
