import { html } from 'lit-html';
import { component, useContext, useState, useRef } from 'haunted';
import { LessonContext } from '../data.js';
import { syringeServiceRoot, lessonStage, lessonId, sessionId } from '../helpers/page-state.js';
import usePollingRequest from '../helpers/use-polling-request.js';

// todo: ugh fix !important in css below
function LabActionButtons() {
  const lessonRequest = useContext(LessonContext);
  const hasObjective = lessonRequest.succeeded && lessonRequest.data.Stages[lessonStage].VerifyObjective;
  const verificationAttemptCount = useRef(0); // arbitrary varying value to include in request state to trigger a new request when incremented
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const verificationRequest = verifyModalOpen ? usePollingRequest({
    initialRequestURL: `${syringeServiceRoot}/exp/livelesson/${lessonId}-${sessionId}/verify`,
    initialRequestOptions: {
      method: 'POST',
      body: JSON.stringify({ data: { id: `${lessonId}-${sessionId}` } }),
      attemptCount: verificationAttemptCount.current
    },
    progressRequestURL: ({id}) => `${syringeServiceRoot}/exp/verification/${id}`,
    isProgressComplete: ({working}) => !working,
  }) : {};
  const verificationMessage = (() => {
    if (verificationRequest.pending) {
      return 'Still verifying...';
    } else if (verificationRequest.succeeded) {
      if (verificationRequest.data.success) {
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
    setVerifyModalOpen(true);
  }

  function closeVerify() {
    setVerifyModalOpen(false);
  }

  const verifyButton = hasObjective
    ? html`<button class="btn primary" @click=${verify}>Verify</button>`
    : '';
  const noButtons = !(verifyButton);

  return noButtons ? '' : html`
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
  
    <!-- todo: move verify button-->
    ${verifyButton}
    
    <antidote-modal show=${verifyModalOpen}>
      <style> 
        :host {
          text-align: center;
        }
        h1 {
          text-align: left;
        }
      </style>
      <h1>Verification</h1>
      <p>${verificationMessage}</p>
      ${verificationMessage === 'Still verifying...' ? html`
        <img src="/images/flask.gif" alt="flask" />
      `: ''}
      <div>
        <button class="btn primary" @click=${closeVerify}>Close</button>
      </div>     
    </antidote-modal>
  `
}

customElements.define('antidote-lab-action-buttons', component(LabActionButtons));

export default LabActionButtons;
