const addNoteBtn = document.getElementById("addNoteBtn");

const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const noteColor = document.getElementById("noteColor");

const notesContainer = document.getElementById("notesContainer");
const archiveContainer = document.getElementById("archiveContainer");
const binContainer = document.getElementById("binContainer");

const searchInput = document.getElementById("searchInput");

const charCount = document.getElementById("charCount");

const toast = document.getElementById("toast");

const themeToggle = document.getElementById("themeToggle");

const sidebarLinks = document.querySelectorAll(".sidebar-link");

const notesView = document.getElementById("notesView");
const archiveView = document.getElementById("archiveView");
const binView = document.getElementById("binView");

/* ========= EDIT MODAL ========= */

const editModal = document.getElementById("editModal");

const editTitle = document.getElementById("editTitle");
const editText = document.getElementById("editText");
const editColor = document.getElementById("editColor");

const updateNoteBtn = document.getElementById("updateNoteBtn");

const closeModal = document.getElementById("closeModal");

/* ========= DELETE MODAL ========= */

const deleteModal = document.getElementById("deleteModal");

const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

let notes =
    JSON.parse(localStorage.getItem("googleKeepNotes")) || [];

let currentEditId = null;

let currentDeleteId = null;

function saveNotes() {

    localStorage.setItem(
        "googleKeepNotes",
        JSON.stringify(notes)
    );

}

function loadTheme() {

    const theme =
        localStorage.getItem("theme");

    if (theme === "dark") {

        document.body.classList.add("dark-mode");

        themeToggle.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    }

}

function saveTheme(mode) {

    localStorage.setItem("theme", mode);

}

function showToast(message, color = "#34a853") {

    toast.textContent = message;

    toast.style.background = color;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

noteText.addEventListener("input", () => {

    charCount.textContent =
        `${noteText.value.length} / 500`;

});

function generateID() {

    return Date.now() +
        Math.floor(Math.random() * 1000);

}


function formatDate() {

    const date = new Date();

    return date.toLocaleDateString("en-ZA", {

        year: "numeric",

        month: "short",

        day: "numeric"

    });

}


function findNote(id) {

    return notes.find(note => note.id === id);

}


function resetCreator() {

    noteTitle.value = "";

    noteText.value = "";

    noteColor.value = "#fff8b8";

    charCount.textContent = "0 / 500";

}

function openEditModal() {

    editModal.classList.add("active");

}


function closeEditModal() {

    editModal.classList.remove("active");

}

function openDeleteModal() {

    deleteModal.classList.add("active");

}


function closeDeleteModal() {

    deleteModal.classList.remove("active");

}

window.addEventListener("click", (event) => {

    if (event.target === editModal) {

        closeEditModal();

    }

    if (event.target === deleteModal) {

        closeDeleteModal();

    }

});

loadTheme();

function createNote() {

    const title = noteTitle.value.trim();
    const text = noteText.value.trim();

    if (title === "" && text === "") {

        showToast("Please enter a title or note.", "#ea4335");
        return;

    }

    const newNote = {

        id: generateID(),

        title: title || "Untitled",

        text,

        color: noteColor.value,

        date: formatDate(),

        archived: false,

        deleted: false

    };

    notes.unshift(newNote);

    saveNotes();

    renderNotes();

    resetCreator();

    showToast("Note created successfully!");

}

function renderNotes(searchText = "") {

    notesContainer.innerHTML = "";
    archiveContainer.innerHTML = "";
    binContainer.innerHTML = "";

    const filteredNotes = notes.filter(note => {

        const matchesSearch =

            note.title.toLowerCase().includes(searchText.toLowerCase()) ||

            note.text.toLowerCase().includes(searchText.toLowerCase());

        return matchesSearch;

    });

    const activeNotes = filteredNotes.filter(

        note => !note.archived && !note.deleted

    );

    const archivedNotes = filteredNotes.filter(

        note => note.archived && !note.deleted

    );

    const deletedNotes = filteredNotes.filter(

        note => note.deleted

    );

    displayNotes(activeNotes, notesContainer);

    displayNotes(archivedNotes, archiveContainer);

    displayNotes(deletedNotes, binContainer);

}

function displayNotes(noteArray, container) {

    if (noteArray.length === 0) {

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-regular fa-note-sticky"></i>

            <h3>No Notes Found</h3>

            <p>Create your first note.</p>

        </div>

        `;

        return;

    }

    noteArray.forEach(note => {

        const card = document.createElement("div");

        card.className = "note-card fade-in";

        card.style.background = note.color;

        card.innerHTML = `

            <div class="note-header">

                <h3>${note.title}</h3>

            </div>

            <div class="note-body">

                <p>${note.text}</p>

            </div>

            <div class="note-date">

                ${note.date}

            </div>

            <div class="note-actions">

                ${generateButtons(note)}

            </div>

        `;

        container.appendChild(card);

    });

}

function generateButtons(note) {

    if (note.deleted) {

        return `

        <button
            class="restore-btn"
            onclick="restoreFromBin(${note.id})">

            Restore

        </button>

        <button
            class="delete-btn"
            onclick="deleteForever(${note.id})">

            Delete

        </button>

        `;

    }

    if (note.archived) {

        return `

        <button
            class="restore-btn"
            onclick="restoreNote(${note.id})">

            Restore

        </button>

        <button
            class="delete-btn"
            onclick="moveToBin(${note.id})">

            Bin

        </button>

        `;

    }

    return `

        <button
            class="archive-btn"
            onclick="archiveNote(${note.id})">

            Archive

        </button>

        <button
            class="edit-btn"
            onclick="editNote(${note.id})">

            Edit

        </button>

        <button
            class="delete-btn"
            onclick="moveToBin(${note.id})">

            Bin

        </button>

    `;

}

addNoteBtn.addEventListener("click", createNote);


renderNotes();

function editNote(id) {

    const note = findNote(id);

    if (!note) return;

    currentEditId = id;

    editTitle.value = note.title;
    editText.value = note.text;
    editColor.value = note.color;

    openEditModal();

}

updateNoteBtn.addEventListener("click", () => {

    const note = findNote(currentEditId);

    if (!note) return;

    note.title = editTitle.value.trim() || "Untitled";
    note.text = editText.value.trim();
    note.color = editColor.value;

    saveNotes();

    renderNotes(searchInput.value);

    closeEditModal();

    showToast("Note updated successfully.");

});

function archiveNote(id) {

    const note = findNote(id);

    if (!note) return;

    note.archived = true;

    saveNotes();

    renderNotes(searchInput.value);

    showToast("Note archived.");

}

function restoreNote(id) {

    const note = findNote(id);

    if (!note) return;

    note.archived = false;

    saveNotes();

    renderNotes(searchInput.value);

    showToast("Note restored.");

}

function moveToBin(id) {

    currentDeleteId = id;

    openDeleteModal();

}

confirmDelete.addEventListener("click", () => {

    const note = findNote(currentDeleteId);

    if (!note) return;

    note.deleted = true;
    note.archived = false;

    saveNotes();

    renderNotes(searchInput.value);

    closeDeleteModal();

    showToast("Moved to Bin.", "#ea4335");

});

cancelDelete.addEventListener("click", () => {

    closeDeleteModal();

});

function restoreFromBin(id) {

    const note = findNote(id);

    if (!note) return;

    note.deleted = false;

    saveNotes();

    renderNotes(searchInput.value);

    showToast("Note restored from Bin.");

}

function deleteForever(id) {

    const confirmed = confirm(
        "Delete this note permanently?"
    );

    if (!confirmed) return;

    notes = notes.filter(note => note.id !== id);

    saveNotes();

    renderNotes(searchInput.value);

    showToast("Note permanently deleted.", "#ea4335");

}

closeModal.addEventListener("click", () => {

    closeEditModal();

});

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeEditModal();

        closeDeleteModal();

    }

});

searchInput.addEventListener("input", (event) => {

    const searchValue = event.target.value.trim().toLowerCase();

    renderNotes(searchValue);

});

sidebarLinks.forEach(link => {

    link.addEventListener("click", () => {

        // Remove active class
        sidebarLinks.forEach(item => {
            item.classList.remove("active");
        });

        // Add active class
        link.classList.add("active");

        // Hide all sections
        notesView.classList.add("hidden");
        archiveView.classList.add("hidden");
        binView.classList.add("hidden");

        const view = link.dataset.view;

        switch (view) {

            case "notes":
                notesView.classList.remove("hidden");
                break;

            case "archive":
                archiveView.classList.remove("hidden");
                break;

            case "bin":
                binView.classList.remove("hidden");
                break;

        }

    });

});

const menuButton = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar");

if (menuButton) {

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("show");

    });

}

document.addEventListener("click", (event) => {

    if (
        window.innerWidth <= 768 &&
        !sidebar.contains(event.target) &&
        !menuButton.contains(event.target)
    ) {

        sidebar.classList.remove("show");

    }

});

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const darkMode =
        document.body.classList.contains("dark-mode");

    if (darkMode) {

        themeToggle.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

        saveTheme("dark");

        showToast("Dark mode enabled.");

    } else {

        themeToggle.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

        saveTheme("light");

        showToast("Light mode enabled.");

    }

});

noteText.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key === "Enter") {

        createNote();

    }

});

editModal.addEventListener("click", (event) => {

    if (event.target === editModal) {

        closeEditModal();

    }

});

document.addEventListener("keydown", (event) => {

    // Ctrl + N = New Note
    if (event.ctrlKey && event.key.toLowerCase() === "n") {

        event.preventDefault();

        noteTitle.focus();

    }

    // Ctrl + F = Focus Search
    if (event.ctrlKey && event.key.toLowerCase() === "f") {

        event.preventDefault();

        searchInput.focus();

    }

});

window.addEventListener("resize", () => {

    if (window.innerWidth > 768) {

        sidebar.classList.remove("show");

    }

});

function initializeApp() {

    loadTheme();

    renderNotes();

    showToast("Welcome to Google Keep Clone!");

}

initializeApp();

function pinNote(id) {

    const note = findNote(id);

    if (!note) return;

    note.pinned = !note.pinned;

    notes.sort((a, b) => {

        return (b.pinned === true) - (a.pinned === true);

    });

    saveNotes();

    renderNotes(searchInput.value);

    showToast(
        note.pinned
            ? "Note pinned."
            : "Note unpinned."
    );

}

function sortNewest() {

    notes.sort((a, b) => b.id - a.id);

    saveNotes();

    renderNotes(searchInput.value);

}

function sortOldest() {

    notes.sort((a, b) => a.id - b.id);

    saveNotes();

    renderNotes(searchInput.value);

}

function filterByColor(color) {

    const filtered = notes.filter(note =>

        note.color === color &&
        !note.deleted

    );

    notesContainer.innerHTML = "";

    displayNotes(filtered, notesContainer);

}

function updateStatistics() {

    const active = notes.filter(n => !n.deleted && !n.archived);

    const archived = notes.filter(n => n.archived);

    const deleted = notes.filter(n => n.deleted);

    console.table({

        Active: active.length,

        Archived: archived.length,

        Bin: deleted.length,

        Total: notes.length

    });

}

updateStatistics();

document.addEventListener("keydown", (event) => {

    /* Ctrl + Shift + A = Archive View */

    if (event.ctrlKey && event.shiftKey && event.key === "A") {

        sidebarLinks[1].click();

    }

    /* Ctrl + Shift + B = Bin */

    if (event.ctrlKey && event.shiftKey && event.key === "B") {

        sidebarLinks[2].click();

    }

    /* Ctrl + Shift + N = Notes */

    if (event.ctrlKey && event.shiftKey && event.key === "N") {

        sidebarLinks[0].click();

    }

});

window.addEventListener("beforeunload", () => {

    saveNotes();

});

const APP_VERSION = "1.0.0";

console.log(`Google Keep Clone v${APP_VERSION}`);


window.addEventListener("load", () => {

    noteTitle.focus();

});

function updateCounters() {

    const active = notes.filter(
        note => !note.archived && !note.deleted
    ).length;

    const archived = notes.filter(
        note => note.archived && !note.deleted
    ).length;

    const deleted = notes.filter(
        note => note.deleted
    ).length;

    console.log(`
==============================
GOOGLE KEEP CLONE
==============================

Active Notes : ${active}

Archived Notes : ${archived}

Bin : ${deleted}

Total Notes : ${notes.length}

==============================
`);

}

updateCounters();

function exportNotes() {

    const data = JSON.stringify(notes, null, 2);

    const blob = new Blob(
        [data],
        {
            type: "application/json"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "google-keep-notes.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("Notes exported successfully.");

}

function importNotes(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const importedNotes =
                JSON.parse(e.target.result);

            if (!Array.isArray(importedNotes)) {

                throw new Error();

            }

            notes = importedNotes;

            saveNotes();

            renderNotes();

            showToast("Notes imported.");

        }

        catch {

            showToast(
                "Invalid JSON file.",
                "#ea4335"
            );

        }

    };

    reader.readAsText(file);

}

function clearAllNotes() {

    const answer = confirm(
        "Delete ALL notes?"
    );

    if (!answer) return;

    notes = [];

    saveNotes();

    renderNotes();

    showToast(
        "All notes deleted.",
        "#ea4335"
    );

}

function storageInfo() {

    const storage = localStorage.getItem(
        "googleKeepNotes"
    );

    if (!storage) return;

    const kb =
        (storage.length / 1024).toFixed(2);

    console.log(

        `Storage Used: ${kb} KB`

    );

}

storageInfo();

const APP = {

    name: "Google Keep Clone",

    version: "1.0.0",

    developer:
        "Nonkululeko Mphoentle Maphanga"

};

console.table(APP);

setTimeout(() => {

    showToast(
        `Welcome to ${APP.name}!`
    );

}, 600);

setInterval(() => {

    saveNotes();

}, 60000);

window.addEventListener("online", () => {

    showToast("Internet Connected");

});

window.addEventListener("offline", () => {

    showToast(
        "Offline Mode",
        "#ea4335"
    );

});

noteTitle.addEventListener("blur", () => {

    noteTitle.value =
        noteTitle.value.trim();

});

noteText.addEventListener("blur", () => {

    noteText.value =
        noteText.value.trim();

});

console.log(
    "Google Keep Clone loaded successfully."
);