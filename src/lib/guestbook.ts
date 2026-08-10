// 개발: Vite 프록시 경유(CORS 우회) / 프로덕션: 직접 URL
const API = import.meta.env.DEV
	? '/api/gs/exec'
	: 'https://script.google.com/macros/s/AKfycbzsWf6AO0JX8j-xvDLws9Md5fAnsLtUTtlo-Mimtgwa50k2GCsnWSQlofin_eP2cz_s/exec';

export interface Msg {
	id: number;
	name: string;
	text: string;
	date: string;
}

function formatDate(val: unknown): string {
	const d = new Date(typeof val === 'number' ? val : String(val ?? ''));
	if (isNaN(d.getTime())) return '';
	const y = d.getFullYear();
	const mo = d.getMonth() + 1;
	const day = d.getDate();
	const h = String(d.getHours()).padStart(2, '0');
	const mi = String(d.getMinutes()).padStart(2, '0');
	return `${y}. ${mo}. ${day}. ${h}:${mi}`;
}

async function hashPassword(pw: string): Promise<string> {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
	return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchMsgs(): Promise<Msg[]> {
	const res = await fetch(API);
	if (!res.ok) throw new Error('fetch failed');
	const raw: unknown = await res.json();
	const rows = Array.isArray(raw) ? raw : ((raw as { data?: unknown[] }).data ?? []);
	return (rows as Record<string, unknown>[]).map((r) => ({
		id: Number(r.IDX),
		name: String(r.NAME ?? ''),
		text: String(r.CONTENT ?? ''),
		date: formatDate(r.REG_DT),
	}));
}

export async function writeMsgs(name: string, content: string, password: string): Promise<void> {
	const hashed = await hashPassword(password);
	await fetch(API, {
		method: 'POST',
		mode: 'no-cors',
		headers: { 'Content-Type': 'text/plain' },
		body: JSON.stringify({ action: 'write', name, content, password: hashed }),
	});
}

export async function deleteMsgs(idx: number, password: string): Promise<void> {
	const hashed = await hashPassword(password);
	await fetch(API, {
		method: 'POST',
		mode: 'no-cors',
		headers: { 'Content-Type': 'text/plain' },
		body: JSON.stringify({ action: 'delete', idx, password: hashed }),
	});
}
