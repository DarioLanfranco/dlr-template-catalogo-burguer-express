export function initMobileMenu(): () => void {
  const hamburgerButton = document.getElementById("hamburger-menu");
  const navLinks = document.getElementById("nav-links");

  if (!hamburgerButton || !navLinks) return () => {};

  const btn = hamburgerButton;
  const links = navLinks;

  function isMenuOpen() {
    return btn.getAttribute("aria-expanded") === "true";
  }

  function openMenu() {
    btn.classList.add("is-open");
    links.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Cerrar menú de navegación");

    const firstLink = links.querySelector("a");
    if (firstLink) {
      firstLink.focus({ preventScroll: true });
    }
  }

  function closeMenu() {
    btn.classList.remove("is-open");
    links.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Abrir menú de navegación");
    btn.focus({ preventScroll: true });
  }

  function toggleMenu() {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape" && isMenuOpen()) {
      closeMenu();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as Node;
    if (
      isMenuOpen() &&
      !links.contains(target) &&
      !btn.contains(target)
    ) {
      closeMenu();
    }
  }

  function handleTabTrap(e: KeyboardEvent) {
    if (e.key === "Tab" && isMenuOpen()) {
      const focusable = links.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  btn.addEventListener("click", toggleMenu);

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", handleEscape);
  document.addEventListener("click", handleClickOutside);
  links.addEventListener("keydown", handleTabTrap);

  return function cleanup() {
    btn.removeEventListener("click", toggleMenu);
    document.removeEventListener("keydown", handleEscape);
    document.removeEventListener("click", handleClickOutside);
    links.querySelectorAll("a").forEach((link) => {
      link.removeEventListener("click", closeMenu);
    });
    links.removeEventListener("keydown", handleTabTrap);
  };
}
