import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { CoursePlanNameContext } from "../data.js";
import debounce from "../helpers/debounce.js";

function CoursePlanNameField() {
  const [name, setName] = useContext(CoursePlanNameContext);

  const change = debounce(function change() {
    setName(this.value.length > 0 ? this.value : null);
  }, 250);

  return html`
    <link rel="stylesheet" href="http://10.0.75.1:8081/styles.css" />
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