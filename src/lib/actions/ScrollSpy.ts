import type { Action } from "svelte/action";

export const scrollSpy: Action<HTMLElement, { offset?: number } | undefined> = (node, params) => {
	const offset = params?.offset ?? 120;

	function getItems() {
		return [...node.querySelectorAll<HTMLAnchorElement>("a[href^=\"#\"]")]
			.filter((link) => link.hash.length > 1)
			.map((link) => ({ link, section: document.querySelector<HTMLElement>(link.hash) }))
			.filter((item): item is { link: HTMLAnchorElement; section: HTMLElement } => !!item.section);
	}

	function update() {
		const items = getItems();
		if (items.length === 0) return;

		let current = items[0];
		for (const item of items) {
			if (item.section.getBoundingClientRect().top <= offset) current = item;
		}
		if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) current = items[items.length - 1];

		for (const item of items) item.link.removeAttribute("aria-current");
		current.link.setAttribute("aria-current", "page");
	}

	let ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			update();
			ticking = false;
		});
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", update);
	update();

	return {
		destroy() {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", update);
		}
	};
};