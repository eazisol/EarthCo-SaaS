const imagePathCorrector = (string) => {
  if (string) {
    const correctedString = `https://image.earthcoapp.com/${string
      ?.replace("Uploading", "")
      ?.replace(/\\/g, "/")
      .replace(".jpg", ".png")
      .replace(".jpeg", ".png")
      }`;
    // return `https://34.94.249.102/GetImages${(string)?.replace('\\Uploading', '')}`
    // const correctedString = "https://api.earthcoapp.com//Uploading/Punchlist/PunchlistFile0139.png"
   
    return correctedString;
    // return `https://i.ibb.co/zP2bw4q/6-Snapchat-17794545842.jpg`
  } else {
    return "";
  }
};

export default imagePathCorrector;
