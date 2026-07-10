import { expect, test } from '@playwright/test';
import { clickSidebarNav, openMoreMenu } from './helpers/auth.js';
import { bootstrapMemberSession } from './helpers/bootstrap';

test('bridge reflection flow renders generated local note', async ({ page }) => {
  await bootstrapMemberSession(page, { onboardingComplete: true });
  await page.goto('/');
  await page.waitForTimeout(300);
  await openMoreMenu(page);
  await clickSidebarNav(page, 'sidebar-nav-bridge');

  await page.getByRole('button', { name: /continue/i }).click();

  const answers = [
    'I feel overloaded today',
    'This does not mean conflict',
    'A calm evening would help',
  ];

  for (let index = 0; index < answers.length; index += 1) {
    const input = page.getByPlaceholder(/type your answer/i);
    await expect(input).toBeVisible();
    await input.fill(answers[index]);
    const action = index < answers.length - 1 ? /next/i : /form reflection/i;
    await page.getByRole('button', { name: action }).click();
  }

  await expect(page.getByText(/do you want this to be shared|simply understood/i)).toBeVisible();
});
