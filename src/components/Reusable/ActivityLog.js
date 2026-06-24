import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Tooltip from '@mui/material/Tooltip';
import { IoMdCheckmarkCircle } from "react-icons/io";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

export default function ActivityLog({ activityLogs, type }) {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  function formatCreatedDate(createdDate) {
    const date = new Date(createdDate);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Always use 12-hour clock format (AM/PM)
    };
    return date.toLocaleString("en-US", options);
  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 300 }}
      role="presentation"
    // onClick={toggleDrawer(anchor, false)}
    // onKeyDown={toggleDrawer(anchor, false)}
    >
      <h4 className="ms-3 mt-3">Activity Log</h4>
      <List className="mx-2">
        {activityLogs.length <= 0 ? (
          <>
            <ListItem
              disablePadding
            // sx={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
            >
              <div className="row mx-2 mt-3">
                <div className="col-md-12">
                  <h5 className="mb-3 pb-0">No Activity To Show</h5>
                </div>
              </div>
            </ListItem>
          </>
        ) : (
          <>
            {activityLogs.map((text, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{ border: "1px solid #cccccc", borderRadius: "5px", marginTop: "5px" }}

              >
                <div className=" mx-2 mt-1 d-flex align-items-center " style={{ width: "100%" }}>
                  <h5 className="mb-0 pb-0 text-break " style={{ width: "10%" }}>
                    {text?.Status === 1 ? (


                      <Tooltip title="Unseen" arrow>
                        <span style={{ display: "inline-flex" }}>
                          <IoCheckmarkDoneSharp fontSize="small" />
                        </span>
                      </Tooltip>

                    ) : text?.Status === 2 ? (
                      <Tooltip title="Seen" arrow>
                        <span style={{ display: "inline-flex" }}>
                          <IoCheckmarkDoneSharp color='blue' fontSize="small" />
                        </span>
                      </Tooltip>
                    ) : (
                      ""
                    )}
                  </h5>
                  <div className="col-md-12  " style={{ width: "90%" }}>
                    <h5 className="mb-0 pb-0 text-break flex-grow-1">
                      <span style={{ fontSize: "12px" }}>{text.CreatedByName}  sent to {text.Email} {" "}</span>

                    </h5>
                    <span style={{ fontSize: "10px" }}>  {formatCreatedDate(text.CreatedDate)}</span>
                  </div>

                  {/* <div className="col-md-12 text-break">
                    <p>
                      sent to {text.Email} on{" "}
                      {formatCreatedDate(text.CreatedDate)}
                    </p>
                  </div> */}
                </div>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <Button
        className="me-2"
        variant="outlined"
        color="info"
        onClick={toggleDrawer("right", true)}
      >
        Activity
      </Button>
      <Drawer
        anchor={"right"}
        open={state["right"]}
        // hideBackdrop={true}
        onClose={toggleDrawer("right", false)}
      >
        {list("right")}
      </Drawer>
    </>
  );
}
