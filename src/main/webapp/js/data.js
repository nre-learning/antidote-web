import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { State, useState, useEffect, useContext, createContext, component } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';

export const LessonContext = createContext({});
export const LiveLessonDetailsContext = createContext({});
export const AllLessonContext = createContext({});
export const LessonFilteringContext = createContext([]);
export const AllCollectionContext = createContext({});
export const CollectionFilteringContext = createContext([]);
export const CoursePlanNameContext = createContext([]);
export const CoursePlanStrengthsContext = createContext([]);
export const LessonPrereqContext = createContext([]);

customElements.define('antidote-lesson-context-provider', LessonContext.Provider);
customElements.define('antidote-live-lesson-details-context-provider', LiveLessonDetailsContext.Provider);
customElements.define('antidote-all-lesson-context-provider', AllLessonContext.Provider);
customElements.define('antidote-lesson-filtering-context-provider', LessonFilteringContext.Provider);
customElements.define('antidote-all-collection-context-provider', AllCollectionContext.Provider);
customElements.define('antidote-collection-filtering-context-provider', CollectionFilteringContext.Provider);
customElements.define('antidote-course-plan-name-context-provider', CoursePlanNameContext.Provider);
customElements.define('antidote-course-plan-strengths-context-provider', CoursePlanStrengthsContext.Provider);
customElements.define('antidote-lesson-prereq-context-provider', LessonPrereqContext.Provider);