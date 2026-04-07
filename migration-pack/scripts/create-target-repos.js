#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');

const token = process.env.GITHUB_TOKEN;
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: { Authorization: `token ${token}` }
});

(async () => {
  console.log(`Creating ${manifest.projects.length} target repos in noizy-ai...`);
  for (const project of manifest.projects) {
    try {
      await api.post('/orgs/noizy-ai/repos', {
        name: project.name,
        description: project.description,
        private: false
      });
      console.log(`✓ Created noizy-ai/${project.name}`);
    } catch (e) {
      if (e.response?.status === 422) {
        console.log(`○ ${project.name} (exists)`);
      } else {
        console.error(`✗ ${project.name}: ${e.message}`);
      }
    }
  }
  console.log(`✓ Done.`);
})();
