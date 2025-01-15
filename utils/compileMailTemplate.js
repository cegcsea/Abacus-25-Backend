import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the correct file path
const filePath = path.resolve(__dirname, './mailTemplate.ejs');

// Read and compile the template
const template = fs.readFileSync(filePath, 'utf-8');

const compileMailTemplate = (data) => {
    const compiledTemplate = ejs.compile(template);
    return compiledTemplate(data);
};

export default compileMailTemplate;
