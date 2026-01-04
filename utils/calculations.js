// Reusable utility functions for calculations
export const calculateLevel = (totalXP) => {
  const xpPerLevel = 3000;
  return Math.floor(totalXP / xpPerLevel) + 1;
};

export const getXPForLevel = (level) => {
  return (level - 1) * 3000;
};

export const getXPNeededForNextLevel = (totalXP) => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = currentLevel * 3000;
  return nextLevelXP - totalXP;
};

export const getLevelTitle = (level) => {
  const titles = [
    'Habit Rookie',
    'Habit Enthusiast',
    'Habit Committer',
    'Habit Master',
    'Consistency Champion',
    'Streak Legend',
    'Habit Wizard',
    'Discipline Deity',
    'Perfection Seeker',
    'Unstoppable Force',
  ];
  return titles[Math.min(level - 1, titles.length - 1)];
};

export const getStreakColor = (streak) => {
  if (streak === 0) return '#666';
  if (streak < 7) return '#FFA500'; // Orange
  if (streak < 30) return '#FFD700'; // Gold
  return '#FF4500'; // OrangeRed (fire color)
};

export const getStreakEmoji = (streak) => {
  if (streak === 0) return '';
  if (streak < 7) return '🔥';
  if (streak < 30) return '🔥🔥';
  return '🔥🔥🔥';
};

export const calculateDaysUntilLevelUp = (totalXP) => {
  const xpNeeded = getXPNeededForNextLevel(totalXP);
  return Math.ceil(xpNeeded / 100); // Assuming ~100 XP per day
};

export const calculateConsistencyScore = (progressData) => {
  if (!progressData || Object.keys(progressData).length === 0) return 0;
  
  let perfectDays = 0;
  let totalDays = Object.keys(progressData).length;
  
  Object.values(progressData).forEach((dayData) => {
    if (dayData) {
      const completions = Object.values(dayData).filter(Boolean).length;
      if (completions > 0) perfectDays++;
    }
  });
  
  return Math.round((perfectDays / totalDays) * 100);
};
