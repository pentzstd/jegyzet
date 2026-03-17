const canvas = document.getElementById("canvas");
let activeElement = null;
let isPanning = false; // Ha a hátteret húzzuk

let offset = { x: 0, y: 0 };
let pan = { x: 0, y: 0 }; // A "kamera" pozíciója

document.addEventListener('mousedown', (e) => {
  if (e.button === 1) {
    e.preventDefault();
    const targetNote = e.target.closest('.note');

    if (targetNote) {
      activeElement = targetNote;
      // Itt figyelembe kell venni a pan (kamera) eltolását is!
      offset.x = e.clientX - targetNote.offsetLeft;
      offset.y = e.clientY - targetNote.offsetTop;
    } else {
      // Ha nem jegyzetet fogtunk meg, akkor a hátteret (pan)
      isPanning = true;
      offset.x = e.clientX - pan.x;
      offset.y = e.clientY - pan.y;
    }
  }
});

document.addEventListener('mousemove', (e) => {
  if (activeElement) {
    activeElement.style.left = `${e.clientX - offset.x}px`;
    activeElement.style.top = `${e.clientY - offset.y}px`;
  } else if (isPanning) {
    pan.x = e.clientX - offset.x;
    pan.y = e.clientY - offset.y;
    // Transformmal sokkal simább a végtelenített mozgatás
    canvas.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
  }
});

document.addEventListener('mouseup', () => {
  activeElement = null;
  isPanning = false;
});