import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../constants/theme';
import { useUserProgression } from '../contexts/UserProgressionContext';
import { getXpHistory } from '../services/activityService';

// This chart component displays user's XP data over time with different time period views

const { width } = Dimensions.get('window');

const XpChart = () => {
  const [period, setPeriod] = useState('daily'); // Default to daily view for more detailed data
  const [loading, setLoading] = useState(false);
  const { progressData } = useUserProgression();
  
  // Chart data state
  const [labels, setLabels] = useState(['']);
  const [dataPoints, setDataPoints] = useState([0]);
  const [xpHistoryData, setXpHistoryData] = useState([]);
  
  // Format date function for different period types
  const formatDate = (dateString, periodType) => {
    const date = new Date(dateString);
    
    switch (periodType) {
      case 'daily':
        return `${date.getDate()}/${date.getMonth() + 1}`;
      case 'weekly':
        // Get week number for weekly display
        return `W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
      case 'monthly':
        // Get short month name
        return date.toLocaleString('default', { month: 'short' });
      default:
        return '';
    }
  };
  
  // Fetch XP history data from the API
  const fetchXpHistory = async (periodType) => {
    try {
      setLoading(true);
      
      // Set appropriate limit based on period type
      let limit = 7;  // default for daily (7 days)
      if (periodType === 'weekly') limit = 4;  // 4 weeks
      if (periodType === 'monthly') limit = 6;  // 6 months
      
      // Call the API service to get XP history data
      const data = await getXpHistory({ 
        period: periodType,
        limit: limit
      });
      
      console.log(`XP HISTORY (${periodType}): Received ${data?.length || 0} records:`,
        data?.map(item => `${item.date}: ${item.xp}xp`).join(', ')
      );
      
      setXpHistoryData(data);
      
      // Sort data by date to ensure proper order
      const sortedData = data?.sort((a, b) => new Date(a.date) - new Date(b.date)) || [];
      
      console.log(`XP CHART: Sorted data for ${periodType}:`,
        sortedData.map(item => `${item.date}: ${item.xp}xp`).join(', ')
      );
      
      if (sortedData.length > 0) {
        const chartData = sortedData.map((item, index) => ({
          x: index,  // Use index as x-axis value
          y: item.xp,
          date: item.date,
          label: formatDate(item.date, periodType)
        }));
        
        console.log(`XP CHART: Setting chart data for ${periodType}:`,
          chartData.map(item => `[${item.x}] ${item.label}: ${item.y}xp`).join(', ')
        );
        
        setLabels(chartData.map(item => item.label));
        setDataPoints(chartData.map(item => item.y));
      } else {
        console.log(`XP CHART: No data available for ${periodType}, showing empty chart`);
        setDefaultEmptyChart();
      }
    } catch (error) {
      console.error('Error fetching XP history:', error);
      // Set default empty chart on error
      setDefaultEmptyChart();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to set default empty chart
  const setDefaultEmptyChart = useCallback(() => {
    let defaultData = [];
    
    if (period === 'daily') {
      // Show last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        defaultData.push({
          x: 6 - i,
          y: 0,
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
      }
    } else if (period === 'weekly') {
      // Show last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        // Get the start of the week (Sunday)
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        defaultData.push({
          x: 7 - i,
          y: 0,
          date: startOfWeek.toISOString().split('T')[0],
          label: `Week ${8 - i}`
        });
      }
    } else {
      // Monthly - show last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1); // First day of the month
        defaultData.push({
          x: 11 - i,
          y: 0,
          date: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    }
    
    console.log(`XP CHART: Setting default empty chart for ${period}:`,
      defaultData.map(item => `[${item.x}] ${item.label}: ${item.y}xp`).join(', ')
    );
    
    setLabels(defaultData.map(item => item.label));
    setDataPoints(defaultData.map(item => item.y));
  }, [period]);
  
  // Update chart when period changes
  useEffect(() => {
    fetchXpHistory(period);
  }, [period]);
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: () => 'rgba(83, 177, 177, 1)',
    strokeWidth: 2,
    decimalPlaces: 0,
    fillShadowGradientOpacity: 0.6,
    fillShadowGradient: 'rgba(83, 177, 177, 1)',
    labelColor: () => colors.text.secondary,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#fff'
    }
  };
  
  // Chart data object
  const chartData = {
    labels: labels.length ? labels : [''],
    datasets: [{
      data: dataPoints.length ? dataPoints : [0],
      color: () => 'rgba(83, 177, 177, 1)',
      strokeWidth: 2
    }]
  };
  
  // Calculate most recent total XP from history data
  const calculateTotalXp = () => {
    if (xpHistoryData && xpHistoryData.length > 0) {
      // Use the most recent XP value from history data
      // Sort by date descending and get first item's XP
      const sorted = [...xpHistoryData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      return sorted[0].xp;
    }
    // Fallback to progression data
    return progressData?.totalXp || 0;
  };
  
  // Render period selector buttons
  const renderPeriodSelector = () => {
    return (
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'daily' && styles.activePeriodButton]}
          onPress={() => setPeriod('daily')}
        >
          <Text style={[
            styles.periodButtonText, 
            period === 'daily' && styles.activePeriodButtonText
          ]}>
            Daily
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'weekly' && styles.activePeriodButton]}
          onPress={() => setPeriod('weekly')}
        >
          <Text style={[
            styles.periodButtonText, 
            period === 'weekly' && styles.activePeriodButtonText
          ]}>
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'monthly' && styles.activePeriodButton]}
          onPress={() => setPeriod('monthly')}
        >
          <Text style={[
            styles.periodButtonText, 
            period === 'monthly' && styles.activePeriodButtonText
          ]}>
            Monthly
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>XP over time</Text>
        {renderPeriodSelector()}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      ) : (
        <LineChart
          data={chartData}
          width={width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={true}
          withShadow={false}
          withVerticalLines={false}
          withHorizontalLines={false}
        />
      )}
      
      <View style={styles.totalXpContainer}>
        <Text style={styles.totalXpLabel}>Total XP:</Text>
        <Text style={styles.totalXpValue}>{calculateTotalXp()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
    borderRadius: 12,
  },
  activePeriodButton: {
    backgroundColor: 'rgba(83, 177, 177, 0.2)',
  },
  periodButtonText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  activePeriodButtonText: {
    color: '#53B1B1',
    fontWeight: '600',
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  totalXpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(83, 177, 177, 0.1)',
    borderRadius: 8,
  },
  totalXpLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginRight: 6,
  },
  totalXpValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#53B1B1',
  },
});

export default XpChart; 