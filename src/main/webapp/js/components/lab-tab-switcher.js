import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { useState, useContext, useEffect, component } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LiveLessonDetailsContext } from '/js/data.js';
import { derivePresentationsFromLessonDetails } from '/js/helpers/derivations.js';

function LabTabSwitcher() {
  const detailsRequest = useContext(LiveLessonDetailsContext);
  const presentations = derivePresentationsFromLessonDetails(detailsRequest);
  const [selectedPresentationId, setSelectedPresentationId] = useState(0);

  // add to component so other non-child components can trigger a tab change
  this.setSelectedPresentationId = setSelectedPresentationId;
  this.setSelectedPresentation = function (el) {
    const tabs = Array.from(el.parentNode.children).filter((el) => el.tagName === 'DIV');
    this.setSelectedPresentationId(tabs.indexOf(el));
  };

  // activate selected tab post-render
  useEffect(() => {
    const tabs = Array.from(document.querySelector('antidote-lab-tabs')
      .shadowRoot.children).filter((el) => el.tagName === 'DIV');

    if (tabs.length) {
      tabs.forEach((t) => t.removeAttribute('selected'));
      tabs[selectedPresentationId].setAttribute('selected', '');
    }
  });

  // todo: confirm slotting a stylesheet like this works as expected :/
  // todo: move stylesheets to NRE-branded usages of this component
  return html`
    <slot name="stylesheets">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=PT+Mono|Roboto+Condensed:300,400|Roboto:300,400,500&display=fallback" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    </slot>
    <style>     
      ul {
        display: flex;
        background: #d8d8d8;
        font-size: 21px;
        list-style: none;        
      }
      li {
        cursor: pointer;
        padding: 5px 20px;       
      }
      li[selected] {
        color: white;
        background-color: #262c2c;
        border-radius: 6px 6px 0 0;
      }
      h3 {
        margin: 0;
      }
    </style>
    <ul>
      ${presentations.map((pres, i) => html`
        <li @click=${() => setSelectedPresentationId(i)}
            ?selected=${i === selectedPresentationId}>
          <h3>${pres.type.toUpperCase()} - ${pres.name}</h3>
        </li>
      `)}
    </ul>
  `
}

customElements.define('antidote-lab-tab-switcher', component(LabTabSwitcher));

export default LabTabSwitcher;