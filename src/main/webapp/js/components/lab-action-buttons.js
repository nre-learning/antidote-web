import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LessonContext } from '/js/data.js';
import { lessonStage } from '/js/helpers/page-state.js';

function copy() {
  const tabsEl = document.querySelector('antidote-lab-tabs');
  const activeTab = tabsEl.shadowRoot.querySelector('div[selected]');
  const dummy = document.createElement('input');

  document.body.appendChild(dummy);
  dummy.value = activeTab.clipboard;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

async function paste() {
  const tabsEl = document.querySelector('antidote-lab-tabs');
  const client = tabsEl.shadowRoot.querySelector('div[selected]').client;
  const keysyms = Array.from(await navigator.clipboard.readText()).map((char) => {
    const code = char.charCodeAt(0);
    return code >= 0x0100 ? 0x01000000 | code : code;
  });

  keysyms.forEach((keysym) => {
    client.sendKeyEvent(1, keysym);
    client.sendKeyEvent(0, keysym);
  })
}


// todo: reimplement verify
// async function verify() {
//
//   var verifyBtn = document.getElementById("verifyBtn");
//   verifyBtn.disabled = true
//   verifyBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i>'
//
//
//   var verifyMsg = document.getElementById("verifyMsg");
//   verifyMsg.innerText = ""
//
//   var data = {};
//   data.id = getLessonId() + "-" + getSession();
//
//   // Send verification request
//   var xhttp = new XMLHttpRequest();
//   xhttp.open("POST", urlRoot + "/exp/livelesson/" + getLessonId() + "-" + getSession() + "/verify", false);
//   xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
//   xhttp.send(JSON.stringify(data));
//
//   response = JSON.parse(xhttp.responseText);
//   if (xhttp.status != 200) {
//     verifyMsg.innerText = "error"
//     return
//   }
//
//   for (var i = 0; i < 30; i++) {
//
//     await sleep(1000);
//
//     // Get verification by ID
//     var xhttp2 = new XMLHttpRequest();
//     xhttp2.open("GET", urlRoot + "/exp/verification/" + response.id, false);
//     xhttp2.setRequestHeader('Content-type', 'application/json; charset=utf-8');
//     xhttp2.send()
//
//     response2 = JSON.parse(xhttp2.responseText);
//     if (xhttp2.status != 200) {
//       verifyMsg.innerText = "error"
//       return
//     }
//
//     if (response2.working == true) {
//       continue;
//     }
//     break;
//   }
//
//   verifyBtn.innerText = 'Verify'
//
//   if (response2.success == true) {
//     verifyMsg.innerText = "Successfully verified!"
//     verifyMsg.style.color = "green"
//   } else {
//     verifyMsg.innerText = "Failed to verify."
//     verifyMsg.style.color = "red"
//   }
//
//   // Leave message on the screen for a while
//   await sleep(10000);
//
//   // Fade out message
//   var fadeEffect = setInterval(function () {
//     if (!verifyMsg.style.opacity) {
//       verifyMsg.style.opacity = 1;
//     }
//     if (verifyMsg.style.opacity > 0) {
//       verifyMsg.style.opacity -= 0.1;
//     } else {
//       clearInterval(fadeEffect);
//     }
//   }, 200);
//
//   // Wait for message to fade out, and then reset elements
//   await sleep(4000);
//   verifyMsg.innerText = ""
//   verifyMsg.style.opacity = 1
//   verifyBtn.disabled = false
// }

function verify() {

}

// todo: ugh fix !important in css below
function LabActionButtons() {
  const lessonRequest = useContext(LessonContext);
  const hasObjective = lessonRequest.completed && lessonRequest.data.Stages[lessonStage].VerifyObjective;
  const verifyButton = hasObjective
    ? html`<button class="btn primary" @click=${verify}>Verify</button>`
    : '';

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      :host {       
        padding: 15px !important;;   
        background-color: #666666;          
      }
      :host(:first-line) {
      }
      button {
        margin: 15px;
      }
    </style>
  
    <button class="btn primary" @click=${copy}>Copy</button>
    <button class="btn primary" @click=${paste}">Paste</button>
    ${verifyButton}
  `
}

customElements.define('antidote-lab-action-buttons', component(LabActionButtons));

export default LabActionButtons;