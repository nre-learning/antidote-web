import { html } from 'lit-html';
import { component, useContext, useMemo } from 'haunted';
import { LessonContext, LiveLessonDetailsContext } from '../data.js';

function getRandomModalMessage() {
  // Include memes? https://imgur.com/gallery/y0LQyOV
  var messages = [
    "Sweeping technical debt under the rug...",
    "Definitely not mining cryptocurrency in your browser...",
    "Duct-taping 53 javascript frameworks together...",
    "Dividing by < ERR - DIVIDE BY ZERO. SHUTTING DOWN. AND I WAS JUST LEARNING TO LOVE.....>",
    "try { toilTime / automatingTime; } catch (DivideByZeroException e) { panic(“More NRE Labs”); }",
    "Thank you for your call. You've reached 1-800-NRE-Labs. Please hold for Dr. Automation.",
    "I'd tell you a joke about UDP, but you probably wouldn't get it.",
    "Now rendering an NRE's best friend for you to play fetch with.",
    "Our Lab-Retriever, CloudDog, is still a puppy. Thanks for your patience.",
    "Calculating airspeed velocity of an unladen swallow..."
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function LabModal() {
  const lessonRequest = useContext(LessonContext);
  const detailRequest = useContext(LiveLessonDetailsContext);
  const content = useMemo(() => {
    if (lessonRequest.error) {
      console.error(lessonRequest.error);
      return html`
      <h3>Error retrieving lesson: ${lessonRequest.error}</h3>
    `;
    }
    else if (detailRequest.error) {
      console.error(detailRequest.error);
      return html`
      <h3>Error while waiting for lesson to initialize: ${detailRequest.error}</h3>
    `;
    }
    else if (!lessonRequest.completed) {
      return html`
      <h3>Loading lesson...</h3>
      <img src="/images/flask.gif" alt="loading flask" />
      <p>${getRandomModalMessage()}</p>
    `;
    }
    else if (!detailRequest.completed) {
      return html`
      <h3>Waiting for lesson to finish initializing...</h3>
      <img src="/images/flask.gif" alt="loading flask" />
      <p>${getRandomModalMessage()}</p>
    `;
    }
    return '';
  }, [
    lessonRequest.completed,
    detailRequest.completed,
    lessonRequest.error,
    detailRequest.error,
  ]);

  const detailRequestStatus = detailRequest && detailRequest.data && detailRequest.data.LiveLessonStatus;
  const healthy = (detailRequest && detailRequest.data && detailRequest.data.HealthyTests) || 0;
  const total =  (detailRequest && detailRequest.data && detailRequest.data.TotalTests) || 0;
  const detailRequestProgressFragment = useMemo(() => {
    switch (detailRequestStatus) {
      case "INITIAL_BOOT":
        return html`
          <antidote-progress-bar percent="33"></antidote-progress-bar>
          <p>
            Waiting for lesson endpoints to become reachable... 
            ${total > 0 ? `(${healthy}/${total})` : ''}
          </p>
        `;

      case "CONFIGURATION":
        return html`
          <antidote-progress-bar percent="66"></antidote-progress-bar>
          <p>Configuring endpoints for this lesson...</p>
        `;

      default:
        return '';
      }
  }, [detailRequestStatus, healthy, total]);

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      img {
        display: block;      
        object-fit: contain;
        margin: 30px auto 0 auto;
      }
    </style>
    <antidote-modal show=${content !== ''}>
      ${content}
      ${detailRequestProgressFragment}
    </antidote-modal>
  `;
}

customElements.define('antidote-lab-modal', component(LabModal));

export default LabModal;