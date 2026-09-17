import { useEffect, useState } from 'react';

type VideoSource =
    | { kind: 'file'; url: string }
    | { kind: 'embed'; url: string };

interface EventHeroMediaProps {
    eventName: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
}

function matchesHost(hostname: string, domain: string) {
    return hostname === domain || hostname.endsWith(`.${domain}`);
}

function youtubeId(url: URL) {
    if (url.hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] ?? null;
    if (matchesHost(url.hostname, 'youtube.com')) {
        if (url.pathname === '/watch') return url.searchParams.get('v');
        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0])) return parts[1] ?? null;
    }
    return null;
}

function resolveVideoSource(value?: string | null): VideoSource | null {
    if (!value?.trim()) return null;

    try {
        const url = new URL(value.trim());
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        const id = youtubeId(url);
        if (id) {
            const params = new URLSearchParams({
                autoplay: '1',
                mute: '1',
                controls: '0',
                loop: '1',
                playlist: id,
                playsinline: '1',
                rel: '0',
            });
            return { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}` };
        }

        if (matchesHost(url.hostname, 'vimeo.com')) {
            const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
            if (id) return { kind: 'embed', url: `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1` };
        }

        return { kind: 'file', url: url.toString() };
    } catch {
        return null;
    }
}

export function EventHeroMedia({ eventName, imageUrl, videoUrl }: EventHeroMediaProps) {
    const [videoFailed, setVideoFailed] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const source = resolveVideoSource(videoUrl);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updatePreference = () => setReduceMotion(query.matches);
        query.addEventListener('change', updatePreference);
        return () => query.removeEventListener('change', updatePreference);
    }, []);

    return (
        <div className="public-hero-media" aria-hidden="true">
            {imageUrl && <img className="public-hero-poster" src={imageUrl} alt="" />}
            {!reduceMotion && !videoFailed && source?.kind === 'file' && (
                <video
                    className="public-hero-video"
                    src={source.url}
                    poster={imageUrl || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={() => setVideoFailed(true)}
                />
            )}
            {!reduceMotion && source?.kind === 'embed' && (
                <iframe
                    className="public-hero-frame"
                    src={source.url}
                    title={`Video di sfondo per ${eventName}`}
                    tabIndex={-1}
                    allow="autoplay; encrypted-media"
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            )}
        </div>
    );
}
