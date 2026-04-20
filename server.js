const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

function fetchExternal(url, callback) {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => callback(data));
    }).on('error', () => callback(null));
}

const server = http.createServer((req, res) => {
    console.log('Request:', req.url);
    
    if (req.url.startsWith('/proxy/')) {
        const url = decodeURIComponent(req.url.slice(7));
        console.log('Proxying to:', url);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/xml');
        fetchExternal(url, (data) => {
            res.end(data || '');
        });
        return;
    }
    
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './ticker.html';
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    if (extname === '.js') contentType = 'text/javascript';
    else if (extname === '.css') contentType = 'text/css';
    else if (extname === '.png') contentType = 'image/png';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});