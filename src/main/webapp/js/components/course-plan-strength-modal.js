import { html } from 'https://unpkg.com/lit-html/lit-html.js';
import { classMap } from 'https://unpkg.com/lit-html/directives/class-map.js';
import { component, useContext, useState } from 'https://unpkg.com/haunted/haunted.js';
import { syringeServiceRoot, serviceHost, collectionId } from "/js/helpers/page-state.js";
import { AllLessonContext, LessonPrereqContext, CoursePlanStrengthsContext } from "/js/data.js";

function getDefaultStrengthsState(prereqSkills) {
  return prereqSkills.reduce((acc, skill) => {
    acc[skill] = 1;
    return acc;
  }, {})
}

function CoursePlanStrengthModal() {
  const [open, setOpen] = useState(true);
  const allLessonsRequest = useContext(AllLessonContext);
  const prereqRequest = useContext(LessonPrereqContext);
  const [_, setExportedStrengthsState] = useContext(CoursePlanStrengthsContext);
  const prereqLessons = allLessonsRequest.succeeded && prereqRequest.succeeded
    ? prereqRequest.data.prereqs.map((prereqId) => allLessonsRequest.data.lessons.find((l) => l.LessonId === prereqId))
    : [];
  const prereqSkills = prereqLessons.map((l) => l.Slug);
  const [localStrengthsState, setLocalStrengthsState] = prereqSkills.length > 0
    ? useState(getDefaultStrengthsState(prereqSkills))
    : [{}, null];

  function setStrength(skill, score) {
    return () => {
      localStrengthsState[skill] = score;
      setLocalStrengthsState(localStrengthsState);
    }
  }

  function submit() {
    setExportedStrengthsState(localStrengthsState);
    setOpen(false);
  }

  function skip() {
    setExportedStrengthsState(getDefaultStrengthsState(prereqSkills));
    setOpen(false);
  }

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      /* todo: move to nre-styles */
      .pagination-list {
        margin-top: 30px;
        width: auto !important;
        position: relative;
        z-index: 0; 
        /*god damn these hacks*/
      }
      .pagination-list > li:first-child {
        margin-left: 0 !important;
      }
      .pagination-list > li:last-child {
        margin-right: 0 !important;
      }
      .pagination-list li::before {
        top: 7px !important;
      }
      .buttons {
        display: flex;
        justify-content: space-between;      
      }  
    </style>    

    <antidote-modal show=${open}>
      <h1>Identify your strengths</h1>
      <p>Answer the following questions, so we can construct the lesson plan 
      most relevant to you!</p>
      
      ${prereqSkills.map((skill) => html`
        <h3>How well do you know ${skill}?</h3>
        <ul class="pagination-list">  
          <li class=${classMap({active: localStrengthsState[skill] === 1})} 
              @click=${setStrength(skill, 1)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 2})} 
              @click=${setStrength(skill, 2)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 3})} 
              @click=${setStrength(skill, 3)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 4})} 
              @click=${setStrength(skill, 4)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 5})} 
              @click=${setStrength(skill, 5)}></li>
        </ul>
      `)}
      
      <button class="btn secondary" @click=${skip}>Skip</button>
      <button class="btn primary" @click=${submit}>Submit</button>
    </antidote-modal>
  `;
}

customElements.define('antidote-course-plan-strength-modal', component(CoursePlanStrengthModal));

export default CoursePlanStrengthModal;