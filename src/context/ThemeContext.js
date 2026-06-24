import React, { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Cookies from "js-cookie";
import { BRANDING_UPDATED_EVENT } from "../custom/companyBranding";

export const ThemeColorContext = createContext();

const ThemeColorProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(
    () => Cookies.get("PrimeryColor") || "#7c9c3d"
  );

  useEffect(() => {
    const handleBrandingUpdate = (event) => {
      if (event.detail?.primaryColor) {
        setPrimaryColor(event.detail.primaryColor);
      }
    };

    window.addEventListener(BRANDING_UPDATED_EVENT, handleBrandingUpdate);
    return () =>
      window.removeEventListener(BRANDING_UPDATED_EVENT, handleBrandingUpdate);
  }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
      customColor: {
        main: "#2C2C2C",
      },
    },
  });

  return (
    <ThemeColorContext.Provider value={{ setPrimaryColor }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeColorContext.Provider>
  );
};

export default ThemeColorProvider;
