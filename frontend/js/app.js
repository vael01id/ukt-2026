const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section-page');

function showSection(target) {
  const targetEl = document.getElementById(target);
  if (!targetEl) return;

  sections.forEach(sec => sec.classList.add('hidden'));
  targetEl.classList.remove('hidden');

  navItems.forEach(item => {
    if (item.dataset.section === target) {
      item.classList.remove('text-slate-300', 'hover:bg-slate-800');
      item.classList.add('bg-indigo-600', 'text-white');
    } else {
      item.classList.remove('bg-indigo-600', 'text-white');
      item.classList.add('text-slate-300', 'hover:bg-slate-800');
    }
  });
}

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.section;
    localStorage.setItem('activeSection', target);
    showSection(target);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const savedSection = localStorage.getItem('activeSection');
  if (savedSection) {
    showSection(savedSection);
  }
});
