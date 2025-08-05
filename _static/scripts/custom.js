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
    // Hardcoded list of raw GitHub URLs for each zip file
    const zipFiles = [
        '04_python_for_bioimage_analysis.zip',
        '05_segmentation_cellpose.zip',
        '05_segmentation_cellpose_training.zip',
        '05_segmentation_ilastik.zip',
        '07_measurement_and_quantification.zip',
        '08_object_based_colocalization.zip',
        '08_pixel_intensity_based_coloc.zip'
    ];
    // Change these to your repo info
    const githubRawBase = 'https://raw.githubusercontent.com/fdrgsp/bobiac/main/_static/data/';
    if (zipFiles.length === 0) {
        alert('No zip files found in the GitHub data folder.');
        return;
    }
    // Show loading indicator
    const indicator = document.createElement('div');
    indicator.id = 'download-indicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '0';
    indicator.style.left = '0';
    indicator.style.width = '100vw';
    indicator.style.height = '100vh';
    indicator.style.background = 'rgba(0,0,0,0.4)';
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.justifyContent = 'center';
    indicator.style.zIndex = '9999';
    indicator.innerHTML = '<div style="background: #fff; padding: 30px 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 1.2em; text-align: center;">Downloading course data...<br><span id="download-progress"></span></div>';
    document.body.appendChild(indicator);
    
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
    // Fetch and add each file to the zip from GitHub raw URLs
    for (let i = 0; i < zipFiles.length; i++) {
        const filename = zipFiles[i];
        try {
            const fileResponse = await fetch(githubRawBase + filename);
            if (!fileResponse.ok) throw new Error(`HTTP ${fileResponse.status}`);
            const fileBlob = await fileResponse.blob();
            dataFolder.file(filename, fileBlob);
            // Update progress
            document.getElementById('download-progress').textContent = `(${i+1}/${zipFiles.length})`;
        } catch (error) {
            console.error(`Failed to fetch ${filename} from GitHub:`, error);
        }
    }
    // Generate and download the combined zip
    document.getElementById('download-progress').textContent = 'Zipping files...';
    const zipBlob = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(zipBlob);
    link.download = 'bobiac_data.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
    // Remove indicator
    document.body.removeChild(indicator);
}

// Function to download all PDF files
async function downloadPdfs() {
    // Show loading indicator
    const indicator = document.createElement('div');
    indicator.id = 'download-indicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '0';
    indicator.style.left = '0';
    indicator.style.width = '100vw';
    indicator.style.height = '100vh';
    indicator.style.background = 'rgba(0,0,0,0.4)';
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.justifyContent = 'center';
    indicator.style.zIndex = '9999';
    indicator.innerHTML = '<div style="background: #fff; padding: 30px 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 1.2em; text-align: center;">Downloading PDFs...<br><span id="download-progress"></span></div>';
    document.body.appendChild(indicator);

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
    let fileCount = 0;
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
                        fileCount++;
                        document.getElementById('download-progress').textContent = `(${fileCount} PDFs added)`;
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
        document.body.removeChild(indicator);
        return;
    }

    document.getElementById('download-progress').textContent = 'Zipping files...';
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
    // Remove indicator
    document.body.removeChild(indicator);
}

// Function to download all notebook files
async function downloadNotebooks() {
    // Show loading indicator
    const indicator = document.createElement('div');
    indicator.id = 'download-indicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '0';
    indicator.style.left = '0';
    indicator.style.width = '100vw';
    indicator.style.height = '100vh';
    indicator.style.background = 'rgba(0,0,0,0.4)';
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.justifyContent = 'center';
    indicator.style.zIndex = '9999';
    indicator.innerHTML = '<div style="background: #fff; padding: 30px 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 1.2em; text-align: center;">Downloading student notebooks...<br><span id="download-progress"></span></div>';
    document.body.appendChild(indicator);

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
    let fileCount = 0;
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
                        fileCount++;
                        document.getElementById('download-progress').textContent = `(${fileCount} notebooks added)`;
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
        document.body.removeChild(indicator);
        return;
    }

    document.getElementById('download-progress').textContent = 'Zipping files...';
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
    // Remove indicator
    document.body.removeChild(indicator);
}

// Function to download all teacher notebook files
async function downloadNotebooksTeacher() {
    // Show loading indicator
    const indicator = document.createElement('div');
    indicator.id = 'download-indicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '0';
    indicator.style.left = '0';
    indicator.style.width = '100vw';
    indicator.style.height = '100vh';
    indicator.style.background = 'rgba(0,0,0,0.4)';
    indicator.style.display = 'flex';
    indicator.style.alignItems = 'center';
    indicator.style.justifyContent = 'center';
    indicator.style.zIndex = '9999';
    indicator.innerHTML = '<div style="background: #fff; padding: 30px 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 1.2em; text-align: center;">Downloading teacher notebooks...<br><span id="download-progress"></span></div>';
    document.body.appendChild(indicator);

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
    let fileCount = 0;
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
                        fileCount++;
                        document.getElementById('download-progress').textContent = `(${fileCount} notebooks added)`;
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
        document.body.removeChild(indicator);
        return;
    }

    document.getElementById('download-progress').textContent = 'Zipping files...';
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
    // Remove indicator
    document.body.removeChild(indicator);
}