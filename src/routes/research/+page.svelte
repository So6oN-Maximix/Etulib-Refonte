<script lang="ts">
    import type { PageProps } from "./$types";
    import { page } from "$app/state";
    import Autocomplete from "#lib/components/Autocomplete.svelte";
    import { searchCities, searchSubjects } from "#lib/autocomplete";
    import { FORMAT_MODE } from "#lib/constants";

    let { data }: PageProps = $props();

    // svelte-ignore state_referenced_locally
    let course = $state(data.query.course);
    // svelte-ignore state_referenced_locally
    let city = $state(data.query.cityName);
    // svelte-ignore state_referenced_locally
    let cityCode = $state(data.query.location);
    // svelte-ignore state_referenced_locally
    let cityPicked = $state(data.query.cityName);

    $effect(() => {
        course = data.query.course;
        city = data.query.cityName;
        cityCode = data.query.location;
        cityPicked = data.query.cityName;
    });

    function getPageUrl(targetPage: number) {
        const url = new URL(page.url.href);
        if (targetPage <= 1) url.searchParams.delete("page");
        else url.searchParams.set("page", String(targetPage));
        return `${url.pathname}${url.search}`;
    }
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner">
            <h1>Trouver un professeur</h1>
            <form class="search-box" role="search" id="research-form">
                <label class="field" style="position: relative;">
                    <span>Matière</span>
                    <Autocomplete bind:value={course} search={searchSubjects} id="course-input" name="course" minChars={1} debounceMs={0} placeholder="Maths, anglais, philosophie…" />
                </label>
                <label class="field" style="position: relative;">
                    <span>Lieu</span>
                    <Autocomplete bind:value={city} search={searchCities} id="city-input" name="cityName" placeholder="Ville, code postal ou en ligne"
                        onselect={option => { cityCode = option.key; cityPicked = option.label; }} />
                    <input type="hidden" name="location" value={city === cityPicked ? cityCode : ""}>
                </label>
                <button type="submit" class="btn-search">Rechercher</button>
            </form>
        </div>
    </div>
</section>

<div class="container layout">
    <aside class="filters" aria-label="Filtres">
        <fieldset><legend>Niveau</legend>
            <label><input type="checkbox"> Primaire</label>
            <label><input type="checkbox"> Collège</label>
            <label><input type="checkbox" checked> Lycée</label>
            <label><input type="checkbox"> Prépa et supérieur</label>
        </fieldset>
        <fieldset><legend>Type de cours</legend>
            <label><input type="radio" name="mode" checked> Tous</label>
            <label><input type="radio" name="mode"> En ligne</label>
            <label><input type="radio" name="mode"> À domicile</label>
        </fieldset>
        <fieldset><legend>Tarif maximum</legend>
            <input type="range" min="15" max="60" value="40" aria-label="Tarif maximum">
            <output id="pv">40 €/h</output>
        </fieldset>
        <fieldset><legend>Note minimale</legend>
            <label><input type="radio" name="note" checked> Toutes</label>
            <label><input type="radio" name="note"> 4,5 et plus</label>
        </fieldset>
    </aside>

    <section class="results" aria-live="polite">
        <div class="results-bar">
            <p><b>{data.total} professeur{data.total > 1 ? "s" : ""}</b>{data.query.course ? ` de ${data.query.course.toLowerCase()}` : ""}{data.query.cityName ? ` à ${data.query.cityName}` : ""}</p>
            <label>Trier par
                <select><option>Pertinence</option><option>Prix croissant</option><option>Meilleure note</option><option>Disponibilité</option></select>
            </label>
        </div>
        {#if data.tutors.length > 0}
        <ul class="tutors">
            {#each data.tutors as tutor}
            <li>
                <span class="avatar">{(tutor.firstName[0] + tutor.lastName[0]).toUpperCase()}</span>
                <div class="who">
                    <h3>{tutor.firstName} {tutor.lastName.toUpperCase()}</h3>
                    <p>{tutor.bio}</p>
                    <div class="tags">
                        {#each tutor.modes as mode}
                        { const modeFormat = FORMAT_MODE[mode as keyof typeof FORMAT_MODE]; }
                        <span>{modeFormat.charAt(0).toUpperCase() + modeFormat.slice(1)}</span>
                        {/each}
                        <span class="free">Libre {tutor.nextAvailability?.toLowerCase()}</span>
                    </div>
                </div>
                <div class="meta">
                    <span class="stars" style="--r:4.9" role="img" aria-label="Note de 4,9 sur 5"></span>
                    <span><b>4,9</b> <small>(126 avis)</small></span></div>
                <div class="price">{tutor.minRate} €<small>/heure</small></div>
                <a href="/tutor?id={tutor.id}" class="btn-line">Voir les créneaux</a>
            </li>
            {/each}
        </ul>
        {/if}
        {#if data.pagination.totalPages > 1}
        <nav class="pager" aria-label="Pagination">
            {#if data.pagination.currentPage > 1}
                <a href={getPageUrl(data.pagination.currentPage - 1)}>Précédent</a>
            {/if}

            {#each Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1) as pageNum}
                <a 
                    href={getPageUrl(pageNum)} 
                    aria-current={pageNum === data.pagination.currentPage ? "page" : undefined}
                >
                    {pageNum}
                </a>
            {/each}

            {#if data.pagination.currentPage < data.pagination.totalPages}
                <a href={getPageUrl(data.pagination.currentPage + 1)}>Suivant</a>
            {/if}
        </nav>
        {/if}
    </section>
</div>

<style>
    .filters fieldset {
        border: 0;
        border-bottom: 1px solid var(--line);
        padding: 0 0 1.25rem;
        margin-bottom: 1.25rem
    }

    .filters legend {
        font-family: "Bricolage Grotesque", sans-serif;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: .6rem
    }

    .filters label {
        display: flex;
        align-items: center;
        gap: .6rem;
        padding: .2rem 0;
        cursor: pointer
    }

    .filters input {
        accent-color: var(--ink)
    }

    .filters input[type=range] {
        width: 100%
    }

    .filters output {
        font-weight: 600;
        color: var(--ink)
    }

    .results-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
        color: var(--muted)
    }

    .results-bar b {
        color: var(--ink)
    }

    .tags .free {
        border-color: var(--ink);
        color: var(--ink);
        font-weight: 600
    }

    .pager {
        display: flex;
        gap: .4rem;
        margin-top: 2rem
    }

    .pager a {
        min-width: 40px;
        padding: .45rem .8rem;
        text-align: center;
        border: 1px solid var(--line);
        border-radius: 6px;
        font-weight: 500
    }

    .pager a[aria-current] {
        background: var(--ink);
        border-color: var(--ink);
        color: #fff
    }
</style>