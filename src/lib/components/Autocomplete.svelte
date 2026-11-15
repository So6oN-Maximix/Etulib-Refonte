<script lang="ts">
	import { norm, type Option } from "#lib/autocomplete";

	let {
		value = $bindable(""),
		search,
		id,
		name,
		placeholder = "",
		minChars = 2,
		debounceMs = 250,
		onselect
	}: {
		value?: string;
		search: (query: string, signal: AbortSignal) => Promise<Option[]>;
		id: string;
		name: string;
		placeholder?: string;
		minChars?: number;
		debounceMs?: number;
		onselect?: (option: Option) => void;
	} = $props();

	let options = $state<Option[]>([]);
	let open = $state(false);
	let active = $state(-1);

	let timer: ReturnType<typeof setTimeout>;
	let controller: AbortController | undefined;
	const listId = $derived(`${id}-suggestions`);

	function close() {
		open = false;
		active = -1;
	}
    
	function onInput() {
		clearTimeout(timer);
		active = -1;
		const q = value.trim();
		if (q.length < minChars) return close();
		timer = setTimeout(() => run(q), debounceMs);
	}

	async function run(q: string) {
		controller?.abort();
		controller = new AbortController();
		try {
			const result = await search(q, controller.signal);
			if (controller.signal.aborted) return;
			options = result;
			open = options.length > 0;
		} catch (e) {
			if ((e as Error).name !== "AbortError") close();
		}
	}

	function select(option: Option) {
		value = option.label;
		close();
		onselect?.(option);
	}

	function onKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			active = (active + 1) % options.length;
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			active = (active - 1 + options.length) % options.length;
		} else if (event.key === "Enter" && active >= 0) {
			event.preventDefault();
			select(options[active]);
		} else if (event.key === "Escape") {
			close();
		}
	}

	function split(label: string, typed: string): [string, string] {
		const t = typed.trim();
		return norm(label.slice(0, t.length)) === norm(t) ? [label.slice(0, t.length), label.slice(t.length)] : ["", label];
	}
</script>

<input
	type="text"
	{id}
	{name}
	{placeholder}
	autocomplete="off"
	role="combobox"
	aria-expanded={open}
	aria-controls={listId}
	aria-autocomplete="list"
	aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
	bind:value
	oninput={onInput}
	onkeydown={onKeydown}
	onblur={close}
/>

{#if open}
	<ul id={listId} class="suggestions-list" role="listbox">
		{#each options as option, i (option.key)}
			{@const [head, tail] = split(option.label, value)}
			<li
				id="{id}-opt-{i}"
				role="option"
				aria-selected={i === active}
				class:active={i === active}
				onmousedown={event => {
					event.preventDefault();
					select(option);
				}}
			>
				<b>{head}</b>{tail}
				{#if option.hint}<span class="hint">{option.hint}</span>{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	.suggestions-list li.active {
		background-color: var(--tint);
	}

	.hint {
		margin-left: 0.25rem;
		font-size: 0.85rem;
		color: var(--muted);
	}
</style>