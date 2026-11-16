<script lang="ts">
    import { scrollSpy } from "#lib/actions/ScrollSpy";
    import type { PageProps } from "./$types";
    import { formatDuration } from "#lib/utils.ts";

    const { data }: PageProps = $props();

    const sanitize = (text: String) => text.replace("é", "e").replace("è", "e");
    const size = (bytes: number) => bytes < 1024 * 1024 ? Math.round(bytes / 1024) + " Ko" : (bytes / 1024 / 1024).toFixed(1).replace(".", ",") + " Mo";
</script>

<section class="page-head seyes">
    <div class="container">
        <div class="page-head-inner profile-head">
            <span class="avatar big">CM</span>
            <div>
                <p class="crumb"><a href="/student_profile#favoris">Mes professeurs</a> / {data.contact.firstName} {data.contact.lastName.toUpperCase()}</p>
                <h1>Documents</h1>
                <p>Échangés avec {data.contact.firstName} {data.contact.lastName.toUpperCase()} · {data.totalAttachments} document{data.totalAttachments > 1 ? "s" : ""}</p>
            </div>
            <a href="/student_profile" class="btn-line">Retour à mon espace</a>
        </div>
    </div>
</section>

{#if data.totalAttachments === 0}
<div class="container empty-page">
    <div class="empty">
        <h3>Aucun document échangé pour le moment</h3>
        <p>Les exercices, corrections et supports partagés lors de vos séances avec {data.contact.firstName} apparaîtront ici.</p>
        <a href={data.isTutor ? "/tutor_profile" : "/student_profile"} class="btn-search">Voir mes cours pour déposer un fichier</a>
    </div>
</div>
{:else}
<div class="container layout">
    <aside class="side-nav" aria-label="Matières" use:scrollSpy>
        {#each data.attachments as attachment, index}
        <a href="#{sanitize(attachment.subject.toLowerCase())}" aria-current={index === 0 ? "page" : null}>{attachment.subject} <span class="count">{attachment.attachmentCount}</span></a>
        {/each}
    </aside>

    <div class="account">
        {#each data.attachments as attachment}
        <section id="{sanitize(attachment.subject.toLowerCase())}">
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
                                <a href="/" class="btn-line" download>Télécharger</a>
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

    .empty-page {
        padding-top: 3rem;
        padding-bottom: 5rem;
    }

    .empty-page .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .75rem;
        padding: 3rem 1.5rem;
        background: #fff;
    }

    .empty-page .empty h3 {
        font-size: 1.25rem;
    }

    .empty-page .empty p {
        max-width: 460px;
        margin-bottom: .5rem;
    }

    .empty-page .btn-search {
        padding: .7rem 1.4rem;
    }

    .no-doc-session {
        margin-top: .6rem;
        font-size: .9rem;
        font-style: italic;
        color: var(--muted);
    }
</style>