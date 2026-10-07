import { createContext, useContext } from 'react';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

export const useBlurTarget = () => useContext(BlurTargetContext);
