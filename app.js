import {initReview, renderReview, handleReviewClick, handleReviewChange} from './review.js';
import {loadGrammarData, renderInteractiveGrammar, handleGrammarClick, grammarMethod} from './grammar.js';
import {initListening} from './listening.js';

const TARGET = 'cet6_2024_06_2_p1';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const posChinese = {NOUN:'名词',VERB:'动词',ADJ:'形容词',ADV:'副词',PROPN:'专有名词',PRON:'代词',ADP:'介词',DET:'限定词',AUX:'助动词',CCONJ:'并列连词',SCONJ:'从属连词',NUM:'数词',PART:'小品词',INTJ:'感叹词'};
const grammarStudyNotes = {
  1: {reading:'先分成两个并列主句：young Americans are struggling ...；upward mobility ... compares unfavourably ...。than their parents did 中的 did 代替前面的 earn，避免重复。第二分句里的 that 代替 upward mobility，比较的是两地的向上流动性。',translation:'然而，如今的美国年轻人很难在同龄时挣得比父母更多；美国的向上流动性实际上也逊于其他工业化国家。',exam:'第 46 题：比较对象是“父母同龄时的收入”和“其他工业化国家的流动性”，不能读成年轻人已经超越父辈。'},
  6: {reading:'while 引出让步对照：真人秀经常位列收视最高的节目；主句是 news broadcasts get a much smaller proportion of the viewership。两道破折号之间的 which ... Americans 是非限制性定语从句，补充说明 news broadcasts；其中 faced by millions of Americans 又后置修饰 economic hardship。',translation:'虽然这些节目经常跻身收视最高的节目之列，但新闻节目获得的观众份额要小得多；新闻节目呈现了数百万美国人面临的经济困境，更贴近现实。',exam:'第 48 题：比较的核心是收视份额；破折号内的新闻内容是补充信息，不是主句的比较结论。',parts:[{kind:'让步状语从句',text:'while these programmes are regularly among the most-watched shows',subject:'these programmes',predicate:'are',complements:['among the most-watched shows'],note:'while 在这里表示“虽然”；为主句设置对照背景。'},{kind:'主句',text:'news broadcasts ... get a much smaller proportion of the viewership',subject:'news broadcasts',predicate:'get',objects:['a much smaller proportion of the viewership'],note:'主句表达真正需要比较的收视份额。'},{kind:'非限制性定语从句',text:'which paint a more realistic view of the economic hardship faced by millions of Americans',subject:'which（指 news broadcasts）',predicate:'paint',objects:['a more realistic view of the economic hardship faced by millions of Americans'],note:'破折号框住的补充说明；which 指 news broadcasts。'},{kind:'过去分词后置定语',text:'faced by millions of Americans',subject:'economic hardship（被修饰词）',predicate:'faced',note:'相当于 that is faced by millions of Americans。'}]},
  11: {reading:'主句 The results showed 后接 that 引导的内容从句，交代实验结果。内容从句的主语是 those who’d watched a rags-to-riches clip；其中 who’d watched ... 是限定性定语从句，限定那些参与者。did indeed have 的 did 是强调助动词，不是另一个动作。',translation:'结果表明，看过“白手起家”片段的参与者确实更相信美国梦，而且这种信念显著更强。',exam:'第 47 题：把 have a significantly greater belief 对应到“信念增强”，同时保留实验组这个限定。'},
  12: {reading:'先读主句 this effect was significant among Republicans but not Democrats。“but not Democrats”省略了 was significant among，表示这一效应在民主党参与者中不显著。句首 when ... 是分组条件；句末 suggesting ... 是现在分词结果状语，内含 that 内容从句。may 表示可能，不能写成确定的因果结论。',translation:'有意思的是，按党派归属分组后，这种效应在共和党参与者中显著，在民主党参与者中却不显著；这提示节目中的隐含信息可能契合人们已有的社会经济观念。',exam:'第 49 题：注意显著性只限共和党组；party affiliation 是党派归属，may 保留推测语气。'},
  18: {reading:'冒号前 And here’s the problem 是提示语。冒号后的骨架是 if people mistakenly believe ...，they may be less supportive of policies ...。if 从句中，believe 后的 that 引出相信的内容；all 后的 that is needed 是定语从句；for individuals to make ... 是不定式结构。主句的 policies 后还有 that could actually combat inequality，限定所指政策。',translation:'问题在于：如果人们错误地认为，只要努力就足以让个人过上更好的生活，他们可能就不那么支持真正能够对抗不平等的政策。',exam:'第 50 题：政策态度的方向是 less supportive；may 是可能性，不能改写为必然反对。',parts:[{kind:'提示语',text:'And here’s the problem',subject:'the problem',predicate:'is（here’s）',note:'冒号提示后面给出真正的问题。'},{kind:'条件状语从句',text:'if people mistakenly believe that hard work is all that is needed for individuals to make a better life for themselves',subject:'people',predicate:'believe',objects:['that hard work is all that is needed ...'],note:'if 表示假设；mistakenly 修饰 believe。'},{kind:'内容从句',text:'that hard work is all that is needed for individuals to make a better life for themselves',subject:'hard work',predicate:'is',complements:['all that is needed ...'],note:'整块充当 believe 的宾语。'},{kind:'定语从句',text:'that is needed for individuals to make a better life for themselves',subject:'that（指 all）',predicate:'is needed',note:'说明“所需的一切”究竟指什么。'},{kind:'不定式结构',text:'for individuals to make a better life for themselves',subject:'individuals（逻辑主语）',predicate:'to make',objects:['a better life for themselves'],note:'for + 人 + to do；说明“所需”的目标。'},{kind:'主句',text:'they may be less supportive of policies that could actually combat inequality',subject:'they',predicate:'may be',complements:['less supportive of policies ...'],note:'may 表示可能；less supportive 是支持度下降。'},{kind:'定语从句',text:'that could actually combat inequality',subject:'that（指 policies）',predicate:'could combat',objects:['inequality'],note:'限定 policies：真正能够对抗不平等的政策。'}]}
};
const curatedWords = [
  {key:'prosper', pos:'v.', meaning:'繁荣；兴旺；事业成功', context:'P1 中指个人凭努力实现经济上的成功。', collocation:'prosper through hard work；a prospering business', confusion:'prosper 是动词；prosperity 是名词“繁荣”。', exam:'识别“努力 → 富足”的美国梦叙事，并注意它是被检验的观念。', example:'A community can prosper when more people share its opportunities.', ps:['P1']},
  {key:'ambition', pos:'n.', meaning:'抱负；雄心', context:'P1 描述美国梦的承诺；P6 中它是受访者评估的“内部因素”。', collocation:'have ambition；ambition to succeed', confusion:'ambition 指追求成就的动力，不等于已取得成就。', exam:'46 题干扰项借“ambition”制造两代人比较，原文并无此比较。', example:'Her ambition led her to apply for the research programme.', ps:['P1','P6']},
  {key:'mobility', pos:'n.', meaning:'流动性；此处指社会或经济阶层向上流动', context:'P1 用 upward mobility 概括阶层上升是否容易。', collocation:'upward mobility；social mobility', confusion:'mobility 不是日常“移动”的单纯动作，这里讨论改变经济处境的机会。', exam:'46 题正确项用 upward mobility 概括收入与社会阶层信息。', example:'Education may improve social mobility, but access matters.', ps:['P1','P8']},
  {key:'persist', pos:'v.', meaning:'持续存在；坚持', context:'P2 问现实与美国梦之间有落差，为何这种观念仍持续。', collocation:'the belief persists；persist in doing something', confusion:'persist 可指事物持续，也可指人坚持做某事；主语决定语义。', exam:'用于识别文章核心问题：观念为何依然存在。', example:'The belief persisted despite new evidence.', ps:['P2']},
  {key:'dominate', pos:'v.', meaning:'主导；占据优势', context:'P3 指真人秀在美国电视节目中占据显著位置。', collocation:'dominate television；dominate the market', confusion:'dominate 强调占优势，不必然表示完全排除其他事物。', exam:'帮助理解真人秀为何可能有广泛影响。', example:'One format can dominate a market without being the only option.', ps:['P3']},
  {key:'overwhelming', pos:'adj.', meaning:'压倒性的；绝大多数的', context:'P3 修饰真人秀节目所占的多数。', collocation:'an overwhelming majority；overwhelming evidence', confusion:'overwhelming majority 指“绝大多数”，不能误译成“所有”。', exam:'数量限定词决定概括的边界。', example:'An overwhelming majority of respondents preferred the shorter survey.', ps:['P3']},
  {key:'hardship', pos:'n.', meaning:'困苦；艰难处境', context:'P3 指许多美国人面临的经济困难。', collocation:'economic hardship；face hardship', confusion:'hardship 是困境或艰难经历，不等同于情绪上的“难过”。', exam:'48 题 D 借用该词，但把新闻报道内容扩大成报道焦点。', example:'The family faced financial hardship after the factory closed.', ps:['P3']},
  {key:'proportion', pos:'n.', meaning:'比例；份额', context:'P3 比较真人秀与新闻节目各自获得的观众份额。', collocation:'a small proportion of；the proportion of viewers', confusion:'proportion 是份额，不是直接的绝对人数；比较时要看基准。', exam:'48 题定位词；smaller proportion 对应 fewer viewers。', example:'A small proportion of readers opened the full report.', ps:['P3']},
  {key:'ubiquitous', pos:'adj.', meaning:'无处不在的；普遍存在的', context:'P4 指“白手起家”故事在电视节目中随处可见。', collocation:'ubiquitous on television；a ubiquitous feature', confusion:'强调广泛可见，不代表每个节目都具有该特点。', exam:'文章从常见现象转入“是否真的影响信念”的研究问题。', example:'Smartphones have become ubiquitous in daily life.', ps:['P4']},
  {key:'attainable', pos:'adj.', meaning:'可达到的；可实现的', context:'P4 研究人们是否认为经济向上流动容易实现。', collocation:'an attainable goal；easily attainable', confusion:'attainable 表示“能达到”，与 achieved“已经达到”区分。', exam:'46 题也考“尚未实现”与“已经实现”的状态差异。', example:'The target is challenging but attainable.', ps:['P4']},
  {key:'participant', pos:'n.', meaning:'参与者；受试者', context:'P4–P7 指参与实验或回答问卷的人。', collocation:'study participants；control participants', confusion:'实验参与者与调查参与者来自不同研究环节，不能混为一组。', exam:'识别实验组、对照组和问卷样本。', example:'Each participant watched one video before answering.', ps:['P4','P5','P6','P7']},
  {key:'significantly', pos:'adv.', meaning:'显著地；明显地', context:'P5 的实验效应达到统计上的显著性；分党派分析还有限定。', collocation:'significantly greater；statistically significant', confusion:'统计显著不自动等于效应很大，也不等于能推广到所有人。', exam:'47、49 题都要注意显著效应属于哪组人。', example:'The second group scored significantly higher in the trial.', ps:['P5']},
  {key:'affiliation', pos:'n.', meaning:'隶属关系；归属', context:'P5 的 party affiliation 指参与者所属党派，用于分组。', collocation:'party affiliation；institutional affiliation', confusion:'按党派归属分组，不表示对党派“忠诚程度”高。', exam:'49 题 C 选项偷换为党派忠诚度。', example:'The survey recorded each respondent’s party affiliation.', ps:['P5']},
  {key:'implicit', pos:'adj.', meaning:'含蓄的；隐含的', context:'P5 指电视节目传递的、未明说的价值信息。', collocation:'implicit message；implicit assumption', confusion:'implicit 是“隐含的”；explicit 是“明确说出的”。', exam:'49 题推断基于隐含信息与既有观念的契合，要保留推断语气。', example:'The advertisement carried an implicit promise of success.', ps:['P5']},
  {key:'perpetuate', pos:'v.', meaning:'使持续；使长期存在', context:'P8 指娱乐媒体让向上流动的信念继续流传。', collocation:'perpetuate a belief；perpetuate a myth', confusion:'与 persist 区分：persist 自身持续；perpetuate 使某事持续。', exam:'辨认媒体作用与观念延续之间的因果表述。', example:'Repeated stories can perpetuate an outdated belief.', ps:['P8']},
  {key:'inequality', pos:'n.', meaning:'不平等；差距', context:'P8 指政策希望应对的社会经济不平等。', collocation:'combat inequality；income inequality', confusion:'inequality 是社会或经济差距，不是普通的数学“不相等”。', exam:'50 题定位到对抗不平等的政策及其支持度。', example:'The programme aims to reduce inequality in access to education.', ps:['P8']},
  {key:'consequence', pos:'n.', meaning:'后果；影响', context:'P9 强调娱乐媒体可能产生政治后果。', collocation:'political consequences；have consequences for', confusion:'consequence 常指结果，不一定本身带负面评价，要看语境。', exam:'50 题 B 借用结尾措辞，但未回答政策态度。', example:'A small design change may have unexpected consequences.', ps:['P9']},
  {key:'trivial', pos:'adj.', meaning:'微不足道的；不重要的', context:'P9 的 anything but trivial 表示“绝非小事”。', collocation:'a trivial matter；anything but trivial', confusion:'anything but + 形容词意为“绝不……”，不是“有点……”。', exam:'理解结尾的强调，但不要拿它替代 50 题所问的政策态度。', example:'The cost may look trivial, yet it affects many families.', ps:['P9']}
];


const curatedWordMap = Object.fromEntries(curatedWords.map(item => [item.key, item]));
const wordFamilies = {
  prosper:[['prosperity','n. 繁荣；兴旺'],['prosperous','adj. 繁荣的；成功的'],['prosperously','adv. 繁荣地']],
  ambition:[['ambitious','adj. 有抱负的；目标远大的'],['ambitiously','adv. 雄心勃勃地']],
  mobility:[['mobile','adj. 可移动的；流动的'],['mobilise','v. 动员；调动'],['mobilisation','n. 动员；调动']],
  persist:[['persistence','n. 坚持；持续存在'],['persistent','adj. 持续的；坚持不懈的'],['persistently','adv. 持续地']],
  dominate:[['dominant','adj. 占主导地位的'],['dominance','n. 支配；优势'],['domination','n. 控制；主导']],
  overwhelming:[['overwhelm','v. 压倒；使应接不暇'],['overwhelmingly','adv. 压倒性地；绝大多数地']],
  hardship:[['hard','adj./adv. 艰难的；努力地'],['hardships','n. 困苦（复数）']],
  proportion:[['proportional','adj. 成比例的'],['proportionally','adv. 按比例地'],['disproportionate','adj. 不成比例的']],
  ubiquitous:[['ubiquity','n. 无处不在；普遍存在']],
  attainable:[['attain','v. 达到；获得'],['attainment','n. 达到；成就'],['unattainable','adj. 无法达到的']],
  participant:[['participate','v. 参加'],['participation','n. 参与'],['participatory','adj. 参与式的']],
  significantly:[['significant','adj. 显著的；重要的'],['significance','n. 显著性；重要性'],['signify','v. 表明；意味着']],
  affiliation:[['affiliate','v./n. 使隶属；附属机构'],['affiliated','adj. 附属的；有关联的']],
  implicit:[['implicitly','adv. 含蓄地；不明说地'],['imply','v. 暗示'],['implication','n. 含义；可能后果']],
  perpetuate:[['perpetuation','n. 延续'],['perpetual','adj. 持续不断的'],['perpetually','adv. 持续地']],
  inequality:[['unequal','adj. 不平等的'],['equality','n. 平等'],['equalise','v. 使相等']],
  consequence:[['consequent','adj. 随之发生的'],['consequently','adv. 因此'],['consequential','adj. 后果重大的']],
  trivial:[['trivially','adv. 琐碎地；不重要地'],['triviality','n. 琐事；微不足道']]
};

let archive;
let fullFrequency;
let currentIndex = -1;
let currentWord = null;
let currentSentence = null;
let panel = 'word';
let popoverTimer;
let wordHoverTimer;
let selectionTimer;
let activeWordNode = null;
let formLemmaMap = new Map();
let listeningReady;

function passageLabel(p){return `${p.year}.${String(p.month).padStart(2,'0')} · 第${p.set}套 · Passage ${p.number===1?'One':'Two'}`}
function editionLabel(p){return `${p.year}.${String(p.month).padStart(2,'0')} · 第${p.set}套`}
function article(){return archive?.passages[currentIndex]}
function yearOfExam(id){return Number(id.split('_')[1])}

function renderLibrary(){
  const years=[...new Set(archive.passages.map(p=>p.year))].sort((a,b)=>b-a);
  $('#exam-nav').innerHTML=years.map(year=>{
    const exams=[...new Set(archive.passages.filter(p=>p.year===year).map(p=>p.exam))].reverse();
    return `<details class="year-group" ${year===article()?.year?'open':''}><summary><span>${year}</span><small>${exams.length} 套</small><i aria-hidden="true">⌄</i></summary><div class="year-exams">${exams.map(exam=>{
      const sample=archive.passages.find(p=>p.exam===exam);
      return `<div class="exam-group"><div class="exam-name">${String(sample.month).padStart(2,'0')} 月 · 第 ${sample.set} 套</div><div class="passage-buttons">${archive.passages.filter(p=>p.exam===exam).map(p=>`<button class="passage-nav ${p.id===article()?.id?'active':''}" data-passage="${p.id}">Passage ${p.number===1?'One':'Two'} <span>↗</span></button>`).join('')}</div></div>`
    }).join('')}</div></details>`;
  }).join('');
}

function grouping(p){
  const starts=p.paragraphStarts||[0,p.sentences.length];
  return starts.slice(0,-1).map((start,i)=>[start,starts[i+1]]);
}

function renderSentence(sentence, index){
  const tokens=sentence.tokens.map(token=>{
    const text=escapeHTML(token.t);
    const space=escapeHTML(token.s);
    return token.l?`<span class="word" role="button" tabindex="0" data-lemma="${escapeHTML(token.l)}" data-surface="${text}" data-pos="${escapeHTML(token.p)}">${text}</span>${space}`:`${text}${space}`;
  }).join('');
  return `<span class="sentence" id="sentence-${index}" data-sentence="${index}">${tokens}</span>`;
}

function renderPassage(){
  const p=article(); if(!p)return;
  $('#breadcrumb-current').textContent=passageLabel(p);
  $('#reader-edition').textContent=editionLabel(p);
  $('#reader-title').textContent=`Passage ${p.number===1?'One':'Two'}`;
  $('#reader-subtitle').textContent=p.id===TARGET?'真人秀如何影响人们对“美国梦”的信念':`开篇：${p.title}`;
  $('#word-count').textContent=p.wordCount;
  $('#sentence-count').textContent=p.sentences.length;
  $('#paragraph-count').textContent=grouping(p).length;
  $('#source-link').href=p.url;
  $('#paragraph-source-link').href=p.paragraphSource||p.url;
  const translationLabel=p.id===TARGET?'校订参考译文':'机器参考译文';
  $('#passage-body').innerHTML=grouping(p).map(([from,to],i)=>`<section class="reading-block"><div class="block-number">${String(i+1).padStart(2,'0')}</div><div class="reading-content"><p>${p.sentences.slice(from,to).map((s,j)=>renderSentence(s,from+j)).join('')}</p><button class="translation-toggle" type="button" data-translation="${i}" aria-expanded="false" aria-controls="translation-${i}">查看译文 <span aria-hidden="true">⌄</span></button><div class="paragraph-translation" id="translation-${i}" hidden><span>第 ${i+1} 段 · ${translationLabel}</span><p>${escapeHTML(p.paragraphTranslations?.[i]||'译文暂缺')}</p></div></div></section>`).join('');
  $('#previous-passage').disabled=currentIndex===0;
  $('#next-passage').disabled=currentIndex===archive.passages.length-1;
  $('#review-section').hidden=p.id!==TARGET;
  if(p.id===TARGET)renderTargetReview();
  clearTimeout(wordHoverTimer);activeWordNode=null;currentSentence=null;currentWord=null;panel='word';updateInspectorTabs();renderInspector();
  renderLibrary();
  closeLibrary();
}

function choosePassage(id){const index=archive.passages.findIndex(p=>p.id===id);if(index<0)return;currentIndex=index;renderPassage();setStudyMode('reading');window.scrollTo({top:0,behavior:'smooth'})}

async function setStudyMode(mode){
  const listening=mode==='listening';
  document.body.classList.toggle('listening-mode',listening);
  $('#listening-content').hidden=!listening;
  document.querySelectorAll('[data-study-mode]').forEach(button=>button.classList.toggle('active',button.dataset.studyMode===mode));
  $('#breadcrumb-current').textContent=listening?'2024.06 · 第二套 · 听力':article()?passageLabel(article()):'加载中';
  if(listening){
    history.replaceState(null,'','#listening');
    if(!listeningReady)listeningReady=initListening($('#listening-content')).catch(error=>{$('#listening-content').innerHTML=`<div class="load-error">${escapeHTML(error.message)}。请刷新页面重试。</div>`;listeningReady=null});
    await listeningReady;
  }else if(location.hash==='#listening')history.replaceState(null,'',location.pathname+location.search);
  closeLibrary();
}

function renderTargetReview(){
  $('#review-list').innerHTML=renderReview(TARGET);
}

function buildFormLemmaMap(){
  const map=new Map();
  const add=(form,lemma)=>{const key=String(form||'').toLowerCase().replaceAll('’',"'");if(key&&!map.has(key))map.set(key,lemma)};
  for(const [lemma,entry] of Object.entries(archive.dictionary)){add(lemma,lemma);for(const form of entry.forms||[])add(form.value,lemma)}
  for(const [lemma,item] of Object.entries(fullFrequency.frequency)){add(lemma,lemma);for(const form of item.forms||[])add(form.form,lemma)}
  formLemmaMap=map;
}

function lemmaForSurface(surface){
  const value=String(surface||'').toLowerCase().replaceAll('’',"'");
  const bare=value.replace(/'s$/,'');
  const candidates=[value,bare,bare.replace(/ies$/,'y'),bare.replace(/es$/,''),bare.replace(/s$/,''),bare.replace(/ing$/,''),bare.replace(/ing$/,'e'),bare.replace(/ed$/,''),bare.replace(/ed$/,'e')];
  return candidates.map(item=>formLemmaMap.get(item)).find(Boolean)||bare;
}

function wordData(key,surface,pos,sentenceIndex,context=''){
  const entry=archive.dictionary[key]||archive.dictionary[surface.toLowerCase()];
  const freq=fullFrequency?.frequency?.[key]||archive.frequency[key]||{papers:0,occurrences:0,hits:[],forms:[]};
  return {key,surface,pos,sentenceIndex,entry,freq,context};
}

function phraseAssociations(key){
  const phrases=[];
  for(const sentence of article().sentences){
    sentence.tokens.forEach((token,index)=>{
      if(token.l!==key)return;
      const from=Math.max(0,index-2),to=Math.min(sentence.tokens.length,index+3);
      const phrase=sentence.tokens.slice(from,to).map(item=>item.t+item.s).join('').trim().replace(/^[,;:.!?\s]+|[,;:.!?\s]+$/g,'');
      if(phrase&&phrase.split(/\s+/).length>=2&&!phrases.includes(phrase))phrases.push(phrase);
    });
  }
  return phrases.slice(0,4);
}

function familyCards(key){
  const family=wordFamilies[key]||[];
  if(!family.length)return '';
  return `<div class="word-family"><h3>词汇联想</h3><p>从同一词根扩展词性和含义，注意它们不是本句中的同一个词形。</p><div>${family.map(([word,meaning])=>`<span><strong>${escapeHTML(word)}</strong><small>${escapeHTML(meaning)}</small></span>`).join('')}</div></div>`;
}

function speakerButton(word){
  const label=`朗读 ${word}`;
  return `<button class="speak-button" type="button" data-speak="${escapeHTML(word)}" aria-label="${escapeHTML(label)}" title="${escapeHTML(label)}" ${'speechSynthesis' in window?'':'disabled'}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg></button>`;
}

function speakWord(word){
  if(!('speechSynthesis' in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(word);
  utterance.lang='en-US';
  utterance.rate=0.85;
  const voices=window.speechSynthesis.getVoices();
  utterance.voice=voices.find(voice=>voice.lang?.toLowerCase()==='en-us')||voices.find(voice=>voice.lang?.toLowerCase().startsWith('en'))||null;
  window.speechSynthesis.speak(utterance);
}

function relevantMeaning(line,pos){
  const prefix=line.match(/^([a-z]+)\./i)?.[1]?.toLowerCase();
  const related={NOUN:['n'],VERB:['v','vt','vi'],AUX:['v','vt','vi','aux'],ADJ:['a','adj'],ADV:['ad','adv'],ADP:['prep'],PRON:['pron'],DET:['art'],NUM:['num']};
  return Boolean(prefix&&related[pos]?.includes(prefix));
}

function meaningItems(entry,pos){
  if(!entry)return '<p class="missing-meaning">词典暂未收录这个形式；仍可查看词形与真题频次。</p>';
  const ordered=[...entry.meanings].sort((a,b)=>Number(relevantMeaning(b,pos))-Number(relevantMeaning(a,pos)));
  return ordered.map(line=>{
    const match=line.match(/^((?:n|v|vt|vi|adj|a|adv|ad|prep|conj|pron|num|art|int|aux)\.)\s*(.+)$/i);
    return `<div class="meaning-row ${relevantMeaning(line,pos)?'meaning-relevant':''}"><span>${escapeHTML(match?.[1]||'释义')}</span><p>${escapeHTML(match?.[2]||line)}</p></div>`;
  }).join('');
}

function yearBars(freq){
  const years=[2022,2023,2024,2025,2026];
  const counts=years.map(year=>freq.hits.filter(id=>yearOfExam(id)===year).length);
  const max=Math.max(1,...counts);
  return `<div class="year-bars">${years.map((year,i)=>`<div class="year-bar"><div class="bar-track"><i style="height:${counts[i]?Math.max(4,counts[i]/max*100):0}%"></i></div><b>${counts[i]}</b><span>${year}</span></div>`).join('')}</div>`;
}

function sourceHits(freq){
  return `<details class="source-hits"><summary>查看 ${freq.hits.length} 套原题来源 <span>⌄</span></summary><div>${freq.hits.map(id=>{const p=archive.passages.find(item=>item.exam===id);return `<a href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(editionLabel(p))} ↗</a>`}).join('')||'<span>样本中未出现</span>'}</div></details>`;
}

function fullWordCard(){
  if(!currentWord)return `<div class="empty-panel"><div class="empty-illustration">Aa</div><span class="panel-kicker">WORD INSPECTOR</span><h2>把鼠标移到单词上</h2><p>这里会显示本句词性、不同义项、词形变化、词汇联想、文中搭配，以及 2022–2026 年整套真题词频。</p><div class="empty-example">试试正文中的 <b>mobility</b>、<b>belief</b> 或任意其他词。</div></div>`;
  const {key,surface,pos,sentenceIndex,entry,freq,context}=currentWord;
  const sentence=context||article().sentences[sentenceIndex]?.text||'';
  const note=article().id===TARGET?curatedWordMap[key]:null;
  const definitions=entry?.definitions||[];
  const forms=entry?.forms||[];
  const domainMeanings=entry?.domainMeanings||[];
  const phrases=phraseAssociations(key);
  return `<div class="word-panel"><span class="panel-kicker">WORD INSPECTOR</span><h2>${escapeHTML(surface)}</h2>${surface.toLowerCase()!==key?`<div class="lemma-line">词元：<strong>${escapeHTML(key)}</strong></div>`:''}<div class="pronunciation-row"><span class="phonetic">${entry?.phonetic?`/${escapeHTML(entry.phonetic)}/`:'音标暂缺'}</span>${speakerButton(surface)}</div><div class="context-pos">${context?'题目／选项词汇':'本句词性'} <strong>${escapeHTML(context?'点击或停留后固定显示':posChinese[pos]||pos||'待辨认')}</strong></div><div class="context-example"><b>${context?'题目语境':'文中原句'}</b><p>${escapeHTML(sentence)}</p></div>${note?`<div class="study-notes"><h3>本篇怎么理解</h3><p>${escapeHTML(note.context)}</p><dl><dt>重要搭配</dt><dd>${escapeHTML(note.collocation)}</dd><dt>易混辨析</dt><dd>${escapeHTML(note.confusion)}</dd><dt>本题考点</dt><dd>${escapeHTML(note.exam)}</dd></dl><div class="note-example"><b>例句</b> ${escapeHTML(note.example)}</div></div>`:''}<div class="panel-rule"></div><h3>中文释义${pos?' · 按本句词性优先':''}</h3><div class="meanings">${meaningItems(entry,pos)}</div>${familyCards(key)}${forms.length?`<div class="word-forms"><h3>语法词形变化</h3><p>这些形式保留同一词元，括号内说明变化后的语法用途。</p><div>${forms.map(form=>`<span><small>${escapeHTML(form.label)}</small>${escapeHTML(form.value)}</span>`).join('')}</div></div>`:''}${phrases.length?`<div class="word-phrases"><h3>文中搭配与词组</h3>${phrases.map(phrase=>`<span>${escapeHTML(phrase)}</span>`).join('')}</div>`:''}${definitions.length?`<details class="extra-detail"><summary>英文释义 · ${definitions.length} 条</summary><div class="english-senses">${definitions.map(line=>`<p>${escapeHTML(line)}</p>`).join('')}</div></details>`:''}${domainMeanings.length?`<details class="extra-detail"><summary>领域释义 · ${domainMeanings.length} 条</summary><div class="english-senses">${domainMeanings.map(line=>`<p>${escapeHTML(line)}</p>`).join('')}</div></details>`:''}<div class="frequency-card"><div class="frequency-heading"><span>整套真题词频</span><strong>${freq.papers}<small> / ${fullFrequency?.examCount||archive.examCount} 套</small></strong></div><p>2022–2026 年六级整卷可见英语；合并同一词元的词形，共检出 ${freq.occurrences} 次。听力含题干与选项，不含录音原文。</p>${yearBars(freq)}${sourceHits(freq)}</div><p class="dictionary-credit">中英释义与词形来自 <a href="https://github.com/skywind3000/ECDICT" target="_blank" rel="noopener noreferrer">ECDICT ↗</a>；英汉条目独立列出，并非逐条对译。朗读由浏览器语音功能生成。自动识别的词性请结合原句判断。</p></div>`;
}

function grammarCard(){
  if(!currentSentence)return `<div class="empty-panel"><div class="empty-illustration grammar-icon">S · V · O</div><span class="panel-kicker">SENTENCE LAB</span><h2>点击一句话</h2><p>选中正文中的一句，再点击不同颜色的语法片段，逐层查看结构、作用、规则、还原和例句。</p></div>`;
  const study=article().id===TARGET?grammarStudyNotes[currentSentence.index]:null;
  return renderInteractiveGrammar(article(),currentSentence.index,study);
}

function updateInspectorTabs(){document.querySelectorAll('.inspector-tab').forEach(button=>button.classList.toggle('active',button.dataset.inspectorTab===panel))}
function renderInspector(){const content=panel==='word'?fullWordCard():grammarCard();$('#inspector-content').innerHTML=content;if(window.innerWidth<=1050&&$('#mobile-detail').open)$('#mobile-detail-content').innerHTML=content}
function showMobileDetail(){if(window.innerWidth<=1050){$('#mobile-detail-content').innerHTML=panel==='word'?fullWordCard():grammarCard();if(!$('#mobile-detail').open)$('#mobile-detail').showModal()}}

function hoverWord(word,event){
  clearTimeout(wordHoverTimer);clearTimeout(popoverTimer);
  document.querySelectorAll('.active-word').forEach(node=>node.classList.remove('active-word'));
  activeWordNode=word;word.classList.add('active-word');
  const sentenceNode=word.closest('.sentence');
  const context=word.classList.contains('review-word')?word.closest('[lang="en"]')?.textContent.trim()||'':'';
  const surface=word.dataset.surface||word.textContent;
  const key=word.dataset.lemma||lemmaForSurface(surface);
  currentWord=wordData(key,surface,word.dataset.pos||'',sentenceNode?Number(sentenceNode.dataset.sentence):-1,context);
  panel='word';updateInspectorTabs();renderInspector();
  if(event.pointerType==='touch'||window.innerWidth<=1050)return;
  const d=currentWord;
  const lines=[...(d.entry?.meanings||[])].sort((a,b)=>Number(relevantMeaning(b,d.pos))-Number(relevantMeaning(a,d.pos))).slice(0,3);
  const box=$('#word-popover');
  box.innerHTML=`<div class="popover-word">${escapeHTML(d.surface)}</div><div class="popover-pronunciation"><span>${d.entry?.phonetic?`/${escapeHTML(d.entry.phonetic)}/`:'音标暂缺'}</span>${speakerButton(d.surface)}</div><div class="popover-pos">${d.context?'题目／选项词汇':`本句：${escapeHTML(posChinese[d.pos]||d.pos)}`}</div><div class="popover-meanings">${lines.map(x=>`<p>${escapeHTML(x)}</p>`).join('')||'<p>暂未收录释义</p>'}</div><div class="popover-frequency">近五年整卷：<b>${d.freq.papers}/${fullFrequency?.examCount||archive.examCount} 套</b></div><div class="popover-more">详细释义与词汇联想见右侧词卡 →</div>`;
  box.hidden=false;
  const rect=word.getBoundingClientRect();
  const left=Math.min(Math.max(12,rect.left),window.innerWidth-296);
  let top=rect.bottom+9;
  if(top+box.offsetHeight>window.innerHeight-12)top=Math.max(12,rect.top-box.offsetHeight-9);
  box.style.left=`${left}px`;box.style.top=`${top}px`;
}

function scheduleWord(word,event){
  clearTimeout(wordHoverTimer);
  if(word===activeWordNode)return;
  const delay=currentWord?360:140;
  wordHoverTimer=setTimeout(()=>hoverWord(word,event),delay);
}

function hidePopover(){popoverTimer=setTimeout(()=>{$('#word-popover').hidden=true},120)}
function selectSentence(index,selected=''){
  if(index<0||index>=article().sentences.length)return;
  document.querySelectorAll('.sentence.selected').forEach(node=>node.classList.remove('selected'));
  const node=$(`#sentence-${index}`);node?.classList.add('selected');
  currentSentence={index,selected};panel='grammar';updateInspectorTabs();renderInspector();showMobileDetail();
}

function findSentence(node){const parent=node?.nodeType===1?node:node?.parentElement;return parent?.closest?.('.sentence')}
function selectedText(){
  const selection=window.getSelection();const value=selection?.toString().trim();
  if(!value||value.length<3)return;
  const anchor=findSentence(selection.anchorNode);const focus=findSentence(selection.focusNode);
  if(!anchor||!$('#passage-body').contains(anchor))return;
  const index=Number(anchor.dataset.sentence);
  const clipped=value.length>220?value.slice(0,220)+'…':value;
  selectSentence(index,clipped);
  if(focus&&focus!==anchor){const note=$('.selected-fragment');if(note)note.insertAdjacentHTML('beforeend',' <small>（跨句选中，先分析首句）</small>')}
}

function renderMethod(){
  const exams=[...new Set(archive.passages.map(p=>p.exam))];
  $('#method-content').innerHTML=`<span class="panel-kicker">SOURCES & METHOD</span><h2>资料与统计口径</h2><p>阅读正文取自<a href="${archive.sourceDirectory}" target="_blank" rel="noopener noreferrer">公开六级真题目录</a>，本站按年份、考次和 Passage One／Two 重新组织，只供个人精读复习。每篇标题处都有对应原题链接。</p><h3>整套真题词频</h3><p>${escapeHTML(fullFrequency.scope)}</p><p><strong>覆盖限制：</strong>${escapeHTML(fullFrequency.limitation)}</p><p>词形先还原为词元，再统计“出现于多少套试卷”和总词次；同一词在同一套多次出现，试卷数仍只计一套。每套的具体覆盖记录保存在公开数据文件中。</p><h3>词汇联想与句法</h3><p>中英释义、语法词形取自 MIT 许可的 <a href="https://github.com/skywind3000/ECDICT" target="_blank" rel="noopener noreferrer">ECDICT</a>。重点词另有词族联想、重要搭配、易混点和考点；其他词会列出本文语境中实际出现的搭配。${escapeHTML(grammarMethod())} 自动分析可能将引语、倒装、并列谓语或省略结构拆错，请结合原文核对。</p><h3>段落译文</h3><p>译文使用 Argos Translate 英中模型生成；2024 年 6 月第 2 套 Passage One 的段落译文和关键考题句另有校订。译文供理解参考，遇到歧义请以英文原文为准。</p><h3>29 套来源</h3><div class="method-sources">${exams.map(id=>{const p=archive.passages.find(x=>x.exam===id);return `<a href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(editionLabel(p))} ↗</a>`}).join('')}</div>`;
}

function closeLibrary(){document.body.classList.remove('library-open');$('#mobile-library-button').setAttribute('aria-expanded','false')}

document.addEventListener('pointerover',event=>{const word=event.target.closest('.word,.review-word');if(word)scheduleWord(word,event)});
document.addEventListener('pointerout',event=>{const word=event.target.closest('.word,.review-word');if(word&&!word.contains(event.relatedTarget)){clearTimeout(wordHoverTimer);hidePopover()}});
document.addEventListener('click',event=>{
  if(handleReviewClick(event)||handleGrammarClick(event))return;
  const speaker=event.target.closest('[data-speak]');if(speaker){event.preventDefault();speakWord(speaker.dataset.speak);return}
  const nav=event.target.closest('[data-passage]');if(nav){choosePassage(nav.dataset.passage);return}
  const translation=event.target.closest('[data-translation]');if(translation){const content=$(`#translation-${translation.dataset.translation}`);const open=content.hidden;content.hidden=!open;translation.setAttribute('aria-expanded',String(open));translation.innerHTML=`${open?'收起译文':'查看译文'} <span aria-hidden="true">${open?'⌃':'⌄'}</span>`;return}
  const word=event.target.closest('.word,.review-word');if(word){hoverWord(word,{pointerType:window.innerWidth<=1050?'touch':'mouse'});showMobileDetail();return}
  const jump=event.target.closest('[data-jump-sentence]');if(jump){const index=Number(jump.dataset.jumpSentence);const node=$(`#sentence-${index}`);node?.scrollIntoView({behavior:'smooth',block:'center'});selectSentence(index);return}
  const sentence=event.target.closest('.sentence');if(sentence&&$('#passage-body').contains(sentence)&&!window.getSelection()?.toString().trim()){selectSentence(Number(sentence.dataset.sentence));return}
});
document.addEventListener('change',handleReviewChange);
document.querySelectorAll('[data-study-mode]').forEach(button=>button.addEventListener('click',()=>{setStudyMode(button.dataset.studyMode);window.scrollTo({top:0,behavior:'smooth'})}));
$('#passage-body').addEventListener('mouseup',()=>setTimeout(selectedText,0));
$('#passage-body').addEventListener('touchend',()=>setTimeout(selectedText,180));
$('#passage-body').addEventListener('keyup',event=>{if(event.key==='Enter'||event.key===' ')return;setTimeout(selectedText,0)});
document.addEventListener('selectionchange',()=>{clearTimeout(selectionTimer);selectionTimer=setTimeout(selectedText,240)});
document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('.word,.review-word')){event.preventDefault();hoverWord(event.target,{pointerType:'keyboard'});showMobileDetail()}});
$('.inspector').addEventListener('pointerenter',()=>{clearTimeout(wordHoverTimer);clearTimeout(popoverTimer);$('#word-popover').hidden=true});
$('#word-popover').addEventListener('pointerenter',()=>{clearTimeout(wordHoverTimer);clearTimeout(popoverTimer)});
$('#word-popover').addEventListener('pointerleave',hidePopover);
$('#previous-passage').addEventListener('click',()=>choosePassage(archive.passages[currentIndex-1]?.id));
$('#next-passage').addEventListener('click',()=>choosePassage(archive.passages[currentIndex+1]?.id));
document.querySelectorAll('.inspector-tab').forEach(button=>button.addEventListener('click',()=>{panel=button.dataset.inspectorTab;updateInspectorTabs();renderInspector()}));
$('#mobile-library-button').addEventListener('click',()=>{const open=document.body.classList.toggle('library-open');$('#mobile-library-button').setAttribute('aria-expanded',String(open))});
$('#method-button').addEventListener('click',()=>$('#method-dialog').showModal());
$('#method-close').addEventListener('click',()=>$('#method-dialog').close());
$('#mobile-detail-close').addEventListener('click',()=>$('#mobile-detail').close());
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});

loadGrammarData().then(()=>{
  if(!archive)return;
  renderMethod();
  if(panel==='grammar'&&currentSentence)renderInspector();
}).catch(error=>console.error('句法资料加载失败',error));

const reviewReady=initReview().then(()=>{renderTargetReview();$('#review-section').hidden=false}).catch(error=>{$('#review-section').hidden=false;$('#review-list').innerHTML=`<div class="load-error">题目加载失败：${escapeHTML(error.message)}。请刷新页面重试。</div>`;throw error});

Promise.all([fetch('./corpus.json').then(response=>{if(!response.ok)throw new Error('语料加载失败');return response.json()}),fetch('./frequency-full.json').then(response=>{if(!response.ok)throw new Error('整卷词频加载失败');return response.json()}),reviewReady]).then(([data,frequency])=>{
  archive=data;fullFrequency=frequency;
  buildFormLemmaMap();
  $('#library-count').textContent=`${data.examCount} 套 · ${data.passageCount} 篇`;
  const initial=data.passages.findIndex(p=>p.id===TARGET);
  currentIndex=initial>=0?initial:0;
  renderPassage();renderMethod();
  if(location.hash==='#listening')setStudyMode('listening');
}).catch(error=>{$('#passage-body').innerHTML=`<div class="load-error">资料加载失败：${escapeHTML(error.message)}。请刷新页面重试。</div>`});
