<script lang="ts">
    import { enhance } from "$app/forms";
    import logoSvg from "#lib/assets/favicon.svg";
    let { user } = $props();
</script>

<header class="site-header">
	<div class="container header-inner">
		<a href="/" class="logo">
			<img src={logoSvg} alt="" class="logo-icon" />
			<span>Etulib</span>
		</a>
		<nav class="main-nav" aria-label="Navigation principale">
			<a href="/research">Trouver un prof</a>
			<a href="#methode">Comment ça marche ?</a>
			<a href="#engagements">Nos engagements</a>
			<a href="#faq">Questions</a>
		</nav>
		<div class="auth-buttons ready">
            {#if user}
                <a href="/" class="nav-messages">Messages</a>
                <a href="/{user.role.toLowerCase()}_profile" class="btn-signup">Mon espace</a>
                <a href="/logout" class="btn-logout" data-sveltekit-preload-data="false">Se déconnecter</a>
            {:else}
                <a href="/login" class="btn-login">Se connecter</a>
                <a href="/signup" class="btn-signup">Créer un compte</a>
            {/if}
		</div>
	</div>
</header>

<style>
    .site-header {
        background: var(--paper);
        border-bottom: 1px solid var(--line);
        position: sticky; top: 0; z-index: 50
    }

    .header-inner {
        display: flex; align-items: center;
        gap: 2rem; height: 70px
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-family: "Bricolage Grotesque", sans-serif;
        font-size: 1.45rem; 
        font-weight: 700;
        color: var(--ink); 
        letter-spacing: -.03em;
        text-decoration: none;
    }

    .logo-icon {
        width: 32px;
        height: 32px;
        object-fit: contain;
    }

    .main-nav { display: flex; gap: 1.75rem; margin: 0 auto 0 1rem }
    .main-nav a { font-size: .95rem; font-weight: 500; color: var(--muted) }
    .main-nav a:hover { color: var(--ink) }

    .auth-buttons { display: flex; align-items: center; gap: .5rem }
    .auth-buttons a {
        font-weight: 600; font-size: .95rem;
        padding: .55rem 1.1rem; border-radius: 6px
    }

    .btn-login:hover { background: var(--tint) }

    .btn-signup { background: var(--ink); color: #fff }
    .btn-signup:hover { background: var(--ink-2) }

    .btn-logout { background: var(--red); color: #fff }
    .btn-logout:hover {background: #b92a20 }
</style>