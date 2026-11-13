<script lang="ts">
    import { toastState } from "#lib/toast.svelte";
    import { fly } from "svelte/transition";
</script>

<div class="toasts" role="status" aria-live="polite">
    {#if toastState.current}
        <button 
            type="button"
            class="toast {toastState.current.type === "error" ? "error" : ""}"
            onclick={toastState.clear}
            in:fly={{ y: 20, duration: 300 }}
            out:fly={{ y: 10, duration: 250, opacity: 0 }}
        >
            {toastState.current.message}
        </button>
    {/if}
</div>

<style>
    .toasts {
        position: fixed;
        right: 1.5rem;
        bottom: 1.5rem;
        z-index: 300;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: .6rem;
        pointer-events: none;
    }

    .toast {
        font: inherit;
        text-align: left;
        margin: 0;
        
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: .7rem;
        max-width: min(360px, calc(100vw - 3rem));
        padding: .8rem 1.1rem;
        background: #fff;
        color: var(--text);
        border: 1.5px solid var(--ink);
        border-radius: 6px;
        box-shadow: 5px 5px 0 rgba(27, 42, 107, .12);
        font-weight: 500;
        cursor: pointer;
    }

    .toast::before {
        content: "✓";
        flex: none;
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--ink);
        color: #fff;
        font-size: .85rem;
        font-weight: 700;
    }

    .toast.error {
        border-color: var(--red);
    }

    .toast.error::before {
        content: "!";
        background: var(--red);
    }
</style>