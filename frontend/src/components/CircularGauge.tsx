import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, fonts } from "../theme/theme";

interface Props {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

const CircularGauge = ({ value, size = 120, strokeWidth = 10, color = colors.accent, label }: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.value}>{Math.round(clamped)}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  value: { fontFamily: fonts.display, fontSize: 32, color: colors.primaryText },
  label: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1, color: colors.secondaryText, marginTop: -2 },
});

export default CircularGauge;