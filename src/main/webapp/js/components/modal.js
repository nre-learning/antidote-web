import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';

function Modal({show}) {
  const modal = show === 'true'
    ? html`
      <div class="modal-wrapper">
        <div class="modal-container">
          <slot></slot>
        </div>
      </div>
    `
    : '';

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      /*todo move to nre-styles*/
      .modal-wrapper {
        position: fixed;
        z-index: 2;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    </style>
    ${modal}
  `;
}

Modal.observedAttributes = ['show'];

customElements.define('antidote-modal', component(Modal));

export default Modal;