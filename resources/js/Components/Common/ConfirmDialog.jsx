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
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                    variant === 'danger'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-800'
                }`}>
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{message}</p>
                </div>
            </div>
        </Modal>
    );
}
