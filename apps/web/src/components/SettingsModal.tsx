
'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Folder, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { selectMusicDirectory, getMusicDirectoryHandle } from '@/utils/localFileManager';

interface SettingsModalProps {
    onRescan?: () => Promise<void>;
}

export function SettingsModal({ onRescan }: SettingsModalProps) {
    const { t, language, setLanguage } = useLanguage();
    const [hasLocalDir, setHasLocalDir] = useState(false);
    const [dirName, setDirName] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);

    const checkDirStatus = async () => {
        const handle = await getMusicDirectoryHandle();
        if (handle) {
            setHasLocalDir(true);
            setDirName(handle.name);
            // Optionally verify permission silently to see if we still have access
            // const perm = await verifyPermission(handle);
        } else {
            setHasLocalDir(false);
        }
    };

    useEffect(() => {
        checkDirStatus();
    }, []);

    const handleSetFolder = async () => {
        const handle = await selectMusicDirectory();
        if (handle) {
            setHasLocalDir(true);
            setDirName(handle.name);
            if (onRescan) onRescan();
        }
    };

    const handleRescan = async () => {
        if (onRescan) {
            setIsScanning(true);
            await onRescan();
            setTimeout(() => setIsScanning(false), 500); // Small delay for visual feedback
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('common.settings') || 'Settings'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Language Settings */}
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{t('common.language') || 'Language'}</h4>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={language === 'en' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('en')}
                            >
                                English
                            </Button>
                            <Button
                                variant={language === 'zh' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setLanguage('zh')}
                            >
                                中文
                            </Button>
                        </div>
                    </div>

                    <div className="h-[1px] bg-border" />

                    {/* Download/Local Music Settings */}
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none">{t('common.downloadLocation') || 'Download Location'}</h4>
                        <p className="text-sm text-muted-foreground">
                            {t('common.downloadDesc') || 'Select a local folder to prioritize playing downloaded music.'}
                        </p>

                        <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <Folder className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {hasLocalDir ? dirName : (t('common.defaultFolder') || 'Default Browser Downloads')}
                                    </span>
                                    {hasLocalDir && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <Check className="h-3 w-3" /> {t('common.customFolderSet') || 'Custom folder active'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleSetFolder}>
                                {t('common.change') || 'Change'}
                            </Button>
                        </div>

                        {!hasLocalDir && (
                            <div className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 text-yellow-600 text-xs">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    {t('common.localFileNote') || 'To play offline music, please select the folder where you save your downloads.'}
                                </span>
                            </div>
                        )}

                        {hasLocalDir && onRescan && (
                            <div className="pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium leading-none">{t('common.rescan') || 'Rescan'}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {t('common.rescanDesc') || 'Check for changes in your local folder.'}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleRescan} disabled={isScanning}>
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                                        {isScanning ? (t('common.scanning') || 'Scanning...') : (t('common.rescan') || 'Rescan')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
