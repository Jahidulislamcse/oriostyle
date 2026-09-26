import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
    isOpen = false,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed? This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    processing = false,
    variant = 'danger',
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="sm"
            footer={
                <>
                    <Button variant="secondary" size="sm" onClick={onClose} disabled={processing}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        size="sm"
                        onClick={onConfirm}
                        processing={processing}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${variant === 'danger' ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'}`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
                </div>
            </div>
        </Modal>
    );
}
