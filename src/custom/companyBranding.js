import Cookies from "js-cookie";
import { setPrimaryColor } from "./theme";

export const ADMIN_BASE_URL = "https://admin.earthcoapp.com";
export const BRANDING_UPDATED_EVENT = "company-branding-updated";

export const getCompanyLogoUrl = (logoPath) =>
  logoPath ? `${ADMIN_BASE_URL}${logoPath}` : null;

const updateFavicon = (url) => {
  if (!url) return;

  ["icon", "shortcut icon", "apple-touch-icon"].forEach((rel) => {
    const selector =
      rel === "icon"
        ? "link[rel='icon']"
        : `link[rel='${rel}']`;
    let link = document.querySelector(selector);

    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }

    link.href = url;
  });
};

export const applyCompanyBranding = (data) => {
  if (!data) return;

  const {
    CompanyLogoPath,
    PrimeryColor,
    SecondaryColor,
    CompanyName,
  } = data;

  if (PrimeryColor) {
    setPrimaryColor(PrimeryColor, SecondaryColor);
    Cookies.set("PrimeryColor", PrimeryColor, { expires: 30 });
    Cookies.set("SecondaryColor", SecondaryColor || "", { expires: 30 });
  }

  if (CompanyLogoPath) {
    Cookies.set("CompanyLogoPath", CompanyLogoPath, { expires: 30 });
    updateFavicon(getCompanyLogoUrl(CompanyLogoPath));
  }

  if (CompanyName) {
    Cookies.set("CompanyTitle", CompanyName, { expires: 30 });
    document.title = CompanyName;
  }

  window.dispatchEvent(
    new CustomEvent(BRANDING_UPDATED_EVENT, {
      detail: { primaryColor: PrimeryColor },
    })
  );
};

export const applyCachedCompanyBranding = () => {
  const primeryColor = Cookies.get("PrimeryColor");
  const secondaryColor = Cookies.get("SecondaryColor");
  const companyTitle = Cookies.get("CompanyTitle");
  const logoPath = Cookies.get("CompanyLogoPath");

  if (primeryColor) {
    setPrimaryColor(primeryColor, secondaryColor);
  }

  if (companyTitle) {
    document.title = companyTitle;
  }

  if (logoPath) {
    updateFavicon(getCompanyLogoUrl(logoPath));
  }
};

export const getCachedCompanyLogoPath = () => Cookies.get("CompanyLogoPath") || "";
