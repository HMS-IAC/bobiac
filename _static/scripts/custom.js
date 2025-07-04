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