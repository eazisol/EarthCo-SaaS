import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import { PdfAddress } from "../../custom/PreviewAddress";

const ProposalSummaryPdf = ({ reportData, CustomerName ,companyInfo }) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={[ { marginTop: 10 }]}>
        <View style={[s.containerFluid]}>
          <View style={[s.row]}>
            <View style={[s.colXL4]}>
              {/* <Text style={s.text}>EarthCo</Text>

              <Text style={s.text}>1225 East Wakeham </Text>

              <Text style={s.text}>Santa Ana, Ca 92705</Text> */}
 <PdfAddress companyInfo={companyInfo} />
              <Text style={[s.text, { marginTop: "10px" }]}>Submitted to</Text>
              <Text style={[s.text]}>{CustomerName}</Text>
              <Text style={[s.text]}> {reportData[0].Address}</Text>
            </View>
            <View style={[s.colXL4, s.textCenter, { marginTop: "20px" }]}>
              <Text style={s.title}>Proposal Summary Report</Text>
              <Text style={s.heading}></Text>
            </View>

            <View style={[s.colXL4, { paddingLeft: "80px" }]}>
              <Image
                style={{ width: "100px", marginLeft: "80px" }}
                src={logo}
              ></Image>
            </View>
            <View
              style={[
                s.colXL12,
                { marginTop: "30px", borderBottom: "2px solid #888888" },
              ]}
            ></View>
            <View
              style={[
                s.colXL2,
                s.borderLight,
                {
                  marginTop: " 10px",

                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                SUBMITTED
              </Text>
            </View>

            <View
              style={[
                s.colXL2,
                s.borderLight,
                {
                  marginTop: " 10px",

                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                PROPOSAL #{" "}
              </Text>
            </View>
            <View
              style={[
                s.colXL4,
                s.borderLight,
                {
                  marginTop: " 10px",

                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                DESCRIPTION
              </Text>
            </View>

            <View
              style={[
                s.colXL2,
                s.borderLight,
                {
                  marginTop: " 10px",

                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                AMOUNT
              </Text>
            </View>
            <View
              style={[
                s.colXL2,
                s.borderLight,
                {
                  marginTop: " 10px",

                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                STATUS
              </Text>
            </View>

            {reportData.map((report, index) => {
              return (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }} wrap={false} key={index}>
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
                      style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}
                    >
                      {formatDate(report.CreatedDate, false)}
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
                    <Text
                      style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}
                    >
                      {report.EstimateNumber}
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
                    <Text style={[s.tblText]}> {report.EstimateNotes}</Text>
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
                    <Text style={[s.tblText]}>
                      {" "}
                      $
                      {report &&
                        report.TotalAmount &&
                        report.TotalAmount.toFixed(2).replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )}
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
                    <Text style={[s.tblText]}>{report.Status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Page>
    </Document>
    // </PDFViewer>
  );
};

export default ProposalSummaryPdf;
