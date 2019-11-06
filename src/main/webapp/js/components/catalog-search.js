import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LessonFilteringContext } from "../data.js";
import debounce from "../helpers/debounce.js";

function CatalogSearch() {
  const [filterState, setFilterState] = useContext(LessonFilteringContext);

  const change = debounce(function change() {
    filterState.searchString = this.value.length > 0 ? this.value.toLowerCase() : null;
    setFilterState(filterState);
  }, 500);

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <label>
      <span>Search</span>
      <input type="text" placeholder="Lesson Title"
        @keyup=${change} @change=${change} />
    </label>
  `;
}

customElements.define('antidote-catalog-search', component(CatalogSearch));