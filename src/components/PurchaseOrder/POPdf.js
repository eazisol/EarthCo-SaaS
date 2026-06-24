import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import { pdfLogoPath } from "../../apiConfig";
import { getFileName } from "../../custom/pdfLogoCorrect";

const POPdf = ({ data }) => {
  const logoPath = data?.dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  return (
    //  <PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document>
      <Page size="A4" orientation="portrait">
        <View style={[s.containerFluid]}>
          <View style={[s.row]}>
            <View style={[s.col4]}></View>
            <View style={[s.col4, s.textCenter, { marginTop: "20px" }]}>
              <Text style={s.title}>Purchase Order</Text>
            </View>

            <View style={[s.col4, s.textCenter]}>
              <Image
                style={{ marginLeft: "80px", width: "100px" }}
                  src={imageUrl}
              ></Image>
            </View>
            <View style={[s.col8, { marginTop: "10px" }]}>
              <Text style={s.text}>{data.Data?.SupplierDisplayName}</Text>
              <Text style={s.text}>{data.Data?.SupplierAddress}</Text>

              <Text style={[s.text, { marginTop: "10px  " }]}>
                {data.Data?.CustomerName}
              </Text>
            </View>
            <View style={[s.col2, { marginTop: "10px" }]}>
              <Text style={[s.textBold, { marginTop: "10px" }]}>Date</Text>
              <Text style={[s.textBold]}>PO#</Text>
              <Text style={[s.textBold]}>Requested By</Text>
            </View>
            <View style={[s.col2, { marginTop: "10px" }]}>
              <Text style={[s.text, s.textEnd, { marginTop: "10px  " }]}>
                {" "}
                {formatDate(data.Data?.CreatedDate, false)}
              </Text>
              <Text style={[s.text, s.textEnd]}>
                {data.Data?.PurchaseOrderNumber}
              </Text>
              <Text style={[s.text, s.textEnd]}>
                {data.Data?.RequestedByFirstName} {data.Data?.RequestedByLastName}
              </Text>
            </View>

            <View
              style={[
                s.col3,
                {
                  marginTop: " 10px",
                  backgroundColor: "#e6e6e6",
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                Item{" "}
              </Text>
            </View>

            <View
              style={[
                s.col5,
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
                s.col1,
                ,
                s.textCenter,
                {
                  marginTop: " 10px",
                  backgroundColor: "#e6e6e6",
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                QTY
              </Text>
            </View>
            <View
              style={[
                s.col1,
                {
                  marginTop: " 10px",
                  backgroundColor: "#e6e6e6",
                  paddingLeft: " 10px",
                },
              ]}
            >
              <Text style={[s.tblHeading, { marginBottom: 4, marginTop: 4 }]}>
                RATE
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

            {data.ItemData?.map((item, index) => (
              <View
                key={index}
                style={{ flexDirection: "row", flexWrap: "wrap" }}
              >
                <View
                  style={[
                    s.col3,

                    {
                      paddingLeft: " 10px",
                      borderBottom: "0.5px solid #CCCCCC",
                    },
                  ]}
                >
                  <Text style={s.tblText}>{item.Name}</Text>
                </View>
                <View
                  style={[
                    s.col5,
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
                    s.col1,
                    s.textEnd,
                    { borderBottom: "0.5px solid #CCCCCC",paddingRight: "8px", },
                  ]}
                >
                  <Text style={[s.tblText]}>{[item.Qty]}</Text>
                </View>

                <View
                  style={[
                    s.col1,
                    s.textEnd,
                    { borderBottom: "0.5px solid #CCCCCC" ,paddingRight: "8px",},
                  ]}
                >
                  <Text style={[s.tblText]}>${item.PurchasePrice}</Text>
                </View>

                <View
                  style={[
                    s.col2,
                    s.textEnd,
                    { borderBottom: "0.5px solid #CCCCCC" },
                  ]}
                >
                  <Text style={[s.tblText]}>
                    {" "}
                    ${formatAmount(item.Qty * item.Rate)}
                  </Text>
                </View>

                {index === 33 && (
                  <View style={[s.col12, { height: "80em" }]}></View>
                )}
              </View>
            ))}
            <View
              style={[
                s.col8,
                { borderBottom: "3px solid #CCCCCC", marginTop: "30px" },
              ]}
            ></View>
            <View
              style={[
                s.col2,
                { borderBottom: "3px solid #CCCCCC", marginTop: "30px" },
              ]}
            >
              <Text style={s.text}>Subtotal:</Text>
            </View>
            <View
              style={[
                s.col2,
                s.textEnd,
                { borderBottom: "3px solid #CCCCCC", marginTop: "30px" },
              ]}
            >
              <Text style={s.text}>${formatAmount(data.Total)}</Text>
            </View>

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
              <Text style={s.text}>Total USD:</Text>
            </View>
            <View
              style={[
                s.col2,
                s.textEnd,
                { borderBottom: "3px solid #012A47", marginTop: "10px" },
              ]}
            >
              <Text style={s.text}>${formatAmount(data.Total)}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
    //  </PDFViewer>
  );
};

export default POPdf;
