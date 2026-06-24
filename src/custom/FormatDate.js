// const formatDate = (dateString, reverse = true) => {
//   if (!dateString) return ""; // Handle empty or undefined input

//   const date = new Date(dateString);
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
//   const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
//   if (reverse) {
//     return `${year}-${month}-${day}`;
//   } else {
//     return `${month}/${day}/${year}`;
//   }
// };


const formatDate = (dateString, reverse = true) => {
  if (!dateString) return ""; // Handle empty or undefined input

  // Split the dateString to get only the date part
  if (typeof dateString !== "string") {
  
    const formattedDate = dateString.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
  });
  console.log("formattedDate",formattedDate);
   return formattedDate
  }
  const datePart = dateString?.split("T")[0];
  const date = new Date(datePart + "T00:00:00Z"); // Ensure it's treated as UTC

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Add leading zero if needed
  const day = String(date.getUTCDate()).padStart(2, "0"); // Add leading zero if needed

  if (reverse) {
    return `${year}-${month}-${day}`;
  } else {
    return `${month}/${day}/${year}`;
  }
};
// const formatDate = (dateString, reverse = true) => {
//   if (!dateString) return ""; // Handle empty or undefined input

//   let year, month, day;

//   if (dateString instanceof Date) {
//     // Handle Date object
//     year = dateString.getFullYear();
//     month = String(dateString.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
//     day = String(dateString.getDate()).padStart(2, "0"); // Add leading zero if needed
//   } else {
//     // Handle date string
//     const dateStr = String(dateString);
//     [year, month, day] = dateStr.split('T')[0].split('-');
//   }

//   if (reverse) {
//     return `${year}-${month}-${day}`;
//   } else {
//     return `${month}/${day}/${year}`;
//   }
// };


// const formatDate = (dateString, reverse = true) => {
//   if (!dateString) return ""; // Handle empty or undefined input
//   // Split the date string into year, month, and day parts
//   const [year, month, day] = dateString.split(/[-\/]/).map(Number);
//   // Create a Date object using Date.UTC to avoid time zone issues
//   const date = new Date(Date.UTC(year, month - 1, day));
//   const formattedYear = date.getUTCFullYear();
//   const formattedMonth = String(date.getUTCMonth() + 1).padStart(2, "0"); // Add leading zero if needed
//   const formattedDay = String(date.getUTCDate()).padStart(2, "0"); // Add leading zero if needed
//   if (reverse) {
//     return `${formattedYear}-${formattedMonth}-${formattedDay}`;
//   } else {
//     return `${formattedMonth}/${formattedDay}/${formattedYear}`;
//   }
// };

export default formatDate;


