import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { useContext, component } from 'haunted';
import { LiveLessonDetailsContext } from '../data.js';
import { serviceHost, lessonId, lessonStage, sessionId } from "../helpers/page-state.js";
import showdown from 'showdown';

// this function currently needs to be global since it's explicitly referenced in guide markdown content
// this could eventually be scoped and bound to the appropriate buttons post-render
// rather than binding in the markup in the lesson guide markdown
document.runSnippetInTab = function runSnippetInTab(tabName, snippetIndex) {
  const tabSwitcherEl = document.querySelector('antidote-lab-tab-switcher');
  const guideEl = document.querySelector('antidote-lab-guide');
  const tabEl = document.querySelector('antidote-lab-tabs')
      .shadowRoot.querySelector(`div[name=${tabName}]`);
  const terminalEl = tabEl.querySelector('antidote-terminal');
  const text = typeof snippetIndex === 'number'
    ? guideEl.shadowRoot.querySelectorAll('pre')[parseInt(snippetIndex)].innerText
    : snippetIndex.parentNode.previousElementSibling.innerText;

  tabSwitcherEl.setSelectedPresentation(tabEl);
  terminalEl.run(text);
};

function LabGuide() {
  const lessonDetailsRequest = useContext(LiveLessonDetailsContext);
  let guideContent = "";

  if (lessonDetailsRequest.succeeded) {
    if (lessonDetailsRequest.data.JupyterLabGuide) {
      const path = `/notebooks/stage${lessonStage}/notebook.ipynb`;
      const url = `${serviceHost}/${lessonId}-${sessionId}-ns-jupyterlabguide${path}`;

      guideContent = html`<iframe src="${url}"></iframe>`;
    }
    else if (lessonDetailsRequest.data.LabGuide) {
      const converter = new showdown.Converter();

      guideContent = unsafeHTML(
        '<div>'+converter.makeHtml(lessonDetailsRequest.data.LabGuide)+'</div>'
      );
    }
  }

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      :host {
        flex-grow: 1;
      }
      :host > div {
        padding: 30px 40px 40px 40px;
      }     
      iframe {
        height: 100%;
        width: 100%;
        border: none;
      }
    </style>
    ${guideContent}
  `;
}

customElements.define('antidote-lab-guide', component(LabGuide));

export default LabGuide;
