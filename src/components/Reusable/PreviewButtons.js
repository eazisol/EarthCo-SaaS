import { Button } from "@mui/material";
import React from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/Print";
const PreviewButtons = ({children, onClick}) => {
  return (
    <Button
    sx={{ textTransform: "capitalize", padding: "8px 10px",   color: "#404040",
    border: "1px solid #0000003d",
    borderRadius: "5px",
        marginRight: "0.5em",
       
        textTransform: "capitalize",
        "&:hover": {
          border: "1px solid #404040",
        }, }}
    variant="outlined"
   
    onClick={onClick}
    className="me-2"
    color="primary"
    disableElevation
    startIcon={<ArrowBackRoundedIcon sx={{ padding: 0 }} />}
  >
    {children}
  </Button>
  )
}

export default PreviewButtons