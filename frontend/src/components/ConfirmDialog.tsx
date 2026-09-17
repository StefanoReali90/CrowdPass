import { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({ open, title, description, confirmLabel, busy = false, onCancel, onConfirm }: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={(event) => {
                event.preventDefault();
                if (!busy) onCancel();
            }}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) onCancel();
            }}
        >
            <div className="confirm-dialog-content">
                <span className="confirm-dialog-icon"><AlertTriangle size={22} /></span>
                <div>
                    <span className="eyebrow">Conferma operazione</span>
                    <h2 id={titleId}>{title}</h2>
                    <p id={descriptionId}>{description}</p>
                </div>
                <div className="confirm-dialog-actions">
                    <button className="button" onClick={onCancel} disabled={busy}>Annulla</button>
                    <button className="button danger" onClick={() => void onConfirm()} disabled={busy}>{busy ? 'Operazione in corso…' : confirmLabel}</button>
                </div>
            </div>
        </dialog>
    );
}
