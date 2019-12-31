import { html } from 'lit-html';
import { component, useEffect, useContext } from 'haunted';
import { LiveLessonDetailsContext } from '../data.js';
import { syringeServiceRoot, serviceHost, lessonId, sessionId } from '../helpers/page-state.js';
import { derivePresentationsFromLessonDetails } from '../helpers/derivations.js';
import debounce from '../helpers/debounce.js';

function LabTabs() {
  const detailsRequest = useContext(LiveLessonDetailsContext);
  const presentations = derivePresentationsFromLessonDetails(detailsRequest);
  const selectedPresentationId = 0;

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      :host {
        position: relative;
        overflow: hidden;
        flex-grow: 1;     
      }
      :host > div {
        position: absolute;         
        visibility: hidden;
        width: 100%;
        height: 100%;
        background: #262c2c;
        padding: 10px 20px 5px 20px;
      }
      :host > div[selected] {
        visibility: visible;
      }
    </style>
    ${presentations.map((pres, i) => html`
      <div ?selected=${i === selectedPresentationId}
           name=${pres.name}> 
        <antidote-terminal
            host=${pres.host}
            port=${pres.port} />     
      </div>
    `)}
  `;
}

customElements.define('antidote-lab-tabs', component(LabTabs));

export default LabTabs;
