import debounce from 'lodash/debounce';
import { isValidSelection } from './services/text-utils.js';
import { cancelRequests } from './services/ajax.js';
import { exportCards } from './services/export.js';
import storage from '../common/services/storage.js';
import Popup from './components/Popup/Popup.jsx';

function initEvents() {
  let isDoubleClick = false;
  let popup = null;

  const reset = () => {
    if (popup) {
      popup.remove();
      popup = null;
    }
    cancelRequests();
  };

  document.addEventListener('dblclick', () => {
    isDoubleClick = true;
  });

  document.addEventListener('selectionchange', debounce(() => {
    if (popup) {
      popup.remove();
      popup = null;
    }
    cancelRequests();

    if (!isDoubleClick) return;

    const selection = window.getSelection();
    if (!isValidSelection(selection.toString())) return;

    popup = new Popup(selection);
    isDoubleClick = false;
  }, 10));

  // To avoid showing the definition when the user double-clicks
  // to copy the selection
  document.addEventListener('keydown', () => {
    if (popup && popup.isDismissable) reset();
  });
}

function isDomainEnabled() {
  return storage.get(window.location.hostname)
    .then(domain => domain == null ? true : domain);
}

function init() {
  exportCards();

  isDomainEnabled().then(isEnabled => {
    if (isEnabled) initEvents();
  });
}

init();
