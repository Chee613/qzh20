type SlideControllerOptions = {
  sectionSelector?: string;
  lockDurationMs?: number;
  swipeThresholdPx?: number;
  mobileSwipeThresholdPx?: number;
  mobileSwipeDamping?: number;
  mobileLockDurationMs?: number;
  threshold?: number;
  disableSwipeSelector?: string;
  dotLabelAttribute?: string;
  canTransition?: (context: SlideTransitionContext) => boolean;
};

type SlideNavigationReason = "dot" | "keyboard" | "swipe" | "programmatic";

type SlideTransitionContext = {
  currentIndex: number;
  targetIndex: number;
  currentSection: HTMLElement;
  targetSection: HTMLElement;
  reason: SlideNavigationReason;
};

export class SlideController {
  private readonly sectionSelector: string;
  private readonly lockDurationMs: number;
  private readonly swipeThresholdPx: number;
  private readonly mobileSwipeThresholdPx: number;
  private readonly mobileSwipeDamping: number;
  private readonly mobileLockDurationMs: number;
  private readonly threshold: number;
  private readonly disableSwipeSelector: string;
  private readonly dotLabelAttribute: string;
  private readonly canTransition: ((context: SlideTransitionContext) => boolean) | null;

  private sections: HTMLElement[] = [];
  private dots: HTMLButtonElement[] = [];
  private navDotsContainer: HTMLDivElement | null = null;
  private observer: IntersectionObserver | null = null;

  private currentIndex = 0;
  private isAnimating = false;
  private unlockTimerId: number | null = null;

  private touchStartY: number | null = null;
  private touchStartX: number | null = null;

  constructor(options: SlideControllerOptions = {}) {
    this.sectionSelector = options.sectionSelector ?? "section";
    this.lockDurationMs = options.lockDurationMs ?? 600;
    this.swipeThresholdPx = options.swipeThresholdPx ?? 50;
    this.mobileSwipeThresholdPx =
      options.mobileSwipeThresholdPx ?? Math.max(this.swipeThresholdPx + 24, 72);
    this.mobileSwipeDamping = Math.min(Math.max(options.mobileSwipeDamping ?? 0.72, 0.1), 1);
    this.mobileLockDurationMs =
      options.mobileLockDurationMs ?? Math.max(Math.round(this.lockDurationMs * 1.3), 680);
    this.threshold = options.threshold ?? 0.5;
    this.disableSwipeSelector = options.disableSwipeSelector ?? "";
    this.dotLabelAttribute = options.dotLabelAttribute ?? "data-nav-short";
    this.canTransition = options.canTransition ?? null;
  }

  public init(): void {
    this.sections = Array.from(document.querySelectorAll<HTMLElement>(this.sectionSelector));

    if (this.sections.length === 0) {
      return;
    }

    this.currentIndex = this.findClosestSectionIndex();
    this.createNavDots();
    this.setupObserver();
    this.bindEvents();
    this.updateActiveDot(this.currentIndex);
  }

  public destroy(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchend", this.handleTouchEnd);

    if (this.unlockTimerId !== null) {
      window.clearTimeout(this.unlockTimerId);
      this.unlockTimerId = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.navDotsContainer) {
      this.navDotsContainer.removeEventListener("click", this.handleDotClick);
      this.navDotsContainer.remove();
      this.navDotsContainer = null;
    }

    this.dots = [];
    this.sections = [];
  }

  public goToSlide(index: number, reason: SlideNavigationReason = "programmatic"): void {
    if (this.sections.length === 0 || this.isAnimating) {
      return;
    }

    const targetIndex = this.clampIndex(index);
    if (targetIndex === this.currentIndex) {
      return;
    }

    const currentSection = this.sections[this.currentIndex];
    const targetSection = this.sections[targetIndex];

    if (!currentSection || !targetSection) {
      return;
    }

    if (
      this.canTransition &&
      !this.canTransition({
        currentIndex: this.currentIndex,
        targetIndex,
        currentSection,
        targetSection,
        reason,
      })
    ) {
      this.updateActiveDot(this.currentIndex);
      return;
    }

    this.isAnimating = true;
    this.currentIndex = targetIndex;
    this.updateActiveDot(targetIndex);

    this.sections[targetIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    if (this.unlockTimerId !== null) {
      window.clearTimeout(this.unlockTimerId);
    }

    this.unlockTimerId = window.setTimeout(() => {
      this.isAnimating = false;
      this.unlockTimerId = null;
    }, this.getEffectiveLockDurationMs());
  }

  private bindEvents(): void {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("touchstart", this.handleTouchStart, { passive: true });
    document.addEventListener("touchend", this.handleTouchEnd, { passive: true });
  }

  private createNavDots(): void {
    this.navDotsContainer = document.createElement("div");
    this.navDotsContainer.className = "nav-dots";
    this.navDotsContainer.setAttribute("role", "navigation");
    this.navDotsContainer.setAttribute("aria-label", "Slide navigation");

    this.dots = this.sections.map((section, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "nav-dot";
      dot.dataset.index = String(index);

      const shortLabelRaw = section.getAttribute(this.dotLabelAttribute);
      const shortLabel = shortLabelRaw && shortLabelRaw.trim().length > 0 ? shortLabelRaw.trim() : null;
      dot.textContent = shortLabel ?? `S${index + 1}`;

      const sectionLabel =
        section.getAttribute("data-nav-label") ?? section.getAttribute("aria-label") ?? section.id;
      dot.setAttribute(
        "aria-label",
        sectionLabel ? `Go to ${sectionLabel}` : `Go to slide ${index + 1}`,
      );

      this.navDotsContainer?.appendChild(dot);
      return dot;
    });

    this.navDotsContainer.addEventListener("click", this.handleDotClick);
    document.body.appendChild(this.navDotsContainer);
  }

  private setupObserver(): void {
    const thresholds = Array.from(
      new Set([0, this.threshold * 0.5, this.threshold, 0.75, 1].map((value) => Number(value.toFixed(2)))),
    ).sort((left, right) => left - right);

    this.observer = new IntersectionObserver(this.handleIntersection, {
      threshold: thresholds,
    });

    this.sections.forEach((section) => {
      this.observer?.observe(section);
    });
  }

  private readonly handleIntersection = (entries: IntersectionObserverEntry[]): void => {
    const viewportCenter = window.innerHeight * 0.5;
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((leftEntry, rightEntry) => {
        const leftTarget = leftEntry.target as HTMLElement;
        const rightTarget = rightEntry.target as HTMLElement;
        const leftRect = leftTarget.getBoundingClientRect();
        const rightRect = rightTarget.getBoundingClientRect();
        const leftCenterDistance = Math.abs(leftRect.top + leftRect.height * 0.5 - viewportCenter);
        const rightCenterDistance = Math.abs(rightRect.top + rightRect.height * 0.5 - viewportCenter);

        if (leftCenterDistance !== rightCenterDistance) {
          return leftCenterDistance - rightCenterDistance;
        }

        return rightEntry.intersectionRatio - leftEntry.intersectionRatio;
      });

    if (visibleEntries.length === 0) {
      return;
    }

    const targetSection = visibleEntries[0]?.target as HTMLElement | undefined;
    if (!targetSection) {
      return;
    }

    const nextIndex = this.sections.indexOf(targetSection);
    if (nextIndex < 0 || nextIndex === this.currentIndex) {
      return;
    }

    this.currentIndex = nextIndex;
    this.updateActiveDot(nextIndex);
  };

  private readonly handleDotClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>(".nav-dot");
    if (!button) {
      return;
    }

    const rawIndex = button.dataset.index;
    if (!rawIndex) {
      return;
    }

    const index = Number(rawIndex);
    if (Number.isNaN(index)) {
      return;
    }

    this.goToSlide(index, "dot");
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || this.sections.length === 0) {
      return;
    }

    if (this.isTypingTarget(event.target)) {
      return;
    }

    let targetIndex: number | null = null;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
      case "PageDown":
      case " ":
      case "Spacebar":
        targetIndex = this.currentIndex + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
      case "PageUp":
        targetIndex = this.currentIndex - 1;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = this.sections.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.goToSlide(targetIndex, "keyboard");
  };

  private readonly handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) {
      this.touchStartY = null;
      this.touchStartX = null;
      return;
    }

    if (this.shouldIgnoreSwipe(event.target)) {
      this.touchStartY = null;
      this.touchStartX = null;
      return;
    }

    const touch = event.touches[0];
    this.touchStartY = touch?.clientY ?? null;
    this.touchStartX = touch?.clientX ?? null;
  };

  private readonly handleTouchEnd = (event: TouchEvent): void => {
    if (this.touchStartY === null || this.touchStartX === null || this.sections.length === 0) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      this.touchStartY = null;
      this.touchStartX = null;
      return;
    }

    const deltaY = this.touchStartY - touch.clientY;
    const deltaX = this.touchStartX - touch.clientX;

    const isMobile = this.isMobileViewport();
    const effectiveDeltaY = deltaY * (isMobile ? this.mobileSwipeDamping : 1);
    const effectiveThreshold = isMobile ? this.mobileSwipeThresholdPx : this.swipeThresholdPx;

    this.touchStartY = null;
    this.touchStartX = null;

    if (
      Math.abs(effectiveDeltaY) < effectiveThreshold ||
      Math.abs(effectiveDeltaY) <= Math.abs(deltaX) ||
      this.isAnimating
    ) {
      return;
    }

    if (effectiveDeltaY > 0) {
      this.goToSlide(this.currentIndex + 1, "swipe");
    } else {
      this.goToSlide(this.currentIndex - 1, "swipe");
    }
  };

  private updateActiveDot(activeIndex: number): void {
    this.dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("active", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  private findClosestSectionIndex(): number {
    const viewportCenter = window.innerHeight * 0.5;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    this.sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height * 0.5;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private clampIndex(index: number): number {
    return Math.min(Math.max(index, 0), this.sections.length - 1);
  }

  private getEffectiveLockDurationMs(): number {
    return this.isMobileViewport() ? this.mobileLockDurationMs : this.lockDurationMs;
  }

  private isMobileViewport(): boolean {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  private shouldIgnoreSwipe(target: EventTarget | null): boolean {
    if (this.isTypingTarget(target)) {
      return true;
    }

    if (!this.disableSwipeSelector || !(target instanceof HTMLElement)) {
      return false;
    }

    return target.closest(this.disableSwipeSelector) !== null;
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(
      target.closest(
        "input, textarea, select, [contenteditable='true'], [contenteditable=''], [contenteditable='plaintext-only']",
      ),
    );
  }
}
