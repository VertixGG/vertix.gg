import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sortJsonFiles = (dir) => {
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        const jsonFiles = files.filter(file => path.extname(file) === '.json');

        jsonFiles.forEach(file => {
            const filePath = path.join(dir, file);

            fs.readFile(filePath, 'utf8', (readErr, data) => {
                if (readErr) {
                    console.error('Error reading file:', readErr);
                    return;
                }

                let jsonData;
                try {
                    jsonData = JSON.parse(data);
                } catch (parseErr) {
                    console.error('Error parsing JSON:', parseErr);
                    return;
                }

                const sortedJsonData = sortElementsByName(jsonData);
                fs.writeFile(filePath, JSON.stringify(sortedJsonData, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing file:', writeErr);
                    } else {
                        console.log(`File ${file} has been sorted and saved.`);
                    }
                });
            });
        });
    });
};

const sortByName = (a, b) => {
    if (a.name && b.name) {
        return a.name.localeCompare(b.name);
    }
    return 0; // If any name is undefined, do not change their order
};

const sortElementsByName = (data) => {
    const sortElements = (elements) => elements.sort(sortByName);

    const traverseAndSort = (obj) => {
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                obj[key] = sortElements(obj[key]);
                obj[key].forEach(traverseAndSort);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                traverseAndSort(obj[key]);
            }
        }
    };

    traverseAndSort(data);
    return data;
};

sortJsonFiles(__dirname);
