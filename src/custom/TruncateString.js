// function truncateString(str, length) {
//   if (str) {
//     if (str?.length <= length) {
//       return str;
//     } else {
//       return str?.slice(0, length) + "...";
//     }
//   }
// }
// export default truncateString;

function truncateString(str, length) {
  if (str === null || str === undefined) return "";
  
  // Convert numbers or other types safely to string
  const s = typeof str === "string" ? str : String(str);

  return s.length <= length ? s : s.slice(0, length) + "...";
}
export default truncateString;
