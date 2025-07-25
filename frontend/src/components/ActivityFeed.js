import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ActivityFeedItem from './ActivityFeedItem';
import { colors } from '../constants/theme';

const ActivityFeed = ({ activities, loading, useParentScroll = false }) => {
  // Render empty state when there are no activities
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Loading activities...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No activities yet</Text>
        <Text style={styles.emptyStateDescription}>
          Complete courses and sections to see your activity here!
        </Text>
      </View>
    );
  };

  // Direct rendering of items when using parent scroll
  const renderActivities = () => {
    if (activities.length === 0) {
      return renderEmptyState();
    }
    
    return activities.map((item, index) => (
      <ActivityFeedItem 
        key={`activity-${item.id || index}`} 
        activity={item} 
      />
    ));
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Feed</Text>
      
      {useParentScroll ? (
        <View style={styles.listContainerNoScroll}>
          {renderActivities()}
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item, index) => `activity-${item.id || index}`}
          renderItem={({ item }) => <ActivityFeedItem activity={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginVertical: 12,
    color: colors.text,
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  listContainerNoScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    margin: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ActivityFeed; 