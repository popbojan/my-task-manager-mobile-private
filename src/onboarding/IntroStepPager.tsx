import { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const SWIPE_EDGE_VELOCITY = 0.15;
const SWIPE_EDGE_DRAG = 40;

type IntroStepPagerProps = {
  stepIndex: number;
  stepCount: number;
  scrollEnabled?: boolean;
  onStepIndexChange: (index: number) => void;
  canNavigateToStep: (index: number) => boolean;
  onSwipeBeforeFirst?: () => void;
  onSwipeAfterLast?: () => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  renderStep: (index: number) => React.ReactNode;
  pagerStyle?: StyleProp<ViewStyle>;
  pageScrollContentStyle?: StyleProp<ViewStyle>;
};

export default function IntroStepPager({
  stepIndex,
  stepCount,
  scrollEnabled = true,
  onStepIndexChange,
  canNavigateToStep,
  onSwipeBeforeFirst,
  onSwipeAfterLast,
  refreshControl,
  renderStep,
  pagerStyle,
  pageScrollContentStyle,
}: IntroStepPagerProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<number>>(null);
  const stepIndexRef = useRef(stepIndex);
  const dragStartOffsetRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const skipNextStepSyncRef = useRef(false);
  const prevWidthRef = useRef(width);
  const onSwipeBeforeFirstRef = useRef(onSwipeBeforeFirst);
  const onSwipeAfterLastRef = useRef(onSwipeAfterLast);

  onSwipeBeforeFirstRef.current = onSwipeBeforeFirst;
  onSwipeAfterLastRef.current = onSwipeAfterLast;
  const steps = useMemo(
    () => Array.from({ length: stepCount }, (_, index) => index),
    [stepCount],
  );

  stepIndexRef.current = stepIndex;

  function scrollToStep(index: number, animated: boolean) {
    isProgrammaticScrollRef.current = true;
    listRef.current?.scrollToOffset({
      offset: index * width,
      animated,
    });

    if (!animated) {
      isProgrammaticScrollRef.current = false;
    }
  }

  useEffect(() => {
    const widthChanged = prevWidthRef.current !== width;
    prevWidthRef.current = width;

    if (skipNextStepSyncRef.current && !widthChanged) {
      skipNextStepSyncRef.current = false;
      return;
    }

    skipNextStepSyncRef.current = false;
    scrollToStep(stepIndex, !widthChanged);
  }, [stepIndex, width]);

  function settleStep(rawIndex: number) {
    const index = Math.max(0, Math.min(stepCount - 1, rawIndex));

    if (!canNavigateToStep(index)) {
      scrollToStep(stepIndexRef.current, true);
      return;
    }

    if (index !== stepIndexRef.current) {
      skipNextStepSyncRef.current = true;
      onStepIndexChange(index);
    }
  }

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (isProgrammaticScrollRef.current) {
      isProgrammaticScrollRef.current = false;
      return;
    }

    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    settleStep(index);
  }

  function handleScrollBeginDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
    isProgrammaticScrollRef.current = false;
    dragStartOffsetRef.current = event.nativeEvent.contentOffset.x;
  }

  function handleScrollEndDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, velocity } = event.nativeEvent;
    const maxOffset = width * Math.max(0, stepCount - 1);
    const dragDelta = contentOffset.x - dragStartOffsetRef.current;
    const swipeRight =
      (velocity && velocity.x > SWIPE_EDGE_VELOCITY) || dragDelta > SWIPE_EDGE_DRAG;
    const swipeLeft =
      (velocity && velocity.x < -SWIPE_EDGE_VELOCITY) || dragDelta < -SWIPE_EDGE_DRAG;

    if (stepIndexRef.current === 0 && contentOffset.x <= 0 && swipeRight) {
      onSwipeBeforeFirstRef.current?.();
      return;
    }

    if (stepIndexRef.current === stepCount - 1 && contentOffset.x >= maxOffset - 1 && swipeLeft) {
      onSwipeAfterLastRef.current?.();
      return;
    }

    const velocityX = velocity?.x ?? 0;
    if (Math.abs(velocityX) < 0.05 && !isProgrammaticScrollRef.current) {
      const index = Math.round(contentOffset.x / width);
      settleStep(index);
    }
  }

  const edgePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gestureState) => {
        const { dx, dy } = gestureState;
        if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < 12) {
          return false;
        }

        const atFirst = stepIndexRef.current === 0;
        const atLast = stepIndexRef.current === stepCount - 1;

        if (atFirst && dx > 0 && onSwipeBeforeFirstRef.current) {
          return true;
        }

        if (atLast && dx < 0 && onSwipeAfterLastRef.current) {
          return true;
        }

        return false;
      },
      onPanResponderRelease: (_event, gestureState) => {
        const { dx, vx } = gestureState;
        const swipeRight = dx >= SWIPE_EDGE_DRAG || vx > SWIPE_EDGE_VELOCITY;
        const swipeLeft = dx <= -SWIPE_EDGE_DRAG || vx < -SWIPE_EDGE_VELOCITY;

        if (stepIndexRef.current === 0 && swipeRight) {
          onSwipeBeforeFirstRef.current?.();
          return;
        }

        if (stepIndexRef.current === stepCount - 1 && swipeLeft) {
          onSwipeAfterLastRef.current?.();
        }
      },
    }),
  ).current;

  return (
    <View style={[styles.pagerWrap, pagerStyle]} {...edgePanResponder.panHandlers}>
    <FlatList
      ref={listRef}
      style={styles.pager}
      data={steps}
      horizontal
      pagingEnabled
      bounces
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyExtractor={item => String(item)}
      getItemLayout={(_item, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
      onScrollBeginDrag={handleScrollBeginDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      onScrollEndDrag={handleScrollEndDrag}
      onScrollToIndexFailed={info => {
        requestAnimationFrame(() => {
          scrollToStep(info.index, false);
        });
      }}
      renderItem={({ item }) => (
        <View style={{ width }}>
          <ScrollView
            style={styles.pageScroll}
            contentContainerStyle={[styles.pageScrollContent, pageScrollContentStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            nestedScrollEnabled
            directionalLockEnabled={Platform.OS === 'ios'}
            refreshControl={refreshControl}
          >
            {renderStep(item)}
          </ScrollView>
        </View>
      )}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  pagerWrap: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    flexGrow: 1,
  },
});
