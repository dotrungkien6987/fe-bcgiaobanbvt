import { format, getTime, formatDistanceToNow } from "date-fns";

export function fDate(date) {
  // return format(new Date(date), "dd MMMM yyyy");
  return format(new Date(date), "dd-MM-yyyy");
}

export function fDateTime(date) {
  return format(new Date(date), "dd MMM yyyy HH:mm");
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), "dd/MM/yyyy hh:mm p");
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}

export function formatDateTime(isoString) {
  const dateTime = new Date(isoString);

  const day = dateTime.getDate();
  const month = dateTime.getMonth() + 1; // Tháng bắt đầu từ 0
  const year = dateTime.getFullYear();

  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();

  // Định dạng số để đảm bảo hiển thị dưới dạng 01, 02, ..., 09
  const formattedDay = (day < 10) ? `0${day}` : day;
  const formattedMonth = (month < 10) ? `0${month}` : month;
  const formattedHours = (hours < 10) ? `0${hours}` : hours;
  const formattedMinutes = (minutes < 10) ? `0${minutes}` : minutes;

  const formattedDateTime = `${formattedHours}:${formattedMinutes}  ${formattedDay}/${formattedMonth}/${year}`;

  return formattedDateTime;
}

function addLeadingZero(value) {
  return value < 10 ? `0${value}` : value;
}

export  function formatTimeFromISOString(isoString) {
  const dateObject = new Date(isoString);
  const hours = addLeadingZero(dateObject.getHours());
  const minutes = addLeadingZero(dateObject.getMinutes());
  const seconds = addLeadingZero(dateObject.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

export function formatDate_getDate(inputDate) {
  // Chuyển đổi chuỗi thời gian sang đối tượng Date
  const date = new Date(inputDate);
  // Lấy ngày, tháng, và năm
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng trong JS bắt đầu từ 0
  const year = date.getFullYear();
  // Kết hợp lại theo format ngày/tháng/năm
  return `${day}/${month}/${year}`;
}

