import React, { createContext, useRef, useState } from "react";

const StyleContext = createContext();

const StyleData = ({ children }) => {
  const [mainControl, setMainControl] = useState("desktop");
  const [showSubMenu, setShowSM] = useState(false);
  const [showIrrMenu, setShowIrrMenu] = useState(false);
  const [showPlMenu, setShowPlMenu] = useState(false)
  const [showForemanQcMenu, setShowForemanQcMenu] = useState(false)
  const [foremanOperations, setForemanOperations] = useState(false)
  const eliminate = useRef(null);

  const statesIndex = {
    showSubMenu,
    setShowSM,
    mainControl,
    setMainControl,
    eliminate,
    showIrrMenu,
    setShowIrrMenu,
    showPlMenu, 
    setShowPlMenu,
    showForemanQcMenu,
    setShowForemanQcMenu, 
    foremanOperations,
    setForemanOperations
  };

  return (
    <StyleContext.Provider value={statesIndex}>
      {children}
    </StyleContext.Provider>
  );
};

export default StyleData;
export { StyleContext };
