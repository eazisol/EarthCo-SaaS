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


const AuditPdf = ({ irrDetails, CustomerName ,dynamicColorAndLogo}) => {
  const imagePathCorrector = (string) => {
    if (string) {
      const correctedString = `https://image.earthcoapp.com/${string
        ?.replace("\\Uploading", "")
        ?.replace(/\\/g, "/")
        .replace(".jpg", ".png")
        .replace(".jpeg", ".png")
        .replace("Irrigation", "Irrigation/Thumbnail")}`;
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
    // <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="A4" orientation="landscape" style={{marginTop : "40px"}}>
        <View style={[s.containerFluid]}>
          <View style={[s.row]}>
            <View style={[s.colXL4, { paddingRight: "80px" }]}>
              <Image style={{ width: "100px" }} src={imageUrl}></Image>
            </View>
            <View style={[s.colXL4, s.textCenter, { marginTop: "30px" }]}>
              <Text style={s.title}>Irrigation Audit</Text>
            </View>

            <View style={[s.colXL4]}></View>

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
                {CustomerName}
              </Text>
            </View>
            <View
              style={[
                s.colXL8,

                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Created
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {formatDate(irrDetails?.IrrigationData.CreatedDate, false)}
              </Text>
            </View>

            <View
              style={[
                s.colXL3,

                {
                  marginTop: " 10px",
                  border: `1px solid ${dynamicColorAndLogo?.PrimeryColor}`,
                  paddingLeft: " 10px",
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 8, marginTop: 8 }]}>
                Controller
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
              <Text style={[s.tblHeading, { marginBottom: 8, marginTop: 8 }]}>
                Meter Info
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
                  backgroundColor: dynamicColorAndLogo?.PrimeryColor,
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 8, marginTop: 8 }]}>
                Valve
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
              <Text style={[s.tblHeading, { marginBottom: 8, marginTop: 8 }]}>
                Repairs / Upgrades
              </Text>
            </View>

            {irrDetails.ControllerData.map((item, index) => {
              return (
               
                  <View
                    style={[
                      s.borderLight,
                      { flexDirection: "row", flexWrap: "wrap" },
                    ]}
                    key={index}
                    wrap={false}
                  >
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
                          s.tblHeading,
                          { marginBottom: 0, marginTop: 8 },
                        ]}
                      >
                        Controller Number:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.ControllerNumber}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Controller Make/ Model:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.MakeAndModel}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Serial:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.SerialNumber}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Location:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.LoacationClosestAddress}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Satellite Based?:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.isSatelliteBased ? "yes" : "No"}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Type of Water:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.TypeofWater}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Controller photo:
                      </Text>
                      {item.ControllerPhotoPath ? (
                        <Image
                          src={imagePathCorrector(item.ControllerPhotoPath)}
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
                      <Text
                        style={[
                          s.tblHeading,
                          { marginBottom: 0, marginTop: 8 },
                        ]}
                      >
                        Meter Number:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.MeterNumber}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Meter Size:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 0, marginTop: 0 }]}
                      >
                        {item.MeterSize}
                      </Text>
                    </View>

                    <View
                      style={[
                        s.colXL4,
                        s.borderLight,
                        {
                          paddingLeft: " 10px",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.tblHeading,
                          { marginBottom: 0, marginTop: 8 },
                        ]}
                      >
                        Master Valve?:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.MakeAndModel}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Flow Sensor?:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      ></Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        No. of Valves:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.NumberofValves}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        No. Stations:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.NumberofStation}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Number of Broken Main Lines:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.NumberofBrokenMainLines}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Type of Valves
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.TypeofValves}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Number of Leaking Valves:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.LeakingValves}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Number Malfunctioning:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.MalfunctioningValves}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Number of Broken Lateral Lines:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.NumberofBrokenLateralLines}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Number of Broken Heads:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 0, marginTop: 0 }]}
                      >
                        {item.NumberofBrokenHeads}
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
                          s.tblHeading,
                          { marginBottom: 0, marginTop: 8 },
                        ]}
                      >
                        Repairs:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.RepairsMade}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        Upgrades:
                      </Text>
                      <Text
                        style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}
                      >
                        {item.UpgradesMade}
                      </Text>
                      <Text style={[s.tblHeading, { marginBottom: 0 }]}>
                        photo:
                      </Text>
                      {item.PhotoPath ? (
                        <Image src={imagePathCorrector(item.PhotoPath)}></Image>
                      ) : (
                        <></>
                      )}
                    </View>
                  </View>
                  
               
              );
            })}
          </View>
        </View>
      </Page>
    </Document>
    // {/* </PDFViewer> */}
  );
};

export default AuditPdf;
