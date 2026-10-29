let grammarData;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export async function loadGrammarData(url = new URL('./grammar-data.json?v=20261029-grammar-style-2', import.meta.url)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Grammar data: HTTP ${response.status}`);
  grammarData = await response.json();
  return grammarData;
}

function backbone(items = []) {
  return `<div class="grammar-backbone">${items.map(item => `<div><small>${esc(item.label)}</small><strong>${esc(item.text)}</strong></div>`).join('')}</div>`;
}

function keyWords(items = []) {
  const useful = items.filter(item => item.word && !['标点', '限定词'].includes(item.pos)).slice(0, 3);
  if (!useful.length) return '';
  return `<div class="grammar-keywords"><b>关键词</b>${useful.map(item => `<span><strong>${esc(item.word)}</strong>（${esc(item.pos)}）：${esc(item.role)}</span>`).join('')}</div>`;
}

function segmentCard(segment, index) {
  return `<article class="grammar-part-card">
    <div class="grammar-part-heading"><span>${index + 1}</span><strong>${esc(segment.kind)}</strong></div>
    <blockquote lang="en">${esc(segment.text.trim())}</blockquote>
    <p><b>含义：</b>${esc(segment.zh || '结合全句译文理解。')}</p>
    <p><b>作用：</b>${esc(segment.function)}</p>
    ${keyWords(segment.internal)}
  </article>`;
}

const collocationPatterns = [
  [/\bon earth\b/i, 'on earth', '用于疑问句中加强语气：究竟、到底'],
  [/\bin no way\b/i, 'in no way', '绝不；否定短语'],
  [/\bat heart\b/i, 'at heart', '在内心；本质上'],
  [/\baccess to\b/i, 'access to', '接触或使用……的机会'],
  [/\bdespite\b/i, 'despite + 名词／动名词', '表示“尽管”，后面不直接接完整句子'],
  [/\bstruggl(?:e|es|ed|ing) to\b/i, 'struggle to do', '努力或艰难地做某事'],
  [/\b(?:be|am|is|are|was|were) supportive of\b/i, 'be supportive of', '支持……'],
  [/\brather than\b/i, 'rather than', '而不是……'],
  [/\bnot only\b[\s\S]*\bbut also\b/i, 'not only ... but also ...', '不但……而且……'],
  [/\b(?:be|am|is|are|was|were) likely to\b/i, 'be likely to do', '可能做某事'],
  [/\bproportion of\b/i, 'a proportion of', '……的比例或份额'],
  [/\b(?:be|am|is|are|was|were) related to\b/i, 'be related to', '与……有关'],
  [/\b(?:lead|leads|led|leading) to\b/i, 'lead to', '导致；通向'],
  [/\b(?:result|results|resulted|resulting) in\b/i, 'result in', '导致某种结果'],
  [/\baccording to\b/i, 'according to', '根据……'],
  [/\bdue to\b/i, 'due to', '由于……'],
  [/\bsuch as\b/i, 'such as', '例如；列举同类事物']
];

const reviewedOverrides = {
  'cet6_2023_06_2_p1:2': {
    translation: '然而，即便如此，有一类人丝毫没有把孩子的切身利益放在心上，却几乎可以不受限制地接触他们。',
    backbone: [
      {label: '主语', text: 'one group'},
      {label: '谓语', text: 'has'},
      {label: '宾语／补足语', text: 'almost unconstrained access'}
    ],
    tip: '先跳过 which ... heart 这个插入的定语从句，主干就是 one group has almost unconstrained access。'
  }
};

function focusRows(sentence) {
  const rows = [];
  const seen = new Set();
  for (const segment of sentence.segments || []) {
    const name = segment.kind?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    rows.push([name, segment.rules?.[0] || segment.function]);
    if (rows.length === 2) break;
  }
  for (const [pattern, name, note] of collocationPatterns) {
    if (!pattern.test(sentence.text) || seen.has(name)) continue;
    seen.add(name);
    rows.push([name, note]);
    if (rows.length === 5) break;
  }
  return rows.length ? rows : [['主谓结构', '先找谓语，再判断其他部分与谓语的关系。']];
}

function summaryTable(sentence) {
  return `<div class="grammar-summary-wrap"><table class="grammar-summary"><thead><tr><th>结构／搭配</th><th>作用</th></tr></thead><tbody>${focusRows(sentence).map(([name, note]) => `<tr><td>${esc(name)}</td><td>${esc(note)}</td></tr>`).join('')}</tbody></table></div>`;
}

function readingTip(sentence, studyNote, reviewed) {
  if (reviewed?.tip) return reviewed.tip;
  if (studyNote?.exam) return studyNote.exam;
  const kinds = (sentence.segments || []).map(segment => segment.kind || '').join(' ');
  if (/定语从句|关系从句/.test(kinds)) return '先读主句，再把定语从句括起来，确认它修饰的先行词。';
  if (/状语从句/.test(kinds)) return '先找连接词，判断时间、条件、原因或让步，再回到主句结论。';
  if (/非谓语|分词|不定式/.test(kinds)) return '先抓有时态的谓语；不定式和分词通常承担修饰、补充或目的作用。';
  if ((sentence.segments || []).length > 3) return '先抓主语和谓语，再按原句顺序接回其余修饰成分。';
  return '先定位谓语，再用“谁做什么”快速还原句子主干。';
}

export function renderInteractiveGrammar(passage, sentenceIndex, studyNote) {
  const sentence = grammarData?.passages?.[passage.id]?.[sentenceIndex];
  if (!sentence) return `<div class="grammar-panel"><span class="panel-kicker">SENTENCE LAB</span><h2>语法资料暂缺</h2><p>请刷新页面后重试。</p></div>`;
  const reviewed = reviewedOverrides[`${passage.id}:${sentenceIndex}`];
  const translation = reviewed?.translation || studyNote?.translation || sentence.translation || '参考翻译暂缺。';
  return `<div class="grammar-panel concise-grammar" data-sentence-index="${sentenceIndex}">
    <span class="panel-kicker">SENTENCE LAB · 第 ${sentenceIndex + 1} 句</span>
    <h2>语法分析</h2>
    <section class="grammar-source"><h3>原句</h3><blockquote lang="en">${esc(sentence.text)}</blockquote><h3>参考翻译</h3><p>${esc(translation)}</p></section>
    <section class="grammar-section"><h3>句子主干</h3>${backbone(reviewed?.backbone || sentence.backbone)}</section>
    <section class="grammar-section"><h3>按原句顺序拆解</h3><div class="grammar-parts">${sentence.segments.map(segmentCard).join('')}</div></section>
    <section class="grammar-section"><h3>重点语法与搭配</h3>${summaryTable(sentence)}</section>
    <section class="grammar-reading-tip"><b>阅读技巧</b><p>${esc(readingTip(sentence, studyNote, reviewed))}</p></section>
    <div class="grammar-caution">${studyNote || reviewed ? '重点句含人工校订；' : ''}自动语法分析仅供学习参考，请结合上下文核对。</div>
  </div>`;
}

export function handleGrammarClick() {
  return false;
}

export function grammarMethod() {
  return grammarData?.method || '';
}
