// EstimateContext.js
import React, { createContext, useContext, useState } from "react";

const EstimateContext = createContext();

export const EstimateProvider = ({ children }) => {
  const [estimateLinkData, setEstimateLinkData] = useState({
    tblEstimateItems: [],
  });

  return (
    <EstimateContext.Provider value={{ estimateLinkData, setEstimateLinkData }}>
      {children}
    </EstimateContext.Provider>
  );
};

export const useEstimateContext = () => {
  return useContext(EstimateContext);
};
