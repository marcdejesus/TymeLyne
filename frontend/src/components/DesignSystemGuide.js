import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import Typography from './Typography';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { colors, spacing, typography, shadows, borderRadius } from '../constants/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

/**
 * Component showing design system examples.
 * Use this as a reference when implementing the app's UI.
 */
const DesignSystemGuide = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Typography variant="heading" weight="bold">
          Tymelyne Design System
        </Typography>
        <Typography variant="body">
          This guide shows examples of UI components and styling rules to maintain consistency across the app.
        </Typography>
      </View>

      {/* Colors */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold">
          Colors
        </Typography>
        <Typography variant="body" style={styles.sectionDescription}>
          Use these colors consistently throughout the app.
        </Typography>

        <View style={styles.colorSection}>
          <Typography variant="subheading" weight="semiBold">Primary</Typography>
          <View style={styles.colorRow}>
            <ColorSwatch color={colors.primary} name="primary" hex="#6200EE" />
            <ColorSwatch color={colors.primaryDark} name="primaryDark" hex="#3700B3" />
            <ColorSwatch color={colors.primaryLight} name="primaryLight" hex="#BB86FC" />
          </View>
        </View>

        <View style={styles.colorSection}>
          <Typography variant="subheading" weight="semiBold">Secondary</Typography>
          <View style={styles.colorRow}>
            <ColorSwatch color={colors.secondary} name="secondary" hex="#03DAC5" />
            <ColorSwatch color={colors.secondaryDark} name="secondaryDark" hex="#018786" />
            <ColorSwatch color={colors.secondaryLight} name="secondaryLight" hex="#B2EBF2" />
          </View>
        </View>

        <View style={styles.colorSection}>
          <Typography variant="subheading" weight="semiBold">Accent</Typography>
          <View style={styles.colorRow}>
            <ColorSwatch color={colors.accent} name="accent" hex="#FF0266" />
          </View>
        </View>

        <View style={styles.colorSection}>
          <Typography variant="subheading" weight="semiBold">Text</Typography>
          <View style={styles.colorRow}>
            <ColorSwatch color={colors.text.primary} name="text.primary" hex="#121212" />
            <ColorSwatch color={colors.text.secondary} name="text.secondary" hex="#555555" />
            <ColorSwatch color={colors.text.tertiary} name="text.tertiary" hex="#888888" />
          </View>
        </View>

        <View style={styles.colorSection}>
          <Typography variant="subheading" weight="semiBold">Status</Typography>
          <View style={styles.colorRow}>
            <ColorSwatch color={colors.status.success} name="status.success" hex="#4CAF50" />
            <ColorSwatch color={colors.status.error} name="status.error" hex="#B00020" />
            <ColorSwatch color={colors.status.warning} name="status.warning" hex="#FFC107" />
          </View>
        </View>
      </View>

      {/* Typography */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold">
          Typography
        </Typography>
        <Typography variant="body" style={styles.sectionDescription}>
          Always use the Typography component for text.
        </Typography>

        <Typography variant="largeHeading" weight="bold" style={styles.textExample}>
          Large Heading (28px)
        </Typography>
        <Typography variant="heading" weight="bold" style={styles.textExample}>
          Heading (24px)
        </Typography>
        <Typography variant="title" weight="semiBold" style={styles.textExample}>
          Title (20px)
        </Typography>
        <Typography variant="subheading" weight="semiBold" style={styles.textExample}>
          Subheading (18px)
        </Typography>
        <Typography variant="body" style={styles.textExample}>
          Body (16px) - This is the standard text used for most content.
        </Typography>
        <Typography variant="button" weight="medium" style={styles.textExample}>
          Button (14px)
        </Typography>
        <Typography variant="caption" style={styles.textExample}>
          Caption (12px) - Used for labels and helper text.
        </Typography>

        <View style={styles.codeExample}>
          <Typography variant="caption" weight="medium">
            Usage:
          </Typography>
          <Typography variant="caption" style={styles.code}>
            {`<Typography 
  variant="body" 
  weight="medium" 
  color={colors.text.primary}
>
  Your text here
</Typography>`}
          </Typography>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold">
          Buttons
        </Typography>
        <Typography variant="body" style={styles.sectionDescription}>
          Use button variants consistently for user actions.
        </Typography>

        <View style={styles.componentRow}>
          <Button 
            label="Primary Button" 
            variant="primary" 
            onPress={() => {}}
          />
        </View>

        <View style={styles.componentRow}>
          <Button 
            label="Secondary Button" 
            variant="secondary" 
            onPress={() => {}}
          />
        </View>

        <View style={styles.componentRow}>
          <Button 
            label="Outline Button" 
            variant="outline" 
            onPress={() => {}}
          />
        </View>

        <View style={styles.componentRow}>
          <Button 
            label="Disabled Button" 
            variant="primary" 
            disabled
            onPress={() => {}}
          />
        </View>

        <View style={styles.componentRow}>
          <Button 
            label="Loading Button" 
            variant="primary" 
            loading
            onPress={() => {}}
          />
        </View>

        <View style={styles.componentRow}>
          <Button 
            label="With Icon" 
            variant="primary" 
            icon={<Icon name="star" size={16} color="white" />}
            onPress={() => {}}
          />
        </View>

        <View style={styles.codeExample}>
          <Typography variant="caption" weight="medium">
            Usage:
          </Typography>
          <Typography variant="caption" style={styles.code}>
            {`<Button
  label="Button Text"
  variant="primary" // 'primary', 'secondary', 'outline'
  size="medium" // 'small', 'medium', 'large'
  onPress={handlePress}
  loading={isLoading}
  disabled={isDisabled}
  fullWidth={false}
  icon={<Icon name="star" size={16} color="white" />}
/>`}
          </Typography>
        </View>
      </View>

      {/* Inputs */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold">
          Inputs
        </Typography>
        <Typography variant="body" style={styles.sectionDescription}>
          Form inputs with consistent styling.
        </Typography>

        <View style={styles.componentRow}>
          <Input
            label="Default Input"
            placeholder="Enter text here"
          />
        </View>

        <View style={styles.componentRow}>
          <Input
            label="With Icon"
            placeholder="Search..."
            leftIcon={<Icon name="search" size={20} color={colors.text.tertiary} />}
          />
        </View>

        <View style={styles.componentRow}>
          <Input
            label="Password Input"
            placeholder="Enter password"
            secureTextEntry
          />
        </View>

        <View style={styles.componentRow}>
          <Input
            label="Error State"
            placeholder="Email address"
            error="Invalid email format"
            value="test@"
          />
        </View>

        <View style={styles.componentRow}>
          <Input
            label="With Helper Text"
            placeholder="Username"
            helperText="Username must be 3-16 characters"
          />
        </View>

        <View style={styles.codeExample}>
          <Typography variant="caption" weight="medium">
            Usage:
          </Typography>
          <Typography variant="caption" style={styles.code}>
            {`<Input
  label="Input Label"
  placeholder="Placeholder text"
  value={value}
  onChangeText={setValue}
  error={errorMessage}
  helperText="Helper text"
  secureTextEntry={false}
  leftIcon={<Icon name="search" size={20} color={colors.text.tertiary} />}
  rightIcon={<Icon name="close" size={20} color={colors.text.tertiary} />}
  onRightIconPress={handleClear}
/>`}
          </Typography>
        </View>
      </View>

      {/* Cards */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold">
          Cards
        </Typography>
        <Typography variant="body" style={styles.sectionDescription}>
          Cards for content containers.
        </Typography>

        <View style={styles.componentRow}>
          <Card variant="elevated" style={styles.cardExample}>
            <Typography variant="subheading" weight="semiBold">
              Elevated Card
            </Typography>
            <Typography variant="body">
              This card has elevation with shadows.
            </Typography>
          </Card>
        </View>

        <View style={styles.componentRow}>
          <Card variant="outlined" style={styles.cardExample}>
            <Typography variant="subheading" weight="semiBold">
              Outlined Card
            </Typography>
            <Typography variant="body">
              This card has a border but no elevation.
            </Typography>
          </Card>
        </View>

        <View style={styles.componentRow}>
          <Card variant="flat" style={styles.cardExample}>
            <Typography variant="subheading" weight="semiBold">
              Flat Card
            </Typography>
            <Typography variant="body">
              This card has no elevation or border.
            </Typography>
          </Card>
        </View>

        <View style={styles.codeExample}>
          <Typography variant="caption" weight="medium">
            Usage:
          </Typography>
          <Typography variant="caption" style={styles.code}>
            {`<Card
  variant="elevated" // 'elevated', 'outlined', 'flat'
  onPress={handlePress} // Optional - makes card touchable
  noPadding={false} // Removes default padding
>
  {/* Card content */}
</Card>`}
          </Typography>
        </View>
      </View>

      {/* Implementation Guide */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold">
          Implementation Guide
        </Typography>
        
        <View style={styles.guideItem}>
          <Typography variant="subheading" weight="semiBold">1. Import Components</Typography>
          <Typography variant="body">
            Import UI components and theme from their respective files:
          </Typography>
          <View style={styles.codeExample}>
            <Typography variant="caption" style={styles.code}>
              {`import { colors, spacing, typography } from '../constants/theme';
import Typography from '../components/Typography';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';`}
            </Typography>
          </View>
        </View>

        <View style={styles.guideItem}>
          <Typography variant="subheading" weight="semiBold">2. Use Typography</Typography>
          <Typography variant="body">
            Replace all Text components with Typography:
          </Typography>
          <View style={styles.codeExample}>
            <Typography variant="caption" style={styles.code}>
              {`// Before
<Text style={styles.title}>Hello World</Text>

// After
<Typography variant="heading" weight="bold">
  Hello World
</Typography>`}
            </Typography>
          </View>
        </View>

        <View style={styles.guideItem}>
          <Typography variant="subheading" weight="semiBold">3. Use Theme Colors</Typography>
          <Typography variant="body">
            Replace hardcoded colors with theme colors:
          </Typography>
          <View style={styles.codeExample}>
            <Typography variant="caption" style={styles.code}>
              {`// Before
backgroundColor: '#FF7E17',
color: '#1A1A1A',

// After
backgroundColor: colors.primary,
color: colors.text.primary,`}
            </Typography>
          </View>
        </View>

        <View style={styles.guideItem}>
          <Typography variant="subheading" weight="semiBold">4. Use Spacing Constants</Typography>
          <Typography variant="body">
            Replace hardcoded spacing values:
          </Typography>
          <View style={styles.codeExample}>
            <Typography variant="caption" style={styles.code}>
              {`// Before
marginBottom: 20,
padding: 16,

// After
marginBottom: spacing.l,
padding: spacing.m,`}
            </Typography>
          </View>
        </View>

        <View style={styles.guideItem}>
          <Typography variant="subheading" weight="semiBold">5. Use Component Props</Typography>
          <Typography variant="body">
            Use component props for variations instead of custom styles:
          </Typography>
          <View style={styles.codeExample}>
            <Typography variant="caption" style={styles.code}>
              {`// Before
<TouchableOpacity style={[styles.button, { backgroundColor: '#FF0000' }]}>
  <Text style={styles.buttonText}>Delete</Text>
</TouchableOpacity>

// After
<Button 
  label="Delete" 
  variant="primary" 
  style={{ backgroundColor: colors.status.error }}
/>`}
            </Typography>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Color swatch component for color examples
const ColorSwatch = ({ color, name, hex }) => {
  return (
    <View style={styles.colorSwatch}>
      <View style={[styles.colorBox, { backgroundColor: color }]} />
      <Typography variant="caption" style={styles.colorName}>
        {name}
      </Typography>
      <Typography variant="caption" style={styles.colorHex}>
        {hex}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  section: {
    marginBottom: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    ...shadows.small,
  },
  sectionDescription: {
    marginTop: spacing.xs,
    marginBottom: spacing.m,
    color: colors.text.secondary,
  },
  colorSection: {
    marginTop: spacing.m,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  colorSwatch: {
    marginRight: spacing.m,
    marginBottom: spacing.m,
    alignItems: 'center',
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.s,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorName: {
    color: colors.text.secondary,
  },
  colorHex: {
    color: colors.text.tertiary,
  },
  textExample: {
    marginBottom: spacing.m,
  },
  componentRow: {
    marginBottom: spacing.m,
  },
  cardExample: {
    width: '100%',
  },
  codeExample: {
    backgroundColor: '#F5F5F5',
    padding: spacing.m,
    borderRadius: borderRadius.s,
    marginTop: spacing.s,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.text.primary,
  },
  guideItem: {
    marginBottom: spacing.l,
  },
});

export default DesignSystemGuide; 