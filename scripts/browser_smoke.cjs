// Real unpacked extension smoke check. Requires Playwright and installed Edge.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/pc/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
async function main() {
  const root=path.resolve(__dirname,'..');
  const extension=path.join(root,'app/extension/dist');
  const context=await chromium.launchPersistentContext(path.join(root,'tmp/browser-profile'),{
    channel:'msedge',headless:true,ignoreDefaultArgs:['--disable-extensions'],
    args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--no-first-run'],
    viewport:{width:420,height:900},acceptDownloads:true
  });
  try {
    const worker=context.serviceWorkers()[0] || await context.waitForEvent('serviceworker',{timeout:20000});
    const id=new URL(worker.url()).host;
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`chrome-extension://${id}/index.html`);
    await page.getByRole('button',{name:'Explore a labelled example'}).click();
    await page.getByRole('heading',{name:'Collected evidence'}).waitFor();
    assert.equal(await page.locator('article.source').count(),3);
    await page.screenshot({path:path.join(root,'tmp/reentry-sources.png'),fullPage:true});
    await page.getByRole('button',{name:'Claims',exact:true}).click();
    await page.getByText('Method A is faster on mobile devices.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Review',exact:true}).click();
    await page.getByLabel('Claim to examine').selectOption({label:'Method A is faster on mobile devices.'});
    await page.getByLabel('New or qualifying passage').selectOption({label:'Older-phone test · synthetic fixture'});
    await page.getByText('Record your own review',{exact:true}).click();
    await page.getByLabel('Why does it need review?').fill('The original evidence only covers desktop hardware. Mobile conclusions require qualification.');
    await page.getByRole('button',{name:'Save manual finding',exact:true}).click();
    await page.getByLabel('Review and write your revised paragraph').fill('Method A was faster in the synthetic desktop test. Performance on older phones differs, so the evidence does not support a universal mobile recommendation.');
    await page.getByRole('button',{name:'Approve revision',exact:true}).click();
    await page.locator('.status.accepted').waitFor();
    await page.getByRole('button',{name:'Timeline',exact:true}).click();
    await page.getByRole('heading',{name:'Draft revision approved'}).waitFor();
    await page.screenshot({path:path.join(root,'tmp/reentry-timeline.png'),fullPage:true});
    await page.reload();
    await page.getByRole('heading',{name:'Collected evidence'}).waitFor();
    assert.equal(await page.locator('article.source').count(),3);
    await page.getByRole('button',{name:'Review',exact:true}).click();
    await page.locator('.status.accepted').waitFor();
    const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export workspace notes'}).click()]);
    const exportPath=path.join(root,'tmp/reentry-export.md');await download.saveAs(exportPath);
    assert.ok(fs.readFileSync(exportPath,'utf8').includes('Performance on older phones differs'));
    await page.getByRole('button',{name:'Sources',exact:true}).click();
    await page.getByRole('button',{name:'Inspect saved evidence'}).first().click();
    await page.getByRole('heading',{name:'Saved evidence',exact:true}).waitFor();
    await page.screenshot({path:path.join(root,'tmp/reentry-evidence.png'),fullPage:true});
    await page.setViewportSize({width:360,height:800});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.join(root,'tmp/reentry-narrow.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({extensionId:id,passed:['real extension worker loaded','fixture workspace','source-to-claim links','manual evidence review','approved revision','timeline preserves original','reload persistence','cited Markdown export','360px layout'],screenshots:'tmp/reentry-*.png'},null,2));
  } finally { await context.close(); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
