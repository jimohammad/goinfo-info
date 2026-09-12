(() => {
  'use strict';
  const D = window.REPORT_DATA, R = window.RESEARCH, $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = v => Number(String(v).replace(/[^0-9]/g,''));
  const read = (k,f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
  const write = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); return true; } catch { return false; } };
  let savedValue = read('china-ev-shortlist',[]);
  const saved = new Set(Array.isArray(savedValue) ? savedValue.filter(id => D.programs.some(p => p.rank === id)) : []), selected = new Set();
  let filter = 'all', toastTimer;
  const toast = text => { $('toast').textContent=text; $('toast').style.display='block'; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').style.display='none',3500); };
  const theme = read('china-ev-theme','dark');
  const setTheme = t => { document.documentElement.dataset.theme=t; $('theme').setAttribute('aria-label',`Switch to ${t==='dark'?'light':'dark'} theme`); document.querySelector('meta[name="theme-color"]').content=t==='dark'?'#0c1415':'#f3f5ef'; };
  setTheme(theme==='light'?'light':'dark');
  $('theme').onclick=()=>{ const t=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(t);write('china-ev-theme',t); };
  function render() {
    const query=$('search').value.trim().toLowerCase();
    const list=D.programs.filter(p=>(!query || [p.institution,p.program,p.city,p.ev,p.career,p.scholarship].join(' ').toLowerCase().includes(query)) && (filter==='all'||filter==='english'&&p.englishVerified||filter==='vocational'&&/vocational/i.test(p.qualification)||filter==='conditional'&&p.tier==='conditional'||filter==='saved'&&saved.has(p.rank)));
    list.sort((a,b)=>$('sort').value==='cost'?number(a.annualTotalRmb)-number(b.annualTotalRmb):$('sort').value==='score'?b.score-a.score:a.rank-b.rank);
    $('count').textContent=`${list.length} of ${D.programs.length} programs · Annual costs in RMB`;
    $('empty').hidden=!!list.length; $('saved-count').textContent=saved.size;
    $('cards').innerHTML=list.map(p=>`<article class="program"><div class="program-top"><span>#${String(p.rank).padStart(2,'0')} / ${esc(p.city)}</span><button class="save" data-save="${p.rank}" aria-pressed="${saved.has(p.rank)}" aria-label="${saved.has(p.rank)?'Unsave':'Save'} ${esc(p.institution+' '+p.program)}">${saved.has(p.rank)?'Saved ✓':'+ Save'}</button></div><h3>${esc(p.program)}</h3><p class="institution">${esc(p.institution)}</p><div class="badges"><span class="badge ${p.rank>=9?'warn':''}">${p.rank===9?'Older English listing':p.englishVerified?'English listed':'Language / access condition'}</span><span class="badge">${esc(p.duration)}</span></div><div class="price"><div><small>EST. ANNUAL TOTAL</small><strong>¥${number(p.annualTotalRmb).toLocaleString('en-US')}</strong></div><div><small>RESEARCH SCORE</small><strong class="score">${p.score}<small style="display:inline"> / 100</small></strong></div></div><p class="source-status">${esc(p.source)}</p><div class="card-actions"><label><input type="checkbox" data-compare="${p.rank}" ${selected.has(p.rank)?'checked':''} aria-label="Compare ${esc(p.institution+' '+p.program)}">Compare</label><button class="details-button" data-detail="${p.rank}">View details ↗</button></div></article>`).join('');
  }
  const fields=[['institution','University'],['city','City'],['qualification','Qualification'],['duration','Duration'],['language','Teaching language'],['englishReqs','English requirements'],['grade12','Grade 12 / admission'],['tuitionRmb','Annual tuition · RMB'],['annualTotalRmb','Estimated annual total · RMB'],['practical','Practical training'],['ev','EV content'],['industry','Industry links'],['scholarship','Scholarships'],['career','Career fit'],['source','Evidence status']];
  function value(p,key) { if(p[key]==='Same as above') return D.programs[p.rank===2?0:6][key]; return p[key]; }
  function open(title,html) { $('modal-title').textContent=title; $('modal-content').innerHTML=html; $('modal').showModal(); }
  function detail(id) {
    const p=D.programs.find(p=>p.rank===id);
    const refs=({1:[1,2],2:[1,2],3:[3,8],4:[1,2],5:[17],6:[6,18],7:[4],8:[4],9:[19],10:[5],12:[20,21],14:[22,23]})[id]||[];
    open(p.program,`<p>${esc(p.institution)} · Research rank #${p.rank} · Assessment ${p.score}/100</p><dl>${fields.map(([k,t])=>`<dt>${t}</dt><dd>${esc(value(p,k))}</dd>`).join('')}</dl>${id===3?'<p><strong>Graduation condition:</strong> The report states HSK 4 with at least 180 points is required, even for this English track.</p>':''}<p class="muted">Fees and admissions reflect the supplied research snapshot. Industry partnerships do not guarantee an internship. Confirm the exact 2027 program before applying.</p><div class="sources">${refs.map(n=>R.sources[n-1]).filter(Boolean).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}</div>`);
  }
  $('cards').onclick=e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.detail)detail(Number(b.dataset.detail));
    if(b.dataset.save){ const id=Number(b.dataset.save);saved.has(id)?saved.delete(id):saved.add(id);const ok=write('china-ev-shortlist',[...saved]);render(); const replacement=document.querySelector(`[data-save="${id}"]`); (replacement||$('search')).focus(); if(!ok)toast('Saved for this session. Browser storage is unavailable.'); }
  };
  function syncCompare(){ $('compare-count').textContent=`${selected.size} selected`; $('compare-button').disabled=selected.size<2; }
  $('cards').onchange=e=>{if(!e.target.dataset.compare)return;const id=Number(e.target.dataset.compare);if(e.target.checked){if(selected.size===3){e.target.checked=false;toast('Choose up to 3 programs. Remove one to add another.');return;}selected.add(id);}else selected.delete(id);syncCompare();};
  $('compare-button').onclick=()=>{const programs=[...selected].map(id=>D.programs.find(p=>p.rank===id));open('Your programs, side by side',`<p class="muted">Annual totals are planning estimates. Scroll horizontally to compare all columns on a small screen.</p><div class="table-scroll"><table><thead><tr><th scope="col">Compare</th>${programs.map(p=>`<th scope="col">${esc(p.program)}<br>${esc(p.institution)}</th>`).join('')}</tr></thead><tbody>${fields.map(([k,t])=>`<tr><th scope="row">${t}</th>${programs.map(p=>`<td>${esc(value(p,k))}</td>`).join('')}</tr>`).join('')}<tr><th scope="row">Additional condition</th>${programs.map(p=>`<td>${p.rank===3?'HSK 4, at least 180 points, by graduation.':'Confirm exact 2027 admission and fee details.'}</td>`).join('')}</tr></tbody></table></div>`);};
  $('clear-compare').onclick=()=>{selected.clear();syncCompare();render();};
  $('spotlight').onclick=()=>detail(1);$('close-modal').onclick=()=>$('modal').close();
  $('modal').onclick=e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('modal').close();}};
  document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));render();});
  $('search').oninput=render;$('sort').onchange=render;
  $('reset').onclick=()=>{$('search').value='';$('sort').value='rank';document.querySelector('[data-filter="all"]').click();};
  $('budget-program').innerHTML=D.programs.map(p=>`<option value="${p.rank}">${esc(p.institution+' · '+p.program)}</option>`).join('');
  function budget(){const p=D.programs.find(p=>p.rank===Number($('budget-program').value)),base=number(p.annualTotalRmb),buffer=Number($('buffer').value),currency=$('currency').value,rate=currency==='KWD'?D.fx.rmbToKwd:currency==='USD'?D.fx.rmbToUsd:1;const money=v=>`${currency} ${(v*rate).toLocaleString('en-US',{maximumFractionDigits:currency==='KWD'?1:0})}`;$('buffer-label').textContent=buffer+'%';$('budget-total').textContent=money(base*(1+buffer/100));$('breakdown').innerHTML=`<span>Report estimate<br><strong>${money(base)}</strong></span><span>Your buffer<br><strong>${money(base*buffer/100)}</strong></span>`;$('budget-note').textContent=`Source estimate: ${p.annualTotalRmb} RMB/year. ${p.source}. ${p.rank>=11?'Tuition is unverified; this is a rough planning estimate. ':''}Language preparation or additional study years are not included.`;}
  ['budget-program','currency','buffer'].forEach(id=>$(id).addEventListener('input',budget));
  const titles={paths:'path',cities:'city',scholarships:'institution',scoring:'category'};
  function insights(topic){$('insight-content').innerHTML=D[topic].map(x=>`<article class="insight"><h3>${esc(x[titles[topic]])}</h3>${Object.entries(x).filter(([k])=>k!==titles[topic]).map(([k,v])=>`<p><strong>${esc(({bestFor:'Best for',how:'Assessment',score:'Research score / 100'})[k]||k.charAt(0).toUpperCase()+k.slice(1))}:</strong> ${esc(v)}</p>`).join('')}</article>`).join('');}
  document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-topic]').forEach(x=>x.setAttribute('aria-pressed',x===b));insights(b.dataset.topic);});
  const renderBlock=b=>b.type==='table'?`<div class="table-scroll"><table><thead><tr>${(b.rows[0]||[]).map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${b.rows.slice(1).map(row=>`<tr>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<p>${esc(b.text)}</p>`;
  $('report-sections').innerHTML=R.sections.map(s=>`<details><summary>${esc(s.title)}</summary>${s.blocks.map(renderBlock).join('')}</details>`).join('');
  $('sources').innerHTML=R.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('');
  render();budget();insights('paths');
})();
