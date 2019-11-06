import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext, useState } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LiveLessonDetailsContext, LessonContext } from "/js/data.js";
import { lessonStage } from '/js/helpers/page-state.js';

function LabGuidanceButtons() {
  const lessonRequest = useContext(LessonContext);
  const detailsRequest = useContext(LiveLessonDetailsContext);
  const [modalContentType, setModalContentType] = useState(null);
  const hasDiagram = detailsRequest.completed && detailsRequest.data.LessonDiagram;
  const hasVideo = detailsRequest.completed && detailsRequest.data.LessonVideo;
  const hasObjective = lessonRequest.completed && lessonRequest.data.Stages[lessonStage].VerifyObjective;
  let diagramButton = '';
  let videoButton = '';
  let objectiveButton = '';

  if (hasDiagram) {
    diagramButton = html`
      <button class="btn cta" @click=${() => setModalContentType('diagram')}>
        Diagram
      </button>
    `;
  }

  if (hasVideo) {
    videoButton = html`
      <button class="btn cta" @click=${() => setModalContentType('video')}>
        Video
      </button>
    `;
  }

  if (hasObjective) {
    objectiveButton = html`
      <button class="btn cta" @click=${() => setModalContentType('objective')}>
        Objective
      </button>
    `;
  }

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      .btn.cta {
        padding: 5px 30px;
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
        <div class="video-wapper">
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