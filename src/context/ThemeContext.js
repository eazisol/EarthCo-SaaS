import React, { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Cookies from "js-cookie";

export const ThemeColorContext = createContext();

const ThemeColorProvider = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState("#7c9c3d"); // default

  useEffect(() => {
    const color = Cookies.get("PrimeryColor");
    if (color) setPrimaryColor(color);
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
