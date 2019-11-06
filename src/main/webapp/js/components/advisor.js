import '/js/data.js'; // make sure all contexts are defined
import { html } from 'https://unpkg.com/lit-html/lit-html.js';
import { component, useEffect, useRef } from 'https://unpkg.com/haunted/haunted.js';
import { syringeServiceRoot, serviceHost, collectionId } from "/js/helpers/page-state.js";
import useFetch from '/js/helpers/use-fetch.js'

function Advisor() {
  const awesompleteRef = useRef(null);
  const allLessonRequest = useFetch(`${syringeServiceRoot}/exp/lesson`);
  const lessonOptions = allLessonRequest.succeeded
    ? allLessonRequest.data.lessons.map((l) => ({
      label: l.LessonName,
      value: l.LessonId
    }))
    : [];

  if (lessonOptions.length > 0) {
    useEffect(() => {
      const input = this.shadowRoot.querySelector('input');
      awesompleteRef.current = new Awesomplete(input, {
        list: lessonOptions,
        minChars: 0
      });
    }, []);
  }

  function select(ev) {
    const lessonId = ev.text.value;
    // todo: figure out host for this ughhh
    location.href = `/advisor/courseplan.html?lessonId=${lessonId}`;
  }

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.5/awesomplete.css" rel="stylesheet "/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.5/awesomplete.base.css" rel="stylesheet" />
    <style>
      .awesomplete > ul:before,
      .input-wrapper .awesomplete:before{
        display: none;
      }
    </style>
    <div class="advisor canister secondary">
      <h1>
        <span>NRE Labs Advisor</span>
        <span class="subtitle">Get a customized lesson path</span>
      </h1>
    
      <div class="input-wrapper">
        <input type="text" placeholder="I want to learn..."
            @awesomplete-select=${select}
            class="awesomeplete" />
      </div>
    
      <button class="btn cta">Search Lesson Content</button>
    
      <aside class="small">
        Use the box above to say what you want to learn, and we’ll work with you
        to build a relevant learning path. Try “Python” or “StackStorm”!
      </aside>
    </div>
  `;
}

customElements.define('antidote-advisor', component(Advisor));

export default Advisor;