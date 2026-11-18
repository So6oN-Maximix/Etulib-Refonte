<script lang="ts">
    import type { PageProps } from "./$types";
    import { enhance } from "$app/forms";

    import { formatDuration } from "#lib/utils";
    import { FORMAT_MODE } from "#lib/constants";

    import { scrollSpy } from "#lib/actions/ScrollSpy";
    import { showToast } from "#lib/toast.svelte";

    import Planner from "#lib/components/Planner.svelte";
    import type { Range } from "#lib/planner";

    import Autocomplete from "#lib/components/Autocomplete.svelte";
    import { searchSubjects, searchCities } from "#lib/autocomplete";

    import { buildWeek } from "#lib/calendar";
    import { mondayOf, addDays, formatDay } from "#lib/week";

    let { data, form }: PageProps = $props();
    // svelte-ignore state_referenced_locally
    let ranges = $state<Range[]>(data.availibilities);

    let showCourseForm = $state(false);
    let editingCourse = $state<any>(null);
    let showExpForm = $state(false);
    let editingExp = $state<any>(null);

    // svelte-ignore state_referenced_locally
    let cityName = $state(data.tutor.cityName ?? "");
    // svelte-ignore state_referenced_locally
    let cityCode = $state(data.tutor.city ?? "");
    // svelte-ignore state_referenced_locally
    let cityPicked = $state(data.tutor.cityName ?? "");

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

    let calendarModal: HTMLDialogElement | undefined = $state();
    let calWeekStart = $state(mondayOf(new Date()));
    const ROW_PX = 48;

    const weekData = $derived(buildWeek(data.calendarLessons, calWeekStart, ROW_PX));
    const calRangeLabel = $derived(`${formatDay(calWeekStart)} – ${formatDay(addDays(calWeekStart, 6))}`);

    function openCalendar() {
        calWeekStart = mondayOf(new Date());
        calendarModal?.showModal();
    }

    const shiftCalWeek = (n: number) => (calWeekStart = addDays(calWeekStart, n * 7));
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner profile-head">
            <span class="avatar big">{(data.user.firstName[0] + data.user.lastName[0]).toUpperCase()}</span>
            <div>
                <h1>{data.user.firstName} {data.user.lastName.toUpperCase()}</h1>
                <p id="tutor-role">{data.subjects.length > 0 ? `Professeur de ${data.subjects.join(", ")}` : "Professeur"}</p>
                <p id="member-since">Membre depuis {data.user.creationDate}</p>
                <div class="tags"><span class="status">Profil vérifié</span></div>
            </div>
            <a href="/tutor?id={data.tutor.id}" id="public-page" class="btn-line">Voir ma fiche publique</a>
        </div>
    </div>
</section>

<div class="container layout">
    <aside class="side-nav" aria-label="Mon espace" use:scrollSpy>
        <a href="#apercu" aria-current="page">Aperçu</a>
        <a href="#cours">Prochains cours</a>
        <a href="#eleves">Mes éleves</a>
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
                <button type="button" class="icon-btn" id="open-calendar" aria-label="Voir le calendrier de la semaine" title="Calendrier de la semaine" onclick={openCalendar}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
                </button>
            </div>
            {#if data.lessons.length > 0}
            <ul class="lessons">
                {#each data.lessons as lesson}
                <li>
                    <div class="date"><b>{lesson.dateParts[1]}</b>{lesson.dateParts[0]} {lesson.dateParts[2]}</div>
                    <div class="who">
                        <h3>{lesson.course.subject} avec {lesson.student.user.firstName} {lesson.student.user.lastName.toUpperCase()}</h3>
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

        <section id="eleves">
            <h2>Mes éleves</h2>
            {#if data.students.length > 0}
            <ul class="lessons">
                {#each data.students as student}
                <li>
                    <span class="avatar">{(student.firstName[0] + student.lastName[0]).toUpperCase()}</span>
                    <div class="who">
                        <h3>{student.firstName} {student.lastName.toUpperCase()}</h3>
                        <p>{student.subjects.join(", ")} - {student.lessonCount} lesson{student.lessonCount > 1 ? "s" : ""}</p>
                    </div>
                    <a href="/documents?studentId={student.studentId}" class="btn-line">Documents</a>
                </li>
                {/each}
            </ul>
            {:else}
            <p class="empty">Aucun élève n'a encore réserver de cours avec vous</p>
            {/if}
        </section>

        <section id="dispos">
            <h2>Mes disponibilités</h2>
            <p class="planner-hint">Cliquez et glissez pour sélectionner vos plages. Glisser sur une plage déjà choisie la retire.</p>
            <form method="POST" action="?/saveAvailability" use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === "success") showToast("Disponibilités enregistrées");
                    update({ reset: false });
                };
            }}>
                <Planner bind:ranges />
                <input type="hidden" name="planner" value={JSON.stringify(ranges)}>
                {#if form?.action === "planner" && form?.error}
                <p class="form-msg" role="alert">{form.error}</p>
                {/if}
                <button type="submit" class="btn-search" id="save-planner">Enregistrer mes disponibilités</button>
            </form>
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
                <label style="position: relative;">Matière<Autocomplete value={editingCourse?.subject ?? ""} search={searchSubjects} id="course-subject" name="subject" minChars={1} debounceMs={0} /></label>
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
            <form method="POST" action="?/saveInfos" class="form" use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === "success") showToast("Informations enregistrées");
                    else if (result.type === "failure") {
                        const data = result.data as { error?: string } | undefined;
                        const errorMessage = data?.error || "Erreur server";
                        showToast(errorMessage, "error");
                    }
                    update({ reset: false });
                };
            }}>
                <label>Prénom<input type="text" placeholder="Prénom" name="firstName" value={data.user.firstName}></label>
                <label>Nom<input type="text" placeholder="Nom" name="lastName"value={data.user.lastName}></label>
                <label class="full">Adresse e-mail<input type="email" placeholder="votre.mail@exemple.fr" name="email" value={data.user.email}></label>
                <label>Téléphone<input type="tel" placeholder="06 12 34 56 78" name="phone"value={data.tutor.phone}></label>
                <label style="position: relative;">Ville
                    <Autocomplete bind:value={cityName} search={searchCities} id="tutor-city" name="cityName" placeholder="Votre ville"
                        onselect={option => { cityCode = option.key; cityPicked = option.label; }} />
                </label>
                <input type="hidden" name="city" value={cityName === cityPicked ? cityCode : ""}>
                <input type="hidden" name="cityName" value={cityName === cityPicked ? cityPicked : ""}>
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

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
    class="modal modal-calendar"
    id="calendar-modal"
    bind:this={calendarModal}
    aria-labelledby="calendar-title"
    onclick={(e) => { if (e.target === calendarModal) calendarModal?.close(); }}
>
    <div class="cal-head">
        <h2 id="calendar-title">Cours de la semaine</h2>
        <div style="display: flex; align-items: center; gap: .4rem;">
            <button type="button" class="btn-line" style="padding: .3rem .6rem;" aria-label="Semaine précédente" onclick={() => shiftCalWeek(-1)}>‹</button>
            <span class="cal-range" id="cal-range">{calRangeLabel}</span>
            <button type="button" class="btn-line" style="padding: .3rem .6rem;" aria-label="Semaine suivante" onclick={() => shiftCalWeek(1)}>›</button>
        </div>
        <form method="dialog"><button type="submit" class="btn-line">Fermer</button></form>
    </div>

    <div class="week" id="week" style="--row: {ROW_PX}px;">
        <div class="week-hours">
            <div style="height: 44px; border-bottom: 1.5px solid var(--ink); background: var(--tint);"></div>
            {#each weekData.hours as hour}
                <span>{String(hour).padStart(2, "0")}h</span>
            {/each}
        </div>

        {#each weekData.days as day (day.iso)}
            <div class="week-day" class:today={day.today}>
                <div class="week-day-head">{day.label}</div>
                <div class="week-body" style="height: {weekData.bodyHeight}px;">
                    {#each day.lessons as lesson (lesson.id)}
                        <a
                            href="/lesson_details?id={lesson.id}"
                            class="week-lesson"
                            style="top: {lesson.top}px; height: {lesson.height}px;"
                            title="{lesson.course.title} avec {lesson.student.user.firstName} {lesson.student.user.lastName}"
                        >
                            <b>{lesson.course.subject}</b>
                            <small>{lesson.student.user.firstName} {lesson.student.user.lastName[0]}.</small>
                        </a>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    {#if weekData.count === 0}
        <p class="empty" id="no-week-lessons" style="margin-top: 1rem;">Aucun cours cette semaine.</p>
    {/if}
</dialog>

<style>
    @import "#lib/styles/profiles.css";

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