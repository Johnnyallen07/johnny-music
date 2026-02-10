'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Folder } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { get, set } from 'idb-keyval';

const DONT_SHOW_AGAIN_KEY = 'download_success_modal_hidden';

interface DownloadSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    folderName: string;
}

export function DownloadSuccessModal({ isOpen, onClose, folderName }: DownloadSuccessModalProps) {
    const { t } = useLanguage();
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleClose = async () => {
        if (dontShowAgain) {
            await set(DONT_SHOW_AGAIN_KEY, true);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        {t('common.downloadSuccess') || 'Download Successful'}
                    </DialogTitle>
                    <DialogDescription>
                        {t('common.fileSavedTo') || 'File saved to:'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center p-4 bg-secondary/50 rounded-lg gap-3 my-2">
                    <Folder className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate" title={folderName}>
                        {folderName}
                    </span>
                </div>

                <div className="flex items-center space-x-2 py-4">
                    <input
                        type="checkbox"
                        id="dontShow"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                    />
                    <label
                        htmlFor="dontShow"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {t('common.dontShowAgain') || "Don't show this again"}
                    </label>
                </div>

                <DialogFooter>
                    <Button onClick={handleClose}>
                        {t('common.gotIt') || 'Got it'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export const shouldShowDownloadSuccessModal = async (): Promise<boolean> => {
    const hidden = await get<boolean>(DONT_SHOW_AGAIN_KEY);
    return !hidden;
};
