const p = require('pdf-parse');
console.log("Type of p:", typeof p);
if (typeof p === 'function') console.log("p is a function!");
else console.log("p is NOT a function");
console.log("Type of p.default:", typeof p.default);
console.log("Type of p.PDFParse:", typeof p.PDFParse);
