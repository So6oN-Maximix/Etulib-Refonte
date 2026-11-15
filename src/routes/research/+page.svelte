<script>
    import Autocomplete from "#lib/components/Autocomplete.svelte";
    import { searchCities, searchSubjects } from "#lib/autocomplete";
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner">
            <h1>Trouver un professeur</h1>
            <form class="search-box" role="search" id="research-form">
                <label class="field" style="position: relative;">
                    <span>Matière</span>
                    <Autocomplete search={searchSubjects} id="course-input" name="course" minChars={1} debounceMs={0} placeholder="Maths, anglais, philosophie…" />
                </label>
                <label class="field" style="position: relative;">
                    <span>Lieu</span>
                    <Autocomplete search={searchCities} id="city-input" name="location" placeholder="Ville, code postal ou en ligne" />
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
            <p><b>47 professeurs</b> de mathématiques pour le lycée</p>
            <label>Trier par
                <select><option>Pertinence</option><option>Prix croissant</option><option>Meilleure note</option><option>Disponibilité</option></select>
            </label>
        </div>
        <ul class="tutors">
            <li>
                <span class="avatar">CM</span>
                <div class="who"><h3>Camille M.</h3><p>Agrégée, 8 ans d'expérience. Spécialité maths, terminale et prépa.</p>
                    <div class="tags"><span>En ligne</span><span>À domicile</span><span class="free">Libre demain 17 h 30</span></div></div>
                <div class="meta"><span class="stars" style="--r:4.9" role="img" aria-label="Note de 4,9 sur 5"></span><span><b>4,9</b> <small>(126 avis)</small></span></div>
                <div class="price">32 €<small>/heure</small></div>
                <a href="/tutor" class="btn-line">Voir les créneaux</a>
            </li>
            <li>
                <span class="avatar">TR</span>
                <div class="who"><h3>Thomas R.</h3><p>Ingénieur et professeur particulier. Méthode axée sur les exercices types du bac.</p>
                    <div class="tags"><span>En ligne</span><span class="free">Libre jeudi 18 h</span></div></div>
                <div class="meta"><span class="stars" style="--r:4.8" role="img" aria-label="Note de 4,8 sur 5"></span><span><b>4,8</b> <small>(73 avis)</small></span></div>
                <div class="price">28 €<small>/heure</small></div>
                <a href="/" class="btn-line">Voir les créneaux</a>
            </li>
            <li>
                <span class="avatar">IK</span>
                <div class="who"><h3>Inès K.</h3><p>Étudiante en master de mathématiques. Remise à niveau, seconde et première.</p>
                    <div class="tags"><span>À domicile</span><span class="free">Libre samedi 10 h</span></div></div>
                <div class="meta"><span class="stars" style="--r:4.7" role="img" aria-label="Note de 4,7 sur 5"></span><span><b>4,7</b> <small>(38 avis)</small></span></div>
                <div class="price">22 €<small>/heure</small></div>
                <a href="/" class="btn-line">Voir les créneaux</a>
            </li>
            <li>
                <span class="avatar">PD</span>
                <div class="who"><h3>Paul D.</h3><p>Professeur certifié en poste. Accompagnement vers la spécialité maths et le supérieur.</p>
                    <div class="tags"><span>En ligne</span><span>À domicile</span></div></div>
                <div class="meta"><span class="stars" style="--r:3.5" role="img" aria-label="Note de 3,5 sur 5"></span><span><b>3,5</b> <small>(204 avis)</small></span></div>
                <div class="price">38 €<small>/heure</small></div>
                <a href="/" class="btn-line">Voir les créneaux</a>
            </li>
        </ul>
        <nav class="pager" aria-label="Pagination"><a href="/" aria-current="page">1</a><a href="/">2</a><a href="/">3</a><a href="/">Suivant</a></nav>
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