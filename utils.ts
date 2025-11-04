
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
    // Pegar os domínios dinamicamente do totalMap (pode ser CLF-C02, SAA-C03, ou AIF-C01)
    const keys = Object.keys(totalMap);

    if (keys.length === 0) {
        return 0;
    }

    let wsum = 0;
    let acc = 0;

    for (const k of keys) {
        const t = totalMap[k] ?? 0;
        const w = DOMAIN_WEIGHTS[k as Domain] || 0;
        if (t > 0) {
            wsum += w;
            const c = correctMap[k] ?? 0;
            acc += w * (c / t);
        }
    }

    return wsum > 0 ? acc / wsum : 0;
};

export const linkAWS = (html?: string | null): string => {
    if (!html) {
        return '';
    }

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

const xmur3 = (str: string) => {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
};

const sfc32 = (a: number, b: number, c: number, d: number) => {
    return () => {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        const t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        const res = (t + d) | 0;
        c = (c + res) | 0;
        return (res >>> 0) / 4294967296;
    };
};

export const seededShuffle = <T,>(arr: T[], seed: string): T[] => {
    if (!seed) {
        return shuffle(arr);
    }
    const seedFn = xmur3(seed);
    const rand = sfc32(seedFn(), seedFn(), seedFn(), seedFn());
    const mapped = arr.map((value, index) => {
        return { value, sortKey: rand() + index * 1e-9 };
    });
    return mapped
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(entry => entry.value);
};

export const getISOWeekInfo = (date: Date): { year: number; week: number } => {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: temp.getUTCFullYear(), week };
};

export const getWeeklySeed = (params: {
    userId?: string | null;
    certificationId: string;
    date?: Date;
}): string => {
    const { userId, certificationId, date = new Date() } = params;
    const { year, week } = getISOWeekInfo(date);
    const weekId = String(week).padStart(2, '0');
    const uid = userId || 'guest';
    return `${certificationId}-${year}-W${weekId}-${uid}`;
};
