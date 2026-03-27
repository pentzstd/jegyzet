const note_window = document.getElementById("note_window")
const canvas = document.getElementById("canvas")
const select_box = document.getElementById("select_box")

let selected_notes = []
let initialPositions = []
let is_dragging_window = false
let is_dragging_notes = false
let is_dragging_selection_box = false

let offset = { x: 0, y: 0 }
let pan = { x: 0, y: 0 }
let start = { x: 0, y: 0 }

// ─── helpers ────────────────────────────────────────────────────────────────

const getNoteEl = (id) => document.getElementById(id)

const removeAllSelected = () => {
  selected_notes.forEach(id => getNoteEl(id)?.classList.remove("note-selected"))
  selected_notes.length = 0
}

const addToSelection = (el) => {
  if (!selected_notes.includes(el.id)) {
    el.classList.add("note-selected")
    selected_notes.push(el.id)
  }
}

const removeFromSelection = (el) => {
  el.classList.remove("note-selected")
  selected_notes = selected_notes.filter(id => id !== el.id)
}

const rectsOverlap = (a, b) =>
  a.left < b.right && a.right > b.left &&
  a.top < b.bottom && a.bottom > b.top

// ─── mousedown ──────────────────────────────────────────────────────────────

note_window.addEventListener("mousedown", (e) => {
  const target = e.target

  // middle-click on a note: drag it (Ctrl = add to existing selection first)
  if (e.button === 1 && target.closest(".note")) {
    const note = target.closest(".note")

    if (e.ctrlKey) {
      // keep existing selection, just start dragging all selected notes
      if (!selected_notes.includes(note.id)) addToSelection(note)
    } else {
      if (!selected_notes.includes(note.id)) {
        removeAllSelected()
        addToSelection(note)
      }
    }

    is_dragging_notes = true
    offset.x = e.clientX
    offset.y = e.clientY
    initialPositions = selected_notes.map(id => {
      const el = getNoteEl(id)
      return { el, left: el.offsetLeft, top: el.offsetTop }
    })
    return
  }

  // middle-click on the background: pan
  if (e.button === 1 && (target === note_window || target === canvas)) {
    is_dragging_window = true
    offset.x = e.clientX - pan.x
    offset.y = e.clientY - pan.y
    return
  }

  // left-click on the background: start selection box
  if (e.button === 0 && (target === note_window || target === canvas)) {
    const rect = note_window.getBoundingClientRect()  // add this
    start.x = e.clientX - rect.left                   // changed
    start.y = e.clientY - rect.top                    // changed
    select_box.style.left   = `${start.x}px`
    select_box.style.top    = `${start.y}px`
    select_box.style.width  = "0px"
    select_box.style.height = "0px"
    select_box.classList.remove("select_box_hidden")
    select_box.classList.add("select_box_visible")
    is_dragging_selection_box = true
    if (!e.ctrlKey) removeAllSelected()
  }
})

// ─── mousemove ──────────────────────────────────────────────────────────────

let rafId = null

note_window.addEventListener("mousemove", (e) => {
  if (!is_dragging_window && !is_dragging_notes && !is_dragging_selection_box) return

  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {

    if (is_dragging_window) {
      pan.x = e.clientX - offset.x
      pan.y = e.clientY - offset.y
      canvas.style.transform = `translate(${pan.x}px, ${pan.y}px)`
    }

    if (is_dragging_notes) {
      const dx = e.clientX - offset.x
      const dy = e.clientY - offset.y
      initialPositions.forEach(({ el, left, top }) => {
        el.style.left = `${left + dx}px`
        el.style.top  = `${top  + dy}px`
      })
    }

if (is_dragging_selection_box) {
  const nwRect = note_window.getBoundingClientRect()
  const curX = e.clientX - nwRect.left
  const curY = e.clientY - nwRect.top

  const left   = Math.min(start.x, curX)
  const top    = Math.min(start.y, curY)
  const width  = Math.abs(curX - start.x)
  const height = Math.abs(curY - start.y)

  select_box.style.left   = `${left}px`
  select_box.style.top    = `${top}px`
  select_box.style.width  = `${width}px`
  select_box.style.height = `${height}px`

  const boxRect = { left, top, right: left + width, bottom: top + height }

  document.querySelectorAll(".note").forEach(note => {
    const r = note.getBoundingClientRect()
    const noteRect = {        // convert note coords to note_window-local space too
      left:   r.left   - nwRect.left,
      top:    r.top    - nwRect.top,
      right:  r.right  - nwRect.left,
      bottom: r.bottom - nwRect.top
    }
    if (rectsOverlap(boxRect, noteRect)) {
      addToSelection(note)
    } else if (!e.ctrlKey) {
      removeFromSelection(note)
    }
  })
}
  })
})

// ─── mouseup ────────────────────────────────────────────────────────────────

note_window.addEventListener("mouseup", (e) => {
  if (e.button === 1) {
    is_dragging_window = false
    is_dragging_notes  = false
  }
  if (e.button === 0) {
    is_dragging_selection_box = false
    select_box.classList.remove("select_box_visible")
    select_box.classList.add("select_box_hidden")
    select_box.style.width  = "0px"
    select_box.style.height = "0px"
  }
})

// ─── click (Ctrl+click to toggle individual notes) ──────────────────────────

note_window.addEventListener("click", (e) => {
  const note = e.target.closest(".note")
  if (!note) return

  if (e.ctrlKey) {
    if (selected_notes.includes(note.id)) {
      removeFromSelection(note)
    } else {
      addToSelection(note)
    }
  } else {
    removeAllSelected()
    addToSelection(note)
  }
})

// ─── keyboard shortcuts ─────────────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    removeAllSelected()
  }
  if ((e.key === "Delete" || e.key === "Backspace") && selected_notes.length) {
    selected_notes.forEach(id => getNoteEl(id)?.remove())
    selected_notes.length = 0
  }
})

// ___ UI buttons _____________________________________________________________


//  new project creation
document.getElementById("new_project_button").addEventListener("click", async () => {
  const res = await fetch("/create-project", {
    method: "POST"
  });
  const result = await res.json()
  if (result.success === true) {
    document.getElementById("project_box").insertAdjacentHTML("beforeend",`<div style="background-color:pink" class="project_tab" id=" ${result.projectId} "> New Project <div class="delete_project_button" id=" ${result.projectId} "> X </div></div>`)
  }
})

// ___ onload events _____________________________________________________________

//  onload get every project

let get_user_projects = async () => {
  const res = await fetch("/get-user-projects")
  const results = await res.json()
  results.forEach(element => {
    document.getElementById("project_box").insertAdjacentHTML("beforeend",`<div style="background-color:pink" id="${element.id}">${element.project_name}<div class="delete_project_button" id="${element.id}"> X </div></div>`)
  })
}

const html_project_wrapper = `<div style="background-color:pink" class="project_tab" id="  ">  <div class="delete_project_button" id=" "> X </div></div>`
window.addEventListener("load", async ()=> {
  get_user_projects()
})

// ___ delete project ______________________________________________________________


document.addEventListener("click", async (e) => {
    // 1. Megnézzük, hogy a törlés gombra kattintottunk-e
    const deleteBtn = e.target.closest(".delete_project_button");
    
    // Ha nem a törlés gombra kattintottak, kilépünk
    if (!deleteBtn) return;

    const project_id = deleteBtn.id;

    // Csak akkor küldjük, ha az ID nem üres
    if (!project_id || project_id.trim() === "") {
        console.error("A projektnek nincs érvényes ID-ja!");
        return;
    }

    try {
        const res = await fetch("/delete-project", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: project_id
            })
        });

        const result = await res.json();

        if (result.success) {
            window.location.reload()
            get_user_projects();
        } else {
            alert("Szerver hiba: " + result.message);
        }
    } catch (err) {
        console.error("Hálózati hiba:", err);
    }
});