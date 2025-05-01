import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Typography from './Typography';
import { colors, spacing } from '../constants/theme';

/**
 * SectionTitle component for section headers with optional right action
 * 
 * @param {string} title - The title text for the section
 * @param {string} rightText - Optional text to display on the right side
 * @param {function} onRightPress - Function to call when right text is pressed
 * @param {object} style - Additional style for the container
 * @param {object} titleStyle - Additional style for the title text
 * @param {object} rightTextStyle - Additional style for the right text
 */
const SectionTitle = ({
  title,
  rightText,
  onRightPress,
  style,
  titleStyle,
  rightTextStyle
}) => {
  return (
    <View style={[styles.container, style]}>
      <Typography 
        variant="subheading" 
        weight="semiBold" 
        style={[styles.title, titleStyle]}
      >
        {title}
      </Typography>
      
      {rightText && onRightPress && (
        <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
          <Typography 
            variant="button"
            style={[styles.rightText, rightTextStyle]}
          >
            {rightText}
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
    marginTop: spacing.l,
    paddingHorizontal: spacing.m,
  },
  title: {
    flex: 1,
  },
  rightText: {
    marginLeft: spacing.s,
    color: colors.primary,
  }
});

export default SectionTitle; 