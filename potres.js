const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // Launch a headless browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the webpage
    await page.goto('https://www.potresi.hr/');

    // Wait for the table to load
    await page.waitForSelector('#earthquakestableeu');

    // Extract data from the table
    const tableData = await page.evaluate(() => {
        // Get all rows from the table body
        const rows = Array.from(document.querySelectorAll('#earthquakestableeu tbody tr'));

        return rows.map(row => {
            // Get each cell within the row
            const columns = row.querySelectorAll('td');

            // Extract text content from each cell
            return {
                region: columns[0].textContent.trim(),
                magnitude: columns[1].textContent.trim(),
                date: columns[2].textContent.trim(),
                time: columns[3].textContent.trim(),
                depth: columns[4].textContent.trim(),
                latitude: columns[5].textContent.trim(),
                longitude: columns[6].textContent.trim(),
            };
        });
    });

    // Save the scraped data to a JSON file
    fs.writeFileSync('earthquake_data.json', JSON.stringify(tableData, null, 2));

    console.log('Data has been scraped and saved to earthquake_data.json');

    // Close the browser
    await browser.close();
})();