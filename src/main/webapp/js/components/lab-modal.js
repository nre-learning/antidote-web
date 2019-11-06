import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useContext } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LessonContext, LiveLessonContext, LiveLessonDetailsContext } from '/js/data.js';

// todo: fix error handling!!!!! request.completed && !request.error
// maybe add request.succeeded

// todo: show these and bubbling flask graphic while loading
// function getRandomModalMessage() {
//   // Include memes? https://imgur.com/gallery/y0LQyOV
//   var messages = [
//     "Sweeping technical debt under the rug...",
//     "Definitely not mining cryptocurrency in your browser...",
//     "Duct-taping 53 javascript frameworks together...",
//     "Dividing by < ERR - DIVIDE BY ZERO. SHUTTING DOWN. AND I WAS JUST LEARNING TO LOVE.....>",
//     "try { toilTime / automatingTime; } catch (DivideByZeroException e) { panic(“More NRE Labs”); }",
//     "Thank you for your call. You've reached 1-800-NRE-Labs. Please hold for Dr. Automation.",
//     "I'd tell you a joke about UDP, but you probably wouldn't get it.",
//     "Now rendering an NRE's best friend for you to play fetch with.",
//     "Our Lab-Retriever, CloudDog, is still a puppy. Thanks for your patience.",
//     "Calculating airspeed velocity of an unladen swallow..."
//   ];
//   return messages[Math.floor(Math.random() * messages.length)];
// }

// todo: connect this with new hook based state
// todo: show loading bar?
// function updateProgressModal(liveLessonDetails) {
//   var pBar = document.getElementById("liveLessonProgress");
//
//   var statusMessageElement = document.getElementById("lessonStatus");
//   switch (liveLessonDetails.LiveLessonStatus) {
//     case "INITIAL_BOOT":
//       var healthy = 0;
//       var total = 0;
//       if (liveLessonDetails.HealthyTests != null){
//         healthy = liveLessonDetails.HealthyTests
//       }
//       if (liveLessonDetails.TotalTests != null){
//         total = liveLessonDetails.TotalTests
//       }
//       statusMessageElement.innerText = "Waiting for lesson endpoints to become reachable...(" + healthy + "/" + total + ")"
//       pBar.style = "width: 33%"
//       break;
//     case "CONFIGURATION":
//       statusMessageElement.innerText = "Configuring endpoints for this lesson..."
//       pBar.style = "width: 66%"
//       break;
//     case "READY":
//       statusMessageElement.innerText = "Almost ready!"
//       pBar.style = "width: 100%"
//       break;
//     default:
//       // Shouldn't need this since we're getting rid of the default nil value on the syringe side, but just in case...
//       var healthy = 0;
//       var total = 0;
//       if (liveLessonDetails.HealthyTests != null){
//         healthy = liveLessonDetails.HealthyTests
//       }
//       if (liveLessonDetails.TotalTests != null){
//         total = liveLessonDetails.TotalTests
//       }
//       statusMessageElement.innerText = "Waiting for lesson endpoints to become reachable...(" + healthy + "/" + total + ")"
//       pBar.style = "width: 33%"
//   }
// }


function LabModal() {
  const lessonRequest = useContext(LessonContext);
  const liveLessonRequest = useContext(LiveLessonContext);
  const detailRequest = useContext(LiveLessonDetailsContext);
  let content = '';

  if (lessonRequest.error) {
    // todo: print real error message somehow
    // errorMessage.innerText = "Error retrieving lesson stages: " + lessonResponse["error"];
    content = html`
      <h3>Error while fetching lesson.</h3>
    `;
  }
  else if (liveLessonRequest.error) {
    // todo: print real error message somehow
    content = html`
      <h3>Error while fetching live lesson.</h3>
    `;
  }
  else if (detailRequest.error) {
    // todo: print real error message somehow
    content = html`
      <h3>Error while fetching live lesson details.</h3>
    `;
  }
  else if (!lessonRequest.completed) {
    content = html`
      <h3>Loading lesson...</h3>
    `;
  }
  else if (!liveLessonRequest.completed) {
    content = html`
      <h3>Loading live lesson...</h3>
    `;
  }
  else if (!detailRequest.completed) {
    content = html`
      <h3>Loading live lesson details...</h3>
    `;
  }

  return html`
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=PT+Mono|Roboto+Condensed:300,400|Roboto:300,400,500&display=fallback" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <antidote-modal show=${content !== ''}>
      ${content}
    </antidote-modal>
  `;
}

customElements.define('antidote-lab-modal', component(LabModal));

export default LabModal;