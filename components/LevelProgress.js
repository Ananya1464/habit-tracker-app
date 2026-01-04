import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateLevel, getXPNeededForNextLevel, getLevelTitle, getXPForLevel } from '../utils/calculations';

export const LevelProgress = ({ totalXP = 0 }) => {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const currentLevelXP = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = 3000;
  const progressPercent = Math.min((currentLevelXP / xpNeededForNextLevel) * 100, 100);
  const isNearLevelUp = progressPercent > 90;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isNearLevelUp ? ['#FFD700', '#FFA500'] : ['#9d4edd', '#ff006e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.levelBadge, isNearLevelUp && styles.levelBadgeGlow]}
      >
        <Text style={styles.levelNumber}>{currentLevel}</Text>
      </LinearGradient>

      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.levelTitle}>{getLevelTitle(currentLevel)}</Text>
          <Text style={styles.nextLevelText}>
            {currentLevelXP} / {xpNeededForNextLevel} XP
          </Text>
        </View>
        <Text style={styles.trophyIcon}>🏆</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={isNearLevelUp ? ['#FFD700', '#FFA500'] : ['#9d4edd', '#ff006e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progressPercent}%` }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  levelBadgeGlow: {
    shadowColor: '#FFD700',
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  levelNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  nextLevelText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  trophyIcon: {
    fontSize: 32,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#0f0f1e',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#666',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
});
