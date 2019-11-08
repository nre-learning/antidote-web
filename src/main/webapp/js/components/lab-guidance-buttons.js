import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext, useState } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LiveLessonDetailsContext, LessonContext } from "../data.js";
import { lessonStage } from '../helpers/page-state.js';

function LabGuidanceButtons() {
  const lessonRequest = useContext(LessonContext);
  const detailsRequest = useContext(LiveLessonDetailsContext);
  const [modalContentType, setModalContentType] = useState(null);
  const hasDiagram = detailsRequest.succeeded && detailsRequest.data.LessonDiagram;
  const hasVideo = detailsRequest.succeeded && detailsRequest.data.LessonVideo;
  const hasObjective = lessonRequest.succeeded && lessonRequest.data.Stages[lessonStage].VerifyObjective;
  let diagramButton = '';
  let videoButton = '';
  let objectiveButton = '';

  if (hasDiagram) {
    diagramButton = html`
      <button class="btn secondary" @click=${() => setModalContentType('diagram')}>
        Diagram
      </button>
    `;
  }

  if (hasVideo) {
    videoButton = html`
      <button class="btn secondary" @click=${() => setModalContentType('video')}>
        Video
      </button>
    `;
  }

  if (hasObjective) {
    objectiveButton = html`
      <button class="btn secondary" @click=${() => setModalContentType('objective')}>
        Objective
      </button>
    `;
  }

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      .btn.secondary {      
        margin-right: 15px;
      }
      img {
        width: 100%;
      }
    </style>
    ${diagramButton}
    ${videoButton}
    ${objectiveButton}
    <antidote-modal show=${modalContentType !== null}>
      ${modalContentType === 'diagram' ? html`
        <h1>Lesson Diagram</h1>
        <img src=${detailsRequest.data.LessonDiagram} alt="lesson diagram"/>
      ` : ''}
      ${modalContentType === 'video' ? html`
        <h1>Lesson Video</h1>
        <div class="video-wrapper">
          <iframe src=${detailsRequest.data.LessonVideo} frameborder="0" class="video-embed"></iframe>
        </div>
      ` : ''}
      ${modalContentType === 'objective' ? html`
        <h1>Lesson Objective</h1>
        <p>${lessonRequest.data.Stages[lessonStage].VerifyObjective}</p>
      ` : ''}
      <button class="btn primary" @click=${() => setModalContentType(null)}>
        Close
      </button>
    </antidote-modal>
  `
}

customElements.define('antidote-lab-guidance-buttons', component(LabGuidanceButtons));

export default LabGuidanceButtons;