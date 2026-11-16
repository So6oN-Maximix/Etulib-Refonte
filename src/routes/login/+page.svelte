<script lang="ts">
    import { enhance } from "$app/forms";
    let { form } = $props();

    let viewPassword = $state(false);
</script>

<section class="auth seyes">
    <div class="container">
        <div class="auth-card">
            <span class="note">Content de vous revoir !</span>
            <h1>Connexion</h1>
            <form method="POST" use:enhance class="form single" id="loginForm">
                <label>Adresse e-mail<input type="email" autocomplete="email" name="email" required></label>
                <label class="full">Mot de passe
                    <span class="pw">
                        <input type={viewPassword ? "text" : "password"} minlength="8" autocomplete="new-password" name="password" required>
                        <button type="button" class="pw-toggle" aria-label={viewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={viewPassword} onclick={() => (viewPassword = !viewPassword)}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="slash" d="M3 3l18 18"/></svg>
                        </button>
                    </span>
                </label>
                <div class="auth-row">
                    <label><input type="checkbox"> Rester connecté</label>
                    <a href="/">Mot de passe oublié ?</a>
                </div>
                {#if form?.error}
                    <p class="form-msg full" role="alert">{form.error}</p>
                {/if}
                <button type="submit" class="btn-search">Se connecter</button>
            </form>
            <p class="auth-foot">Pas encore de compte ? <a href="/signup">Créer un compte</a></p>
        </div>
    </div>
</section>

<style>
    .auth {
        padding: 4rem 0 5rem;
        min-height: 70vh
    }

    .auth-card {
        width: 100%;
        max-width: 440px;
        background: #fff;
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        padding: 2.25rem;
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .12)
    }

    .auth-card h1 {
        font-size: 2rem;
        margin-bottom: 1.5rem
    }

    .auth-card .form .btn-search {
        justify-self: stretch;
        padding: .85rem
    }

    .auth-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        font-size: .9rem
    }

    .auth-row label {
        flex-direction: row;
        align-items: center;
        gap: .5rem;
        font-weight: 400;
        color: var(--text);
        font-size: .9rem
    }

    .auth-row a,
    .auth-foot a {
        color: var(--ink);
        text-decoration: underline;
        text-underline-offset: 3px
    }

    .auth-foot {
        margin-top: 1.5rem;
        text-align: center;
        color: var(--muted);
        font-size: .95rem
    }

    .auth-foot a {
        font-weight: 600
    }
    
    .form.single { grid-template-columns: 1fr }
</style>