<script lang="ts">
    import { scrollSpy } from "#lib/actions/ScrollSpy";
    import type { PageProps } from "./$types";
    import { formatDuration, sanitizeText } from "#lib/utils.ts";
    import { FORMAT_SUBJECTS } from "#lib/constants.ts";

    const { data }: PageProps = $props();

    const anchor = (text: string) => "matiere-" + text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const size = (bytes: number) => bytes < 1024 * 1024 ? Math.round(bytes / 1024) + " Ko" : (bytes / 1024 / 1024).toFixed(1).replace(".", ",") + " Mo";
</script>

<svelte:head>
    <title>Documents – Etulib</title>
</svelte:head>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner profile-head">
            <span class="avatar big">CM</span>
            <div>
                <p class="crumb"><a href="/student_profile#favoris">Mes professeurs</a> / {data.contact.firstName} {data.contact.lastName.toUpperCase()}</p>
                <h1>Documents</h1>
                <p>Échangés avec {data.contact.firstName} {data.contact.lastName.toUpperCase()} · {data.totalAttachments} document{data.totalAttachments > 1 ? "s" : ""}</p>
            </div>
            <a href="/student_profile?id={data.childId}" class="btn-line">Retour à mon espace</a>
        </div>
    </div>
</section>

{#if data.totalAttachments === 0}
<div class="empty">
    <p><b>Aucun document échangé pour l'instant.</b></p>
    <p>Vous avez {data.lessonCount} cours {data.isTutor ? "avec cet élève" : "avec ce professeur"}. Ajoutez des exercices, des notes ou des corrigés depuis la page d'un cours.</p>
    <a href="/lesson_details?id={data.uploadLesson.id}" class="btn-search">Ajouter un document au cours de {sanitizeText(data.uploadLesson.subject) in FORMAT_SUBJECTS ? FORMAT_SUBJECTS[sanitizeText(data.uploadLesson.subject) as keyof typeof FORMAT_SUBJECTS] : data.uploadLesson.subject.toLowerCase()}</a>
</div>
{:else}
<div class="container layout">
    <aside class="side-nav" aria-label="Matières" use:scrollSpy>
        {#each data.attachments as attachment, index}
        <a href="#{anchor(attachment.subject)}" aria-current={index === 0 ? "page" : null}>{sanitizeText(attachment.subject) in FORMAT_SUBJECTS ? FORMAT_SUBJECTS[sanitizeText(attachment.subject) as keyof typeof FORMAT_SUBJECTS] : attachment.subject} <span class="count">{attachment.attachmentCount}</span></a>
        {/each}
    </aside>

    <div class="account">
        {#each data.attachments as attachment}
        <section id="{anchor(attachment.subject)}">
            <h2>{attachment.subject}</h2>
            <ul class="sessions">
                {#each attachment.lessons as lesson}
                <li>
                    <div class="date"><b>{lesson.startDate[0]}</b>{lesson.startDate[1]}</div>
                    <div>
                        <div class="who">
                            <h3>{lesson.theme}</h3>
                            <p>{(lesson.longDate.charAt(0).toUpperCase() + lesson.longDate.slice(1))} · {formatDuration(lesson.rawStartDate.getHours() * 60 + lesson.rawStartDate.getMinutes())} à {formatDuration(lesson.endDate.getHours() * 60 + lesson.endDate.getMinutes())}</p>
                        </div>
                        {#if lesson.attachments.length > 0}
                        <ul class="docs">
                            {#each lesson.attachments as file}
                            <li>
                                <span class="file-ext">{file.mimeType.toUpperCase()}</span>
                                <div>
                                    <div class="doc-name">{file.originalName}</div>
                                    <div class="doc-meta">Envoyé par {file.user.id === data.userId ? "vous" : file.user.firstName} · {file.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {size(file.size)}</div>
                                </div>
                                <a href="/attachments?id={file.id}" class="btn-line" data-sveltekit-reload>Télécharger</a>
                            </li>
                            {/each}
                        </ul>
                        {:else}
                        <p class="no-doc-session">Aucun document déposé pour cette séance.</p>
                        {/if}
                    </div>
                </li>
                {/each}
            </ul>
        </section>
        {/each}
    </div>
</div>
{/if}

<style>
    @import "#lib/styles/profiles.css";

    .side-nav .count {
        margin-left: .35rem;
        font-size: .8rem;
        font-weight: 400;
        color: var(--muted);
    }

    .sessions {
        list-style: none;
        border-top: 1px solid var(--line);
    }

    .sessions > li {
        display: grid;
        grid-template-columns: 70px 1fr;
        gap: 1.25rem;
        padding: 1.4rem 0;
        border-bottom: 1px solid var(--line);
    }

    .docs {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: .6rem;
        margin-top: .9rem;
    }

    .docs li {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 1rem;
        padding: .7rem .9rem;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 6px;
    }

    .doc-name {
        font-weight: 600;
        color: var(--ink);
    }

    .doc-meta {
        font-size: .85rem;
        color: var(--muted);
    }

    .no-doc-session {
        margin-top: .6rem;
        font-size: .9rem;
        font-style: italic;
        color: var(--muted);
    }

    .empty .btn-search {
        display: inline-block;
        margin-top: .5rem;
        padding: .8rem 1.5rem;
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        box-shadow: 4px 4px 0 rgba(27, 42, 107, .22);
        transition: transform .12s ease, box-shadow .12s ease;
    }

    .empty .btn-search:hover {
        transform: translate(-1px, -1px);
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .3);
    }

    .empty .btn-search:active {
        transform: translate(3px, 3px);
        box-shadow: 1px 1px 0 rgba(27, 42, 107, .3);
    }

    .empty .btn-search:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
        .empty .btn-search {
            transition: none;
        }
    }
</style>