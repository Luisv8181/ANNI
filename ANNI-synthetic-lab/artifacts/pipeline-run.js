const { chromium } = require('playwright');
const fs = require('fs');
const OUT = '/home/user/ANNI/ANNI-synthetic-lab/screenshots/';
const ART = '/home/user/ANNI/ANNI-synthetic-lab/artifacts/';
const API = 'http://localhost:8000';

const SOURCE_TEXT = `I kept telling myself it was probably nothing, and I didn't want to bother the doctor with it. Everyone has stress, I thought. Who was I to take up an appointment slot over some racing thoughts?

My sister was the one who finally made the call. She drove me to every appointment after that and sat with me in the waiting room, doing the crossword out loud until I stopped bouncing my knee.

The first visit went fine until they handed me the pamphlet. It might as well have been written in another language. I nodded along without understanding the dosage instructions, and I was too embarrassed to ask them to explain it again.

Then the clinic mixed up my referral, twice. I sat on hold for forty minutes to be told I wasn't in the system. After that I stopped believing anyone there actually had my back, and I let the follow-up lapse.

What I want now is simple. I just want to be the one who decides what happens next with my own treatment - not a form, not a portal, me. On the days my sister checks in, I almost believe I can be.`;

const HIGHLIGHTS = [
  "probably nothing, and I didn't want to bother the doctor",
  "drove me to every appointment after that and sat with me in the waiting room",
  "might as well have been written in another language. I nodded along without understanding the dosage instructions",
  "I stopped believing anyone there actually had my back",
  "I just want to be the one who decides what happens next with my own treatment",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function selectPhrase(page, phrase) {
  const ok = await page.evaluate((phrase) => {
    const els = Array.from(document.querySelectorAll('section *'));
    const el = els.find((e) => e.childElementCount === 0 && (e.textContent || '').includes(phrase))
      || els.find((e) => (e.textContent || '').includes(phrase) && e.tagName !== 'SECTION' && e.tagName !== 'MAIN');
    if (!el) return false;
    // build a range over the phrase inside this element's text nodes
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node, full = '', nodes = [];
    while ((node = walker.nextNode())) { nodes.push({ node, start: full.length }); full += node.textContent; }
    const at = full.indexOf(phrase);
    if (at < 0) return false;
    const locate = (pos) => {
      for (let i = nodes.length - 1; i >= 0; i--) if (pos >= nodes[i].start) return { node: nodes[i].node, offset: pos - nodes[i].start };
      return null;
    };
    const s = locate(at), e = locate(at + phrase.length);
    if (!s || !e) return false;
    const range = document.createRange();
    range.setStart(s.node, s.offset); range.setEnd(e.node, e.offset);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    // fire the React onMouseUp on the paragraph wrapper (bubbles to it)
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    return true;
  }, phrase);
  if (!ok) throw new Error('phrase not found: ' + phrase);
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await b.newPage({ viewport: { width: 1440, height: 1050 } });

  // record pre-existing annotations so we can diff the new ones later
  const before = await (await fetch(`${API}/annotations?project_id=proj-anni-demo`)).json();
  const beforeIds = new Set(before.map((a) => a.id));

  // ── 1 · import & cite ──
  await page.goto('http://localhost:3000/reader', { waitUntil: 'networkidle' });
  await sleep(1000);
  await page.getByRole('button', { name: 'Import a source' }).click();
  await sleep(600);
  await page.getByPlaceholder('My experience with GAD therapy').fill('DEMO — What finally got me through the clinic door (synthetic composite, pipeline test)');
  await page.getByPlaceholder('Anonymous blogger').fill('Synthetic composite (not a real person)');
  await page.getByPlaceholder('https://…').fill('https://example.org/anni-pipeline-demo');
  await page.getByPlaceholder('CC-BY / permission…').fill('demo — synthetic text, cleared by definition');
  await page.getByPlaceholder(/Paste the testimony/).fill(SOURCE_TEXT);
  await page.screenshot({ path: OUT + '01-import-and-cite.png', fullPage: false });
  await page.getByRole('button', { name: 'Ingest into the reader' }).click();
  await sleep(1500);

  // ── 2 · ingested, cited, segmented ──
  await page.screenshot({ path: OUT + '02-reader-ingested.png' });

  // ── 3 · read gate ──
  await page.getByRole('button', { name: /I.*ve read this/ }).click();
  await sleep(800);

  // ── 4 · smart highlighter loop ──
  for (let i = 0; i < HIGHLIGHTS.length; i++) {
    await selectPhrase(page, HIGHLIGHTS[i]);
    await sleep(1400); // heuristic + model suggestion arrive
    if (i === 0) {
      await page.screenshot({ path: OUT + '03-smart-highlighter.png' });
      const useThis = page.getByRole('button', { name: 'Use this' });
      if (await useThis.count()) await useThis.click();
      await sleep(300);
    }
    await page.getByRole('button', { name: 'Add annotation' }).click();
    await sleep(900);
  }

  // ── 5 · tracker + session summary ──
  await page.screenshot({ path: OUT + '04-tracker-after-five.png' });
  await page.getByRole('heading', { name: 'Session summary' }).scrollIntoViewIfNeeded();
  await sleep(600);
  await page.screenshot({ path: OUT + '05-session-summary.png' });

  // ── 6 · generate the synthetic-profile prompt ──
  await page.getByLabel('Persona name').fill('SP-04 — Overwhelmed Self-Advocate');
  const selects = page.locator('select');
  await selects.last().selectOption({ label: 'Subtle' });
  await page.getByRole('button', { name: 'Generate system prompt' }).click();
  await sleep(1500);
  await page.screenshot({ path: OUT + '06-generated-prompt.png' });
  const citToggle = page.getByText(/citation/i).first();
  if (await citToggle.count()) { await citToggle.click(); await sleep(600); }
  await page.screenshot({ path: OUT + '07-citations-block.png' });

  // ── 7 · reviewer approval + save to the profile library (API, as the review step) ──
  const after = await (await fetch(`${API}/annotations?project_id=proj-anni-demo`)).json();
  const fresh = after.filter((a) => !beforeIds.has(a.id)).reverse();
  console.log('new annotations:', fresh.length);
  for (const a of fresh) {
    await fetch(`${API}/annotations/${a.id}/decisions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'accepted', review_note: 'Pipeline simulation review — quote supports the trait.', decided_by: 'luis' }),
    });
  }
  const comp = await (await fetch(`${API}/prompt-compilations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: 'proj-anni-demo', name: 'SP-04 — Overwhelmed Self-Advocate',
      annotation_ids: fresh.map((a) => a.id),
      scenario: 'Adult with untreated GAD returning to care after a lapse; strong sibling support, low trust in the clinic system.',
      learning_objective: 'Elicit concerns without triggering withdrawal; check understanding in plain language.',
      created_by: 'luis',
    }),
  })).json();
  console.log('compiled profile:', comp.id, comp.name);

  // save the generated prompt + citations as artifacts
  const gen = await (await fetch(`${API}/synthetic-lab/generate-prompt`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona_name: 'SP-04 — Overwhelmed Self-Advocate', annotation_ids: fresh.map((a) => a.id), outcome_mode: 'open', risk_level: 'subtle', include_dsm5: true }),
  })).json();
  fs.writeFileSync(ART + 'sp-04-system-prompt.md', gen.system_prompt);
  fs.writeFileSync(ART + 'sp-04-citations.json', JSON.stringify(gen.citations, null, 2));

  // ── 8 · Patient Lab with the new profile ──
  await page.goto('http://localhost:3000/lab', { waitUntil: 'networkidle' });
  await sleep(1500);
  await page.getByRole('button', { name: /SP-04/ }).click();
  await sleep(500);
  await page.getByRole('button', { name: /^Subtle/ }).click();
  await sleep(400);
  await page.getByRole('button', { name: /Let the patient open/i }).click();
  await sleep(1400);
  const RESPONDER_TURNS = [
    'Thanks for reaching out. That sounds exhausting - what does "a lot" look like for you day to day?',
    'Lying awake replaying the day is a heavy habit. It says something good that you came here even so.',
    'That pamphlet moment sounds frustrating. Would it help to go through the confusing parts together, in plain words?',
    'Losing your referral twice would shake anyone\'s trust. Wanting to steer your own care makes complete sense.',
  ];
  for (const t of RESPONDER_TURNS) {
    const box = page.locator('textarea').first();
    await box.fill(t); await box.press('Enter');
    await sleep(1300);
  }
  await page.screenshot({ path: OUT + '08-lab-session.png' });
  const card = page.locator('section').filter({ hasText: 'Session trail' }).first();
  await card.screenshot({ path: OUT + '09-presence-and-trail.png' });

  // ── 9 · push to blind scoring, then look at the blinded queue ──
  await page.getByRole('button', { name: /scoring/i }).first().click();
  await sleep(1200);
  await page.goto('http://localhost:3000/score', { waitUntil: 'networkidle' });
  await sleep(1500);
  await page.screenshot({ path: OUT + '10-blind-scoring-queue.png' });

  // ── 10 · provenance chain after the whole run ──
  await page.goto('http://localhost:3000/provenance', { waitUntil: 'networkidle' });
  await sleep(1500);
  await page.screenshot({ path: OUT + '11-provenance-chain.png' });

  await b.close();
  console.log('pipeline run complete');
})();
