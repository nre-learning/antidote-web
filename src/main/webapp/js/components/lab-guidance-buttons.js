import { html } from 'https://unpkg.com/lit-html/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted/haunted.js';
import { LiveLessonDetailsContext, LessonContext } from "/js/data.js";
import { lessonStage } from '/js/helpers/page-state.js';

function LabGuidanceButtons() {
  const lessonRequest = useContext(LessonContext);
  const detailsRequest = useContext(LiveLessonDetailsContext);
  const hasDiagram = detailsRequest.completed && detailsRequest.data.LessonDiagram;
  const hasVideo = detailsRequest.completed && detailsRequest.data.LessonVideo;
  const hasObjective = lessonRequest.completed && lessonRequest.data.Stages[lessonStage].VerifyObjective;
  let diagramButton = '';
  let videoButton = '';
  let objectiveButton = '';

  if (hasDiagram) {
    // todo: show liveLessonDetails.LessonDiagram as popup
    diagramButton = html`
      <button class="btn cta">Diagram</button>
    `;
  }

  if (hasVideo) {
    // todo: show liveLessonDetails.LessonVideo as popup
    videoButton = html`
      <button class="btn cta">Video</button>
    `;
  }

  if (hasObjective) {
    // todo: show stage.VerifyObjective as tooltip
    objectiveButton = html`
      <button class="btn cta">Objective</button>
    `;
  }

  return html`
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=PT+Mono|Roboto+Condensed:300,400|Roboto:300,400,500&display=fallback" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      .btn.cta {
        padding: 5px 30px;
        margin-right: 15px;
      }
    </style>
    ${diagramButton}
    ${videoButton}
    ${objectiveButton}
  `
}

customElements.define('antidote-lab-guidance-buttons', component(LabGuidanceButtons));

export default LabGuidanceButtons;