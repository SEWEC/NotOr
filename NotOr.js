var dpr = window.devicePixelRatio;
console.log(dpr);
var fontSize = 2/dpr + "px";
console.log(fontSize);
document.getElementById("html").style.fontSize = fontSize;