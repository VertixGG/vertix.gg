const fs = require("fs");



// Read the JSON file
const jsonData = fs.readFileSync('./ru.json', 'utf8');

// Parse the JSON into a JavaScript object
const data = JSON.parse(jsonData);

// Reduce "attributes" from embeds
const reducedEmbeds = data.embeds.map((embed) => {
	const { name, content } = embed;
	const { attributes, ...rest } = content;
	return { name, content: { ...attributes, ...rest } };
});

// Update the original data with the reduced embeds
data.embeds = reducedEmbeds;

// Convert the data back to JSON format
const updatedJsonData = JSON.stringify(data, null, 2);

// Write the updated JSON data to a file
fs.writeFileSync('./ru.json', updatedJsonData);

console.log('Data saved successfully.')
