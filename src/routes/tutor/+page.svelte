<script lang="ts">
    import type { PageProps } from "./$types";
    import { enhance } from "$app/forms";

    import { formatDuration } from "#lib/utils";
    import { FORMAT_MODE } from "#lib/constants";
    import { mondayOf, addDays, formatDay } from "#lib/week";

    let { data, form }: PageProps = $props();

    type Course = PageProps["data"]["courses"][number];

    let selectedCourse = $state<Course | null>(null);
    let bookingEl: HTMLElement | undefined;

    let weekStart = $state(mondayOf(new Date()));
    const weekLabel = $derived(`${formatDay(weekStart)} — ${formatDay(addDays(weekStart, 6))}`);
    const shiftWeek = (n: number) => (weekStart = addDays(weekStart, n * 7));

    function selectCourse(course: Course) {
        const firstSelection = selectedCourse === null;
        selectedCourse = course;
        if (firstSelection && matchMedia("(max-width:900px)").matches) {
            const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;
            bookingEl?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
    }

    const courseInfo = (course: { duration: number, mode: string }) => {
        const modeString = FORMAT_MODE[course.mode as keyof typeof FORMAT_MODE] ?? "";
        return `${formatDuration(course.duration)} · ${modeString}`;
    }
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner profile-head">
            <span class="avatar big">{(data.user.firstName[0] + data.user.lastName[0]).toUpperCase()}</span>
            <div>
                <p class="crumb"><a href="/">Résultats de recherche/</a></p>
                <h1>{data.user.firstName} {data.user.lastName.toUpperCase()}</h1>
                <p id="tutor-role">Professeur de ...</p>
                <p id="member-since">Membre depuis {data.user.creationDate}</p>
                <div class="tags">
                    <span>Profil vérifié</span>
                    <span><b>4,9</b> sur 5 (126 avis)</span>
                </div>
            </div>
        </div>
    </div>
</section>

<div class="container layout tutor-layout">
    <div class="account">
        <section>
            <h2>À propos</h2>
            {#if data.bio}
            <p class="prose">{data.bio}</p>
            {:else}
            <div class="empty">
                <p>Le professeur n'a pas encore rédigé sa description.</p>
            </div>
            {/if}
        </section>

        <section>
            <h2>Matières et niveaux</h2>
            {#if data.courses.length > 0}
            <ul class="tutors compact subjects">
                {#each data.courses as course}
                <li>
                    <button type="button" class="btn-course" aria-pressed={selectedCourse?.id === course.id} onclick={() => selectCourse(course)}>
                        <div class="who">
                            <h3>{course.title}</h3>
                            <p>{course.bio}</p>
                            <small class="course-info">{courseInfo(course)}</small>
                        </div>
                        <div class="price">
                            {course.hourlyRate} €<small>/heure</small>
                        </div>
                    </button>
                </li>
                {/each}
            </ul>
            {:else}
            <div class="empty">
                <p>Le professeur n'a pas encore renseigné ses cours.</p>
            </div>
            {/if}
        </section>

        <section>
            <h2>Parcours</h2>
            {#if data.exp.length > 0}
            <ol class="timeline">
                {#each data.exp as exp}
                <li>
                    <b>{exp.endYear ? `De ${exp.startYear} à ${exp.endYear}` : `Depuis ${exp.startYear}`}</b>
                    <div>
                        <span>{exp.title}</span>
                        <small>{exp.location}</small>
                    </div>
                </li>
                {/each}
            </ol>
            {:else}
            <div class="empty">
                <p>Le professeur n'a pas encore renseigné ses cours.</p>
            </div>
            {/if}
        </section>

        <section>
            <h2>Avis des familles</h2>
            <ul class="reviews">
                <li><blockquote>Ma fille avait peur des maths. Après deux mois, elle lève la main en classe.</blockquote><p>Nadia, parent d'une élève de seconde</p></li>
                <li><blockquote>Très pédagogue, ponctuelle, et les comptes rendus sont précieux. Mon fils a gagné 5 points de moyenne.</blockquote><p>Marc, parent d'un élève de terminale</p></li>
                <li><blockquote>Elle m'a remis en confiance avant le bac. Je recommande sans hésiter.</blockquote><p>Louise, élève de terminale</p></li>
            </ul>
        </section>
    </div>

    <aside class="booking" class:visible={selectedCourse !== null} bind:this={bookingEl} aria-label="Réserver">
        <h3 class="booking-course" id="booking-course">{selectedCourse?.title ?? "Choisissez un cours"}</h3>
        <div class="price" id="to-book-price">{selectedCourse?.hourlyRate ?? 0} €<small>/heure</small></div>
        <small class="course-info" id="booking-info">{selectedCourse ? courseInfo(selectedCourse) : ""}</small>
        <div class="week-picker">
            <button type="button" class="btn-week" aria-label="Semaine précédente" disabled={weekStart <= mondayOf(new Date())} onclick={() => shiftWeek(-1)}>‹</button>
            <span class="week-label" id="week-label" data-data="13/10/2026">{weekLabel}</span>
            <button type="button" class="btn-week" aria-label="Semaine suivante" onclick={() => shiftWeek(1)}>›</button>
        </div>
        <h3>Prochains créneaux</h3>
        <div class="slots">

        </div>
        <a href="/" class="btn-search">Réserver un cours</a>
        <a href="/" class="link-quiet">Envoyer un message</a>
    </aside>
</div>

<style>
    @import "#lib/styles/profils.css";

    .timeline {
        list-style: none;
        border-left: 2px solid var(--margin);
        padding-left: 1.5rem
    }

    .timeline li {
        display: grid;
        grid-template-columns: 130px 1fr;
        gap: 1rem;
        padding: .55rem 0
    }

    .timeline b {
        font-family: "Bricolage Grotesque", sans-serif;
        color: var(--ink)
    }

    .reviews {
        list-style: none
    }

    .reviews li {
        padding: 1.25rem 0 1.25rem 1.5rem;
        border-left: 2px solid var(--line);
        margin-bottom: .5rem
    }

    .reviews blockquote {
        font-size: 1.1rem;
        color: var(--ink)
    }

    .reviews p {
        margin-top: .5rem;
        color: var(--muted);
        font-size: .9rem
    }

    .booking .price {
        text-align: left;
        font-size: 2rem
    }

    .slots p {
        font-size: .88rem;
        font-weight: 600;
        margin: .6rem 0 .3rem
    }

    .slots div {
        display: flex;
        gap: .4rem;
        flex-wrap: wrap
    }

    .slots a {
        border: 1px solid var(--line);
        border-radius: 6px;
        padding: .4rem .8rem;
        font-weight: 500;
        color: var(--ink)
    }

    .slots a:hover {
        border-color: var(--ink);
        background: var(--tint)
    }

    .booking .slots {
        max-height: 180px;
        overflow-y: auto;
        padding-right: 6px;
    }

    .booking .slots::-webkit-scrollbar {
        width: 5px;
    }

    .booking .slots::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 10px;
    }

    .booking .slots::-webkit-scrollbar-track {
        background: transparent;
    }

    .tutors.subjects li{grid-template-columns:minmax(0,1fr) auto}

    .subjects .price{white-space:nowrap}

    .subjects button{transition:background .15s,box-shadow .15s}

    .subjects button:hover{background:var(--tint);box-shadow:-1rem 0 0 var(--tint),1rem 0 0 var(--tint); }

    .btn-course {
        width: 100%;
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        text-align: left;
        cursor: pointer;
        
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 1.5rem;
        
        color: var(--text);
        padding: 1.1rem 0;
    }

    .booking .booking-course{margin:0;font-size:1.2rem;line-height:1.2;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow:hidden}

    .timeline small{display:block;margin-top:.1rem;color:var(--muted);font-size:.9rem;line-height:1.4}

    /* Sélecteur de semaine dans le bloc de réservation */
    .week-picker {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .5rem;
        padding: .35rem .5rem;
        background: var(--tint);
        border: 1px solid var(--line);
        border-radius: 6px;
        margin-top: .25rem;
    }

    .week-label {
        font-size: .88rem;
        font-weight: 600;
        color: var(--ink);
        text-align: center;
    }

    .btn-week {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 4px;
        color: var(--ink);
        font-family: inherit;
        font-size: 1.2rem;
        font-weight: 600;
        line-height: 1;
        cursor: pointer;
        transition: background .15s, border-color .15s, color .15s;
    }

    .btn-week:hover:not(:disabled) {
        background: var(--ink);
        color: #fff;
        border-color: var(--ink);
    }

    .btn-week:disabled {
        opacity: .35;
        cursor: not-allowed;
    }

    .course-info{display:block;margin-top:.3rem;color:var(--ink);font-size:.9rem;font-weight:600}

    .booking .course-info{margin-top:-.4rem}

    .slots a{transition:background .15s,color .15s,border-color .15s}

    .slots a.selected{background:var(--ink);border-color:var(--ink);color:#fff}

    .slots a:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
</style>