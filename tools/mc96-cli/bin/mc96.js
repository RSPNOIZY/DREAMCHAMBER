#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';

import { ENDPOINTS, VOICE_AUTH_TOKEN, WORKERS_DIR, DOCS_DIR, SERVICE_MAP } from '../lib/config.js';
import { safeFetch } from '../lib/http.js';
import { GOSPEL } from '../lib/gospel.js';

const BANNER = `
  ${chalk.cyan('███╗   ███╗ ██████╗ █████╗  ██████╗ ')}
  ${chalk.cyan('████╗ ████║██╔════╝██╔══██╗██╔════╝ ')}
  ${chalk.cyan('██╔████╔██║██║     ╚██████║███████╗ ')}
  ${chalk.cyan('██║╚██╔╝██║██║      ╚═══██║██╔═══██╗')}
  ${chalk.cyan('██║ ╚═╝ ██║╚██████╗ █████╔╝╚██████╔╝')}
  ${chalk.cyan('╚═╝     ╚═╝ ╚═════╝╚════╝  ╚═════╝ ')}
  ${chalk.white.bold('MISSION CONTROL 96')} ${chalk.gray('—')} ${chalk.yellow('GOD.local')}
  ${chalk.magenta.bold('GORUNFREE')}
`;

// ---------------------------------------------------------------------------
// Program
// ---------------------------------------------------------------------------
const program = new Command();

program
  .name('mc96')
  .description('MC96ECO Mission Control — Terminal command center for GOD.local')
  .version('1.0.0')
  .action(() => {
    console.log(BANNER);
    console.log(chalk.gray('  Type mc96 --help for available commands.\n'));
  });

// ---------------------------------------------------------------------------
// mc96 status
// ---------------------------------------------------------------------------
program
  .command('status')
  .description('Show all services with color-coded health')
  .action(async () => {
    console.log(BANNER);
    console.log(chalk.white.bold('  SERVICE STATUS\n'));

    const results = await Promise.all(
      SERVICE_MAP.map(async (svc) => {
        const res = await safeFetch(svc.url, { timeout: 4000 });
        return { ...svc, ...res };
      })
    );

    for (const r of results) {
      const icon = r.ok ? chalk.green('●') : chalk.red('●');
      const latStr = r.latency ? chalk.gray(`${r.latency}ms`) : chalk.gray('---');
      const portStr = chalk.gray(`[:${r.port}]`);
      const statusStr = r.ok
        ? chalk.green('ONLINE')
        : chalk.red(r.error ? r.error.slice(0, 40) : 'OFFLINE');
      console.log(`  ${icon}  ${chalk.white(r.name.padEnd(18))} ${portStr.padEnd(20)} ${statusStr.padEnd(50)} ${latStr}`);
    }
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 health
// ---------------------------------------------------------------------------
program
  .command('health')
  .description('Detailed health of all services with latency')
  .action(async () => {
    console.log(BANNER);
    console.log(chalk.white.bold('  DETAILED HEALTH REPORT\n'));

    const results = await Promise.all(
      SERVICE_MAP.map(async (svc) => {
        const res = await safeFetch(svc.url, { timeout: 6000 });
        return { ...svc, ...res };
      })
    );

    let onlineCount = 0;
    let totalLatency = 0;

    for (const r of results) {
      const icon = r.ok ? chalk.green('■') : chalk.red('■');
      console.log(`  ${icon} ${chalk.white.bold(r.name)}`);
      console.log(`    Port:    ${r.port}`);
      console.log(`    Status:  ${r.ok ? chalk.green('ONLINE') : chalk.red('OFFLINE')}`);
      console.log(`    Latency: ${r.latency}ms`);
      if (r.error) {
        console.log(`    Error:   ${chalk.red(r.error)}`);
      }
      if (r.ok && r.data && typeof r.data === 'object') {
        const keys = Object.keys(r.data).slice(0, 5);
        for (const k of keys) {
          const val = typeof r.data[k] === 'object' ? JSON.stringify(r.data[k]) : String(r.data[k]);
          console.log(`    ${chalk.gray(k)}: ${val.slice(0, 60)}`);
        }
      }
      console.log();
      if (r.ok) {
        onlineCount++;
        totalLatency += r.latency;
      }
    }

    const total = results.length;
    const avgLatency = onlineCount > 0 ? Math.round(totalLatency / onlineCount) : 0;
    const healthPct = Math.round((onlineCount / total) * 100);
    const healthColor = healthPct >= 80 ? chalk.green : healthPct >= 50 ? chalk.yellow : chalk.red;

    console.log(chalk.white.bold('  SUMMARY'));
    console.log(`  Services: ${onlineCount}/${total} online`);
    console.log(`  Health:   ${healthColor(healthPct + '%')}`);
    console.log(`  Avg RTT:  ${avgLatency}ms`);
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 brief
// ---------------------------------------------------------------------------
program
  .command('brief')
  .description('Get morning briefing from GABRIEL')
  .action(async () => {
    console.log(chalk.cyan.bold('\n  MORNING BRIEFING\n'));

    const res = await safeFetch(`${ENDPOINTS.gabriel}/brief`, { timeout: 10000 });
    if (!res.ok) {
      console.log(chalk.red(`  GABRIEL unreachable: ${res.error}`));
      return;
    }

    const brief = typeof res.data === 'object' ? res.data : { message: res.data };
    if (brief.message) {
      console.log(chalk.white(`  ${brief.message}`));
    }
    if (brief.items && Array.isArray(brief.items)) {
      for (const item of brief.items) {
        console.log(chalk.gray(`  • ${typeof item === 'string' ? item : JSON.stringify(item)}`));
      }
    }
    if (typeof res.data === 'string') {
      console.log(chalk.white(`  ${res.data}`));
    }
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 ask <question>
// ---------------------------------------------------------------------------
program
  .command('ask <question...>')
  .description('Ask a question — routed to Claude via Voice Bridge')
  .action(async (words) => {
    const question = words.join(' ');
    console.log(chalk.cyan(`\n  Asking: "${question}"\n`));

    const headers = { 'Content-Type': 'application/json' };
    if (VOICE_AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${VOICE_AUTH_TOKEN}`;
    }

    const res = await safeFetch(`${ENDPOINTS.voiceBridge}/claude`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: question }),
      timeout: 30000,
    });

    if (!res.ok) {
      console.log(chalk.red(`  Voice Bridge error: ${res.error || `HTTP ${res.status}`}`));
      return;
    }

    const answer = typeof res.data === 'object'
      ? (res.data.response || res.data.text || res.data.answer || JSON.stringify(res.data, null, 2))
      : res.data;
    console.log(chalk.white(`  ${answer}`));
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 speak <text>
// ---------------------------------------------------------------------------
program
  .command('speak <text...>')
  .description('Text-to-speech via GABRIEL')
  .action(async (words) => {
    const text = words.join(' ');
    console.log(chalk.cyan(`\n  Speaking: "${text}"\n`));

    const res = await safeFetch(`${ENDPOINTS.gabriel}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      timeout: 15000,
    });

    if (!res.ok) {
      console.log(chalk.red(`  GABRIEL TTS error: ${res.error || `HTTP ${res.status}`}`));
      return;
    }

    console.log(chalk.green('  Speech dispatched to GABRIEL.'));
    if (res.data && typeof res.data === 'object' && res.data.message) {
      console.log(chalk.gray(`  ${res.data.message}`));
    }
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 deploy <worker>
// ---------------------------------------------------------------------------
program
  .command('deploy <worker>')
  .description('Deploy a Cloudflare Worker (heaven, consent-gateway, etc.)')
  .action((worker) => {
    const workerPaths = {
      'heaven': resolve(homedir(), 'Desktop', 'HEAVEN'),
      'consent-gateway': resolve(homedir(), 'NOIZYLAB', 'workers', 'consent-gateway'),
      'claude-proxy': resolve(homedir(), '.gemini', 'antigravity', 'scratch', 'noizy-workers', 'claude-proxy'),
      'teams-bot': resolve(homedir(), '.gemini', 'antigravity', 'scratch', 'noizy-workers', 'teams-bot'),
    };

    const dir = workerPaths[worker];
    if (!dir) {
      console.log(chalk.red(`\n  Unknown worker: "${worker}"`));
      console.log(chalk.gray(`  Available: ${Object.keys(workerPaths).join(', ')}`));
      return;
    }

    if (!existsSync(dir)) {
      console.log(chalk.red(`\n  Worker directory not found: ${dir}`));
      return;
    }

    console.log(chalk.cyan(`\n  Deploying ${chalk.bold(worker)} from ${dir}\n`));

    try {
      const output = execSync('npx wrangler deploy', {
        cwd: dir,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 60000,
      });
      console.log(chalk.green('  Deploy successful.\n'));
      console.log(chalk.gray(output));
    } catch (err) {
      console.log(chalk.red('  Deploy failed.\n'));
      if (err.stdout) console.log(chalk.gray(err.stdout));
      if (err.stderr) console.log(chalk.red(err.stderr));
    }
  });

// ---------------------------------------------------------------------------
// mc96 test
// ---------------------------------------------------------------------------
program
  .command('test')
  .description('Run all Vitest suites across workers/')
  .action(() => {
    const workersDir = resolve(homedir(), 'NOIZYLAB', 'workers');
    console.log(chalk.cyan(`\n  Running tests in ${workersDir}\n`));

    if (!existsSync(workersDir)) {
      console.log(chalk.red(`  Workers directory not found: ${workersDir}`));
      return;
    }

    try {
      const output = execSync('npx vitest run', {
        cwd: workersDir,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 120000,
      });
      console.log(chalk.green(output));
    } catch (err) {
      if (err.stdout) console.log(chalk.white(err.stdout));
      if (err.stderr) console.log(chalk.red(err.stderr));
      console.log(chalk.yellow('\n  Some tests may have failed. Check output above.'));
    }
  });

// ---------------------------------------------------------------------------
// mc96 empire
// ---------------------------------------------------------------------------
program
  .command('empire')
  .description('Get THE CODEX snapshot from Empire service')
  .action(async () => {
    console.log(chalk.cyan.bold('\n  THE CODEX — EMPIRE SNAPSHOT\n'));

    const res = await safeFetch(`${ENDPOINTS.empire}/empire`, { timeout: 10000 });
    if (!res.ok) {
      console.log(chalk.red(`  Empire service unreachable: ${res.error}`));
      return;
    }

    if (typeof res.data === 'object') {
      printObject(res.data, 2);
    } else {
      console.log(chalk.white(`  ${res.data}`));
    }
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 docs <query>
// ---------------------------------------------------------------------------
program
  .command('docs <query...>')
  .description('Search ~/NOIZYLAB/docs/ for matching content')
  .action((words) => {
    const query = words.join(' ');
    console.log(chalk.cyan(`\n  Searching docs for: "${query}"\n`));

    if (!existsSync(DOCS_DIR)) {
      console.log(chalk.red(`  Docs directory not found: ${DOCS_DIR}`));
      console.log(chalk.gray('  Create ~/NOIZYLAB/docs/ and add documentation files.'));
      return;
    }

    try {
      const output = execSync(
        `grep -ril --include="*.md" --include="*.txt" --include="*.docx" ${JSON.stringify(query)} ${JSON.stringify(DOCS_DIR)}`,
        { encoding: 'utf-8', timeout: 10000 }
      ).trim();

      if (!output) {
        console.log(chalk.yellow('  No matches found.'));
        return;
      }

      const files = output.split('\n');
      console.log(chalk.white(`  Found ${files.length} matching file(s):\n`));

      for (const file of files) {
        console.log(chalk.green(`  ${file}`));
        try {
          const context = execSync(
            `grep -in --color=never -m 3 ${JSON.stringify(query)} ${JSON.stringify(file)}`,
            { encoding: 'utf-8', timeout: 5000 }
          ).trim();
          for (const line of context.split('\n')) {
            console.log(chalk.gray(`    ${line.trim()}`));
          }
        } catch {
          // no context lines
        }
        console.log();
      }
    } catch (err) {
      if (err.status === 1) {
        console.log(chalk.yellow('  No matches found.'));
      } else {
        console.log(chalk.red(`  Search error: ${err.message}`));
      }
    }
  });

// ---------------------------------------------------------------------------
// mc96 fixes
// ---------------------------------------------------------------------------
program
  .command('fixes')
  .description('List pending fixes from GABRIEL memcells')
  .action(async () => {
    console.log(chalk.cyan.bold('\n  PENDING FIXES\n'));

    const res = await safeFetch(`${ENDPOINTS.gabriel}/memcells?type=fix&status=pending`, { timeout: 8000 });
    if (!res.ok) {
      console.log(chalk.red(`  GABRIEL unreachable: ${res.error}`));
      return;
    }

    const fixes = Array.isArray(res.data) ? res.data : (res.data?.fixes || res.data?.items || []);

    if (fixes.length === 0) {
      console.log(chalk.green('  No pending fixes. Clean slate.'));
      return;
    }

    for (const fix of fixes) {
      const id = fix.id || fix.key || 'unknown';
      const desc = fix.description || fix.message || fix.title || JSON.stringify(fix);
      const priority = fix.priority || 'normal';
      const prioColor = priority === 'high' || priority === 'urgent' ? chalk.red : chalk.yellow;
      console.log(`  ${chalk.white.bold(id)}  ${prioColor(`[${priority}]`)}  ${chalk.gray(desc)}`);
    }
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 approve <fix-id>
// ---------------------------------------------------------------------------
program
  .command('approve <fixId>')
  .description('Approve a pending fix by ID')
  .action(async (fixId) => {
    console.log(chalk.cyan(`\n  Approving fix: ${fixId}\n`));

    const res = await safeFetch(`${ENDPOINTS.gabriel}/memcells/${fixId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true, approvedBy: 'RSP_001' }),
      timeout: 8000,
    });

    if (!res.ok) {
      console.log(chalk.red(`  Approval failed: ${res.error || `HTTP ${res.status}`}`));
      return;
    }

    console.log(chalk.green(`  Fix ${fixId} approved.`));
    if (res.data && typeof res.data === 'object' && res.data.message) {
      console.log(chalk.gray(`  ${res.data.message}`));
    }
    console.log();
  });

// ---------------------------------------------------------------------------
// mc96 gospel
// ---------------------------------------------------------------------------
program
  .command('gospel')
  .description('Print THE NOIZY GOSPEL')
  .action(() => {
    console.log(chalk.magenta(GOSPEL));
  });

// ---------------------------------------------------------------------------
// mc96 score
// ---------------------------------------------------------------------------
program
  .command('score')
  .description('Get perfection score from THE CODEX')
  .action(async () => {
    console.log(chalk.cyan.bold('\n  PERFECTION SCORE\n'));

    const res = await safeFetch(`${ENDPOINTS.empire}/score`, { timeout: 10000 });
    if (!res.ok) {
      console.log(chalk.red(`  Empire/Codex unreachable: ${res.error}`));
      return;
    }

    const score = typeof res.data === 'object' ? res.data : { score: res.data };

    if (score.score !== undefined) {
      const pct = Number(score.score);
      const bar = renderBar(pct);
      const color = pct >= 90 ? chalk.green : pct >= 70 ? chalk.yellow : chalk.red;
      console.log(`  Score: ${color.bold(pct + '%')}`);
      console.log(`  ${bar}`);
    }

    if (score.breakdown && typeof score.breakdown === 'object') {
      console.log();
      for (const [key, val] of Object.entries(score.breakdown)) {
        const v = Number(val);
        const c = v >= 90 ? chalk.green : v >= 70 ? chalk.yellow : chalk.red;
        console.log(`  ${chalk.gray(key.padEnd(20))} ${c(v + '%')}`);
      }
    }

    if (typeof res.data === 'string') {
      console.log(chalk.white(`  ${res.data}`));
    }
    console.log();
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderBar(pct) {
  const width = 30;
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  const color = pct >= 90 ? chalk.green : pct >= 70 ? chalk.yellow : chalk.red;
  return `  ${color('█'.repeat(filled))}${chalk.gray('░'.repeat(empty))} ${pct}%`;
}

function printObject(obj, indent = 0) {
  const pad = ' '.repeat(indent);
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      console.log(`${pad}${chalk.cyan(key)}:`);
      printObject(val, indent + 2);
    } else if (Array.isArray(val)) {
      console.log(`${pad}${chalk.cyan(key)}:`);
      for (const item of val) {
        if (typeof item === 'object') {
          printObject(item, indent + 4);
          console.log();
        } else {
          console.log(`${pad}    ${chalk.gray('•')} ${item}`);
        }
      }
    } else {
      console.log(`${pad}${chalk.cyan(key)}: ${chalk.white(String(val))}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------
program.parse(process.argv);
