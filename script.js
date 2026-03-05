// ============================
// STUDY AI - CLEAN JS VERSION
// ============================

const state = {
images: [],
materials: [],
chatHistory: []
}

const DOM = {
imageInput: document.getElementById("imageInput"),
gallery: document.getElementById("imageGallery"),
chatInput: document.getElementById("chatInput"),
sendBtn: document.getElementById("sendBtn"),
chatMessages: document.getElementById("chatMessages"),
materialsContainer: document.getElementById("materialsContainer")
}

// IMAGE UPLOAD
DOM.imageInput.addEventListener("change", e => {

const files = [...e.target.files]

files.forEach(file => {

if (!file.type.startsWith("image/")) return

const reader = new FileReader()

reader.onload = e => {

state.images.push(e.target.result)

renderImages()

}

reader.readAsDataURL(file)

})

})

// RENDER IMAGES
function renderImages(){

DOM.gallery.innerHTML = ""

state.images.forEach(src => {

const img = document.createElement("img")
img.src = src
img.className = "preview"

DOM.gallery.appendChild(img)

})

}

// CHAT
DOM.sendBtn.addEventListener("click", sendMessage)

function sendMessage(){

const text = DOM.chatInput.value.trim()

if(!text) return

addMessage(text,true)

DOM.chatInput.value=""

simulateAI(text)

}

// ADD MESSAGE
function addMessage(text,user=false){

const msg=document.createElement("div")

msg.className=user?"user":"bot"

msg.innerText=text

DOM.chatMessages.appendChild(msg)

}

// FAKE AI RESPONSE
function simulateAI(query){

setTimeout(()=>{

const response="AI Response based on your materials."

addMessage(response)

generateMaterial(query)

},800)

}

// MATERIAL GENERATOR
function generateMaterial(query){

const note=`Study Notes for: ${query}`

state.materials.push(note)

renderMaterials()

}

// RENDER MATERIALS
function renderMaterials(){

DOM.materialsContainer.innerHTML=""

state.materials.forEach(m=>{

const div=document.createElement("div")

div.className="material"

div.innerText=m

DOM.materialsContainer.appendChild(div)

})

}
