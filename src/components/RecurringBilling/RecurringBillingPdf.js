import React, { useContext, useEffect } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import imagePathCorrector from "../../custom/ImagePathCorrector";
import { PdfAddress } from "../../custom/PreviewAddress";
import { pdfLogoPath } from "../../apiConfig";
import { getFileName } from "../../custom/pdfLogoCorrect";

const RecurringTablePdf = ({ data, files = [] }) => {
    const logoPath = data?.dynamicColorAndLogo?.CompanyLogoPath;
    const imageUrl = logoPath
      ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
      : logo;
    
    
  return (
    // <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="A4" orientation="portrait">
        <View style={[s.containerFluid]}>
            <View style={[s.row, { position: "relative" }]}>
              {data?.StatusId == 3 && (
                <View style={s.paidContainer}>
                  <Text style={[s.textOutline, { left: -1, top: 0 }]}>
                    PAID
                  </Text>
                  <Text style={[s.textOutline, { left: 1, top: 0 }]}>PAID</Text>
                  <Text style={[s.textOutline, { left: 0, top: -1 }]}>
                    PAID
                  </Text>
                  <Text style={[s.textOutline, { left: 0, top: 1 }]}>PAID</Text>

                  <Text style={s.textMain}>PAID</Text>
                </View>
              )}

              <View style={[s.col4]}>
              
                <PdfAddress companyInfo={data?.companyInfo} website={true} email={true}/>
                   
              </View>
              <View style={[s.col4, s.textCenter, { marginTop: "20px" }]}>
                <Text style={s.title}>Invoice</Text>
              </View>

              <View style={[s.col4, s.textCenter]}>
                <Image
                  style={{ width: "130px", marginLeft: "40px" }}
                  src={imageUrl}
                ></Image>
              </View>
              <View style={[s.col8, { marginTop: "10px" }]}>
                <Text style={s.heading}>Bill To:</Text>
                <Text style={s.text}>{data?.Data?.CustomerCompanyName}</Text>
                <Text style={s.text}>
                  {data?.Data?.CustomerAddress?.split(", ")
                    .slice(0, 2)
                    .join(", ")}
                </Text>
                <Text style={s.text}>
                  {data?.Data?.CustomerAddress?.split(", ")
                    .slice(2)
                    .join(", ")}
                </Text>
  
              </View>
              <View style={[s.col4, { marginTop: "10px" }]}></View>

              <View
                style={[
                  s.col2,
                  {
                    marginTop: " 10px",
                    backgroundColor: "#e6e6e6",
                    paddingLeft: " 10px",
                  },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  INVOICE #
                </Text>
              </View>

              <View
                style={[
                  s.col2,
                  {
                    marginTop: " 10px",
                    backgroundColor: "#e6e6e6",
                    paddingLeft: " 10px",
                  },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  DATE
                </Text>
              </View>

              <View
                style={[
                  s.col2,
                  {
                    marginTop: " 10px",
                    backgroundColor: "#e6e6e6",
                    paddingLeft: " ",
                  },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  TOTAL DUE
                </Text>
              </View>
              <View
                style={[
                  s.col2,
                  {
                    marginTop: " 10px",
                    backgroundColor: "#e6e6e6",
                    paddingLeft: " 10px",
                  },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  DUE DATE
                </Text>
              </View>
              <View
                style={[
                  s.col2,
                  {
                    marginTop: " 10px",
                    backgroundColor: "#e6e6e6",
                    paddingLeft: " 10px",
                  },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  TERMS{" "}
                </Text>
              </View>

              <View
                style={[
                  s.col2,
                  s.textCenter,
                  { marginTop: " 10px", backgroundColor: "#e6e6e6" },
                ]}
              >
                <Text style={[s.tblHeading]}>ENCLOSED</Text>
              </View>

              <View
                style={[
                  s.col2,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={s.tblText}>{data?.Data?.InvoiceNumber}</Text>
              </View>
              <View
                style={[
                  s.col2,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={s.tblText}>
                  {formatDate(data?.Data?.IssueDate, false)}
                </Text>
              </View>
              <View
                style={[
                  s.col2,

                  {
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={s.tblText}>
                  ${formatAmount(data?.Data?.TotalAmount)}
                </Text>
              </View>
              <View
                style={[
                  s.col2,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={s.tblText}>
                  {" "}
                  {formatDate(data?.Data?.DueDate, false)}
                </Text>
              </View>
              <View
                style={[
                  s.col2,

                  {
                    paddingLeft: " 10px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={s.tblText}>{data?.Data?.Term}</Text>
              </View>
              <View
                style={[
                  s.col2,

                  {
                    paddingLeft: " 15px",
                    borderBottom: "0.5px solid #CCCCCC",
                  },
                ]}
              >
                <Text style={s.tblText}>
                  {data?.Data?.StatusId === 0 ? "Closed" : "Open"}
                </Text>
              </View>

              <View style={[s.col12, { marginTop: "20px" }]}>
                <Text style={s.textBold}>Description of work:</Text>
                {/* <Text style={{ fontSize: "9px" ,marginTop:"3px"}}>
                This is the recurring monthly maintenance invoice.
                </Text> */}
                <Text style={s.text}>{data?.Data?.CustomerMessage}</Text>
              </View>

              <View
                style={[
                  s.col2,
                  {
                    marginTop: " 10px",
                    backgroundColor: "#e6e6e6",
                    paddingLeft: " 10px",
                  },
                ]}
              >
                <Text
                  style={[
                    s.tblHeading,
                    s.textCenter,
                    { marginBottom: 4, marginTop: 4 },
                  ]}
                >
                  QTY
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
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  DESCRIPTION
                </Text>
              </View>

              <View
                style={[
                  s.col2,
                  s.textEnd,
                  { marginTop: " 10px", backgroundColor: "#e6e6e6" },
                ]}
              >
                <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                  AMOUNT
                </Text>
              </View>

              {data?.ItemData?.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{ flexDirection: "row", flexWrap: "wrap" }}
                  >
                    <View
                      style={[
                        s.col2,
                        s.textEnd,
                        {
                          paddingLeft: " 10px",
                          borderBottom: "0.5px solid #CCCCCC",
                        },
                      ]}
                    >
                      <Text style={[s.tblText, s.textCenter]}>{item.Qty}</Text>
                    </View>
                    <View
                      style={[
                        s.col8,
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
                        s.col2,
                        s.textEnd,
                        { borderBottom: "0.5px solid #CCCCCC" },
                      ]}
                    >
                      <Text style={[s.tblText]}>
                        ${formatAmount(item.Amount)}
                      </Text>
                    </View>

                    {index === 27 && (
                      <View style={[s.col12, { height: "80em" }]}></View>
                    )}
                  </View>
                );
              })}
            
              <View style={[s.col12, { marginTop: "20px" }]}></View>
              <View
                style={[
                  s.col8,
                  { borderBottom: "3px solid #012A47", marginTop: "10px" },
                ]}
              ></View>
              <View
                style={[
                  s.col2,
                  { borderBottom: "3px solid #012A47", marginTop: "10px" },
                ]}
              >
                <Text style={s.textBold}>Total Due:</Text>
              </View>
              <View
                style={[
                  s.col2,
                  s.textEnd,
                  { borderBottom: "3px solid #012A47", marginTop: "10px" },
                ]}
              >
                <Text style={s.textBold}>
                  ${formatAmount(data?.Data?.TotalAmount)}
                </Text>
              </View>
              <View
                style={[
                  s.col8,
                  { borderBottom: "3px solid #fff", marginTop: "10px" },
                ]}
              ></View>
              <View
                style={[
                  s.col2,
                  { borderBottom: "3px solid #fff", marginTop: "10px" },
                ]}
              ></View>
              <View
                style={[
                  s.col2,
                  s.textEnd,
                  { borderBottom: "3px solid #fff", marginTop: "10px" },
                ]}
              >
                <Text style={s.text}></Text>
              </View>
              <View style={[s.col12, s.textCenter, { marginTop: "20px" }]}>
               
                <Text style={{ fontSize: "9px" }}>
                  For invoice questions please contact Yisel Ferreyra at
                  Yiself@earthcolandscape.com
                </Text>
              </View>

              {/* {data?.FileData.map((img, index) => {
                if (img.FileName.includes(".pdf")) {
                  return <></>;
                } else {
                  return (
                    <View key={index} style={[s.colXL4, { padding: "10px" }]}>
                      <Image src={imagePathCorrector(img.FilePath)} />
                    </View>
                  );
                }
              })} */}
            </View>
          </View>
      </Page>
    </Document>
    // </PDFViewer>
  );
};

export default RecurringTablePdf;
