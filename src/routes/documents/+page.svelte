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
                <p class="crumb"><a href="/student_profile#favoris">Mes professeurs</a> / {data.tutor!.firstName} {data.tutor!.lastName.toUpperCase()}</p>
                <h1>Documents</h1>
                <p>Échangés avec {data.tutor!.firstName} {data.tutor!.lastName.toUpperCase()} · {data.totalAttachments} document{data.totalAttachments > 1 ? "s" : ""}</p>
            </div>
            <a href="/student_profile" class="btn-line">Retour à mon espace</a>
        </div>
    </div>
</section>

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
                        <ul class="docs">
                            {#each lesson.attachments as attachment}
                            <li>
                                <span class="file-ext">{attachment.mimeType.toUpperCase()}</span>
                                <div>
                                    <div class="doc-name">{attachment.originalName}</div>
                                    <div class="doc-meta">Envoyé par {attachment.user.id === data.userId ? "vous" : attachment.user.firstName} · {attachment.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {size(attachment.size)}</div>
                                </div>
                                <a href="/" class="btn-line" download>Télécharger</a>
                            </li>
                            {/each}
                        </ul>
                    </div>
                </li>
                {/each}
            </ul>
        </section>
        {/each}
    </div>
</div>

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
</style>