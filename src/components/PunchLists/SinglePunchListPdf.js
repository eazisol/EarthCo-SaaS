import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import { baseUrl } from "../../apiConfig";
import { pdfLogoPath } from "../../apiConfig";
import { getFileName } from "../../custom/pdfLogoCorrect";


const SinglePunchListPdf = ({ pLData, PLDetail,index ,dynamicColorAndLogo}) => {


  const imagePathCorrector = (string) => {
    if (string) {
      const correctedString = `https://image.earthcoapp.com/${string
        ?.replace("\\Uploading", "")
        ?.replace(/\\/g, "/")
        .replace(".jpg", ".png")
        .replace(".jpeg", ".png")
        .replace("Punchlist", "Punchlist/Thumbnail")}`;
      // return `https://34.94.249.102/GetImages${(string)?.replace('\\Uploading', '')}`
      // const correctedString = "https://api.earthcoapp.com//Uploading/Punchlist/PunchlistFile0139.png"
      console.log("image", correctedString);
      return correctedString;
      // return `https://i.ibb.co/zP2bw4q/6-Snapchat-17794545842.jpg`
    } else {
      return "";
    }
  };
  const logoPath = dynamicColorAndLogo?.CompanyLogoPath;
  const imageUrl = logoPath
    ? `${pdfLogoPath.replace(/\/$/, "")}/${getFileName(logoPath)}`
    : logo;
  
  
  return (
    //<PDFViewer style={{ width: "100%", height: "800px" }}>
    <Document debug={true}>
      <Page size="A4" >
        <View style={[s.containerFluid, { paddingRight: '20px', paddingLeft: '20px', paddingTop: '10px', paddingBottom: '0px' }]}>
          <View style={[s.row]}>
            <View style={[s.col4, { paddingRight: "80px" }]}>
              <Image style={{ width: "100px",height:"80px" }} src={imageUrl}></Image>
            </View>
            <View style={[s.col4, s.textCenter, { marginTop: "30px" }]}>
              <Text style={s.title}>Punchlist</Text>
            </View>

            <View style={[s.col4, s.textEnd, { paddingLeft: "100px" }]}></View>

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
                {pLData.CustomerDisplayName}
              </Text>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Title
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {pLData.Title}
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
                {pLData.ContactName}
              </Text>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Contact Company
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {pLData.ContactCompany}
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
                Created By:
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {pLData.AssignToName}
              </Text>
              <Text style={[s.tblHeading, { marginBottom: 0, marginTop: 4 }]}>
                Created
              </Text>
              <Text style={[s.tblText, { marginBottom: 4, marginTop: 0 }]}>
                {formatDate(pLData.CreatedDate, false)}
              </Text>
            </View>

            <View
              style={[
                s.col3,
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
                Address
              </Text>
            </View>
            <View
              style={[
                s.col3,
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
                Punchlist #
              </Text>
            </View>
            <View
              style={[
                s.col3,
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
                Notes
              </Text>
            </View>
            <View
              style={[
                s.col3,
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

                Status
              </Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "nowrap" }} wrap={false}>
              <View
                style={[
                  s.col3,
                  s.borderLight,
                  {
                    paddingLeft: " 10px",
                    paddingRight: "10px",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                  {PLDetail.DetailData.Address}
                </Text>
              </View>
              <View
                style={[
                  s.col3,
                  s.borderLight,
                  {
                    paddingLeft: " 10px",
                    paddingRight: "10px",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                  {index + 1}
                </Text>
              </View>
              <View
                style={[
                  s.col3,
                  s.borderLight,
                  {
                    paddingLeft: " 10px",
                    paddingRight: "10px",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                  {PLDetail.DetailData.Notes}
                </Text>
              </View>

              <View
                style={[
                  s.col3,
                  s.borderLight,
                  {
                    paddingLeft: " 7px",
                    paddingRight: "7px",
                  },
                ]}
              >
                <Text style={[s.tblText, { marginBottom: 4, marginTop: 4 }]}>
                  {PLDetail.DetailData.PunchlichlistDetailStatus}
                </Text>
              </View>
            </View>

            <View style={[s.col12, { marginTop: "5px", maxHeight:  "500px" }]}>
              {PLDetail.DetailData.PhotoPath ? (
                <Image
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain"
                  }}
                  source={imagePathCorrector(PLDetail.DetailData.PhotoPath)}
                />
              ) : null}
            </View>
            {PLDetail?.DetailData.AfterPhotoPath ? (
              <View break>
                <Text style={{ fontSize: "14px", fontWeight: "bold", marginTop: "20px",marginBottom: "10px" }}>After Photo</Text>
                <View style={[s.col12, { marginTop: "5px", maxHeight: "550px" }]}>
                  <Image
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain"
                    }}
                    source={imagePathCorrector(PLDetail?.DetailData.AfterPhotoPath)}
                  />
                </View>
              </View>
            ) : null}

          </View>
        </View>
      </Page>
    </Document>
    // </PDFViewer>
  );
};



export default SinglePunchListPdf;
