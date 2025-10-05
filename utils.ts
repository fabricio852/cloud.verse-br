
import { Domain, DomainStats } from './types';
import { DOMAIN_WEIGHTS, AWS_DOCS } from './constants';

export const cn = (...xs: (string | boolean | undefined | null)[]) => xs.filter(Boolean).join(" ");

export const fmtTime = (s: number): string => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (x: number) => String(x).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
};

export const weightedAccuracy = (correctMap: DomainStats, totalMap: DomainStats): number => {
    const keys: Domain[] = [Domain.SECURE, Domain.RESILIENT, Domain.PERFORMANCE, Domain.COST];
    let wsum = 0;
    let acc = 0;
    for (const k of keys) {
        const t = totalMap[k] ?? 0;
        const w = DOMAIN_WEIGHTS[k] || 0;
        if (t > 0) {
            wsum += w;
            const c = correctMap[k] ?? 0;
            acc += w * (c / t);
        }
    }
    return wsum ? acc / wsum : 0;
};

export const linkAWS = (html: string): string => {
    return html.replace(/\[\[(SERVICE|TOPIC):([^\]]+)\]\]/g, (_, __, key) => {
        const trimmedKey = key.trim();
        const url = AWS_DOCS[trimmedKey];
        if (!url) return trimmedKey;
        return `<a href="${url}" target="_blank" rel="noreferrer" class="underline decoration-dotted text-purple-800 dark:text-purple-400">${trimmedKey}</a>`;
    });
};

export const shuffle = <T,>(arr: T[]): T[] => {
    return arr
        .map(v => ([Math.random(), v] as [number, T]))
        .sort((a, b) => a[0] - b[0])
        .map(x => x[1]);
};
