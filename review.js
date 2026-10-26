let reviewData;
let readingQuestions;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function wordify(value) {
  const text = String(value ?? '');
  const pattern = /[A-Za-z]+(?:[’'-][A-Za-z]+)*/g;
  let html = '';
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    html += esc(text.slice(cursor, match.index));
    html += `<span class="review-word" role="button" tabindex="0" data-surface="${esc(match[0])}">${esc(match[0])}</span>`;
    cursor = match.index + match[0].length;
  }
  return html + esc(text.slice(cursor));
}

export async function initReview(url = new URL('./review-data.json', import.meta.url)) {
  const responses = await Promise.all([fetch(url), fetch(new URL('./reading-questions.json?v=20261026-reading-translation-1', import.meta.url))]);
  if (!responses[0].ok || !responses[1].ok) throw new Error('阅读题目资料加载失败');
  [reviewData, readingQuestions] = await Promise.all(responses.map(response => response.json()));
  return readingQuestions;
}

function flagExplanation(flag) {
  if (/无中生有|未提及/.test(flag)) return '原文没有给出这项新增的信息，不能凭常识补足。';
  if (/相反|反向/.test(flag)) return '这项把原文陈述的方向或结论颠倒了。';
  if (/偷换|张冠李戴/.test(flag)) return '这项换掉了原文所说的对象、条件或关系。';
  if (/推断|绝对|扩大|过度/.test(flag)) return '这项超出了原文的限定范围或确定程度。';
  if (/偏题|答非所问/.test(flag)) return '这项没有准确回答题干限定的问题。';
  return '该项不是答案页标注的正确选项；具体误差请对照原文核查。';
}

function generalExplanation(question, record) {
  const evidence = question.evidence;
  const analysisUrl = record.analysisSource ? `${record.analysisSource}#q-${question.number}` : record.answerSource;
  const analysisLabel = record.analysisSource ? '查看来源中的逐题详解 ↗' : '查看原卷与参考答案 ↗';
  return `<div class="review-result" role="status" data-review-result="${question.number}"></div>
    <p class="review-answer"><strong>参考答案 ${esc(question.answer)}</strong><span>${esc(question.type || '原题核对')}</span></p>
    ${evidence ? `<h4>原文定位</h4><div class="review-evidence"><div><blockquote lang="en">${esc(evidence.text)}</blockquote><p>${esc(evidence.translation || '')}</p>${Number.isInteger(evidence.sentenceIndex) ? `<button type="button" data-jump-sentence="${evidence.sentenceIndex}">定位正文第 ${evidence.paragraph} 段 ↗</button>` : ''}</div></div>` : '<p>这道题的定位句尚未核定，可结合正文和下方来源核对。</p>'}
    <h4>四个选项逐项核对</h4><div class="review-option-analysis">${question.options.map(option => {
      const correct = option.key === question.answer;
      const pairs = option.pairs || [];
      return `<section class="review-analysis-item ${correct ? 'is-correct' : ''}"><h5><span>${esc(option.key)}</span>${correct ? '正确' : '不选'}<small>${esc(option.flag || (correct ? '参考答案' : '未核定错因'))}</small></h5><p>${esc(option.translation)}</p><p>${correct ? (evidence ? '选项的核心意思与原文证据对应。' : '该项与试卷答案页标注的参考答案一致。') : flagExplanation(option.flag || '')}</p>${pairs.length ? `<ul class="review-reasoning">${pairs.map(pair => `<li><span lang="en">${esc(pair.original)}</span> ↔ <span lang="en">${esc(pair.option)}</span></li>`).join('')}</ul>` : ''}</section>`;
    }).join('')}</div><div class="review-boundary"><strong>进一步核对</strong><p>此处给出原题、参考答案、定位信息与选项判断。<a href="${esc(analysisUrl)}" target="_blank" rel="noopener noreferrer">${analysisLabel}</a></p></div>`;
}

function renderGeneralReview(passageId) {
  const record = readingQuestions?.passages?.[passageId];
  if (!record) return '<div class="load-error">本篇题目资料暂缺。</div>';
  return `<p class="review-intro">每篇五道原题。先选答案，再分别展开题目翻译和答案解析；其他词汇也可点击查看。</p>
    <p class="review-source"><a href="${esc(record.questionSource)}" target="_blank" rel="noopener noreferrer">查看原试卷 ↗</a> · <a href="${esc(record.answerSource)}" target="_blank" rel="noopener noreferrer">核对参考答案 ↗</a><span>题目英译中为机器辅助参考译文；定位和选项判断以原文为准。</span></p>
    ${record.questions.map(question => `<article class="review-question" data-review-question="${question.number}" data-review-passage="${esc(passageId)}"><div class="review-question-head"><div class="review-question-meta"><span class="review-question-number">${question.number}</span><span>原题与选项 · ${esc(question.type || '阅读理解')}</span></div><div class="review-actions"><button type="button" data-review-toggle="translation" data-question="${question.number}" aria-expanded="false" aria-controls="review-translation-${question.number}">翻译</button><button type="button" class="review-explain-button" data-review-toggle="explanation" data-question="${question.number}" aria-expanded="false" aria-controls="review-explanation-${question.number}">答案与详细解析</button></div></div>
      <fieldset class="review-choices"><legend lang="en">${wordify(question.stem)}</legend>${question.options.map(option => `<label class="review-choice" data-review-option><input type="radio" name="review-${question.number}" value="${esc(option.key)}" aria-label="第 ${question.number} 题选 ${esc(option.key)}"><span class="review-choice-key">${esc(option.key)}</span><span lang="en">${wordify(option.text)}</span></label>`).join('')}</fieldset>
      <div class="review-translation" id="review-translation-${question.number}" hidden><h4>题干与选项翻译</h4><p>${esc(question.stemZh)}</p><ol type="A">${question.options.map(option => `<li>${esc(option.translation)}</li>`).join('')}</ol></div>
      <div class="review-explanation" id="review-explanation-${question.number}" hidden>${generalExplanation(question, record)}</div></article>`).join('')}`;
}

function explanation(question) {
  return `<div class="review-result" role="status" data-review-result="${question.number}"></div>
    <p class="review-answer"><strong>参考答案 ${esc(question.answer)}</strong><span>${esc(question.skill)}</span></p>
    <h4>题干拆解</h4><p class="review-stem-analysis">${esc(question.stemAnalysis)}</p>
    <h4>解题思路</h4><ol class="review-reasoning">${question.reasoning.map(text => `<li>${esc(text)}</li>`).join('')}</ol>
    <h4>原文证据与定位</h4><div class="review-evidence">${question.evidence.map(item => `<div><blockquote lang="en">${esc(item.text)}</blockquote><p>${esc(item.translation)}</p><button type="button" data-jump-sentence="${item.sentenceIndex}">定位第 ${item.sentenceIndex + 1} 句 ↗</button></div>`).join('')}</div>
    <h4>四个选项逐项分析</h4><div class="review-option-analysis">${question.options.map(option => `<section class="review-analysis-item ${option.key === question.answer ? 'is-correct' : ''}"><h5><span>${esc(option.key)}</span>${option.key === question.answer ? '正确' : '不选'}<small>${esc(option.trap)}</small></h5><p>${esc(option.analysis)}</p></section>`).join('')}</div>
    <div class="review-boundary"><strong>读题提醒</strong><p>${esc(question.boundary)}</p></div>`;
}

export function renderReview(passageId) {
  if (!reviewData || reviewData.passageId !== passageId) return renderGeneralReview(passageId);
  const origin = reviewData.originalAvailable ? '原题与选项' : '复习改写题与选项';
  return `<p class="review-intro">先选一个答案，再按需查看翻译或详细解析。翻译与解析分别展开。</p>
    <p class="review-source"><a href="${esc(reviewData.questionSource)}" target="_blank" rel="noopener noreferrer">查看原试卷 ↗</a> · <a href="${esc(reviewData.answerSource)}" target="_blank" rel="noopener noreferrer">核对参考答案 ↗</a><span>${esc(reviewData.note)}</span></p>
    ${reviewData.questions.map(question => `<article class="review-question" data-review-question="${question.number}">
      <div class="review-question-head"><div class="review-question-meta"><span class="review-question-number">${question.number}</span><span>${origin} · ${esc(question.skill)}</span></div><div class="review-actions"><button type="button" data-review-toggle="translation" data-question="${question.number}" aria-expanded="false" aria-controls="review-translation-${question.number}">翻译</button><button type="button" class="review-explain-button" data-review-toggle="explanation" data-question="${question.number}" aria-expanded="false" aria-controls="review-explanation-${question.number}">答案与详细解析</button></div></div>
      <fieldset class="review-choices"><legend lang="en">${wordify(question.stem)}</legend>${question.options.map(option => `<label class="review-choice" data-review-option><input type="radio" name="review-${question.number}" value="${esc(option.key)}" aria-label="第 ${question.number} 题选 ${esc(option.key)}"><span class="review-choice-key">${esc(option.key)}</span><span lang="en">${wordify(option.text)}</span></label>`).join('')}</fieldset>
      <div class="review-translation" id="review-translation-${question.number}" hidden><h4>题干与选项翻译</h4><p>${esc(question.translation)}</p><ol type="A">${question.options.map(option => `<li>${esc(option.translation)}</li>`).join('')}</ol></div>
      <div class="review-explanation" id="review-explanation-${question.number}" hidden>${explanation(question)}</div>
    </article>`).join('')}`;
}

function updateResult(card, question) {
  const selected = card.querySelector('input:checked')?.value;
  const result = card.querySelector('[data-review-result]');
  if (!result) return;
  result.textContent = selected ? `你的选择：${selected}。${selected === question.answer ? '作答正确。' : `本题应选 ${question.answer}，可对照下方逐项解析订正。`}` : '尚未作答，可先选择一个选项，再对照解析。';
  result.classList.toggle('is-correct', selected === question.answer);
}

export function handleReviewClick(event) {
  const target = event.target.closest('[data-review-toggle]');
  if (!target) return false;
  const region = document.getElementById(target.getAttribute('aria-controls'));
  if (!region) return false;
  region.hidden = !region.hidden;
  target.setAttribute('aria-expanded', String(!region.hidden));
  const labels = target.dataset.reviewToggle === 'translation'
    ? ['翻译', '收起翻译']
    : ['答案与详细解析', '收起答案与解析'];
  target.textContent = labels[region.hidden ? 0 : 1];
  if (target.dataset.reviewToggle === 'explanation' && !region.hidden) {
    const card = target.closest('[data-review-question]');
    const question = questionForCard(card);
    updateResult(target.closest('[data-review-question]'), question);
  }
  return true;
}

export function handleReviewChange(event) {
  const card = event.target.closest('[data-review-question]');
  if (!card || event.target.type !== 'radio') return;
  const question = questionForCard(card);
  if (question) updateResult(card, question);
}

function questionForCard(card) {
  const questions = card.dataset.reviewPassage ? readingQuestions?.passages?.[card.dataset.reviewPassage]?.questions : reviewData?.questions;
  return questions?.find(item => item.number === Number(card.dataset.reviewQuestion));
}
