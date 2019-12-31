import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { component, useContext, useState, useEffect } from 'haunted';
import { syringeServiceRoot, serviceHost, collectionId } from "../helpers/page-state.js";
import { AllLessonContext, LessonPrereqContext, CoursePlanStrengthsContext } from "../data.js";

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
  const prereqLessons = allLessonsRequest.succeeded && prereqRequest.succeeded && prereqRequest.data.prereqs
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
      .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;      
      }  
      .btn {      
        width: 44%;
      }
    </style>    

    <antidote-modal show=${open && prereqSkills.length > 0}>   
      <h1>Identify your strengths</h1>
      <p>Answer the following questions, so we can construct the lesson plan 
      most relevant to you!</p>
      
      ${prereqSkills.map((skill) => html`
        <h3>How well do you know ${skill}?</h3>
        <ul class="pagination-list">  
          <li class=${classMap({active: localStrengthsState[skill] === 1})} 
              data-line="Not at all"
              @click=${setStrength(skill, 1)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 2})}
              data-line="Beginner" 
              @click=${setStrength(skill, 2)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 3})}
              data-line="Intermediate" 
              @click=${setStrength(skill, 3)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 4})}
              data-line="Advanced" 
              @click=${setStrength(skill, 4)}></li>
          <li class=${classMap({active: localStrengthsState[skill] === 5})}
              data-line="Expert" 
              @click=${setStrength(skill, 5)}></li>
        </ul>
      `)}
      
      <div class="buttons">
        <button class="btn support" @click=${skip}>Skip</button>
        <button class="btn primary" @click=${submit}>Submit</button>
      </div>
    </antidote-modal>
  `;
}

customElements.define('antidote-course-plan-strength-modal', component(CoursePlanStrengthModal));

export default CoursePlanStrengthModal;