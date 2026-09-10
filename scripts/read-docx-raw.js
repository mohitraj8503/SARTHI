const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const filenames = [
  'Web_Foundations_UI_20_MCQs.docx',
  'Frontend_Frameworks_20_MCQs.docx',
  'Backend_Architecture_APIs_20_MCQs.docx',
  'Databases_DevOps_20_MCQs.docx',
  'Final_Assessment_40_MCQs.docx'
];

async function main() {
  const mcqDir = path.join(__dirname, '..', 'public', 'mcqs');
  const scratchDir = 'C:\\Users\\mohit\\.gemini\\antigravity-ide\\[CONV_ID_REPLACED]\\scratch';
  // Let's resolve scratch path dynamically using absolute path or temp path
  const targetScratchDir = 'C:\\Users\\mohit\\.gemini\\antigravity-ide\\brain\\49026c0b-4a60-4a7e-81c6-8eebb2e4ee6e\\scratch';
  
  if (!fs.existsSync(targetScratchDir)) {
    fs.mkdirSync(targetScratchDir, { recursive: true });
  }

  for (const filename of filenames) {
    const filePath = path.join(mcqDir, filename);
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      continue;
    }
    
    const content = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(content);
    const docXml = await zip.file('word/document.xml').async('text');
    
    // Extract all text nodes in w:t tags
    const matches = docXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
    const textContent = matches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join(' ');
    
    const txtName = filename.replace('.docx', '.txt');
    const outPath = path.join(targetScratchDir, txtName);
    fs.writeFileSync(outPath, textContent, 'utf8');
    console.log(`Wrote ${txtName} (${textContent.length} chars)`);
  }
}

main().catch(console.error);
