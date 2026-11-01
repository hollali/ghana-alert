import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export function GhanaFlagRibbon({ height = 230 }: { height?: number }) {
  return (
    <View pointerEvents="none" style={[styles.flagWrap, { height }]}>
      <View style={styles.redBand} />
      <View style={styles.goldBand}>
        <MaterialCommunityIcons name="star" size={26} color="#111111" />
      </View>
      <View style={styles.greenBand} />
    </View>
  );
}

export function AccraSkyline() {
  return (
    <View pointerEvents="none" style={styles.skyline}>
      <View style={[styles.building, { height: 54, width: 34, marginRight: 6 }]} />
      <View style={[styles.building, { height: 78, width: 46, marginRight: 6 }]} />
      <View style={styles.arch}>
        <View style={styles.archInner} />
      </View>
      <View style={[styles.building, { height: 70, width: 40, marginLeft: 6 }]} />
      <View style={[styles.building, { height: 48, width: 30, marginLeft: 6 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flagWrap: {
    position: 'absolute',
    left: -60,
    right: -60,
    bottom: -50,
    transform: [{ rotate: '-7deg' }],
    borderTopLeftRadius: 260,
    borderTopRightRadius: 90,
    overflow: 'hidden',
  },
  redBand: {
    flex: 1,
    backgroundColor: '#CE1126',
  },
  goldBand: {
    flex: 1,
    backgroundColor: '#FCD116',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenBand: {
    flex: 1,
    backgroundColor: '#006B3F',
  },
  skyline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    opacity: 0.4,
    height: 120,
  },
  building: {
    backgroundColor: '#C9DCF2',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  arch: {
    width: 92,
    height: 104,
    borderTopLeftRadius: 46,
    borderTopRightRadius: 46,
    backgroundColor: '#C9DCF2',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    marginHorizontal: 6,
  },
  archInner: {
    width: 46,
    height: 62,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    backgroundColor: '#F6F8FC',
  },
});
