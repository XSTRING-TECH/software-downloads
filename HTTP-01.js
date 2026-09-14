/*
# HTTP-01.js
#
# This basic HTTP server can be used to serve ACME HTTP-01 challenge files for your CCS Web Server (www.yourdomain.com).
#
# This HTTP server is NOT required for the xstAuth Light Server (auth.yourdomain.com). The xstAuth Light Server provides its own
# functionality for handling ACME HTTP-01 challenges and for verifying HTTPS configuration under its Help menu.
*/

const fs = require('fs');
const path = require('path');
const http = require('http');

let simpleserver;

const publicdnsname = 'www.yourdomain.com';
const bind_address = '0.0.0.0';
const port = 80;

// Make sure this directory is manually created before running this server.
const publicRoot = 'C:/xstAuth/public';

simpleserver = http.createServer((req, res) => {

    // Serve ACME HTTP-01 challenge files.
    const requestPath = new URL(
        req.url,
        `http://${req.headers.host}`
    ).pathname;

    if (requestPath.startsWith('/.well-known/acme-challenge/')) {

        // Only use the filename portion of the request.
        // This prevents the request from specifying arbitrary directories.
        const filename = path.basename(requestPath);

        const filepath = path.join(
            publicRoot,
            '.well-known',
            'acme-challenge',
            filename
        );

        fs.readFile(filepath, (error, content) => {

            if (error) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.end('Not Found');
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.end(content);
        });

        return;
    }

    // Normal temporary HTTP page.
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    res.end(`
        <!DOCTYPE html>
        <html>
        <body>
            <h1>Hello from ${publicdnsname}.</h1>
            <h3>This page is being served over HTTP on port ${port}.</h3>
            <p>
                The HTTP server is working.
                You can proceed with requesting your TLS certificate.
            </p>
        </body>
        </html>
    `);
});

simpleserver.listen(port, bind_address, () => {
    console.log(
        `Temporary HTTP server is running on ${bind_address}:${port}.`
    );
    console.log(
        `ACME HTTP-01 challenge path: http://${publicdnsname}/.well-known/acme-challenge/`
    );
});

simpleserver.on('error', (error) => {

    if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use.`);
        return;
    }

    console.error('HTTP server error:', error);
});
