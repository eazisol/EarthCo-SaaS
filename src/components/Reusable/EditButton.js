import React from 'react';
import { Button } from "@mui/material";
import { Edit } from '@mui/icons-material';


export const EditButton = ({ onClick, children }) => {
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
        border: "1px solid #404040",
        outlineColor: "black",
      },
    }}
    onClick={onClick}
    color="primary"
    startIcon={<Edit sx={{ padding: 0 }} />}
  >
    {children}
  </Button>
  )
}
