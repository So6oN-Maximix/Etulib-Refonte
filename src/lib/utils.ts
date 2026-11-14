export function formatPhoneUX(rawPhone: String) {
    const compact = rawPhone.replace("+33", "0");
    const numbers = compact.match(/.{1,2}/g) || [];
    return numbers.join(" ");
}

export function formatDuration(minutes: number) {
	if (minutes < 60) return `${minutes} min`;
	const h = Math.floor(minutes / 60), m = minutes % 60;
	return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h00`;
}

export function formatHours(minutes: number) { return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`; }