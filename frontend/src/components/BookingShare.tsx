import { useState } from 'react';
import { ArrowUpRight, Copy, Share2 } from 'lucide-react';

interface BookingShareProps {
    eventId: number | null;
}

export function BookingShare({ eventId }: BookingShareProps) {
    const bookingUrl = new URL('/prenota', window.location.origin);
    if (eventId !== null) bookingUrl.searchParams.set('eventId', String(eventId));
    const url = bookingUrl.href;
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setMessage('Link copiato. Puoi incollarlo nei post, nelle storie o nei messaggi.');
        } catch {
            setMessage('Copia automatica non disponibile. Seleziona e copia il link qui sopra.');
        }
    };

    const share = async () => {
        if (!navigator.share) {
            await copy();
            return;
        }

        setBusy(true);
        try {
            await navigator.share({
                title: 'Prenota il tuo ingresso | PassHalo',
                text: 'Prenota il tuo ingresso e ottieni il QR code.',
                url,
            });
            setMessage('Condivisione completata.');
        } catch (error) {
            if (!(error instanceof Error && error.name === 'AbortError')) {
                setMessage('Condivisione non disponibile. Puoi copiare il link o usare i pulsanti social.');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <article className="panel operations booking-share" id="prenotazioni">
            <span className="eyebrow">Prenotazioni online</span>
            <h2>Il form da condividere con i tuoi clienti</h2>
            <p>Apri il form pubblico e condividi il link sui social. I clienti prenotano senza account e ricevono il loro QR code.</p>
            <label htmlFor="booking-link">Link pubblico del form</label>
            <input id="booking-link" value={url} readOnly onFocus={(event) => event.currentTarget.select()} />
            <div className="share-actions">
                <a className="button primary" href={url} target="_blank" rel="noopener noreferrer">Apri form<ArrowUpRight size={17} /></a>
                <button className="button" onClick={copy}><Copy size={16} />Copia link</button>
                <button className="button" onClick={share} disabled={busy}><Share2 size={16} />Condividi</button>
                <a className="button" href={`https://wa.me/?text=${encodeURIComponent(`Prenota il tuo ingresso: ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a className="button" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
            {message && <p className="share-feedback" role="status">{message}</p>}
        </article>
    );
}
