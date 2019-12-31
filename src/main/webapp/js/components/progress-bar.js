import { html } from 'lit-html';
import { component } from 'haunted';

function ProgressBar({percent}) {
  return html`
    <style>
      @keyframes animate-stripes {
          0% {
              background-position: 0 0;
          }
      
          100% {
              background-position: 60px 0;
          }
      }
      
      .progress-bar {
          background-color: #1a1a1a;
          height: 30px;
          width: 100%;
          margin: 20px auto 0 auto;
          border-radius: 5px;
          box-shadow: 0 1px 5px #000 inset, 0 1px 0 #444;
      }
      
      .stripes {
          background-size: 30px 30px;
          background-image: linear-gradient(
              135deg,
              rgba(255, 255, 255, .15) 25%,
              transparent 25%,
              transparent 50%,
              rgba(255, 255, 255, .15) 50%,
              rgba(255, 255, 255, .15) 75%,
              transparent 75%,
              transparent
          );
      }
      
      .stripes.animated {
        animation: animate-stripes 0.6s linear infinite;
      }
      
      .stripes.animated.slower {
        animation-duration: 1.25s;
      }
      
      .stripes.reverse {
        animation-direction: reverse;
      }
      
      .progress-bar-inner {
        display: block;
        height: 30px;
        width: 0%;
        background-color: #66CC99;
        border-radius: 3px;
        box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;
        position: relative;
        animation: auto-progress 10s infinite linear;
      }            
    </style>
    <div class="progress-bar stripes animated reverse slower">
      <span class="progress-bar-inner" style="width: ${percent}%;"></span>
    </div>    
  `;
}

ProgressBar.observedAttributes = ["percent"];

customElements.define('antidote-progress-bar', component(ProgressBar));

export default ProgressBar;