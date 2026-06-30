import { chromium } from '@playwright/test';

const PUBLIC_PATHS = [
  '/',
  '/luna-balance',
  '/rhythm-calendar',
  '/ritual-path',
  '/the-bridge',
  '/pricing',
  '/about',
  '/how-it-works',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/cookies',
  '/data-rights',
];

const MEMBER_SIDEBAR_TABS = [
  'dashboard',
  'cycle',
  'labs',
  'meds',
  'profile',
  'history',
  'reflections',
  'voice_files',
  'creative',
  'library',
  'bridge',
  'relationships',
  'family',
  'partner_faq',
  'faq',
  'contact',
  'crisis',
  'about',
  'how_it_works',
  'privacy',
  'terms',
  'medical',
  'cookies',
  'data_rights',
  'admin',
];

const now = new Date().toISOString();

function encode(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

async function collectButtons(page) {
  return page.evaluate(() => {
    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        rect.top < window.innerHeight
      );
    };

    return Array.from(document.querySelectorAll('button')).map((btn, index) => {
      const style = window.getComputedStyle(btn);
      const rect = btn.getBoundingClientRect();
      const text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      return {
        index,
        testId: btn.getAttribute('data-testid') || '',
        text,
        disabled: btn.disabled,
        ariaDisabled: btn.getAttribute('aria-disabled') || '',
        pointerEvents: style.pointerEvents,
        visible: isVisible(btn),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        clickable: isVisible(btn) && !btn.disabled && style.pointerEvents !== 'none' && btn.getAttribute('aria-disabled') !== 'true',
      };
    });
  });
}

async function auditPublic(baseUrl, page) {
  const pages = [];
  for (const path of PUBLIC_PATHS) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1400);
    const buttons = await collectButtons(page);
    pages.push({ path, buttons });
  }
  return pages;
}

async function bootstrapMember(page) {
  await page.addInitScript(({ ts }) => {
    const encodeLocal = (value) => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
    const session = {
      id: 'audit-session-id',
      name: 'Audit Admin',
      email: 'dnainform@gmail.com',
      provider: 'password',
      role: 'super_admin',
      permissions: ['manage_services', 'manage_marketing', 'manage_email_templates', 'manage_admin_roles', 'view_financials', 'view_technical_metrics'],
      lastLoginAt: ts,
    };
    const log = [
      {
        id: 'audit-onboarding',
        timestamp: ts,
        type: 'ONBOARDING_COMPLETE',
        version: 4,
        payload: {},
      },
    ];
    window.localStorage.setItem('luna_api_base_url', 'http://127.0.0.1:65535');
    window.localStorage.setItem('luna_auth_session_v2', encodeLocal(session));
    window.localStorage.setItem('luna_event_log_v3', JSON.stringify(log));
  }, { ts: now });
}

async function goToSidebarTab(page, tab) {
  const more = page.getByTestId('top-nav-more');
  if (await more.isVisible().catch(() => false)) {
    await more.click({ force: true });
    await page.waitForTimeout(150);
  }
  const target = page.getByTestId(`sidebar-nav-${tab}`);
  if (!(await target.isVisible().catch(() => false))) {
    return false;
  }
  await target.click({ force: true });
  await page.waitForTimeout(300);
  return true;
}

async function auditMember(baseUrl, page) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const pages = [];
  for (const tab of MEMBER_SIDEBAR_TABS) {
    const ok = await goToSidebarTab(page, tab);
    if (!ok) {
      pages.push({ tab, skipped: true, reason: 'nav item not visible' });
      continue;
    }
    const buttons = await collectButtons(page);
    pages.push({ tab, skipped: false, buttons });
  }

  return pages;
}

async function runCriticalFlowChecks(page, baseUrl) {
  const checks = [];
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);

  const run = async (name, fn) => {
    try {
      await fn();
      checks.push({ name, ok: true });
    } catch (error) {
      checks.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  };

  await run('open dashboard before critical checks', async () => {
    const logoBtn = page.getByTestId('nav-logo-dashboard');
    if (await logoBtn.isVisible().catch(() => false)) {
      await logoBtn.click({ force: true });
      await page.waitForTimeout(300);
    }
    await page.getByTestId('dashboard-checkin-start').waitFor({ state: 'visible', timeout: 8000 });
  });

  await run('dashboard-explore-knowledge-btn opens library', async () => {
    await page.getByTestId('dashboard-explore-knowledge-btn').click({ force: true });
    await page.getByTestId('library-root').waitFor({ state: 'visible', timeout: 5000 });
  });

  await run('library-card opens detail', async () => {
    const card = page.locator('[data-testid^="library-card-"]').first();
    await card.click({ force: true });
    await page.getByTestId('hormone-detail').waitFor({ state: 'visible', timeout: 5000 });
  });

  await run('hormone-add-to-brief button works', async () => {
    await page.getByTestId('hormone-add-to-brief').click({ force: true });
    await page.getByTestId('hormone-add-feedback').waitFor({ state: 'visible', timeout: 5000 });
  });

  await run('hormone-detail-back closes detail', async () => {
    await page.getByTestId('hormone-detail-back').click({ force: true });
    await page.getByTestId('hormone-detail').waitFor({ state: 'hidden', timeout: 5000 });
  });

  await run('dashboard-open-reports-btn opens labs', async () => {
    await page.getByTestId('library-back').click({ force: true });
    await page.getByTestId('dashboard-open-reports-btn').click({ force: true });
    await page.getByTestId('labs-report-input').waitFor({ state: 'visible', timeout: 5000 });
  });

  return checks;
}

function summarize(audit) {
  const summarizePages = (pages, key) => pages.map((item) => {
    if (item.skipped) {
      return { page: item[key], skipped: true, total: 0, clickable: 0, blocked: 0, blockedSamples: [] };
    }
    const buttons = item.buttons || [];
    const blocked = buttons.filter((btn) => btn.visible && !btn.clickable);
    const clickable = buttons.filter((btn) => btn.visible && btn.clickable);
    return {
      page: item[key],
      skipped: false,
      total: buttons.length,
      clickable: clickable.length,
      blocked: blocked.length,
      blockedSamples: blocked.slice(0, 6).map((btn) => btn.testId || btn.text || `button#${btn.index}`),
    };
  });

  const publicSummary = summarizePages(audit.publicPages, 'path');
  const memberSummary = summarizePages(audit.memberPages, 'tab');

  return {
    generatedAt: now,
    criticalChecks: audit.criticalChecks,
    publicSummary,
    memberSummary,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const baseUrl = 'http://127.0.0.1:3000';
  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();

  try {
    const publicPages = await auditPublic(baseUrl, publicPage);

    await bootstrapMember(memberPage);
    const memberPages = await auditMember(baseUrl, memberPage);
    const criticalChecks = await runCriticalFlowChecks(memberPage, baseUrl);

    const audit = { publicPages, memberPages, criticalChecks };
    const summary = summarize(audit);

    process.stdout.write(JSON.stringify({ audit, summary }, null, 2));
  } finally {
    await publicContext.close();
    await memberContext.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
