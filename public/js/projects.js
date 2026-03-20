let selected_note
let selected_notes = []
let initialPositions = []
let is_dragging_window = false
let is_dragging_notes = false
const note_window = document.getElementById("note_window")
const canvas = document.getElementById("canvas")
let offset = {x:0, y:0}
let pan = { x: 0, y: 0 }
note_window.addEventListener("mousedown", (e) => {
  let s = e.target
  console.log(s)
  if (e.button === 1 && (s.id === "note_window" || s.id === "canvas")) {
    is_dragging_window = true
    offset.x = e.clientX - pan.x;
    offset.y = e.clientY - pan.y;
  }
  else if (e.ctrlKey && e.button === 1 && document.getElementById(s.id).classList.contains("note-selected")) {
    is_dragging_notes = true
    console.log(selected_notes)
    offset.x = e.clientX;
    offset.y = e.clientY;

    initialPositions = selected_notes.map(note => ({
      note: document.getElementById(note),
      left: document.getElementById(note).offsetLeft,
      top: document.getElementById(note).offsetTop
    }))
    console.log(initialPositions)
  }
    else if (e.button === 1) {
    remove_all_selected()
    is_dragging_notes = true
    s.classList.add("note-selected")
    selected_notes.push(s.id)
    console.log(selected_notes)
    offset.x = e.clientX;
    offset.y = e.clientY;

    initialPositions = selected_notes.map(note => ({
      note: document.getElementById(note),
      left: document.getElementById(note).offsetLeft,
      top: document.getElementById(note).offsetTop
    }))
  }

})

note_window.addEventListener("mousemove", (e) => {
  if (is_dragging_window) {
    pan.x = e.clientX - offset.x;
    pan.y = e.clientY - offset.y;
    canvas.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
  }
  if (is_dragging_notes) {
      const dx = e.clientX - offset.x;
      const dy = e.clientY - offset.y;
      initialPositions.forEach(item => {
        item.note.style.left = `${item.left + dx}px`;
        item.note.style.top = `${item.top + dy}px`;
    });
  }
})

note_window.addEventListener("mouseup", (e) => {
  if (e.button === 1) {
    is_dragging_window = false;
    is_dragging_notes = false
  }
})

note_window.addEventListener("click", (e) => {
  selected_note = e.target.closest(".note")
  try {
  if (e.ctrlKey && e.button === 0 && !selected_notes.includes(selected_note.id)) {
    selected_note.classList.add("note-selected")
    selected_notes.push(selected_note.id)
  }
  else if (e.ctrlKey && e.button === 0 && selected_notes.includes(selected_note.id)) {
    selected_note.classList.remove("note-selected")
    selected_notes = selected_notes.toSpliced(selected_notes.indexOf(selected_note.id), 1)
  }
  else {
    remove_all_selected()
    selected_note.classList.add("note-selected")
    selected_notes.push(selected_note.id)
  }
  console.log(selected_notes)
  }
  catch {
    console.log(selected_notes)
  }
});

let remove_all_selected = () => {
  selected_notes.forEach(element => {
    document.getElementById(element).classList.remove("note-selected")
  })
  selected_notes.length = 0
}