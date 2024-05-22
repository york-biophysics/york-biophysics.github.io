// 'https://york-biophysics-endpoint-lewis-frames-projects.vercel.app/api/publications?scholarId=q9e0j20AAAAJ`
    

const scholarId = 'q9e0j20AAAAJ';
console.log('Fetching data for Scholar ID:', scholarId); // Debugging log
fetch(`https://york-biophysics-endpoint-lewis-frames-projects.vercel.app/api/publications?scholarId=${scholarId}`)
    .then(response => {
    console.log('Response received:', response); // Debugging log
    if (!response.ok) {
        return response.text().then(text => { throw new Error(text) });
    }
    return response.json();
    })
    .then(data => {
    // console.log('Data received:', data); // Debugging log
    displayResults(data);
    })
    .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById('error').textContent = 'Error fetching data from Vercel: ' + error.message;
    });
  

function displayResults(data) {
// console.log('Displaying results:', data); // Debugging log
const resultsDiv = document.getElementById('results');
resultsDiv.innerHTML = '';  // Clear previous results
const errorDiv = document.getElementById('error');
errorDiv.innerHTML = '';  // Clear previous error messages

Object.keys(data).sort().reverse().forEach(year => {
    // console.log('Processing year:', year, 'Publications:', data[year]); // Debugging log
    const yearDiv = document.createElement('div');
    yearDiv.className = 'year';
    yearDiv.innerHTML = `<h2>${year}</h2>`;
    data[year].forEach(pub => {
    // console.log('Processing publication:', pub); // Debugging log
    const pubDiv = document.createElement('div');
    pubDiv.className = 'publication';
    pubDiv.innerHTML = `<div class="title"><a href="${pub.link}" target="_blank">${pub.title}</a></div>
                        <div class="authors">${pub.authors}</div><div class="publication_info">${pub.publication_info}</div>`;
    yearDiv.appendChild(pubDiv);
    });
    resultsDiv.appendChild(yearDiv);
});
}