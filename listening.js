const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function wordify(value) {
  const source = String(value ?? '');
  const pattern = /\b[A-Za-z]+(?:[’'-][A-Za-z]+)*\b/g;
  let html = '';
  let end = 0;
  for (const match of source.matchAll(pattern)) {
    html += escapeHTML(source.slice(end, match.index));
    const word = escapeHTML(match[0]);
    html += `<span class="review-word" role="button" tabindex="0" data-surface="${word}">${word}</span>`;
    end = match.index + match[0].length;
  }
  return html + escapeHTML(source.slice(end));
}

let data;
let current = 0;
let mode = 'practice';
let view = 'both';
let root;
const selectedOptions = new Map();
const openTranslations = new Set();
const openAnswers = new Set();

function groupCard(group, index) {
  const count = group.questions.length;
  return `<button class="listen-group ${index === current ? 'active' : ''}" type="button" data-listen-group="${index}" aria-pressed="${index === current}"><span>${escapeHTML(group.section)} · ${escapeHTML(group.label)}</span><strong>${escapeHTML(group.topic)}</strong><small>${group.start}–${group.start + count - 1} 题 · ${group.paragraphs.length} 段</small></button>`;
}

function questionCard(question) {
  const number = question.number;
  return `<article class="listen-question" id="listen-q-${number}"><div class="listen-question-top"><span class="listen-q-no">${String(number).padStart(2, '0')}</span><div class="listen-question-heading"><small>${escapeHTML(question.type)} · 听力题干</small><h3 lang="en">${wordify(question.stem)}</h3></div></div><div class="listen-options">${question.options.map((option, index) => {
    const letter = 'ABCD'[index];
    return `<label class="listen-option ${openAnswers.has(number) && letter === question.answer ? 'correct' : ''}" data-option="${letter}"><input type="radio" name="listen-q-${number}" value="${letter}" ${selectedOptions.get(number) === letter ? 'checked' : ''}><b>${letter}</b><span lang="en">${wordify(option)}</span></label>`;
  }).join('')}</div><div class="listen-question-actions"><button type="button" data-listen-translate="${number}" aria-expanded="${openTranslations.has(number)}">题目翻译</button><button type="button" data-listen-answer="${number}" aria-expanded="${openAnswers.has(number)}">查看答案与解析</button></div><div class="listen-translation" id="listen-translation-${number}" ${openTranslations.has(number) ? '' : 'hidden'}><strong>题干</strong><p>${escapeHTML(question.stemZh)}</p>${question.optionsZh.map((option, index) => `<p><b>${'ABCD'[index]}.</b> ${escapeHTML(option)}</p>`).join('')}</div><div class="listen-answer" id="listen-answer-${number}" ${openAnswers.has(number) ? '' : 'hidden'}><div class="listen-answer-head"><strong>答案 ${question.answer}</strong><span>${escapeHTML(question.type)}</span><button type="button" data-listen-evidence="${escapeHTML(question.evidence)}">跳到原文定位 ↗</button></div><p><b>原文定位：</b><span lang="en">${wordify(question.evidenceEn)}</span></p><p><b>定位翻译：</b>${escapeHTML(question.evidenceZh)}</p><p><b>解题关键：</b>${escapeHTML(question.signal)}</p>${question.paraphrase.length ? `<div class="listen-analysis-block"><b>同义替换</b><ul>${question.paraphrase.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div>` : ''}<div class="listen-analysis-block"><b>其他选项为什么不对</b><ul>${question.exclusions.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div></div></article>`;
}

function transcriptRow(group, paragraph) {
  return `<div class="listen-line" id="listen-p-${group.start}-${paragraph.id}"><div class="listen-line-num">${String(paragraph.id).padStart(2, '0')}</div><div class="listen-line-content"><p class="listen-en" lang="en">${wordify(paragraph.en)}</p><p class="listen-zh">${escapeHTML(paragraph.zh)}</p></div><button type="button" class="listen-speak" data-listen-speak="${paragraph.id}" aria-label="朗读第 ${paragraph.id} 段英文" title="浏览器朗读英文">▶</button></div>`;
}

function render() {
  const previousAudio = root.querySelector('#listen-audio');
  const audioState = previousAudio ? {time: previousAudio.currentTime, rate: previousAudio.playbackRate, playing: !previousAudio.paused} : null;
  const group = data.groups[current];
  root.innerHTML = `<div class="listen-hero"><span class="listen-kicker">CET-6 · LISTENING LAB</span><h1>听力精听台</h1><p>${escapeHTML(data.title)} · 7 段录音原文 · 25 道听力题</p><div class="listen-hero-links"><a href="${escapeHTML(data.source)}" target="_blank" rel="noopener noreferrer">核对原文与解析 ↗</a><a href="${escapeHTML(data.audioSource)}" target="_blank" rel="noopener noreferrer">录音来源 ↗</a></div></div><div class="listen-group-list" aria-label="选择听力篇目">${data.groups.map(groupCard).join('')}</div><div class="listen-session"><div class="listen-section-kicker">${escapeHTML(group.section)} · ${escapeHTML(group.label)}</div><h2>${escapeHTML(group.topic)}</h2><p>第 ${group.start}–${group.start + group.questions.length - 1} 题 · 先听录音作答，再切换“精听订正”查看原文。</p><div class="listen-player"><div class="listen-player-heading"><strong>2024 年 6 月第 2 套完整录音</strong><a href="${escapeHTML(data.audio)}" target="_blank" rel="noopener noreferrer">单独打开录音 ↗</a></div><audio id="listen-audio" controls preload="none" src="${escapeHTML(data.audio)}">浏览器不支持音频播放。</audio><div class="listen-player-actions"><button type="button" data-listen-back="10">↶ 后退 10 秒</button><label>语速 <select id="listen-rate"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label><small>下方各篇可按题号切换；单段英文使用浏览器朗读。</small></div></div><div class="listen-practice-modes" role="group" aria-label="学习方式"><button type="button" data-listen-mode="practice" class="${mode === 'practice' ? 'active' : ''}" aria-pressed="${mode === 'practice'}">先做题</button><button type="button" data-listen-mode="review" class="${mode === 'review' ? 'active' : ''}" aria-pressed="${mode === 'review'}">精听订正</button></div><section class="listen-questions" aria-labelledby="listen-questions-title"><div class="listen-block-head"><span>01 / ANSWER & REVIEW</span><h2 id="listen-questions-title">听力题目</h2><p>选项可先作答；答案与翻译分别按题展开。英文单词轻触或悬停可在学习工作台查看。</p></div>${group.questions.map(questionCard).join('')}</section><section class="listen-transcript ${mode === 'practice' ? 'is-locked' : ''}" id="listen-transcript" data-view="${view}"><div class="listen-block-head"><span>02 / TRANSCRIPT</span><h2>听力原文与译文</h2><p>原文按录音顺序排列；点击英文单词可查看释义。单段播放为浏览器朗读。</p></div>${mode === 'practice' ? '<div class="listen-locked-note">正在先做题。点“精听订正”查看原文和译文。</div>' : `<div class="listen-view-modes" role="group" aria-label="原文显示方式"><button type="button" data-listen-view="en" class="${view === 'en' ? 'active' : ''}" aria-pressed="${view === 'en'}">只看原文</button><button type="button" data-listen-view="both" class="${view === 'both' ? 'active' : ''}" aria-pressed="${view === 'both'}">中英对照</button><button type="button" data-listen-view="zh" class="${view === 'zh' ? 'active' : ''}" aria-pressed="${view === 'zh'}">只看中文</button></div><div class="listen-lines">${group.paragraphs.map(paragraph => transcriptRow(group, paragraph)).join('')}</div>`}</section></div><div class="listen-credit">原文、题目及译文整理自公开真题学习资料；录音由外部来源提供。<a href="${escapeHTML(data.source)}" target="_blank" rel="noopener noreferrer">查看资料来源</a></div>`;
  if (audioState) {
    const audio = root.querySelector('#listen-audio');
    const rate = root.querySelector('#listen-rate');
    audio.playbackRate = audioState.rate;
    rate.value = String(audioState.rate);
    if (audioState.time > 0) audio.addEventListener('loadedmetadata', () => { audio.currentTime = audioState.time; if (audioState.playing) audio.play().catch(() => {}); }, {once: true});
    else if (audioState.playing) audio.play().catch(() => {});
  }
}

function showEvidence(key) {
  const [start] = key.split('-');
  const index = data.groups.findIndex(group => String(group.start) === start);
  if (index < 0) return;
  mode = 'review';
  current = index;
  render();
  const target = root.querySelector(`#listen-p-${key}`);
  target?.classList.add('evidence-active');
  target?.scrollIntoView({behavior: 'smooth', block: 'center'});
}

function speakParagraph(index) {
  const group = data.groups[current];
  const paragraph = group.paragraphs.find(item => item.id === index);
  if (!paragraph || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(paragraph.en);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export async function initListening(element) {
  root = element;
  const response = await fetch('./listening-data.json');
  if (!response.ok) throw new Error('听力资料加载失败');
  data = await response.json();
  render();
  root.addEventListener('click', event => {
    if (event.target.closest('.review-word')) { event.preventDefault(); return; }
    const group = event.target.closest('[data-listen-group]');
    if (group) { current = Number(group.dataset.listenGroup); window.speechSynthesis?.cancel(); render(); root.scrollIntoView({behavior: 'smooth'}); return; }
    const lessonMode = event.target.closest('[data-listen-mode]');
    if (lessonMode) { mode = lessonMode.dataset.listenMode; render(); return; }
    const display = event.target.closest('[data-listen-view]');
    if (display) { view = display.dataset.listenView; root.querySelector('.listen-transcript').dataset.view = view; root.querySelectorAll('[data-listen-view]').forEach(button => { const active = button === display; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }); return; }
    const translate = event.target.closest('[data-listen-translate]');
    if (translate) { const number = Number(translate.dataset.listenTranslate); const panel = root.querySelector(`#listen-translation-${number}`); panel.hidden = !panel.hidden; if (panel.hidden) openTranslations.delete(number); else openTranslations.add(number); translate.setAttribute('aria-expanded', String(!panel.hidden)); return; }
    const answer = event.target.closest('[data-listen-answer]');
    if (answer) { const number = Number(answer.dataset.listenAnswer); const panel = root.querySelector(`#listen-answer-${number}`); panel.hidden = !panel.hidden; if (panel.hidden) openAnswers.delete(number); else openAnswers.add(number); answer.setAttribute('aria-expanded', String(!panel.hidden)); const question = answer.closest('.listen-question'); question.querySelectorAll('.listen-option').forEach(label => label.classList.toggle('correct', label.dataset.option === question.querySelector('.listen-answer-head strong').textContent.slice(-1) && !panel.hidden)); return; }
    const evidence = event.target.closest('[data-listen-evidence]');
    if (evidence) { showEvidence(evidence.dataset.listenEvidence); return; }
    const back = event.target.closest('[data-listen-back]');
    if (back) { const audio = root.querySelector('#listen-audio'); audio.currentTime = Math.max(0, audio.currentTime - Number(back.dataset.listenBack)); return; }
    const speak = event.target.closest('[data-listen-speak]');
    if (speak) speakParagraph(Number(speak.dataset.listenSpeak));
  });
  root.addEventListener('change', event => {
    if (event.target.id === 'listen-rate') root.querySelector('#listen-audio').playbackRate = Number(event.target.value);
    if (event.target.matches('.listen-option input')) selectedOptions.set(Number(event.target.name.slice('listen-q-'.length)), event.target.value);
  });
}
