<script lang="ts">
    import { enhance } from "$app/forms";
    let { form } = $props();
    let role = $state("parent");
    let viewPassword = $state(false);
</script>

<section class="auth seyes">
    <div class="container">
        <div class="auth-card wide">
            <span class="note">Bienvenue !</span>
            <h1>Créer un compte</h1>
            <form method="POST" use:enhance class="form" id="signup-form">
                <fieldset class="choice full"><legend>Je suis</legend>
                    <label><input type="radio" value="parent" name="role" bind:group={role}> Parent</label>
                    <label><input type="radio" value="student" name="role" bind:group={role}> Élève</label>
                    <label><input type="radio" value="tutor" name="role" bind:group={role}> Tuteur</label>
                </fieldset>
                <label>Prénom<input type="text" autocomplete="given-name" name="firstName" required></label>
                <label>Nom<input type="text" autocomplete="family-name" name="lastName" required></label>
                <label class="full">Adresse e-mail<input type="email" autocomplete="email" name="email" required></label>
                <label class="full">Mot de passe
                    <span class="pw">
                        <input type={viewPassword ? "text" : "password"} minlength="8" autocomplete="new-password" name="password" required>
                        <button type="button" class="pw-toggle" aria-label={viewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={viewPassword} onclick={() => (viewPassword = !viewPassword)}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path class="slash" d="M3 3l18 18"/></svg>
                        </button>
                    </span>
                </label>
                {#if role === "student"}
                    <label class="full" id="student-fields">
                        <span>Date de naissance</span>
                        <input type="date" name="birthDate" id="birthDateInput">
                    </label>
                {/if}
                <div class="auth-row full">
                    <label><input type="checkbox" required> J'accepte les <a href="/">conditions d'utilisation</a></label>
                </div>
                {#if form?.error}
                    <p class="form-msg full" role="alert">{form.error}</p>
                {/if}
                <button type="submit" class="btn-search">Créer mon compte</button>
            </form>
            <p class="auth-foot">Déjà un compte ? <a href="/login">Se connecter</a></p>
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
</style>