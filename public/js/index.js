const canvas = document.getElementById("canvas");
const selectionBox = document.getElementById("selection-box");

let activeElement = null;
let isPanning = false; 
let isSelecting = false;

let offset = { x: 0, y: 0 }; // Elem mozgatáshoz
let pan = { x: 0, y: 0 };    // Kamera pozíciója
let startPos = { x: 0, y: 0 }; // Kijelölés kezdőpontja (világkoordináta)

document.addEventListener('mousedown', (e) => {
  // --- KÖZÉPSŐ GOMB: PAN (Kamera mozgatás) ---
  if (e.button === 1) {
    e.preventDefault();
    const targetNote = e.target.closest('.note');

    if (targetNote) {
      activeElement = targetNote;
      offset.x = e.clientX - targetNote.offsetLeft;
      offset.y = e.clientY - targetNote.offsetTop;
    } else {
      isPanning = true;
      offset.x = e.clientX - pan.x;
      offset.y = e.clientY - pan.y;
    }
  }

  // --- BAL GOMB: SELECTION (Kijelölés) ---
  if (e.button === 0) {
    const targetNote = e.target.closest('.note');
    if (!targetNote) {
      isSelecting = true;
      // Elmentjük a pontot a "világban" (levonjuk az aktuális pan-t)
      startPos.x = e.clientX - pan.x;
      startPos.y = e.clientY - pan.y;

      selectionBox.style.display = 'block';
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
    }
  }
});

document.addEventListener('mousemove', (e) => {
  // 1. Jegyzet mozgatása
  if (activeElement) {
    activeElement.style.left = `${e.clientX - offset.x}px`;
    activeElement.style.top = `${e.clientY - offset.y}px`;
  } 
  
  // 2. Kamera (Pan) mozgatása
  if (isPanning) {
    pan.x = e.clientX - offset.x;
    pan.y = e.clientY - offset.y;
    canvas.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
  }

  // 3. Kijelölő négyzet kezelése
  if (isSelecting) {
    // Kiszámoljuk, hol van a kezdőpont a JELENLEGI pan állás mellett a képernyőn
    const currentViewStartX = startPos.x + pan.x;
    const currentViewStartY = startPos.y + pan.y;

    const width = Math.abs(e.clientX - currentViewStartX);
    const height = Math.abs(e.clientY - currentViewStartY);
    const left = Math.min(e.clientX, currentViewStartX);
    const top = Math.min(e.clientY, currentViewStartY);

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;

    // Ütközésvizsgálat a jegyzetekkel
    const selRect = selectionBox.getBoundingClientRect();
    document.querySelectorAll('.note').forEach(note => {
      const rect = note.getBoundingClientRect();

      const isOverlapping = !(rect.right < selRect.left || 
                             rect.left > selRect.right || 
                             rect.bottom < selRect.top || 
                             rect.top > selRect.bottom);

      if (isOverlapping) {
        note.classList.add('selected');
      } else {
        note.classList.remove('selected');
      }
    });
  }
});

document.addEventListener('mouseup', (e) => {
  activeElement = null;
  isPanning = false;
  if (e.button === 0) {
    isSelecting = false;
    selectionBox.style.display = 'none';
  }
});