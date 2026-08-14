import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from './theme';

export function AppPressable({ style, children, ...rest }: PressableProps) {
  const theme = useAppTheme();
  return (
    <Pressable
      {...rest}
      android_ripple={{ color: theme.colors.ripple }}
      style={(state) => [
        Platform.OS === 'ios' && state.pressed && { opacity: 0.55 },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}

type AvatarProps = {
  initials: string;
  size?: number;
  colorIndex?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ initials, size = 48, colorIndex = 0, style }: AvatarProps) {
  const { colors } = useAppTheme();
  const palette = colors.avatarColors;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette[colorIndex % palette.length],
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontSize: Math.round(size * 0.38), fontWeight: '700' }}>
        {initials}
      </Text>
    </View>
  );
}
