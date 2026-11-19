<script lang="ts">
    import { page } from "$app/state";

    type Action = { label: string; href?: string; run?: () => void };
    type ErrorContent = { title: string; text: string; primary: Action; secondary?: Action };

    const HOME: Action = { label: "Accueil", href: "/" };

    const CONTENT: Record<number, ErrorContent> = {
        400: {
            title: "Demande invalide",
            text: "Le lien est incomplet ou une information est incorrecte. Revenez en arrière et réessayez.",
            primary: { label: "Revenir en arrière", run: () => history.back() },
            secondary: HOME
        },
        401: {
            title: "Connexion requise",
            text: "Connectez-vous pour accéder à cette page.",
            primary: { label: "Se connecter", href: "/login" },
            secondary: HOME
        },
        403: {
            title: "Accès refusé",
            text: "Ce contenu n'est pas disponible pour votre compte. Vérifiez que vous êtes connecté avec le bon profil.",
            primary: HOME,
            secondary: { label: "Changer de compte", href: "/login" }
        },
        404: {
            title: "Page introuvable",
            text: "Cette adresse n'existe pas ou a été déplacée. Retournez à l'accueil pour relancer votre recherche.",
            primary: { label: "Retour à l'accueil", href: "/" }
        }
    };

    const FALLBACK: ErrorContent = {
        title: "Une erreur est survenue",
        text: "Le problème vient de notre côté. Réessayez dans quelques instants.",
        primary: { label: "Réessayer", run: () => location.reload() },
        secondary: HOME
    };

    const status = $derived(page.status);
    const content = $derived(CONTENT[status] ?? FALLBACK);
    const detail = $derived([400, 401, 403].includes(status) ? page.error?.message : "");
</script>

<svelte:head>
    <title>{status} {content.title} – Etulib</title>
</svelte:head>

{#snippet action(a: Action, className: string)}
    {#if a.href}
        <a href={a.href} class={className}>{a.label}</a>
    {:else}
        <button type="button" class={className} onclick={a.run}>{a.label}</button>
    {/if}
{/snippet}

<section class="page-head seyes error-page">
    <div class="container">
        <div class="error-body">
            <p class="error-code" aria-hidden="true">{status}</p>
            <h1>{content.title}</h1>
            <p class="error-text">{content.text}</p>

            {#if detail}
                <p class="error-detail">{detail}</p>
            {/if}

            <div class="error-actions">
                {@render action(content.primary, "btn-search")}
                {#if content.secondary}
                    {@render action(content.secondary, "btn-line")}
                {/if}
            </div>
        </div>
    </div>
</section>

<style>
    @import "#lib/styles/profiles.css";

    .error-page {
        padding-block: clamp(3rem, 10vw, 6rem);
    }

    .error-body {
        max-width: 36rem;
        padding-left: clamp(1rem, 3vw, 1.75rem);
        border-left: 2px solid var(--margin);
    }

    .error-code {
        margin: 0 0 1rem;
        font: 700 clamp(5rem, 18vw, 9rem) / .9 "Bricolage Grotesque", sans-serif;
        letter-spacing: -.02em;
        color: transparent;
        -webkit-text-stroke: 2px var(--ink);
    }

    .error-body h1 {
        margin: 0 0 .6rem;
    }

    .error-text {
        margin: 0 0 1rem;
        color: var(--muted);
    }

    .error-detail {
        margin: 0;
        padding: .6rem .85rem;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 6px;
        color: var(--ink);
        font-size: .95rem;
        font-weight: 500;
        overflow-wrap: anywhere;
    }

    .error-actions {
        display: flex;
        flex-wrap: wrap;
        gap: .75rem;
        margin-top: 1.5rem;
    }

    .error-actions > * {
        flex: none;
        width: auto;
        text-align: center;
    }

    .error-actions .btn-search,
    .error-actions .btn-line {
        padding: .8rem 1.5rem;
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        box-shadow: 4px 4px 0 rgba(27, 42, 107, .22);
        transition: transform .12s ease, box-shadow .12s ease, background .15s;
    }

    .error-actions .btn-line {
        background: #fff;
    }

    .error-actions .btn-line:hover {
        background: var(--tint);
    }

    .error-actions .btn-search:hover,
    .error-actions .btn-line:hover {
        transform: translate(-1px, -1px);
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .3);
    }

    .error-actions .btn-search:active,
    .error-actions .btn-line:active {
        transform: translate(3px, 3px);
        box-shadow: 1px 1px 0 rgba(27, 42, 107, .3);
    }

    .error-actions .btn-search:focus-visible,
    .error-actions .btn-line:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
        .error-actions .btn-search,
        .error-actions .btn-line {
            transition: none;
        }
    }
</style>