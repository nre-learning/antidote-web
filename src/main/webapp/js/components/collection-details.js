import '/js/data.js'; // make sure all contexts are defined
import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useState } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { syringeServiceRoot, collectionId } from "/js/helpers/page-state.js";
import useFetch from '/js/helpers/use-fetch.js'

function CollectionDetails() {
  const request = useFetch(`${syringeServiceRoot}/exp/collection/${collectionId}`);

  return html` 
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      h1 {
        text-align: center;
      }
    </style>
    ${request.succeeded ? html`
      <h1>${request.data.Title}</h1>
      
      <img src="${request.data.Image}" />
      
      <p>${request.data.LongDescription}</p>
      
      <table>
        <tr><td>Type</td><td>${request.data.Type}</td></tr>
        <tr>
          <td>Website</td>
          <td>
            <a href="${request.data.Website}">${request.data.Website}</a>
          </td>
        </tr>
        <tr>
          <td>Email</td>
          <td>
            <a href="mailto:${request.data.ContactEmail}">${request.data.ContactEmail}</a>
          </td>
        </tr>
      </table>
      
      <div class="canister medium-gray">
        ${request.data.Lessons ? html`
          <h3>Lessons</h3>
          ${request.data.Lessons.map((lesson, i) => html`
            <div>
              <a href="/labs/?lessonId=${lesson.lessonId}&lessonStage=1">
                ${lesson.lessonName}
              </a>
              <p>
                ${lesson.lessonDescription}
              </p>
            </div>
            ${request.data.Lessons.length !== i + 1 ? html`<hr/>` : ''}
          `)}        
        ` : html `
          <h3>Coming Soon!</h3>
        `}             
      </div>
    ` : ''}
  `
}

customElements.define('antidote-collection-details', component(CollectionDetails));

export default CollectionDetails;