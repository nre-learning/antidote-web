// trigger modal indicating to a user that they should upgrade if their browser doesn't support modules
const modalWrapper = document.createElement('div');
modalWrapper.classList.add('modal-wrapper');

const modal = document.createElement('div');
modal.classList.add('modal-container');
modalWrapper.appendChild(modal);

const header = document.createElement('h1');
header.innerText = 'NRE Labs Uses JS Modules';
modal.appendChild(header);

const body = document.createElement('p');
body.innerHTML = 'To use NRE Labs your browser must support the '
               + '<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules">JS module standard.</a> '
               + 'Supported browsers include the current versions of all the major browsers: '
               + 'Chrome, Edge, Firefox, Safari & Opera.<br/>'
               + 'If you believe you\'re on a supported version of one of the '
               + 'listed browsers and you\'re still seeing this message, contact '
               + 'us at: <a href="mailto:nrelabs.info@gmail.com">nrelabs.info@gmail.com</a>';
modal.appendChild(body);

window.addEventListener('DOMContentLoaded', function() {
  document.body.appendChild(modalWrapper);
});