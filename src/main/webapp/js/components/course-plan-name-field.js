import { html } from 'lit-html';
import { component, useContext } from 'haunted';
import { CoursePlanNameContext } from "../data.js";
import debounce from "../helpers/debounce.js";

function CoursePlanNameField() {
  const [name, setName] = useContext(CoursePlanNameContext);

  const change = debounce(function change() {
    setName(this.value.length > 0 ? this.value : null);
  }, 200);

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      :host {
        display: block;       
      }
    </style>  
    <input type="text" placeholder="Name"
        @keyup=${change} @change=${change} value=${name || ''} />
  `;
}

customElements.define('antidote-course-plan-name-field', component(CoursePlanNameField));