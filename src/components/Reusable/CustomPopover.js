import React, { useState } from "react";
import Popover from "@mui/material/Popover";

const CustomPopover = ({ trigger, children }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <button
        onClick={handleClick}
        aria-describedby={id}
        style={{ border: "none", backgroundColor: "transparent" }}
      >
        {trigger}
      </button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        elevation={2}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <span >{children}</span>
      </Popover>
    </>
  );
};

export default CustomPopover;
