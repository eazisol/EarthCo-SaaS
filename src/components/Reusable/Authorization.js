import React, { useContext } from "react";
import { DataContext } from "../../context/AppData";

const Authorization = ({ children, allowTo = [], hide }) => {
  const { loggedInUser } = useContext(DataContext);
  const isAuthorized = allowTo.includes(Number(loggedInUser.userRole));

  if (!isAuthorized && hide) {
    return null; // Hide the child element if not authorized and hide is true
  }
  if (isAuthorized) {
    return children;
  } else {
    return (
      <span style={{ position: "relative" }}>
        {children}
       
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0)",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          ></div>
       
      </span>
    );
  }
};

export default Authorization;
