<script lang="ts">
    import type { PageProps } from './$types';
    import { enhance } from "$app/forms";
    import { FORMAT_LEVEL, FORMAT_MODE } from "#lib/constants";
    import { scrollSpy } from "#lib/actions/ScrollSpy";
    import { formatDuration } from '#lib/utils.ts';
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
                <p>Parent{data.childrens.length > 0 ? " de " + data.childrens.map(child => child.user.firstName).join(", ") : ""}. Membre depuis {data.user.creationDate}.</p>
            </div>
            <a href="/research" class="btn-line">Trouver un professeur</a>
        </div>
    </div>
</section>

<div class="container layout">
    <aside class="side-nav" aria-label="Mon espace" use:scrollSpy>
        <a href="#cours" aria-current="page">Prochains cours</a>
        <a href="#enfants">Mes enfants</a>
        <a href="#professeurs">Mes professeurs</a>
        <a href="#paiements">Paiements</a>
        <a href="#infos">Mes informations</a>
    </aside>

    <div class="account">
        <section id="cours">
            <h2>Prochains cours</h2>
            {#if data.lessons.length > 0}
            <ul class="lessons">
                {#each data.lessons as lesson}
                <li>
                    <div class="date"><b>{lesson.splitDate[1]}</b>{lesson.splitDate[0]} {lesson.splitDate[2]}</div>
                    <div class="who">
                        <h3>{lesson.child.user.firstName}, {lesson.course.subject.toLowerCase()} avec {lesson.tutor.user.firstName} {lesson.tutor.user.lastName.toUpperCase()}</h3>
                        <p>{formatDuration(lesson.startDate.getHours() * 60 + lesson.startDate.getMinutes())} à {formatDuration(lesson.endDate.getHours() * 60 + lesson.endDate.getMinutes())}, {FORMAT_MODE[lesson.course.mode]}</p>
                    </div>
                    <a href="/lesson_details?id={lesson.id}" class="btn-line">Details</a>
                    <a href="/" class="link-quiet">Annuler</a>
                </li>
                {/each}
            </ul>
            {:else}
            <p class="empty">Aucune réservation pour le moment</p>
            {/if}
        </section>

        <section id="enfants">
            <h2>Mes enfants</h2>
            {#if data.childrens.length > 0}
            <ul class="courses">
                {#each data.childrens as child}
                <li>
                    <div class="who">
                        <h3>{child.user.firstName} {child.user.lastName.toUpperCase()}</h3>
                        <p>{FORMAT_LEVEL[child.level!].charAt(0).toUpperCase() + FORMAT_LEVEL[child.level!].slice(1)}</p>
                    </div>
                    <div class="course-actions">
                        <a href="/research" class="btn-line">Réserver un cours</a>
                        <a href="/student_profile?id={child.id}" class="link-quiet">Profil</a>
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
    @import "#lib/styles/profiles.css";
</style>