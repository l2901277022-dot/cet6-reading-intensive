let grammarData;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export async function loadGrammarData(url = new URL('./grammar-data.json', import.meta.url)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Grammar data: HTTP ${response.status}`);
  grammarData = await response.json();
  return grammarData;
}

function backbone(items = []) {
  return `<div class="grammar-backbone">${items.map(item => `<div><small>${esc(item.label)}</small><strong>${esc(item.text)}</strong></div>`).join('')}</div>`;
}

function relations(items = []) {
  if (!items.length) return '<p class="grammar-empty">本句没有识别到独立的嵌套或修饰关系。</p>';
  return `<div class="grammar-relations">${items.slice(0, 12).map(item => `<div><span>${esc(item.relation)}</span><strong>${esc(item.from)}</strong><small>关联到：${esc(item.to)}</small></div>`).join('')}</div>`;
}

function internalTable(items = []) {
  return `<div class="grammar-token-table"><table><thead><tr><th>词</th><th>词性</th><th>作用</th><th>关联</th></tr></thead><tbody>${items.map(item => `<tr><td>${esc(item.word)}</td><td>${esc(item.pos)}</td><td>${esc(item.role)}</td><td>${esc(item.head || '—')}</td></tr>`).join('')}</tbody></table></div>`;
}

function segmentDetail(segment, index) {
  const example = segment.example || [];
  return `<article class="grammar-segment-detail ${index === 0 ? 'is-active' : ''}" data-grammar-detail="${index}" ${index === 0 ? '' : 'hidden'}>
    <div class="segment-detail-heading"><span>片段 ${index + 1}</span><strong>${esc(segment.kind)}</strong></div>
    <blockquote lang="en">${esc(segment.text)}</blockquote>
    <dl class="segment-summary">
      <div><dt>中文含义</dt><dd>${esc(segment.zh || '片段译文暂缺，请结合全句译文理解。')}</dd></div>
      <div><dt>语法结构</dt><dd>${esc(segment.kind)}</dd></div>
      <div><dt>句法功能</dt><dd>${esc(segment.function)}</dd></div>
      <div><dt>中心词</dt><dd><strong>${esc(segment.head || '—')}</strong></dd></div>
    </dl>
    <details class="grammar-deep"><summary>展开内部结构 · ${segment.internal?.length || 0} 词</summary>${internalTable(segment.internal)}</details>
    <details class="grammar-deep"><summary>展开语法规则 · ${segment.rules?.length || 0} 条</summary><ol>${(segment.rules || []).map(rule => `<li>${esc(rule)}</li>`).join('')}</ol></details>
    <details class="grammar-deep"><summary>结构还原与类似例句</summary><div class="grammar-restoration"><b>结构还原</b><p>${esc(segment.restoration)}</p>${example.length ? `<b>类似例句</b><p lang="en">${esc(example[0])}</p><p>${esc(example[1])}</p>` : ''}</div></details>
  </article>`;
}

export function renderInteractiveGrammar(passage, sentenceIndex, studyNote) {
  const sentence = grammarData?.passages?.[passage.id]?.[sentenceIndex];
  if (!sentence) return `<div class="grammar-panel"><span class="panel-kicker">SENTENCE LAB</span><h2>句法资料暂缺</h2><p>请刷新页面后重试。</p></div>`;
  const segmentButtons = sentence.segments.map((segment, index) => `<button type="button" class="grammar-segment tone-${index % 6} ${index === 0 ? 'is-active' : ''}" data-grammar-segment="${index}" aria-pressed="${index === 0}" title="查看片段 ${index + 1}：${esc(segment.kind)}"><span>${esc(segment.text)}</span></button>`).join('');
  return `<div class="grammar-panel interactive-grammar" data-sentence-index="${sentenceIndex}">
    <span class="panel-kicker">SENTENCE LAB · 第 ${sentenceIndex + 1} 句</span>
    <h2>点击彩色片段，逐层拆句</h2>
    <div class="grammar-source-sentence" lang="en" aria-label="按语法结构划分的英文原句">${segmentButtons}</div>
    <p class="grammar-segment-tip">分段依据为依存句法中的真实成分；所有字符保持原顺序且连续覆盖。当前片段以边框高亮。</p>
    <section class="grammar-detail-stack">${sentence.segments.map(segmentDetail).join('')}</section>
    <section class="grammar-overview"><h3>整句主干</h3>${backbone(sentence.backbone)}<h3>完整中文翻译</h3><p>${esc(studyNote?.translation || sentence.translation || '译文暂缺')}</p>${studyNote ? `<div class="grammar-reviewed-note"><b>关键句人工补充</b><p>${esc(studyNote.reading)}</p>${studyNote.exam ? `<p><strong>对应考点：</strong>${esc(studyNote.exam)}</p>` : ''}</div>` : ''}</section>
    <details class="grammar-fold"><summary>查看片段之间的逻辑与修饰关系 · ${sentence.relations?.length || 0} 处</summary>${relations(sentence.relations)}</details>
    <div class="grammar-caution">自动句法与片段译文用于学习参考，可能误判引语、倒装、省略或并列层级；关键考题句的人工补充会单独标明。</div>
  </div>`;
}

export function handleGrammarClick(event) {
  const button = event.target.closest('[data-grammar-segment]');
  if (!button) return false;
  const panel = button.closest('.interactive-grammar');
  if (!panel) return false;
  const index = button.dataset.grammarSegment;
  panel.querySelectorAll('[data-grammar-segment]').forEach(item => {
    const active = item.dataset.grammarSegment === index;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  panel.querySelectorAll('[data-grammar-detail]').forEach(item => {
    const active = item.dataset.grammarDetail === index;
    item.hidden = !active;
    item.classList.toggle('is-active', active);
  });
  return true;
}

export function grammarMethod() {
  return grammarData?.method || '';
}
