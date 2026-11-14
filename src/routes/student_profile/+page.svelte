<script lang="ts">
    import type { PageProps } from './$types';
    import { scrollSpy } from "#lib/actions/ScrollSpy";
    import { FORMAT_LEVEL } from "#lib/constants";
    let { data }: PageProps = $props();
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner profile-head">
            <span class="avatar big">{(data.user.firstName[0] + data.user.lastName[0]).toUpperCase()}</span>
            <div>
                <h1>{data.user.firstName} {data.user.lastName.toUpperCase()}</h1>
                <p>Eleve{(data.student.level) ? " " + FORMAT_LEVEL[data.student.level as keyof typeof FORMAT_LEVEL] : ""}. Membre depuis {data.user.creationDate}.</p>
            </div>
            <a href="#infos" class="btn-line">Modifier mes informations</a>
        </div>
    </div>
</section>

<div class="container layout">
    <aside class="side-nav" aria-label="Mon espace" use:scrollSpy>
        <a href="#cours" aria-current="page">Mes cours</a>
        <a href="#comptes-rendus">Comptes rendus</a>
        <a href="#favoris">Mes professeurs</a>
        <a href="#infos">Mes informations</a>
        <a href="#paiements">Paiements et factures</a>
    </aside>

    <div class="account">
        <section id="cours">
            <h2>Prochains cours</h2>
            <ul class="lessons"></ul>
            <p class="empty" hidden>Aucune réservation pour le moment</p>
        </section>

        <section id="comptes-rendus">
            <h2>Dernier compte rendu</h2>
            <figure class="quote small">
                <blockquote>Léa a bien progressé sur les fonctions affines. On reprend les équations du second degré mercredi, avec deux exercices à préparer.</blockquote>
                <span class="note" aria-hidden="true">Bon travail !</span>
                <figcaption>Camille M., séance du 8 octobre</figcaption>
            </figure>
        </section>

        <section id="favoris">
            <h2>Mes professeurs</h2>
            <ul class="tutors compact"></ul>
            <p class="empty" hidden>Vous n'avez encore réserver aucun cours</p>
        </section>

        <section id="infos">
            <h2>Mes informations</h2>
            <form class="form" id="student-info">
                <label>Prénom<input type="text" placeholder="Prénom" name="firstName" value={data.user.firstName}></label>
                <label>Nom<input type="text" placeholder="Nom" name="lastName" value={data.user.lastName}></label>
                <label>Adresse e-mail<input type="email" placeholder="votre.mail@exemple.fr" name="email" value={data.user.email}></label>
                <label>Téléphone<input type="tel" placeholder="06 12 34 56 78" name="phone" value={data.student.phone}></label>
                <label>Ville<input type="text" placeholder="Votre ville" name="city" value={data.student.city}></label>
                <label>
                    Niveau de l'élève
                    <select name="level" value={data.student.level || "NULL"}>
                        <option value="NULL">--- Niveau ---</option>
                        <option value="PRIMAIRE">Primaire</option>
                        <option value="COLLEGE">Collège</option>
                        <option value="LYCEE">Lycée</option>
                        <option value="SUP">Prépa et supérieur</option>
                    </select>
                </label>
                <button type="submit" class="btn-search">Enregistrer</button>
            </form>
        </section>
    </div>
</div>

<style>
    @import "#lib/styles/profils.css";
</style>