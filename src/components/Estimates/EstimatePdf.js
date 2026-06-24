import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import { PdfAddress } from "../../custom/PreviewAddress";
import { pdfLogoPath } from "../../apiConfig";
import { getFileName } from "../../custom/pdfLogoCorrect";

const EstimatePdf = ({ data }) => {
  data = data || {
    ApprovedItems: [],
  };
    
  const logoPath = data?.dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  return (
    // <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="LETTER" orientation="portrait" style={{ paddingTop: 30, paddingBottom: 28, }} >
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
                paddingBottom:
                  data.ApprovedItems.length > 19
                    ? data.ApprovedItems.length >= 32
                      ? 80
                      : 200
                    : 0,
              },
            ]}
          >
            <View style={[s.row]}>
              <View style={[s.col4Letter]}>
                {/* <Text style={s.text}>{data.SelectedCompany}</Text> */}

                {/* <Text style={s.text}>1225 East Wakeham Avenue</Text>

                <Text style={s.text}>Santa Ana, California 92705</Text>
                <Text style={s.text}>O 714.571.0455 F 714.571.0580</Text>
                <Text style={s.text}>CL# C27 823185 / D49 1025053</Text> */}
                  <PdfAddress companyInfo={data?.companyInfo} license={true} />
                  
              </View>
              <View style={[s.col4Letter, s.textCenter, { marginTop: "0px" }]}>
                <Text
                  style={[s.textBold, { fontSize: "16px", fontWeight: "bold" }]}
                >
                  Proposal
                </Text>
              </View>

              <View style={[s.col4Letter, s.textCenter]}>
                <Image
                  style={{ width: "130px", marginLeft: "60px" }}
                  src={imageUrl}
                ></Image>
              </View>
              <View style={[s.col8Letter, { marginTop: "30px" }]}>
                <Text style={s.textBold}>Submitted to:</Text>
                <Text style={s.text}>
                  {data.ContactName ? data.ContactName + ", " : ""}
                </Text>
                <Text style={s.text}>{data.ContactCompanyName}</Text>
              </View>
              <View style={[s.col4Letter, { marginTop: "30px" }]}>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text style={[s.textBold, { fontWeight: "bold" }]}>
                    Date:
                  </Text>
                  <Text style={s.text}>
                    {" "}
                    {formatDate(data.IssueDate, false)}
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text style={[s.textBold, { fontWeight: "bold" }]}>
                    Estimate #:
                  </Text>
                  <Text style={s.text}> {data.EstimateNumber}</Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <Text style={[s.textBold, { fontWeight: "bold" }]}>
                    Submitted by:
                  </Text>
                  <Text style={s.text}> {data.RegionalManagerName}</Text>
                </View>
              </View>

              <View
                style={[
                  s.col12Letter,
                  s.textCenter,
                  { marginTop: "20px", borderBottom: "0.5px solid #999999" },
                ]}
              >
                <Text
                  style={[s.textBold, { fontSize: "14px", fontWeight: "bold" }]}
                >
                  {data.CustomerName}
                </Text>
              </View>

              <View style={[s.col12Letter, { marginTop: "5px" }]}>
                <Text style={s.textBold}>Description of work:</Text>
                <Text style={s.text}>{data.EstimateNotes}</Text>
              </View>

              {/* <View style={[s.col12, { marginTop: "20px" }]}>
              <Text style={s.textBold}>Item(s)</Text>
            </View> */}

              <View
                style={[
                  s.col1Letter,
                  s.textStart,
                  {
                    marginTop: " 20px",
                    backgroundColor: "#e6e6e6",
                    paddingLeft: " 10px",
                  },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  Qty
                </Text>
              </View>

              <View
                style={[
                  s.col9Letter,
                  {
                    marginTop: " 20px",
                    paddingLeft: " 10px",
                    backgroundColor: "#e6e6e6",
                  },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  Description
                </Text>
              </View>

              <View
                style={[
                  s.col2Letter,
                  s.textEnd,
                  { marginTop: " 20px", backgroundColor: "#e6e6e6" },
                ]}
              >{data?.IncludePrices && (
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  Amount
                </Text>
              )}
              </View>

              {data.ApprovedItems.map((item, index) => (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  <View
                    style={[
                      s.col1Letter,
                      s.textStart,
                      {
                        paddingLeft: " 10px",
                        borderBottom: "0.5px solid #CCCCCC",
                      },
                    ]}
                  >
                    <Text style={[s.tblText]}>{item.Qty}</Text>
                  </View>
                  <View
                    style={[
                      s.col9Letter,
                      {
                        paddingLeft: "10px",
                        borderBottom: "0.5px solid #CCCCCC",
                      },
                    ]}
                  >
                    <Text style={s.tblText}>{item.Description}</Text>
                  </View>
                <View
                  style={[
                    s.col2Letter,
                    s.textEnd,
                    { borderBottom: "0.5px solid #CCCCCC" },
                  ]}
                >
                {data?.IncludePrices?  <Text style={[s.tblText]}>
                    ${formatAmount(item.Amount)}
                  </Text>: <Text style={[s.tblText]}>
          
                  </Text>}
                </View>

                  {/* {index === 29 && data.ApprovedItems[30] ? (
                    <View style={[s.col12Letter, { height: "60em" }]}></View>
                  ) : (
                    <View style={[s.col12Letter, { height: 0 }]}></View>
                  )} */}
                </View>
              ))}
              <View style={[s.col9Letter]}></View>
             {data?.IncludePrices&&<> <View
                style={[
                  s.col1Letter,
                  { borderBottom: "0.5px solid #999999", marginTop: "10px" },
                ]}
              >
                <Text style={s.text}>Total:</Text>
              </View>
              <View
                style={[
                  s.col2Letter,
                  s.textEnd,
                  { borderBottom: "0.5px solid #999999", marginTop: "10px" },
                ]}
              >
                <Text style={s.text}>${formatAmount(data.Amount)}</Text>
              </View></>}
            </View>
          </View>

          <View
            style={[
              s.row,
              {
                backgroundColor: "#FFFFFF",
                padding: 20,
                marginHorizontal: "15px",
              },
            ]}
          >
            <View
              style={[
                s.col3Letter,
                { borderTop: "0.5px solid #999999", marginTop: "30px" },
              ]}
            >
              <Text style={s.text}>ACCEPTED BY:</Text>
            </View>
            <View
              style={[
                s.col3Letter,
                { borderTop: "0.5px solid #999999", marginTop: "30px" },
              ]}
            >
              <Text style={s.text}>Buyer/Agent Signature</Text>
            </View>
            <View
              style={[
                s.col2,
                { borderTop: "0.5px solid #999999", marginTop: "30px" },
              ]}
            >
              <Text style={s.text}>Print Name</Text>
            </View>
            <View
              style={[
                s.col2,
                { borderTop: "0.5px solid #999999", marginTop: "30px" },
              ]}
            >
              <Text style={s.text}>Title</Text>
            </View>
            <View
              style={[
                s.col2,
                { borderTop: "0.5px solid #999999", marginTop: "30px" },
              ]}
            >
              <Text style={s.text}>Date</Text>
            </View>
            <View style={[s.col12Letter, { marginTop: "10px" }]}>
              <Text style={[s.small, { lineHeight: 2, color: "black" }]}>
                Payment Terms and Conditions: Please be advised that payments
                are due upon receipt of the invoice, with any payment made
                beyond 30 days from the billing date considered overdue and
                subject to interest at the maximum legally permissible rate. In
                the event of legal action for collection, Earthco is entitled to
                reimbursement of all legal fees. Failure to make payment within
                a 30 day period will be deemed a major breach. This proposal
                assumes no preexisting conditions detrimental to labor and
                materials during installation, replacement, and repair,
                specifically for work conducted by Earthco Commercial Landscape
                or Earthco Arbor Care, with a 30 day lead time for tree work.
                Earthco Arbor Care disclaims responsibility for damage to
                underground utilities, and work will adhere to ANSI A300 Arbor
                Standards. Requests for crown thinning exceeding 25% may incur
                additional costs and release Earthco Arbor Care from liability.
                The proposal excludes permits, traffic control, or engineering,
                with the client responsible for associated costs. Cancellation
                of work incurs a 20% fee, and tree work inspections must be
                conducted within 30 days of completion; otherwise, the work is
                deemed final. The client acknowledges the potential placement of
                a mechanics lien on the property as per the California Civil
                Code for non‐payment within the specified terms. The signing
                party affirms authorization to obligate the client to these
                terms.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
// </PDFViewer>
  );
};

export default EstimatePdf;
