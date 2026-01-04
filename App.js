import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
} from 'firebase/database';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import LoginScreen from './components/LoginScreen';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const QUOTES = [
  "Success is 1% inspiration and 99% perspiration.",
  "Small consistent actions create big results.",
  "Progress over perfection.",
  "Build 1% better every day.",
];

const HABIT_BUNDLES = [
  {
    id: 'health',
    name: '💪 Health & Fitness',
    habits: [
      { name: 'Exercise', icon: '💪', xp: 100 },
      { name: 'Drink Water', icon: '💧', xp: 25 },
      { name: 'Sleep 8 Hours', icon: '😴', xp: 100 },
      { name: 'Healthy Eating', icon: '🥗', xp: 50 },
    ],
  },
  {
    id: 'learning',
    name: '📚 Learning & Growth',
    habits: [
      { name: 'Read Books', icon: '📚', xp: 50 },
      { name: 'Learn New Skill', icon: '🎓', xp: 75 },
      { name: 'Practice', icon: '🎯', xp: 50 },
      { name: 'Study', icon: '📖', xp: 75 },
    ],
  },
  {
    id: 'wellness',
    name: '🧘 Mental Wellness',
    habits: [
      { name: 'Meditate', icon: '🧘', xp: 75 },
      { name: 'Journal', icon: '📝', xp: 50 },
      { name: 'Gratitude', icon: '🙏', xp: 50 },
      { name: 'No Phone Hour', icon: '📵', xp: 75 },
    ],
  },
  {
    id: 'productivity',
    name: '💼 Productivity',
    habits: [
      { name: 'Deep Work', icon: '💻', xp: 100 },
      { name: 'Plan Day', icon: '📋', xp: 50 },
      { name: 'Inbox Zero', icon: '📧', xp: 50 },
      { name: 'Wake Early', icon: '🌅', xp: 75 },
    ],
  },
];

export default function App() {
  // Authentication
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // App state
  const [currentTab, setCurrentTab] = useState('home');
  const [habits, setHabits] = useState([]);
  const [todayProgress, setTodayProgress] = useState({});
  const [allProgress, setAllProgress] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState('');
  const [habitsData, setHabitsData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState('');
  const [selectedHabitId, setSelectedHabitId] = useState(null);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDateString = (daysBack) => {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle email/password authentication
  const handleEmailAuth = async () => {
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      if (isSignUp) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Account created:', userCredential.user.email);
        setUser(userCredential.user);
      } else {
        // Sign in to existing account
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Signed in:', userCredential.user.email);
        setUser(userCredential.user);
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Auth error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Email already has an account. Try signing in instead.');
        setIsSignUp(false);
      } else if (error.code === 'auth/user-not-found') {
        setAuthError('No account found. Try signing up.');
        setIsSignUp(true);
      } else if (error.code === 'auth/wrong-password') {
        setAuthError('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(error.message || 'Authentication failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch habits
  useEffect(() => {
    const habitsRef = ref(database, 'habits');
    const unsubscribe = onValue(habitsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setHabitsData(data);
        const habitsList = Object.entries(data).map(([id, habit]) => ({
          id,
          ...habit,
          streak: habit.streak || 0,
          icon: habit.icon || '✨',
          xp: habit.xp || 50,
        }));
        setHabits(habitsList);
      } else {
        setHabits([]);
        setHabitsData({});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch today's progress
  useEffect(() => {
    const today = getTodayDateString();
    const progressRef = ref(database, `progress/${today}`);
    const unsubscribe = onValue(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        setTodayProgress(snapshot.val());
      } else {
        setTodayProgress({});
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch all progress for stats
  useEffect(() => {
    const allProgressData = {};
    const daysPromises = [];

    for (let i = 0; i < 30; i++) {
      const dateStr = getDateString(i);
      const progressRef = ref(database, `progress/${dateStr}`);
      daysPromises.push(
        new Promise((resolve) => {
          onValue(progressRef, (snapshot) => {
            if (snapshot.exists()) {
              allProgressData[dateStr] = snapshot.val();
            }
            resolve();
          });
        })
      );
    }

    Promise.all(daysPromises).then(() => {
      setAllProgress(allProgressData);
    });
  }, []);

  const addHabit = async () => {
    if (!newHabitName.trim()) return;

    const habitsRef = ref(database, 'habits');
    const newHabitRef = push(habitsRef);

    await set(newHabitRef, {
      name: newHabitName.trim(),
      icon: '✨',
      xp: 50,
      streak: 0,
      createdAt: new Date().toISOString(),
    });

    setNewHabitName('');
    setShowAddModal(false);
  };

  const addBundle = async () => {
    if (!selectedBundle) return;

    const bundle = HABIT_BUNDLES.find(b => b.id === selectedBundle);
    const habitsRef = ref(database, 'habits');

    for (const habit of bundle.habits) {
      const newHabitRef = push(habitsRef);
      await set(newHabitRef, {
        name: habit.name,
        icon: habit.icon,
        xp: habit.xp,
        streak: 0,
        createdAt: new Date().toISOString(),
      });
    }

    setSelectedBundle(null);
    setShowBundleModal(false);
  };

  const toggleHabit = async (habitId) => {
    const today = getTodayDateString();
    const currentStatus = todayProgress[habitId] || false;

    const progressRef = ref(database, `progress/${today}/${habitId}`);
    await set(progressRef, !currentStatus);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (!currentStatus) {
      const habitRef = ref(database, `habits/${habitId}/streak`);
      const currentStreak = habitsData[habitId]?.streak || 0;
      await set(habitRef, currentStreak + 1);
    }
  };

  const deleteHabit = (habitId) => {
    const habitRef = ref(database, `habits/${habitId}`);
    remove(habitRef);
  };

  const startEditHabit = (habitId, habitName) => {
    setEditingHabitId(habitId);
    setEditingHabitName(habitName);
    setShowEditModal(true);
  };

  const saveEditHabit = async () => {
    if (!editingHabitName.trim() || !editingHabitId) return;

    const habitRef = ref(database, `habits/${editingHabitId}/name`);
    await set(habitRef, editingHabitName.trim());

    setShowEditModal(false);
    setEditingHabitId(null);
    setEditingHabitName('');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const completedCount = Object.values(todayProgress).filter(Boolean).length;
  const totalCount = habits.length;

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onAuth={handleEmailAuth}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        authError={authError}
        authLoading={authLoading}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading habits...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Detail View - Show when habit is selected */}
      {selectedHabitId && (
        <HabitDetailScreen
          habitId={selectedHabitId}
          habit={habits.find((h) => h.id === selectedHabitId)}
          allProgress={allProgress}
          habits={habits}
          onBack={() => setSelectedHabitId(null)}
          onDelete={() => {
            deleteHabit(selectedHabitId);
            setSelectedHabitId(null);
          }}
          onToggleProgress={(habitId) => {
            toggleHabit(habitId);
          }}
          todayProgress={todayProgress}
        />
      )}

      {/* Home Screen - List view of all habits */}
      {!selectedHabitId && currentTab === 'home' && (
        <HomeScreen
          habits={habits}
          todayProgress={todayProgress}
          completedCount={completedCount}
          totalCount={totalCount}
          currentQuote={currentQuote}
          setCurrentQuote={() => setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])}
          onAddPress={() => setShowBundleModal(true)}
          toggleHabit={toggleHabit}
          deleteHabit={deleteHabit}
          onEditHabit={startEditHabit}
          onSelectHabit={setSelectedHabitId}
          onSignOut={handleSignOut}
          user={user}
        />
      )}

      {!selectedHabitId && currentTab === 'stats' && (
        <StatsScreen
          allProgress={allProgress}
          habits={habits}
        />
      )}

      {/* Bottom Navigation - Hide during detail view */}
      {!selectedHabitId && (
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.navButton, currentTab === 'home' && styles.navButtonActive]}
            onPress={() => setCurrentTab('home')}
          >
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={[styles.navLabel, currentTab === 'home' && styles.navLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentTab === 'stats' && styles.navButtonActive]}
            onPress={() => setCurrentTab('stats')}
          >
            <Text style={styles.navIcon}>📊</Text>
            <Text style={[styles.navLabel, currentTab === 'stats' && styles.navLabelActive]}>Stats</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Habit Modals */}
      <Modal
        visible={showBundleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBundleModal(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Habits</Text>
              <TouchableOpacity onPress={() => setShowBundleModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalLabel}>📦 Choose a Bundle</Text>
              <Text style={styles.modalSubtext}>Select one to add all habits at once</Text>
              {HABIT_BUNDLES.map((bundle) => (
                <TouchableOpacity
                  key={bundle.id}
                  style={[
                    styles.bundleButton,
                    selectedBundle === bundle.id && styles.bundleButtonSelected,
                  ]}
                  onPress={() => setSelectedBundle(bundle.id)}
                >
                  <View style={styles.bundleContent}>
                    <View style={styles.bundleText}>
                      <Text style={styles.bundleName}>{bundle.name}</Text>
                      <Text style={styles.bundleCount}>{bundle.habits.length} habits</Text>
                    </View>
                    {selectedBundle === bundle.id && (
                      <Text style={styles.bundleCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalLabel, { marginTop: 24 }]}>Or Add Custom Habit</Text>
              <Text style={styles.modalSubtext}>Create your own habit</Text>
              <TextInput
                style={styles.input}
                placeholder="Habit name..."
                placeholderTextColor="#666"
                value={newHabitName}
                onChangeText={setNewHabitName}
              />

              <LinearGradient
                colors={['#9d4edd', '#ff006e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={selectedBundle ? addBundle : addHabit}
                >
                  <Text style={styles.addButtonText}>
                    {selectedBundle ? 'Add Bundle' : 'Add Habit'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Habit</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Habit Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Habit name..."
                placeholderTextColor="#666"
                value={editingHabitName}
                onChangeText={setEditingHabitName}
              />

              <LinearGradient
                colors={['#9d4edd', '#ff006e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={saveEditHabit}
                >
                  <Text style={styles.addButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <StatusBar barStyle="light-content" />
    </SafeAreaView>
  );
}

function HabitDetailScreen({
  habitId,
  habit,
  allProgress,
  habits,
  onBack,
  onDelete,
  onToggleProgress,
  todayProgress,
}) {
  const [last7Days, setLast7Days] = useState([]);
  const [weekStats, setWeekStats] = useState({ completed: 0, perfect: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(habit?.name || '');

  useEffect(() => {
    if (!habit) return;

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = [];
    let completed = 0;
    let perfect = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayIndex = date.getDay();
      const isCompleted = allProgress[dateStr]?.[habitId] || false;

      if (isCompleted) completed++;
      if (Object.values(allProgress[dateStr] || {}).filter(Boolean).length === habits.length) perfect++;

      days.push({
        dateStr,
        label: dayLabels[dayIndex],
        dayName: dayNames[dayIndex],
        completed: isCompleted,
      });
    }

    setLast7Days(days);
    setWeekStats({ completed, perfect });
  }, [habit, habitId, allProgress, habits]);

  if (!habit) return null;

  const getTodayCompleted = () => Object.values(todayProgress).filter(Boolean).length;
  const getTotalHabits = () => habits.length;

  const handleSaveName = async () => {
    if (!editingName.trim()) return;
    const habitRef = ref(database, `habits/${habitId}/name`);
    await set(habitRef, editingName.trim());
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditingName(habit.name);
    setIsEditingName(false);
  };

  return (
    <ScrollView style={styles.screen}>
      {/* Header with Back Button */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Habit Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Date */}
      <View style={styles.detailDateContainer}>
        <Text style={styles.detailDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </Text>
      </View>

      {/* Progress Circle - Weekly Completion */}
      <View style={styles.detailProgressContainer}>
        <View style={styles.detailProgressCircle}>
          <Text style={styles.detailProgressNumber}>
            {weekStats.completed}
          </Text>
          <Text style={styles.detailProgressLabel}>
            of {7}
          </Text>
        </View>
        <Text style={styles.detailProgressText}>Completed This Week</Text>
      </View>

      {/* Habit Details Card with Inline Edit */}
      <View style={styles.detailCard}>
        {isEditingName ? (
          <View style={styles.detailEditContainer}>
            <Text style={styles.detailHabitIcon}>{habit.icon}</Text>
            <TextInput
              style={styles.detailNameInput}
              value={editingName}
              onChangeText={setEditingName}
              placeholderTextColor="#666"
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSaveName}
              style={styles.detailEditButton}
            >
              <Text style={styles.detailEditButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={[styles.detailEditButton, styles.detailCancelButton]}
            >
              <Text style={styles.detailCancelButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.detailCardContent}>
            <Text style={styles.detailHabitIcon}>{habit.icon}</Text>

            <View style={styles.detailHabitInfo}>
              <View style={styles.detailHabitNameRow}>
                <Text style={styles.detailHabitName}>{habit.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingName(true);
                    setEditingName(habit.name);
                  }}
                  style={styles.detailEditIconButton}
                >
                  <Text style={styles.detailEditIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
              {habit.streak > 0 && (
                <Text style={styles.detailHabitStreak}>
                  🔥 {habit.streak} day streak
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.detailCardDivider} />

        <View style={styles.detailXPRow}>
          <Text style={styles.detailXPLabel}>XP Reward</Text>
          <Text style={styles.detailXPValue}>+{habit.xp}</Text>
        </View>
      </View>

      {/* Quote Section */}
      <View style={styles.detailQuoteSection}>
        <Text style={styles.detailQuoteText}>
          "{QUOTES[Math.floor(Math.random() * QUOTES.length)]}"
        </Text>
        <Text style={styles.detailQuoteSubtext}>Motivational Quote</Text>
      </View>

      {/* Last 7 Days */}
      <View style={styles.detailLast7Container}>
        <View style={styles.detailLast7Header}>
          <Text style={styles.detailLast7Title}>Last 7 Days</Text>
          <Text style={styles.detailLast7Stat}>
            {weekStats.completed}/7 completed
          </Text>
        </View>

        <View style={styles.detailLast7Grid}>
          {last7Days.map((day) => (
            <TouchableOpacity
              key={day.dateStr}
              style={[
                styles.detailDay,
                day.completed
                  ? styles.detailDayCompleted
                  : styles.detailDayMissed,
              ]}
              onPress={() => onToggleProgress(habitId)}
            >
              {day.completed ? (
                <Text style={styles.detailDayCheck}>✓</Text>
              ) : (
                <Text style={styles.detailDayEmpty}>○</Text>
              )}
              <Text style={styles.detailDayLabel}>{day.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.detailActionsContainer}>
        <TouchableOpacity style={styles.detailActionButton}>
          <Text style={styles.detailActionIcon}>⚙️</Text>
          <Text style={styles.detailActionText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.detailActionButton, styles.detailActionButtonDelete]}
          onPress={onDelete}
        >
          <Text style={styles.detailActionIcon}>🗑️</Text>
          <Text style={[styles.detailActionText, styles.detailActionTextDelete]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function HomeScreen({
  habits,
  todayProgress,
  completedCount,
  totalCount,
  currentQuote,
  setCurrentQuote,
  onAddPress,
  toggleHabit,
  deleteHabit,
  onEditHabit,
  onSelectHabit,
  onSignOut,
  user,
}) {
  const [allProgress, setAllProgress] = useState({});

  // Load all progress data
  useEffect(() => {
    const progressRef = ref(database, 'progress');
    const unsubscribe = onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      setAllProgress(data || {});
    });
    return () => unsubscribe();
  }, []);

  if (habits.length === 0) {
    return (
      <ScrollView style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={onAddPress} style={styles.addHeaderButton}>
            <Text style={styles.addHeaderIcon}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>No habits yet</Text>
          <Text style={styles.emptySubtext}>Add your first habit to get started!</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={onAddPress} style={styles.addHeaderButton}>
            <Text style={styles.addHeaderIcon}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Summary Card */}
      <View style={styles.progressSummaryContainer}>
        <View style={styles.progressSummaryContent}>
          <View>
            <Text style={styles.progressSummaryLabel}>Today's Progress</Text>
            <Text style={styles.progressSummaryNumber}>
              {completedCount}/{totalCount}
            </Text>
          </View>
          <View style={styles.progressSummaryCircle}>
            <View style={styles.progressCircleContent}>
              <Text style={styles.progressCirclePercent}>
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* All Habits List - Clean Layout */}
      <View style={styles.habitsListContainer}>
        <Text style={styles.habitsListTitle}>Your Habits</Text>
        {habits.map((habit) => {
          const isCompleted = todayProgress[habit.id] || false;
          
          return (
            <View
              key={habit.id}
              style={styles.habitCardWrapper}
            >
              <TouchableOpacity
                style={styles.habitCardContent}
                onPress={() => onSelectHabit(habit.id)}
                activeOpacity={0.7}
              >
                {/* Checkbox */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleHabit(habit.id);
                  }}
                  style={[
                    styles.habitCheckbox,
                    isCompleted && styles.habitCheckboxCompleted,
                  ]}
                  activeOpacity={0.8}
                >
                  {isCompleted && <Text style={styles.habitCheckmark}>✓</Text>}
                </TouchableOpacity>

                {/* Icon */}
                <Text style={styles.habitCardIcon}>{habit.icon}</Text>

                {/* Habit Info */}
                <View style={styles.habitCardInfo}>
                  <Text style={[styles.habitCardName, isCompleted && styles.habitNameCompleted]}>
                    {habit.name}
                  </Text>
                  <View style={styles.habitCardMeta}>
                    {habit.streak > 0 && (
                      <Text style={styles.habitCardStreak}>
                        🔥 {habit.streak} day streak
                      </Text>
                    )}
                    <Text style={styles.habitCardXP}>+{habit.xp} XP</Text>
                  </View>
                </View>

                {/* Chevron */}
                <Text style={styles.habitCardChevron}>→</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function HabitRow({ habit, completed, onToggle, onDelete, onEdit, onPress }) {
  return (
    <TouchableOpacity
      style={styles.habitRowWrapper}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Main Habit Card */}
      <View style={styles.habitRowCard}>
        <TouchableOpacity
          style={[styles.habitCheckbox, completed && styles.habitCheckboxCompleted]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          {completed && <Text style={styles.habitCheckmark}>✓</Text>}
        </TouchableOpacity>

        <View style={styles.habitInfo}>
          <View style={styles.habitNameRow}>
            <Text style={styles.habitIcon}>{habit.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.habitName, completed && styles.habitNameCompleted]}>
                {habit.name}
              </Text>
              {habit.streak > 0 && (
                <Text style={styles.habitStreak}>
                  🔥 {habit.streak} day streak
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.habitRight}>
          <Text style={styles.habitXP}>+{habit.xp}</Text>
        </View>
      </View>

      {/* Action Buttons - Hidden by default, shown on detail view */}
      <View style={styles.habitActions}>
        <TouchableOpacity
          onPress={onEdit}
          style={styles.actionButton}
        >
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionLabel}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          style={[styles.actionButton, styles.deleteActionButton]}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionLabel}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Mini Graph - Last 7 days */}
      <HabitMiniGraph habitId={habit.id} habitName={habit.name} />
    </TouchableOpacity>
  );
}

function HabitMiniGraph({ habitId, habitName }) {
  const [habitProgress, setHabitProgress] = useState({});

  useEffect(() => {
    const allProgressData = {};
    const daysPromises = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const progressRef = ref(database, `progress/${dateStr}/${habitId}`);
      daysPromises.push(
        new Promise((resolve) => {
          onValue(progressRef, (snapshot) => {
            allProgressData[dateStr] = snapshot.val() || false;
            resolve();
          });
        })
      );
    }

    Promise.all(daysPromises).then(() => {
      setHabitProgress(allProgressData);
    });
  }, [habitId]);

  // Build 7-day mini chart
  const last7Days = [];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayIndex = date.getDay();
    last7Days.push({
      dateStr,
      label: dayLabels[dayIndex],
      completed: habitProgress[dateStr] || false,
    });
  }

  const completedCount = last7Days.filter((d) => d.completed).length;

  return (
    <View style={styles.miniGraphContainer}>
      <View style={styles.graphHeader}>
        <Text style={styles.graphLabel}>Last 7 Days</Text>
        <Text style={styles.graphStat}>{completedCount}/7 completed</Text>
      </View>
      <View style={styles.miniGraphDays}>
        {last7Days.map((day) => (
          <View key={day.dateStr} style={styles.miniDay}>
            <View
              style={[
                styles.miniDayBox,
                day.completed
                  ? styles.miniDayCompleted
                  : styles.miniDayMissed,
              ]}
            >
              <Text style={styles.miniDayIcon}>
                {day.completed ? '✓' : '○'}
              </Text>
            </View>
            <Text style={styles.miniDayLabel}>{day.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatsScreen({ allProgress, habits }) {
  const [selectedView, setSelectedView] = useState('week');

  const getDayCompletionPercent = (dateStr) => {
    const dayData = allProgress[dateStr];
    if (!dayData) return 0;
    const completions = Object.values(dayData).filter(Boolean).length;
    return Math.round((completions / habits.length) * 100) || 0;
  };

  const getCompletionColor = (percent) => {
    if (percent === 0) return '#333';
    if (percent < 50) return '#FFB800';
    if (percent < 100) return '#7AE029';
    return '#22C55E';
  };

  const getBarHeight = (percent) => {
    const minHeight = 20;
    const maxHeight = 100;
    return minHeight + (percent / 100) * (maxHeight - minHeight);
  };

  // Last 7 days with detailed data
  const last7Days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayIndex = date.getDay();
    const percent = getDayCompletionPercent(dateStr);
    last7Days.push({
      dateStr,
      dayName: dayNames[dayIndex === 0 ? 6 : dayIndex - 1],
      label: dayLabels[dayIndex === 0 ? 6 : dayIndex - 1],
      percent,
      completed: Object.values(allProgress[dateStr] || {}).filter(Boolean).length,
      total: habits.length,
    });
  }

  // Monthly heatmap - show full calendar month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of month
  const firstDay = new Date(currentYear, currentMonth, 1);
  // Get last day of month
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Build month calendar view
  const monthCalendarDays = [];
  
  // Add empty days for days before the 1st
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  for (let i = 0; i < startingDayOfWeek; i++) {
    monthCalendarDays.push(null); // Empty cell
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    monthCalendarDays.push({
      dateStr,
      date,
      day,
      percent: getDayCompletionPercent(dateStr),
    });
  }
  
  // For backward compatibility, keep last30Days for stats calculations
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last30Days.push({
      dateStr,
      date,
      day: date.getDate(),
      percent: getDayCompletionPercent(dateStr),
    });
  }

  // Calculate stats
  const weeklyCompleted = last7Days.reduce((sum, day) => sum + day.completed, 0);
  const weeklyPerfectDays = last7Days.filter((day) => day.percent === 100).length;
  const weeklySuccessRate = Math.round(
    last7Days.reduce((sum, day) => sum + day.percent, 0) / 7
  );

  const monthlyCompleted = Object.values(allProgress).reduce(
    (sum, day) => sum + Object.values(day || {}).filter(Boolean).length,
    0
  );
  const monthlyPerfectDays = last30Days.filter((day) => day.percent === 100).length;
  const monthlySuccessRate = Math.round(
    last30Days.reduce((sum, day) => sum + day.percent, 0) / 30
  );

  // Calculate actual success rate for each habit (30-day window)
  const habitSuccessRates = habits.map((habit) => {
    let completedDays = 0;
    let totalDays = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count total days that have any habit completion (to include in calculation)
      if (allProgress[dateStr]) {
        totalDays++;
        if (allProgress[dateStr][habit.id]) {
          completedDays++;
        }
      }
    }

    const successRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      rate: successRate,
      streak: habit.streak || 0,
      completedDays,
    };
  });

  // Sort by success rate and get top 4
  const topHabits = habitSuccessRates
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 4);

  // Quick stats
  const quickStats = [
    {
      label: 'Current Streak',
      value: String(Math.max(...habits.map((h) => h.streak || 0)) || 0),
      unit: 'days',
      icon: '🔥',
      color: '#FFB800',
    },
    {
      label: 'Best Streak',
      value: '28',
      unit: 'days',
      icon: '🏆',
      color: '#FFD700',
    },
    {
      label: 'Total Completed',
      value: String(monthlyCompleted),
      unit: 'habits',
      icon: '✓',
      color: '#22C55E',
    },
    {
      label: 'Success Rate',
      value: String(monthlySuccessRate),
      unit: '%',
      icon: '🎯',
      color: '#00D4FF',
    },
  ];

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>📊 Statistics</Text>
        <Text style={styles.statsSubtitle}>Track your progress and achievements</Text>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.quickStatsGrid}>
        {quickStats.map((stat, idx) => (
          <View key={idx} style={styles.quickStatCard}>
            <Text style={styles.quickStatIcon}>{stat.icon}</Text>
            <View style={styles.quickStatContent}>
              <View style={styles.quickStatValue}>
                <Text style={[styles.quickStatNumber, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.quickStatUnit}>{stat.unit}</Text>
              </View>
              <Text style={styles.quickStatLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* View Selector */}
      <View style={styles.viewSelector}>
        <TouchableOpacity
          style={[
            styles.viewButton,
            selectedView === 'week' && styles.viewButtonActive,
          ]}
          onPress={() => setSelectedView('week')}
        >
          <Text
            style={[
              styles.viewButtonText,
              selectedView === 'week' && styles.viewButtonTextActive,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            selectedView === 'month' && styles.viewButtonActive,
          ]}
          onPress={() => setSelectedView('month')}
        >
          <Text
            style={[
              styles.viewButtonText,
              selectedView === 'month' && styles.viewButtonTextActive,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly View */}
      {selectedView === 'week' && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📅 Weekly Progress</Text>

          {/* Bar Chart */}
          <View style={styles.barChart}>
            <View style={styles.barChartArea}>
              {last7Days.map((day, idx) => (
                <View key={idx} style={styles.barWrapper}>
                  <View style={styles.barContent}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: getBarHeight(day.percent),
                          backgroundColor: getCompletionColor(day.percent),
                        },
                      ]}
                    >
                      <Text style={styles.barTooltip}>
                        {day.completed}/{day.total}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{day.label}</Text>
                  <Text style={styles.barPercent}>{day.percent}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Summary */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{weeklyCompleted}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
                {weeklyPerfectDays}
              </Text>
              <Text style={styles.summaryLabel}>Perfect Days</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#00D4FF' }]}>
                {weeklySuccessRate}%
              </Text>
              <Text style={styles.summaryLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      )}

      {/* Monthly View */}
      {selectedView === 'month' && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📆 January 2026</Text>

          {/* Heatmap Grid - 7 columns for days of week */}
          <View style={styles.heatmapGrid}>
            {monthCalendarDays.map((day, idx) => (
              day ? (
                <View
                  key={`${day.dateStr}-${idx}`}
                  style={[
                    styles.heatmapDay,
                    {
                      backgroundColor: getCompletionColor(day.percent),
                    },
                  ]}
                  title={`${day.dateStr}: ${day.percent}%`}
                >
                  <Text style={styles.heatmapDayText}>{day.day}</Text>
                </View>
              ) : (
                <View
                  key={`empty-${idx}`}
                  style={styles.heatmapDayEmpty}
                />
              )
            ))}
          </View>

          {/* Color Legend */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendLabel}>Less</Text>
            <View style={styles.legendItems}>
              <View style={[styles.legendDot, { backgroundColor: '#333' }]} />
              <View
                style={[styles.legendDot, { backgroundColor: '#FFB800' }]}
              />
              <View
                style={[styles.legendDot, { backgroundColor: '#7AE029' }]}
              />
              <View
                style={[styles.legendDot, { backgroundColor: '#22C55E' }]}
              />
            </View>
            <Text style={styles.legendLabel}>More</Text>
          </View>

          {/* Monthly Summary */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{monthlyCompleted}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
                {monthlyPerfectDays}
              </Text>
              <Text style={styles.summaryLabel}>Perfect Days</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#00D4FF' }]}>
                {monthlySuccessRate}%
              </Text>
              <Text style={styles.summaryLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      )}

      {/* Top Performing Habits */}
      <View style={styles.topHabitsContainer}>
        <Text style={styles.topHabitsTitle}>🚀 Top Performing Habits</Text>

        {topHabits.map((habit) => (
          <View key={habit.id} style={styles.habitPerformance}>
            <View style={styles.habitPerformanceLeft}>
              <Text style={styles.habitPerformanceIcon}>{habit.icon}</Text>
              <View style={styles.habitPerformanceInfo}>
                <Text style={styles.habitPerformanceName}>{habit.name}</Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${habit.rate}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
            <View style={styles.habitPerformanceRight}>
              <Text style={styles.habitPerformanceRate}>{habit.rate}%</Text>
              <View style={styles.habitStreakBadge}>
                <Text style={styles.habitStreakIcon}>🔥</Text>
                <Text style={styles.habitStreakValue}>{habit.streak}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  screen: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff006e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  addHeaderIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    borderWidth: 1.5,
    borderColor: '#ff006e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff006e',
    textShadowColor: 'rgba(255, 0, 110, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  habitCounterContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  habitCounterText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  habitNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  navArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  navArrow: {
    fontSize: 20,
    color: '#9d4edd',
    fontWeight: 'bold',
  },
  habitDisplayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e0e0e0',
    flex: 1,
    textAlign: 'center',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#16213e',
    borderWidth: 3,
    borderColor: '#ff006e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  progressLabel: {
    fontSize: 12,
    color: '#999',
  },
  progressText: {
    fontSize: 14,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  quoteCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff006e',
  },
  quoteText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  quoteRefresh: {
    color: '#9d4edd',
    fontSize: 11,
    fontWeight: '600',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 2,
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#9d4edd',
  },
  habitRowWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  habitRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2649',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  deleteActionButton: {
    borderColor: '#ff006e',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  miniGraphContainer: {
    marginTop: 8,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderBottomColor: '#9d4edd',
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9d4edd',
  },
  graphStat: {
    fontSize: 11,
    color: '#999',
  },
  miniGraphDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  miniDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  miniDayBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  miniDayCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  miniDayMissed: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  miniDayIcon: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  miniDayLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '600',
  },
  habitCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9d4edd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#0f0f1e',
  },
  habitCheckboxCompleted: {
    backgroundColor: '#ff006e',
    borderColor: '#ff006e',
  },
  habitCheckmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitIcon: {
    fontSize: 20,
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
  habitStreak: {
    fontSize: 11,
    color: '#FFD700',
    marginTop: 4,
    fontWeight: '600',
  },
  habitRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  habitXP: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff006e',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#666',
  },
  progressSummaryContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  progressSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressSummaryLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  progressSummaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  progressSummaryCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a2649',
    borderWidth: 2,
    borderColor: '#9d4edd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleContent: {
    alignItems: 'center',
  },
  progressCirclePercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  habitsListContainer: {
    marginHorizontal: 16,
  },
  habitsListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff006e',
    marginBottom: 12,
  },
  habitCardWrapper: {
    marginBottom: 12,
  },
  habitCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  habitCheckbox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  habitCheckboxCompleted: {
    backgroundColor: '#ff006e',
    borderColor: '#ff006e',
  },
  habitCheckmark: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  habitNameCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  habitCardIcon: {
    fontSize: 28,
  },
  habitCardInfo: {
    flex: 1,
  },
  habitCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  habitCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  habitCardStreak: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  habitCardXP: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  habitCardChevron: {
    fontSize: 18,
    color: '#666',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayContainer: {
    alignItems: 'center',
    gap: 8,
  },
  weekDayBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayPercent: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  weekDayLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  weekDayPercent2: {
    fontSize: 10,
    color: '#999',
  },
  monthlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  monthlyDay: {
    width: '13.33%',
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: '#999',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#0f0f1e',
    borderTopWidth: 1,
    borderTopColor: '#16213e',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 12,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 4,
  },
  navButtonActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#ff006e',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  modalClose: {
    fontSize: 24,
    color: '#999',
  },
  modalContent: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 12,
  },
  modalSubtext: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bundleButton: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#666',
  },
  bundleButtonSelected: {
    borderColor: '#ff006e',
    backgroundColor: '#1a0033',
  },
  bundleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bundleText: {
    flex: 1,
  },
  bundleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  bundleCount: {
    fontSize: 12,
    color: '#999',
  },
  bundleCheckmark: {
    fontSize: 24,
    color: '#ff006e',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#9d4edd',
    borderRadius: 12,
    padding: 14,
    color: '#e0e0e0',
    fontSize: 14,
    marginBottom: 24,
  },
  addButtonGradient: {
    borderRadius: 12,
    padding: 2,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#0f0f1e',
    borderRadius: 11,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    color: '#9d4edd',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  // New Stats Screen Styles
  statsHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff006e',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickStatCard: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#9d4edd',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  quickStatIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  quickStatContent: {
    flex: 1,
  },
  quickStatValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 2,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickStatUnit: {
    fontSize: 10,
    color: '#999',
  },
  quickStatLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  viewSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  viewButtonActive: {
    backgroundColor: '#9d4edd',
    borderColor: '#ff006e',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  viewButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 16,
  },
  barChart: {
    marginBottom: 16,
  },
  barChartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContent: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  barTooltip: {
    fontSize: 8,
    color: '#000',
    fontWeight: '600',
    opacity: 0.8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginTop: 6,
  },
  barPercent: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  heatmapDay: {
    width: '13.33%',
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 40,
  },
  heatmapDayText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heatmapDayEmpty: {
    width: '13.33%',
    aspectRatio: 1,
    borderRadius: 6,
    minWidth: 40,
    backgroundColor: 'transparent',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#9d4edd',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  topHabitsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  topHabitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 12,
  },
  habitPerformance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2649',
  },
  habitPerformanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  habitPerformanceIcon: {
    fontSize: 20,
  },
  habitPerformanceInfo: {
    flex: 1,
  },
  habitPerformanceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#0f0f1e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 3,
  },
  habitPerformanceRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  habitPerformanceRate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D4FF',
  },
  habitStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  habitStreakIcon: {
    fontSize: 12,
  },
  habitStreakValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB800',
  },
  // Habit Detail Screen Styles
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  backIcon: {
    fontSize: 20,
    color: '#ff006e',
    fontWeight: 'bold',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  detailDateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailDate: {
    fontSize: 12,
    color: '#999',
  },
  detailProgressContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  detailProgressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#16213e',
    borderWidth: 3,
    borderColor: '#ff006e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  detailProgressNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  detailProgressLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailProgressText: {
    fontSize: 13,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  detailCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailNameInput: {
    flex: 1,
    backgroundColor: '#1a2649',
    borderWidth: 1,
    borderColor: '#9d4edd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
  },
  detailEditButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  detailEditButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailCancelButton: {
    backgroundColor: '#ff006e',
    borderColor: '#ff006e',
  },
  detailCancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailEditPen: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1a2649',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  detailEditPenIcon: {
    fontSize: 16,
  },
  detailCardDivider: {
    height: 1,
    backgroundColor: '#9d4edd',
    marginVertical: 12,
  },
  detailXPRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailXPLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  detailXPValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  detailCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  detailHabitIcon: {
    fontSize: 32,
  },
  detailHabitInfo: {
    flex: 1,
  },
  detailHabitName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  detailHabitNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  detailEditIconButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1a2649',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  detailEditIcon: {
    fontSize: 12,
  },
  detailHabitStreak: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  detailXPBadge: {
    backgroundColor: '#1a2649',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ff006e',
  },
  detailXPText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff006e',
  },
  detailQuoteSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff006e',
  },
  detailQuoteText: {
    fontSize: 13,
    color: '#e0e0e0',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailQuoteSubtext: {
    fontSize: 11,
    color: '#9d4edd',
    fontWeight: '600',
  },
  detailLast7Container: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  detailLast7Header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLast7Title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff006e',
  },
  detailLast7Stat: {
    fontSize: 12,
    color: '#999',
  },
  detailLast7Grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  detailDay: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  detailDayCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  detailDayMissed: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  detailDayCheck: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailDayEmpty: {
    fontSize: 16,
    color: '#999',
  },
  detailDayLabel: {
    fontSize: 10,
    color: '#e0e0e0',
    marginTop: 2,
    fontWeight: '600',
  },
  detailActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#9d4edd',
  },
  detailActionButtonDelete: {
    borderColor: '#ff006e',
  },
  detailActionIcon: {
    fontSize: 18,
  },
  detailActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  detailActionTextDelete: {
    color: '#ff006e',
  },
});
