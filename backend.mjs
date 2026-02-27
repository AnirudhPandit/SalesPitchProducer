import http from 'node:http';

const PORT = Number(process.env.API_PORT || 8787);
const MODEL_ENDPOINT = process.env.MODEL_ENDPOINT;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

async function callModel(payload) {
  if (!MODEL_ENDPOINT) {
    return {
      provider: 'mock',
      response: `Mock response for ${payload.type || 'request'}: ${payload.prompt || payload.query || 'ok'}`,
      received: payload
    };
  }

  const response = await fetch(MODEL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`MODEL_ENDPOINT returned ${response.status}`);
  }

  return response.json();
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  try {
    if (req.url === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, modelEndpointConfigured: Boolean(MODEL_ENDPOINT) });
    }

    if (req.url === '/api/action' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      return sendJson(res, 200, {
        ok: true,
        message: `Action '${payload.action}' accepted`,
        received: payload
      });
    }

    if ((req.url === '/api/model/query' || req.url === '/api/model/upload') && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const modelResponse = await callModel(payload);
      return sendJson(res, 200, {
        ok: true,
        response: modelResponse.response || modelResponse.output || JSON.stringify(modelResponse),
        raw: modelResponse
      });
    }

    return sendJson(res, 404, { ok: false, error: 'Not found' });
  } catch (error) {
    return sendJson(res, 500, { ok: false, error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
