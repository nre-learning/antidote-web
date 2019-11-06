import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js';
import { useEffect, useContext, component } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LiveLessonDetailsContext } from '../data.js';
import { serviceHost, syringeServiceRoot, lessonId, lessonStage, sessionId } from "../helpers/page-state.js";

// this needs to be global since it's explicitly referenced in the markdown
// this could eventually be scoped and bound to the appropriate buttons post-render
// rather than binding in the markup in the lesson guide markdown
document.runSnippetInTab = function runSnippetInTab(tabName, snippetIndex) {
  const tabSwitcherEl = document.querySelector('antidote-lab-tab-switcher');
  const tabsEl = document.querySelector('antidote-lab-tabs');
  const tabEl = tabsEl.shadowRoot.querySelector(`div[name=${tabName}]`);
  const guideEl = document.querySelector('antidote-lab-guide');
  const text = typeof snippetIndex === 'number'
    ? guideEl.shadowRoot.querySelectorAll('pre')[parseInt(snippetIndex)].innerText
    : snippetIndex.parentNode.previousElementSibling.innerText;
  const keysyms = Array.from(text).map((c) => {
    const codepoint = c.charCodeAt(0);
    return codepoint >= 0x0100
      ? 0x01000000 | codepoint
      : codepoint
  });

  tabSwitcherEl.setSelectedPresentation(tabEl);

  keysyms.forEach((keysym) => {
    tabEl.client.sendKeyEvent(1, keysym);
    tabEl.client.sendKeyEvent(0, keysym);
  });
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