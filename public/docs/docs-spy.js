(function(){
  var me = document.currentScript;
  var raw = (me && me.getAttribute('data-ids')) || '';
  var ids = raw.split(',').map(function(s){return s.trim();}).filter(Boolean);
  if(!ids.length) return;

  var tocLinks = {}, jumpLinks = {};
  ids.forEach(function(id){
    tocLinks[id]  = document.querySelector('.toc a[data-toc="'+id+'"]');
    jumpLinks[id] = document.querySelector('.jump a[data-jump="'+id+'"]');
  });

  function setActive(id){
    ids.forEach(function(k){
      var on = k === id;
      if(tocLinks[k])  tocLinks[k].classList.toggle('active', on);
      if(jumpLinks[k]) jumpLinks[k].classList.toggle('active', on);
    });
  }

  var sections = ids.map(function(id){ return document.getElementById(id); });
  function onScroll(){
    var line = 140;
    var current = ids[0];
    for(var i=0;i<sections.length;i++){
      if(!sections[i]) continue;
      var rect = sections[i].getBoundingClientRect();
      if(rect.top - line <= 0) current = ids[i];
    }
    if(window.innerHeight + window.scrollY >= document.body.scrollHeight - 4){
      current = ids[ids.length-1];
    }
    setActive(current);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  onScroll();

  ids.forEach(function(id){
    [tocLinks[id], jumpLinks[id]].forEach(function(a){
      if(!a) return;
      a.addEventListener('click', function(){ setTimeout(function(){ setActive(id); }, 60); });
    });
  });
})();
