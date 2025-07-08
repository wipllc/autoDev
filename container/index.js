const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from Container!\\n');
});

server.listen(8080, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8080/');
}); 