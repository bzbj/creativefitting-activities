(() => {
  'use strict';
  const entries = window.PR_ACTIVITIES;
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.querySelector('span').textContent = String(entries.filter(item => button.dataset.filter === 'all' || item.phase === button.dataset.filter).length).padStart(2,'0');
  });
  const rail = document.getElementById('activityRail');
  const dialog = document.getElementById('activityLightbox');
  let filter = 'all', descending = true, activeAlbum = null, photoIndex = 0;
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const art = item => {
    const fields = {wan:['发布摘要','Wan3.0','从模型能力，到生产实践','CREATIVEFITTING × ALIBABA CLOUD'],hundred:['活动预告 · 开营礼','100h','城市情书，创见未来','SHANGHAI · 152 组报名'],stripe:['活动预告 · 邀约已收到','stripe','Tour Shanghai','22—23 SEPTEMBER 2026']}[item.art];
    return `<div class="activity-art art-${item.art}" role="img" aria-label="${escape(fields.join(' · '))}"><span class="art-label">${fields[0]}</span><strong>${fields[1]}</strong><p>${fields[2]}</p><span class="art-footer">${fields[3]}</span></div>`;
  };
  function render() {
    const visible = entries.filter(x => filter === 'all' || x.phase === filter).sort((a,b) => descending ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    let month = '', boundaryShown = false;
    rail.innerHTML = visible.map((item, i) => {
      let prefix = '';
      if (item.date.slice(0,7) !== month) {month=item.date.slice(0,7); prefix+=`<div class="activity-month"><strong>${month.slice(5)}</strong><span>${month.slice(0,4)} / ${months[Number(month.slice(5))-1]}</span></div>`;}
      if (filter==='all' && i>0 && item.phase !== visible[i-1].phase && !boundaryShown) {prefix+='<div class="activity-now">2026.09.16 · '+(descending?'回看已经发生的故事':'接下来，新的相遇')+'</div>';boundaryShown=true;}
      const p=item.photos[0];
      const cover=p?`<button type="button" class="activity-cover${p.presentation ? ` presentation-${p.presentation}` : ''}" data-album="${item.id}" aria-label="查看${escape(item.title.replace(/\n/g,' '))}相册，共${item.photos.length}张"><span class="activity-image-window"><img src="${escape(p.src)}" alt="${escape(p.caption)}" class="fit-${p.fit}" loading="${i<2?'eager':'lazy'}" decoding="async"/></span><span class="activity-category">${item.kind}</span><span class="activity-image-count">${String(item.photos.length).padStart(2,'0')} 张图片 ↗</span></button>`:art(item);
      return prefix+`<article class="activity-entry ${i%2?'is-right':''} ${item.phase==='upcoming'?'is-upcoming':''}" data-event="${item.id}" data-date="${item.date}"><div class="activity-date"><strong>${item.dateLabel}</strong><small>${item.period}</small></div><div class="activity-card">${cover}<div class="activity-body"><div class="activity-cardline"><span class="activity-status">${item.status}</span><span class="activity-number">${String(entries.findIndex(x=>x.id===item.id)+1).padStart(2,'0')} / ${item.kind}</span></div><h3>${escape(item.title).replace(/\n/g,'<br>')}</h3><details class="activity-details"><summary>活动摘要</summary><p>${escape(item.summary)}</p></details><div class="activity-cardfoot"><small>${escape(item.place)}</small>${item.source ? `<a href="${escape(item.source)}" target="_blank" rel="noopener noreferrer">相关链接 ↗</a>` : ""}</div></div></div></article>`;
    }).join('');
    document.getElementById('activityResult').textContent = `${String(visible.length).padStart(2,'0')} 项记录 / ${descending?'由近及远':'沿时间向前'}`;
    document.getElementById('activitySort').textContent = descending?'日期降序 ↑':'日期升序 ↓';
    rail.querySelectorAll('[data-album]').forEach(b => b.addEventListener('click', () => openAlbum(b.dataset.album)));
  }
  function updatePhoto() {
    const p=activeAlbum.photos[photoIndex];
    const img=document.getElementById('lightboxImage'); img.src=p.src;img.alt=p.caption;
    document.getElementById('lightboxCaption').textContent=`${photoIndex+1} / ${activeAlbum.photos.length} · ${p.caption}`;
    document.getElementById('lightboxOriginal').href=p.src;
    document.getElementById('lightboxPrev').disabled=photoIndex===0;
    document.getElementById('lightboxNext').disabled=photoIndex===activeAlbum.photos.length-1;
  }
  function openAlbum(id) {activeAlbum=entries.find(x=>x.id===id);photoIndex=0;document.getElementById('lightboxTitle').textContent=activeAlbum.title.replace(/\n/g,' · ');updatePhoto();dialog.showModal();document.getElementById('lightboxClose').focus();}
  function shiftPhoto(step){if(!activeAlbum)return;photoIndex=Math.max(0,Math.min(activeAlbum.photos.length-1,photoIndex+step));updatePhoto();}
  document.getElementById('lightboxClose').addEventListener('click',()=>dialog.close());
  document.getElementById('lightboxPrev').addEventListener('click',()=>shiftPhoto(-1));
  document.getElementById('lightboxNext').addEventListener('click',()=>shiftPhoto(1));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();shiftPhoto(1);}if(e.key==='ArrowLeft'){e.preventDefault();shiftPhoto(-1);}});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
  document.getElementById('activitySort').addEventListener('click',()=>{descending=!descending;render();});
  // Old dashboard bookmarks resolve to the single activity page.
  if (location.hash && location.hash !== '#activity') history.replaceState(null, '', '#activity');
  render();
})();
