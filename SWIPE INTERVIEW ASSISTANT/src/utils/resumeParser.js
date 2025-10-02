import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export const parseResume = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        let text = '';

        if (file.type === 'application/pdf') {
          text = await parsePDF(e.target.result);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          text = await parseDocx(e.target.result);
        }

        const extracted = extractContactInfo(text);
        resolve({ text, ...extracted });
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

const parsePDF = async (arrayBuffer) => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    return 'Error parsing PDF content.';
  }
};

const parseDocx = async (arrayBuffer) => {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    return 'Error parsing DOCX content.';
  }
};

const extractContactInfo = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

  const emails = text.match(emailRegex);
  const phones = text.match(phoneRegex);
  const nameMatch = text.match(nameRegex);

  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let name = '';

  if (nameMatch) {
    name = nameMatch[1];
  } else {
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 50 && /^[A-Za-z\s]+$/.test(firstLine)) {
      name = firstLine;
    }
  }

  // Extract summary
  const summary = extractSummary(text);

  return {
    name: name || '',
    email: emails ? emails[0] : '',
    phone: phones ? phones[0]?.trim() : '',
    summary: summary || ''
  };
};

const extractSummary = (text) => {
  console.log('🔍 Starting summary extraction...');
  console.log('📄 Text length:', text.length);
  console.log('📄 First 300 chars:', text.substring(0, 300));

  // Clean and normalize the text first
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Common summary section keywords - more comprehensive
  const summaryKeywords = [
    'summary', 'profile', 'objective', 'about', 'overview',
    'professional summary', 'career objective', 'personal statement',
    'career summary', 'executive summary', 'professional profile',
    'career profile', 'personal profile', 'introduction',
    'professional overview', 'background', 'highlights'
  ];

  // Split text into lines and clean them
  const allLines = cleanText.split('\n');
  const lines = allLines
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log('📝 Total lines found:', lines.length);
  console.log('📝 First 10 lines:', lines.slice(0, 10));

  // Method 1: Look for explicit summary section headers
  console.log('🔍 Method 1: Looking for summary headers...');
  let summaryStartIndex = -1;
  let summaryEndIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();

    // Check if line is a summary header
    const isHeader = summaryKeywords.some(keyword => {
      return line === keyword ||
        (line.includes(keyword) && line.length < 60);
    });

    if (isHeader) {
      summaryStartIndex = i + 1;
      console.log('✅ Found summary header at line', i, ':', lines[i]);
      break;
    }
  }

  if (summaryStartIndex !== -1 && summaryStartIndex < lines.length) {
    // Find the end of summary section
    for (let i = summaryStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      // Stop if we hit common section headers
      const sectionHeaders = [
        'experience', 'education', 'skills', 'work', 'employment',
        'projects', 'certifications', 'achievements', 'qualifications',
        'technical skills', 'work experience', 'professional experience',
        'career history', 'employment history', 'core competencies'
      ];

      const isNextSection = sectionHeaders.some(header => {
        const lowerLine = line.toLowerCase();
        return lowerLine === header ||
          (lowerLine.includes(header) && line.length < 60);
      });

      if (isNextSection) {
        summaryEndIndex = i;
        console.log('🛑 Found next section at line', i, ':', line);
        break;
      }

      // Stop after 8 lines max for summary
      if (i - summaryStartIndex >= 8) {
        summaryEndIndex = i;
        console.log('🛑 Reached max lines for summary');
        break;
      }
    }

    if (summaryEndIndex === -1) {
      summaryEndIndex = Math.min(summaryStartIndex + 5, lines.length);
    }

    // Extract and clean the summary
    const summaryLines = lines.slice(summaryStartIndex, summaryEndIndex);
    console.log('📝 Summary lines:', summaryLines);

    let summary = summaryLines.join(' ').trim();

    if (summary.length > 15) {
      // Clean up the summary
      summary = summary.replace(/\s+/g, ' '); // Remove extra whitespace
      summary = summary.replace(/[•·▪▫\-◦●]\s*/g, ''); // Remove bullet points
      summary = summary.replace(/^[^a-zA-Z]+/, ''); // Remove leading non-letters
      summary = summary.trim();

      // Limit to reasonable length
      if (summary.length > 250) {
        summary = summary.substring(0, 250).trim() + '...';
      }

      console.log('✅ Method 1 success:', summary);
      return summary;
    }
  }

  // Method 2: Look for professional description paragraphs
  console.log('🔍 Method 2: Looking for professional descriptions...');
  const professionalKeywords = [
    'experienced', 'professional', 'skilled', 'specialist', 'expert',
    'years', 'responsible', 'manage', 'develop', 'lead', 'coordinate',
    'passionate', 'dedicated', 'motivated', 'proven', 'successful',
    'accomplished', 'results-driven', 'detail-oriented', 'team player'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip if it looks like contact info, name, or section header
    if (line.includes('@') ||
      /^\+?[\d\s\-()]+$/.test(line) ||
      line.length < 30 ||
      /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(line) ||
      line.toLowerCase().match(/^(experience|education|skills|work)/)) {
      continue;
    }

    // Look for sentences with professional keywords
    const keywordCount = professionalKeywords.filter(keyword =>
      line.toLowerCase().includes(keyword)
    ).length;

    if (keywordCount >= 1 && line.length > 50 && line.length < 300) {
      let summary = line.trim();
      summary = summary.replace(/[•·▪▫\-◦●]\s*/g, '');
      summary = summary.replace(/^[^a-zA-Z]+/, '');
      summary = summary.trim();

      if (summary.length > 30) {
        if (summary.length > 200) {
          summary = summary.substring(0, 200).trim() + '...';
        }

        console.log('✅ Method 2 success:', summary);
        return summary;
      }
    }
  }

  // Method 3: Try to find a substantial descriptive paragraph
  console.log('🔍 Method 3: Looking for substantial paragraphs...');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip obvious non-summary content
    if (line.includes('@') ||
      /^\+?[\d\s\-()]+$/.test(line) ||
      /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(line) ||
      line.length < 40) {
      continue;
    }

    // Look for descriptive content
    const hasDescriptiveWords = /\b(with|having|including|specializing|focusing|working)\b/i.test(line);
    const hasActionWords = /\b(manage|develop|lead|create|implement|design|analyze)\b/i.test(line);

    if ((hasDescriptiveWords || hasActionWords) && line.length > 60 && line.length < 350) {
      let summary = line.trim();
      summary = summary.replace(/[•·▪▫\-◦●]\s*/g, '');
      summary = summary.replace(/^[^a-zA-Z]+/, '');
      summary = summary.trim();

      if (summary.length > 40) {
        if (summary.length > 180) {
          summary = summary.substring(0, 180).trim() + '...';
        }

        console.log('✅ Method 3 success:', summary);
        return summary;
      }
    }
  }

  console.log('❌ No summary found');
  return '';
};