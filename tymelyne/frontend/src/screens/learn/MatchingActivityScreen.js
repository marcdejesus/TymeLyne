import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

// Fallback accent color in case the theme isn't available
const DEFAULT_ACCENT_COLOR = '#FF9500';

// Get screen dimensions
const { width } = Dimensions.get('window');

/**
 * MatchingActivityScreen - Interactive matching pairs game
 */
const MatchingActivityScreen = ({ route }) => {
  const navigation = useNavigation();
  const { accent } = useTheme();
  const { activity, moduleId } = route.params;
  
  // State variables
  const [pairs, setPairs] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [animations] = useState({
    terms: activity.content.pairs.map(() => new Animated.Value(1)),
    definitions: activity.content.pairs.map(() => new Animated.Value(1))
  });
  
  // Initialize game
  useEffect(() => {
    // Set pairs
    setPairs(activity.content.pairs);
    
    // Shuffle definitions
    const shuffled = [...activity.content.pairs].map(p => p.definition);
    shuffleArray(shuffled);
    setShuffledDefinitions(shuffled);
  }, []);
  
  // Check if all pairs are matched
  useEffect(() => {
    if (matchedPairs.length === pairs.length && pairs.length > 0) {
      const accuracy = Math.round((pairs.length / attempts) * 100);
      setScore(accuracy > 100 ? 100 : accuracy);
      setCompleted(true);
    }
  }, [matchedPairs, pairs]);
  
  // Handle selecting a term
  const handleSelectTerm = (index) => {
    if (matchedPairs.includes(index)) return;
    
    // Highlight the selected term
    setSelectedTerm(index);
    
    // If definition is already selected, check for match
    if (selectedDefinition !== null) {
      setAttempts(attempts + 1);
      
      const definitionIndex = pairs.findIndex(p => p.definition === shuffledDefinitions[selectedDefinition]);
      
      if (definitionIndex === index) {
        // Match found
        handleMatch(index, selectedDefinition);
      } else {
        // No match, reset selections
        flashIncorrect(index, selectedDefinition);
      }
    }
  };
  
  // Handle selecting a definition
  const handleSelectDefinition = (index) => {
    if (matchedPairs.includes(pairs.findIndex(p => p.definition === shuffledDefinitions[index]))) return;
    
    // Highlight the selected definition
    setSelectedDefinition(index);
    
    // If term is already selected, check for match
    if (selectedTerm !== null) {
      setAttempts(attempts + 1);
      
      const definitionIndex = pairs.findIndex(p => p.definition === shuffledDefinitions[index]);
      
      if (definitionIndex === selectedTerm) {
        // Match found
        handleMatch(selectedTerm, index);
      } else {
        // No match, reset selections
        flashIncorrect(selectedTerm, index);
      }
    }
  };
  
  // Handle a match
  const handleMatch = (termIndex, definitionIndex) => {
    // Add to matched pairs
    setMatchedPairs([...matchedPairs, termIndex]);
    
    // Animate matched pair
    animateMatch(termIndex, definitionIndex);
    
    // Reset selections
    setSelectedTerm(null);
    setSelectedDefinition(null);
  };
  
  // Flash incorrect
  const flashIncorrect = (termIndex, definitionIndex) => {
    // Animate incorrect selections
    Animated.sequence([
      Animated.timing(animations.terms[termIndex], {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animations.terms[termIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animations.terms[termIndex], {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animations.terms[termIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    Animated.sequence([
      Animated.timing(animations.definitions[definitionIndex], {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animations.definitions[definitionIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animations.definitions[definitionIndex], {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animations.definitions[definitionIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      // Reset selections after animation
      setSelectedTerm(null);
      setSelectedDefinition(null);
    });
  };
  
  // Animate match
  const animateMatch = (termIndex, definitionIndex) => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(animations.terms[termIndex], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(animations.terms[termIndex], {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(animations.terms[termIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]),
      Animated.sequence([
        Animated.timing(animations.definitions[definitionIndex], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(animations.definitions[definitionIndex], {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(animations.definitions[definitionIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ])
    ]).start();
  };
  
  // Handle completing the activity
  const handleComplete = () => {
    // In a real app, you would save this to your backend/state management
    navigation.goBack();
  };
  
  // Shuffle array helper
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  
  // Render term card
  const renderTerm = (pair, index) => {
    const isMatched = matchedPairs.includes(index);
    const isSelected = selectedTerm === index;
    
    return (
      <Animated.View 
        key={`term-${index}`}
        style={{ 
          opacity: animations.terms[index],
          transform: [{ scale: animations.terms[index] }]
        }}
      >
        <TouchableOpacity 
          style={[
            styles.card,
            styles.termCard,
            isMatched && [styles.matchedCard, { borderColor: accent }],
            isSelected && [styles.selectedCard, { borderColor: accent }]
          ]}
          onPress={() => handleSelectTerm(index)}
          disabled={isMatched || completed}
        >
          <Text style={[
            styles.cardText, 
            isMatched && styles.matchedText,
            isSelected && { color: accent }
          ]}>
            {pair.term}
          </Text>
          
          {isMatched && (
            <Ionicons name="checkmark-circle" size={24} color={accent} style={styles.matchIcon} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Render definition card
  const renderDefinition = (definition, index) => {
    const originalIndex = pairs.findIndex(p => p.definition === definition);
    const isMatched = matchedPairs.includes(originalIndex);
    const isSelected = selectedDefinition === index;
    
    return (
      <Animated.View 
        key={`def-${index}`}
        style={{ 
          opacity: animations.definitions[index],
          transform: [{ scale: animations.definitions[index] }]
        }}
      >
        <TouchableOpacity 
          style={[
            styles.card,
            styles.definitionCard,
            isMatched && [styles.matchedCard, { borderColor: accent }],
            isSelected && [styles.selectedCard, { borderColor: accent }]
          ]}
          onPress={() => handleSelectDefinition(index)}
          disabled={isMatched || completed}
        >
          <Text style={[
            styles.cardText, 
            isMatched && styles.matchedText,
            isSelected && { color: accent }
          ]}>
            {definition}
          </Text>
          
          {isMatched && (
            <Ionicons name="checkmark-circle" size={24} color={accent} style={styles.matchIcon} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Render game content
  const renderGameContent = () => {
    return (
      <View style={styles.gameContainer}>
        <Text style={styles.instructions}>
          Match each term with its correct definition by tapping on a term, then tapping on its corresponding definition.
        </Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Matches: {matchedPairs.length}/{pairs.length}
          </Text>
          <Text style={styles.progressText}>
            Attempts: {attempts}
          </Text>
        </View>
        
        <View style={styles.matchingContainer}>
          <View style={styles.column}>
            <Text style={styles.columnHeader}>Terms</Text>
            {pairs.map(renderTerm)}
          </View>
          
          <View style={styles.column}>
            <Text style={styles.columnHeader}>Definitions</Text>
            {shuffledDefinitions.map(renderDefinition)}
          </View>
        </View>
      </View>
    );
  };
  
  // Render completed screen
  const renderCompletedScreen = () => {
    const isHighScore = score >= 80;
    
    return (
      <View style={styles.resultsContainer}>
        <View style={[styles.scoreCircle, { borderColor: accent }]}>
          <Text style={styles.scoreText}>{score}%</Text>
        </View>
        
        <Text style={styles.resultTitle}>
          {isHighScore ? 'Great job!' : 'Good effort!'}
        </Text>
        
        <Text style={styles.resultDescription}>
          You matched all {pairs.length} pairs in {attempts} attempts.
        </Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activity.title}</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.contentContainer} 
        contentContainerStyle={styles.content}
      >
        {completed ? renderCompletedScreen() : renderGameContent()}
      </ScrollView>
      
      {/* Bottom Button */}
      {completed && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.bottomButton, { backgroundColor: accent }]}
            onPress={handleComplete}
          >
            <Text style={styles.bottomButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2A2A2A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholderRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  gameContainer: {
    flex: 1,
  },
  instructions: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  matchingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: (width - 60) / 2,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#444',
    padding: 12,
    marginBottom: 10,
    minHeight: 80,
    justifyContent: 'center',
  },
  termCard: {
    borderRightWidth: 4,
  },
  definitionCard: {
    borderLeftWidth: 4,
  },
  selectedCard: {
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
  },
  matchedCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  cardText: {
    fontSize: 15,
    color: '#EEEEEE',
    textAlign: 'center',
  },
  matchedText: {
    color: '#4CAF50',
  },
  matchIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  resultDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MatchingActivityScreen; 