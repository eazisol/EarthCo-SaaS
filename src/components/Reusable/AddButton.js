import { Button } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/Add";
import Print from "@mui/icons-material/Article";
const AddButton = ({ onClick, children,varient, icon,backgroundColor ,background=true, disabled=false}) => {

  return (
    <Button
      sx={{ textTransform: "capitalize", padding: "8px 10px",backgroundColor: background? backgroundColor : "", border: `1px solid ${backgroundColor}`, "&:hover": {
        backgroundColor: backgroundColor,
        color: "white",
        border: `1px solid ${backgroundColor}`,
        outlineColor: "black",
      }, }}
      variant={varient == "outlined"? varient:"contained"}
      onClick={onClick}
      className="me-2"
      disabled={disabled}
      disableElevation
      startIcon={icon==="print"? <Print/> :<ArrowBackRoundedIcon sx={{ padding: 0 }} />}
    >
      {children}
    </Button>
  );
};

export default AddButton;
