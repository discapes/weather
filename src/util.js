export function addCss(fileName) {

  var head = document.head;
  var link = document.createElement("link");

  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = fileName;

  head.appendChild(link);
}

export function formatHHMMSS(date) {
  let hh = date.getHours();
  let mm = date.getMinutes();
  let ss = date.getSeconds();
  return [hh, mm, ss].map(n => String(n).padStart(2, '0')).join(':');
} 


export function formatHHMMSSDDMMYY(date) {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let hh = date.getHours();
  let mm = date.getMinutes();
  let ss = date.getSeconds();
  return [hh, mm, ss].map(n => String(n).padStart(2, '0')).join(':') + ' on ' + [d, m, y].join('.');
}

