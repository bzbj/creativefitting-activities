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
  const previewIndexes = new Map();
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const art = item => {
    const fields = {wan:['发布摘要','Wan3.0','从模型能力，到生产实践','CREATIVEFITTING × ALIBABA CLOUD'],hundred:['活动预告 · 开营礼','100h','城市情书，创见未来','SHANGHAI · 152 组报名'],stripe:['活动预告 · 邀约已收到','stripe','Tour Shanghai','22—23 SEPTEMBER 2026']}[item.art];
    return `<div class="activity-art art-${item.art}" role="img" aria-label="${escape(fields.join(' · '))}"><span class="art-label">${fields[0]}</span><strong>${fields[1]}</strong><p>${fields[2]}</p><span class="art-footer">${fields[3]}</span></div>`;
  };
  // Keep dates in order while allowing adjacent cards to overlap vertically.
  let layoutFrame = 0;
  function scheduleLayout() {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(layoutTimeline);
  }
  function layoutTimeline() {
    const children = [...rail.children];
    const desktop = window.matchMedia('(min-width:651px)').matches;
    rail.classList.toggle('is-positioned', desktop);
    if (!desktop) {
      rail.style.height = '';
      children.forEach(el => el.style.top = '');
      return;
    }
    const heights = children.map(el => el.offsetHeight);
    let bottom = [0, 0], lastTop = 0, lastHeight = 0, groupStart = 0, first = true;
    children.forEach((el, i) => {
      const h = heights[i];
      let y;
      if (!el.classList.contains('activity-entry')) {
        y = Math.max(...bottom) + 24;
        groupStart = y + h + 24;
        bottom = [groupStart, groupStart];
        first = true;
      } else {
        const side = el.classList.contains('is-right') ? 1 : 0;
        y = first ? groupStart : Math.max(bottom[side], lastTop + Math.min(220, lastHeight * .38));
        bottom[side] = y + h + 28;
        lastTop = y;
        lastHeight = h;
        first = false;
      }
      el.style.top = `${Math.round(y)}px`;
    });
    rail.style.height = `${Math.max(...bottom) + 24}px`;
  }
  const sizeObserver = new ResizeObserver(scheduleLayout);
  window.addEventListener('resize', scheduleLayout);
  function render() {
    const visible = entries.filter(x => filter === 'all' || x.phase === filter).sort((a,b) => descending ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
    let month = '', boundaryShown = false;
    sizeObserver.disconnect();
    rail.innerHTML = visible.map((item, i) => {
      let prefix = '';
      if (item.date.slice(0,7) !== month) {month=item.date.slice(0,7); prefix+=`<div class="activity-month"><strong>${month.slice(5)}</strong><span>${month.slice(0,4)} / ${months[Number(month.slice(5))-1]}</span></div>`;}
      if (filter==='all' && i>0 && item.phase !== visible[i-1].phase && !boundaryShown) {prefix+='<div class="activity-now">'+(descending?'回看已经发生的故事':'接下来，新的相遇')+'</div>';boundaryShown=true;}
      const previewIndex=previewIndexes.get(item.id) || 0;
      const p=item.photos[previewIndex];
      const cover=p?`<div class="activity-media" data-preview="${item.id}"><button type="button" class="activity-cover${p.presentation ? ` presentation-${p.presentation}` : ''}" data-album="${item.id}" aria-label="放大查看${escape(item.title.replace(/\n/g,' '))}第${previewIndex+1}张图片，共${item.photos.length}张"><span class="activity-image-window"><img src="${escape(p.src)}" alt="${escape(p.caption)}" class="fit-${p.fit}" loading="${i<2?'eager':'lazy'}" decoding="async"/></span><span class="activity-category">${item.kind}</span><span class="activity-image-count" aria-live="polite">${String(previewIndex+1).padStart(2,'0')} / ${String(item.photos.length).padStart(2,'0')} 张图片 ↗</span></button>${item.photos.length>1?`<button type="button" class="activity-preview-arrow is-prev" data-preview-step="-1" aria-label="上一张图片">←</button><button type="button" class="activity-preview-arrow is-next" data-preview-step="1" aria-label="下一张图片">→</button>`:''}</div>`:art(item);
      return prefix+`<article class="activity-entry ${i%2?'is-right':''} ${item.phase==='upcoming'?'is-upcoming':''}" data-event="${item.id}" data-date="${item.date}"><div class="activity-date"><strong>${item.dateLabel}</strong><small>${item.period}</small></div><div class="activity-card">${cover}<div class="activity-body"><div class="activity-cardline"><span class="activity-status">${item.status}</span><span class="activity-number">${String(entries.findIndex(x=>x.id===item.id)+1).padStart(2,'0')} / ${item.kind}</span></div><h3>${escape(item.title).replace(/\n/g,'<br>')}</h3><p>${escape(item.summary)}</p><div class="activity-cardfoot"><small>${escape(item.place)}</small>${item.source ? `<a href="${escape(item.source)}" target="_blank" rel="noopener noreferrer">相关链接 ↗</a>` : ""}</div></div></div></article>`;
    }).join('');
    document.getElementById('activityResult').textContent = `${String(visible.length).padStart(2,'0')} 项记录 / ${descending?'由近及远':'沿时间向前'}`;
    document.getElementById('activitySort').textContent = descending?'日期降序 ↑':'日期升序 ↓';
    [...rail.children].forEach(el => sizeObserver.observe(el));
    scheduleLayout();
    rail.querySelectorAll('[data-album]').forEach(b => b.addEventListener('click', () => openAlbum(b.dataset.album)));
    rail.querySelectorAll('[data-preview-step]').forEach(b => b.addEventListener('click', () => shiftPreview(b.closest('[data-preview]'), Number(b.dataset.previewStep))));
  }
  function shiftPreview(media, step) {
    const item=entries.find(x=>x.id===media.dataset.preview);
    const next=((previewIndexes.get(item.id) || 0)+step+item.photos.length)%item.photos.length;
    previewIndexes.set(item.id,next);
    const p=item.photos[next], button=media.querySelector('.activity-cover'), img=button.querySelector('img');
    button.className=`activity-cover${p.presentation ? ` presentation-${p.presentation}` : ''}`;
    button.setAttribute('aria-label',`放大查看${item.title.replace(/\n/g,' ')}第${next+1}张图片，共${item.photos.length}张`);
    img.className=`fit-${p.fit}`;
    img.alt=p.caption;
    img.src=p.src;
    button.querySelector('.activity-image-count').textContent=`${String(next+1).padStart(2,'0')} / ${String(item.photos.length).padStart(2,'0')} 张图片 ↗`;
    scheduleLayout();
  }
  rail.addEventListener('keydown',e=>{
    if (dialog.open || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    const media=e.target.closest('[data-preview]');
    if (!media || !media.querySelector('[data-preview-step]')) return;
    e.preventDefault();
    shiftPreview(media,e.key==='ArrowRight'?1:-1);
  });
  function updatePhoto() {
    const p=activeAlbum.photos[photoIndex];
    const img=document.getElementById('lightboxImage'); img.src=p.src;img.alt=p.caption;
    document.getElementById('lightboxCaption').textContent=`${photoIndex+1} / ${activeAlbum.photos.length} · ${p.caption}`;
    document.getElementById('lightboxOriginal').href=p.src;
    document.getElementById('lightboxPrev').disabled=photoIndex===0;
    document.getElementById('lightboxNext').disabled=photoIndex===activeAlbum.photos.length-1;
  }
  function openAlbum(id) {activeAlbum=entries.find(x=>x.id===id);photoIndex=previewIndexes.get(id) || 0;document.getElementById('lightboxTitle').textContent=activeAlbum.title.replace(/\n/g,' · ');updatePhoto();dialog.showModal();document.getElementById('lightboxClose').focus();}
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
