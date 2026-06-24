// EstimatePdfStyles.js
import { StyleSheet, Font } from "@react-pdf/renderer";

// Font.register({ family: 'test', fonts: [
//   { src: '../Fonts/arial.ttf' }, // Assuming you have a regular font
//   { src: '../Fonts//ARIBL0.ttf', fontWeight: 'bold' },
// ]});

const maxWidth = 760; // Maximum width
const colXL12Width = maxWidth; // colXL12 represents the maximum size

const colXL1Width = maxWidth / 12;
const colXL2Width = colXL1Width * 2;
const colXL3Width = colXL1Width * 3;
const colXL4Width = colXL1Width * 4;
const colXL5Width = colXL1Width * 5;
const colXL6Width = colXL1Width * 6;
const colXL7Width = colXL1Width * 7;
const colXL8Width = colXL1Width * 8;
const colXL9Width = colXL1Width * 9;
const col1LetterWidth = 47;

const s = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  containerFluid: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginHorizontal: "15px",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 10,
  },
  col1: {
    width: "42.5em",
  },
  col2: {
    width: "85em",
  },
  col3: {
    width: "127.5em",
  },
  col4: {
    width: "170em",
  },
  col5: {
    width: "212.5em",
  },
  col6: {
    width: "255em",
  },
  col7: {
    width: "297.5em",
  },
  col8: {
    width: "340em",
  },
  col9: {
    width: "382.5em",
  },
  col10: {
    width: "425em",
  },
  col12: {
    width: "510em",
  },
  colXL1: {
    width: `${colXL1Width}em`,
  },
  colXL2: {
    width: `${colXL2Width}em`,
  },
  colXL3: {
    width: `${colXL3Width}em`,
  },
  colXL4: {
    width: `${colXL4Width}em`,
  },
  colXL5: {
    width: `${colXL5Width}em`,
  },
  colXL6: {
    width: `${colXL6Width}em`,
  },
  colXL7: {
    width: `${colXL7Width}em`,
  },
  colXL8: {
    width: `${colXL8Width}em`,
  },
  colXL9: {
    width: `${colXL9Width}em`,
  },
  colXL12: {
    width: `${colXL12Width}em`,
  },
  col1Letter: {
    width: `${col1LetterWidth}em`,
  },
  col2Letter: {
    width: `${col1LetterWidth * 2}em`,
  },
  col3Letter: {
    width: `${col1LetterWidth * 3}em`,
  },
  col4Letter: {
    width: `${col1LetterWidth * 4}em`,
  },
  col5Letter: {
    width: `${col1LetterWidth * 5}em`,
  },
  col6Letter: {
    width: `${col1LetterWidth * 6}em`,
  },
  col7Letter: {
    width: `${col1LetterWidth * 7}em`,
  },
  col8Letter: {
    width: `${col1LetterWidth * 8}em`,
  },
  col9Letter: {
    width: `${col1LetterWidth * 9}em`,
  },
  col12Letter: {
    width: `${col1LetterWidth * 12}em`,
  },

  borderLight: {
    border: "0.5px solid #999999",
  },
  textEnd: {
    textAlign: "right",
  },
  textStart: {
    textAlign: "left",
  },
  textCenter: {
    textAlign: "center",
  },
  title: {
    fontSize: "18px",

    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  heading: {
    fontSize: "13px",
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
    marginBottom: 1,
  },
  text: {
    fontSize: "11pt",

    marginBottom: 1,
  },
  text10: {
    fontSize: "9pt",
  },
  textBold10: {
    fontSize: "9pt",
    fontFamily: "Helvetica-Bold",
  },
  textBold: {
    fontSize: "11pt",
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  text2: {
    fontSize: "9pt",
    marginBottom: 1,
  },
  tblHeading: {
    fontSize: "10pt",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    marginTop: 4,
  },
  tblText: {
    fontSize: "9pt",
    marginBottom: 2,
    marginTop: 2,
  },
  tblTextSafety: {
    fontSize: "9pt",
    marginTop: 2,
  },
  small: {
    fontSize: "6px",
    marginBottom: 1,
  },
  paidContainer: {
    position: 'absolute',
    textAlign: 'center',
    transform: 'rotate(-30deg)',
    top: '44%',
    left: '37%',
    zIndex:-1
  },
  
 
  textOutline: {
    position: 'absolute',
    fontSize: 60,
    fontWeight: 'bold',
    color: 'green',
  },
  textMain: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default s;
