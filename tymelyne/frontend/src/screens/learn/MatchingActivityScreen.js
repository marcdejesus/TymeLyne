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
const MatchingActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get activity data from navigation params
  const { activityId, activityTitle } = route.params || {};
  
  // Get the theme accent color with fallback
  const { accent } = useTheme() || { accent: DEFAULT_ACCENT_COLOR };
  const accentColor = accent || DEFAULT_ACCENT_COLOR;
  
  // Game state
  const [pairs, setPairs] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  
  // Sample data for matching pairs (in a real app, this would come from an API)
  const sampleData = {
    title: activityTitle || "Match Python Terms",
    pairs: [
      { id: 1, term: "list", definition: "Ordered collection of items" },
      { id: 2, term: "tuple", definition: "Immutable sequence of items" },
      { id: 3, term: "dictionary", definition: "Key-value pairs collection" },
      { id: 4, term: "set", definition: "Unordered collection of unique items" },
      { id: 5, term: "int", definition: "Whole number without decimal point" },
      { id: 6, term: "str", definition: "Sequence of characters" },
    ]
  };
  
  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);
  
  // Initialize the game board
  const initializeGame = () => {
    // Create pairs by duplicating each item as term and definition
    const itemPairs = [];
    
    sampleData.pairs.forEach(pair => {
      itemPairs.push({
        id: `term_${pair.id}`,
        pairId: pair.id,
        content: pair.term,
        type: 'term',
        isMatched: false,
      });
      
      itemPairs.push({
        id: `def_${pair.id}`,
        pairId: pair.id,
        content: pair.definition,
        type: 'definition',
        isMatched: false,
      });
    });
    
    // Shuffle the pairs
    const shuffledPairs = shuffleArray(itemPairs);
    setPairs(shuffledPairs);
    setStartTime(new Date());
    setMatchedPairs([]);
    setSelectedItems([]);
    setAttempts(0);
    setGameCompleted(false);
    setEndTime(null);
  };
  
  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // Handle item selection
  const handleItemPress = (item) => {
    // If already matched or already selected, do nothing
    if (item.isMatched || selectedItems.some(i => i.id === item.id)) {
      return;
    }
    
    // If we already have 2 selected items, do nothing
    if (selectedItems.length === 2) {
      return;
    }
    
    // Add item to selected items
    const newSelectedItems = [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    
    // Check for match if we now have 2 selected items
    if (newSelectedItems.length === 2) {
      // Increment attempts
      setAttempts(attempts + 1);
      
      // Check if the items match (same pairId but different types)
      const [firstItem, secondItem] = newSelectedItems;
      
      if (firstItem.pairId === secondItem.pairId && firstItem.type !== secondItem.type) {
        // Items match!
        setTimeout(() => {
          // Update the pairs list to mark these items as matched
          const newPairs = pairs.map(p => {
            if (p.pairId === firstItem.pairId) {
              return { ...p, isMatched: true };
            }
            return p;
          });
          
          setPairs(newPairs);
          setMatchedPairs([...matchedPairs, firstItem.pairId]);
          setSelectedItems([]);
          
          // Check if game is completed
          if (matchedPairs.length + 1 === sampleData.pairs.length) {
            setGameCompleted(true);
            setEndTime(new Date());
          }
        }, 500);
      } else {
        // Items don't match, clear selection after a delay
        setTimeout(() => {
          setSelectedItems([]);
        }, 1000);
      }
    }
  };
  
  // Get item style based on state
  const getItemStyle = (item) => {
    if (item.isMatched) {
      return [styles.item, styles.matchedItem, item.type === 'term' ? { borderColor: accentColor } : {}];
    }
    
    if (selectedItems.some(i => i.id === item.id)) {
      return [styles.item, styles.selectedItem, item.type === 'term' ? { borderColor: accentColor } : {}];
    }
    
    return [styles.item, item.type === 'term' ? { borderColor: accentColor } : {}];
  };
  
  // Calculate game statistics
  const getGameStats = () => {
    const duration = Math.floor((endTime - startTime) / 1000); // in seconds
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeString = `${minutes}m ${seconds}s`;
    
    // Calculate score based on attempts and time
    const perfectAttempts = sampleData.pairs.length; // One attempt per pair
    const attemptFactor = perfectAttempts / attempts;
    const timeFactor = Math.max(0.5, Math.min(1, 300 / duration)); // Cap time factor between 0.5 and 1
    
    const score = Math.round(100 * attemptFactor * timeFactor);
    
    return {
      time: timeString,
      attempts,
      score: Math.min(100, score), // Cap score at 100
    };
  };
  
  // Render game board
  const renderGameBoard = () => {
    return (
      <View style={styles.gameContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={20} color="#ddd" />
            <Text style={styles.statText}>Pairs: {matchedPairs.length}/{sampleData.pairs.length}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="refresh-outline" size={20} color="#ddd" />
            <Text style={styles.statText}>Attempts: {attempts}</Text>
          </View>
        </View>
        
        <View style={styles.gameBoard}>
          {pairs.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={getItemStyle(item)}
              onPress={() => handleItemPress(item)}
              disabled={item.isMatched}
            >
              <Text style={[
                styles.itemText,
                item.isMatched ? styles.matchedItemText : {},
                selectedItems.some(i => i.id === item.id) ? styles.selectedItemText : {},
                item.type === 'term' ? styles.termText : {}
              ]}>
                {item.content}
              </Text>
              
              {item.isMatched && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={18} 
                  color="#4CAF50" 
                  style={styles.matchedIcon} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#555' }]}
          onPress={initializeGame}
        >
          <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 5 }} />
          <Text style={styles.buttonText}>Restart Game</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render result screen
  const renderResultScreen = () => {
    const stats = getGameStats();
    
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Game Completed!</Text>
        
        <View style={[styles.scoreCircle, { borderColor: accentColor }]}>
          <Text style={[styles.scoreText, { color: accentColor }]}>
            {stats.score}%
          </Text>
        </View>
        
        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <Ionicons name="time-outline" size={24} color={accentColor} />
            <Text style={styles.resultStatLabel}>Time:</Text>
            <Text style={styles.resultStatValue}>{stats.time}</Text>
          </View>
          
          <View style={styles.resultStat}>
            <Ionicons name="refresh-outline" size={24} color={accentColor} />
            <Text style={styles.resultStatLabel}>Attempts:</Text>
            <Text style={styles.resultStatValue}>{stats.attempts}</Text>
          </View>
          
          <View style={styles.resultStat}>
            <Ionicons name="checkmark-circle-outline" size={24} color={accentColor} />
            <Text style={styles.resultStatLabel}>Pairs Matched:</Text>
            <Text style={styles.resultStatValue}>{sampleData.pairs.length}/{sampleData.pairs.length}</Text>
          </View>
        </View>
        
        <View style={styles.resultButtonsContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Return to Module</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#555' }]}
            onPress={initializeGame}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (!gameCompleted && matchedPairs.length > 0) {
              Alert.alert(
                "Exit Game?",
                "Your progress will be lost. Are you sure you want to exit?",
                [
                  { text: "Stay", style: "cancel" },
                  { text: "Exit", onPress: () => navigation.goBack() }
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="grid-outline" size={24} color={accentColor} />
          <Text style={styles.headerTitle}>Matching Activity</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{sampleData.title}</Text>
          <Text style={styles.instructions}>
            Match each term with its correct definition by tapping on cards.
          </Text>
          
          {gameCompleted ? renderResultScreen() : renderGameBoard()}
        </View>
      </ScrollView>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructions: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#ddd',
    fontSize: 16,
    marginLeft: 5,
  },
  gameContainer: {
    marginBottom: 20,
  },
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  item: {
    width: (width - 60) / 2,
    height: 90,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedItem: {
    backgroundColor: '#3C3C3C',
  },
  matchedItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  itemText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  termText: {
    fontWeight: 'bold',
  },
  selectedItemText: {
    color: '#fff',
  },
  matchedItemText: {
    color: '#4CAF50',
  },
  matchedIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  button: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Result screen styles
  resultContainer: {
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  resultStats: {
    width: '100%',
    marginBottom: 30,
  },
  resultStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  resultStatLabel: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
    width: 120,
  },
  resultStatValue: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 'auto',
  },
  resultButtonsContainer: {
    width: '100%',
  },
});

export default MatchingActivityScreen; 