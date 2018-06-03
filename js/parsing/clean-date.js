function formatDate(sDate) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  date = new Date(sDate)
  var day = date.getDate();
  var monthIndex = date.getMonth();

  return day + ' ' + monthNames[monthIndex];
}
