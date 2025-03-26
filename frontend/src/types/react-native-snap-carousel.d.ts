declare module 'react-native-snap-carousel' {
  import React from 'react';
  import { ScrollViewProps } from 'react-native';

  export interface CarouselProps<T> {
    data: T[];
    renderItem: (item: { item: T; index: number }) => React.ReactNode;
    sliderWidth: number;
    itemWidth: number;
    inactiveSlideScale?: number;
    inactiveSlideOpacity?: number;
    activeSlideAlignment?: 'center' | 'end' | 'start';
    containerCustomStyle?: any;
    contentContainerCustomStyle?: any;
    onSnapToItem?: (index: number) => void;
    layout?: 'default' | 'stack' | 'tinder';
    firstItem?: number;
    scrollEnabled?: boolean;
    enableMomentum?: boolean;
    enableSnap?: boolean;
    loopClonesPerSide?: number;
    autoplay?: boolean;
    autoplayInterval?: number;
    autoplayDelay?: number;
    vertical?: boolean;
  }

  export default class Carousel<T> extends React.Component<CarouselProps<T>> {
    snapToItem: (index: number) => void;
    snapToNext: () => void;
    snapToPrev: () => void;
    stopAutoplay: () => void;
    startAutoplay: () => void;
  }
} 