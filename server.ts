import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing for JSON and URL-encoded data (with high limit for image payloads if needed)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Chafique Property Agency API',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Secure Server-Side Cloudinary Upload API Route
   * Keeps CLOUDINARY_API_SECRET strictly server-side.
   */
  app.post('/api/cloudinary/upload', async (req, res) => {
    try {
      const { file, folder, upload_preset } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'No image data provided in payload' });
      }

      const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'chafique-property').trim();
      const targetFolder = folder || 'chafique-property-agency/properties';
      const targetPreset = (upload_preset || process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'chafique_properties').trim();

      const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
      const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

      // Cloudinary API URL
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const formData = new URLSearchParams();
      formData.append('file', file);
      formData.append('folder', targetFolder);

      // If both API Key & Secret exist on the server, use signed upload
      if (apiKey && apiSecret) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const crypto = await import('crypto');
        const signatureString = `folder=${targetFolder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
      } else {
        // Otherwise use unsigned upload preset (never pass api_key without valid signature)
        formData.append('upload_preset', targetPreset);
      }

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error('[Server Cloudinary Upload Error]:', data);
        return res.status(uploadResponse.status).json({
          error: data.error?.message || 'Failed to upload image to Cloudinary',
          details: data,
        });
      }

      return res.json({
        success: true,
        url: data.secure_url || data.url,
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
        created_at: data.created_at,
      });
    } catch (error: any) {
      console.error('[Server Cloudinary Upload Exception]:', error);
      return res.status(500).json({
        error: error.message || 'Internal server error during Cloudinary image upload',
      });
    }
  });

  /**
   * Secure Server-Side Cloudinary Delete API Route
   * Deletes asset from Cloudinary using server-side API Secret & Key signature
   */
  app.post('/api/cloudinary/delete', async (req, res) => {
    try {
      const { public_id } = req.body;

      if (!public_id) {
        return res.status(400).json({ error: 'public_id is required for deletion' });
      }

      // If it's a local mock or non-cloudinary reference, return success directly
      if (public_id.startsWith('local/') || !public_id.includes('/')) {
        return res.json({ success: true, result: 'ok', mocked: true });
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || 'chafique-property';
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!apiKey || !apiSecret) {
        // Without server API Secret, log warning and return success for client UI consistency
        console.warn('[Server Cloudinary Delete] Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET on server; skipping remote Cloudinary destroy.');
        return res.json({ success: true, result: 'skipped_no_credentials', public_id });
      }

      // Generate Cloudinary SHA-1 signature
      const timestamp = Math.round(new Date().getTime() / 1000);
      const crypto = await import('crypto');
      const signatureString = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      const formData = new URLSearchParams();
      formData.append('public_id', public_id);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);

      const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
      const destroyResponse = await fetch(destroyUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await destroyResponse.json();

      if (!destroyResponse.ok) {
        console.error('[Server Cloudinary Delete Error]:', result);
        return res.status(destroyResponse.status).json({
          error: result.error?.message || 'Failed to destroy Cloudinary asset',
          details: result,
        });
      }

      return res.json({ success: true, result: result.result || 'ok', public_id });
    } catch (error: any) {
      console.error('[Server Cloudinary Delete Exception]:', error);
      return res.status(500).json({
        error: error.message || 'Internal server error during Cloudinary image deletion',
      });
    }
  });

  // Dynamic Sitemap generator API
  app.get('/sitemap.xml', (req, res) => {
    const siteUrl = 'https://chafique-property-agency.com';
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/properties</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://chafique-property-agency.com/sitemap.xml\n`);
  });

  // Vite middleware in development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Chafique Property Agency] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
