import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStreakColor, getStreakEmoji } from '../utils/calculations';

const HABIT_ICONS = {
  workout: '💪',
  read: '📚',
  meditate: '🧘',
  water: '💧',
  sleep: '😴',
  code: '💻',
  draw: '🎨',
  cook: '🍳',
  walk: '🚶',
  journal: '📝',
};

const HABIT_COLORS = {
  blue: ['#0EA5E9', '#06B6D4'],
  purple: ['#9d4edd', '#c77dff'],
  pink: ['#ff006e', '#ff1493'],
  orange: ['#FF6B35', '#FFA500'],
  green: ['#10B981', '#34D399'],
  red: ['#EF4444', '#F87171'],
};

export const HabitCard = ({ 
  habit, 
  completed, 
  onToggle, 
  onDelete,
  xpValue = 50 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const habitIcon = HABIT_ICONS[habit.icon] || '✨';
  const streakColor = getStreakColor(habit.streak || 0);
  const streakEmoji = getStreakEmoji(habit.streak || 0);
  const gradientColors = HABIT_COLORS[habit.color] || HABIT_COLORS.purple;

  const handleToggle = () => {
    setIsPressed(true);
    onToggle();
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <View style={[styles.cardContainer, isPressed && styles.cardPressed]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={[styles.card, completed && styles.cardCompleted]}>
          {/* Icon Section */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Text style={styles.habitIcon}>{habitIcon}</Text>
          </LinearGradient>

          {/* Center Section */}
          <View style={styles.centerSection}>
            <Text style={[styles.habitName, completed && styles.habitNameCompleted]}>
              {habit.name}
            </Text>
            <View style={styles.streakContainer}>
              <Text style={styles.streakEmoji}>{streakEmoji}</Text>
              <Text style={[styles.streakCount, { color: streakColor }]}>
                {habit.streak || 0} day streak
              </Text>
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {/* XP Badge */}
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{xpValue}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>

            {/* Checkbox */}
            <TouchableOpacity
              style={[
                styles.checkbox,
                completed && styles.checkboxCompleted,
                { borderColor: gradientColors[0] }
              ]}
              onPress={handleToggle}
            >
              {completed && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  cardCompleted: {
    backgroundColor: '#1a2a2a',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  habitIcon: {
    fontSize: 24,
  },
  centerSection: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  habitNameCompleted: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'center',
    gap: 8,
  },
  xpBadge: {
    backgroundColor: '#16213e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9d4edd',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff006e',
  },
  xpLabel: {
    fontSize: 10,
    color: '#999',
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1e',
  },
  checkboxCompleted: {
    backgroundColor: '#ff006e',
    borderColor: '#ff006e',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
