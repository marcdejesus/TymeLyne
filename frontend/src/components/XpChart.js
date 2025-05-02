import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../constants/theme';
import { useUserProgression } from '../contexts/UserProgressionContext';

// This is a placeholder component for the chart
// We'll need to install react-native-chart-kit or another charting library
// For now, we'll create a mock chart UI

const { width } = Dimensions.get('window');

const XpChart = () => {
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { progressData } = useUserProgression();
  
  // Default chart data
  const [labels, setLabels] = useState(['']);
  const [dataPoints, setDataPoints] = useState([0]);
  
  // Update chart data when period changes or progression data updates
  useEffect(() => {
    generateChartData();
  }, [period, progressData]);
  
  // Generate chart data based on selected period
  const generateChartData = () => {
    setLoading(true);
    
    // Get the total XP from progression data
    const totalXp = progressData?.totalXp || 0;
    
    // Create dummy time periods based on selected filter
    let chartLabels = [];
    let chartData = [];
    
    const now = new Date();
    
    switch (period) {
      case 'daily':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          chartLabels.push(`${date.getDate()}/${date.getMonth() + 1}`);
          chartData.push(totalXp);
        }
        break;
      
      case 'weekly':
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          chartLabels.push(`W${Math.ceil((date.getDate() + date.getDay()) / 7)}`);
          chartData.push(totalXp);
        }
        break;
      
      case 'monthly':
      default:
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          chartLabels.push(date.toLocaleString('default', { month: 'short' }));
          chartData.push(totalXp);
        }
        break;
    }
    
    setLabels(chartLabels);
    setDataPoints(chartData);
    setLoading(false);
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
      
      <View style={styles.totalXpContainer}>
        <Text style={styles.totalXpLabel}>Total XP:</Text>
        <Text style={styles.totalXpValue}>{progressData?.totalXp || 0}</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginRight: 8,
  },
  totalXpValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#53B1B1',
  },
});

export default XpChart; 