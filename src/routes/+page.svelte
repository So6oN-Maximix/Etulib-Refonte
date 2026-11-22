<script lang="ts">
    import Autocomplete from "#lib/components/Autocomplete.svelte";
    import { searchCities, searchSubjects } from "#lib/autocomplete";
    
    let course = $state("");
    let cityName = $state("");
    let cityCode = $state("");
    let cityPicked = $state("");
</script>

<svelte:head>
    <title>Etulib</title>
</svelte:head>

<section class="hero">
    <div class="container">
        <div class="hero-content">
            <h1>Révélez votre potentiel avec le bon professeur.</h1>
            <p>Réservez des cours de soutien scolaire en ligne ou près de chez vous, en quelques clics et en toute confiance.</p>

            <form method="GET" action="/research" class="search-box" role="search" id="research-form">
                <label class="field" style="position: relative;">
                    <span>Matière</span>
                    <Autocomplete bind:value={course} search={searchSubjects} id="course-input" name="course" minChars={1} debounceMs={0} placeholder="Maths, anglais, philosophie…" />
                </label>
                <label class="field" style="position: relative;">
                    <span>Lieu</span>
                    <Autocomplete bind:value={cityName} search={searchCities} id="city-input" name="cityName" placeholder="Ville, code postal ou en ligne" onselect={option => { cityCode = option.key; cityPicked = option.label; }}/>
                    <input type="hidden" name="location" value={cityName === cityPicked ? cityCode : ""}>
                </label>
                <button type="submit" class="btn-search">Rechercher</button>
            </form>

            <div class="levels">
                <span>Pour quel niveau ?</span>
                <a href="/">Primaire</a><a href="/">Collège</a><a href="/">Lycée</a><a href="/">Prépa et supérieur</a>
            </div>
        </div>
    </div>
</section>

<section class="section" id="matieres">
    <div class="container split">
        <div class="split-head">
            <h2>Les matières les plus demandées</h2>
            <p>Plus de 40 matières, de la grande section à la terminale et au-delà. Choisissez la vôtre, on s'occupe de trouver le bon profil.</p>
        </div>
        <nav class="toc" aria-label="Matières">
            <a href="/"><span>Mathématiques</span><i></i><b>412 profs</b></a>
            <a href="/"><span>Français</span><i></i><b>356 profs</b></a>
            <a href="/"><span>Anglais</span><i></i><b>298 profs</b></a>
            <a href="/"><span>Physique-Chimie</span><i></i><b>187 profs</b></a>
            <a href="/"><span>SVT</span><i></i><b>142 profs</b></a>
            <a href="/"><span>Histoire-Géographie</span><i></i><b>131 profs</b></a>
            <a href="/"><span>Philosophie</span><i></i><b>74 profs</b></a>
            <a href="/"><span>Espagnol</span><i></i><b>96 profs</b></a>
        </nav>
    </div>
</section>

<section class="section tinted" id="methode">
    <div class="container">
        <h2>Comment ça marche ?</h2>
        <ol class="steps">
            <li><span class="num">1</span><h3>Cherchez</h3><p>Filtrez par matière, niveau, lieu et budget. Chaque fiche affiche les avis et les créneaux libres.</p></li>
            <li><span class="num">2</span><h3>Réservez</h3><p>Choisissez un horaire, en ligne ou à domicile. La première séance sert à vérifier que le courant passe.</p></li>
            <li><span class="num">3</span><h3>Progressez</h3><p>Le professeur partage un compte rendu après chaque cours. Vous suivez les progrès depuis votre espace.</p></li>
        </ol>
    </div>
</section>

<section class="section" id="profs">
    <div class="container">
        <h2>Des professeurs disponibles cette semaine</h2>
        <ul class="tutors">
            <li>
                <span class="avatar">CM</span>
                <div class="who"><h3>Camille M.</h3><p>Mathématiques, Lycée et prépa. Agrégée, 8 ans d'expérience.</p></div>
                <div class="meta"><b>4,9</b> sur 5 <small>(126 avis)</small></div>
                <div class="price">32 €<small>/heure</small></div>
                <a href="/" class="btn-line">Voir les créneaux</a>
            </li>
            <li>
                <span class="avatar">YB</span>
                <div class="who"><h3>Yanis B.</h3><p>Anglais, Collège et lycée. Certifié Cambridge C2, en ligne.</p></div>
                <div class="meta"><b>4,8</b> sur 5 <small>(94 avis)</small></div>
                <div class="price">26 €<small>/heure</small></div>
                <a href="/" class="btn-line">Voir les créneaux</a>
            </li>
            <li>
                <span class="avatar">SL</span>
                <div class="who"><h3>Sophie L.</h3><p>Français, Primaire et collège. Ancienne professeure des écoles.</p></div>
                <div class="meta"><b>5,0</b> sur 5 <small>(61 avis)</small></div>
                <div class="price">24 €<small>/heure</small></div>
                <a href="/" class="btn-line">Voir les créneaux</a>
            </li>
        </ul>
    </div>
</section>

<section class="section tinted" id="engagements">
    <div class="container">
        <h2>Nos engagements</h2>
        <div class="pledges">
            <div><h3>Des profils vérifiés</h3><p>Identité, diplômes et casier judiciaire sont contrôlés avant la mise en ligne de chaque profil.</p></div>
            <div><h3>Satisfait ou remboursé</h3><p>Si la première séance ne vous convient pas, elle ne vous est pas facturée.</p></div>
            <div><h3>Paiement sécurisé</h3><p>Vous payez sur la plateforme. Le professeur est rémunéré après le cours.</p></div>
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <figure class="quote">
            <blockquote>Ma fille avait peur des maths. Après deux mois avec Camille, elle lève la main en classe.</blockquote>
            <span class="note" aria-hidden="true">Très bien !</span>
            <figcaption>Nadia, maman d'une élève de seconde</figcaption>
        </figure>
    </div>
</section>

<section class="section tinted" id="faq">
    <div class="container split">
        <div class="split-head"><h2>Questions fréquentes</h2></div>
        <div class="faq">
            <details><summary>Les cours ont-ils lieu en ligne ou à domicile ?</summary><p>Les deux sont possibles. Le mode est indiqué sur chaque fiche, et beaucoup de professeurs proposent les deux.</p></details>
            <details><summary>Comment sont choisis les professeurs ?</summary><p>Chaque candidature est examinée : diplômes, expérience et entretien de présentation avant publication.</p></details>
            <details><summary>Puis-je changer de professeur ?</summary><p>À tout moment, sans frais. Il suffit de réserver un créneau avec un autre profil.</p></details>
            <details><summary>Comment annuler un cours ?</summary><p>Depuis votre espace, jusqu'à 24 heures avant l'heure prévue.</p></details>
        </div>
    </div>
</section>

<section class="cta" id="devenir-tuteur">
    <div class="container cta-inner">
        <div><h2>Vous enseignez ? Rejoignez Etulib.</h2><p>Fixez vos tarifs, choisissez vos horaires et concentrez-vous sur vos élèves.</p></div>
        <a href="/" class="btn-light">Devenir tuteur</a>
    </div>
</section>

<style>
    .hero {
        position: relative;
        padding: 5rem 0 5.5rem;
        border-bottom: 1px solid var(--line);
        background-color: var(--paper);
        background-image: linear-gradient(var(--grid-main) 1px, transparent 1px), linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
        background-size: 100% 32px, 100% 8px, 32px 100%
    }

    .hero::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: max(1rem, calc((100vw - var(--max))/2 + 1rem));
        width: 2px;
        background: var(--margin)
    }

    .hero-content {
        max-width: 780px;
        padding-left: 2.25rem
    }

    .hero h1 {
        font-size: clamp(2.2rem, 5vw, 3.6rem);
        margin-bottom: 1.25rem
    }

    .hero p {
        font-size: 1.15rem;
        color: var(--muted);
        max-width: 540px;
        margin-bottom: 2.25rem
    }

    .levels {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: .5rem;
        margin-top: 3rem;
        font-size: .95rem;
        color: var(--muted)
    }

    .levels span {
        margin-right: .5rem
    }

    .levels a {
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: .3rem .95rem;
        font-weight: 500;
        color: var(--ink)
    }

    .levels a:hover {
        border-color: var(--ink)
    }

    /* sections */
    .section {
        padding: 5.5rem 0
    }

    .section h2 {
        font-size: clamp(1.6rem, 3vw, 2.2rem);
        margin-bottom: 2.5rem
    }

    .split {
        display: grid;
        grid-template-columns: 1fr 1.3fr;
        gap: 4rem;
        align-items: start
    }

    .split-head h2 {
        margin-bottom: 1rem
    }

    .split-head p {
        color: var(--muted);
        max-width: 380px
    }

    /* sommaire des matières */
    .toc a {
        display: flex;
        align-items: baseline;
        gap: .6rem;
        padding: .8rem 0;
        border-bottom: 1px solid var(--line);
        font-size: 1.15rem;
        font-weight: 500
    }

    .toc i {
        flex: 1;
        border-bottom: 2px dotted #b9c0de;
        transform: translateY(-4px)
    }

    .toc b {
        font-size: .9rem;
        font-weight: 500;
        color: var(--muted)
    }

    .toc a:hover span {
        color: var(--ink);
        text-decoration: underline;
        text-underline-offset: 4px
    }

    /* étapes */
    .steps {
        list-style: none;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 3rem
    }

    .num {
        display: block;
        font-size: 3.5rem;
        font-weight: 700;
        color: var(--ink);
        line-height: 1;
        margin-bottom: 1rem
    }

    .steps h3 {
        font-size: 1.3rem;
        margin-bottom: .5rem
    }

    .steps p {
        color: var(--muted)
    }

    /* engagements */
    .pledges {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 3rem
    }

    .pledges div {
        border-top: 2px solid var(--ink);
        padding-top: 1.1rem
    }

    .pledges h3 {
        font-size: 1.2rem;
        margin-bottom: .5rem
    }

    .pledges p {
        color: var(--muted)
    }

    /* faq */
    .faq details {
        border-bottom: 1px solid var(--line);
        padding: 1.1rem 0
    }

    .faq summary {
        cursor: pointer;
        font-weight: 600;
        font-size: 1.05rem;
        list-style: none;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        color: var(--ink)
    }

    .faq summary::-webkit-details-marker {
        display: none
    }

    .faq summary::after {
        content: "+";
        font-size: 1.4rem;
        line-height: 1
    }

    .faq details[open] summary::after {
        content: "−"
    }

    .faq p {
        margin-top: .7rem;
        color: var(--muted);
        max-width: 560px
    }

    /* cta */
    .cta {
        background: var(--ink);
        color: #fff;
        padding: 4rem 0
    }

    .cta-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem
    }

    .cta h2 {
        color: #fff;
        font-size: clamp(1.5rem, 3vw, 2rem);
        margin-bottom: .5rem
    }

    .cta p {
        color: #c6cdee
    }

    .btn-light {
        background: #fff;
        color: var(--ink);
        font-weight: 600;
        padding: .85rem 1.6rem;
        border-radius: 6px;
        white-space: nowrap
    }

    .btn-light:hover {
        background: var(--tint)
    }
</style>