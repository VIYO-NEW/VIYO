#!/usr/bin/env node
/**
 * T90 / SEC-10 staging repository validation.
 * Checks repo-controlled staging wiring without calling external dashboards.
 */
import { readFileSync, existsSync } from 'node:fs';

const checks = [];
function check(name, condition, detail) {
  checks.push({ name, passed: Boolean(condition), detail });
}

function read(path) {
  return readFileSync(path, 'utf8');
}

const render = read('render.yaml');
const deployStaging = read('.github/workflows/deploy-staging.yml');
const ci = read('.github/workflows/ci.yml');
const secretScan = read('.github/workflows/secret-scan.yml');
const runbook = read('docs/runbooks/staging-environment.md');
const gitignore = read('.gitignore');
const dbPackage = JSON.parse(read('packages/db/package.json'));
const seedScript = read('packages/db/scripts/seed-staging.mjs');

check('develop branch workflow trigger', /branches:\s*\[develop\]/.test(deployStaging), 'deploy-staging.yml must trigger on develop only.');
check('staging deploy hook secret', deployStaging.includes('RENDER_STAGING_DEPLOY_HOOK_URL'), 'Staging workflow must use the staging Render deploy hook secret.');
check('staging worker health URL', deployStaging.includes('https://api.staging.viyo.new/health'), 'Staging workflow must verify the canonical dotted staging worker health endpoint.');
check('public staging website URL', deployStaging.includes('https://staging.viyo.new'), 'Staging workflow must reference the locked public staging website domain.');
check('staging Brands app URL', deployStaging.includes('https://app.staging.viyo.new'), 'Staging workflow must reference the locked staging Brands app domain.');
check('staging admin URL', deployStaging.includes('https://admin.staging.viyo.new'), 'Staging workflow must reference the locked staging admin domain.');
check('production workflow remains separate', existsSync('.github/workflows/deploy.yml') && deployStaging.includes('production-only'), 'Staging workflow must not replace the production deploy workflow.');
check('render staging service exists', render.includes('name: viyo-worker-staging') && render.includes('branch: develop'), 'Render blueprint must include a develop-branch staging worker.');
check('render production service preserved', render.includes('name: viyo-worker') && render.includes('branch: main'), 'Render blueprint must preserve the production worker on main.');
check('ci develop trigger', /push:\s*\n\s*branches:\s*\[main, develop\]/.test(ci), 'CI must run on pushes to develop.');
check('secret scan develop trigger', /push:\s*\n\s*branches:\s*\[main, develop\]/.test(secretScan), 'Secret scan must run on pushes to develop.');
check('staging env example allowed', gitignore.includes('!.env.staging.example'), 'The placeholder staging env example must be versionable.');
check('staging env example exists', existsSync('.env.staging.example'), 'The placeholder staging env example must exist.');
check('faker dependency declared', dbPackage.devDependencies?.['@faker-js/faker'], 'The db package must declare @faker-js/faker for synthetic staging data.');
check('staging seed script declared', dbPackage.scripts?.['seed:staging'] === 'node scripts/seed-staging.mjs', 'The db package must expose seed:staging.');
check('seed has staging guard', seedScript.includes('VIYO_SEED_TARGET') && seedScript.includes('VIYO_ALLOW_STAGING_SEED'), 'Seed script must require explicit staging guards.');
check('seed rejects production markers', seedScript.includes('productionMarkers') && seedScript.includes('api.viyo.new'), 'Seed script must refuse production-like targets.');
check('runbook locks domains', ['staging.viyo.new', 'app.staging.viyo.new', 'admin.staging.viyo.new', 'api.staging.viyo.new'].every((domain) => runbook.includes(domain)), 'Runbook must document all locked staging domains.');
check('retired staging API alias absent', !deployStaging.includes('api-staging.viyo.new') && !runbook.includes('api-staging.viyo.new'), 'The retired api-staging.viyo.new alias must not be used.');
check('runbook documents rollback', runbook.includes('Rollback Procedure') && runbook.includes('Teardown Procedure'), 'Runbook must include rollback and teardown procedures.');

const failed = checks.filter((item) => !item.passed);
for (const item of checks) {
  console.log(`${item.passed ? 'PASS' : 'FAIL'} ${item.name} — ${item.detail}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} T90 staging validation check(s) failed.`);
  process.exit(1);
}

console.log('\nAll T90 staging repository validation checks passed.');
