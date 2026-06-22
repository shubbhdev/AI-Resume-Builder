const fs = require('fs');
let code = fs.readFileSync('src/types/database.ts', 'utf8');

// The pattern for the end of a table definition is finding the 'Update: { ... }' block.
// Since each table has Row, Insert, Update, we can match the end of Update block 
// and append Relationships: [].
const result = code.replace(/(Update:\s*{[^}]*})/g, '$1\n        Relationships: []');

fs.writeFileSync('src/types/database.ts', result);
