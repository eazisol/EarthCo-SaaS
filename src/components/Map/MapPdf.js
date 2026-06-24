import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import React from 'react'
import logo from "../../assets/images/logo/earthco_logo.png"

const MapPdf = ({ mapImage }) => {
  
    return (
      <Document>
        <Page size="A4" orientation="landscape">
          <View style={styles.container}>
            <Image src={logo} style={styles.logo} />
            <Image src={mapImage} style={styles.mapImage} />
          </View>
        </Page>
      </Document>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      padding: 20,
    },
    logo: {
      width: 80,
      height: 50,
      marginBottom : 5
    },

    mapImage: {
      width: 800,
      height: 500,
    },
  });


export default MapPdf