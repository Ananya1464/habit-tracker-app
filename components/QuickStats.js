import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const QuickStats = ({ totalStreaks, completedToday, currentLevel }) => {
  return (
    <View style={styles.container}>
      <StatCard
        icon="🔥"
        label="Total Streaks"
        value={totalStreaks}
        gradient={['#FF6B35', '#FFA500']}
      />
      <StatCard
        icon="✅"
        label="Completed Today"
        value={`${completedToday}/${currentLevel}`}
        gradient={['#10B981', '#34D399']}
      />
      <StatCard
        icon="⭐"
        label="Current Level"
        value={currentLevel}
        gradient={['#9d4edd', '#c77dff']}
      />
    </View>
  );
};

const StatCard = ({ icon, label, value, gradient }) => (
  <LinearGradient
    colors={gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.cardGradient}
  >
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 2,
  },
  card: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 11,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
