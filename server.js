import http from 'http';
import https from 'https';
import { URL } from 'url';
import * as cheerio from 'cheerio'

const PORT = 3001;

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchMetadata(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const $ = cheerio.load(data);
        const metadata = {
          title: $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') || 
                 $('title').text() || 
                 'Unknown Title',
          description: $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || 
                       'No description available',
          image: $('meta[property="og:image"]').attr('content') || 
                 $('meta[name="twitter:image"]').attr('content') || 
                 '',
          favicon: $('link[rel="icon"]').attr('href') || 
                   $('link[rel="shortcut icon"]').attr('href') || 
                   '/favicon.ico'
        };
        resolve(metadata);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/fetch-metadata') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { url } = JSON.parse(body);
        if (!validateUrl(url)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid URL' }));
          return;
        }

        // Check cache
        if (cache.has(url)) {
          const { metadata, timestamp } = cache.get(url);
          if (Date.now() - timestamp < CACHE_TTL) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(metadata));
            return;
          }
        }

        const metadata = await fetchMetadata(url);
        
        // Update cache
        cache.set(url, { metadata, timestamp: Date.now() });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(metadata));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch metadata' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

