import { html } from 'https://unpkg.com/lit-html@^1.0.0/lit-html.js';
import { component, useEffect, useContext } from 'https://unpkg.com/haunted@^4.0.0/haunted.js';
import { LiveLessonDetailsContext } from '../data.js';
import { syringeServiceRoot, serviceHost, lessonId, sessionId } from '../helpers/page-state.js';
import { derivePresentationsFromLessonDetails } from '../helpers/derivations.js';
import debounce from '../helpers/debounce.js';
import Guacamole from "https://cdn.jsdelivr.net/gh/nlundquist/guacamole-client@0.9.14/dist/guacamole-common.js";

const sshTabLeftPadding = 5;

// initialize a guacamole client inside the given div, connecting to the given host & port
function initGuacamoleClient(tabEl, host, port) {
  const tunnel = new Guacamole.HTTPTunnel(`${serviceHost}/tunnel`);
  const client = new Guacamole.Client(tunnel);
  const hostEl = tabEl.parentNode.host;

  tabEl.client = client;

  client.onerror = function (error) {
    console.log(error);
    console.log("Problem connecting to the remote endpoint.");
    return false
  };

  client.onclipboard = (stream) => {
    stream.onblob = (data) => tabEl.clipboard = atob(data);
  };

  const mouse = new Guacamole.Mouse(client.getDisplay().getElement());
  mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = function (ev) {
    client.sendMouseState(ev);
  };

  const keyboard = new Guacamole.Keyboard(document);
  keyboard.onkeydown = function (keysym) {
    client.sendKeyEvent(1, keysym);
  };
  keyboard.onkeyup = function (keysym) {
    client.sendKeyEvent(0, keysym);
  };

  client.connect(`${host};${port};${hostEl.offsetWidth-sshTabLeftPadding};${hostEl.offsetHeight}`);
  tabEl.appendChild(client.getDisplay().getElement());

  // TODO(mierdin): See if you can DETECT a disconnect, and build retry logic in. If fail, provide a dialog
  // INSIDE the tab pane (per tab) that indicates a refresh is likely required
  // Would also be nice to extend retry logic to initial connection in case something is wonky to begin with
}

function initGuacResizeHandler(tabContainer, tabs) {
  const resizeObserver = new ResizeObserver(debounce(() => {
    tabs.forEach((tab) => {
      // tab.client will be undefined for non-guac tabs
      if (tab.client) {
        tab.client.sendSize(tabContainer.offsetWidth-sshTabLeftPadding, tabContainer.offsetHeight);
      }
    });
  }, 50));

  resizeObserver.observe(tabContainer);

  return () => resizeObserver.unobserve(tabContainer);
}

function LabTabs() {
  const detailsRequest = useContext(LiveLessonDetailsContext);
  const presentations = derivePresentationsFromLessonDetails(detailsRequest);
  const selectedPresentationId = 0;

  useEffect(function () {
    const tabBodies = Array.from(this.host.shadowRoot.children).filter((el) => el.tagName === 'DIV');
    const disconnectResizeHandler = initGuacResizeHandler(this.host, tabBodies);

    // setup either guac tabs or iframe tabs
    Array.from(tabBodies).forEach((div, i) => {
      const pres = presentations[i];

      if (pres.type === 'ssh') {
        initGuacamoleClient(div, pres.host, pres.port);
      } else if (pres.type === 'http') {
        div.innerHTML = `
          <iframe src="${serviceHost}/${lessonId}-${sessionId}-ns-${pres.endpoint}/">
          </iframe>
        `;
      }
    });

    return () => {
      disconnectResizeHandler();
      tabBodies.forEach((tab) => tab.client && tab.client.disconnect());
    }
  });

  // disconnect all tabs when closing window
  useEffect(() => {
    window.addEventListener('unload', () => {
      const tabBodies = Array.from(this.host.shadowRoot.children).filter((el) => el.tagName === 'DIV');
      tabBodies.forEach((tab) => tab.client && tab.client.disconnect());
    })
  }, []);

  // render a container for every tab
  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <style>
      :host {
        position: relative;
        overflow: hidden;
        flex-grow: 1;
        cursor: none;     
      }
      :host > div {
        position:absolute;         
        display: none;
        width: 100%;
        height: 100%;
        background: black;
      }
      :host > div[selected] {
        display: block;
      }
      :host > div[type=ssh] {
        padding-left: ${sshTabLeftPadding}px;
      }
      iframe {
        height: 100%;
        width: 100%;
        border: 0;
      }     
    </style>
    ${presentations.map((pres, i) => html`
      <div ?selected=${i === selectedPresentationId}
           name=${pres.name}
           type=${pres.type}></div>
    `)}
  `;
}

customElements.define('antidote-lab-tabs', component(LabTabs));

export default LabTabs;