import { html } from 'https://unpkg.com/lit-html/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted/haunted.js';
import { LessonFilteringContext } from "/js/data.js";
import debounce from "/js/helpers/debounce.js";

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