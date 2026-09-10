const fs = require('fs');
const path = require('path');
const AdmZip = require('jszip');

async function main() {
  const filePath = '/home/mohitraj8503/.gemini/antigravity/brain/b7c3f59b-0293-41da-b048-3375e33c32b2/Tech_Tomorrow_Offer_Template.docx';
  const data = fs.readFileSync(filePath);
  const zip = await AdmZip.loadAsync(data);
  const docXml = await zip.file('word/document.xml').async('text');
  
  // Save docXml to a text file to read it
  fs.writeFileSync('scripts/docx-xml.xml', docXml);
  console.log('XML size:', docXml.length);
  
  // Search for placeholders in the XML text
  const placeholders = [
    'Student Name', 'Reference No', 'Degree', 'Program', 'University',
    'City', 'State', 'Internship Role', 'Duration', 'Start Date', 'End Date'
  ];
  placeholders.forEach(p => {
    console.log(`Contains "${p}":`, docXml.includes(p));
  });
}

main().catch(console.error);
