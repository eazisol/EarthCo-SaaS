import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import RoutesContext from "./context/RoutesContext";
import DataFun from "./context/AppData";
import StyleData from "./context/StyleData";
import ThemeColorProvider from "./context/ThemeContext";
import { applyCachedCompanyBranding } from "./custom/companyBranding";

applyCachedCompanyBranding();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <RoutesContext>
    <DataFun>
      <StyleData>
        {/* <ThemeProvider theme={theme}> */}
        <ThemeColorProvider>
          <div id="main-wrapper" className="show">
            <App />
          </div>  
        </ThemeColorProvider>
        {/* </ThemeProvider> */}
      </StyleData>
    </DataFun>
  </RoutesContext>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
