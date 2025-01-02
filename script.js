document.getElementById('generateButton').addEventListener('click', () => {
  const userInput = document.getElementById('userInput').value;
  const bgColor = document.getElementById('bgColor').value;
  const textColor = document.getElementById('textColor').value;
  const accentColor = document.getElementById('accentColor').value;

  // Get margin values
  const marginTop = parseInt(document.getElementById('marginTop').value, 10);
  const marginBottom = parseInt(document.getElementById('marginBottom').value, 10);
  const marginLeft = parseInt(document.getElementById('marginLeft').value, 10);
  const marginRight = parseInt(document.getElementById('marginRight').value, 10);

  const fontSize = parseInt(document.getElementById('fontSize').value, 10);

  if (!userInput.trim()) {
    alert('Please enter some text.');
    return;
  }

  // Replace all whitespace with non-breaking spaces
  const processedInput = userInput.replace(/ /g, '\u00A0'); // \u00A0 is the Unicode for non-breaking space

  const svg = generateSVG(processedInput, bgColor, textColor, accentColor, marginTop, marginBottom, marginLeft, marginRight, fontSize);
  document.getElementById('svgContainer').innerHTML = svg;

  // Show the SVG card and enable download button
  const svgCard = document.getElementById('svgCard');
  svgCard.style.display = 'block';
  const downloadButton = document.getElementById('downloadButton');
  const blob = new Blob([svg], {
    type: 'image/svg+xml'
  });
  const url = URL.createObjectURL(blob);
  downloadButton.href = url;
  downloadButton.download = 'generated.svg';
  downloadButton.style.display = 'block';
});

function generateSVG(text, bgColor, textColor, accentColor, marginTop, marginBottom, marginLeft, marginRight, fontSize) {
  // Regex to find text within brackets
  const regex = /<([^>]+)>/g;
  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        color: textColor
      });
    }
    // Accented text (without brackets)
    parts.push({
      text: match[1], // text between brackets
      color: accentColor
    });
    lastIndex = regex.lastIndex;
  }

  // Remaining text after the last match
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      color: textColor
    });
  }

  // Create SVG content
  const svgParts = parts.map((part, index) => {
    // Calculate x position for each part based on previous part's width
    let xPos = marginLeft;
    for (let i = 0; i < index; i++) {
      // Create a temporary span to measure text width
      const tempText = document.createElement('span');
      tempText.style.fontFamily = 'Droid Sans';
      tempText.style.fontSize = `${fontSize}px`;
      tempText.innerText = parts[i].text;
      document.body.appendChild(tempText);
      xPos += tempText.offsetWidth; // Update x position
      document.body.removeChild(tempText); // Clean up
    }
    return `<text x="${xPos}" y="${marginTop + fontSize}" font-family="Droid Sans" font-size="${fontSize}" fill="${part.color}">${part.text}</text>`;
  }).join('');

  // Estimate SVG dimensions
  const totalWidth = parts.reduce((acc, part) => {
    const tempText = document.createElement('span');
    tempText.style.fontFamily = 'Droid Sans';
    tempText.style.fontSize = `${fontSize}px`;
    tempText.innerText = part.text;
    document.body.appendChild(tempText);
    acc += tempText.offsetWidth; // Accumulate width
    document.body.removeChild(tempText); // Clean up
    return acc;
  }, 0);

  const svgHeight = marginTop + marginBottom + fontSize;

  return `<svg width="${totalWidth + marginLeft + marginRight}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="${totalWidth + marginLeft + marginRight}" height="${svgHeight}" fill="${bgColor}"/>${svgParts}</svg>`;
}