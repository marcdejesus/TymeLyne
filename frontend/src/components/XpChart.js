import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../constants/theme';
import { getXpHistory } from '../services/activityService';

// This is a placeholder component for the chart
// We'll need to install react-native-chart-kit or another charting library
// For now, we'll create a mock chart UI

const { width } = Dimensions.get('window');

const XpChart = () => {
  const [period, setPeriod] = useState('monthly');
  const [xpData, setXpData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]);
  const [dataPoints, setDataPoints] = useState([]);
  
  // Fetch XP history data when component mounts
  useEffect(() => {
    fetchXpData();
  }, [period]);
  
  // Fetch XP data from API based on selected period
  const fetchXpData = async () => {
    try {
      setLoading(true);
      
      // Determine how many data points to fetch based on period
      const limit = period === 'daily' ? 14 : period === 'weekly' ? 8 : 6;
      
      // Fetch XP history data
      const data = await getXpHistory({ period, limit });
      
      setXpData(data);
      
      // Process data for chart
      processChartData(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching XP data:', error);
      setLoading(false);
    }
  };
  
  // Process XP data for the chart
  const processChartData = (data) => {
    if (!data || data.length === 0) {
      // Set default empty data
      setLabels(['']);
      setDataPoints([0]);
      return;
    }
    
    // Extract labels and data points
    const chartLabels = [];
    const chartData = [];
    
    data.forEach(item => {
      // Format date based on period
      const date = new Date(item.date);
      let label = '';
      
      switch (period) {
        case 'daily':
          label = `${date.getDate()}/${date.getMonth() + 1}`;
          break;
        case 'weekly':
          label = `W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
          break;
        case 'monthly':
          label = date.toLocaleString('default', { month: 'short' });
          break;
      }
      
      chartLabels.push(label);
      chartData.push(item.xp);
    });
    
    setLabels(chartLabels);
    setDataPoints(chartData);
  };
  
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
    labels: labels,
    datasets: [{
      data: dataPoints.length ? dataPoints : [0],
      color: () => 'rgba(83, 177, 177, 1)',
      strokeWidth: 2
    }]
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
});

export default XpChart; 