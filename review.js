let reviewData;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export async function initReview(url = new URL('./review-data.json', import.meta.url)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Review data: HTTP ${response.status}`);
  reviewData = await response.json();
  return reviewData;
}

function explanation(question) {
  return `<div class="review-result" role="status" data-review-result="${question.number}"></div>
    <p class="review-answer"><strong>参考答案 ${esc(question.answer)}</strong><span>${esc(question.skill)}</span></p>
    <h4>解题思路</h4><ol class="review-reasoning">${question.reasoning.map(text => `<li>${esc(text)}</li>`).join('')}</ol>
    <h4>原文证据与定位</h4><div class="review-evidence">${question.evidence.map(item => `<div><blockquote lang="en">${esc(item.text)}</blockquote><p>${esc(item.translation)}</p><button type="button" data-jump-sentence="${item.sentenceIndex}">定位第 ${item.sentenceIndex + 1} 句 ↗</button></div>`).join('')}</div>
    <h4>四个选项逐项分析</h4><div class="review-option-analysis">${question.options.map(option => `<section class="review-analysis-item ${option.key === question.answer ? 'is-correct' : ''}"><h5><span>${esc(option.key)}</span>${option.key === question.answer ? '正确' : '不选'}<small>${esc(option.trap)}</small></h5><p>${esc(option.analysis)}</p></section>`).join('')}</div>
    <div class="review-boundary"><strong>读题提醒</strong><p>${esc(question.boundary)}</p></div>`;
}

export function renderReview(passageId) {
  if (!reviewData || reviewData.passageId !== passageId) return '';
  const origin = reviewData.originalAvailable ? '原题与选项' : '复习改写题与选项';
  return `<p class="review-intro">先选一个答案，再按需查看翻译或详细解析。翻译与解析分别展开。</p>
    <p class="review-source"><a href="${esc(reviewData.questionSource)}" target="_blank" rel="noopener noreferrer">查看原试卷 ↗</a> · <a href="${esc(reviewData.answerSource)}" target="_blank" rel="noopener noreferrer">核对参考答案 ↗</a><span>${esc(reviewData.note)}</span></p>
    ${reviewData.questions.map(question => `<article class="review-question" data-review-question="${question.number}">
      <div class="review-question-meta"><span class="review-question-number">${question.number}</span><span>${origin} · ${esc(question.skill)}</span></div>
      <fieldset class="review-choices"><legend lang="en">${esc(question.stem)}</legend>${question.options.map(option => `<label class="review-choice"><input type="radio" name="review-${question.number}" value="${esc(option.key)}" aria-label="第 ${question.number} 题选 ${esc(option.key)}"><span class="review-choice-key">${esc(option.key)}</span><span lang="en">${esc(option.text)}</span></label>`).join('')}</fieldset>
      <div class="review-actions"><button type="button" data-review-toggle="translation" data-question="${question.number}" aria-expanded="false" aria-controls="review-translation-${question.number}">查看翻译</button><button type="button" class="review-explain-button" data-review-toggle="explanation" data-question="${question.number}" aria-expanded="false" aria-controls="review-explanation-${question.number}">查看解析</button></div>
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
  const label = target.dataset.reviewToggle === 'translation' ? '翻译' : '解析';
  target.textContent = `${region.hidden ? '查看' : '收起'}${label}`;
  if (target.dataset.reviewToggle === 'explanation' && !region.hidden) {
    const question = reviewData.questions.find(item => item.number === Number(target.dataset.question));
    updateResult(target.closest('[data-review-question]'), question);
  }
  return true;
}

export function handleReviewChange(event) {
  const card = event.target.closest('[data-review-question]');
  if (!card || event.target.type !== 'radio') return;
  const question = reviewData?.questions.find(item => item.number === Number(card.dataset.reviewQuestion));
  if (question) updateResult(card, question);
}
