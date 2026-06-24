import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../../assets/images/logo/earthco_logo.png";
import formatDate from "../../../custom/FormatDate";
import formatAmount from "../../../custom/FormatAmount";
import { pdfLogoPath } from "../../../apiConfig";
import { getFileName } from "../../../custom/pdfLogoCorrect";

const WeeklyReportPdf = ({ weeklyPreviewData, files = []}) => {
  const imagePathCorrector = (string) => {
    if (string) {
      const correctedString = `https://image.earthcoapp.com/${string
        ?.replace("\\Uploading", "")
        ?.replace(/\\/g, "/")
        .replace(".jpg", ".png")
        .replace(".jpeg", ".png")
        .replace("WeeklyReport", "WeeklyReport/Thumbnail")}`;
      // return `https://34.94.249.102/GetImages${(string)?.replace('\\Uploading', '')}`
      // const correctedString = "https://api.earthcoapp.com//Uploading/Punchlist/PunchlistFile0139.png"
     
      return correctedString;
      // return `https://i.ibb.co/zP2bw4q/6-Snapchat-17794545842.jpg`
    } else {
      return "";
    }
  };
  const logoPath = weeklyPreviewData?.dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  return (
    //  <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="A4" orientation="portrait">
        <View style={[s.containerFluid]}>
          <View style={[s.row]}>
            <View style={[s.col4, { paddingRight: "80px" }]}></View>
            <View style={[s.col4, s.textCenter, { marginTop: "30px" }]}>
              <Text style={s.title}>Weekly Report</Text>
            </View>

            <View style={[s.col4, s.textEnd, { paddingLeft: "40px" }]}>
              {" "}
              <Image style={{ width: "80px" }} src={imageUrl}></Image>
            </View>

            <View
              style={[
                s.col4,

                {
                  marginTop: " 10px",
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Customer Name
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.name}
              </Text>
            </View>
            <View
              style={[
                s.col4,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Contact Name
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.ContactName}
              </Text>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Contact Company
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.ContactCompany}
              </Text>
            </View>
            <View
              style={[
                s.col4,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                By Regional Manager
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.RegionalManagerName}
              </Text>
            </View>

            <View
              style={[
                s.col4,

                {
                  marginTop: " 10px",
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Report for Week of:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {formatDate(weeklyPreviewData.ReportForWeekOf, false)}
              </Text>
            </View>
            <View
              style={[
                s.col4,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                This week rotation:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.Thisweekrotation}
              </Text>
            </View>
            <View
              style={[
                s.col4,
                s.borderLight,
                {
                  marginTop: " 10px",
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Next weeks rotation:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.Nextweekrotation}
              </Text>
            </View>

            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  borderTop: `none`,
                  marginTop: 0,
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Service Request Notes:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
              {weeklyPreviewData.ServiceRequests}
           
              </Text>
            </View>

            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  borderTop: `none`,
                  marginTop: 0,
                  border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Proposal Notes:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.ProposalsNotes}
              </Text>
            </View>

            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  borderTop: `none`,
                  marginTop: 0,
                    border: `1px solid ${weeklyPreviewData?.dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Notes:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.Notes}
              </Text>
            </View>

            <View
              style={[
                s.col12,

                {
                  marginTop: 0,

                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                Photos:
              </Text>
            </View>
            {/* {files.map((file, index) => (
              <View style={[s.col5, {marginRight : "10px"}]} key={index}>
                <Image src={imagePathCorrector(file.FilePath)} />
              </View>
            ))} */}
            {Array.from({ length: Math.ceil(files.length / 2) }).map(
              (_, rowIndex) => (
                <View
                  key={rowIndex}
                  style={{
                    flexDirection: "row",
                    marginTop: rowIndex == 0 ? 0 : 10,
                  }}
                >
                  {files
                    .slice(rowIndex * 2, rowIndex * 2 + 2)
                    .map((file, colIndex) => {
                      const imageIndex = rowIndex * 2 + colIndex;
                      return (
                        <View
                          key={colIndex}
                          style={{
                            marginRight: colIndex === 0 ? 10 : 0,
                            // marginTop: 10
                          }}
                        >
                          <Image
                            src={imagePathCorrector(file.FilePath)}
                            style={{
                              width: 250,
                              height: 245,
                              objectFit: "cover",
                            }}
                          />
                        </View>
                      );
                    })}
                </View>
              )
            )}
          </View>
        </View>
      </Page>
    </Document>
    //  </PDFViewer>
  );
};

export default WeeklyReportPdf;
