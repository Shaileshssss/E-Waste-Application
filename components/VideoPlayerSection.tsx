// import React, {
//   forwardRef,
//   useImperativeHandle,
//   useRef,
//   useEffect,
//   useState,
// } from 'react';
// import {
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   UIManager,
//   View,
//   findNodeHandle,
//   TouchableOpacity,
//   Platform,
// } from 'react-native';
// import { useEvent } from 'expo';
// import { useVideoPlayer, VideoView } from 'expo-video';
// import { Ionicons } from '@expo/vector-icons';
// import { COLORS } from '@/constants/theme';
// import { useFocusEffect } from 'expo-router';

// const videoSource =
//   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// export type VideoPlayerRef = {
//   pauseVideo: () => void;
//   playVideo: () => void;
// };

// const VideoPlayerSection = forwardRef<VideoPlayerRef>((_props, ref) => {
//   const player = useVideoPlayer(videoSource, (player) => {
//     player.loop = true;
//     player.muted = true;
//   });

//   const { isPlaying } = useEvent(player, 'playingChange', {
//     isPlaying: player.playing,
//   });

//   const videoRef = useRef(null);
//   const [isVisible, setIsVisible] = useState(true);
//   const [isManuallyPaused, setIsManuallyPaused] = useState(false);
//   const [isMuted, setIsMuted] = useState(true);

//   const checkVisibility = () => {
//     if (videoRef.current) {
//       const handle = findNodeHandle(videoRef.current);
//       if (handle) {
//         UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
//           const windowHeight = Dimensions.get('window').height;
//           const visibilityBuffer = -80;
//           const isNowVisible =
//             pageY < windowHeight + visibilityBuffer &&
//             pageY + height > 0 - visibilityBuffer;
//           setIsVisible(isNowVisible);
//         });
//       }
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(checkVisibility, 400);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     if (!isManuallyPaused) {
//       if (isVisible) {
//         player.play();
//         player.muted = isMuted;
//       } else {
//         player.pause();
//         player.muted = true;
//       }
//     }
//   }, [isVisible, isManuallyPaused, isMuted, player]);

//   useFocusEffect(
//     React.useCallback(() => {
//       return () => {
//         if (player && typeof player.pause === 'function') {
//           try {
//             player.pause();
//             player.muted = true;
//             setIsManuallyPaused(true);
//           } catch (error) {
//             console.warn('⚠️ Failed to pause video on tab switch:', error?.message);
//           }
//         }
//       };
//     }, [player])
//   );

//   useImperativeHandle(ref, () => ({
//     pauseVideo: () => {
//       if (player) {
//         player.pause();
//         player.muted = true;
//         setIsManuallyPaused(true);
//       }
//     },
//     playVideo: () => {
//       if (player) {
//         player.play();
//         player.muted = isMuted;
//         setIsManuallyPaused(false);
//       }
//     },
//   }));

//   const toggleMute = () => {
//     if (player) {
//       const newMuted = !isMuted;
//       setIsMuted(newMuted);
//       player.muted = newMuted;
//     }
//   };

//   return (
//     <ScrollView
//       style={[styles.scrollView, styles.shadow]}
//       onScroll={checkVisibility}
//       scrollEventThrottle={16}
//     >
//       <Text style={styles.heading}>
//         Explore the Smart Way to Recycle Your Old Electronics
//       </Text>

//       <View style={styles.videoContentWrapper}>
//         {player ? (
//           <VideoView
//             ref={videoRef}
//             style={styles.video}
//             player={player}
//             allowsFullscreen
//             allowsPictureInPicture
//             nativeControls={false}
//           />
//         ) : (
//           <Text style={styles.loadingText}>Loading video...</Text>
//         )}

//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             onPress={() => {
//               if (player) {
//                 if (isPlaying) {
//                   player.pause();
//                   setIsManuallyPaused(true);
//                 } else {
//                   player.play();
//                   setIsManuallyPaused(false);
//                 }
//               }
//             }}
//           >
//             <Ionicons
//               name={isPlaying ? 'pause-circle' : 'play-circle'}
//               size={50}
//               color={COLORS.primary}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={toggleMute}>
//             <Ionicons
//               name={isMuted ? 'volume-mute' : 'volume-high'}
//               size={50}
//               color={COLORS.primary}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// });

// export default VideoPlayerSection;

// const styles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     paddingHorizontal: 15,
//     borderRadius: 15,
//     overflow: 'hidden',
//     margin: 10,
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 20,
//     color: COLORS.text,
//     paddingHorizontal: 10,
//   },
//   videoContentWrapper: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   shadow: {
//     ...Platform.select({
//       ios: {
//         shadowColor: COLORS.black,
//         shadowOffset: { width: 0, height: 6 },
//         shadowOpacity: 0.1,
//         shadowRadius: 5,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   video: {
//     width: '104%',
//     aspectRatio: 16 / 9,
//     backgroundColor: COLORS.black,
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   controlsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     width: '80%',
//     paddingVertical: 5,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: COLORS.darkGray,
//     paddingVertical: 50,
//     textAlign: 'center',
//   },
// });













import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  findNodeHandle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export type VideoPlayerRef = {
  pauseVideo: () => void;
  playVideo: () => void;
};

const VideoPlayerSection = forwardRef<VideoPlayerRef>((_props, ref) => {
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const checkVisibility = () => {
    if (videoRef.current) {
      const handle = findNodeHandle(videoRef.current);
      if (handle) {
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          const windowHeight = Dimensions.get('window').height;
          const visibilityBuffer = -80;
          const isNowVisible =
            pageY < windowHeight + visibilityBuffer &&
            pageY + height > 0 - visibilityBuffer;
          setIsVisible(isNowVisible);
        });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(checkVisibility, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isManuallyPaused) {
      if (isVisible) {
        try {
          player.play();
          player.muted = isMuted;
        } catch (_) {}
      } else {
        try {
          player.pause();
          player.muted = true;
        } catch (_) {}
      }
    }
  }, [isVisible, isManuallyPaused, isMuted, player]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        try {
          if (player && typeof player.pause === 'function') {
            player.pause();
            player.muted = true;
            setIsManuallyPaused(true);
          }
        } catch (error: any) {
          const msg = error?.message || '';
          if (
            msg.includes('already released') ||
            msg.includes('cannot be cast')
          ) {
            console.log('VideoPlayer already released. No pause needed.');
          } else {
            console.warn('Unexpected error pausing video:', msg);
          }
        }
      };
    }, [player])
  );

  useImperativeHandle(ref, () => ({
    pauseVideo: () => {
      try {
        if (player) {
          player.pause();
          player.muted = true;
          setIsManuallyPaused(true);
        }
      } catch (_) {}
    },
    playVideo: () => {
      try {
        if (player) {
          player.play();
          player.muted = isMuted;
          setIsManuallyPaused(false);
        }
      } catch (_) {}
    },
  }));

  const toggleMute = () => {
    if (player) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      try {
        player.muted = newMuted;
      } catch (_) {}
    }
  };

  return (
    <ScrollView
      style={[styles.scrollView, styles.shadow]}
      onScroll={checkVisibility}
      scrollEventThrottle={16}
    >
      <Text style={styles.heading}>
        Explore the Smart Way to Recycle Your Old Electronics
      </Text>

      <View style={styles.videoContentWrapper}>
        {player ? (
          <VideoView
            ref={videoRef}
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls={false}
          />
        ) : (
          <Text style={styles.loadingText}>Loading video...</Text>
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={() => {
              if (player) {
                if (isPlaying) {
                  player.pause();
                  setIsManuallyPaused(true);
                } else {
                  player.play();
                  setIsManuallyPaused(false);
                }
              }
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={50}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMute}>
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={50}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
});

export default VideoPlayerSection;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    margin: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: COLORS.text,
    paddingHorizontal: 10,
  },
  videoContentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  video: {
    width: '104%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.black,
    borderRadius: 5,
    marginBottom: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '80%',
    paddingVertical: 5,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    paddingVertical: 50,
    textAlign: 'center',
  },
});

