import { useLiveLessonDetails } from '/js/data.js';
import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { sessionId, lessonId, lessonStage, syringeServiceRoot} from "/js/helpers/page-state.js";
import { component } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import useFetch from '/js/helpers/use-fetch.js';

customElements.define('antidote-lab-context', component(() => {
  const lessonRequest = useFetch(`${syringeServiceRoot}/exp/lesson/${lessonId}`);
  const liveLessonRequest = useFetch(
    `${syringeServiceRoot}/exp/livelesson`,
    {
      method: 'POST',
      body: JSON.stringify({ lessonId, lessonStage, sessionId })
    }
  );
  const liveLessonDetailRequest = useLiveLessonDetails(
    liveLessonRequest.completed ? liveLessonRequest.data.id : null
  );

  return html`
    <style>
      :host, 
      antidote-lesson-context-provider,
      antidote-live-lesson-context-provider,
      antidote-live-lesson-details-context-provider {
        display: block;
        height: 100%;
        width: 100%;
      }
    </style>
    <antidote-lesson-context-provider .value=${lessonRequest}>
    <antidote-live-lesson-context-provider .value=${liveLessonRequest}>
    <antidote-live-lesson-details-context-provider .value=${liveLessonDetailRequest}>    
      <slot></slot>
    </antidote-live-lesson-details-context-provider>      
    </antidote-live-lesson-context-provider>      
    </antidote-lesson-context-provider>
  `
}));