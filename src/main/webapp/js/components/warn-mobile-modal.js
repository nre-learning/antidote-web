import { html } from 'lit-html';
import { component, useState } from 'haunted';

function WarnMobile() {
  const isMobile = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(navigator.userAgent) ||
                   /\b(Android|Windows Phone|iPad|iPod)\b/i.test(navigator.userAgent);
  const [open, setOpen] = useState(true);

  return isMobile ? html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
      <antidote-modal show=${open}>
        <h1>You Appear To Be Using A Mobile Device</h1>
        <p>
          NRE Labs doesn't yet support mobile devices. You can continue, but 
          the lessons likely won't work due to issues around input handling. 
          Mobile support will arrive in the near future.
        </p>
        <button class="btn primary" @click=${()=>setOpen(false)}>
          Close
        </button>
      </antidote-modal>
    </div>
  `: html``;
}

customElements.define('antidote-warn-mobile', component(WarnMobile));

export default WarnMobile;