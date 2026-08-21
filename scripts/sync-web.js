#!/usr/bin/env node
// Reads web/index.html and generates app/src/web/goalDetailHtml.ts
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
// Read from the Vite build output (single-file bundle with inlined JS/CSS)
const htmlPath = path.join(root, 'web', 'dist', 'index.html');
const outPath = path.join(root, 'app', 'src', 'web', 'goalDetailHtml.ts');

const html = fs.readFileSync(htmlPath, 'utf-8');

const output = `// AUTO-GENERATED — do not edit directly. Source: web/index.html
// Run \`yarn sync:web\` from the monorepo root to regenerate.
export const GOAL_DETAIL_HTML = ${JSON.stringify(html)};
`;

fs.writeFileSync(outPath, output, 'utf-8');
console.log('synced web/index.html → app/src/web/goalDetailHtml.ts');
