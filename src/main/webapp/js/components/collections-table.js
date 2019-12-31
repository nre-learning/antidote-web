import { html } from 'lit-html';
import { component, useContext} from 'haunted';
import { AllCollectionContext, CollectionFilteringContext } from "../data.js";

function doFiltering(collections, filteringState) {
  const filterEntries = Object.entries(filteringState);

  return collections.filter((collection) => {
    return filterEntries.reduce((acc, [filterProp, filterValue]) => {
      if (filterValue !== null) {
        if (filterProp === 'searchString') {
          return acc && collection.Title.toLowerCase().indexOf(filterValue) > -1;
        } else {
          return acc && collection[filterProp] === filterValue;
        }
      } else {
        return acc;
      }
    }, true);
  });
}

function CollectionsTable() {
  const allCollectionRequest = useContext(AllCollectionContext);
  const [filteringState] = useContext(CollectionFilteringContext);
  const collections = allCollectionRequest.succeeded
    ? doFiltering(allCollectionRequest.data.collections, filteringState)
    : [];

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      /*todo: move to nre theme?*/
      /*todo: remove row hover ughhhhh */
      .tag {
        display: inline-flex;
        align-items: center;       
        padding: 2px 5px;
        word-spacing: normal;
        border: 2px solid #0096c3;
        color: #0096c3;
        background-color: white;
        margin-top: 10px;
      }    
      .tags {
        word-spacing: 10px;
        padding: 0 10px 10px 8px;
      }
    </style>
    <table class="catalog">
      <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
      </thead>
      <tbody>
      ${collections.map((collection) => html`
        <tr>
          <td class="title">
            <a href="view.html?collectionId=${collection.Id}">
              ${collection.Title}
            </a>
          </td>
          <td>${collection.BriefDescription}</td>
        </tr>
      `)}
      </tbody>
    </table>
    `;
}

customElements.define('antidote-collections-table', component(CollectionsTable));

export default CollectionsTable;