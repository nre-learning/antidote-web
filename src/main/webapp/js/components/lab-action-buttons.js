import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext, useState, useRef } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LessonContext } from '/js/data.js';
import { syringeServiceRoot, lessonStage, lessonId, sessionId } from '/js/helpers/page-state.js';
import useFetch from '/js/helpers/use-fetch.js';
import { useLessonVerificationResults } from "/js/data.js";

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

// todo: ugh fix !important in css below
function LabActionButtons() {
  const lessonRequest = useContext(LessonContext);
  const hasObjective = lessonRequest.completed && lessonRequest.data.Stages[lessonStage].VerifyObjective;
  const verificationAttemptCount = useRef(0); // arbitrary varying value to include in request state to trigger a new request when incremented
  const [verificationOngoing, setVerificationOngoing] = useState(false);
  const startVerificationRequest = verificationOngoing
    ? useFetch(`${syringeServiceRoot}/exp/livelesson/${lessonId}-${sessionId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ data: { id: `${lessonId}-${sessionId}` } }),
      attemptCount: verificationAttemptCount.current
    })
    : {};
  const verificationResultsRequest = startVerificationRequest.succeeded
    ? useLessonVerificationResults(startVerificationRequest.data.id, verificationAttemptCount.current)
    : {};
  const verificationMessage = (() => {
    if (verificationResultsRequest.pending) {
      return 'Still verifying...';
    } else if (verificationResultsRequest.succeeded) {
      if (verificationResultsRequest.data.success) {
        return 'Successfully verified!'
      } else {
        return 'Failed to verify.'
      }
    } else {
      return 'An unexpected error occurred during verification.';
    }
  })();

  function verify() {
    verificationAttemptCount.current++;
    setVerificationOngoing(true);
  }

  function closeVerify() {
    setVerificationOngoing(false);
    startVerificationRequest.reset(); // need to clear old request state in order to attempt next one
  }

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
      img {
        object-fit: contain;
      }
    </style>
  
    <button class="btn primary" @click=${copy}>Copy</button>
    <button class="btn primary" @click=${paste}">Paste</button>
    ${verifyButton}
    
    <antidote-modal show=${verificationOngoing}>
      <h1>Verification</h1>
      <p>${verificationMessage}</p>
      ${verificationMessage === 'Still verifying...' ? html`
        <img src="/images/flask.gif" alt="flask" />
      `: ''}
      <button class="btn primary" @click=${closeVerify}>Close</button>
    </antidote-modal>
  `
}

customElements.define('antidote-lab-action-buttons', component(LabActionButtons));

export default LabActionButtons;