import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * A reusable input field component with label and error handling
 * 
 * @param {string} label - Label text for the input
 * @param {string} value - Current value of the input
 * @param {function} onChangeText - Function to call when text changes
 * @param {string} placeholder - Placeholder text when input is empty
 * @param {boolean} secureTextEntry - Whether to hide text entry (for passwords)
 * @param {string} error - Error message to display
 * @param {boolean} autoCapitalize - Auto capitalize behavior
 * @param {string} keyboardType - Keyboard type to display
 * @param {boolean} multiline - Whether input allows multiple lines
 * @param {object} style - Additional styles for the input container
 * @param {object} inputStyle - Additional styles for the input field
 */
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  multiline = false,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputHeight = multiline ? 100 : 50;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View 
        style={[
          styles.inputContainer, 
          { height: inputHeight },
          isFocused && styles.focusedInput,
          error && styles.errorInput
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { height: multiline ? 90 : 46 },
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={22} 
              color="#777777"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 0,
  },
  iconButton: {
    padding: 4,
  },
  focusedInput: {
    borderColor: '#684BFF',
    shadowColor: '#684BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  errorInput: {
    borderColor: '#FF4D4F',
  },
  errorText: {
    fontSize: 14,
    color: '#FF4D4F',
    marginTop: 4,
  },
});

export default InputField; 