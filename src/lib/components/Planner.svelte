<script lang="ts">
	import { DAYS, START, SLOTS, cellsToRanges, rangesToCells, type Range } from '#lib/planner';

	let { ranges = $bindable([]) }: { ranges?: Range[] } = $props();

	let cells = $state<boolean[]>(rangesToCells(ranges));

	type Drag = { d: number; s: number; add: boolean; snap: boolean[] };
	let drag: Drag | null = null;
	let last = -1;

	function cellIndexAt(e: PointerEvent): number | null {
		const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-i]');
		return el ? Number(el.dataset.i) : null;
	}

	function select(i: number) {
		if (!drag) return;
		const [d1, d2] = [drag.d, i % 7].sort((a, b) => a - b);
		const [s1, s2] = [drag.s, Math.floor(i / 7)].sort((a, b) => a - b);
		const next = [...drag.snap];
		for (let s = s1; s <= s2; s++) {
			for (let d = d1; d <= d2; d++) next[s * 7 + d] = drag.add;
		}
		cells = next;
		ranges = cellsToRanges(next);
	}

	function onpointerdown(e: PointerEvent) {
		const i = cellIndexAt(e);
		if (i === null) return;
		e.preventDefault();
		drag = { d: i % 7, s: Math.floor(i / 7), add: !cells[i], snap: [...cells] };
		last = i;
		select(i);
	}

	function onpointermove(e: PointerEvent) {
		if (!drag) return;
		const i = cellIndexAt(e);
		if (i !== null && i !== last) {
			last = i;
			select(i);
		}
	}

	function stop() {
		drag = null;
		last = -1;
	}
</script>

<svelte:window {onpointermove} onpointerup={stop} onpointercancel={stop} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="planner" {onpointerdown}>
	<div></div>
	{#each DAYS as day}
		<div class="day">{day}</div>
	{/each}
	{#each Array(SLOTS) as _slot, s}
		<div class="hour">{s % 2 ? '' : `${START + s / 2} h`}</div>
		{#each DAYS as _day, d}
			<div class="cell" class:hr={s % 2 === 0} class:on={cells[s * 7 + d]} data-i={s * 7 + d}></div>
		{/each}
	{/each}
</div>

<style>
	.planner {
		display: grid;
		padding: 0 1rem 1rem 0;
		grid-template-columns: 48px repeat(7, minmax(0, 1fr));
		max-width: 640px;
		background: #fff;
		border: 1.5px solid var(--ink);
		border-radius: 6px;
		box-shadow: 5px 5px 0 rgba(27, 42, 107, 0.12);
		overflow: hidden;
		user-select: none;
		touch-action: none;
	}

	.planner .day {
		padding: 0.5rem 0;
		text-align: center;
		font: 600 0.85rem 'Bricolage Grotesque', sans-serif;
		color: var(--ink);
		background: var(--tint);
		border-bottom: 1.5px solid var(--ink);
	}

	.planner .hour {
		height: 22px;
		padding: 2px 0.4rem 0 0;
		text-align: right;
		font-size: 0.72rem;
		line-height: 1;
		color: var(--muted);
	}

	.planner .cell {
		height: 22px;
		border-top: 1px solid var(--grid);
		border-left: 1px solid var(--grid);
		cursor: pointer;
	}

	.planner .cell.hr {
		border-top-color: var(--grid-main);
	}

	.planner .cell:hover {
		background: var(--tint);
	}

	.planner .cell.on {
		background: var(--ink);
		border-color: rgba(255, 255, 255, 0.22);
	}

	.planner .cell:nth-child(8n) {
		border-right: 1px solid var(--grid);
	}

	.planner .cell:nth-last-child(-n + 7) {
		border-bottom: 1px solid var(--grid);
	}

	.planner .day:nth-child(8) {
		border-right: 1px solid var(--grid);
	}
</style>