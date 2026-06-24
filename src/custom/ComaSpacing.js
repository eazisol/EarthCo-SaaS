const ComaSpacing = (str) => {
  if (str) {
    return str.split(",").join(",\n");
  }
};
export default ComaSpacing;
