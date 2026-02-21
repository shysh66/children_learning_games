const { test, expect } = require('@playwright/test');

test('happy path - profile creation to kingdoms hub', async ({ page }) => {
  await page.goto('/');

  // Step 1: Profile creation - enter name
  await expect(page.getByPlaceholder('הכנס שם...')).toBeVisible();
  await page.getByPlaceholder('הכנס שם...').fill('Test User');
  await page.getByRole('button', { name: 'המשך ←' }).click();

  // Step 2: Avatar selection - default avatar is pre-selected, click start
  await page.getByRole('button', { name: 'בואו נתחיל! 🚀' }).click();

  // Step 3: Theme selection - click "חלל" (Space) theme card
  await page.getByRole('button', { name: '🚀 חלל' }).click();

  // Step 4: Zone selection - click "החוקרים הצעירים" (Young Explorers)
  await page.getByText('החוקרים הצעירים').click();

  // Step 5: Verify the 3 Kingdoms appear on screen
  await expect(page.getByText('ממלכת המספרים')).toBeVisible();
  await expect(page.getByText('ממלכת האותיות והמילים')).toBeVisible();
  await expect(page.getByText('ממלכת החשיבה')).toBeVisible();
});
