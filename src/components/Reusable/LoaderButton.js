import React, { useContext, useState } from "react";
import { useEffect } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import SendIcon from "@mui/icons-material/SaveOutlined";
import Send from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { SaveOutline } from "react-ionicons";
import { DataContext } from "../../context/AppData";
import Cookies from "js-cookie";
const LoaderButton = ({
  disable,
  varient,
  color,
  handleSubmit,
  loading,
  children,
}) => {
  const [primaryColor, setPrimaryColor] = useState(''); 

  useEffect(() => {
    const color = Cookies.get("PrimeryColor");
    if (color) setPrimaryColor(color);
  }, []);
  
  if (varient == "small") {
    return (
      <LoadingButton
      
        variant="contained"
        size="small"
        loading={loading}
        color={color}
        startIcon={<SendIcon />}
        onClick={handleSubmit}
        disableElevation
        sx={{
          padding: "5px 17px",
          marginRight: "0.6em",
          color: "#fff",
          textTransform: "capitalize",
        }}
      >
        {children}
      </LoadingButton>
    );
  } else if (children.includes("copy")) {
    return (
      <LoadingButton
        variant="contained"
        loading={loading}
        // color={color}
        // loadingIndicator="Saving…"
        // startIcon={<DeleteIcon />}
        // loadingPosition="start"
        startIcon={<ContentCopyIcon sx={{ fontSize: 2 }} />}
        onClick={handleSubmit}
        disabled={disable}
        disableElevation
        sx={{
          marginRight: "0.6em",

          color: "#fff",
          backgroundColor: "#5C636A",

          textTransform: "capitalize",
          "&:hover": {
            backgroundColor: "#474d52",
          },
        }}
      >
        {children}
      </LoadingButton>
    );
  } else {
    return (
      <LoadingButton
        variant="contained"
        loading={loading}
        color={color}
        // loadingIndicator="Saving…"
        // startIcon={<DeleteIcon />}
        // loadingPosition="start"
        startIcon={children == "Send" ? <Send sx={{ fontSize: 2 }} /> : ""}
        onClick={handleSubmit}
        disabled={disable}
        disableElevation
        sx={{
          marginRight: "0.6em",
          color: "#fff",
          border: `0.5px solid ${primaryColor}`,
          textTransform: "capitalize",
          padding : children == "Send" ?"6px 16px" :"4px 12px"
        }}
      >
        {children == "Send" ? (
          ""
        ) : (
          <span className="me-1 mb-1">
          <SaveOutline
            color={"#00000"}
            // title="abc"
            height="17px"
            width="17px"
          /></span>
        )}
        {children}
      </LoadingButton>
    );
  }
};

export default LoaderButton;
