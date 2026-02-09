
import { StyleSheet, TouchableOpacity, View, Dimensions, Platform, ScrollView, PanResponder, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlayer } from '@/context/MobilePlayerContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getCategoryIcon } from '@/utils/iconMapping';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  ChevronDown, Volume2, VolumeX, Download
} from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/context/LanguageContext';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const router = useRouter();
  const activeIconColor = '#007AFF';
  const { t, language } = useLanguage();

  const {
    activeSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    currentTime,
    duration,
    seek,
    volume,
    isMuted,
    setVolume,
    toggleMute
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const thumbPosition = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(0)).current;
  const progressBarRef = useRef<View>(null);
  const volumeBarRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);
  const volumeThumbScale = useRef(new Animated.Value(0)).current;
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Update thumb position when currentTime changes (but not when seeking)
  useEffect(() => {
    if (!isSeeking && duration > 0) {
      const progress = currentTime / duration;
      // Use setValue instead of animation to avoid conflicts
      thumbPosition.setValue(progress);
    }
  }, [currentTime, duration, isSeeking]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setIsSeeking(true);
        setScrollEnabled(false); // Disable page scrolling while dragging
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(thumbScale, {
          toValue: 1,
          useNativeDriver: false,
          tension: 100,
          friction: 7,
        }).start();
      },
      onPanResponderMove: (e, gestureState) => {
        progressBarRef.current?.measure((x, y, width, height, pageX, pageY) => {
          const touchX = e.nativeEvent.pageX - pageX;
          const ratio = Math.max(0, Math.min(1, touchX / width));
          setSeekPosition(ratio * duration);
          thumbPosition.setValue(ratio);
        });
      },
      onPanResponderRelease: (e, gestureState) => {
        progressBarRef.current?.measure((x, y, width, height, pageX, pageY) => {
          const touchX = e.nativeEvent.pageX - pageX;
          const ratio = Math.max(0, Math.min(1, touchX / width));
          const newTime = ratio * duration;

          // Seek to the new position
          seek(newTime);

          // Keep isSeeking true briefly to prevent snap-back
          setTimeout(() => {
            setIsSeeking(false);
          }, 100);

          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          Animated.spring(thumbScale, {
            toValue: 0,
            useNativeDriver: false,
            tension: 100,
            friction: 7,
          }).start();
          setScrollEnabled(true); // Re-enable page scrolling after dragging
        });
      },
    })
  ).current;

  const volumePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsAdjustingVolume(true);
        setScrollEnabled(false); // Disable page scrolling while dragging
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(volumeThumbScale, {
          toValue: 1,
          useNativeDriver: false,
          tension: 100,
          friction: 7,
        }).start();
      },
      onPanResponderMove: (e, gestureState) => {
        volumeBarRef.current?.measure((x, y, width, height, pageX, pageY) => {
          const touchX = e.nativeEvent.pageX - pageX;
          const ratio = Math.max(0, Math.min(1, touchX / width));
          setVolume(ratio);
        });
      },
      onPanResponderRelease: () => {
        setIsAdjustingVolume(false);
        setScrollEnabled(true); // Re-enable page scrolling after dragging
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(volumeThumbScale, {
          toValue: 0,
          useNativeDriver: false,
          tension: 100,
          friction: 7,
        }).start();
      },
    })
  ).current;

  if (!activeSong) return (
    <ThemedView style={styles.container}>
      <ThemedText>{t('player.noSongPlaying')}</ThemedText>
    </ThemedView>
  );

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = duration > 0 ? (isSeeking ? seekPosition / duration : currentTime / duration) : 0;
  const displayTime = isSeeking ? seekPosition : currentTime;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const iconColor = theme.text;
  const CategoryIcon = getCategoryIcon(activeSong.category || '');

  const title = language === 'zh' ? (activeSong.title_zh || activeSong.title) : activeSong.title;
  const artist = language === 'zh' ? (activeSong.artist_zh || activeSong.artist) : activeSong.artist;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.dismissButton}>
          <ChevronDown size={32} stroke={iconColor} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>{t('player.nowPlaying')}</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ width: width * 2 }}
      >
        {/* Page 1: Player Controls */}
        <View style={styles.page}>
          <View style={styles.content}>
            {/* Artwork */}
            <View style={styles.artworkContainer}>
              <View style={[styles.iconBackground, { backgroundColor: theme.card }]}>
                <CategoryIcon size={width * 0.4} stroke={theme.tint} strokeWidth={1.5} />
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <ThemedText type="title" style={styles.title} numberOfLines={1}>{title}</ThemedText>
              <ThemedText style={styles.artist}>{artist}</ThemedText>

              {/* Play Count & Download */}
              <View style={styles.metaRow}>
                <View style={styles.tag}>
                  <ThemedText style={styles.tagText}>{activeSong.count || 0} {t('common.plays')}</ThemedText>
                </View>
                <TouchableOpacity style={styles.iconButton}>
                  <Download size={20} stroke={iconColor} opacity={0.7} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Bar with Draggable Thumb */}
            <View style={styles.progressContainer}>
              <View {...panResponder.panHandlers} style={styles.progressTouchArea}>
                <View ref={progressBarRef} style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: thumbPosition.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      }
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.progressThumb,
                      {
                        left: thumbPosition.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        transform: [
                          {
                            scale: thumbScale.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            })
                          }
                        ],
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.timeRow}>
                <ThemedText style={styles.timeText}>{formatTime(displayTime)}</ThemedText>
                <ThemedText style={styles.timeText}>{formatTime(duration)}</ThemedText>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={toggleShuffle}>
                <Shuffle size={24} stroke={isShuffle ? activeIconColor : iconColor} opacity={isShuffle ? 1 : 0.5} />
              </TouchableOpacity>

              <TouchableOpacity onPress={playPrev}>
                <SkipBack size={32} stroke={iconColor} />
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
                {isPlaying ?
                  <Pause size={40} stroke="#fff" fill="#fff" /> :
                  <Play size={40} stroke="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={playNext}>
                <SkipForward size={32} stroke={iconColor} />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleRepeat}>
                <Repeat size={24} stroke={isRepeat ? activeIconColor : iconColor} opacity={isRepeat ? 1 : 0.5} />
              </TouchableOpacity>
            </View>

            {/* Volume */}
            <View style={styles.volumeContainer}>
              <TouchableOpacity onPress={toggleMute}>
                {(isMuted || volume === 0) ?
                  <VolumeX size={20} stroke={iconColor} /> :
                  <Volume2 size={20} stroke={iconColor} />
                }
              </TouchableOpacity>
              <View {...volumePanResponder.panHandlers} style={styles.volumeTouchArea}>
                <View ref={volumeBarRef} style={styles.volumeBar}>
                  <View style={[styles.volumeFill, { width: `${(isMuted ? 0 : volume) * 100}%` }]} />
                  <Animated.View
                    style={[
                      styles.volumeThumb,
                      {
                        left: `${(isMuted ? 0 : volume) * 100}%`,
                        transform: [
                          {
                            scale: volumeThumbScale.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 1],
                            })
                          }
                        ],
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Page 2: Details */}
        <View style={styles.page}>
          <View style={styles.detailsContent}>
            <ThemedText type="title" style={styles.detailsTitle}>{t('player.songDetails')}</ThemedText>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>{t('common.title')}</ThemedText>
              <ThemedText style={styles.detailValue}>{title}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>{t('common.artist')}</ThemedText>
              <ThemedText style={styles.detailValue}>{artist}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>{t('library.category')}</ThemedText>
              <ThemedText style={styles.detailValue}>{activeSong.category || 'Unknown'}</ThemedText>
            </View>

            {activeSong.date && (
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>{t('player.dateAdded')}</ThemedText>
                <ThemedText style={styles.detailValue}>{new Date(activeSong.date).toLocaleDateString()}</ThemedText>
              </View>
            )}

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>{t('player.fileType')}</ThemedText>
              <ThemedText style={styles.detailValue}>{activeSong.path.split('.').pop()?.toUpperCase() || 'MP3'}</ThemedText>
            </View>

            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>{t('common.playCount')}</ThemedText>
              <ThemedText style={styles.detailValue}>{activeSong.count || 0}</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        <View style={[styles.dot, { opacity: 0.8 }]} />
        <View style={[styles.dot, { opacity: 0.3 }]} />
        {/* Note: ideally synchronize opacity with scroll position, but static for now is OK for V1 */}
      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    height: 60,
  },
  dismissButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.7,
  },
  content: { // Kept for backward compatibility if needed, but pages use specific styles
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  page: {
    width: width,
    flex: 1,
    paddingTop: 20,
  },
  detailsContent: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center', // Center vertically
  },
  detailsTitle: {
    marginBottom: 40,
    fontSize: 20,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128, 0.3)',
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
  },
  artworkContainer: {
    width: width - 64,
    height: width - 64,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#333',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  iconBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  artist: {
    fontSize: 18,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(128,128,128,0.2)',
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    opacity: 0.8,
  },
  iconButton: {
    padding: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 32, // Add padding to match page layout
  },
  progressTouchArea: {
    paddingVertical: 12, // Increase touch target vertically
    marginVertical: -12, // Compensate for the padding
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderRadius: 2,
    width: '100%',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF', // Or theme color
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.5,
    fontVariant: ['tabular-nums'],
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 32, // Add padding to match page layout
  },
  playButton: {
    width: 80,
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    opacity: 0.8,
    paddingHorizontal: 32, // Add padding to match page layout
  },
  volumeTouchArea: {
    flex: 1,
    paddingVertical: 8,
    marginVertical: -8,
  },
  volumeBar: {
    height: 4,
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#888',
  },
  volumeThumb: {
    position: 'absolute',
    top: -6,
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#888',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }


});
