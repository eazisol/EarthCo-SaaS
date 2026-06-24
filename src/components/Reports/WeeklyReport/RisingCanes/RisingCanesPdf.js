import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../../../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../../../assets/images/logo/earthco_logo.png";
import formatDate from "../../../../custom/FormatDate";
import formatAmount from "../../../../custom/FormatAmount";
import tick from "../../../../assets/images/Tick.png";
import square from "../../../../assets/images/square.png";
import { pdfLogoPath } from "../../../../apiConfig";
import { getFileName } from "../../../../custom/pdfLogoCorrect";

const Tick = () => <Image style={{ width: "10px" }} src={tick}></Image>;

const Square = () => <Image style={{ width: "8px" }} src={square}></Image>;
const RisingCanesPdf = ({ weeklyPreviewData, files ,dynamicColorAndLogo}) => {
  const imagePathCorrector = (string) => {
    if (string) {
      const correctedString = `https://image.earthcoapp.com/${string
        ?.replace("\\Uploading", "")
        ?.replace(/\\/g, "/")
        .replace(".jpg", ".png")
        .replace(".JPG", ".png")
        .replace(".jpeg", ".png")
        .replace("WeeklyReportRC", "WeeklyReportRC/Thumbnail")}`;
      console.log("correctedString", correctedString);
      return correctedString;
    } else {
      return "";
    }
  };
  const logoPath = dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  return (
     // <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="A4" orientation="portrait">
        <View style={[s.containerFluid]}>
          <View style={[s.row]}>
            <View style={[s.col2, { paddingRight: "80px" }]}></View>
            <View style={[s.col6, s.textCenter, { marginTop: "30px" }]}>
              <Text style={{fontSize : "17px"}}>Monthly Report - Raising Canes</Text>
            </View>

            <View style={[s.col4, s.textEnd, { paddingLeft: "40px" }]}>
              <Image style={{ width: "80px" }} src={imageUrl}></Image>
            </View>

            <View
              style={[
                s.col4,

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
                {weeklyPreviewData.CustomerCompanyName}
              </Text>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Store Location
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.StoreLocationName}
              </Text>
            </View>
            <View
              style={[
                s.col4,
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
                {`${weeklyPreviewData.ContactFirstNameFromtblContact??''} ${weeklyPreviewData.ContactlastNameFromtblContact??''}`}
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
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
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
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Report for month of
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {weeklyPreviewData.ReportForWeekOf}
              </Text>
            </View>

            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Didyoucheckthehealthofalltheplantsandtreesontheproperty ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Did you check the health of all the plants and trees on the
                property?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Didyouremovealldeceasedplantsortrees ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Did you remove all deceased plants or trees?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Didyoucheckirrigationtomakesureallplantsarereceivingwater ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Did you check irrigation to make sure all plants are receiving
                water?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Didyoucheckirrigationclock ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Did you check irrigation clock?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Didyoufixallleaksorflooding ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Did you fix all leaks or flooding?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Weretheweedspulledorsprayed ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Were the weeds pulled or sprayed?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Wasthetrashanddebriscollectedandproperlydisposedof ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Was the trash and debris collected and properly disposed of?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Isthemulchsufficient ? <Tick /> : <Square />}{" "}
                Is the mulch sufficient?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Didtheparkinglotgetcleaned ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Did the parking lot get cleaned?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                {weeklyPreviewData.Didthedoorentrywayplantersgetaddressed ? (
                  <Tick />
                ) : (
                  <Square />
                )}{" "}
                Did the door entry way planters get addressed?
              </Text>
            </View>
            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Are there any areas of concern?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 2 }]}>
                {weeklyPreviewData.Arethereanyareasofconcern}
              </Text>
            </View>
            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Describe the mulch condition and if we need to add any:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 2 }]}>
                {weeklyPreviewData.Describethemulchconditionandifweneedtoaddany}
              </Text>
            </View>
            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Are there any areas of concern?
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 2 }]}>
                {weeklyPreviewData.Arethereanyareasofconcern}
              </Text>
            </View>
            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Describe the drive-through condition:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 2 }]}>
                {weeklyPreviewData.Describethedrivethroughcondition}
              </Text>
            </View>
            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Describe the perimeter of building including signage, street
                facing planters, etc condition:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 2 }]}>
                {
                  weeklyPreviewData.Describetheperimeterofbuildingincludingsignagestreetfacingplantersetccondition
                }
              </Text>
            </View>

            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Any additional notes management should be aware of:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 2 }]}>
                {weeklyPreviewData.Anyadditionalnotesmanagementshouldbeawareof}
              </Text>
            </View>

            <View
              style={[
                s.col12,
                s.borderLight,
                {
                  marginTop: 0,
                    border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <View style={{width : "100%"}}>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Signature of RC onsite manager:
              </Text></View>
              <View style={{display : "flex", justifyContent : "flex-end", width : "100%",}}>
                
              <View style={{width : "30%", marginLeft : "300px"}}>
                    {weeklyPreviewData.FilePath ? (
                      <Image
                      src={imagePathCorrector(weeklyPreviewData.FilePath)?.replace("//Uploading/", "//")}
                      ></Image>
                    ) : (
                      <></>
                    )}
                  </View>
              </View>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Name of RC onsite manager:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 2 }]}>
                {weeklyPreviewData.NameofRConsitemanager}
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
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Photos:
              </Text>
             
            </View>
                {files.map((img, index) => (
                  <View style={[s.col6, {
                    marginRight: index % 2 === 0 ? "10px" : 0,
                    marginTop: "20px",
                    pageBreakAfter: (index + 1) % 6 === 0 ? "always" : "auto"
                  }]} key={index}>
                    {img.FilePath ? (
                      <Image
                        src={imagePathCorrector(img.FilePath)}
                        style={{width: "100%", height: "auto"}}
                      ></Image>
                    ) : (
                      <></>
                    )}
                  </View>
                ))}
          </View>
        </View>
      </Page>
    </Document>
  //</PDFViewer>
  );
};

export default RisingCanesPdf;
