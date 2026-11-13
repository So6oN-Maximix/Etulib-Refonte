let currentToast = $state<{ message: string; type: "ok" | "error" } | null>(null);
let timeout: ReturnType<typeof setTimeout>;

export const toastState = {
    get current() { return currentToast; },
    clear: () => { currentToast = null; }
};

export function showToast(message: string, type: "ok" | "error" = "ok") {
    if (timeout) clearTimeout(timeout);
    currentToast = { message, type };
    timeout = setTimeout(() => { currentToast = null; }, 3500);
}