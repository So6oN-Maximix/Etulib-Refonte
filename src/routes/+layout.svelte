<script lang="ts">
	import "../app.css";
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
    import { page } from "$app/state";

	import Header from "#lib/components/Header.svelte";
	import Footer from "#lib/components/Footer.svelte";
	import Toast from "#lib/components/Toast.svelte";

    let { data, children }: { data: LayoutData, children: any } = $props();
	const hideFooter = $derived(page.url.pathname === "/messages");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header user={data.user} unread={data.unread} />

<main>
	{@render children()}
</main>

{#if !hideFooter}
<Footer />
{/if}
<Toast />
