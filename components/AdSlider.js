import { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { AD_SLIDE_INTERVAL_MS } from '../constants/config';

/**
 * Werbebilder-Liste.
 * ---------------------------------------------------------------------------
 * Metro (der Expo/React-Native-Bundler) kann Bilder nicht dynamisch zur
 * Laufzeit aus einem Ordner einlesen - jedes Bild muss zur Build-Zeit per
 * require() bekannt sein. Um "beliebig viele Bilder" zu unterstützen, legst
 * du die Datei einfach in den Ordner `ads/` und trägst sie hier zusätzlich
 * ein:
 *
 *   1. Datei ablegen, z.B. ads/ad3.jpg
 *   2. Unten eine Zeile ergänzen: require('../ads/ad3.jpg')
 *
 * Das ist der einzige Schritt, der beim Hinzufügen eines neuen Werbebildes
 * nötig ist - die Slider-Logik selbst muss nicht verändert werden.
 */
const adImages = [
  require('../ads/images/OGC-lev-kebab.jpeg'),
  require('../ads/images/OGC-lev-kebab2.jpeg'),
  require('../ads/images/OGC-BLN-HADSCH_27.jpeg'),
  require('../ads/images/OGC-BLN-HAC_27.jpeg'),
  require('../ads/images/OGC-BLN-Sonbahar-Umresi_26.jpeg'),
  require('../ads/images/OGC-BLN-Aralik-Umresi_26.jpeg'),
  // require('../ads/images/OGC-BLN-Suffe-Islam_ilim_prog.jpeg'),
];

export default function AdSlider() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (adImages.length <= 1) return undefined;

    const id = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % adImages.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, AD_SLIDE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [opacity]);

  if (adImages.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Animated.Image
        source={adImages[index]}
        style={[styles.image, { opacity }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundAlt,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
});