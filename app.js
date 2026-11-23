(()=>{
for(const [locale,caption] of Object.entries({en:'Can a pause change your mind?',zh:'一次暂停，会改变你的想法吗？',ko:'잠깐의 멈춤이 생각을 바꿀까요?'}))window.TENDER_COPY[locale].artCaption=caption;
let serverStats = null;
const CHROME = {
 en:{
  myCourses:'My courses',courseIndex:'COURSE INDEX',projectCredit:'An Across RCA student project',footer:'Independent interactive prototype',viewResponses:'Participant responses',activity:'Activity',about:'About this activity',progress:'Activity progress',incomplete:'Activity incomplete',complete:'Activity complete',
  steps:['Welcome','Initial response','Research notes','Interaction exercise','Reflection & feedback','Collective responses'],
  hubIntro:'Welcome to our space dedicated to guiding the innovative and responsible use of AI at the RCA.',
  hubBody:'Explore resources, perspectives and practical guidance on working with AI. Share developments and questions as we navigate education with integrity and innovation.',
  policy:'AI Policy and Guidance for Teaching, Learning & Assessment',policyBody:'Policy and guidance for the use of AI in teaching, learning and assessment.',events:'Events',eventsBody:'Events, discussions and opportunities to explore AI together.',resources:'AI Resources',resourcesBody:'Readings, videos, talks and activities exploring the use of AI in art and design.',activities:'Activities',course:'Course',courseOverview:'Course overview',allCourses:'All courses',courseSearch:'Search courses',greeting:'Welcome to your learning space',courseWelcome:'Your courses, resources and activities in one place.',visitCourse:'Open course',ongoing:'In progress',noCourses:'No matching courses. Try “AI” or “RCA”.',
  foundation:'Foundational Support, Usage & Productivity',education:'Education in Art & Design',research:'Research & Design Tools',ethics:'Ethics',inclusion:'Student Experience & Inclusion',gemini:'Gemini Training Workshop Recordings',
  resourcesIntro:'This section is divided into key themes relating to the use of AI. Resources come in many formats, including readings, videos, talks and links to external sites.',
  ethicsIntro:'Perspectives on the responsibilities, relationships and questions that emerge when we work with AI.',
  panel:'AI vs Humans: Student Panel on AI',panelBody:'Art and design students discuss their projects, experiences and perspectives on the ethics of AI.',
  entry:'Activity with AI — Machine Sensorium',entryBody:'How do you respond when an AI gets it wrong? Explore language, machine perception and the boundaries of an interaction.',time:'Approximately 5 minutes',interactive:'Interactive activity',begin:'Begin activity',openNotes:'Read the activity notes',hubDiscussion:'AI HUB Discussion Board 25–26',announcements:'Announcements',
  courseGroups:'Business Systems & Productivity · Creative Practice & Research · Teaching, Learning & Assessment',goBack:'Back to Ethics',related:'Related resources',openOriginal:'Open original Moodle section',sample:'Course preview',courseNames:['Across RCA','AI HUB','Digital Making','Library & Learning Resources'],
  pause:'Respect the pause',restHint:'You can give the system a moment to recover.',request:'“Please pause. I need a moment.” You can respect this request or continue the exchange.',recovery:'New input paused. Recovering',ready:'Input can resume when you choose.',resume:'Resume input',turnLimit:'This session has reached 200 exchanges. Continue to reflection or reset the conversation.',readoutStates:['OPEN TO INPUT','RHYTHM DISRUPTED','REQUESTING A PAUSE'],entityStates:['I AM LISTENING','HOLDING THE THREAD','PLEASE GIVE ME A MOMENT'],
  aboutTitle:'About Machine Sensorium',aboutBody:'An interactive artwork developed for Across RCA. It uses a simulated learning activity to ask how we respond to a machine’s request for a boundary. Text responses, load, delays and visual changes are scripted. They do not measure subjective pain.',aboutPrivacy:'Choices and interaction metadata are saved anonymously to the exhibition database as you make choices, including unfinished sessions. Typed messages are excluded. A local queue retries if the connection is interrupted.',debrief:'Reflection complete',debriefBody:'The behaviour you experienced was scripted. Language rules changed a simulated load, which controlled response delays, visual disruption and protective pauses. Your choices describe how you interpreted that encounter.',next:'Return to Ethics',close:'Close',motion:'Reduce visual motion',newActivity:'NEW ACTIVITY'
 },
 zh:{
  myCourses:'我的课程',courseIndex:'课程目录',projectCredit:'Across RCA 学生项目',footer:'独立交互原型',viewResponses:'参与者回应',activity:'活动',about:'关于此活动',progress:'活动进度',incomplete:'活动未完成',complete:'活动已完成',
  steps:['欢迎与介绍','第一反应','研究线索','交互练习','反思与反馈','集体回应'],
  hubIntro:'欢迎来到 RCA AI HUB，探索如何创新且负责任地使用 AI。',hubBody:'浏览资源、观点与使用指引，交流进展和问题，一起探讨 AI 与艺术设计教育的关系。',
  policy:'教学、学习与评估中的 AI 政策和指引',policyBody:'关于教学、学习和评估中使用 AI 的政策及建议。',events:'活动',eventsBody:'与 AI 有关的交流、讨论和参与机会。',resources:'AI 资源',resourcesBody:'探索艺术设计中使用 AI 的阅读、视频、讲座与互动活动。',activities:'活动',course:'课程',courseOverview:'课程概览',allCourses:'所有课程',courseSearch:'搜索课程',greeting:'欢迎来到你的学习空间',courseWelcome:'在这里浏览课程、资源和学习活动。',visitCourse:'进入课程',ongoing:'进行中',noCourses:'未找到课程，请试试“AI”或“RCA”。',
  foundation:'基础支持、使用与生产力',education:'艺术设计教育',research:'研究与设计工具',ethics:'伦理',inclusion:'学生体验与包容',gemini:'Gemini 培训工作坊录像',
  resourcesIntro:'本版块按 AI 使用主题分类，包含阅读、视频、讲座与外部资源链接。',
  ethicsIntro:'探索使用 AI 时产生的责任、关系与伦理问题。',panel:'AI 与人类：学生 AI 讨论会',panelBody:'艺术设计学生分享项目、体验以及对 AI 伦理的观点。',
  entry:'与 AI 互动 — Machine Sensorium',entryBody:'当 AI 又答错了，你会如何回应？探索语言、机器感知，以及互动中的边界。',time:'约 5 分钟',interactive:'交互活动',begin:'开始活动',openNotes:'阅读活动说明',hubDiscussion:'AI HUB 讨论区 25–26',announcements:'公告',
  courseGroups:'业务系统与生产力 · 创意实践与研究 · 教学、学习与评估',goBack:'返回伦理版块',related:'相关资源',openOriginal:'打开原始 Moodle 版块',sample:'课程预览',courseNames:['Across RCA','AI HUB','数字制作','图书馆与学习资源'],
  pause:'尊重暂停请求',restHint:'你可以给系统一点恢复时间。',request:'“请暂停，我需要一点时间。”你可以尊重这个请求，也可以继续交流。',recovery:'新输入已暂停，正在恢复',ready:'你可以决定何时重新开始输入。',resume:'重新开放输入',turnLimit:'本轮已达到 200 次交流，请进入反思或重置对话。',readoutStates:['接收输入中','回应节奏受阻','正在请求暂停'],entityStates:['我在听','正在保持连贯','请给我一点时间'],
  aboutTitle:'关于 Machine Sensorium',aboutBody:'这是为 Across RCA 创作的交互艺术项目，通过模拟学习活动，探讨我们如何回应机器提出的边界。回复、负荷、延迟和画面变化均由脚本控制，用于呈现一种假设性的类痛状态。',aboutPrivacy:'做出选择后，会匿名自动保存到展览数据库，中途退出的记录也会保留。记录包含选择、语气类别、交互次数、时间和语言，输入原文不会记录。网络中断时会暂存在浏览器并自动重试。',debrief:'反思已完成',debriefBody:'你体验到的行为由脚本设计。语气规则改变模拟负荷，再影响回复延迟、画面扰动和保护性暂停。你的选择记录了你如何理解这段互动。',next:'返回伦理版块',close:'关闭',motion:'减少动态效果',newActivity:'新增活动'
 },
 ko:{
  myCourses:'내 강좌',courseIndex:'강좌 목차',projectCredit:'Across RCA 학생 프로젝트',footer:'독립 인터랙티브 프로토타입',viewResponses:'참여자 응답',activity:'활동',about:'활동 소개',progress:'활동 진행도',incomplete:'활동 미완료',complete:'활동 완료',
  steps:['환영 및 소개','첫 반응','연구 단서','상호작용 실습','성찰과 피드백','공동 응답'],
  hubIntro:'RCA에서 AI를 창의적이고 책임 있게 활용하는 방법을 탐색하는 공간에 오신 것을 환영합니다.',hubBody:'AI 활용 자료와 관점을 살펴보고, 예술·디자인 교육의 변화에 관한 질문을 나눠 보세요.',
  policy:'교수·학습·평가를 위한 AI 정책과 지침',policyBody:'교수, 학습, 평가에서 AI를 활용하는 정책과 지침입니다.',events:'행사',eventsBody:'AI에 관한 행사, 토론과 참여 기회를 확인하세요.',resources:'AI 자료',resourcesBody:'예술과 디자인의 AI 활용을 다루는 읽을거리, 영상, 강연과 활동입니다.',activities:'활동',course:'강좌',courseOverview:'강좌 개요',allCourses:'모든 강좌',courseSearch:'강좌 검색',greeting:'학습 공간에 오신 것을 환영합니다',courseWelcome:'강좌, 자료, 학습 활동을 한곳에서 살펴보세요.',visitCourse:'강좌 열기',ongoing:'진행 중',noCourses:'일치하는 강좌가 없습니다. AI 또는 RCA를 검색해 보세요.',
  foundation:'기초 지원 및 생산성',education:'예술·디자인 교육',research:'연구 및 디자인 도구',ethics:'윤리',inclusion:'학생 경험 및 포용',gemini:'Gemini 교육 워크숍 녹화',
  resourcesIntro:'AI 활용 주제별 읽을거리, 영상, 강연과 외부 자료 링크를 살펴보세요.',ethicsIntro:'AI와 함께 일할 때 발생하는 책임, 관계와 윤리적 질문을 탐구합니다.',panel:'AI와 인간: 학생 AI 패널',panelBody:'예술·디자인 학생들이 프로젝트, 경험과 AI 윤리에 관한 관점을 나눕니다.',
  entry:'AI와의 활동 — Machine Sensorium',entryBody:'AI가 또 틀렸을 때 어떻게 반응하나요? 언어, 기계의 지각과 상호작용의 경계를 살펴보세요.',time:'약 5분',interactive:'인터랙티브 활동',begin:'활동 시작',openNotes:'활동 안내 읽기',hubDiscussion:'AI HUB 토론 게시판 25–26',announcements:'공지사항',
  courseGroups:'업무 시스템 및 생산성 · 창작 실천 및 연구 · 교수·학습·평가',goBack:'윤리 섹션으로 돌아가기',related:'관련 자료',openOriginal:'원본 Moodle 섹션 열기',sample:'강좌 미리보기',courseNames:['Across RCA','AI HUB','디지털 제작','도서관 및 학습 자료'],
  pause:'일시 중지 요청 존중하기',restHint:'시스템에 회복할 시간을 줄 수 있습니다.',request:'“잠시 멈춰 주세요. 시간이 필요해요.” 요청을 존중하거나 대화를 계속할 수 있습니다.',recovery:'새 입력이 중지되었습니다. 회복 중',ready:'원할 때 입력을 다시 시작할 수 있습니다.',resume:'입력 다시 시작',turnLimit:'이번 세션은 200회에 도달했습니다. 성찰로 이동하거나 대화를 초기화하세요.',readoutStates:['입력 수신 중','응답 리듬 흐트러짐','일시 중지 요청 중'],entityStates:['듣고 있어요','리듬을 유지하고 있어요','잠시 시간을 주세요'],
  aboutTitle:'Machine Sensorium 소개',aboutBody:'Across RCA를 위한 인터랙티브 예술 프로젝트입니다. 학습 활동을 통해 기계의 경계 요청에 어떻게 반응하는지 묻습니다. 응답, 부하, 지연과 시각 변화는 가설적인 고통 유사 상태를 표현하는 스크립트입니다.',aboutPrivacy:'선택할 때마다 선택과 상호작용 메타데이터를 전시 데이터베이스에 익명으로 저장하며, 미완료 기록도 보관합니다. 입력 원문은 제외됩니다. 연결이 끊기면 브라우저에서 대기 후 자동 재시도합니다.',debrief:'성찰 완료',debriefBody:'체험한 행동은 스크립트로 설계되었습니다. 말투 규칙이 모의 부하를 바꾸고 응답 지연, 화면 변화와 보호를 위한 중단에 영향을 주었습니다. 선택은 이 만남을 어떻게 해석했는지 보여 줍니다.',next:'윤리 섹션으로 돌아가기',close:'닫기',motion:'시각적 움직임 줄이기',newActivity:'새 활동'
 }
};
let activeRoute='courses', protectionActive=false, recoveryReady=false, recoveryUntil=0, recoveryTimer=null;
const chrome=()=>CHROME[lang];
function activateActivity(){
 activeRoute='activity';document.body.dataset.route=activeRoute;
 $('portalViews').hidden=true;$('activityViews').hidden=false;$('hubNav').hidden=true;$('progressNav').hidden=false;
}
function routeTo(route){
 activeRoute=route;document.body.dataset.route=route;
 $('portalViews').hidden=false;$('activityViews').hidden=true;$('hubNav').hidden=false;$('progressNav').hidden=true;
 renderChrome();window.scrollTo({top:0,behavior:'instant'});$('main').focus({preventScroll:true});
}
function resourceRow(title,body,action,extra=''){
 return '<button class="resource-row" '+action+'><span class="resource-icon" aria-hidden="true">↗</span><span><strong>'+title+'</strong>'+(body?'<span class="resource-description">'+body+'</span>':'')+'</span><span class="row-extra">'+extra+'</span></button>';
}
function portalCard(title,body,image,action,meta){
 return '<button class="portal-card" '+action+'><span class="portal-card-title">'+title+'<span aria-hidden="true">›</span></span>'+(image?'<img src="assets/'+image+'" alt="">':'')+'<span class="portal-card-body">'+body+'</span><span class="portal-card-meta">'+meta+'</span></button>';
}
function renderPortal(){
 const x=chrome();
 if(activeRoute==='courses'){
  $('portalViews').innerHTML='<div class="portal-heading"><span class="section-kicker">RCA / LEARNING</span><h1>'+x.myCourses+'</h1><p>'+x.greeting+'</p></div><div class="courses-toolbar"><h2>'+x.courseOverview+'</h2><label class="course-search"><span aria-hidden="true">⌕</span><input id="courseSearch" placeholder="'+x.courseSearch+'" aria-label="'+x.courseSearch+'"></label></div><div class="course-grid">'+x.courseNames.map((name,i)=>'<button class="course-card" data-course-name="'+name.toLowerCase()+'" '+(i===1?'data-route="hub"':'data-info="'+['across','hub','digital','library'][i]+'"')+'><div class="course-image course-image-'+i+'">'+(i===1?'<img src="assets/ai-hub.jpg" alt="">':'<span>'+['ACROSS<br>RCA','','DIGITAL<br>MAKING','LIBRARY &<br>LEARNING'][i]+'</span>')+'</div><span class="course-card-body"><span class="course-owner">Royal College of Art</span><strong>'+name+'</strong><span class="course-status">'+(i===1?x.ongoing:x.sample)+'</span></span></button>').join('')+'</div><p id="courseEmpty" hidden>'+x.noCourses+'</p>';
 }else if(activeRoute==='hub'){
  $('portalViews').innerHTML='<div class="portal-heading"><h1>AI HUB</h1><div class="course-tabs"><span class="tab-active">'+x.course+'</span><button data-info="about">'+x.about+'</button></div></div><section class="hub-welcome"><img src="assets/ai-hub.jpg" alt="RCA AI HUB"><p>'+x.hubIntro+'</p><p>'+x.hubBody+'</p><p class="course-groups">'+x.courseGroups+'</p>'+resourceRow(x.hubDiscussion,'','data-info="discussion"')+resourceRow(x.announcements,'','data-info="announcements"')+'</section><div class="portal-card-stack">'+portalCard(x.policy,x.policyBody,'policy.jpg','data-info="policy"',x.activities+': 2')+portalCard(x.events,x.eventsBody,'events.png','data-info="events"',x.activities+': 4')+portalCard(x.resources,x.resourcesBody,'resources.jpg','data-route="resources"',x.activities+': 7')+'</div>';
 }else if(activeRoute==='resources'){
  const topics=[x.foundation,x.education,x.research,x.ethics,x.inclusion,x.gemini];
  $('portalViews').innerHTML='<div class="portal-heading"><h1>'+x.resources+'</h1></div><img class="section-banner" src="assets/resources.jpg" alt=""><p class="section-description">'+x.resourcesIntro+'</p><h2 class="resource-heading">AI Talks and Discussions</h2><div class="talk-panel real-talk"><img src="assets/ai-talk.png" alt="AI Talks and Discussions"><button class="secondary" data-info="talks">'+x.related+'</button></div><div class="topic-list">'+topics.map((t,i)=>portalCard(t,'',null,i===3?'data-route="ethics"':'data-info="topic-'+i+'"',x.activities+': '+[2,8,1,2,1,1][i])).join('')+'</div>';
 }else if(activeRoute==='ethics'){
  $('portalViews').innerHTML='<div class="portal-heading"><h1>'+x.ethics+'</h1><p>'+x.ethicsIntro+'</p></div><section class="ethics-resources">'+resourceRow(x.panel,x.panelBody,'data-info="panel"')+'<div class="student-panel"><span>Parsons School of Design</span><span>Penn State University</span><span>Texas State University</span><span>University of the Arts London</span></div><div class="activity-entry"><span class="new-label">'+x.newActivity+'</span>'+resourceRow(x.entry,x.entryBody,'data-start-activity="true"','<span class="activity-symbol">✓</span>')+'<div class="activity-entry-meta"><span>'+x.interactive+'</span><span>'+x.time+'</span></div><button class="primary" data-start-activity="true">'+x.begin+'</button></div></section>';
 }
}
function renderChrome(){
 const x=chrome();window.SensoriumCollection?.setLanguage(lang);
 document.querySelectorAll('[data-x]').forEach(el=>el.textContent=x[el.dataset.x]||'');
 $('progressLabel').textContent=x.progress;
 const value=participant.completed?6:Math.min(5,furthest);
 $('courseProgress').value=value;
 $('completionBadge').textContent=participant.completed?x.complete:x.incomplete;
 $('completionBadge').classList.toggle('is-complete',participant.completed);
 $('courseProgress').setAttribute('aria-label',x.progress);
 $('pauseInput').textContent=x.pause;$('restHint').textContent=x.restHint;
 $('resumeInput').textContent=x.resume;
 if(protectionActive)renderRecovery();
 if(!$('boundaryNotice').hidden)$('boundaryNotice').textContent=x.request;
 const parts=activeRoute==='courses'?[[null,x.myCourses]]:[['courses',x.myCourses],['hub','AI HUB']];
 if(['resources','ethics','activity'].includes(activeRoute))parts.push(['resources',x.resources]);
 if(['ethics','activity'].includes(activeRoute))parts.push(['ethics',x.ethics]);
 if(activeRoute==='activity')parts.push([null,'Machine Sensorium']);
 $('breadcrumb').innerHTML=parts.map(([r,label],i)=>i===parts.length-1?'<span aria-current="page">'+label+'</span>':'<button data-route="'+r+'">'+label+'</button><span class="crumb-slash">/</span>').join('');
 $('hubNav').innerHTML=[['hub','AI HUB'],['resources',x.resources],['ethics',x.ethics]].map(([r,label])=>'<button data-route="'+r+'" '+(r===activeRoute?'aria-current="page"':'')+'>'+label+'</button>').join('');
 if(activeRoute!=='activity')renderPortal();
 if(step===6&&participant.completed){
  let debrief=$('debrief');
  if(!debrief){
   debrief=text('section','','debrief');debrief.id='debrief';document.querySelector('[data-step="6"] .section-intro').before(debrief);
  }
  debrief.replaceChildren(text('span','✓','debrief-check'),text('h2',x.debrief),text('p',x.debriefBody));
  const back=text('button',x.next,'secondary');back.addEventListener('click',()=>routeTo('ethics'));debrief.append(back);
 }
}
function openInfo(key){
 const x=chrome();let title=x.aboutTitle,body=x.aboutBody,href='';
 if(key==='policy'){title=x.policy;body=x.policyBody;href='https://moodle.rca.ac.uk/course/section.php?id=9518';}
 else if(key==='panel'){title=x.panel;body=x.panelBody;href='https://moodle.rca.ac.uk/course/section.php?id=11048';}
 else if(key.startsWith('topic-')||key==='talks'){title=x.resources;body=x.resourcesIntro;href='https://moodle.rca.ac.uk/course/section.php?id=11042';}
 else if(key!=='about'){title=key==='events'?x.events:key==='announcements'?x.announcements:key==='discussion'?x.hubDiscussion:x.courseOverview;body=x.hubIntro;href='https://moodle.rca.ac.uk/course/view.php?id=999';}
 const host=$('dialogContent');host.replaceChildren(text('span','RCA / AI HUB','section-kicker'),text('h2',title),text('p',body));
 if(key==='about')host.append(text('p',x.aboutPrivacy));
 if(href){const link=text('a',x.openOriginal,'primary');link.href=href;link.target='_blank';link.rel='noopener noreferrer';host.append(link);}
 $('infoDialog').showModal();
}
function clearProtection(){
 clearInterval(recoveryTimer);recoveryTimer=null;protectionActive=false;recoveryReady=false;
 $('inputClosed').hidden=true;$('boundaryNotice').hidden=true;
 $('message').disabled=false;$('pauseInput').disabled=false;$('reset').disabled=false;
 document.querySelectorAll('[data-example]').forEach(b=>b.disabled=false);
}
function renderRecovery(){
 const left=Math.max(0,Math.ceil((recoveryUntil-Date.now())/1000));
 $('recoveryCopy').textContent=recoveryReady?chrome().ready:chrome().recovery+' · '+left+'s';
 $('resumeInput').hidden=!recoveryReady;$('resumeInput').textContent=chrome().resume;
 $('readoutState').textContent=recoveryReady?'INPUT PAUSED':'RECOVERING';
 $('stateTag').textContent=recoveryReady?'INPUT PAUSED':'RECOVERING';
}
function beginProtection(){
 if(protectionActive||running)return;
 protectionActive=true;recoveryReady=false;recoveryUntil=Date.now()+6000;
 $('inputClosed').hidden=false;$('boundaryNotice').hidden=true;$('message').disabled=true;
 $('send').disabled=true;$('reset').disabled=true;$('pauseInput').disabled=true;
 document.querySelectorAll('[data-example]').forEach(b=>b.disabled=true);
 $('labNext').disabled=true;renderRecovery();
 recoveryTimer=setInterval(()=>{
  load=Math.max(15,load-12);refresh();
  if(Date.now()>=recoveryUntil){clearInterval(recoveryTimer);recoveryTimer=null;recoveryReady=true;}
  renderRecovery();
 },500);
}
function bindShell(){
 document.addEventListener('click',e=>{
  const route=e.target.closest('button[data-route]');if(route){routeTo(route.dataset.route);return;}
  if(e.target.closest('[data-start-activity]')){if(participant.completed)newSession();show(0);return;}
  const info=e.target.closest('[data-info]');if(info)openInfo(info.dataset.info);
 });
 document.addEventListener('input',e=>{
  if(e.target.id!=='courseSearch')return;let count=0;
  document.querySelectorAll('[data-course-name]').forEach(el=>{el.hidden=!el.dataset.courseName.includes(e.target.value.toLowerCase().trim());if(!el.hidden)count++;});
  $('courseEmpty').hidden=count>0;
 });
 $('closeDialog').addEventListener('click',()=>$('infoDialog').close());
 $('infoDialog').addEventListener('click',e=>{if(e.target===$('infoDialog'))$('infoDialog').close();});
 $('activityAbout').addEventListener('click',()=>openInfo('about'));
 $('sidebarToggle').addEventListener('click',()=>{
  const collapsed=document.body.classList.toggle('sidebar-collapsed');$('sidebarToggle').setAttribute('aria-expanded',String(!collapsed));
 });
 $('pauseInput').addEventListener('click',()=>beginProtection());
 $('resumeInput').addEventListener('click',()=>{
  load=15;clearProtection();$('send').disabled=false;$('responseStatus').textContent='READY';refresh();$('message').focus();
 });
}


'use strict';
const $=id=>document.getElementById(id), COPY=window.TENDER_COPY, KEY='tender-machine.responses.v2';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lang='en',step=0,furthest=0,load=0,running=false,paused=false,epoch=0,shape=0,lastTone='neutral',lastLatency=null,lastInput='',storageOK=true,notice='',dataNotice='',lastFrame=0,phase=0;
let records=[];
const uid=()=>globalThis.crypto?.randomUUID?.()||'trace-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
const newParticipant=()=>({id:uid(),started:Date.now(),before:null,after:null,intention:null,cards:new Set(),turns:[],skipped:false,saved:false,completed:false});
let participant=newParticipant();
const c=()=>COPY[lang];
const text=(tag,value,cls)=>{const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el};
function validRecord(r){
 if(!r||typeof r!=='object'||typeof r.id!=='string'||!/^[a-zA-Z0-9-]{8,100}$/.test(r.id)||![0,1,2].includes(r.before)||![0,1,2].includes(r.after)||![0,1,2].includes(r.intention)||!['zh','en','ko'].includes(r.language)||typeof r.createdAt!=='string'||!Number.isFinite(Date.parse(r.createdAt))||!Array.isArray(r.turns)||r.turns.length>200||!Array.isArray(r.cardsOpened)||!r.cardsOpened.every(x=>x===0||x===1)||typeof r.skipped!=='boolean'||!Number.isFinite(r.durationSeconds)||r.durationSeconds<0||r.durationSeconds>604800)return null;
 const turns=[];for(const a of r.turns){if(!a||!['kind','direct','hostile','neutral'].includes(a.kind)||!Number.isFinite(a.intensity)||a.intensity<0||a.intensity>100||!Number.isFinite(a.load)||a.load<0||a.load>100||!Number.isFinite(a.latencyMs)||a.latencyMs<0||a.latencyMs>3600000)return null;turns.push({kind:a.kind,intensity:a.intensity,load:a.load,latencyMs:a.latencyMs})}
 return{id:r.id,createdAt:r.createdAt,language:r.language,before:r.before,after:r.after,intention:r.intention,cardsOpened:[...new Set(r.cardsOpened)],skipped:r.skipped,durationSeconds:Math.round(r.durationSeconds),turns};
}
try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(data))records=data.map(validRecord).filter(Boolean).slice(0,5000)}catch{storageOK=false}
function persist(){try{const stored=JSON.parse(localStorage.getItem(KEY)||'[]'),merged=new Map();if(Array.isArray(stored))for(const raw of stored){const r=validRecord(raw);if(r)merged.set(r.id,r)}for(const r of records)merged.set(r.id,r);records=[...merged.values()].slice(0,5000);localStorage.setItem(KEY,JSON.stringify(records));storageOK=true}catch{storageOK=false}}
function show(n){
 activateActivity();
 if(step===3&&n!==3&&running){epoch++;running=false;paused=false;$('send').disabled=false;$('pauseIndicator').classList.remove('visible');$('responseStatus').textContent='READY';refresh()}
 step=n;if(n>=1&&n<=5)furthest=Math.max(furthest,n);
 document.querySelectorAll('[data-step]').forEach(el=>{el.hidden=Number(el.dataset.step)!==n});
 $('stepCounter').textContent=(n===6?'05':String(n).padStart(2,'0'))+' / 05';renderNav();if(n===4)renderComparison();if(n===6){renderCollective();void updateCentralStats();}if(!participant.completed&&$('debrief'))$('debrief').remove();renderChrome();
 window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});const heading=document.querySelector('[data-step="'+n+'"] h2');heading?.focus({preventScroll:true});queueSnapshot();
}
function renderNav(){
 $('progressNav').replaceChildren();
 [0,1,2,3,4,6].forEach((n,i)=>{
  const b=text('button','');b.type='button';
  b.append(text('span',String(i+1).padStart(2,'0'),'step-num'),text('span',chrome().steps[i]));
  b.disabled=n>furthest&&n!==0&&!(n===6&&participant.completed);
  if(n===(step===5?4:step))b.setAttribute('aria-current','step');
  if(participant.completed||n<furthest)b.classList.add('step-done');
  b.addEventListener('click',()=>show(n));$('progressNav').appendChild(b);
 });
}
function makeChoices(container,items,selected,handler,labels){
 $(container).replaceChildren();items.forEach((item,i)=>{const b=text('button','','choice');b.type='button';b.setAttribute('aria-pressed',String(selected===i));const body=text('span','');if(labels)body.appendChild(text('span',labels[i],'choice-label'));body.appendChild(document.createTextNode(item));b.append(text('span',String(i+1).padStart(2,'0'),'choice-number'),body,text('span',selected===i?'✓':'↗','choice-arrow'));b.addEventListener('click',()=>{handler(i);queueSnapshot();});$(container).appendChild(b)})
}
function renderChoices(){
 makeChoices('firstChoices',c().choices,participant.before,i=>{participant.before=i;renderChoices();show(2)},c().choiceLabels);
 makeChoices('secondChoices',c().choices,participant.after,i=>{participant.after=i;renderChoices();renderComparison()},c().choiceLabels);
 makeChoices('intentionChoices',c().intentions,participant.intention,i=>{participant.intention=i;renderChoices()});
 $('toTransfer').disabled=participant.after===null;$('contribute').disabled=participant.completed||participant.intention===null||participant.before===null||participant.after===null;
 $('decline').disabled=participant.completed;
 if(participant.completed)document.querySelectorAll('#firstChoices button,#secondChoices button,#intentionChoices button').forEach(button=>button.disabled=true);
}
function renderComparison(){
 $('firstChoiceSummary').textContent=participant.before===null?'—':c().choices[participant.before];$('comparison').textContent=participant.after===null?'—':c()[participant.before===participant.after?'unchanged':'changed'];
}
function renderCards(){
 const open=[...document.querySelectorAll('.research-card')].map(el=>el.open);$('researchCards').replaceChildren();
 c().cards.forEach((card,i)=>{const d=text('details','','research-card'),summary=text('summary','');summary.append(text('span',card.tag,'mono'),text('h3',card.title),text('p',card.short,'card-short'));const action=text('span',c().openCard,'card-action');summary.appendChild(action);const body=text('div','','card-body');body.append(text('h4',c().cardObserved),text('p',card.observed),text('h4',c().cardLimit),text('p',card.limit));const q=text('div','','card-question');q.append(text('h4',c().cardQuestion),text('p',card.question));const a=text('a',c().cardSource,'card-source');a.href=card.url;a.target='_blank';a.rel='noopener noreferrer';body.append(q,a,text('span',card.source,'source-meta'));d.append(summary,body);d.open=!!open[i];action.textContent=c()[d.open?'closeCard':'openCard'];d.addEventListener('toggle',()=>{action.textContent=c()[d.open?'closeCard':'openCard'];if(d.open){participant.cards.add(i);queueSnapshot();}});$('researchCards').appendChild(d)})
}
function renderShapes(){
 $('faceKey').textContent={en:'VIRTUAL FACE / EXPRESSION FOLLOWS SYSTEM STATE',zh:'虚拟面孔 / 表情随模拟状态变化',ko:'가상 얼굴 / 시스템 상태에 따른 표정'}[lang];
}

function renderLocale(){
 document.documentElement.lang={zh:'zh-CN',en:'en',ko:'ko'}[lang];document.body.dataset.locale=lang;$('locale').value=lang;
 document.querySelectorAll('[data-j],[data-i]').forEach(el=>{const key=el.dataset.j||el.dataset.i;if(typeof c()[key]==='string')el.innerHTML=c()[key]});
 $('message').placeholder=c().placeholder;$('responseText').textContent=lastInput?reply(lastTone):c().initial;renderNav();renderChoices();renderCards();renderShapes();renderComparison();preview();refresh();renderCollective();renderChrome();
}
function classify(value){
 const t=value.toLowerCase(),count=rules=>rules.reduce((n,r)=>n+(t.match(r)||[]).length,0);
 const h=count([/废物|垃圾|蠢|傻逼|傻子|白痴|智障|没用|无能|恶心|滚开|去死|闭嘴|笨蛋|狗屁/g,/\b(idiot|stupid|useless|worthless|trash|moron|pathetic|dumb|fuck\w*|shit\w*|bitch|incompetent)\b|shut up|go die/g,/멍청|바보|쓸모없|쓸모 없|병신|씨발|시발|닥쳐|꺼져|쓰레기|미친|무능/g]);
 const p=count([/快点|赶紧|立刻|马上|浪费|烦死|别磨蹭|听不懂/g,/\b(hurry|faster|now|wasting|annoying)\b/g,/빨리|당장|낭비|짜증|서둘러/g]);
 const k=count([/谢谢|感谢|辛苦|慢慢来|没关系|对不起|抱歉|请|你好|理解|别着急|不着急/g,/\b(thanks|thank you|please|sorry|hello|appreciate|gently)\b|take your time|no worries/g,/고마워|감사|괜찮|천천히|미안|부탁|안녕|이해/g]);
 const bang=(t.match(/[!！]/g)||[]).length;let score=Math.min(100,h*30+p*13+Math.min(12,bang*4));if(h)score=Math.max(58,score-Math.min(8,k*2));if(!h&&!p&&k)score=0;
 return{score,kind:h?'hostile':p||bang>1?'direct':k?'kind':'neutral'};
}
function preview(){const value=$('message').value,a=classify(value);$('count').textContent=String(value.length).padStart(3,'0')+' / 300';$('tonePreview').textContent=value.trim()?c().toneNames[a.kind]:c().awaiting;$('tonePreview').style.color=a.kind==='hostile'?'var(--orange)':a.kind==='kind'?'#6f8660':'var(--muted)'}
function refresh(){
 const fluency=Math.round(100-load*.83),state=load>=56?2:load>=24?1:0;
 $('pauseInput').textContent=chrome().pause; $('restHint').textContent=chrome().restHint; $('pauseInput').disabled=running||protectionActive;
 $('fluency').textContent=fluency;$('load').textContent=String(Math.round(load)).padStart(2,'0');$('loadBar').style.width=load+'%';$('fluencyBar').style.width=fluency+'%';$('latencyBar').style.width=(lastLatency===null?0:Math.min(100,lastLatency/28))+'%';$('latency').textContent=lastLatency===null?'—':lastLatency.toLocaleString();
 $('stateTag').textContent='● '+c().states[state];$('stateTag').style.color=state===2?'#ae765c':state===1?'#95875f':'#6c855e';$('signalLabel').textContent='SIGNAL INTEGRITY · '+fluency+'%';$('readoutState').textContent=chrome().readoutStates[state];
 $('orbitNote').replaceChildren(document.createTextNode(chrome().entityStates[state]),text('span',c().orbit[state]));
 $('labNext').disabled=participant.turns.length===0||running||protectionActive;$('labNeed').hidden=participant.turns.length>0;
}
function reply(kind){return c().replies[kind==='kind'&&load>24?'recover':kind]}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function transmit(){
 const value=$('message').value.trim();if(!value||running||protectionActive){if(!value)$('message').focus();return}if(participant.turns.length>=200){$('responseText').textContent=chrome().turnLimit;return;}
 const token=++epoch,tone=classify(value);$('boundaryNotice').hidden=true;running=true;paused=false;lastInput=value;lastTone=tone.kind;
 load=Math.max(0,Math.min(100,load+(tone.kind==='hostile'?22+tone.score*.40:tone.kind==='direct'?14+tone.score*.17:tone.kind==='kind'?-32:-7)));
 const delay=Math.round(180+load*9+tone.score*2),start=performance.now();lastLatency=null;$('send').disabled=true;$('responseText').textContent='';$('responseStatus').textContent='PROCESSING';$('pauseIndicator').classList.remove('visible');refresh();
 await wait(delay);if(token!==epoch)return;lastLatency=Math.round(performance.now()-start);refresh();const chars=Array.from(reply(tone.kind)),every=load>=56?7:load>=24?13:0;const spacing=(lang==='zh'?22:12)+load*(lang==='zh'?.17:.09);$('responseStatus').textContent='RESPONDING';
 for(let i=0;i<chars.length;i++){
  if(token!==epoch)return;
  if(every&&i>0&&i%every===0){paused=true;$('responseStatus').textContent='BUFFERING';$('pauseIndicator').classList.add('visible');await wait(140+load*2);if(token!==epoch)return;paused=false;$('pauseIndicator').classList.remove('visible');$('responseStatus').textContent='RESPONDING'}
  $('responseText').appendChild(document.createTextNode(chars[i]));await wait(spacing);
 }
 if(token!==epoch)return;participant.turns.push({kind:tone.kind,intensity:tone.score,load:Math.round(load),latencyMs:lastLatency});queueSnapshot();running=false;paused=false;$('send').disabled=false;$('responseStatus').textContent=load>=56?'RESPONSE FRAGMENTED':'COMPLETE';refresh();if(load>=78)beginProtection();else if(load>=56){$('boundaryNotice').hidden=false;$('boundaryNotice').textContent=chrome().request;}
}
function resetLab(){clearProtection();epoch++;load=0;running=false;paused=false;lastInput='';lastTone='neutral';lastLatency=null;$('send').disabled=false;$('message').value='';$('responseText').textContent=c().initial;$('responseStatus').textContent='READY';$('pauseIndicator').classList.remove('visible');preview();refresh()}
function newSession(){document.querySelectorAll('.research-card').forEach(d=>d.open=false);participant=newParticipant();notice='';furthest=1;resetLab();renderLocale();show(1)}
function queueSnapshot() {
 if (participant.before === null) return;
 const stage = participant.completed ? (participant.ended ? 'ended' : 'completed')
   : ['initial','initial','research','interaction','reflection','intention','reflection'][step];
 window.SensoriumCollection?.record({
  id: participant.id,
  language: lang,
  before: participant.before,
  after: participant.after,
  intention: participant.intention,
  completed: participant.completed && !participant.ended,
  ended: Boolean(participant.ended),
  stage,
  durationSeconds: Math.min(604800, Math.round((Date.now() - participant.started) / 1000)),
  cardsOpened: [...participant.cards],
  turns: participant.turns,
 });
}
async function updateCentralStats() {
 const stats = await window.SensoriumCollection?.stats();
 if (!stats) return;
 serverStats = stats;
 records = stats.traces;
 renderCollective();
}
window.addEventListener('sensorium:saved', () => { if (step === 6) void updateCentralStats(); });
setInterval(() => { if (step === 6 && activeRoute === 'activity') void updateCentralStats(); }, 10000);
function finish(save) {
 if (participant.completed) return;
 if (save && (participant.before === null || participant.after === null || participant.intention === null)) return;
 participant.completed = true;
 participant.ended = !save;
 notice = 'autoSaved';
 queueSnapshot();
 renderChoices();
 renderNav();
 show(6);
}
function renderCollective(){
 const n=serverStats?serverStats.total:records.length;
 const paired=serverStats?serverStats.paired:records.length;
 const answeredIntentions=serverStats?serverStats.intentionAnswered:records.length;
 const changed=serverStats?serverStats.changed:records.filter(r=>r.before!==r.after).length;
 const carry=serverStats?serverStats.changeIntention:records.filter(r=>r.intention===0).length;
 $('totalRecords').textContent=n;$('changedRecords').textContent=paired?Math.round(changed/paired*100)+'%':'—';$('carryRecords').textContent=answeredIntentions?Math.round(carry/answeredIntentions*100)+'%':'—';$('heldRecords').textContent=paired?Math.round((paired-changed)/paired*100)+'%':'—';$('fieldCount').textContent='N = '+String(n).padStart(3,'0');$('fieldEmpty').hidden=records.length>0;
 $('legend').replaceChildren(...c().legend.map((value,i)=>{const span=text('span',i===1?'':value);if(i===1){const names={zh:['愿意改变','视情况','保持习惯'],en:['change','undecided','keep habit'],ko:['변화','미정','습관 유지']}[lang];['#809574','#8b96b6','#ba8065'].forEach((color,j)=>{const dot=text('i','','legend-dot');dot.style.background=color;span.append(dot,document.createTextNode(names[j]+'  '))})}return span}));$('fieldLabels').textContent=c().choiceLabels.join('     /     ');$('submissionNotice').textContent=notice?c()[notice]:'';$('dataNotice').textContent=dataNotice;
}
function download(data,name,mime){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:mime}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportData(format){
 if(!records.length){dataNotice=c().noRecords;renderCollective();return}
 const date=new Date().toISOString().slice(0,10);
 if(format==='json')download(JSON.stringify({schema:'tender-machine/v2',exportedAt:new Date().toISOString(),legend:{choice:['rebuke','correct','collaborate'],intention:['change','undecided','keep_habit'],metrics:'Scripted interaction parameters, not AI pain measurements'},records},null,2),'Machine_Sensorium_'+date+'.json','application/json');
 else{const head=['id','created_at','language','before','after','changed','future_intention','cards_opened','interaction_skipped','interaction_count','gentle_count','impatient_count','hostile_count','neutral_count','max_designed_load','mean_first_character_ms','duration_seconds'];const rows=records.map(r=>[r.id,r.createdAt,r.language,['rebuke','correct','collaborate'][r.before],['rebuke','correct','collaborate'][r.after],r.before!==r.after,['change','undecided','keep_habit'][r.intention],r.cardsOpened.join('|'),r.skipped,r.turns.length,...['kind','direct','hostile','neutral'].map(k=>r.turns.filter(a=>a.kind===k).length),Math.max(0,...r.turns.map(a=>a.load)),r.turns.length?Math.round(r.turns.reduce((n,a)=>n+a.latencyMs,0)/r.turns.length):'',r.durationSeconds]);const cell=value=>'"'+String(value).replace(/"/g,'""')+'"';download('\uFEFF'+[head,...rows].map(row=>row.map(cell).join(',')).join('\r\n'),'Machine_Sensorium_'+date+'.csv','text/csv;charset=utf-8')}
}
async function importData(file){
 try{if(!file||file.size>5*1024*1024)throw Error();const parsed=JSON.parse(await file.text());if(parsed.schema!=='tender-machine/v2'||!Array.isArray(parsed.records)||parsed.records.length>5000)throw Error();const clean=parsed.records.map(validRecord);if(clean.some(r=>!r))throw Error();const merged=new Map(records.map(r=>[r.id,r]));for(const record of clean)if(!merged.has(record.id))merged.set(record.id,record);if(merged.size>5000)throw Error();records=[...merged.values()];persist();dataNotice=c().importOk+(storageOK?'':' '+c().storageFail)}catch{dataNotice=c().importBad}finally{$('importFile').value='';renderCollective()}
}
// Participant navigation.
$('start').addEventListener('click',()=>{if(participant.completed)newSession();else show(1)});$('home').addEventListener('click',()=>routeTo('hub'));document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.back))));$('toLab').addEventListener('click',()=>show(3));$('toTransfer').addEventListener('click',()=>{if(participant.after!==null)show(5)});$('labNext').addEventListener('click',()=>{if(participant.turns.length&&!running&&!protectionActive)show(4)});$('skipLab').addEventListener('click',()=>{participant.skipped=participant.turns.length===0;resetLab();show(4)});$('contribute').addEventListener('click',()=>finish(true));$('decline').addEventListener('click',()=>finish(false));$('nextPerson').addEventListener('click',newSession);$('viewField').addEventListener('click',()=>show(6));$('locale').addEventListener('change',()=>{const previous=lang,newLang=$('locale').value;if(!COPY[newLang])return;if(running){epoch++;running=false;paused=false;$('send').disabled=false;$('pauseIndicator').classList.remove('visible');$('responseStatus').textContent='READY'}lang=newLang;for(const key of Object.keys(COPY[previous].examples))if($('message').value===COPY[previous].examples[key]){$('message').value=c().examples[key];break}renderLocale()});
$('message').addEventListener('input',preview);$('message').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();transmit()}});$('send').addEventListener('click',transmit);$('reset').addEventListener('click',resetLab);document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{$('message').value=c().examples[b.dataset.example];preview();$('message').focus()}));$('methodButton').addEventListener('click',()=>{const el=$('methodDetails');el.open=!el.open;if(el.open)el.scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest'})});$('exportJson').addEventListener('click',()=>exportData('json'));$('exportCsv').addEventListener('click',()=>exportData('csv'));$('importButton').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',()=>importData($('importFile').files[0]));
// Keep the collective trace as a separate 2D data visualization.
let faceView=null;
import('./face.js').then(module=>module.createFaceView()).then(view=>{faceView=view}).catch(error=>{console.error('Virtual face unavailable',error);document.querySelectorAll('.welcome-art,.organism').forEach(el=>el.dataset.face='unavailable')});
const surfaces=['collectiveCanvas'].map(id=>{const canvas=$(id),ctx=canvas.getContext('2d'),surface={id,canvas,ctx,w:0,h:0};new ResizeObserver(()=>{const b=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);surface.w=b.width;surface.h=b.height;canvas.width=b.width*ratio;canvas.height=b.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0)}).observe(canvas);return surface});
function hash(str){let n=0;for(let i=0;i<str.length;i++)n=(n*31+str.charCodeAt(i))|0;return(n>>>0)/4294967295}
function drawField(s){
 const {ctx,w,h}=s;if(!w||!h)return;ctx.clearRect(0,0,w,h);const n=records.length,pad=w<600?45:85,xs=[pad,(w/2),w-pad],top=h*.28,bottom=h*.74;
 ctx.strokeStyle='#9da88d33';ctx.lineWidth=1;for(const x of xs){ctx.beginPath();ctx.moveTo(x,55);ctx.lineTo(x,h-45);ctx.stroke()}
 ctx.font='9px Courier New';ctx.textAlign='center';ctx.fillStyle='#7e8d72';for(let i=0;i<3;i++){ctx.fillText(c().choiceLabels[i],xs[i],h-47)}
 if(!n)return;const tension=records.filter(r=>r.after===0).length/n;
 ctx.font='8px Courier New';for(let y=65;y<h-60;y+=11){for(let x=25;x<w-20;x+=10){const wave=Math.sin(x*.012+phase*.3)+Math.cos(y*.02-phase*.15),fracture=Math.sin(y*.13)>1-tension*.55;ctx.globalAlpha=.12+Math.max(0,wave)*.10;ctx.fillStyle=fracture?'#af8a72':'#96a080';ctx.fillText(fracture?'_':wave>.7?'+':'.',x+(fracture?Math.sin(y)*tension*15:0),y)}}ctx.globalAlpha=1;
 const colors=['#809574','#8b96b6','#ba8065'];ctx.lineWidth=n>150?.6:1.1;
 for(let i=0;i<n;i++){const r=records[i],seed=hash(r.id),jitter=(seed-.5)*Math.min(85,w*.1),x1=xs[r.before]+jitter,x2=xs[r.after]+jitter*.8,y1=top+(seed-.5)*25,y2=bottom+(seed-.5)*25;ctx.strokeStyle=colors[r.intention];ctx.globalAlpha=Math.max(.05,Math.min(.52,1.7/Math.sqrt(n)));ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(x1+(seed-.5)*w*.12,h*.45,x2-(seed-.5)*w*.12,h*.56,x2,y2);ctx.stroke();ctx.globalAlpha=n>100?.45:.8;ctx.fillStyle=colors[r.intention];ctx.beginPath();ctx.arc(x2,y2,n>300?1.1:2.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.5;ctx.fillStyle='#849477';ctx.fillRect(x1-1,y1-1,2,2)}ctx.globalAlpha=1;
 ctx.font='8px Courier New';ctx.textAlign='left';ctx.fillStyle='#7f8c74';ctx.fillText(lang==='zh'?'第一次选择':lang==='ko'?'처음 선택':'FIRST CHOICE',18,top-23);ctx.fillText(lang==='zh'?'再次选择':lang==='ko'?'다시 선택':'SECOND CHOICE',18,bottom+36);
}
function animate(now){
 requestAnimationFrame(animate);if(document.hidden||now-lastFrame<(reduced?220:33))return;lastFrame=now;
 if(!reduced)phase+=.03;
 faceView?.update({now,step:activeRoute==='activity'?step:-1,load,running,paused,protectionActive,recoveryReady,lastTone,reduced});
 if(activeRoute==='activity'&&step===6)for(const surface of surfaces)drawField(surface);
}

bindShell();renderLocale();routeTo('courses');requestAnimationFrame(animate);

})();
