<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from "$app/forms";
    import { FORMAT_LEVEL } from "#lib/constants";
    import { scrollSpy } from "#lib/actions/ScrollSpy";
    let { data, form }: PageProps = $props();

    let showForm = $state(false);
    function toggleForm(event: MouseEvent) {
        event.preventDefault();
        showForm = !showForm;
    }
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner profile-head">
            <span class="avatar big">{(data.user.firstName[0] + data.user.lastName[0]).toUpperCase()}</span>
            <div>
                <h1>{data.user.firstName} {data.user.lastName.toUpperCase()}</h1>
                <p>Parent de Léa et Tom. Membre depuis {data.user.creationDate}.</p>
            </div>
            <a href="/research" class="btn-line">Trouver un professeur</a>
        </div>
    </div>
</section>

<div class="container layout">
    <aside class="side-nav" aria-label="Mon espace" use:scrollSpy>
        <a href="#cours" aria-current="page">Prochains cours</a>
        <a href="#enfants">Mes enfants</a>
        <a href="#comptes-rendus">Comptes rendus</a>
        <a href="#professeurs">Mes professeurs</a>
        <a href="#paiements">Paiements</a>
        <a href="#infos">Mes informations</a>
    </aside>

    <div class="account">
        <section id="cours">
            <h2>Prochains cours</h2>
            <ul class="lessons"></ul>
            <p class="empty" hidden>Aucune réservation pour le moment</p>
        </section>

        <section id="enfants">
            <h2>Mes enfants</h2>
            {#if data.childrens.length > 0}
            <ul class="courses">
                {#each data.childrens as child}
                <li>
                    <div class="who">
                        <h3>{child.user.firstName} {child.user.firstName.toUpperCase()}</h3>
                        <p>{FORMAT_LEVEL[child.level!].charAt(0).toUpperCase() + FORMAT_LEVEL[child.level!].slice(1)}</p>
                    </div>
                    <div class="course-actions">
                        <a href="/" class="btn-line">Réserver un cours</a>
                        <a href="/" class="link-quiet">Profil</a>
                    </div>
                </li>
                {/each}
            </ul>
            {:else}
            <div class="empty">
                <p>Vous n'avez pas encore enregistré d'enfant.</p>
            </div>
            {/if}

            <a href="/" class="btn-line" onclick={toggleForm}>
                {showForm ? "- Fermer" : "+ Ajouter un enfant"}
            </a>

            <form method="POST" action="?/addChild" class="form course-form" id="child-form" hidden={!showForm} use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === "success") showForm = false;
                    update();
                };
            }}>
                <h3>Nouvel enfant</h3>
                <label>Prénom<input type="text" name="firstName" required></label>
                <label>
                    Niveau
                    <select name="level">
                        <option value="PRIMAIRE">Primaire</option>
                        <option value="COLLEGE">Collège</option>
                        <option value="LYCEE">Lycée</option>
                        <option value="SUP">Prépa et supérieur</option>
                    </select>
                </label>
                <label>Adresse e-mail<input type="text" name="email" placeholder="Pour qu'il puisse se connecter seul" required></label>
                <label>Date de naissance<input type="date" name="birthDate" id="birthDateInput" required></label>
                <label class="full">Mot de passe
                    <span class="pw">
                        <input type="password" minlength="8" autocomplete="new-password" placeholder="Mot de passe temporaire" name="password" required>
                        <button type="button" class="pw-toggle" aria-label="Afficher le mot de passe" aria-pressed="false">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="slash" d="M3 3l18 18"/></svg>
                        </button>
                    </span>
                </label>
                {#if form?.error}
                    <p class="form-msg full" role="alert">{form.error}</p>
                {/if}
                <div class="form-actions">
                    <button type="submit" class="btn-search">Valider</button>
                    <a href="/" class="link-quiet" onclick={toggleForm}>Annuler</a>
                </div>
            </form>
        </section>

        <section id="comptes-rendus">
            <h2>Derniers comptes rendus</h2>
            <figure class="quote small">
                <blockquote>Léa a bien progressé sur les fonctions affines. On reprend les équations du second degré vendredi, avec deux exercices à préparer.</blockquote>
                <span class="note" aria-hidden="true">Bon travail !</span>
                <figcaption>Camille M., à propos de Léa, séance du 8 octobre</figcaption>
            </figure>
            <figure class="quote small">
                <blockquote>Tom a lu un chapitre entier à voix haute sans hésiter. Nous travaillerons l'orthographe des accords la prochaine fois.</blockquote>
                <figcaption>Sophie L., à propos de Tom, séance du 5 octobre</figcaption>
            </figure>
        </section>

        <section id="professeurs">
            <h2>Mes professeurs</h2>
            <ul class="tutors compact"></ul>
        </section>

        <section id="paiements">
            <h2>Paiements et factures</h2>
            <ul class="courses">
                <li><div class="who"><h3>Mathématiques avec Camille M.</h3><p>8 octobre 2026</p></div><div class="price">32 €</div><a href="/" class="link-quiet">Facture</a></li>
                <li><div class="who"><h3>Français avec Sophie L.</h3><p>5 octobre 2026</p></div><div class="price">24 €</div><a href="/" class="link-quiet">Facture</a></li>
                <li><div class="who"><h3>Anglais avec Yanis B.</h3><p>3 octobre 2026</p></div><div class="price">26 €</div><a href="/" class="link-quiet">Facture</a></li>
            </ul>
        </section>

        <section id="infos">
            <h2>Mes informations</h2>
            <form class="form" id="parent-info">
                <label>Prénom<input type="text" placeholder="Prénom" name="firstName" value={data.user.firstName || ""}></label>
                <label>Nom<input type="text" placeholder="Nom" name="lastName" value={data.user.lastName || ""}></label>
                <label class="full">Adresse e-mail<input type="email" placeholder="votre.mail@exemple.fr" name="email" value={data.user.email || ""}></label>
                <label>Téléphone<input type="tel" placeholder="06 12 34 56 78" name="phone" value={data.parent.phone || ""}></label>
                <label>Ville<input type="text" placeholder="Votre ville" name="city" value={data.parent.city || ""}></label>
                <button type="submit" class="btn-search">Enregistrer</button>
            </form>
        </section>
    </div>
</div>

<style>
    .profile-head {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap
    }

    .profile-head h1 {
        margin-bottom: .25rem
    }

    .profile-head p {
        color: var(--muted)
    }

    .profile-head .btn-line {
        margin-left: auto;
        background: #fff
    }

    .avatar.big {
        width: 76px;
        height: 76px;
        font-size: 1.4rem
    }

    .tutors.compact li {
        grid-template-columns: auto 1fr auto
    }

    .side-nav {
        position: sticky;
        top: 90px;
        display: flex;
        flex-direction: column;
        border-left: 2px solid var(--line)
    }

    .side-nav a {
        padding: .55rem 1rem;
        color: var(--muted);
        font-weight: 500;
        margin-left: -2px;
        border-left: 2px solid transparent
    }

    .side-nav a:hover {
        color: var(--ink)
    }

    .side-nav a[aria-current] {
        color: var(--ink);
        border-color: var(--margin);
        font-weight: 600
    }

    .account section {
        margin-bottom: 3.5rem
    }

    .account h2 {
        font-size: 1.4rem;
        margin-bottom: 1.25rem
    }

    .lessons {
        list-style: none;
        border-top: 1px solid var(--line)
    }

    .lessons li {
        display: grid;
        grid-template-columns: 70px 1fr auto auto;
        align-items: center;
        gap: 1.25rem;
        padding: 1.1rem 0;
        border-bottom: 1px solid var(--line)
    }

    .date {
        text-align: center;
        font-size: .8rem;
        color: var(--muted);
        line-height: 1.2
    }

    .date b {
        display: block;
        font-family: "Bricolage Grotesque", sans-serif;
        font-size: 2rem;
        color: var(--ink)
    }

    .quote.small blockquote {
        font-size: 1.25rem
    }

    .quote.small {
        padding-bottom: 1rem
    }

    /* fiche professeur */
    .crumb {
        font-size: .88rem;
        margin-bottom: .5rem
    }

    .crumb a {
        text-decoration: underline;
        text-underline-offset: 3px
    }

    .profile-head .tags {
        margin-top: .8rem
    }

    .profile-head .tags span {
        background: #fff
    }

    .tutor-layout {
        grid-template-columns: 1fr 340px
    }

    .prose {
        max-width: 620px;
        font-size: 1.05rem;
    }

    .booking {
        position: sticky;
        top: 90px;
        background: #fff;
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        padding: 1.5rem;
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .12);
        display: flex;
        flex-direction: column;
        gap: .75rem
    }

    .booking h3 {
        font-size: 1rem;
        margin-top: .75rem
    }

    .booking .btn-search {
        padding: .85rem;
        text-align: center;
        border-radius: 6px;
        margin-top: .5rem
    }

    .booking .link-quiet {
        text-align: center
    }

    @media (max-width:900px) {
        .tutor-layout {
                grid-template-columns: 1fr
            }
        .booking {
                position: static;
                order: -1
            }
    }

    /* espace professeur */
    .status {
        border-color: var(--ink);
        color: var(--ink);
        font-weight: 600
    }

    .form textarea {
        font: inherit;
        font-weight: 400;
        font-size: 1rem;
        color: var(--text);
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: .65rem .8rem;
        min-height: 110px;
        resize: vertical
    }

    .form textarea:focus {
        border-color: var(--ink);
        outline: 0;
        box-shadow: 0 0 0 3px var(--tint)
    }

    /* mes cours */
    .courses {
        list-style: none;
        border-top: 1px solid var(--line);
        margin-bottom: 1.25rem
    }

    .courses li {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: 1.25rem;
        padding: 1.1rem 0;
        border-bottom: 1px solid var(--line)
    }

    .courses .who h3 {
        font-size: 1.1rem
    }

    .course-actions {
        display: flex;
        align-items: center;
        gap: 1rem
    }

    .course-form {
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: #fff;
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .12)
    }

    .course-form h3 {
        grid-column: 1/-1;
        font-size: 1.2rem
    }

    /* planning façon When2Meet */
    .planner-hint {
        margin-bottom: 1rem;
        color: var(--muted)
    }

    .account section{scroll-margin-top:96px}

    /* messages de confirmation */
    .toasts{position:fixed;right:1.5rem;bottom:1.5rem;z-index:300;display:flex;flex-direction:column;align-items:flex-end;gap:.6rem;pointer-events:none}

    .toast{pointer-events:auto;display:flex;align-items:center;gap:.7rem;max-width:min(360px,calc(100vw - 3rem));padding:.8rem 1.1rem;background:#fff;color:var(--text);border:1.5px solid var(--ink);border-radius:6px;box-shadow:5px 5px 0 rgba(27,42,107,.12);font-weight:500;cursor:pointer;animation:toast-in .25s ease-out}

    .toast::before{content:"✓";flex:none;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--ink);color:#fff;font-size:.85rem;font-weight:700}

    .toast.error{border-color:var(--red)}

    .toast.error::before{content:"!";background:var(--red)}

    .toast.leaving{opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s}

    @keyframes toast-in{from{opacity:0;transform:translateY(12px)}}

    /* carte de réservation : cachée tant qu'aucun cours n'est choisi */
    .booking:not(.visible){visibility:hidden}

    .booking.visible{animation:booking-in .3s ease-out}

    @keyframes booking-in{from{opacity:0;transform:translateX(16px)}}

    @keyframes booking-in-mobile{from{opacity:0;transform:translateY(-8px)}}
</style>