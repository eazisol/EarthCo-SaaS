import { Button } from "@mui/material";
import React from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
const BackButton = ({ onClick, children }) => {
  return (
    <Button
      variant="outlined"
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
      // onClick={() => {window.history.back();}}
      onClick={onClick}
      color="primary"
      startIcon={<ArrowBackRoundedIcon sx={{ padding: 0 }} />}
    >
      {/* {children} */}
    </Button>
  );
};

export default BackButton;
