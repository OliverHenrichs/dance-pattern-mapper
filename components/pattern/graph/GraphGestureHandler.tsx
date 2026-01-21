import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

interface GraphGestureOptions {
  initialX?: number;
  initialY?: number;
  initialScale?: number;
}

export const useGraphGestures = (options: GraphGestureOptions = {}) => {
  const { initialX = 0, initialY = 0, initialScale = 0.5 } = options;

  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const avgFocalDistanceX = useSharedValue(0);
  const avgFocalDistanceY = useSharedValue(0);
  const xCurrent = useSharedValue(initialX);
  const yCurrent = useSharedValue(initialY);
  const xPrevious = useSharedValue(0);
  const yPrevious = useSharedValue(0);
  const scaleCurrent = useSharedValue(initialScale);
  const scalePrevious = useSharedValue(1);
  const updateCount = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onBegin((event) => {
      updateCount.value = 0;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
      avgFocalDistanceX.value = 0;
      avgFocalDistanceY.value = 0;
      scalePrevious.value = scaleCurrent.value;
    })
    .onUpdate((event) => {
      if (event.numberOfPointers === 2) {
        updateCount.value++;
        // Skip first 2 updates to let focal point stabilize
        if (updateCount.value <= 2) {
          focalX.value = event.focalX;
          focalY.value = event.focalY;
          return;
        }

        const focalDistanceX = event.focalX - focalX.value;
        const focalDistanceY = event.focalY - focalY.value;

        // Calculate total distance from last focal point
        const distance = Math.sqrt(
          focalDistanceX * focalDistanceX + focalDistanceY * focalDistanceY,
        );
        // Reject if jump exceeds threshold (30-50px is typical)
        const maxJumpDistance = 50;
        if (distance > maxJumpDistance) {
          return;
        }
        scaleCurrent.value = scalePrevious.value * event.scale;
        xCurrent.value += scaleCurrent.value * focalDistanceX;
        yCurrent.value += scaleCurrent.value * focalDistanceY;
      }
    })
    .onEnd(() => {
      scalePrevious.value = scaleCurrent.value;
    });

  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      xPrevious.value = xCurrent.value;
      yPrevious.value = yCurrent.value;
    })
    .onUpdate((event) => {
      xCurrent.value = xPrevious.value + event.translationX;
      yCurrent.value = yPrevious.value + event.translationY;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  return {
    composedGesture,
    gestureState: {
      xCurrent,
      yCurrent,
      scaleCurrent,
    },
  };
};
