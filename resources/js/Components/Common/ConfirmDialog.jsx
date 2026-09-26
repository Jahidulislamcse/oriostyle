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
            maxWidth="md"
            footer={
                <>
                    <Button variant="secondary" size="md" onClick={onClose} disabled={processing}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        size="md"
                        onClick={onConfirm}
                        processing={processing}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                    variant === 'danger'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed">{message}</p>
                </div>
            </div>
        </Modal>
    );
}
