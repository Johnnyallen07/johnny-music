
import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCategories } from '@johnny/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ListMusic, Users, Disc, ChevronRight } from 'lucide-react-native';
import { useLanguage } from '@/context/LanguageContext';

export default function LibraryScreen() {
    const router = useRouter();
    const { config, loading } = useCategories();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const { t, language } = useLanguage();

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>{t('common.loading')}</ThemedText>
            </ThemedView>
        );
    }

    const sections = [
        {
            title: t('common.active_library'),
            data: [
                { id: 'All Music', name: t('common.allMusic'), icon: ListMusic },
                ...(config?.categories
                    .filter(c => c.id !== 'All Music')
                    .map(c => ({
                        id: c.id,
                        name: language === 'zh' ? (c.zh || c.en) : c.en,
                        icon: ListMusic
                    })) || [])
            ]
        },
        {
            title: t('common.musicians'),
            data: config?.musicians.map(m => ({
                id: m.id,
                name: language === 'zh' ? (m.zh || m.en) : m.en,
                icon: Users
            })) || []
        },
        {
            title: t('common.series'),
            data: config?.series.map(s => ({
                id: s.id,
                name: language === 'zh' ? (s.zh || s.en) : s.en,
                icon: Disc
            })) || []
        }
    ];

    const renderItem = ({ item, isLast }: { item: any; isLast?: boolean }) => {
        const Icon = item.icon;
        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    {
                        backgroundColor: theme.itemBackground,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: theme.border,
                    }
                ]}
                onPress={() => router.push({
                    pathname: '/library/[id]',
                    params: { id: item.id, name: item.name }
                })}
            >
                <View style={styles.itemLeft}>
                    <Icon size={24} color={theme.text} />
                    <ThemedText style={styles.itemText}>{item.name}</ThemedText>
                </View>
                <ChevronRight size={20} color={theme.secondaryText} />
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <FlatList
                    data={sections}
                    keyExtractor={(item) => item.title}
                    renderItem={({ item }) => (
                        <View>
                            {item.data.length > 0 && (
                                <>
                                    <ThemedText type="subtitle" style={styles.sectionHeader}>{item.title}</ThemedText>
                                    <View style={styles.sectionContent}>
                                        {item.data.map((subItem: any, index: number) => (
                                            <View key={`${subItem.id}-${index}`}>
                                                {renderItem({ item: subItem, isLast: index === item.data.length - 1 })}
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                    contentContainerStyle={styles.content}
                />
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
    content: {
        padding: 16,
        paddingBottom: 100, // Space for MiniPlayer
    },
    sectionHeader: {
        marginTop: 20,
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        fontSize: 13,
        opacity: 0.6,
        letterSpacing: 1.2,
        fontWeight: '600',
    },
    sectionContent: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    itemText: {
        fontSize: 16,
    }
});
