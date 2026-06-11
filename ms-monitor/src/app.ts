import express from 'express';
import axios from 'axios';

const app  = express();
const PORT = process.env.PORT || 4000;

interface ServiceConfig {
  name:        string;
  url:         string;
  description: string;
  port:        number;
}

interface CheckResult {
  name:        string;
  description: string;
  url:         string;
  port:        number;
  status:      'UP' | 'DOWN';
  uptime?:     number;
  latencyMs:   number;
  checkedAt:   string;
  error?:      string;
}

const SERVICES: ServiceConfig[] = [
  { name: 'ms-tasks',    url: process.env.MS_TASKS_URL    ?? 'http://localhost:3001', description: 'Microservicio de Tareas',    port: 3001 },
  { name: 'ms-projects', url: process.env.MS_PROJECTS_URL ?? 'http://localhost:3002', description: 'Microservicio de Proyectos', port: 3002 },
  { name: 'ms-teams',    url: process.env.MS_TEAMS_URL    ?? 'http://localhost:3003', description: 'Microservicio de Equipos',   port: 3003 },
  { name: 'bff-gateway', url: process.env.BFF_URL          ?? 'http://localhost:3000', description: 'BFF / API Gateway',         port: 3000 },
];

let lastResults: CheckResult[] = [];
let lastChecked = '';

async function checkService(svc: ServiceConfig): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await axios.get(`${svc.url}/health`, { timeout: 4000 });
    const latencyMs = Date.now() - start;
    return {
      name:        svc.name,
      description: svc.description,
      url:         svc.url,
      port:        svc.port,
      status:      'UP',
      uptime:      res.data?.uptime,
      latencyMs,
      checkedAt:   new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      name:        svc.name,
      description: svc.description,
      url:         svc.url,
      port:        svc.port,
      status:      'DOWN',
      latencyMs:   Date.now() - start,
      checkedAt:   new Date().toISOString(),
      error:       err.message,
    };
  }
}

async function runChecks() {
  lastResults = await Promise.all(SERVICES.map(checkService));
  lastChecked = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
}

// Poll every 15 seconds
runChecks();
setInterval(runChecks, 15_000);

// ── JSON API ────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ms-monitor', uptime: Math.floor(process.uptime()) });
});

app.get('/status', (_req, res) => {
  const summary = {
    checkedAt: lastChecked,
    total:     lastResults.length,
    up:        lastResults.filter(r => r.status === 'UP').length,
    down:      lastResults.filter(r => r.status === 'DOWN').length,
    services:  lastResults,
  };
  res.json(summary);
});

// ── HTML Dashboard ──────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  const upCount   = lastResults.filter(r => r.status === 'UP').length;
  const downCount = lastResults.filter(r => r.status === 'DOWN').length;
  const allUp     = downCount === 0;

  const rows = lastResults.map(r => {
    const isUp     = r.status === 'UP';
    const badge    = isUp
      ? `<span style="background:#16a34a;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">UP</span>`
      : `<span style="background:#dc2626;color:#fff;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">DOWN</span>`;
    const latency  = `${r.latencyMs} ms`;
    const uptime   = r.uptime != null ? `${r.uptime}s` : '—';
    const rowColor = isUp ? '' : 'background:#fef2f2;';
    return `
      <tr style="${rowColor}">
        <td style="padding:12px 16px;font-weight:600;">${r.name}</td>
        <td style="padding:12px 16px;color:#6b7280;">${r.description}</td>
        <td style="padding:12px 16px;">:${r.port}</td>
        <td style="padding:12px 16px;">${badge}</td>
        <td style="padding:12px 16px;font-family:monospace;">${latency}</td>
        <td style="padding:12px 16px;font-family:monospace;">${uptime}</td>
        <td style="padding:12px 16px;font-size:11px;color:#9ca3af;">${r.checkedAt.replace('T', ' ').slice(0, 19)}</td>
      </tr>`;
  }).join('');

  const headerColor = allUp ? '#16a34a' : '#dc2626';
  const headerMsg   = allUp
    ? `Todos los servicios operativos (${upCount}/${lastResults.length})`
    : `${downCount} servicio(s) caído(s) — ${upCount}/${lastResults.length} activos`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="refresh" content="15" />
  <title>Monitor — Innovatech Solutions</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f1f5f9; color: #111827; }
    header { background: #1e3a5f; color: #fff; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
    header h1 { font-size: 20px; font-weight: 700; }
    header p  { font-size: 12px; color: #93c5fd; margin-top: 2px; }
    .badge-ok   { background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; }
    .badge-fail { background: #fee2e2; color: #dc2626; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; }
    .banner { background: ${headerColor}; color: #fff; text-align: center; padding: 10px; font-weight: 600; font-size: 14px; }
    .container { max-width: 960px; margin: 32px auto; padding: 0 16px; }
    .card { background: #fff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,.07); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f8fafc; }
    th { padding: 10px 16px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    td { border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af; }
    .refresh { font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Innovatech Solutions · Monitor</h1>
      <p>FullStack III DuocUC — Actualización automática cada 15 s</p>
    </div>
    <span class="${allUp ? 'badge-ok' : 'badge-fail'}">${allUp ? 'SISTEMA OK' : 'ALERTA'}</span>
  </header>
  <div class="banner">${headerMsg}</div>
  <div class="container">
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Descripción</th>
            <th>Puerto</th>
            <th>Estado</th>
            <th>Latencia</th>
            <th>Uptime</th>
            <th>Última verificación</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7" style="padding:24px;text-align:center;color:#9ca3af;">Verificando servicios...</td></tr>'}</tbody>
      </table>
    </div>
    <p class="footer">Última actualización: ${lastChecked || '—'} &nbsp;·&nbsp; <a href="/status" style="color:#2563eb">JSON /status</a></p>
  </div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`🖥️  MS-MONITOR corriendo en http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 JSON API:  http://localhost:${PORT}/status`);
});
