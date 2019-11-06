import '/js/data.js'; // make sure all contexts are defined
import { html } from 'https://unpkg.com/lit-html/lit-html.js';
import { component, useState } from 'https://unpkg.com/haunted/haunted.js';
import { syringeServiceRoot } from "/js/helpers/page-state.js";
import useFetch from '/js/helpers/use-fetch.js'

customElements.define('antidote-collections-context', component(() => {
  const allCollectionRequest = useFetch(`${syringeServiceRoot}/exp/collection`);
  const [filteringState, setFilteringState] = useState({
    searchString: null,
    Type: null,
  });

  return html`
    <style>
      :host, 
      antidote-all-collection-context-provider,
      antidote-collection-filtering-context-provider {
        display: block;
        height: 100%;
        width: 100%;
      }
    </style>
    <antidote-all-collection-context-provider .value=${allCollectionRequest}>
    <antidote-collection-filtering-context-provider .value=${[filteringState, setFilteringState]}>
      <slot></slot>
    </antidote-collection-filtering-context-provider>
    </antidote-all-collection-context-provider>
  `
}));