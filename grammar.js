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

const wordNotes = {
  yet: '副词，表示转折，意为“然而、可是”，承接上文。',
  despite: '介词，表示“尽管”；后接名词、代词或动名词。',
  which: '关系代词，引导定语从句，并在从句中充当成分。',
  that: '从属连词，引导从句，本身不充当句子成分。',
  almost: '程度副词，意为“几乎”，修饰后面的形容词或动词。',
  even: '强调副词，意为“甚至、连……也”。'
};

function automaticNotes(segment) {
  const items = (segment.internal || []).filter(item => item.word && item.pos !== '标点');
  const notes = [];
  for (const item of items) {
    const lexical = wordNotes[item.word.toLowerCase()];
    if (lexical) notes.push([item.word, lexical]);
    else if (item.pos !== '限定词') notes.push([item.word, `${item.pos}，在本部分作${item.role}${item.head && item.head !== item.word ? `，关联到 ${item.head}` : ''}。`]);
    if (notes.length === 5) break;
  }
  for (const [pattern, name, note] of collocationPatterns) {
    if (pattern.test(segment.text) && !notes.some(item => item[0] === name)) notes.push([name, note + '。']);
  }
  return notes.slice(0, 6);
}

function segmentCard(segment, index) {
  const notes = segment.notes || automaticNotes(segment);
  return `<article class="grammar-part-card">
    <div class="grammar-part-heading"><span>${index + 1}</span><strong lang="en">${esc(segment.text.trim())}</strong></div>
    <p><b>含义：</b>${esc(segment.zh || '结合全句译文理解。')}</p>
    <p><b>结构：</b>${esc(segment.kind)}</p>
    <p><b>作用：</b>${esc(segment.function)}</p>
    ${notes.length ? `<ul class="grammar-word-notes">${notes.map(([term, note]) => `<li><strong>${esc(term)}</strong>：${esc(note)}</li>`).join('')}</ul>` : ''}
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
    parts: [
      {text: 'Yet despite all this', zh: '然而，尽管如此', kind: '让步状语', function: '放在句首承接上文，并为主句设置让步背景。', notes: [['Yet', '副词，表示转折，意为“然而”。'], ['despite', '介词，意为“尽管”；后接名词、代词或动名词。'], ['all this', '名词短语，作 despite 的宾语，指代前文所述的一切保护措施。']]},
      {text: 'one group', zh: '有一类人', kind: '主句主语', function: 'one group 是主句动作 has 的发出者。', notes: [['one', '数词，限定 group，表示“一类”。'], ['group', '名词，作主句主语。']]},
      {text: 'which in no way has their best interests at heart', zh: '他们丝毫没有把孩子的切身利益放在心上', kind: '非限制性定语从句', function: '补充说明 one group；去掉后，主句结构仍完整。', notes: [['which', '关系代词，指代 one group，并在从句中作主语。'], ['in no way', '固定否定短语，意为“绝不、丝毫不”。'], ['has ... at heart', '固定表达 have somebody’s interests at heart，意为“把某人的利益放在心上”。'], ['their best interests', '名词短语，意为“他们的切身利益”；their 指代前文的 children。']]},
      {text: 'has almost unconstrained access', zh: '几乎可以不受限制地接触他们', kind: '主句谓语和宾语', function: 'has 是主句谓语，almost unconstrained access 是宾语。', notes: [['has', '实义动词，意为“拥有、获得”。'], ['almost', '程度副词，修饰 unconstrained，意为“几乎”。'], ['unconstrained', '形容词，修饰 access，意为“不受限制的”。'], ['access', '名词，作 has 的宾语；接触对象由上下文补出为 children。']]}
    ],
    tip: '先跳过 which ... heart 这个插入的定语从句，主干就是 one group has almost unconstrained access。'
  },
  'cet6_2023_06_2_p1:3': {
    translation: '广告商和营销人员获准向孩子灌输消费观念，甚至连年龄最小的孩子也不放过，而我们似乎对此习以为常。',
    backbone: [
      {label: '主语', text: 'We'},
      {label: '谓语', text: 'seem to take'},
      {label: '固定结构', text: 'take it for granted that ...'}
    ],
    parts: [
      {text: 'We seem to take it for granted', zh: '我们似乎对此习以为常', kind: '主句', function: 'We 是主语；seem to take 是谓语部分；it 是形式宾语。', notes: [['seem to do', '固定结构，意为“似乎做某事”。'], ['take it for granted that ...', '固定结构，意为“想当然地认为……、对……习以为常”。'], ['it', '形式宾语，真正的宾语是后面的 that 从句。']]},
      {text: 'that advertisers and marketers', zh: '广告商和营销人员……', kind: '宾语从句的引导词和主语', function: 'that 引导真正的宾语从句；advertisers and marketers 是从句主语。', notes: [['that', '从属连词，引导宾语从句，本身不作成分。'], ['advertisers and marketers', '并列名词短语，作从句主语。']]},
      {text: 'are allowed to condition', zh: '获准向……灌输观念', kind: '被动语态和不定式', function: 'are allowed 是被动谓语；to condition 是其不定式补足语。', notes: [['be allowed to do', '固定结构，意为“被允许做某事”。'], ['condition', '动词，此处意为“使形成特定反应或观念”。']]},
      {text: 'even the youngest children', zh: '甚至连年龄最小的孩子', kind: '宾语名词短语', function: '整个短语作 condition 的宾语。', notes: [['even', '强调副词，意为“甚至、连……也”。'], ['youngest', '形容词最高级，修饰 children。'], ['children', '名词，作 condition 的宾语。']]}
    ],
    tip: '先把 take it for granted that ... 识别成整体：it 是形式宾语，that 从句才是真正宾语。'
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
    <section class="grammar-section"><h3>按原句顺序拆解</h3><div class="grammar-parts">${(reviewed?.parts || sentence.segments).map(segmentCard).join('')}</div></section>
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
