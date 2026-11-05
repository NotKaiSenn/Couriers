// Page content lives here so artwork and copy can be replaced independently.
const features = [
  { title:'Travel the World', image:'f1-travel-the-world.jpg', text:'Ride the railway across a changing world. Explore bustling cities, quiet campsites, and forests full of unexpected discoveries.' },
  { title:'Fight or Fry', image:'f2-fight-or-fry.jpg', text:'John brings the frying pan. Sam brings the mysterious powers. Together, take on strange creatures and formidable bosses.' },
  { title:'Mix Things Up', image:'f3-mix-things-up.jpg', text:'Switch between two unlikely heroes. Combine their abilities to solve puzzles, find new paths, and make it through dangerous dungeons.' },
  { title:'Small Town Life', image:'f4-small-town-life.jpg', text:'Every stop has a story. Meet eccentric locals, find new friends, and discover the humour and heart of a world on the brink.' },
  { title:'Al Fresco Dining', image:'f5-alfresco-dining.jpg', text:'Gather ingredients on the road and let John work his magic. Cook up a little comfort, restore your strength, and get ready for the next adventure.' },
];
const characters = [
  { id:'john', name:'John', bio:'Quiet, dependable, and very handy with a frying pan. John has spent most of his life working in the mines beneath Potcrock Isle. Looking after Sam opens the door to a world he never knew existed.', food:'Oyakodon', likes:'Cooking', dislikes:'Small talk' },
  { id:'sam', name:'Sam', bio:'A curious girl with an enormous heart and extraordinary abilities. Found deep underground by John, Sam dreams of the world above. Her courage and endless questions keep their journey moving.', food:'John’s cooking', likes:'Playing Earth Born', dislikes:'Slimes' },
  { id:'alva', name:'Alva', bio:'New Dam City’s inventive young engineer. Alva traded a comfortable life for a laboratory, where she works with Isabel to build things that make life better for everyone around her.', food:'Curry', likes:'Isabel, inventions', dislikes:'Gambling, smoking' },
  { id:'solomon', name:'Solomon', bio:'Small in stature, impossible to ignore. Behind Solomon’s theatrical manner lies a troubling connection to the forces threatening humanity. His role in John and Sam’s adventure is anything but ordinary.', food:'Food rations', likes:'Dancing, destruction', dislikes:'Being out of the spotlight' },
];
const reviews = [
  { quote:'“Who knew you could have so much fun with a frying pan?”', source:'9/10 – DualShockers' },
  { quote:'“This engrossing indie action-RPG is a knockout”', source:'10/10 – Screen Rant' },
  { quote:'“Clever, vibrant, and unapologetically original”', source:'9/10 – The Gamer' },
];
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// A repeatable, stepped paper edge on a whole-pixel grid; no image asset.
const paperHeader = $('.site-header');
function updatePaperEdge() {
  const width = paperHeader.clientWidth;
  const style = getComputedStyle(paperHeader);
  const pixel = Number(style.getPropertyValue('--paper-pixel')) || 4;
  const base = Number(style.getPropertyValue('--paper-base')) || 72;
  const depths = [1,2,2,1,0,1,3,2,1,1,0,2,3,1,2,0,1,2,1,3,2,1,0];
  const runs = [4,2,5,3,2,4,2,3,5,2,3,4,2,5,3,2,4];
  const points = ['0px 0px', `0px ${base + depths[0] * pixel}px`];
  let x = 0;
  let step = 0;
  while (x < width) {
    const y = base + depths[step % depths.length] * pixel;
    points.push(`${x}px ${y}px`);
    x = Math.min(width, x + runs[step % runs.length] * pixel);
    points.push(`${x}px ${y}px`);
    step++;
  }
  points.push(`${width}px 0px`);
  paperHeader.style.setProperty('--paper-edge', `polygon(${points.join(',')})`);
}
updatePaperEdge();
new ResizeObserver(updatePaperEdge).observe(paperHeader);

// Scroll-driven collage. Update only on scroll, and respect reduced motion.
let scrollQueued = false;
function updateScene() {
  const hero = $('.hero');
  const travel = Math.max(1, hero.offsetHeight - innerHeight);
  const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, scrollY / travel));
  hero.style.setProperty('--progress', progress.toFixed(4));
  scrollQueued = false;
}
addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScene); }
}, { passive:true });
addEventListener('resize', updateScene);
updateScene();

// Mobile navigation.
$('.menu-toggle').addEventListener('click', () => {
  const open = $('.menu-toggle').getAttribute('aria-expanded') !== 'true';
  $('.menu-toggle').setAttribute('aria-expanded', open);
  $('.menu-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  $('#main-nav').classList.toggle('open', open);
});
$$('#main-nav a').forEach(link => link.addEventListener('click', () => {
  $('#main-nav').classList.remove('open');
  $('.menu-toggle').setAttribute('aria-expanded', false);
  $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    $('#main-nav').classList.remove('open');
    $('.menu-toggle').setAttribute('aria-expanded', false);
  }
});

// Accessible dialogs restore focus and stop embedded media when closed.
let dialogTrigger;
function openDialog(dialog, trigger) {
  dialogTrigger = trigger || document.activeElement;
  document.body.classList.add('modal-open');
  dialog.showModal();
}
$$('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (dialog.id === 'media-dialog') $('#media-content').replaceChildren();
    dialogTrigger?.focus({ preventScroll:true });
  });
});

const mediaDialog = $('#media-dialog');
// Native horizontal scrolling supports mouse, touch, and keyboard.
const track = $('#feature-track');
features.forEach((feature, index) => {
  const card = document.createElement('button');
  card.className = 'feature-card';
  card.setAttribute('aria-label', `Explore ${feature.title}`);
  card.innerHTML = `<span class="feature-image"><img src="./assets/screenshots/${feature.image}" alt="${feature.title} gameplay" loading="lazy"><span class="feature-plus" aria-hidden="true">+</span></span><span class="feature-title">${feature.title}</span>`;
  card.addEventListener('click', () => { showFeature(index); openDialog(mediaDialog, card); });
  track.append(card);
});
let featureIndex = 0;
function showFeature(index) {
  featureIndex = (index + features.length) % features.length;
  const feature = features[featureIndex];
  $('#media-content').innerHTML = `<img class="media-image" src="./assets/screenshots/${feature.image}" alt="${feature.title} gameplay"><div class="media-description"><div><h2 id="media-title">${feature.title}</h2><p>${feature.text}</p></div><div class="modal-arrows"><button class="square-button" data-feature-prev aria-label="Previous feature">←</button><button class="square-button" data-feature-next aria-label="Next feature">→</button></div></div>`;
  $('[data-feature-prev]').addEventListener('click', () => { showFeature(featureIndex - 1); $('[data-feature-prev]').focus(); });
  $('[data-feature-next]').addEventListener('click', () => { showFeature(featureIndex + 1); $('[data-feature-next]').focus(); });
}
function scrollFeatures(direction) { track.scrollBy({ left:direction * (track.firstElementChild.offsetWidth + parseFloat(getComputedStyle(track).gap)), behavior:reducedMotion.matches ? 'instant' : 'smooth' }); }
$('#features-prev').addEventListener('click', () => scrollFeatures(-1));
$('#features-next').addEventListener('click', () => scrollFeatures(1));
function updateFeatureControls() {
  $('#features-prev').disabled = track.scrollLeft < 5;
  $('#features-next').disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
  const step = track.firstElementChild.offsetWidth + parseFloat(getComputedStyle(track).gap);
  $('#feature-count').textContent = `${String(Math.min(5, Math.round(track.scrollLeft / step) + 1)).padStart(2,'0')} / 05`;
}
track.addEventListener('scroll', updateFeatureControls, { passive:true });
addEventListener('resize', updateFeatureControls);
updateFeatureControls();
mediaDialog.addEventListener('keydown', event => {
  if (!$('.media-image')) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showFeature(featureIndex + (event.key === 'ArrowRight' ? 1 : -1)); $('.dialog-close').focus(); }
});

// Character tabs with roving focus and arrow-key selection.
characters.forEach((character, index) => {
  const tab = document.createElement('button');
  tab.id = `tab-${character.id}`;
  tab.role = 'tab';
  tab.setAttribute('aria-controls', 'cast-bio');
  tab.setAttribute('aria-label', character.name);
  tab.innerHTML = `<img src="./assets/img/characters/${character.id}.png" alt="${character.name}" loading="lazy">`;
  tab.addEventListener('click', () => selectCharacter(index));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = (index + 1) % characters.length;
    if (event.key === 'ArrowLeft') target = (index + characters.length - 1) % characters.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = characters.length - 1;
    if (target !== undefined) { event.preventDefault(); selectCharacter(target); $(`#tab-${characters[target].id}`).focus(); }
  });
  $('.cast-portraits').append(tab);
});
function selectCharacter(index) {
  characters.forEach((character, i) => {
    const tab = $(`#tab-${character.id}`);
    tab.setAttribute('aria-selected', i === index);
    tab.tabIndex = i === index ? 0 : -1;
    tab.querySelector('img').src = `./assets/img/characters/${character.id}${i === index ? '_2' : ''}.png`;
  });
  const character = characters[index];
  $('#cast-bio').setAttribute('aria-labelledby', `tab-${character.id}`);
  $('#cast-bio').innerHTML = `<div><h3>${character.name}</h3><p>${character.bio}</p></div><dl><div><dt>Favourite food</dt><dd>${character.food}</dd></div><div><dt>Likes</dt><dd>${character.likes}</dd></div><div><dt>Dislikes</dt><dd>${character.dislikes}</dd></div></dl>`;
}
selectCharacter(0);

$$('[data-review]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.review);
  $('.reviews blockquote').textContent = reviews[index].quote;
  $('.review-inner>p').textContent = reviews[index].source;
  $$('[data-review]').forEach((dot, i) => { dot.classList.toggle('active', index === i); dot.setAttribute('aria-pressed', index === i); });
}));

// Small browser-local Pixball collection; no account or remote data required.
const monsterFiles = ['earthborn-big.png','monster-2.png','monster-3.png','monster-4.png','monster-5.png'];
let collection = [];
try { const stored = JSON.parse(localStorage.getItem('eastward-study-pixball') || '[]'); if (Array.isArray(stored)) collection = [...new Set(stored.filter(i => Number.isInteger(i) && i >= 0 && i < 5))]; } catch { /* Storage is optional. */ }
function renderCollection() {
  $('#gacha-count').textContent = `${collection.length} / 5 discovered${collection.length === 5 ? ' — Collection complete!' : ''}`;
  $('#gacha-collection').innerHTML = collection.map(i => `<img src="./assets/img/gachapon/monsters/${monsterFiles[i]}" alt="Collected monster ${i+1}">`).join('');
}
$('.gacha-trigger').addEventListener('click', event => { renderCollection(); openDialog($('#gacha-dialog'), event.currentTarget); });
$('#gacha-spin').addEventListener('click', () => {
  const button = $('#gacha-spin');
  button.disabled = true;
  $('.gacha-stage').classList.add('spinning');
  setTimeout(() => {
    const missing = monsterFiles.map((_,i) => i).filter(i => !collection.includes(i));
    const pool = missing.length ? missing : monsterFiles.map((_,i) => i);
    const index = pool[Math.floor(Math.random() * pool.length)];
    if (!collection.includes(index)) collection.push(index);
    try { localStorage.setItem('eastward-study-pixball', JSON.stringify(collection)); } catch { /* Continue without persistence. */ }
    $('#gacha-result').innerHTML = `<img src="./assets/img/gachapon/monsters/${monsterFiles[index]}" alt="You found monster ${index+1}!">`;
    $('.gacha-stage').classList.remove('spinning');
    renderCollection();
    button.disabled = false;
  }, reducedMotion.matches ? 0 : 500);
});
