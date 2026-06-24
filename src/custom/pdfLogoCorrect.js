export const getFileName = (path) => {
    if (!path) return "";
  
    // Remove query params & fragments
    let cleanPath = path.split("?")[0].split("#")[0];
  
    // Remove any leading/trailing quotes or spaces
    cleanPath = cleanPath.replace(/^['"]+|['"]+$/g, "").trim();
  
    return cleanPath.split(/[/\\]/).pop();
  }