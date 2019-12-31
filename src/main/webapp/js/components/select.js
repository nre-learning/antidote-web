import { html } from 'lit-html';
import { component, useContext, useEffect, useRef } from 'haunted';
import Awesomplete from 'awesomplete';

// Awesomplete options to be included when multi-select is enabled
const multiSelectOptions = {
  filter(text, input) {
    return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
  },
  item(text, input) {
    return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0]);
  },
  replace(text) {
    const before = this.input.value.match(/^.+,\s*|/)[0];
    this.input.value = before + text + ", ";
  }
};

function Select({ placeholder, multi }) {
  const dataList = (this.options || []).join(',');
  const change = this.change || (() => {});
  const awesomplete = useRef(null);
  multi = multi === "true"; // coerce to boolean

  if (this.options.length) {
    useEffect(() => {
      const options = { minChars: 0 };

      if (multi) {
        Object.assign(options, multiSelectOptions)
      }

      awesomplete.current = new Awesomplete(
        this.shadowRoot.querySelector('input'),
        options
      );
    }, []);
  }

  function click() {
    if (awesomplete.current.ul.childNodes.length === 0) {
      awesomplete.current.minChars = 0;
      awesomplete.current.evaluate();
    } else if (awesomplete.current.ul.hasAttribute('hidden')) {
      awesomplete.current.open();
    } else {
      awesomplete.current.close();
    }
  }

  return html`
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/nlundquist/nre-styles@latest/dist/styles.css" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.5/awesomplete.css" rel="stylesheet "/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/awesomplete/1.1.5/awesomplete.base.css" rel="stylesheet" />
    <style>
      .awesomplete {
        width: 100%;
      }
      .awesomplete:before {       
        font-family: "feather";
        content: "\\e842";
        color: #262c2c;
        font-size: 30px;
        padding-right: 0;
        position: absolute;
        top: 10px;
        right: 10px;
        pointer-events: none;
      }
    </style>
    <input type="text"
           placeholder=${placeholder}
           data-list=${dataList}
           @keyup=${change}
           @awesomplete-select=${change}
           @click=${click}
           ?data-multiple=${multi}
           class="dropdown-input dropdown-btn" />
  `;
}

Select.observedAttributes = ['placeholder', 'multi'];

customElements.define('antidote-select', component(Select));
