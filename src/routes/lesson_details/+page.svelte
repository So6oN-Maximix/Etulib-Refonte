<script lang="ts">
    import type { PageProps } from "./$types";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import { FORMAT_MODE, FORMAT_LEVEL } from "#lib/constants.ts";
    import { formatDuration } from "#lib/utils.ts";
    import { showToast } from "#lib/toast.svelte";

    const { data, form }: PageProps = $props();

    const MAX_SIZE = 10 * 1024 * 1024;

    let fileInput: HTMLInputElement | undefined = $state();
    let uploading = $state(false);
    let over = $state(false);
    let sizeError = $state("");

    const lessonId = $derived(page.url.searchParams.get("id"));

    const ext = (name: string) => (name.split(".").pop() ?? "").slice(0, 4).toUpperCase();
    const size = (bytes: number) => bytes < 1024 * 1024 ? Math.round(bytes / 1024) + " Ko" : (bytes / 1024 / 1024).toFixed(1).replace(".", ",") + " Mo";
    const sentOn = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", ...(d.getFullYear() < new Date().getFullYear() && { year: "numeric" }) });
    };

    function onFilesChosen(event: Event & { currentTarget: HTMLInputElement }) {
        const input = event.currentTarget;
        sizeError = "";
        if (!input.files?.length) return;
        if ([...input.files].some((f) => f.size > MAX_SIZE)) {
            sizeError = "Fichier trop lourd (10 Mo maximum)";
            input.value = "";
            return;
        }
        input.form?.requestSubmit();
    }
</script>

<section class="page-head seyes" id="header">
    <div class="container">
        <div class="page-head-inner lesson-head">
            <p class="crumb"><a href="/">Mes cours</a> / {data.lesson.course.subject}</p>
            <h1>{data.lesson.course.title}</h1>
            {#if data.lesson.theme}
            <p class="theme">Thème: <span class="note">{data.lesson.theme}</span></p>
            {/if}
            <p>{data.lesson.textStartDate.charAt(0).toUpperCase() + data.lesson.textStartDate.slice(1)}, de {formatDuration(data.lesson.startDate.getHours() * 60 + data.lesson.startDate.getMinutes())} à {formatDuration(data.lesson.endDate.getHours() * 60 + data.lesson.endDate.getMinutes())}</p>
            <div class="tags">
                <span class="status">{data.lesson.startDate > new Date() ? "À venir" : "Passée"}</span>
                <span>{FORMAT_MODE[data.lesson.course.mode].charAt(0).toUpperCase() + FORMAT_MODE[data.lesson.course.mode].slice(1)}</span>
                <span>{formatDuration(data.lesson.course.duration)}</span>
            </div>
        </div>
    </div>
</section>

<div class="container layout tutor-layout">
    <div class="account">
        <section>
            <h2>Description</h2>
            <p class="prose">{data.lesson.course.bio}</p>
        </section>

        <section id="documents">
            <h2>Documents</h2>
            <p class="planner-hint">Échangez exercices, corrections et supports avec votre professeur. Formats acceptés : PDF, images et documents Word, 10 Mo maximum par fichier.</p>

            <form method="POST" action="?id={lessonId}&/uploadFile" enctype="multipart/form-data" use:enhance={() => {
                uploading = true;
                return async ({ result, update }) => {
                    if (result.type === "success") showToast("Document envoyé");
                    await update({ refreshAll: result.type === "failure" });
                    if (fileInput) fileInput.value = "";
                    uploading = false;
                    update();
                };
            }}>
                <label class="dropzone" class:over ondragover={() => (over = true)} ondragleave={() => (over = false)} ondrop={() => (over = false)}>
                    <strong>{uploading ? "Envoi en cours…" : "Déposer un document"}</strong>
                    <span>Glissez un fichier ici ou cliquez pour parcourir</span>
                    <input type="file" name="document" bind:this={fileInput} onchange={onFilesChosen} disabled={uploading}
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" multiple>
                </label>
            </form>
            {#if sizeError}
            <p class="form-msg" role="alert">{sizeError}</p>
            {:else if form?.action === "upload" && form?.error}
            <p class="form-msg" role="alert">{form.error}</p>
            {:else if form?.action === "delete" && form?.error}
            <p class="form-msg" role="alert">{form.error}</p>
            {/if}

            {#if data.files.length > 0}
            <ul class="courses docs">
                {#each data.files as file (file.id)}
                <li>
                    <span class="file-ext">{ext(file.originalName)}</span>
                    <div class="who">
                        <h3>{file.originalName}</h3>
                        <p>Envoyé par {file.sender} le {sentOn(file.createdAt)} · {size(file.size)}</p>
                    </div>
                    <div class="course-actions">
                        <a href="/" class="btn-line" download>Télécharger</a>
                        {#if file.mine}
                        <form method="POST" action="?id={lessonId}&/deleteFile" use:enhance={({ cancel }) => {
                            if (!confirm("Supprimer ce document ?")) cancel();
                            return async ({ update }) => { await update({ reset: false }); };
                        }}>
                            <input type="hidden" name="id" value={file.id}>
                            <button type="submit" class="btn-trash" aria-label="Supprimer le document" title="Supprimer">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </form>
                        {:else}
                        <span class="btn-trash-placeholder" aria-hidden="true"></span>
                        {/if}
                    </div>
                </li>
                {/each}
            </ul>
            {:else}
            <p class="empty">Aucun document pour le moment. Déposez le premier ci-dessus.</p>
            {/if}
        </section>

        <section id="avis">
            <h2>Votre avis</h2>
            <form class="form" id="review-form">
                <div class="full star-field">
                    <span class="star-label">Note</span>
                    <div class="star-picker-wrap">
                        <div class="stars star-picker" id="star-picker" style="--r:0" aria-label="Choisir une note sur 5"></div>
                        <span class="rating-display" id="rating-display">0.0 / 5</span>
                        <input type="hidden" name="rating" id="rating-input" value="0" required>
                    </div>
                </div>
                <label class="full">Commentaire<textarea name="review" placeholder="Comment s'est passé le cours ?"></textarea></label>
                <button type="submit" class="btn-search">Publier mon avis</button>
            </form>
        </section>
    </div>

    <aside class="booking lesson-aside visible" aria-label="Informations du cours" style="overflow-y: hidden;" id="lesson-info">
        <h3>Informations du cours</h3>
        <dl class="facts">
            <div><dt>Matière</dt><dd>{data.lesson.course.subject} ({FORMAT_LEVEL[data.lesson.course.level].slice(3).charAt(0).toUpperCase() + FORMAT_LEVEL[data.lesson.course.level].slice(4)})</dd></div>
            <div><dt>Date</dt><dd>{data.lesson.textStartDate.charAt(0).toUpperCase() + data.lesson.textStartDate.slice(1)}</dd></div>
            <div><dt>Horaire</dt><dd>{formatDuration(data.lesson.startDate.getHours() * 60 + data.lesson.startDate.getMinutes())} à {formatDuration(data.lesson.endDate.getHours() * 60 + data.lesson.endDate.getMinutes())}</dd></div>
            <div><dt>Type de cours</dt><dd>{FORMAT_MODE[data.lesson.course.mode].charAt(0).toUpperCase() + FORMAT_MODE[data.lesson.course.mode].slice(1)}</dd></div>
            <div><dt>Tarif</dt><dd>{data.lesson.course.hourlyRate} € / h</dd></div>
            <div><dt>Élève</dt><dd>{data.lesson.student.user.firstName} {data.lesson.student.user.lastName.toUpperCase()}</dd></div>
            <div class="wide" hidden><dt>Lieu</dt><dd id="lesson-place"></dd></div>   <!-- à afficher pour un cours à domicile -->
        </dl>
        <div class="tutor-mini">
            <span class="avatar">{(data.lesson.tutor.user.firstName[0] + data.lesson.tutor.user.lastName[0]).toUpperCase()}</span>
            <div><b>{data.lesson.tutor.user.firstName} {data.lesson.tutor.user.lastName.toUpperCase()}</b><small>Professeur de {data.lesson.course.subject.toLowerCase()}</small></div>
        </div>
        <a href="/" class="btn-search" id="join-lesson">Rejoindre la séance</a>
        <a href="/tutor?id={data.lesson.tutor.id}" class="btn-line">Voir la fiche du professeur</a>
        <a href="/" class="link-quiet" id="cancel-lesson">Annuler le cours</a>
    </aside>
</div>

<style>
    @import "#lib/styles/profiles.css";

    .lesson-head .tags span{background:#fff}

    .lesson-head h1{margin-bottom:.4rem}

    .theme{display:flex;align-items:baseline;flex-wrap:wrap;gap:.6rem;margin-bottom:.5rem;font:600 1.2rem "Bricolage Grotesque",sans-serif;color:var(--ink);overflow-wrap:anywhere}

    .lesson-aside{max-height:calc(100vh - 7rem);overflow-y:auto}

    .facts{margin:0 0 .5rem;border-top:1px solid var(--line)}

    .facts > div{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:.55rem 0;border-bottom:1px solid var(--line)}

    .facts dt{font-size:.9rem;color:var(--muted)}

    .facts dd{font-weight:600;color:var(--ink);text-align:right}

    .facts .wide{flex-direction:column;gap:.15rem}

    .facts .wide dd{text-align:left}

    .tutor-mini{display:flex;align-items:center;gap:.8rem}

    .tutor-mini small{display:block;color:var(--muted)}

    .booking .btn-line{text-align:center}

    /* documents */
    .dropzone{position:relative;display:flex;flex-direction:column;align-items:center;gap:.25rem;margin-bottom:1.5rem;padding:2rem 1.5rem;text-align:center;background:#fff;border:1.5px dashed var(--ink);border-radius:6px;color:var(--muted);cursor:pointer;transition:background .15s}

    .dropzone strong{font-family:"Bricolage Grotesque",sans-serif;font-size:1.1rem;color:var(--ink)}

    .dropzone:hover,.dropzone.over,.dropzone:focus-within{background:var(--tint)}

    .dropzone input{position:absolute;inset:0;opacity:0;cursor:pointer}

    .docs li{grid-template-columns:auto minmax(0,1fr) auto}

    .docs .who h3{font-size:1.05rem;overflow-wrap:anywhere}

    /* Système d'étoiles interactif */
    .star-field {
        display: flex;
        flex-direction: column;
        gap: .4rem;
    }

    .star-label {
        font-size: .85rem;
        font-weight: 600;
        color: var(--ink);
    }

    .star-picker-wrap {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .star-picker {
        font-size: 2.2rem;
        cursor: pointer;
        letter-spacing: 4px;
        user-select: none;
        touch-action: none;
    }

    .rating-display {
        font-family: "Bricolage Grotesque", sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ink);
        min-width: 60px;
    }

    /* Style et alignement de la liste des documents */
    .courses.docs li {
        grid-template-columns: 44px 1fr auto;
        align-items: center;
        gap: 1.25rem;
    }

    .courses.docs .course-actions {
        display: flex;
        align-items: center;
        gap: .5rem;
        justify-content: flex-end;
    }

    /* Bouton poubelle rouge */
    .btn-trash {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        color: var(--red);
        cursor: pointer;
        transition: background .15s, border-color .15s;
    }

    .btn-trash:hover {
        background: #fdf0ef;
        border-color: rgba(216, 53, 42, 0.25);
    }

    .btn-trash-placeholder {
        width: 36px;
        height: 36px;
        display: inline-block;
    }
</style>