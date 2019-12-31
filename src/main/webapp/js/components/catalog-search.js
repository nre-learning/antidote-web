import { html } from 'lit-html';
import { component, useContext } from 'haunted';
import { LessonFilteringContext } from "../data.js";
import debounce from "../helpers/debounce.js";

function CatalogSearch() {
  const [filterState, setFilterState] = useContext(LessonFilteringContext);

  const change = debounce(function change() {
    filterState.searchString = this.value.length > 0 ? this.value.toLowerCase() : null;
    setFilterState(filterState);
  }, 200);

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      :host {
        display: block;
      }
    </style>  
    <label>
      <span>Search</span>     
      <input type="text" placeholder="Lesson Title"
        @keyup=${change} @change=${change} />
    </label>
  `;
}

customElements.define('antidote-catalog-search', component(CatalogSearch));