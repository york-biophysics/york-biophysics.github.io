// 'https://york-biophysics-endpoint-lewis-frames-projects.vercel.app/api/publications?scholarId=q9e0j20AAAAJ`
    

const axios = require('axios');
const { BlobServiceClient } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Vercel Blob Store connection string
const blobServiceClient = new BlobServiceClient('Your_Connection_String_Here');
const containerName = 'my-container';
const blobName = 'publications.json';
const tempFilePath = path.join(__dirname, 'temp-publications.json');

// Scholar ID and API URL
const scholarId = 'q9e0j20AAAAJ';
const apiUrl = `https://york-biophysics-endpoint-lewis-frames-projects.vercel.app/api/publications?scholarId=${scholarId}`;

// Function to fetch the file metadata
async function fetchFileMetadata() {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    try {
        const properties = await blobClient.getProperties();
        return properties.lastModified;
    } catch (error) {
        if (error.statusCode === 404) {
            return null;
        }
        throw error;
    }
}

// Function to fetch the file from the API
async function fetchFileFromApi() {
    try {
        const response = await axios.get(apiUrl);
        fs.writeFileSync(tempFilePath, JSON.stringify(response.data));
        return tempFilePath;
    } catch (error) {
        console.error('Error fetching file from API:', error);
        throw error;
    }
}

// Function to upload the file to Blob Storage
async function uploadFileToBlob(containerName, filePath, blobName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const data = fs.readFileSync(filePath);
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
}

// Function to check if the file is outdated
function isFileOutdated(lastModifiedDate) {
    if (!lastModifiedDate) {
        return true;
    }
    const lastModified = new Date(lastModifiedDate);
    const currentDate = new Date();
    const diffInDays = (currentDate - lastModified) / (1000 * 60 * 60 * 24);
    return diffInDays > 10;
}

// Function to fetch and update the file if needed
async function fetchAndUpdateFile() {
    const lastModifiedDate = await fetchFileMetadata();

    if (isFileOutdated(lastModifiedDate)) {
        console.log('File is outdated or does not exist. Fetching and uploading new data...');

        const downloadedFilePath = await fetchFileFromApi();
        await uploadFileToBlob(containerName, downloadedFilePath, blobName);
    } else {
        console.log('File is up-to-date. No action required.');
    }
}

// Main function to execute the process and display results
async function main() {
    try {
        await fetchAndUpdateFile();
        const data = JSON.parse(fs.readFileSync(tempFilePath));
        displayResults(data);
    } catch (error) {
        console.error('Error in main function:', error);
        document.getElementById('error').textContent = 'Error processing data: ' + error.message;
    }
}

// Function to display results (from your original code)
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';  // Clear previous results
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = '';  // Clear previous error messages

    Object.keys(data).sort().reverse().forEach(year => {
        const yearDiv = document.createElement('div');
        yearDiv.className = 'year';
        yearDiv.innerHTML = `<h2>${year}</h2>`;
        data[year].forEach(pub => {
            const pubDiv = document.createElement('div');
            pubDiv.className = 'publication';
            pubDiv.innerHTML = `<div class="title"><a href="${pub.link}" target="_blank">${pub.title}</a></div>
                                <div class="authors">${pub.authors}</div><div class="publication_info">${pub.publication_info}</div>`;
            yearDiv.appendChild(pubDiv);
        });
        resultsDiv.appendChild(yearDiv);
    });
}

// Execute the main function
main().catch(console.error);