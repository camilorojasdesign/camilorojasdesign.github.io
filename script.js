const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu]");
const navigation = document.querySelector("[data-nav]");
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

let closePrimaryMenu = () => {};

if (menuButton && navigation) {
  closePrimaryMenu = ({ returnFocus = false } = {}) => {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");

    if (returnFocus) {
      menuButton.focus();
    }
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closePrimaryMenu({ returnFocus: true });
      return;
    }

    navigation.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
    navigation.querySelector("a")?.focus();
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closePrimaryMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      closePrimaryMenu({ returnFocus: true });
    }
  });
}

const languageSwitchers = document.querySelectorAll("[data-language-switcher]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const footerBoundary = document.querySelector(
  "body > footer, .case-study-footer, .footer",
);

const preserveDestinationHash = (destination) => {
  if (window.location.hash && !destination.hash) {
    destination.hash = window.location.hash;
  }

  return destination;
};

const trackLanguageChange = ({
  sourceLanguage,
  targetLanguage,
  destination,
  link,
}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "language_change",
    language_from: sourceLanguage,
    language_to: targetLanguage,
    page_id: document.body.dataset.pageId || "unknown",
    page_type: document.body.dataset.pageType || "unknown",
    source_path: `${window.location.pathname}${window.location.hash}`,
    destination_path: `${destination.pathname}${destination.hash}`,
    switch_location: link.dataset.switchLocation || "unknown",
  });
};

languageSwitchers.forEach((switcher) => {
  const toggle = switcher.querySelector("[data-language-switch]");
  const sourceLanguage = document.documentElement.lang || "en";

  if (!toggle) {
    return;
  }

  const clearPressState = () => switcher.classList.remove("is-pressing");

  switcher.addEventListener("pointerleave", clearPressState);
  switcher.addEventListener("pointerdown", () => {
    switcher.classList.add("is-pressing");
  });
  switcher.addEventListener("pointerup", clearPressState);
  switcher.addEventListener("pointercancel", clearPressState);

  // The complete pill is one link to the equivalent page in the other language.
  // Hover changes opacity only; the slider moves after a click.
  toggle.addEventListener("click", (event) => {
    const targetLanguage = toggle.dataset.language;
    if (!targetLanguage) {
      return;
    }

    const destination = preserveDestinationHash(
      new URL(toggle.href, window.location.href),
    );
    toggle.href = destination.href;

    trackLanguageChange({
      sourceLanguage,
      targetLanguage,
      destination,
      link: toggle,
    });

    const isSameTabNavigation =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;

    if (!isSameTabNavigation) {
      return;
    }

    event.preventDefault();
    clearPressState();
    switcher.classList.add("is-changing");
    switcher.dataset.activeLanguage = targetLanguage;

    const navigationDelay = reducedMotion.matches ? 0 : 190;
    window.setTimeout(
      () => window.location.assign(destination.href),
      navigationDelay,
    );
  });
});

// Keep the fixed language control above the footer divider whenever the footer
// enters the viewport. The clearance matches the control's left edge offset.
const updateLanguageSwitcherFooterOffset = () => {
  languageSwitchers.forEach((switcher) => {
    // Always measure from the real fixed baseline to prevent accumulated lift.
    switcher.style.setProperty("--footer-avoidance", "0px");

    if (!footerBoundary) {
      return;
    }

    const switcherBounds = switcher.getBoundingClientRect();
    const footerBounds = footerBoundary.getBoundingClientRect();
    const footerDividerIsVisible =
      footerBounds.top < window.innerHeight && footerBounds.bottom > 0;

    if (!footerDividerIsVisible) {
      return;
    }

    const edgeClearance = Math.max(
      12,
      Math.round(switcherBounds.left),
    );
    const desiredSwitcherBottom = footerBounds.top - edgeClearance;
    const requestedLift = Math.max(
      0,
      switcherBounds.bottom - desiredSwitcherBottom,
    );

    // Defensive cap: preserve the same clearance from the viewport top.
    const maximumLift = Math.max(
      0,
      switcherBounds.top - edgeClearance,
    );

    switcher.style.setProperty(
      "--footer-avoidance",
      `${Math.round(Math.min(requestedLift, maximumLift))}px`,
    );
  });
};

let footerOffsetFrame;
const requestFooterOffsetUpdate = () => {
  if (footerOffsetFrame) {
    return;
  }

  footerOffsetFrame = window.requestAnimationFrame(() => {
    updateLanguageSwitcherFooterOffset();
    footerOffsetFrame = undefined;
  });
};

updateLanguageSwitcherFooterOffset();
window.addEventListener("scroll", requestFooterOffsetUpdate, { passive: true });
window.addEventListener("resize", requestFooterOffsetUpdate);
window.addEventListener("load", requestFooterOffsetUpdate);

if ("ResizeObserver" in window && footerBoundary) {
  new ResizeObserver(requestFooterOffsetUpdate).observe(footerBoundary);
}

const getContextNavigationContent = () => {
  const isSpanish = document.documentElement.lang.toLowerCase().startsWith("es");
  const root = isSpanish ? "/es/" : "/";
  const workRoot = isSpanish ? "/es/work/" : "/work/";

  return isSpanish
    ? {
        root,
        eyebrow: "NAVEGACIÓN",
        title: "Explorar portafolio",
        openLabel: "Abrir menú contextual",
        closeLabel: "Cerrar menú contextual",
        menuLabel: "Menú contextual del portafolio",
        groups: [
          {
            title: "Portafolio",
            items: [
              { id: "home", label: "Inicio", description: "Presentación principal", href: root },
              { id: "work", label: "Proyectos", description: "Trabajo seleccionado", href: `${root}#work` },
              { id: "skills", label: "Capacidades", description: "Enfoque y herramientas", href: `${root}#skills` },
              { id: "about", label: "Acerca de", description: "Perfil y método", href: `${root}#about` },
              { id: "contact", label: "Contacto", description: "Disponibilidad y enlaces", href: `${root}#contact` },
              { id: "cv", label: "CV", description: "Experiencia y habilidades", href: "/es/cv.html" },
            ],
          },
          {
            title: "Casos de estudio",
            items: [
              { id: "forumgo", label: "ForumGo", description: "Votación clara y trazable", href: `${workRoot}forumgo.html` },
              { id: "pagoconectado", label: "PagoConectado", description: "Pagos confiables sin conexión", href: `${workRoot}pagoconectado.html` },
              { id: "subtrack", label: "Subtrack", description: "Control de suscripciones", href: `${workRoot}subtrack.html` },
            ],
          },
        ],
      }
    : {
        root,
        eyebrow: "NAVIGATION",
        title: "Explore portfolio",
        openLabel: "Open contextual menu",
        closeLabel: "Close contextual menu",
        menuLabel: "Portfolio contextual menu",
        groups: [
          {
            title: "Portfolio",
            items: [
              { id: "home", label: "Home", description: "Main introduction", href: root },
              { id: "work", label: "Work", description: "Selected projects", href: `${root}#work` },
              { id: "skills", label: "Capabilities", description: "Approach and tools", href: `${root}#skills` },
              { id: "about", label: "About", description: "Profile and method", href: `${root}#about` },
              { id: "contact", label: "Contact", description: "Availability and links", href: `${root}#contact` },
              { id: "cv", label: "Résumé", description: "Experience and skills", href: "/cv.html" },
            ],
          },
          {
            title: "Case studies",
            items: [
              { id: "forumgo", label: "ForumGo", description: "Clear, traceable voting", href: `${workRoot}forumgo.html` },
              { id: "pagoconectado", label: "PagoConectado", description: "Reliable offline payments", href: `${workRoot}pagoconectado.html` },
              { id: "subtrack", label: "Subtrack", description: "Subscription control", href: `${workRoot}subtrack.html` },
            ],
          },
        ],
      };
};

const createContextNavigation = () => {
  const content = getContextNavigationContent();
  const currentPageId = document.body.dataset.pageId || "unknown";
  const root = document.createElement("div");
  root.className = "context-navigation";
  root.dataset.contextNavigation = "";

  const triggerIcon = `
    <span class="context-navigation__icon" aria-hidden="true">
      <span></span><span></span><span></span>
    </span>`;

  const groupsMarkup = content.groups
    .map(
      (group) => `
        <section class="context-navigation__group">
          <h3>${group.title}</h3>
          <ul>
            ${group.items
              .map((item) => {
                const isCurrentItem =
                  currentPageId === "home"
                    ? item.id === "home"
                    : item.id === currentPageId;
                const currentAttribute = isCurrentItem
                  ? ` aria-current="${currentPageId === "home" ? "location" : "page"}"`
                  : "";
                return `
                  <li>
                    <a
                      href="${item.href}"
                      data-context-item-id="${item.id}"
                      ${currentAttribute}
                    >
                      <span>${item.label}</span>
                      <small>${item.description}</small>
                    </a>
                  </li>`;
              })
              .join("")}
          </ul>
        </section>`,
    )
    .join("");

  root.innerHTML = `
    <div class="context-navigation__backdrop" data-context-navigation-backdrop hidden></div>
    <div
      class="context-navigation__panel"
      id="context-navigation-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="context-navigation-title"
      aria-label="${content.menuLabel}"
      data-context-navigation-panel
      hidden
    >
      <header class="context-navigation__header">
        <p>${content.eyebrow}</p>
        <h2 id="context-navigation-title">${content.title}</h2>
      </header>
      <nav aria-label="${content.menuLabel}">
        ${groupsMarkup}
      </nav>
    </div>`;

  const trigger = document.createElement("button");
  trigger.className = "context-navigation__trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-controls", "context-navigation-panel");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", content.openLabel);
  trigger.dataset.contextNavigationTrigger = "";
  trigger.dataset.contextTriggerLocation = "topbar";
  trigger.dataset.openLabel = content.openLabel;
  trigger.dataset.closeLabel = content.closeLabel;
  trigger.innerHTML = triggerIcon;
  root.prepend(trigger);

  document.body.append(root);

  const topBarHost =
    header?.querySelector(".nav-main") || header?.querySelector(".nav");
  let triggerSlot = null;

  if (topBarHost) {
    triggerSlot = document.createElement("span");
    triggerSlot.className = "context-navigation__trigger-slot";
    triggerSlot.setAttribute("aria-hidden", "true");
    topBarHost.append(triggerSlot);
  }

  document.body.classList.add("context-navigation-enabled");
  return { root, trigger, triggerSlot };
};

const contextNavigationParts = createContextNavigation();
const contextNavigation = contextNavigationParts.root;
const contextTrigger = contextNavigationParts.trigger;
const contextTriggerSlot = contextNavigationParts.triggerSlot;
const contextTriggers = [contextTrigger];
const contextFloatingTrigger = contextTrigger;
const contextPanel = contextNavigation.querySelector(
  "[data-context-navigation-panel]",
);
const contextBackdrop = contextNavigation.querySelector(
  "[data-context-navigation-backdrop]",
);
const contextItemLinks = Array.from(
  contextPanel.querySelectorAll("[data-context-item-id]"),
);
const currentPageId = document.body.dataset.pageId || "unknown";
let activeContextTrigger = contextFloatingTrigger;
let contextCloseTimer;

const setContextExpandedState = (isExpanded) => {
  contextTriggers.forEach((trigger) => {
    trigger.setAttribute("aria-expanded", String(isExpanded));
    trigger.setAttribute(
      "aria-label",
      isExpanded ? trigger.dataset.closeLabel : trigger.dataset.openLabel,
    );
  });
};

const setActiveContextItem = (itemId, currentType = "location") => {
  contextItemLinks.forEach((link) => {
    if (link.dataset.contextItemId === itemId) {
      link.setAttribute("aria-current", currentType);
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const homeSections = [
  { itemId: "home", element: document.querySelector("#top") },
  { itemId: "work", element: document.querySelector("#work") },
  { itemId: "skills", element: document.querySelector("#skills") },
  { itemId: "about", element: document.querySelector("#about") },
  { itemId: "cv", element: document.querySelector("#resume") },
  { itemId: "contact", element: document.querySelector("#contact") },
].filter(({ element }) => element);

const updateContextCurrentItem = () => {
  if (currentPageId !== "home" || !homeSections.length) {
    setActiveContextItem(currentPageId, "page");
    return;
  }

  const isAtDocumentEnd =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 4;

  if (isAtDocumentEnd) {
    setActiveContextItem("contact");
    return;
  }

  const activationLine =
    window.scrollY + Math.min(window.innerHeight * 0.34, 280);
  let activeItemId = "home";

  homeSections.forEach(({ itemId, element }) => {
    const sectionTop = element.getBoundingClientRect().top + window.scrollY;
    if (sectionTop <= activationLine) {
      activeItemId = itemId;
    }
  });

  setActiveContextItem(activeItemId);
};

const getContextFocusableElements = () => [
  activeContextTrigger,
  ...Array.from(
    contextPanel.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ),
].filter(Boolean);

const closeContextNavigation = ({ returnFocus = false } = {}) => {
  if (!contextNavigation.classList.contains("is-open")) {
    return;
  }

  window.clearTimeout(contextCloseTimer);
  setContextExpandedState(false);
  contextNavigation.classList.remove("is-open");
  document.body.classList.remove("context-navigation-open");

  contextCloseTimer = window.setTimeout(() => {
    contextPanel.hidden = true;
    contextBackdrop.hidden = true;
  }, reducedMotion.matches ? 0 : 180);

  if (returnFocus) {
    activeContextTrigger?.focus();
  }
};

const openContextNavigation = (trigger) => {
  window.clearTimeout(contextCloseTimer);
  activeContextTrigger = trigger || contextFloatingTrigger;
  contextNavigation.dataset.triggerSource =
    activeContextTrigger?.dataset.contextTriggerLocation || "floating";
  closePrimaryMenu();
  updateContextCurrentItem();
  contextPanel.hidden = false;
  contextBackdrop.hidden = false;
  setContextExpandedState(true);
  document.body.classList.add("context-navigation-open");

  window.requestAnimationFrame(() => {
    contextNavigation.classList.add("is-open");
    const currentItem = contextPanel.querySelector("[aria-current]");
    (currentItem || contextPanel.querySelector("a"))?.focus();
  });
};

contextTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (contextNavigation.classList.contains("is-open")) {
      closeContextNavigation({ returnFocus: true });
    } else {
      openContextNavigation(trigger);
    }
  });
});

contextBackdrop.addEventListener("click", () =>
  closeContextNavigation({ returnFocus: true }),
);
contextPanel.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeContextNavigation());
});

document.addEventListener("keydown", (event) => {
  if (!contextNavigation.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeContextNavigation({ returnFocus: true });
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = getContextFocusableElements();
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

const updateContextTriggerTopbarPosition = () => {
  if (!contextTriggerSlot) {
    return;
  }

  const slotBounds = contextTriggerSlot.getBoundingClientRect();
  const top = Math.round(slotBounds.top);
  const right = Math.max(0, Math.round(window.innerWidth - slotBounds.right));

  contextTrigger.style.setProperty("--context-trigger-topbar-top", `${top}px`);
  contextTrigger.style.setProperty(
    "--context-trigger-topbar-right",
    `${right}px`,
  );
};

let contextTriggerPositionTimer;
const requestContextTriggerTopbarPosition = ({ afterHeaderMotion = false } = {}) => {
  window.clearTimeout(contextTriggerPositionTimer);

  if (afterHeaderMotion) {
    contextTriggerPositionTimer = window.setTimeout(
      updateContextTriggerTopbarPosition,
      reducedMotion.matches ? 0 : 230,
    );
    return;
  }

  window.requestAnimationFrame(updateContextTriggerTopbarPosition);
};

const updateHeaderAndContextNavigation = () => {
  const scrollPosition = window.scrollY;
  const contextThreshold = Math.max(96, (header?.offsetHeight || 64) + 32);
  const contextIsAvailable = scrollPosition > contextThreshold;
  const wasContextAvailable = document.body.classList.contains(
    "context-navigation-available",
  );

  contextTrigger.dataset.contextTriggerLocation = contextIsAvailable
    ? "floating"
    : "topbar";

  document.body.classList.toggle(
    "context-navigation-available",
    contextIsAvailable,
  );

  if (header) {
    header.classList.toggle("scrolled", scrollPosition > 14);
    header.classList.toggle("is-context-hidden", contextIsAvailable);
  }

  if (contextIsAvailable) {
    closePrimaryMenu();
  } else if (wasContextAvailable) {
    // The trigger keeps its last valid top-bar coordinates while the header
    // returns, then realigns after the header transition finishes.
    requestContextTriggerTopbarPosition({ afterHeaderMotion: true });
  }

  updateContextCurrentItem();
};

updateContextTriggerTopbarPosition();
updateHeaderAndContextNavigation();
window.addEventListener("scroll", updateHeaderAndContextNavigation, {
  passive: true,
});
window.addEventListener("resize", () => {
  updateHeaderAndContextNavigation();

  if (!document.body.classList.contains("context-navigation-available")) {
    requestContextTriggerTopbarPosition();
  }
});
window.addEventListener("load", () => {
  updateHeaderAndContextNavigation();
  requestContextTriggerTopbarPosition();
});

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = reducedMotion.matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("show"));
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  revealElements.forEach((element) => observer.observe(element));
}

const prototypeMessages = document.documentElement.lang
  .toLowerCase()
  .startsWith("es")
  ? {
      loading: "Cargando la demostración interactiva…",
      ready: "Prototipo listo para interactuar.",
      restarting: "Reiniciando el prototipo…",
      restarted: "Prototipo reiniciado.",
      error:
        "No fue posible cargar la demostración. Reintenta o ábrela en pantalla completa.",
    }
  : {
      loading: "Loading the interactive demonstration…",
      ready: "Prototype ready to interact.",
      restarting: "Restarting the prototype…",
      restarted: "Prototype restarted.",
      error:
        "The demonstration could not load. Try again or open it in full screen.",
    };

const trackPrototypeInteraction = (eventName) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    project_id: "pagoconectado",
    language: document.documentElement.lang || "unknown",
    placement: "case_study",
  });
};

document.querySelectorAll("[data-prototype-demo]").forEach((demo) => {
  const startButton = demo.querySelector("[data-prototype-start]");
  const restartButton = demo.querySelector("[data-prototype-restart]");
  const openLink = demo.querySelector("[data-prototype-open]");
  const frame = demo.querySelector(".prototype-frame[data-src]");
  const status = demo.querySelector("[data-prototype-status]");

  if (!startButton || !frame || !status) {
    return;
  }

  const initialStartLabel = startButton.textContent;
  let loadTimeout;
  let loadIntent = "start";

  const setStatus = (message, { isError = false } = {}) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  const handleReady = () => {
    window.clearTimeout(loadTimeout);
    demo.classList.remove("is-loading");
    demo.classList.add("is-active");
    demo.removeAttribute("aria-busy");
    startButton.hidden = true;
    startButton.disabled = false;
    frame.removeAttribute("tabindex");

    if (restartButton) {
      restartButton.hidden = false;
      restartButton.disabled = false;
    }

    setStatus(
      loadIntent === "restart"
        ? prototypeMessages.restarted
        : prototypeMessages.ready,
    );
    frame.focus({ preventScroll: true });
  };

  const handlePrototypeReady = (event) => {
    if (event.source !== frame.contentWindow) {
      return;
    }

    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data?.type !== "pagoconectado:ready") {
      return;
    }

    if (!demo.classList.contains("is-loading")) {
      return;
    }

    handleReady();
  };

  const handleTimeout = () => {
    demo.classList.remove("is-loading");
    demo.removeAttribute("aria-busy");
    startButton.disabled = false;
    startButton.textContent =
      startButton.dataset.retryLabel || initialStartLabel;

    if (restartButton) {
      restartButton.disabled = false;
    }

    setStatus(prototypeMessages.error, { isError: true });
  };

  const loadPrototype = ({ restart = false } = {}) => {
    window.clearTimeout(loadTimeout);
    loadIntent = restart ? "restart" : "start";
    demo.classList.add("is-loading");
    demo.setAttribute("aria-busy", "true");
    setStatus(
      restart ? prototypeMessages.restarting : prototypeMessages.loading,
    );

    if (restart) {
      if (restartButton) {
        restartButton.disabled = true;
      }
    } else {
      startButton.disabled = true;
      startButton.textContent =
        startButton.dataset.loadingLabel || prototypeMessages.loading;
    }

    const source = new URL(frame.dataset.src, window.location.href);
    if (restart) {
      source.searchParams.set("restart", Date.now().toString());
    }
    source.hash = "/";
    frame.src = source.href;

    loadTimeout = window.setTimeout(handleTimeout, 15000);
    trackPrototypeInteraction(restart ? "prototype_restart" : "prototype_start");
  };

  window.addEventListener("message", handlePrototypeReady);
  startButton.addEventListener("click", () => loadPrototype());
  restartButton?.addEventListener("click", () =>
    loadPrototype({ restart: true }),
  );
  openLink?.addEventListener("click", () =>
    trackPrototypeInteraction("prototype_open_fullscreen"),
  );

  if ("IntersectionObserver" in window) {
    const prototypeVisibilityObserver = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle(
          "prototype-demo-in-view",
          entry.isIntersecting,
        );
      },
      { threshold: 0.05 },
    );

    prototypeVisibilityObserver.observe(demo);
  }
});
