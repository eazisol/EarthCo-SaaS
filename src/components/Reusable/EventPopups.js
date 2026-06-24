import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const EventPopups = ({ open, setOpen, text, color }) => {
  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Stack spacing={6} sx={{ width: "100%" }}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        sx={{ marginTop: "5em" }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Set position to top right
        transformOrigin={{ vertical: "top", horizontal: "right" }} // Set position to top right
        
      >
        <Alert
          onClose={handleClose}
          severity={color}
          sx={{ minWidth: "30em", marginTop: "3em" }}
        >
          {text}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default EventPopups;
