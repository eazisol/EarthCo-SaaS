import { Button } from "@mui/material";
import React from "react";
import { Print, Email, Download } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CustomizedTooltips from "./CustomizedTooltips";
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
const PrintButton = ({ onClick, varient, padding = "7px 7px" }) => {
  if (varient === "mail") {
    return (
      <CustomizedTooltips title="Send Mail" placement="top">
        <IconButton
          sx={{
            color: "#404040",
            border: "1px solid #0000003d",
            borderRadius: "5px",
            marginRight: "0.5em",
            padding: "5px 12px",
            textTransform: "capitalize",
            "&:hover": {
              // backgroundColor: "#171717",
              // color: "white",
              border: "1px solid #404040",
              outlineColor: "black",
            },
          }}
          onClick={onClick}
        >
          <EmailOutlinedIcon sx={{ padding: 0 }} />
        </IconButton>
      </CustomizedTooltips>
    );
  } else if (varient === "print") {
    return (
      <CustomizedTooltips title="Print" placement="top">
        <IconButton
          sx={{
            color: "#404040",
            border: "1px solid #0000003d",
            borderRadius: "5px",
            marginRight: "0.5em",
            padding: "5px 12px",
            textTransform: "capitalize",
            "&:hover": {
              // backgroundColor: "#171717",
              // color: "white",
              border: "1px solid #404040",
              outlineColor: "black",
            },
          }}
          onClick={onClick}
        >
          <LocalPrintshopOutlinedIcon sx={{ padding: 0 }} />
        </IconButton>
      </CustomizedTooltips>
    );
  }else if (varient == "Download") {
    return (
    <CustomizedTooltips title="Download pdf" placement="top">
        <IconButton
          sx={{
            color: "#404040",
            border: "1px solid #0000003d",
            borderRadius: "5px",
            marginRight: "0.5em",
            padding: padding,
            textTransform: "capitalize",
            "&:hover": {
              // backgroundColor: "#171717",
              // color: "white",
              border: "1px solid #404040",
              outlineColor: "black",
            },
          }}
          onClick={onClick}
        >
          <DownloadOutlinedIcon sx={{ padding: 0 }} />
        </IconButton>
      </CustomizedTooltips>)
  }
};

export default PrintButton;
