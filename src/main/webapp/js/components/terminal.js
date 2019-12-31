import { html } from 'lit-html';
import { component, useRef } from 'haunted';
import useSSH from '../helpers/use-ssh.js';

//const sshStyle = {};

function AntidoteTerminal({ host, port }) {
  const terminalContainer = useRef(document.createElement('div'));

  terminalContainer.current.id = 'term-target';

  this._ssh = useSSH({ host, port, terminalContainer: terminalContainer.current });
  this.run = this._ssh.run;

  return html`
    <!-- what to do about this :/ -->
    <link rel="stylesheet" href="/css/xterm.css" />
    <style>
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }
        .error {
            /* todo: figure out how to use LESS variables in these components :/ */
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;            
            color: #c35b56;
            z-index: 10;
        }
        #term-target {
            height: 100%;
        }
        .error + #term-target {
            opacity: .1;
        }
    </style>
    <!-- todo: show reconnection state if available. distinguish between reconnectable and unreconnectable errors  -->
    <!-- todo: distinguish between "appropriate" connection closure and error -->
    ${this._ssh.error ? html `
        <div class="error">
          <h1>Terminal connection closed</h1>
          ${this._ssh.error.message ? html`<p>${this._ssh.error.message}</p>` : ''}  
        </div>          
    ` : ''}
    ${terminalContainer.current}  
`;
}

AntidoteTerminal.observedAttributes = ["host", "port"];

customElements.define('antidote-terminal', component(AntidoteTerminal));

export default AntidoteTerminal;
