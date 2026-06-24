import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const FileUploadButton = ({ onClick, children,imagesAndPdfOnly=false,width }) => {
  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<CloudUploadIcon sx={{ fontSize: 2 }} />}
      sx={{
        color: "#404040",
        border: "1px solid #0000003d",
        borderRadius: "5px",
        marginRight: "0.5em",
        width:width,
        padding: "5px 12px",
        textTransform: "capitalize",
        "&:hover": {
          // backgroundColor: "#171717",
          // color: "white",
          border: "1px solid #404040",
          outlineColor: "black",
        },
      }}
    >
      &nbsp;{children}
      <VisuallyHiddenInput  type="file"
        accept={imagesAndPdfOnly?"image/*, .pdf":""}
        onChange={onClick} />
    </Button>
  );
};

export default FileUploadButton;
