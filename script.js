// Emoji dataset
const EMOJIS = [
  { char: "🎨", category:"art", name:"artist palette" },
  { char: "🏖️", category:"travel", name:"beach" },
  { char: "🚀", category:"tech", name:"rocket" },
  { char: "🥑", category:"food", name:"avocado" },
  { char: "📅", category:"objects", name:"calendar" },
  { char: "🍕", category:"food", name:"pizza" },
  { char: "🏄‍♂️", category:"travel", name:"surfing man" },
  { char: "🖌️", category:"art", name:"paintbrush" },
  { char: "💻", category:"tech", name:"laptop" },
  { char: "🧳", category:"travel", name:"luggage" },
  { char: "🍏", category:"food", name:"green apple" },
  { char: "📦", category:"objects", name:"box" }
];

const deck = document.querySelector('.emoji-deck');
const placeholders = document.querySelectorAll('.placeholder');
const searchBar = document.querySelector('.search-bar');
const catButtons = document.querySelectorAll('.cat-btn');
const homeworkBtn = document.querySelector('.homework-btn');
const timeDisplay = document.querySelector('.time-display');

let currentCategory = 'all';
let draggedEmoji = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentDroppable = null;

// Display emojis based on category & search
function displayEmojis() {
  deck.innerHTML = '';
  const query = searchBar.value.toLowerCase();
  const filtered = EMOJIS.filter(e => 
    (currentCategory === 'all' || e.category === currentCategory) &&
    e.name.toLowerCase().includes(query)
  );
  filtered.forEach(e => {
    const span = document.createElement('span');
    span.classList.add('emoji-item');
    span.textContent = e.char;
    span.setAttribute('data-emoji', e.char);
    span.setAttribute('role', 'listitem');
    span.setAttribute('tabindex', '0');
    span.setAttribute('aria-label', e.name);
    deck.appendChild(span);
  });
}

catButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.category;
    displayEmojis();
  });
});

searchBar.addEventListener('input', displayEmojis);

// Drag and drop
function onPointerDown(e) {
  const target = e.target.closest('.emoji-item');
  if (!target) return;

  e.preventDefault();
  draggedEmoji = target.cloneNode(true);
  draggedEmoji.classList.add('dragging');
  document.body.appendChild(draggedEmoji);

  const rect = target.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  moveAt(e.clientX, e.clientY);

  if (navigator.vibrate) navigator.vibrate(10);

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
}

function moveAt(x, y) {
  draggedEmoji.style.position = 'fixed';
  draggedEmoji.style.left = (x - dragOffsetX) + 'px';
  draggedEmoji.style.top = (y - dragOffsetY) + 'px';
  draggedEmoji.style.zIndex = 9999;
}

function onPointerMove(e) {
  if (!draggedEmoji) return;
  moveAt(e.clientX, e.clientY);

  let droppable = null;
  let closestDist = Infinity;

  placeholders.forEach(pl => {
    const rect = pl.getBoundingClientRect();
    const centerX = rect.left + rect.width/2;
    const centerY = rect.top + rect.height/2;
    const dx = (e.clientX - dragOffsetX) - centerX;
    const dy = (e.clientY - dragOffsetY) - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 150 && dist < closestDist) {
      closestDist = dist;
      droppable = pl;
    }
    pl.classList.toggle('highlight', droppable === pl);
  });

  currentDroppable = droppable;
}

function onPointerUp(e) {
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);

  if (currentDroppable && draggedEmoji) {
    // Snap animation
    const plRect = currentDroppable.getBoundingClientRect();
    const emojiRect = draggedEmoji.getBoundingClientRect();
    const finalX = (plRect.left + plRect.width/2) - (emojiRect.width/2);
    const finalY = (plRect.top + plRect.height/2) - (emojiRect.height/2);

    draggedEmoji.style.transition = 'transform 0.2s ease-out';
    draggedEmoji.style.transform = `translate(${finalX - emojiRect.left}px, ${finalY - emojiRect.top}px)`;

    draggedEmoji.addEventListener('transitionend', () => {
      currentDroppable.textContent = draggedEmoji.textContent;
      currentDroppable.classList.remove('highlight');
      currentDroppable.classList.remove('empty');
      currentDroppable.setAttribute('aria-label', 'Placeholder with ' + draggedEmoji.textContent);

      if (navigator.vibrate) navigator.vibrate(20);

      draggedEmoji.remove();
      draggedEmoji = null;
    }, { once:true });

  } else {
    if (draggedEmoji) draggedEmoji.remove();
    draggedEmoji = null;
  }

  placeholders.forEach(pl => pl.classList.remove('highlight'));
}

// Homework button toggle
homeworkBtn.addEventListener('click', () => {
  if (homeworkBtn.classList.contains('green')) {
    // Turn off (red)
    homeworkBtn.classList.remove('green');
    homeworkBtn.textContent = 'Homework';
  } else {
    // Turn on (green)
    homeworkBtn.classList.add('green');
    homeworkBtn.innerHTML = `<span class="thumbs-up">👍</span>Homework`;
  }
});

// Update time display every second
function updateTime() {
  const now = new Date();
  timeDisplay.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}
setInterval(updateTime, 1000);
updateTime();

// Initialize
displayEmojis();

// Prevent scrolling (should not be needed if layout fits exactly)
document.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive:false });
