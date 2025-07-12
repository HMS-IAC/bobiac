// Force all external links to open in a new tab
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        console.log("Modifying link:", link.href);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // handle Markdown links to download of files with specified extensions
    const markdownLinks = document.querySelectorAll('a');
    markdownLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const href = link.getAttribute('href');
            if (href) {
                const fileExtensions = [
                    '.pdf', '.tif', '.tiff', '.png',
                    '.jpg', '.jpeg', '.zip', '.ipynb'
                ];
                if (fileExtensions.some(ext => href.endsWith(ext))) {
                    event.preventDefault(); // Prevent navigation
                    const downloadLink = document.createElement('a');
                    downloadLink.href = href;
                    downloadLink.download = href.split('/').pop();
                    document.body.appendChild(downloadLink); // Ensure it's in DOM
                    downloadLink.click();
                    document.body.removeChild(downloadLink); // Clean up
                }
            }
        });
    });
});

// Function to download all course data files
async function downloadScript() {
    // Fetch the directory listing from _static/data
    const response = await fetch('../_static/data/');
    const html = await response.text();
    
    // Parse HTML to find all .zip files
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a[href$=".zip"]');
    
    // Extract zip filenames
    const zipFiles = Array.from(links).map(link => {
        const href = link.getAttribute('href');
        return href.split('/').pop(); // Get just the filename
    }).filter(filename => filename.endsWith('.zip'));
    
    if (zipFiles.length === 0) {
        alert('No zip files found in the data directory.');
        return;
    }
    
    // Load JSZip library
    let JSZip;
    if (window.JSZip) {
        JSZip = window.JSZip;
    } else {
        const module = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
        JSZip = module.default || module.JSZip || window.JSZip;
    }
    
    const zip = new JSZip();
    const dataFolder = zip.folder("bobiac_data");
    
    // Fetch and add each file to the zip
    for (const filename of zipFiles) {
        try {
            const fileResponse = await fetch(`../_static/data/${filename}`);
            const fileBlob = await fileResponse.blob();
            dataFolder.file(filename, fileBlob);
        } catch (error) {
            console.error(`Failed to fetch ${filename}:`, error);
        }
    }
    
    // Generate and download the combined zip
    const zipBlob = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(zipBlob);
    link.download = 'bobiac_data.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
}

// Function to download all PDF files
async function downloadPdfs() {
    // Load JSZip library
    let JSZip;
    if (window.JSZip) {
        JSZip = window.JSZip;
    } else {
        const module = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
        JSZip = module.default || module.JSZip || window.JSZip;
    }
    
    const zip = new JSZip();
    const pdfFolder = zip.folder("bobiac_pdfs");
    
    // Function to recursively scan a directory for PDFs
    async function scanDirectory(path, targetFolder) {
        try {
            const response = await fetch(path);
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a');
            
            for (const link of links) {
                const href = link.getAttribute('href');
                if (!href || href === '../' || href === './') {
                  continue;
                }
                
                const fullPath = path + href;
                
                if (href.endsWith('/')) {
                    // It's a directory, scan recursively
                    const subFolderName = href.replace('/', '');
                    const subFolder = targetFolder.folder(subFolderName);
                    await scanDirectory(fullPath, subFolder);
                } else if (href.endsWith('.pdf')) {
                    // It's a PDF file, add it to the zip
                    try {
                        const fileResponse = await fetch(fullPath);
                        const fileBlob = await fileResponse.blob();
                        targetFolder.file(href, fileBlob);
                    } catch (error) {
                        console.error(`Failed to fetch ${href}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to scan directory ${path}:`, error);
        }
    }
    
    // Start scanning from the pdfs directory
    await scanDirectory('../pdfs/', pdfFolder);
    
    // Check if any files were added
    const hasFiles = Object.keys(pdfFolder.files).length > 0;
    if (!hasFiles) {
        alert('No PDF files found in the pdfs directory.');
        return;
    }
    
    // Generate and download the combined zip
    const zipBlob = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(zipBlob);
    link.download = 'bobiac_pdfs.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
}

// Function to download all notebook files
async function downloadNotebooks() {
    // Load JSZip library
    let JSZip;
    if (window.JSZip) {
        JSZip = window.JSZip;
    } else {
        const module = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
        JSZip = module.default || module.JSZip || window.JSZip;
    }
    
    const zip = new JSZip();
    const notebookFolder = zip.folder("bobiac_notebooks_student");
    
    // Function to recursively scan a directory for notebook files
    async function scanDirectory(path, targetFolder) {
        try {
            const response = await fetch(path);
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a');
            
            for (const link of links) {
                const href = link.getAttribute('href');
                if (!href || href === '../' || href === './') {
                  continue;
                }
                
                const fullPath = path + href;
                
                if (href.endsWith('/')) {
                    // It's a directory, scan recursively
                    const subFolderName = href.replace('/', '');
                    const subFolder = targetFolder.folder(subFolderName);
                    await scanDirectory(fullPath, subFolder);
                } else if (href.endsWith('.ipynb')) {
                    // It's a notebook file, add it to the zip
                    try {
                        const fileResponse = await fetch(fullPath);
                        const fileBlob = await fileResponse.blob();
                        targetFolder.file(href, fileBlob);
                    } catch (error) {
                        console.error(`Failed to fetch ${href}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to scan directory ${path}:`, error);
        }
    }
    
    // Start scanning from the notebooks directory
    await scanDirectory('../notebooks/', notebookFolder);
    
    // Check if any files were added
    const hasFiles = Object.keys(notebookFolder.files).length > 0;
    if (!hasFiles) {
        alert('No student notebook files found in the notebooks directory.');
        return;
    }
    
    // Generate and download the combined zip
    const zipBlob = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(zipBlob);
    link.download = 'bobiac_notebooks_student.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
}

// Function to download all teacher notebook files
async function downloadNotebooksTeacher() {
    // Load JSZip library
    let JSZip;
    if (window.JSZip) {
        JSZip = window.JSZip;
    } else {
        const module = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
        JSZip = module.default || module.JSZip || window.JSZip;
    }
    
    const zip = new JSZip();
    const notebookFolder = zip.folder("bobiac_notebooks_teacher");
    
    // Function to recursively scan a directory for notebook files
    async function scanDirectory(path, targetFolder) {
        try {
            const response = await fetch(path);
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a');
            
            for (const link of links) {
                const href = link.getAttribute('href');
                if (!href || href === '../' || href === './') {
                  continue;
                }
                
                const fullPath = path + href;
                
                if (href.endsWith('/')) {
                    // It's a directory, scan recursively
                    const subFolderName = href.replace('/', '');
                    const subFolder = targetFolder.folder(subFolderName);
                    await scanDirectory(fullPath, subFolder);
                } else if (href.endsWith('.ipynb')) {
                    // It's a notebook file, add it to the zip
                    try {
                        const fileResponse = await fetch(fullPath);
                        const fileBlob = await fileResponse.blob();
                        targetFolder.file(href, fileBlob);
                    } catch (error) {
                        console.error(`Failed to fetch ${href}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to scan directory ${path}:`, error);
        }
    }
    
    // Start scanning from the notebooks_teacher directory
    await scanDirectory('../notebooks_teacher/', notebookFolder);
    
    // Check if any files were added
    const hasFiles = Object.keys(notebookFolder.files).length > 0;
    if (!hasFiles) {
        alert('No teacher notebook files found in the notebooks_teacher directory.');
        return;
    }
    
    // Generate and download the combined zip
    const zipBlob = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(zipBlob);
    link.download = 'bobiac_notebooks_teacher.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
}