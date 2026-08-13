import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, fonts, spacing } from "../theme/theme";

const ExpandableText = ({ text, numberOfLines = 3 }: { text: string; numberOfLines?: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  return (
    <View>
      <Text
        style={styles.text}
        numberOfLines={expanded ? undefined : numberOfLines}
        onTextLayout={(e) => {
          if (!expanded && e.nativeEvent.lines.length >= numberOfLines) {
            setIsTruncated(true);
          }
        }}
      >
        {text}
      </Text>
      {isTruncated && (
        <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8}>
          <Text style={styles.toggle}>{expanded ? "Show less" : "Read more"}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  text: { fontFamily: fonts.body, fontSize: 14, color: colors.primaryText, lineHeight: 20 },
  toggle: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.accent, marginTop: spacing.xs },
});

export default ExpandableText;