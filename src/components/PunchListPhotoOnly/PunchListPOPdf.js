import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";

const PunchListPOPdf = ({weeklyPreviewData}) => {
  return (
    // <PDFViewer style={{ width: "100%", height: "800px" }}>
      <Document>
        <Page size="A4" orientation="portrait">
          <View style={[s.containerFluid]}>
            <View style={[s.row]}>
              <View style={[s.col3, { paddingRight: "80px" }]}> <Image style={{ width: "80px" }} src={logo}></Image></View>
              <View style={[s.col6, s.textCenter, { marginTop: "30px" }]}>
                <Text style={s.title}>PunchList Photos only </Text>
              </View>

              <View style={[s.col3, s.textEnd, ]}>
              
               
              </View>

              <View
                style={[
                  s.col12,
                  s.textCenter,

                  {
                    marginTop: " 10px",
                    border: "1px solid rgb(120, 154, 61)",
                    paddingLeft: " 10px",
                    backgroundColor: "#789A3D",
                  },
                ]}
              >
                <Text
                  style={[
                    s.heading,
                    { marginBottom: 8, marginTop: 8, color: "white" },
                  ]}
                >
                  Photos
                </Text>
              </View>

              <View style={[s.col12,{paddingLeft:"10px", marginTop : "20px"}]}>
                <Text style={[s.textBold]}>Add note:</Text>
                <Text style={[s.text]}>{weeklyPreviewData.Notes}</Text>
              </View>
              <View style={[s.col12,{paddingLeft:"10px", marginTop : "20px"}]}>
                <Text style={[s.textBold]}>Photos:</Text>
                
              </View>
            </View>
          </View>
        </Page>
      </Document>
    // </PDFViewer>
  );
};

export default PunchListPOPdf;
