import { html } from 'lit-html';
import { component } from 'haunted';
import { syringeServiceRoot } from "../helpers/page-state.js";
import useFetch from "../helpers/use-fetch.js";

function PTRBanner() {
  const showPTR = location.hostname.startsWith('ptr');

  if (showPTR) {
    const syringeInfoRequest = useFetch(`${syringeServiceRoot}/exp/syringeinfo`);
    const commits = syringeInfoRequest.succeeded
      ? {
        antidote: syringeInfoRequest.data.antidoteSha,
        antidoteweb: window.COMMIT_HASH,
        syringe: syringeInfoRequest.data.buildSha,
      }
      : null;

    return commits ? html`
    <style>
      #ptrBanner {
        position: fixed;
        bottom: 0;
        width: 100%;
        background: black;
        color: red;
        height: 27px;       
      }
    </style>
    <div id="ptrBanner">
      NRE Labs Public Test Realm. 
      Curriculum:
      <a href="https://github.com/nre-learning/nrelabs-curriculum/commit/${commits.antidote}">
        ${commits.antidote.substring(0, 7)}
      </a>  
      | Antidote-Web:
      <a href="https://github.com/nre-learning/antidote-web/commit/${commits.antidoteweb}">
        ${commits.antidoteweb.substring(0, 7)}
      </a> 
      | Syringe:
      <a href="https://github.com/nre-learning/syringe/commit/${commits.syringe}">
        ${commits.syringe.substring(0, 7)}
      </a>  
    </div>
  ` : html``;
  } else {
    return html``;
  }
}

customElements.define('antidote-ptr-banner', component(PTRBanner));

export default PTRBanner;