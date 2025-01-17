import express from 'express';
import https from 'https';
import { URL } from 'url';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = [
    'https://metatester.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
];

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

function resolveRelativeUrl(baseUrl, relativePath) {
  try {
    const base = new URL(baseUrl);
    // Handle different types of relative paths
    if (relativePath.startsWith('//')) {
      return `${base.protocol}${relativePath}`;
    }
    if (relativePath.startsWith('/')) {
      return `${base.protocol}//${base.host}${relativePath}`;
    }
    if (!relativePath.startsWith('http')) {
      return new URL(relativePath, base.href).href;
    }
    return relativePath;
  } catch (err) {
    return relativePath;
  }
}

async function fetchMetadata(url) {
    const tryFetch = async (urlToTry, usedWww) => {
        return new Promise((resolve, reject) => {
          https.get(urlToTry, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              const $ = cheerio.load(data);
      
              // Extract metadata
              const metadata = {
                title:
                  $('meta[property="og:title"]').attr('content') ||
                  $('meta[name="twitter:title"]').attr('content') ||
                  $('title').text() ||
                  'Unknown Title',
                description:
                  $('meta[property="og:description"]').attr('content') ||
                  $('meta[name="twitter:description"]').attr('content') ||
                  $('meta[name="description"]').attr('content') ||
                  'No description available',
                image: resolveRelativeUrl(
                  urlToTry,
                  $('meta[property="og:image"]').attr('content') ||
                  $('meta[name="twitter:image"]').attr('content') ||
                  ''
                ),
                favicon: resolveRelativeUrl(
                  urlToTry,
                  $('link[rel="icon"]').attr('href') ||
                  $('link[rel="shortcut icon"]').attr('href') ||
                  '/favicon.ico'
                ),
                canonicalUrl: resolveRelativeUrl(
                  urlToTry,
                  $('link[rel="canonical"]').attr('href') || ''
                ),
                language: $('html').attr('lang') || 'Unknown',
                siteName:
                  $('meta[property="og:site_name"]').attr('content') || 'Unknown Site',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                author: $('meta[name="author"]').attr('content') || '',
                usedWww,
              };
              let noMetadata = ((!$('meta[property="og:title"]').attr('content') ||
              !$('meta[name="twitter:title"]').attr('content') ||
              !$('title').text()) && (!$('meta[property="og:description"]').attr('content') ||
              !$('meta[name="twitter:description"]').attr('content') ||
              !$('meta[name="description"]').attr('content')));
              if (noMetadata && !usedWww){
                // console.log('No metadata found for ',urlToTry);
                metadata.NO_METADATA = true;
              }
              resolve(metadata);
            });
          }).on('error', (err) => {
            reject(err);
          });
        });
      };
      

try {
    const metadata = await tryFetch(url, false);
    if (metadata.NO_METADATA && !metadata.usedWww){
        throw new Error('No metadata found');
    }
    return metadata;
} catch (error) {
        console.error(`Failed to fetch metadata for ${url}. Trying with www...`);
        const urlObj = new URL(url);
        if (!urlObj.hostname.startsWith('www.')) {
            const wwwUrl = `${urlObj.protocol}//www.${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
            return await tryFetch(wwwUrl, true);
        }
        throw error;
    }
}

app.use(express.json());
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Check if the origin is allowed
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }
    next();
});

app.options('*', (req, res) => {
  res.sendStatus(204);
});

app.delete('/clear-cache', (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully' });
});

app.post('/fetch-metadata', async (req, res) => {
  const { url } = req.body;
  if (!validateUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (cache.has(url)) {
    const { metadata, timestamp } = cache.get(url);
    if (Date.now() - timestamp < CACHE_TTL) {
      return res.json(metadata);
    }
  }

  try {
        const metadata = await fetchMetadata(url);
        
        // Update cache
    cache.set(url, { metadata, timestamp: Date.now() });
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

fetch('https://metatester-backend.vercel.app/fetch-metadata', {
  mode: 'no-cors'
})
.then(response => {
  // handle response
})
.catch(error => {
  console.error('Error:', error);
});
