import { Platform, StyleSheet } from 'react-native'
import { Color } from './theme'

export const MIN_HEIGHT = 1200
export const HOUR_GUIDE_WIDTH = 50
export const OVERLAP_OFFSET = Platform.OS === 'web' ? 20 : 8
export const OVERLAP_PADDING = Platform.OS === 'web' ? 3 : 0

export const commonStyles = StyleSheet.create({
  dateCell: {
    borderWidth: 0.6,
    borderColor: '#E2E2E2',
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  guideText: {
    color: '#888',
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Ubuntu-Regular'
  },
  hourGuide: {
    backgroundColor: 'transparent',
    zIndex: 1000,
    width: HOUR_GUIDE_WIDTH,
  },
  eventCell: {
    position: 'absolute' as const,
    backgroundColor: Color.white,
    zIndex: 100,
    start: 3,
    end: 3,
    borderRadius: 7,
    borderColor: '#DBDBDB',
    borderWidth: 1,
    padding: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
    minWidth: '33%',
  },
  eventTitle: {
    color: '#909090',
    fontSize: 12,
    fontFamily: 'Ubuntu-Medium'
  },
})
