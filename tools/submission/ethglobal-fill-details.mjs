export async function run({ page }) {
  const details = JSON.parse(process.env.ETHGLOBAL_PROJECT_DETAILS_JSON ?? "{}");
  if (!details.name || !details.url || !details.tagline) {
    throw new Error("ETHGLOBAL_PROJECT_DETAILS_JSON is missing required fields");
  }

  await page.goto("https://ethglobal.com/events/openagents/project", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(2500);

  await page.locator('input[name="name"]').fill(details.name);
  if (details.emoji) await page.locator('input[name="emoji"]').fill(details.emoji);
  await page.locator('input[name="url"]').fill(details.url);
  await page.locator('input[name="tagline"]').fill(details.tagline);
  await page.locator('textarea[name="description"]').fill(details.description);
  await page.locator('textarea[name="howItsMade"]').fill(details.howItsMade);

  const beforeSave = await snapshot(page);
  if (details.save !== false) {
    await page.getByRole("button", { name: /^Save & Continue$/ }).click();
    await page.waitForTimeout(2500);
  }

  return {
    beforeSave,
    afterSaveUrl: page.url(),
    afterSaveText: (await page.locator("body").innerText()).slice(0, 1200),
  };
}

async function snapshot(page) {
  return page.locator("input, textarea, select").evaluateAll((els) =>
    els.map((el) => ({
      tag: el.tagName,
      name: el.getAttribute("name"),
      value: "value" in el ? el.value : el.textContent,
    })),
  );
}
