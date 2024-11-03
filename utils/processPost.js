const cheerio = require('cheerio');


function processHtml(htmlContent, imageData) {
 const tailwindClassMap = {
  h1: 'text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight',
  h2: 'text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-3 leading-tight',
  h3: 'text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2',
  h4: 'text-xl font-medium text-gray-600 dark:text-gray-400 mb-2',
  h5: 'text-lg font-medium text-gray-500 dark:text-gray-500 mb-1',
  h6: 'text-base font-medium text-gray-400 dark:text-gray-600 mb-1',
  p: 'text-base leading-relaxed text-gray-600 dark:text-gray-300 mb-4',
  ul: 'list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 my-4',
  ol: 'list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 my-4',
   li: 'ml-4',
  img: 'rounded-lg max-w-full h-auto'
};
    try {

    const images = typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
    
    // Load HTML content
    const $ = cheerio.load(htmlContent);
        console.log("THE HTML!!!!!!!!" + htmlContent);
    // Replace image placeholders
    $('span').each((_, element) => {
      const text = $(element).text();

      //console.log(text);
         if (text.startsWith('<IMG:') && text.endsWith('>')) {
        const index = parseInt(text.match(/<IMG:(\d+)>/)[1]);
        console.log("THE INDEX:"+ index);
        if (images[index]) {
          const imageInfo = images[index];

          const imgElement = `<img src="${imageInfo.src}" alt="${imageInfo.alt || ''}" width="${imageInfo.width || ''}" height="${imageInfo.height || ''}" class="${tailwindClassMap.img}">`;
          $(element).replaceWith(imgElement);
        }
      }
    });

    // Add Tailwind classes
        Object.entries(tailwindClassMap).forEach(([tag, classes]) => {
        //console.log(classes);
      $(tag).each((_, element) => {
        const existingClasses = $(element).attr('class') || '';
        const newClasses = `${existingClasses} ${classes}`.trim();
        $(element).attr('class', newClasses);
      });
    });

    return $.html();
  } catch (error) {
    console.error('Error processing HTML:', error);
    return htmlContent;
  }
}


module.exports = {processHtml}