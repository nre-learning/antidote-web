import { html } from 'https://unpkg.com/lit-html/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted/haunted.js';
import { LessonContext } from '/js/data.js';
import { lessonId, lessonStage } from "/js/helpers/page-state.js";

const navTo = (destination) => () => {
  if (typeof destination === 'number') {
    window.location.href = `/labs/?lessonId=${lessonId}&lessonStage=${destination}`;
  } else if (destination === 'previous') {
    window.location.href = `/labs/?lessonId=${lessonId}&lessonStage=${lessonStage - 1}`;
  } else if (destination === 'next') {
    window.location.href = `/labs/?lessonId=${lessonId}&lessonStage=${lessonStage + 1}`;
  }
};

function LabStageSelector() {
  const lessonRequest = useContext(LessonContext);
  const stages = lessonRequest.data ? lessonRequest.data.Stages.slice(1) : [];
  const disablePrevious = lessonStage === 1 ? 'disabled' : '';
  const disableNext = lessonStage === stages.length ? 'disabled' : '';

  return stages.length > 1 ? html`
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=PT+Mono|Roboto+Condensed:300,400|Roboto:300,400,500&display=fallback" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      /* todo: move to nre-styles */
      :host {
        margin: 0 50px 50px 50px !important;
      }
      .pagination-list {
        margin-top: 30px;
        width: auto !important;
        position: relative;
        z-index: 0; 
        /*god damn these hacks*/
      }
      .pagination-list > li:first-child {
        margin-left: 0 !important;
      }
      .pagination-list > li:last-child {
        margin-right: 0 !important;
      }
      .pagination-list li::before {
        top: 7px !important;
      }
      .buttons {
        display: flex;
        justify-content: space-between;      
      }  
    </style>
    <div class="buttons">
      <button class="btn secondary ${disablePrevious}"
        @click=${navTo('previous')}>
        < Previous
      </button>
      <button class="btn primary ${disableNext}"
        @click=${navTo('next')}>
        Next >
      </button>
    </div>
    <ul class="pagination-list">
      ${stages.map((stage, i) => {
        const clss = (i+1) === lessonStage ? 'active' : '';
        return html`
          <li class="${clss}" data-line="Part ${i+1}"
            @click="${navTo(i+1)}">
          </li>
        `;
      })}    
    </ul>   
  ` : html``;
}

customElements.define('antidote-lab-stage-selector', component(LabStageSelector));

export default LabStageSelector;