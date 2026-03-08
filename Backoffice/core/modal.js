import { $ } from './utils.js';
import { toast } from './toast.js';

const FOCUSABLE_SELECTORS = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let lastFocusedElement = null;
let modalKeyTrap = null;

function getModalFocusableElements() {
  const dialog = $('#modal .dialog');
  if (!dialog) return [];
  return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTORS));
}

function trapModalTab(event) {
  if (event.key !== 'Tab') return;
  const modal = $('#modal');
  if (!modal?.classList.contains('show')) return;
  const focusables = getModalFocusableElements();
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function openModal({ title = 'Modal', body = '', onSubmit }) {
  lastFocusedElement = document.activeElement;
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = body;
  $('#modal').classList.add('show');
  $('#modal').setAttribute('aria-hidden', 'false');
  const submitBtn = $('#modal-submit');
  submitBtn.onclick = async () => {
    try {
      await onSubmit?.();
      closeModal();
      toast('Saved');
    } catch (e) {
      toast('Action failed');
    }
  };
  const focusables = getModalFocusableElements();
  (focusables[0] || submitBtn)?.focus();
  modalKeyTrap = trapModalTab;
  document.addEventListener('keydown', modalKeyTrap);
}

export function closeModal() {
  $('#modal').classList.remove('show');
  $('#modal').setAttribute('aria-hidden', 'true');
  $('#modal-body').innerHTML = '';
  if (modalKeyTrap) {
    document.removeEventListener('keydown', modalKeyTrap);
    modalKeyTrap = null;
  }
  lastFocusedElement?.focus();
  lastFocusedElement = null;
}

const modalRoot = $('#modal');
modalRoot?.addEventListener('click', (event) => {
  if (event.target.matches('[data-close], .backdrop')) closeModal();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modalRoot?.classList.contains('show')) {
    closeModal();
  }
});
