<script lang="ts">
	import "../app.css";
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	import Header from "#lib/components/Header.svelte";
	import Footer from "#lib/components/Footer.svelte";
	import Toast from "#lib/components/Toast.svelte";

    let { data, children }: { data: LayoutData, children: any } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header user={data.user} />

<main>
	{@render children()}
</main>

<Footer />
<Toast />
