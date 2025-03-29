import React, { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet, View, Text, Modal, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import LearnScreen from '../screens/main/LearnScreen';
import LearnPathScreen from '../screens/main/LearnPathScreen';
import ShopScreen from '../screens/main/ShopScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ProfileEditScreen from '../screens/main/ProfileEditScreen';
import FriendsScreen from '../screens/main/FriendsScreen';
import CommunitiesScreen from '../screens/main/CommunitiesScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import MenuScreen from '../screens/main/MenuScreen';
import LeaderboardsScreen from '../screens/main/LeaderboardsScreen';
import TaskScreen from '../screens/main/TaskScreen';

// Import module activity screens
import ModuleDetailScreen from '../screens/learn/ModuleDetailScreen';
import ReadingActivityScreen from '../screens/learn/ReadingActivityScreen';
import QuizActivityScreen from '../screens/learn/QuizActivityScreen';
import MatchingActivityScreen from '../screens/learn/MatchingActivityScreen';
import WritingActivityScreen from '../screens/learn/WritingActivityScreen';

// Create navigation stacks
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const LearnStack = createStackNavigator();
const ShopStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const MenuStack = createStackNavigator();
const TaskStack = createStackNavigator();
const RootStack = createStackNavigator(); // New root stack for app-level navigation

// Custom header with menu button
const HeaderLeft = ({ openMenu }) => {
  const { accent } = useTheme();
  return (
    <TouchableOpacity 
      style={styles.menuButton}
      onPress={openMenu}
    >
      <Ionicons name="menu" size={28} color={accent} />
    </TouchableOpacity>
  );
};

const HeaderRight = () => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      style={styles.profileButton}
      onPress={() => {
        navigation.navigate('Profile');
      }}
    >
      <View style={styles.profileCircle} />
    </TouchableOpacity>
  );
};

// Menu Modal component
const MenuModal = ({ visible, closeMenu, rootNavigation }) => {
  const { accent } = useTheme();
  
  const handleNavigate = (screen) => {
    closeMenu();
    // Navigate to Menu screens directly at the root level
    rootNavigation.navigate('MenuScreens', {
      screen: screen
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={closeMenu}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={closeMenu}>
              <Ionicons name="close" size={28} color={accent} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.menuList}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigate('Leaderboards')}
            >
              <Ionicons name="trophy" size={24} color={accent} />
              <Text style={styles.menuItemText}>Leaderboards</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigate('Friends')}
            >
              <Ionicons name="people" size={24} color={accent} />
              <Text style={styles.menuItemText}>View Friends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigate('Communities')}
            >
              <Ionicons name="people-circle" size={24} color={accent} />
              <Text style={styles.menuItemText}>Communities</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleNavigate('Settings')}
            >
              <Ionicons name="settings" size={24} color={accent} />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Home Stack Navigator
const HomeStackNavigator = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { accent } = useTheme();
  
  return (
    <>
      <HomeStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E1E1E',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitle: 'Home',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
        }}
      >
        <HomeStack.Screen 
          name="HomeMain" 
          component={HomeScreen} 
          options={() => ({
            headerLeft: () => (
              <HeaderLeft 
                openMenu={() => setMenuVisible(true)} 
              />
            ),
            headerRight: () => (
              <HeaderRight />
            ),
          })}
        />
      </HomeStack.Navigator>
      
      <MenuModal 
        visible={menuVisible}
        closeMenu={() => setMenuVisible(false)}
        rootNavigation={navigation}
      />
    </>
  );
};

// Learn Stack Navigator
const LearnStackNavigator = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { accent } = useTheme();
  
  return (
    <>
      <LearnStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E1E1E',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
        }}
      >
        <LearnStack.Screen 
          name="LearnMain" 
          component={LearnScreen}
          options={() => ({
            headerTitle: 'Learn',
            headerLeft: () => (
              <HeaderLeft 
                openMenu={() => setMenuVisible(true)} 
              />
            ),
            headerRight: () => (
              <HeaderRight />
            ),
          })}
        />
        <LearnStack.Screen 
          name="LearnPath" 
          component={LearnPathScreen}
          options={({ navigation }) => ({
            headerTitle: 'Learn Path',
            headerLeft: () => (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Ionicons name="arrow-back" size={28} color={accent} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <HeaderRight />
            ),
          })}
        />
        
        <LearnStack.Screen 
          name="ModuleDetail" 
          component={ModuleDetailScreen}
          options={({ navigation, route }) => ({
            headerTitle: route.params?.moduleTitle || 'Module Details',
            headerLeft: () => (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Ionicons name="arrow-back" size={28} color={accent} />
              </TouchableOpacity>
            ),
          })}
        />
        
        <LearnStack.Screen 
          name="ReadingActivity" 
          component={ReadingActivityScreen}
          options={{ headerShown: false }}
        />
        
        <LearnStack.Screen 
          name="QuizActivity" 
          component={QuizActivityScreen}
          options={{ headerShown: false }}
        />
        
        <LearnStack.Screen 
          name="MatchingActivity" 
          component={MatchingActivityScreen}
          options={{ headerShown: false }}
        />
        
        <LearnStack.Screen 
          name="WritingActivity" 
          component={WritingActivityScreen}
          options={{ headerShown: false }}
        />
      </LearnStack.Navigator>
      
      <MenuModal 
        visible={menuVisible}
        closeMenu={() => setMenuVisible(false)}
        rootNavigation={navigation}
      />
    </>
  );
};

// Shop Stack Navigator
const ShopStackNavigator = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { accent } = useTheme();
  
  return (
    <>
      <ShopStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E1E1E',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitle: 'Shop',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
        }}
      >
        <ShopStack.Screen 
          name="ShopMain" 
          component={ShopScreen}
          options={() => ({
            headerLeft: () => (
              <HeaderLeft 
                openMenu={() => setMenuVisible(true)} 
              />
            ),
            headerRight: () => (
              <HeaderRight />
            ),
          })}
        />
      </ShopStack.Navigator>
      
      <MenuModal 
        visible={menuVisible}
        closeMenu={() => setMenuVisible(false)}
        rootNavigation={navigation}
      />
    </>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { accent } = useTheme();
  
  return (
    <>
      <ProfileStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E1E1E',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitle: 'Profile',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
        }}
      >
        <ProfileStack.Screen 
          name="ProfileMain" 
          component={ProfileScreen}
          options={() => ({
            headerLeft: () => (
              <HeaderLeft 
                openMenu={() => setMenuVisible(true)} 
              />
            ),
          })}
        />
        
        <ProfileStack.Screen 
          name="ProfileEdit" 
          component={ProfileEditScreen}
          options={({ navigation }) => ({
            headerTitle: 'Edit Profile',
            headerLeft: () => (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Ionicons name="arrow-back" size={28} color={accent} />
              </TouchableOpacity>
            ),
          })}
        />
      </ProfileStack.Navigator>
      
      <MenuModal 
        visible={menuVisible}
        closeMenu={() => setMenuVisible(false)}
        rootNavigation={navigation}
      />
    </>
  );
};

// Menu Stack Navigator
const MenuStackNavigator = () => {
  const navigation = useNavigation();
  const { accent } = useTheme();
  
  return (
    <MenuStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E1E1E',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 24,
        },
      }}
    >
      <MenuStack.Screen 
        name="MenuMain" 
        component={MenuScreen}
        options={{ 
          headerTitle: 'Menu',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" size={28} color={accent} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <MenuStack.Screen 
        name="Leaderboards" 
        component={LeaderboardsScreen}
        options={{ 
          headerTitle: 'Leaderboards',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" size={28} color={accent} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <MenuStack.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{ 
          headerTitle: 'Friends',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" size={28} color={accent} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <MenuStack.Screen 
        name="Communities" 
        component={CommunitiesScreen}
        options={{ 
          headerTitle: 'Communities',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" size={28} color={accent} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <MenuStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          headerTitle: 'Settings',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" size={28} color={accent} />
            </TouchableOpacity>
          ),
        }}
      />
    </MenuStack.Navigator>
  );
};

// Task Stack Navigator
const TaskStackNavigator = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { accent } = useTheme();
  
  return (
    <>
      <TaskStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E1E1E',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitle: 'Tasks',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
        }}
      >
        <TaskStack.Screen 
          name="TaskMain" 
          component={TaskScreen}
          options={() => ({
            headerLeft: () => (
              <HeaderLeft 
                openMenu={() => setMenuVisible(true)} 
              />
            ),
            headerRight: () => (
              <HeaderRight />
            ),
          })}
        />
      </TaskStack.Navigator>
      
      <MenuModal 
        visible={menuVisible}
        closeMenu={() => setMenuVisible(false)}
        rootNavigation={navigation}
      />
    </>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  const { accent } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Learn') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Shop') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={focused ? size + 4 : size} color={color} />;
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: '#999',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 1,
          borderTopColor: '#333',
          height: 85,
          paddingBottom: 15,
          paddingTop: 6,
        },
        headerShown: false,
        sceneContainerStyle: { backgroundColor: '#1E1E1E' },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Learn" component={LearnStackNavigator} />
      <Tab.Screen name="Tasks" component={TaskStackNavigator} />
      <Tab.Screen name="Shop" component={ShopStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

// Root Navigator
const MainNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, presentation: 'containedModal' }}>
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
      <RootStack.Screen name="MenuScreens" component={MenuStackNavigator} />
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 15,
  },
  backButton: {
    marginLeft: 15,
  },
  profileButton: {
    marginRight: 15,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDDDDD',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    height: '100%',
    backgroundColor: '#1E1E1E',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuList: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 15,
  },
});

export default MainNavigator; 