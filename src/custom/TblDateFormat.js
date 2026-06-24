// const TblDateFormat = (dateString, showTime = false) => {
//   if (!dateString) return ""; // Handle empty or undefined input

//   const date = new Date(dateString);
//   const year = date.getFullYear();
//   const monthNames = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//   ];
//   const month = monthNames[date.getMonth()];
//   const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed

//   let formattedDate = `${month}-${day}-${year}`;

//   if (showTime) {
//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight (0 becomes 12)
//     formattedDate += ` ${hours}:${minutes} ${ampm}`;
//   }

//   return formattedDate;
// };

//   export default TblDateFormat;
const TblDateFormat = (dateString, showTime = false, dateformat = false) => {
  if (!dateString) return ""; // Handle empty or undefined input

  const date = new Date(dateString);
  const year = date.getFullYear();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = date.getMonth(); // Get month index (0-11)
  const day = String(date.getDate()).padStart(2, "0");

  let formattedDate = dateformat
    ? `${String(month + 1).padStart(2, "0")}/${day}/${year}` // Numeric month (MM/DD/YYYY)
    : `${monthNames[month]}-${day}-${year}`; // Text month (Apr-24-2025)

  if (showTime) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format
    formattedDate += ` ${hours}:${minutes} ${ampm}`;
  }

  return formattedDate;
};

export default TblDateFormat;
