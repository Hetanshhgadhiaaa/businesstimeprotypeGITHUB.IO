// =============================================
// STUDY AI - Optimized JavaScript
// =============================================

"use strict";

// =============================================
// APP STATE
// =============================================

const appState = {
  images: [],
  audioBlob: null,
  recordedChunks: [],
  isRecording: false,
  mediaRecorder: null,
  mediaStream: null,
  chatHistory: [],
  materials: [],
  uploadedFile: null
};


// =============================================
// DOM ELEMENTS
// =============================================

const elements = {
  dragDropZone: document.getElementById("dragDropZone"),
  imageInput: document.getElementById("imageInput"),
  imageGallery: document.getElementById("imageGallery"),
  imageCount: document.getElementById("imageCount"),

  recordBtn: document.getElementById("recordBtn"),
  stopBtn: document.getElementById("stopBtn"),
  playBtn: document.getElementById("playBtn"),
  clearAudioBtn: document.getElementById("clearAudioBtn"),
  recordingStatus: document.getElementById("recordingStatus"),

  chatInput: document.getElementById("chatInput"),
  sendBtn: document.getElementById("sendBtn"),
  chatMessages: document.getElementById("chatMessages"),

  fileInput: document.getElementById("fileInput"),
  fileInfo: document.getElementById("fileInfo"),

  materialsContainer: document.getElementById("materialsContainer"),
  clearMaterialsBtn: document.getElementById("clearMaterialsBtn"),

  modal: document.getElementById("imageModal"),
  modalImage: document.getElementById("modalImage"),
  closeBtn: document.querySelector(".close"),

  loadingSpinner: document.getElementById("loadingSpinner")
};


// =============================================
// IMAGE UPLOAD
// =============================================

function handleImageFiles(files) {

  const validFiles = [...files].filter(file =>
    file.type.startsWith("image/")
  );

  if (appState.images.length + validFiles.length > 7) {
    showNotification("Maximum 7 images allowed", "warning");
    return;
  }

  validFiles.forEach(file => {

    const reader = new FileReader();

    reader.onload = e => {

      appState.images.push({
        id: crypto.randomUUID(),
        src: e.target.result,
        name: file.name,
        size: (file.size / 1024).toFixed(2)
      });

      renderImages();
      saveAppState();

    };

    reader.onerror = () => showNotification("File read error", "error");

    reader.readAsDataURL(file);

  });
}


function renderImages() {

  if (!elements.imageGallery) return;

  elements.imageGallery.innerHTML = "";

  appState.images.forEach(img => {

    const wrapper = document.createElement("div");
    wrapper.className = "image-item";

    const image = document.createElement("img");
    image.src = img.src;
    image.alt = `Study material ${img.name}`;
    image.addEventListener("click", () => viewImage(img.src));

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove image";

    removeBtn.addEventListener("click", () => removeImage(img.id));

    wrapper.append(image, removeBtn);

    elements.imageGallery.appendChild(wrapper);

  });

  elements.imageCount.textContent =
    `${appState.images.length}/7 images uploaded`;
}


function removeImage(id) {

  appState.images =
    appState.images.filter(img => img.id !== id);

  renderImages();
  saveAppState();

}


// =============================================
// IMAGE MODAL
// =============================================

function viewImage(src) {

  elements.modal.style.display = "block";
  elements.modalImage.src = src;

  document.body.style.overflow = "hidden";

}

function closeModal() {

  elements.modal.style.display = "none";
  document.body.style.overflow = "auto";

}

elements.closeBtn?.addEventListener("click", closeModal);

elements.modal?.addEventListener("click", e => {
  if (e.target === elements.modal) closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});


// =============================================
// AUDIO RECORDING
// =============================================

async function startRecording() {

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({ audio: true });

    appState.mediaStream = stream;

    const recorder = new MediaRecorder(stream);
    appState.mediaRecorder = recorder;
    appState.recordedChunks = [];

    recorder.ondataavailable =
      e => appState.recordedChunks.push(e.data);

    recorder.onstop = () => {

      appState.audioBlob =
        new Blob(appState.recordedChunks, { type: "audio/webm" });

      const url = URL.createObjectURL(appState.audioBlob);

      const player =
        document.querySelector("#audioPlayer audio");

      if (player) {
        player.src = url;
        document.getElementById("audioPlayer").hidden = false;
      }

      stream.getTracks().forEach(t => t.stop());

      updateRecordingStatus("Recording saved", "#10b981");

    };

    recorder.start();

    appState.isRecording = true;

    updateRecordingButtons(true);
    updateRecordingStatus("Recording...", "#ef4444");

  } catch (error) {

    console.error(error);
    showNotification("Microphone access denied", "error");

  }

}


function stopRecording() {

  if (!appState.mediaRecorder) return;

  appState.mediaRecorder.stop();
  appState.isRecording = false;

  updateRecordingButtons(false);

}


function clearAudio() {

  appState.audioBlob = null;
  appState.recordedChunks = [];

  document.getElementById("audioPlayer").hidden = true;

  updateRecordingStatus("", "");

}


function updateRecordingButtons(recording) {

  elements.recordBtn.disabled = recording;
  elements.stopBtn.disabled = !recording;

}


function updateRecordingStatus(text, color) {

  elements.recordingStatus.textContent = text;
  elements.recordingStatus.style.color = color;

}


// =============================================
// CHAT
// =============================================

function addMessage(content, isUser = false) {

  const message = document.createElement("div");

  message.className =
    `message ${isUser ? "user-message" : "bot-message"}`;

  message.innerHTML =
    `<div class="message-content">${escapeHtml(content)}</div>`;

  elements.chatMessages.appendChild(message);

  elements.chatMessages.scrollTop =
    elements.chatMessages.scrollHeight;

}


function escapeHtml(text) {

  const div = document.createElement("div");
  div.textContent = text;

  return div.innerHTML.replace(/\n/g, "<br>");

}


async function sendMessage() {

  const message =
    elements.chatInput.value.trim();

  if (!message) return;

  addMessage(message, true);

  elements.chatInput.value = "";

  showLoading(true);

  setTimeout(() => {

    showLoading(false);

    const response =
      `🤖 AI is analyzing ${appState.images.length} images and your question.`;

    addMessage(response);

    generateMaterial(message);

  }, 800);

}


// =============================================
// STUDY MATERIAL GENERATOR
// =============================================

function generateMaterial(query) {

  const templates = [

`📝 Study Notes
• Key ideas
• Definitions
• Practice questions`,

`📚 Quick Summary
1. Core concept
2. Important detail
3. Real world example`,

`🎯 Flashcards
Q: What is the main concept?
A: Review uploaded material`,

  ];

  const content =
    templates[Math.floor(Math.random()*templates.length)];

  appState.materials.push({
    id: Date.now(),
    content,
    query
  });

  renderMaterials();

}


function renderMaterials() {

  if (!elements.materialsContainer) return;

  if (appState.materials.length === 0) {

    elements.materialsContainer.innerHTML =
      `<p class="empty-state">No materials yet</p>`;

    return;

  }

  elements.materialsContainer.innerHTML =
    appState.materials.map((m,i)=>
`<div class="material-item">
${escapeHtml(m.content)}
<button data-index="${i}" class="delete-material">Delete</button>
</div>`
).join("");

}


elements.materialsContainer?.addEventListener("click", e => {

  if (e.target.classList.contains("delete-material")) {

    const index = e.target.dataset.index;

    appState.materials.splice(index,1);

    renderMaterials();
    saveAppState();

  }

});


// =============================================
// FILE UPLOAD
// =============================================

elements.fileInput?.addEventListener("change", e => {

  const file = e.target.files[0];

  if (!file) return;

  const size =
    (file.size / 1024 / 1024).toFixed(2);

  elements.fileInfo.textContent =
    `File: ${file.name} (${size}MB)`;

  appState.uploadedFile = file;

});


// =============================================
// UI UTILITIES
// =============================================

function showNotification(message,type="info") {

  const el = document.createElement("div");

  el.className = "notification";
  el.textContent = message;

  el.style.cssText = `
position:fixed;
top:20px;
right:20px;
background:#667eea;
color:white;
padding:12px 18px;
border-radius:6px;
z-index:9999;
`;

  document.body.appendChild(el);

  setTimeout(()=>el.remove(),3000);

}


function showLoading(show) {

  elements.loadingSpinner.hidden = !show;

}


// =============================================
// STORAGE
// =============================================

function saveAppState() {

  const data = {

    chatHistory: appState.chatHistory,
    materials: appState.materials

  };

  localStorage.setItem(
    "studyAIState",
    JSON.stringify(data)
  );

}


function loadAppState() {

  const data =
    localStorage.getItem("studyAIState");

  if (!data) return;

  try {

    const parsed = JSON.parse(data);

    appState.chatHistory = parsed.chatHistory || [];
    appState.materials = parsed.materials || [];

    renderMaterials();

  } catch(e) {

    console.error("State load error",e);

  }

}


// =============================================
// INIT
// =============================================

window.addEventListener("load", () => {

  loadAppState();

  addMessage(
`👋 Welcome to Study AI!

Upload images, audio, or files and ask questions.

I'll generate notes, flashcards, and summaries for you.`,
false);

});


// =============================================
// EVENT LISTENERS
// =============================================

elements.dragDropZone?.addEventListener("dragover",e=>{
  e.preventDefault();
});

elements.dragDropZone?.addEventListener("drop",e=>{
  e.preventDefault();
  handleImageFiles(e.dataTransfer.files);
});

elements.dragDropZone?.addEventListener("click",()=>{
  elements.imageInput.click();
});

elements.imageInput?.addEventListener("change",e=>{
  handleImageFiles(e.target.files);
});

elements.recordBtn?.addEventListener("click",startRecording);
elements.stopBtn?.addEventListener("click",stopRecording);
elements.clearAudioBtn?.addEventListener("click",clearAudio);

elements.sendBtn?.addEventListener("click",sendMessage);

elements.chatInput?.addEventListener("keydown",e=>{
  if(e.key==="Enter" && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});


// =============================================
// DEBUG
// =============================================

console.log(
"%cStudy AI Loaded",
"color:#667eea;font-size:16px;font-weight:bold"
);
