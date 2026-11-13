<script lang="ts">
    import type { PageProps } from "./$types";
    import { enhance } from "$app/forms";
    import { formatDuration } from "#lib/utils";
    import { FORMAT_MODE } from "#lib/constants";
    import { scrollSpy } from "#lib/actions/ScrollSpy";
    import { showToast } from "#lib/toast.svelte";
    let { data, form }: PageProps = $props();

    let showCourseForm = $state(false);
    let editingCourse = $state<any>(null);
    function toggleCourseForm(event: MouseEvent) {
        event.preventDefault();
        editingCourse = null
        showCourseForm = !showCourseForm;
    }
    function modifyCourse(event: MouseEvent, course: any) {
        event.preventDefault();
        editingCourse = course;
        showCourseForm = true;
    }

    let showExpForm = $state(false);
    let editingExp = $state<any>(null);
    function toggleExpForm(event: MouseEvent) {
        event.preventDefault();
        editingExp = null
        showExpForm = !showExpForm;
    }
    function modifyExp(event: MouseEvent, exp: any) {
        event.preventDefault();
        editingExp = exp;
        showExpForm = true;
    }
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner profile-head">
            <span class="avatar big">{(data.user.firstName[0] + data.user.lastName[0]).toUpperCase()}</span>
            <div>
                <h1>{data.user.firstName} {data.user.lastName.toUpperCase()}</h1>
                <p id="tutor-role">Professeur de ...</p>
                <p id="member-since">Membre depuis {data.user.creationDate}</p>
                <div class="tags"><span class="status">Profil vérifié</span></div>
            </div>
            <a href="/tutor" id="public-page" class="btn-line">Voir ma fiche publique</a>
        </div>
    </div>
</section>

<div class="container layout">
    <aside class="side-nav" aria-label="Mon espace" use:scrollSpy>
        <a href="#apercu" aria-current="page">Aperçu</a>
        <a href="#cours">Prochains cours</a>
        <a href="#dispos">Disponibilités</a>
        <a href="#fiche">Ma fiche publique</a>
        <a href="#parcours">Mon parcours</a>
        <a href="#mes-cours">Mes Cours</a>
        <a href="#mes-infos">Mes Infos</a>
        <a href="#paiements">Paiements</a>
    </aside>

    <div class="account">
        <section id="apercu">
            <h2>Aperçu</h2>
            <div class="stats">
                <div class="stat"><b>4</b>cours cette semaine</div>
                <div class="stat"><b>212 €</b>gagnés ce mois-ci</div>
                <div class="stat"><b>4,9</b>sur 5 (126 avis)</div>
            </div>
        </section>

        <section id="cours">
            <div class="section-head">
                <h2>Prochains cours</h2>
                <button type="button" class="icon-btn" id="open-calendar" aria-label="Voir le calendrier de la semaine" title="Calendrier de la semaine">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
                </button>
            </div>
            <ul class="lessons"></ul>
        </section>

        <section id="dispos">
            <h2>Mes disponibilités</h2>
            <p class="planner-hint">Cliquez et glissez pour sélectionner vos plages. Glisser sur une plage déjà choisie la retire.</p>
            <div class="planner" id="planner"></div>
            <button type="button" class="btn-search" id="save-planner">Enregistrer mes disponibilités</button>
        </section>

        <section id="fiche">
            <h2>Ma fiche publique</h2>
            <form method="POST" action="?/saveBio" class="form" id="bio-form" use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === "success") showToast("Présentation sauvegardée");
                    update();
                };
            }}>
                <label class="full">
                    Présentation
                    <textarea id="tutor-bio" name="bio" placeholder="Parlez rapidement de vous, ce texte figurera dans votre fiche tuteur.">{data.tutor.bio}</textarea>
                </label>
                {#if form?.action === "bio" && form?.error}
                <p class="form-msg full" role="alert">{form.error}</p>
                {/if}
                <button type="submit" class="btn-search">Enregistrer</button>
            </form>
        </section>

        <section id="parcours">
            <h2>Mon parcours</h2>
            {#if data.exp.length > 0}
            <ul class="courses" id="path-list">
                {#each data.exp as exp}
                <li>
                    <div class="who">
                        <h3>{exp.title}</h3>
                        <p>{exp.location}. {exp.endYear ? `De ${exp.startYear} à ${exp.endYear}` : `Depuis ${exp.startYear}`}.</p>
                    </div>
                    <div class="course-actions">
                        <a href="/" class="btn-line" onclick={event => modifyExp(event, exp)}>Modifier</a>
                        <a href="/" class="link-quiet">Supprimer</a>
                    </div>
                </li>
                {/each}
            </ul>
            {:else}
            <p class="empty">Vous n'avez pas encore renseigné votre parcours. Cliquez sur « + Ajouter une étape » pour commencer.</p>
            {/if}

            <a href="/" class="btn-line" id="add-path" onclick={toggleExpForm}>
                {showExpForm ? "- Fermer" : "+ Ajouter une étape"}
            </a>

            <form method="POST" action={editingExp ? "?/editExp" : "?/addExp"} class="form course-form" hidden={!showExpForm} use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === "success") {
                        showExpForm = false;
                        showToast(editingExp ? "Parcours modifié" : "Parcours ajouté");
                        editingExp = null;
                    }
                    update();
                };
            }}>
                {#if editingExp}
                    <input type="hidden" name="id" value={editingExp.id} />
                {/if}
                <h3>{editingExp ? "Modifier l'étape" : "Nouvelle étape"}</h3>
                <label class="full">Intitulé<input type="text" name="title" placeholder="Ex : Agrégation externe de mathématiques" value={editingExp?.title ?? ""}></label>
                <label class="full">Établissement ou lieu<input type="text" name="location" placeholder="Ex : Lycée Fauriel, Saint-Étienne" value={editingExp?.location ?? ""}></label>
                <label>Année de début<input type="number" name="startYear" min="1900" max="2100" value={editingExp?.startYear ?? ""}></label>
                <label>Année de fin<input type="number" name="endYear" min="1900" max="2100" placeholder="Vide si en cours" value={editingExp?.endYear ?? ""}></label>
                {#if form?.action === "exp" && form?.error}
                    <p class="form-msg full" role="alert">{form.error}</p>
                {/if}
                <div class="form-actions">
                    <button type="submit" class="btn-search">Valider</button>
                    <a href="/" class="link-quiet" id="path-form-cancel" onclick={toggleExpForm}>Annuler</a>
                </div>
            </form>
        </section>

        <section id="mes-cours">
            <h2>Mes cours</h2>
            {#if data.courses.length > 0}
            <ul class="courses">
                {#each data.courses as course}
                <li>
                    <div class="who">
                        <h3>{course.title}</h3>
                        <p>{course.bio}. {formatDuration(course.duration)}, {FORMAT_MODE[course.mode]}</p>
                    </div>
                    <div class="price">
                        {course.hourlyRate} €<small>/heure</small>
                    </div>
                    <div class="course-actions">
                        <a href="/" class="btn-line" onclick={event => modifyCourse(event, course)}>Modifier</a>
                        <a href="/" class="link-quiet">Supprimer</a>
                    </div>
                </li>
                {/each}
            </ul>
            {:else}
            <p class="empty">Vous n'avez pas encore de cours. Cliquez sur « + Ajouter un cours » pour créer le premier.</p>
            {/if}

            <a href="/" class="btn-line" id="add-course" onclick={toggleCourseForm}>
                {showCourseForm ? "- Fermer" : "+ Ajouter un cours"}
            </a>

            <form method="POST" action={editingCourse ? "?/editCourse" : "?/addCourse"}  class="form course-form" hidden={!showCourseForm} use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === "success") {
                        showCourseForm = false;
                        showToast(editingCourse ? "Cours modifié" : "Cours ajouté");
                        editingCourse = null;
                    }
                    update();
                };
            }}>
                {#if editingCourse}
                    <input type="hidden" name="id" value={editingCourse.id} />
                {/if}
                <h3>Nouveau cours</h3>
                <label class="full">Intitulé<input type="text" name="title" placeholder="Ex : Préparation au bac de maths" value={editingCourse?.title ?? ""}></label>
                <label>Matière<input type="text" name="subject" value={editingCourse?.subject ?? ""}></label>
                <label>
                    Niveau
                    <select name="level" value={editingCourse?.level ?? ""}>
                        <option value="PRIMAIRE">Primaire</option>
                        <option value="COLLEGE">Collège</option>
                        <option value="LYCEE">Lycée</option>
                        <option value="SUP">Prépa et supérieur</option>
                    </select>
                </label>
                <label class="full">Description<textarea name="bio" value={editingCourse?.bio ?? ""}></textarea></label>
                <label>Tarif horaire (€)<input type="number" name="hourlyRate" value={editingCourse?.hourlyRate ?? 0}></label>
                <label>
                    Durée
                    <select name="duration" value={String(editingCourse?.duration) ?? "30"}>
                        <option value="30">30 min</option>
                        <option value="60">1 h</option>
                        <option value="90">1 h 30</option>
                        <option value="120">2 h</option>
                    </select>
                </label>
                <label class="full">
                    Type de cours
                    <select name="mode" value={editingCourse?.mode ?? "TOUS"}>
                        <option value="TOUS">En ligne et à domicile</option>
                        <option value="EN_LIGNE">En ligne</option>
                        <option value="DOMICILE">À domicile</option>
                    </select>
                </label>
                {#if form?.action === "course" && form?.error}
                <p class="form-msg full" role="alert">{form.error}</p>
                {/if}
                <div class="form-actions">
                    <button type="submit" class="btn-search">Valider</button>
                    <a href="/" class="link-quiet" id="course-form-cancel" onclick={toggleCourseForm}>Annuler</a>
                </div>
            </form>
        </section>

        <section id="mes-infos">
            <h2>Mes informations</h2>
            <form class="form" id="tutor-info">
                <label>Prénom<input type="text" placeholder="Prénom" name="firstName" value={data.user.firstName}></label>
                <label>Nom<input type="text" placeholder="Nom" name="lastName"value={data.user.lastName}></label>
                <label class="full">Adresse e-mail<input type="email" placeholder="votre.mail@exemple.fr" name="email" value={data.user.email}></label>
                <label>Téléphone<input type="tel" placeholder="06 12 34 56 78" name="phone"value={data.tutor.phone}></label>
                <label>Ville<input type="text" placeholder="Votre ville" name="city" value={data.tutor.city}></label>
                <button type="submit" class="btn-search">Enregistrer</button>
            </form>
        </section>
    </div>
</div>

<dialog class="modal modal-confirm" id="delete-modal" aria-labelledby="delete-title">
    <h2 id="delete-title">Supprimer ce cours ?</h2>
    <p class="modal-intro">Vous allez supprimer <strong id="delete-name">ce cours</strong>. Cette action est définitive.</p>
    <p class="form-msg" id="delete-msg" role="alert" hidden></p>
    <form method="dialog" class="modal-actions">
        <button type="submit" value="cancel" class="btn-line">Annuler</button>
        <button type="submit" value="confirm" class="btn-danger">Supprimer</button>
    </form>
</dialog>

<dialog class="modal" id="onboarding-modal">
    <span class="note">Dernière étape !</span>
    <h2>Complétez votre profil</h2>
    <p class="modal-intro">Ces informations apparaîtront sur votre fiche. Vous pourrez les modifier à tout moment.</p>
    <form class="form" id="tutor-onboarding-form">
        <label class="full">Matières enseignées<input type="text" name="subjects" placeholder="Ex : Mathématiques, Physique-Chimie" required></label>
        <fieldset class="choice wrap full"><legend>Niveaux</legend>
            <label><input type="checkbox" name="levels" value="primary"> Primaire</label>
            <label><input type="checkbox" name="levels" value="middle"> Collège</label>
            <label><input type="checkbox" name="levels" value="high"> Lycée</label>
            <label><input type="checkbox" name="levels" value="higher"> Prépa et supérieur</label>
        </fieldset>
        <fieldset class="choice wrap full"><legend>Type de cours</legend>
            <label><input type="radio" name="mode" value="online" checked> En ligne</label>
            <label><input type="radio" name="mode" value="home"> À domicile</label>
            <label><input type="radio" name="mode" value="both"> Les deux</label>
        </fieldset>
        <label>Tarif horaire (€)<input type="number" name="hourly-rate" min="10" required></label>
        <label class="full">Présentation<textarea name="bio" placeholder="Votre parcours, votre méthode…" required></textarea></label>
        <p class="form-msg full" id="form-msg" role="alert" hidden></p>
        <div class="form-actions">
            <button type="submit" class="btn-search">Terminer</button>
            <a href="/" class="link-quiet" id="onboarding-later">Plus tard</a>
        </div>
    </form>
</dialog>

<dialog class="modal modal-calendar" id="calendar-modal" aria-labelledby="calendar-title">
    <div class="cal-head">
        <h2 id="calendar-title">Cours de la semaine</h2>
        <span class="cal-range" id="cal-range"></span>
        <form method="dialog"><button type="submit" class="btn-line">Fermer</button></form>
    </div>
    <div class="week" id="week"></div>
    <p class="empty" id="no-week-lessons" hidden>Aucun cours cette semaine.</p>
</dialog>

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

    .stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem
    }

    .stat {
        padding: 1rem 1.25rem;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #fff;
        color: var(--muted)
    }

    .stat b {
        display: block;
        font-family: "Bricolage Grotesque", sans-serif;
        font-size: 1.8rem;
        color: var(--ink)
    }

    /* fenêtre de complétion du profil */
    .choice.wrap {
        flex-wrap: wrap
    }

    .choice.wrap label {
        flex: 1 1 40%
    }

    .modal {
        width: min(560px, calc(100% - 2rem));
        max-height: calc(100vh - 2rem);
        margin: auto;
        padding: 2rem;
        overflow: auto;
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .12)
    }

    .modal::backdrop {
        background: rgba(27, 42, 107, .45)
    }

    .modal h2 {
        font-size: 1.8rem;
        margin-bottom: .5rem
    }

    .modal-intro {
        margin-bottom: 1.5rem;
        color: var(--muted)
    }

    .planner {
        display: grid;
        padding:0 1rem 1rem 0;
        grid-template-columns: 48px repeat(7, minmax(0, 1fr));
        max-width: 640px;
        background: #fff;
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .12);
        overflow: hidden;
        user-select: none;
        touch-action: none
    }

    .planner .day {
        padding: .5rem 0;
        text-align: center;
        font: 600 .85rem "Bricolage Grotesque", sans-serif;
        color: var(--ink);
        background: var(--tint);
        border-bottom: 1.5px solid var(--ink)
    }

    .planner .hour {
        height: 22px;
        padding: 2px .4rem 0 0;
        text-align: right;
        font-size: .72rem;
        line-height: 1;
        color: var(--muted)
    }

    .planner .cell {
        height: 22px;
        border-top: 1px solid var(--grid);
        border-left: 1px solid var(--grid);
        cursor: pointer
    }

    .planner .cell.hr {
        border-top-color: var(--grid-main)
    }

    .planner .cell:hover {
        background: var(--tint)
    }

    .planner .cell.on {
        background: var(--ink);
        border-color: rgba(255, 255, 255, .22)
    }

    .planner .cell:nth-child(8n){border-right:1px solid var(--grid)}

    .planner .cell:nth-last-child(-n+7){border-bottom:1px solid var(--grid)}

    .planner .day:nth-child(8){border-right:1px solid var(--grid)}

    #save-planner {
        margin-top: 1.25rem;
        padding: .8rem 2rem
    }

    /* fenêtre de confirmation */
    .modal-confirm{width:min(440px,calc(100% - 2rem))}

    .modal-confirm h2{font-size:1.5rem}

    .modal-actions{display:flex;justify-content:flex-end;gap:.75rem}

    .btn-danger{padding:.55rem 1.1rem;border:0;border-radius:6px;background:var(--red);color:#fff;font:inherit;font-weight:600;font-size:.92rem;cursor:pointer}

    .btn-danger:hover{background:#b92a20}

    .modal-confirm .form-msg{margin-bottom:1rem}

    /* bouton calendrier */
    .section-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem}

    .section-head h2{margin:0}

    .icon-btn{display:grid;place-items:center;width:40px;height:40px;background:#fff;border:1.5px solid var(--ink);border-radius:6px;color:var(--ink);cursor:pointer;transition:background .15s,color .15s}

    .icon-btn:hover{background:var(--ink);color:#fff}

    .icon-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}

    /* calendrier de la semaine */
    .modal-calendar{width:min(980px,calc(100% - 2rem))}

    .cal-head{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}

    .cal-head h2{margin:0;font-size:1.5rem}

    .cal-range{margin-right:auto;color:var(--muted)}

    .week{display:grid;grid-template-columns:52px repeat(7,minmax(0,1fr));min-width:640px;background:#fff;border:1.5px solid var(--ink);border-radius:6px;overflow:hidden}

    .week-hours span{display:block;height:var(--row);padding:.15rem .4rem 0 0;text-align:right;font-size:.72rem;color:var(--muted)}

    .week-day{min-width:0;border-left:1px solid var(--line)}

    .week-day-head{display:grid;place-items:center;height:44px;background:var(--tint);border-bottom:1.5px solid var(--ink);font:600 .85rem "Bricolage Grotesque",sans-serif;color:var(--ink);text-transform:capitalize}

    .week-day.today .week-day-head{background:var(--ink);color:#fff}

    .week-body{position:relative;background-image:repeating-linear-gradient(to bottom,var(--grid-main) 0 1px,transparent 1px var(--row))}

    .week-lesson{position:absolute;left:3px;right:3px;padding:.25rem .45rem;overflow:hidden;background:var(--ink);color:#fff;border-radius:4px;font-size:.78rem;line-height:1.25}

    .week-lesson b,.week-lesson small{display:block}

    .week-lesson small{opacity:.8}

    .week-lesson:hover{background:var(--ink-2)}
</style>