import React, { useState, useEffect } from 'react';
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
      
      console.log(`📊 XP HISTORY (${periodType}): Received ${data?.length || 0} records:`, 
        JSON.stringify(data));
      
      setXpHistoryData(data);
      
      // Process data for chart if we have data points
      if (data && data.length > 0) {
        // Sort data by date (oldest to newest for chart display)
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(`📊 XP CHART: Sorted data for ${periodType}:`, 
          sortedData.map(item => ({ date: formatDate(item.date, periodType), xp: item.xp })));
        
        // Extract labels and data points
        const chartLabels = sortedData.map(item => formatDate(item.date, periodType));
        const chartData = sortedData.map(item => item.xp);
        
        console.log(`📊 XP CHART: Setting chart data for ${periodType}:`, 
          { labels: chartLabels, data: chartData });
        
        setLabels(chartLabels);
        setDataPoints(chartData);
      } else {
        // If no data, show empty chart with date labels
        console.log(`📊 XP CHART: No data available for ${periodType}, showing empty chart`);
        setDefaultEmptyChart(periodType);
      }
    } catch (error) {
      console.error('Error fetching XP history:', error);
      // Set default empty chart on error
      setDefaultEmptyChart(periodType);
    } finally {
      setLoading(false);
    }
  };
  
  // Set default empty chart with appropriate time labels when no data exists
  const setDefaultEmptyChart = (periodType) => {
    const now = new Date();
    const chartLabels = [];
    const emptyData = [];
    
    // Set same limits as fetch function
    let limit = 7;  // default for daily
    if (periodType === 'weekly') limit = 4;
    if (periodType === 'monthly') limit = 6;
    
    // Create array of appropriate dates for the period
    for (let i = limit - 1; i >= 0; i--) {
      const date = new Date(now);
      
      switch (periodType) {
        case 'daily':
          date.setDate(date.getDate() - i);
          break;
        case 'weekly':
          date.setDate(date.getDate() - (i * 7));
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - i);
          break;
      }
      
      chartLabels.push(formatDate(date, periodType));
      emptyData.push(0); // Zero XP for empty data
    }
    
    console.log(`📊 XP CHART: Setting default empty chart for ${periodType}:`,
      { labels: chartLabels, data: emptyData });
    
    setLabels(chartLabels);
    setDataPoints(emptyData);
  };
  
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