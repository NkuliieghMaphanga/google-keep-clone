const notesContainer = document.getElementById("notesContainer");
const archiveContainer = document.getElementById("archiveContainer");

const noteModal = document.getElementById("noteModal");
const deleteModal = document.getElementById("deleteModal");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModal");

const noteForm = document.getElementById("noteForm");

const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const noteColor = document.getElementById("noteColor");

const searchInput = document.getElementById("searchInput");

const notesCount = document.getElementById("notesCount");
const archiveCount = document.getElementById("archiveCount");

const themeToggle = document.getElementById("themeToggle");

const charCount = document.getElementById("charCount");

const toast = document.getElementById("toast");

const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

// =========================
// VARIABLES
// =========================

let notes = JSON.parse(localStorage.getItem("notes")) || [];

let editMode = false;
let currentEditId = null;

let deleteId = null;

// =========================
// MODAL FUNCTIONS
// =========================

function openModal() {
    noteModal.style.display = "flex";
}

function closeModal() {
    noteModal.style.display = "none";

    noteForm.reset();

    noteColor.value = "#fff8b8";

    charCount.textContent = "0 / 500";

    editMode = false;
    currentEditId = null;

    document.getElementById("modalTitle").textContent =
        "Create Note";
}

openModalBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

// =========================
// CHARACTER COUNTER
// =========================

noteText.addEventListener("input", () => {

    charCount.textContent =
        `${noteText.value.length} / 500`;

});

// =========================
// SAVE NOTE
// =========================

noteForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const title = noteTitle.value.trim();
    const text = noteText.value.trim();

    if (!title || !text) {
        showToast("Please complete all fields", "#ea4335");
        return;
    }

    if (editMode) {

        notes = notes.map(note => {

            if (note.id === currentEditId) {

                note.title = title;
                note.text = text;
                note.color = noteColor.value;
            }

            return note;

        });

        showToast("Note updated successfully");

    } else {

        const note = {

            id: Date.now(),

            title,

            text,

            color: noteColor.value,

            archived: false,

            createdAt: new Date().toLocaleDateString()

        };

        notes.push(note);

        showToast("Note added successfully");
    }

    saveNotes();

    renderNotes();

    closeModal();

});

// =========================
// RENDER NOTES
// =========================

function renderNotes(searchTerm = "") {

    const activeNotes = notes.filter(note =>
        !note.archived
    );

    const archivedNotes = notes.filter(note =>
        note.archived
    );

    notesContainer.innerHTML = "";
    archiveContainer.innerHTML = "";

    const filteredActive = activeNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredArchived = archivedNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredActive.length === 0) {

        notesContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Notes Found</h3>
                <p>Create a note to get started.</p>
            </div>
        `;
    }

    filteredActive.forEach(note => {

        notesContainer.appendChild(createNoteCard(note));

    });

    if (filteredArchived.length === 0) {

        archiveContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Archived Notes</h3>
                <p>Archived notes appear here.</p>
            </div>
        `;
    }

    filteredArchived.forEach(note => {

        archiveContainer.appendChild(createNoteCard(note));

    });

    notesCount.textContent =
        `${activeNotes.length} Notes`;

    archiveCount.textContent =
        `${archivedNotes.length} Notes`;
}

// =========================
// CREATE NOTE CARD
// =========================

function createNoteCard(note) {

    const card = document.createElement("div");

    card.classList.add("note-card");

    card.style.background = note.color;

    card.innerHTML = `
        <div class="note-header">
            <h3>${note.title}</h3>
        </div>

        <div class="note-body">
            <p>${note.text}</p>

            <div class="note-date">
                ${note.createdAt}
            </div>
        </div>

        <div class="note-actions">

            ${
                !note.archived
                ?
                `
                <button
                    class="archive-btn"
                    onclick="archiveNote(${note.id})"
                    title="Archive Note"
                >
                    Archive
                </button>

                <button
                    class="edit-btn"
                    onclick="editNote(${note.id})"
                    title="Edit Note"
                >
                    Edit
                </button>
                `
                :
                `
                <button
                    class="restore-btn"
                    onclick="restoreNote(${note.id})"
                    title="Restore Note"
                >
                    Restore
                </button>
                `
            }

            <button
                class="delete-btn"
                onclick="openDeleteModal(${note.id})"
                title="Delete Note"
            >
                Delete
            </button>

        </div>
    `;

    return card;
}

// =========================
// ARCHIVE NOTE
// =========================

function archiveNote(id) {

    notes = notes.map(note => {

        if (note.id === id) {
            note.archived = true;
        }

        return note;

    });

    saveNotes();

    renderNotes(searchInput.value);

    showToast("Note archived");
}

// =========================
// RESTORE NOTE
// =========================

function restoreNote(id) {

    notes = notes.map(note => {

        if (note.id === id) {
            note.archived = false;
        }

        return note;

    });

    saveNotes();

    renderNotes(searchInput.value);

    showToast("Note restored");
}

// =========================
// EDIT NOTE
// =========================

function editNote(id) {

    const note =
        notes.find(note => note.id === id);

    if (!note) return;

    editMode = true;

    currentEditId = id;

    document.getElementById("modalTitle").textContent =
        "Edit Note";

    noteTitle.value = note.title;

    noteText.value = note.text;

    noteColor.value = note.color;

    charCount.textContent =
        `${note.text.length} / 500`;

    openModal();
}

// =========================
// DELETE MODAL
// =========================

function openDeleteModal(id) {

    deleteId = id;

    deleteModal.style.display = "flex";
}

function closeDeleteModal() {

    deleteModal.style.display = "none";

    deleteId = null;
}

confirmDeleteBtn.addEventListener("click", () => {

    if (!deleteId) return;

    notes = notes.filter(note =>
        note.id !== deleteId
    );

    saveNotes();

    renderNotes(searchInput.value);

    closeDeleteModal();

    showToast("Note deleted");

});

cancelDeleteBtn.addEventListener("click",
    closeDeleteModal
);

// =========================
// SEARCH NOTES
// =========================

searchInput.addEventListener("input", () => {

    renderNotes(searchInput.value);

});

// =========================
// LOCAL STORAGE
// =========================

function saveNotes() {

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );
}

// =========================
// TOAST
// =========================

function showToast(message, color = "#34a853") {

    toast.textContent = message;

    toast.style.background = color;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}

// =========================
// DARK MODE
// =========================

function loadTheme() {

    const theme =
        localStorage.getItem("theme");

    if (theme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        themeToggle.textContent = "☀️";
    }
}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle(
        "dark-mode"
    );

    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );

    localStorage.setItem(
        "theme",
        darkMode ? "dark" : "light"
    );

    themeToggle.textContent =
        darkMode ? "☀️" : "🌙";
});

// =========================
// CLOSE MODALS ON OUTSIDE CLICK
// =========================

window.addEventListener("click", (e) => {

    if (e.target === noteModal) {

        closeModal();
    }

    if (e.target === deleteModal) {

        closeDeleteModal();
    }
});

// =========================
// INITIAL LOAD
// =========================

loadTheme();

renderNotes();