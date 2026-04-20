#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoUser = 'graemewright2005-ux';
const repoName = 'Change-Management-Understanding';
const branch = 'main';
const basePath = `https://raw.githubusercontent.com/${repoUser}/${repoName}/${branch}/interrogation-materials`;

// Scan assignment folders
function scanAssignments() {
    const materialsDir = path.join(__dirname, '..', 'interrogation-materials');
    
    if (!fs.existsSync(materialsDir)) {
        console.error('interrogation-materials directory not found');
        return [];
    }

    const assignments = [];
    const folders = fs.readdirSync(materialsDir)
        .filter(f => f.startsWith('Assignment ') && fs.statSync(path.join(materialsDir, f)).isDirectory())
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });

    folders.forEach(folder => {
        const match = folder.match(/Assignment (\d+) - (\d+)/);
        if (match) {
            const [, number, code] = match;
            const folderPath = path.join(materialsDir, folder);
            const subFolders = fs.readdirSync(folderPath)
                .filter(f => fs.statSync(path.join(folderPath, f)).isDirectory())
                .sort();

            assignments.push({
                number: parseInt(number),
                code: parseInt(code),
                folders: subFolders.length > 0 ? subFolders : ['Materials']
            });
        }
    });

    return assignments;
}

// Scan root materials
function scanRootMaterials() {
    const materialsDir = path.join(__dirname, '..', 'interrogation-materials');
    
    if (!fs.existsSync(materialsDir)) {
        return [];
    }

    return fs.readdirSync(materialsDir)
        .filter(f => {
            const stat = fs.statSync(path.join(materialsDir, f));
            return stat.isFile() && !f.startsWith('.');
        })
        .sort();
}

// Generate HTML
function generateHTML(assignments, rootMaterials) {
    const assignmentCards = assignments.map(a => `
            <div class="assignment-card" aria-expanded="false">
                <div class="card-header" role="button" tabindex="0" aria-label="Assignment ${a.number} - ${a.code}, expand to see materials">
                    <h2>
                        Assignment ${a.number} – ${a.code}
                        <span class="toggle-icon" aria-hidden="true">▼</span>
                    </h2>
                </div>
                <div class="card-content">
                    ${a.folders.map(folder => `
                    <div class="section">
                        <span class="section-title">${folder}</span>
                        <ul class="file-list" aria-label="Files in ${folder}">
                            <li class="file-item">
                                <a href="https://github.com/${repoUser}/${repoName}/tree/${branch}/interrogation-materials/Assignment ${a.number} - ${a.code}/${folder}" class="file-link" target="_blank" rel="noopener noreferrer">
                                    <span class="icon" aria-hidden="true">📂</span>
                                    ${folder}
                                </a>
                            </li>
                        </ul>
                    </div>
                    `).join('')}
                </div>
            </div>
    `).join('');

    const rootMaterialsHTML = rootMaterials.map(material => `
            <div class="material-item">
                <a href="https://raw.githubusercontent.com/${repoUser}/${repoName}/${branch}/interrogation-materials/${material}" target="_blank" rel="noopener noreferrer">
                    ${material}
                </a>
            </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMI Level 5 – Change Management Understanding</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 2rem 1rem;
        }

        @media (prefers-color-scheme: dark) {
            body {
                background: #111827;
                color: #e5e7eb;
            }
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        header {
            margin-bottom: 3rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 1.5rem;
        }

        @media (prefers-color-scheme: dark) {
            header {
                border-bottom-color: #374151;
            }
        }

        h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            font-size: 1rem;
            color: #6b7280;
        }

        @media (prefers-color-scheme: dark) {
            .subtitle {
                color: #9ca3af;
            }
        }

        .assignments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }

        .assignment-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            transition: box-shadow 0.2s, border-color 0.2s;
        }

        .assignment-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-color: #d1d5db;
        }

        @media (prefers-color-scheme: dark) {
            .assignment-card {
                background: #1f2937;
                border-color: #374151;
            }

            .assignment-card:hover {
                border-color: #4b5563;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
        }

        .card-header {
            background: #f3f4f6;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            cursor: pointer;
            user-select: none;
        }

        .card-header:hover {
            background: #eff0f3;
        }

        @media (prefers-color-scheme: dark) {
            .card-header {
                background: #111827;
                border-bottom-color: #374151;
            }

            .card-header:hover {
                background: #1a202c;
            }
        }

        .card-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0;
        }

        .toggle-icon {
            display: inline-block;
            transition: transform 0.2s;
            font-size: 1.2rem;
            line-height: 1;
        }

        .assignment-card.expanded .toggle-icon {
            transform: rotate(180deg);
        }

        .card-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .assignment-card.expanded .card-content {
            max-height: 2000px;
        }

        .section {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }

        @media (prefers-color-scheme: dark) {
            .section {
                border-bottom-color: #374151;
            }
        }

        .section:last-child {
            border-bottom: none;
        }

        .section-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.75rem;
            display: block;
        }

        @media (prefers-color-scheme: dark) {
            .section-title {
                color: #9ca3af;
            }
        }

        .file-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .file-item {
            margin-bottom: 0.5rem;
        }

        .file-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #0891b2;
            text-decoration: none;
            font-size: 0.95rem;
            word-break: break-word;
        }

        @media (prefers-color-scheme: dark) {
            .file-link {
                color: #06b6d4;
            }
        }

        .file-link:hover {
            text-decoration: underline;
        }

        .icon {
            font-size: 1rem;
            flex-shrink: 0;
        }

        .empty-section {
            font-size: 0.9rem;
            color: #9ca3af;
            font-style: italic;
        }

        .root-materials {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #e5e7eb;
        }

        @media (prefers-color-scheme: dark) {
            .root-materials {
                border-top-color: #374151;
            }
        }

        .root-materials h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }

        .materials-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
        }

        .material-item {
            padding: 1rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            transition: box-shadow 0.2s;
        }

        .material-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        @media (prefers-color-scheme: dark) {
            .material-item {
                background: #1f2937;
                border-color: #374151;
            }

            .material-item:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
        }

        .material-item a {
            color: #0891b2;
            text-decoration: none;
            font-weight: 500;
            word-break: break-word;
        }

        @media (prefers-color-scheme: dark) {
            .material-item a {
                color: #06b6d4;
            }
        }

        .material-item a:hover {
            text-decoration: underline;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }

        @media (max-width: 640px) {
            h1 {
                font-size: 1.5rem;
            }

            .assignments-grid {
                grid-template-columns: 1fr;
            }

            .materials-list {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <h1 class="sr-only">CMI Level 5 Change Management Understanding Material Index</h1>

    <div class="container">
        <header>
            <h1>CMI Level 5 – Change Management Understanding</h1>
            <p class="subtitle">Complete material index for assignments, lesson materials, and references</p>
        </header>

        <main>
            <h2 class="sr-only">Assignment folders</h2>
            <div class="assignments-grid">${assignmentCards}</div>

            <section class="root-materials">
                <h2>Core Reference Materials</h2>
                <div class="materials-list">${rootMaterialsHTML}</div>
            </section>
        </main>
    </div>

    <script>
        document.querySelectorAll('.card-header').forEach(header => {
            header.addEventListener('click', () => {
                const card = header.parentElement;
                card.classList.toggle('expanded');
                const isExpanded = card.classList.contains('expanded');
                card.setAttribute('aria-expanded', isExpanded);
                header.setAttribute('aria-label', 
                    header.getAttribute('aria-label').replace(/(expand|collapse)/, isExpanded ? 'collapse' : 'expand')
                );
            });

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        });
    </script>
</body>
</html>`;
}

// Main execution
const assignments = scanAssignments();
const rootMaterials = scanRootMaterials();
const html = generateHTML(assignments, rootMaterials);

const outputPath = path.join(__dirname, '..', 'index.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`✅ index.html generated (${assignments.length} assignments, ${rootMaterials.length} root materials)`);
