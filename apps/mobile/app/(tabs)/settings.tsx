import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedSwitch } from '@/components/themed-switch';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Colors } from '@/constants/theme';
import { Moon, Sun, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
    const { theme, toggleTheme, isDark } = useTheme();
    const colors = Colors[theme];
    const { t, language, setLanguage } = useLanguage();

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <ThemedText type="title">{t('settings.settings')}</ThemedText>
                </View>

                <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>{t('settings.appearance')}</ThemedText>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            {isDark ? (
                                <Moon size={20} color={colors.text} />
                            ) : (
                                <Sun size={20} color={colors.text} />
                            )}
                            <ThemedText style={styles.label}>{t('settings.darkMode')}</ThemedText>
                        </View>
                        <ThemedSwitch
                            value={isDark}
                            onValueChange={toggleTheme}
                        />
                    </View>
                    <ThemedText style={styles.hint}>
                        {t('settings.darkModeHint')}
                    </ThemedText>
                </View>

                <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>{t('settings.language')}</ThemedText>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                    >
                        <ThemedText style={styles.label}>
                            {language === 'en' ? t('settings.english') : t('settings.chinese')}
                        </ThemedText>
                        <ChevronRight size={20} color={colors.secondaryText} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingTop: 8,
        paddingBottom: 20,
        paddingHorizontal: 20, // Add horizontal padding for title
        marginBottom: 12,
    },
    section: {
        marginBottom: 20,
        marginHorizontal: 20, // Proper inset from screen edges
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        fontSize: 16,
    },
    hint: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 8,
        lineHeight: 18,
    },
});
