import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { syringeServiceRoot, serviceHost, collectionId } from "/js/helpers/page-state.js";
import { AllLessonContext, LessonPrereqContext, CoursePlanNameContext, CoursePlanStrengthsContext } from "/js/data.js";

function CoursePlan() {
  const allLessonsRequest = useContext(AllLessonContext);
  const prereqRequest = useContext(LessonPrereqContext);
  const [coursePlanName] = useContext(CoursePlanNameContext);
  const [strengths] = useContext(CoursePlanStrengthsContext);
  const prereqLessons = allLessonsRequest.succeeded && prereqRequest.succeeded
    ? prereqRequest.data.prereqs.map((prereqId) => allLessonsRequest.data.lessons.find((l) => l.LessonId === prereqId))
    : [];

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      .expertise {
        display: flex;
        align-items: center;
        text-transform: uppercase;
      }
      .expertise > img {
        margin-right: 5px;
      }
      .skill-1, .skill-2, .skill-3 {
        color: #c35b56;
      }
      .skill-4 {
        color: #ffcc66;
      }
      .skill-5 {
        color: #339966;
      }
    </style>
    
    <h1>${coursePlanName || 'Your'} Journey to Derick's Troubleshooting Wizardry</h1>
    <div class="path">
      ${prereqLessons.map((lesson, i) => html`
        <div class="path-numbers">
          <img src="/images/${i+1}.svg" alt="${i+1}"/>
        </div>
        <div class="canister secondary full-width">
          <h3>
            <a href="/labs?lessonId=${lesson.LessonId}&lessonStage=1">
              ${lesson.LessonName}
            </a>
          </h3>
          <p>${lesson.Description}</p>
          ${strengths ? html`
            <span class="expertise skill-${strengths[lesson.Slug]}">
              ${strengths[lesson.Slug] <= 3 ? html`
                <img src="/images/beginner-icon.svg" alt="beginner logo" />
                Let's get learning.
              ` : ''}
              ${strengths[lesson.Slug] === 4 ? html`
                <img src="/images/intermediate-icon.svg" alt="intermediate logo" />
                Let's do a quick review.
              ` : ''}
              ${strengths[lesson.Slug] === 5 ? html`
                <img src="/images/expert-icon.svg" alt="expert logo" />
                You're an expert!
              ` : ''}
            </span>
          `: ''}
        </div>      
      `)}
    </div> 
  `;
}

customElements.define('antidote-course-plan', component(CoursePlan));

export default CoursePlan;