import React, { useContext } from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import s from "../CommonComponents/PdfStyles";
import { PDFViewer } from "@react-pdf/renderer";
import logo from "../../assets/images/logo/earthco_logo.png";
import formatDate from "../../custom/FormatDate";
import formatAmount from "../../custom/FormatAmount";
import tick from "../../assets/images/Tick.png";
import square from "../../assets/images/square.png";

const Tick = () => <Image style={{ width: "10px" }} src={tick}></Image>;

const Square = () => <Image style={{ width: "8px" }} src={square}></Image>;

const defaultSRPreviewData = {
  name: "wreewrwerwe",
  Data: {
    CreatedDate: new Date(),
    ServiceLocationAddress: "",
    ReginoalManagerName: "",
  },
  SRSTIData: [],
  SRSTData: [
    {
      Hours: 0,
      isTurf: false,
      isShrubs: false,
      isParkways: false,
      isTrees: false,
      Ounces: 0,
      Pounds: 0,
      Other: "",
    },
  ],
};

const SprayTechPdf = ({ sRPreviewData = defaultSRPreviewData }) => {
  return (
    // <PDFViewer style={{ width: "100%", height: "800px" }}>
      <Document>
        <Page size="A4" orientation="portrait">
          <View style={[s.containerFluid, {paddingTop : 0}]}>
            <View style={[s.row]}>
              <View style={[s.col4, s.textCenter]}></View>
              <View style={[s.col4, s.textCenter, { paddingTop: "20px" }]}>
                <Text style={s.title}>Spray Tech Form </Text>
              </View>
              <View style={[s.col4, s.textCenter]}>
                <Image
                  style={{ width: "80px", marginLeft: "80px" }}
                  src={logo}
                ></Image>
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              
                  <View style={[s.col2, { marginTop: "2px" }]}>
                    <Text style={s.textBold10}>Customer Name:</Text>
                  </View>

                  <View style={[s.col3, { width: "100em", marginTop: "2px" }]}>
                    <Text style={[s.text10]}>{sRPreviewData.name}</Text>
                  </View>

                  <View style={[s.col1, { width: "30em", marginTop: "2px" }]}>
                    <Text style={s.textBold10}>Type:</Text>
                  </View>

                  <View style={[s.col2, { marginTop: "2px" }]}>
                    <Text style={[s.text10]}>Spray Tech Form</Text>
                  </View>
                  <View style={[s.col1, { width: "45em", marginTop: "2px" }]}>
                    <Text style={s.textBold10}>Date:</Text>
                  </View>

                  <View style={[s.col1, { marginTop: "2px" }]}>
                    <Text style={[s.text10]}>
                      {formatDate(sRPreviewData.Data.CreatedDate, false)}
                    </Text>
                  </View></View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop : "5px",alignItems :"flex-start"}}>
                  <View style={[s.col2, ]}>
                    <Text style={s.textBold10}>Service Location:</Text>
                  </View>

                  <View style={[s.col5]}>
                    <Text style={[s.text10, { marginTop: "2px" }]}>
                      {sRPreviewData.Data.ServiceLocationAddress}
                    </Text>
                  </View>

                  <View style={[{ width: "92em", marginTop: "2px",paddingLeft: "2px" }]}>
                    <Text style={[s.textBold10]}>Regional Manager:</Text>
                  </View>

                  <View
                    style={[s.col2, { marginTop: "2px", paddingLeft: "2px" }]}
                  >
                    <Text style={[s.text10]}>
                      {sRPreviewData.Data.ReginoalManagerName}
                    </Text>
                  </View>
                </View>
             

              <View
                style={[s.col10, { flexDirection: "row", flexWrap: "wrap" }]}
              >
                <View
                  style={[
                    s.col10,
                    s.textCenter,
                    {
                      border : "1px",
                      marginTop: "10px",
                      backgroundColor: "#e6e6e6",
                      paddingLeft: "10px",
                    },
                  ]}
                >
                  <Text
                    style={[s.tblHeading, { marginBottom: 2, marginTop: 2 }]}
                  >
                    Chemicals
                  </Text>
                </View>

                {sRPreviewData.SRSTIData?.map((item, index) => (
                  <>
                    {index === 0 ||
                    item.Type !== sRPreviewData.SRSTIData[index - 1].Type ? (
                      <>
                        <View
                          style={[
                            s.col1,
                            { border : "1px",
                              backgroundColor: "#e6e6e6",
                              paddingLeft: "10px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblHeading,
                              { marginBottom: 2, marginTop: 2,  },
                            ]}
                          >
                            X
                          </Text>
                        </View>

                        <View
                          style={[
                            s.col3,
                            {
                              backgroundColor: "#e6e6e6",
                              paddingLeft: "10px",
                              border : "1px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblHeading,
                              { marginBottom: 2, marginTop: 2 },
                            ]}
                          >
                            {item.Type}
                          </Text>
                        </View>

                        <View
                          style={[
                            s.col2,
                            {
                              paddingLeft: "10px",
                              backgroundColor: "#e6e6e6", 
                              border : "1px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblHeading,
                              { marginBottom: 2, marginTop: 2, },
                            ]}
                          >
                            Rate
                          </Text>
                        </View>

                        <View
                          style={[
                            s.col4,

                            {
                              backgroundColor: "#e6e6e6",
                              paddingLeft: "10px",
                              border : "1px",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.tblHeading,
                              { marginBottom: 2, marginTop: 2 },
                            ]}
                          >
                            Notes
                          </Text>
                        </View>
                      </>
                    ) : null}

                    <View style={[s.col1, s.borderLight]}>
                      <Text style={[s.tblText, { paddingLeft: "10px" }]}>
                        {item.isUsed ? (
                          <>
                            {" "}
                            <Tick />
                          </>
                        ) : (
                          <></>
                        )}
                      </Text>
                    </View>
                    <View style={[s.col3, s.borderLight]}>
                      <Text
                        style={[
                          s.tblText,
                          {
                            paddingLeft: "2px",
                            color: item.isOrganic ? "red" : "black",
                          },
                        ]}
                      >
                        {item.ItemName}
                      </Text>
                    </View>
                    <View style={[s.col2, s.borderLight]}>
                      <Text
                        style={[
                          s.tblText,
                          {
                            paddingLeft: "2px",
                            color: item.isOrganic ? "red" : "black",
                          },
                        ]}
                      >
                        {item.Rate} {item.Unit}
                      </Text>
                    </View>
                    <View style={[s.col4, s.borderLight]}>
                      <Text
                        style={[
                          s.tblText,
                          {
                            paddingLeft: "2px",
                            color: item.isOrganic ? "red" : "black",
                          },
                        ]}
                      >
                        {item.Notes}
                      </Text>
                    </View>

                   
                  </>
                ))}
              </View>

              <View
                style={[
                  s.col2,
                  {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    paddingLeft : "3px"
                    
                  },
                ]}
              >
                <View
                  style={[
                    s.col3,
                    {
                      backgroundColor: "#e6e6e6",
                      marginTop: "10px",
                      paddingLeft: "10px",
                    },
                  ]}
                >
                  <Text style={[s.tblHeading]}>Sprayed Hours</Text>
                </View>

                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    Hours: {sRPreviewData.SRSTData[0]?.Hours}
                  </Text>
                </View>

                <View
                  style={[
                    s.col3,
                    {
                      backgroundColor: "#e6e6e6",
                      marginTop: " 12px",
                      paddingLeft: "10px",
                    },
                  ]}
                >
                  <Text style={[s.tblHeading]}>Landscape treated</Text>
                </View>

                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    {sRPreviewData.SRSTData[0]?.isTurf ? <Tick /> : <Square />}{" "}
                    Truf
                  </Text>
                </View>
                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    {sRPreviewData.SRSTData[0]?.isShrubs ? (
                      <Tick />
                    ) : (
                      <Square />
                    )}{" "}
                    Shrubs
                  </Text>
                </View>
                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    {sRPreviewData.SRSTData[0]?.isParkways ? (
                      <Tick />
                    ) : (
                      <Square />
                    )}{" "}
                    Parkways
                  </Text>
                </View>
                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    {sRPreviewData.SRSTData[0]?.isTrees ? <Tick /> : <Square />}{" "}
                    Trees
                  </Text>
                </View>

                <View
                  style={[
                    s.col3,
                    {
                      backgroundColor: "#e6e6e6",
                      marginTop: " 12px",
                      paddingLeft: "10px",
                    },
                  ]}
                >
                  <Text style={[s.tblHeading]}>Quantity</Text>
                </View>

                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    Ounces: {sRPreviewData.SRSTData[0]?.Ounces}
                  </Text>
                </View>
                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    Pounds: {sRPreviewData.SRSTData[0]?.Pounds}
                  </Text>
                </View>

                <View
                  style={[s.col3, { marginTop: " 2px", paddingLeft: "10px" }]}
                >
                  <Text style={[s.tblText]}>
                    Others: {sRPreviewData.SRSTData[0]?.Other}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    // </PDFViewer>
  );
};

export default SprayTechPdf;
