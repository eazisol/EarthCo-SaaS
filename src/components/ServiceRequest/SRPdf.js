import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import { PdfAddress } from "../../custom/PreviewAddress";
import { pdfLogoPath } from "../../apiConfig";
import { getFileName } from "../../custom/pdfLogoCorrect";

const SRPdf = ({ data }) => {
  data = data || { Data: {} };

  
  const logoPath = data?.dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  
  return (
    // <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="A4" orientation="portrait">
        <View style={[s.containerFluid]}>
          <View style={[s.row]}>
            <View style={[s.col4]}>
              {/* <Text style={s.text}>Earthco Landscape</Text>

                <Text style={s.text}>1225 East Wakeham Avenue</Text>

                <Text style={s.text}>Santa Ana, California 92705</Text>
                <Text style={s.text}>Phone: 714.571.0455</Text>
                <Text style={s.text}>www.earthcompany.org</Text> */}
                <PdfAddress companyInfo={data?.companyInfo} website={true}/>
                
            </View>
            <View style={[s.col4, s.textCenter, { marginTop: "20px" }]}></View>

            <View style={[s.col4, s.textEnd, { marginTop: "10px" }]}>
              <Image
                style={{ width: "130px", marginLeft: "50px" }}
                src={imageUrl}
              ></Image>
            </View>
            <View style={[s.col12, s.textCenter]}>
              <Text style={s.title}>Service Request</Text>
            </View>
            <View style={[s.col3, { marginTop: "10px" }]}>
              <View
                style={{
                  marginTop: " 10px",
                  backgroundColor: "#e6e6e6",
                  paddingLeft: "10px",
                }}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  Requested By:
                </Text>
              </View>
            </View>
            <View style={[s.col3, { marginTop: "10px" }]}>
              <View
                style={{
                  marginTop: " 10px",
                  backgroundColor: "#e6e6e6",
                  paddingLeft: "10px",
                }}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  Service Location:
                </Text>
              </View>
            </View>
            <View style={[s.col6, s.textCenter, { marginTop: "20px" }]}>
              <Text style={[s.text, { fontWeight: "bold" }]}>
                Date Created: {formatDate(data?.Data?.CreatedDate, false)}
              </Text>
            </View>
            <View style={[s.row, { marginTop: "0px" }]}>
              <View
                style={[
                  s.col3,
                  { backgroundColor: "#E9E9E9", paddingLeft: "10px" },
                ]}
              >
                <Text style={s.tblText}>{data?.name}</Text>
                <Text style={s.tblText}>{data?.Data?.ContactCompanyName}</Text>
              </View>
              <View
                style={[
                  s.col3,
                  { backgroundColor: "#E9E9E9", paddingLeft: "10px" },
                ]}
              >
                <Text style={s.tblText}>
                  {data?.Data?.ServiceLocationAddress}
                </Text>
              </View>
              <View style={[s.col6]}></View>
            </View>

            <View
              style={[
                s.col4,
                {
                  marginTop: " 10px",
                  backgroundColor: "#e6e6e6",
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                Service Request Details
              </Text>
            </View>

            <View
              style={[
                s.col8,
                {
                  marginTop: " 10px",
                  paddingLeft: " 10px",
                  backgroundColor: "#e6e6e6",
                },
              ]}
            >
              <Text
                style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}
              ></Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <View
                style={[
                  s.col4,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginRight: "30px" }]}>
                  Service Request Number:
                </Text>
              </View>
              <View
                style={[
                  s.col8,
                  { paddingLeft: "10px", borderBottom: "0.5px solid #CCCCCC" },
                ]}
              >
                <Text style={s.tblText}>{data?.Data?.ServiceRequestNumber}</Text>
              </View>

              <View
                style={[
                  s.col4,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginRight: "30px" }]}>
                  Date Completed:
                </Text>
              </View>
              <View
                style={[
                  s.col8,
                  { paddingLeft: "10px", borderBottom: "0.5px solid #CCCCCC" },
                ]}
              >
                <Text style={s.tblText}>
                  {" "}
                  {formatDate(data?.Data?.CompletedDate, false)}
                </Text>
              </View>
            </View>

            <View
              style={[
                s.col4,
                {
                  marginTop: " 10px",
                  backgroundColor: "#e6e6e6",
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                Actions
              </Text>
            </View>

            <View
              style={[
                s.col8,
                {
                  marginTop: " 10px",
                  paddingLeft: " 10px",
                  backgroundColor: "#e6e6e6",
                },
              ]}
            >
              <Text
                style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}
              ></Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              <View
                style={[
                  s.col4,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginRight: "30px" }]}>
                  Work Requested:
                </Text>
              </View>
              <View
                style={[
                  s.col8,
                  { paddingLeft: "10px", borderBottom: "0.5px solid #CCCCCC" },
                ]}
              >
                <Text style={s.tblText}>{data?.Data?.WorkRequest}</Text>
              </View>

              <View
                style={[
                  s.col4,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginRight: "30px" }]}>
                  Action Taken:
                </Text>
              </View>
              <View
                style={[
                  s.col8,
                  { paddingLeft: "10px", borderBottom: "0.5px solid #CCCCCC" },
                ]}
              >
                <Text style={s.tblText}>{data?.Data?.ActionTaken}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
//  </PDFViewer>
  );
};

export default SRPdf;
