import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({
  email,
  setEmail,
  password,
  setPassword,
  onAuth,
  isSignUp,
  setIsSignUp,
  authError,
  authLoading,
}) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f1e', '#1a1a2e']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo / Title Area */}
            <View style={styles.logoSection}>
              <Text style={styles.logo}>✨</Text>
              <Text style={styles.title}>Habit Tracker</Text>
              <Text style={styles.subtitle}>
                Build better habits, level up your life
              </Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>⭐</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Earn XP & Levels</Text>
                  <Text style={styles.featureDesc}>Get rewarded for consistency</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>🔥</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Build Streaks</Text>
                  <Text style={styles.featureDesc}>Don't break the chain</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>📊</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Track Progress</Text>
                  <Text style={styles.featureDesc}>See your improvements</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>🎯</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Stay Motivated</Text>
                  <Text style={styles.featureDesc}>Weekly insights & stats</Text>
                </View>
              </View>
            </View>

            {/* Auth Section */}
            <View style={styles.authSection}>
              <Text style={styles.authTitle}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>

              {/* Email Input */}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!authLoading}
              />

              {/* Password Input */}
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!authLoading}
              />

              {/* Error Message */}
              {authError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}

              {/* Auth Button */}
              <TouchableOpacity
                style={[styles.authButton, authLoading && styles.authButtonDisabled]}
                onPress={onAuth}
                disabled={authLoading || !email || !password}
              >
                {authLoading ? (
                  <ActivityIndicator color="#0f0f1e" size="small" />
                ) : (
                  <Text style={styles.authButtonText}>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Sign Up / Sign In */}
              <View style={styles.toggleSection}>
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError('');
                  }}
                  disabled={authLoading}
                >
                  <Text style={styles.toggleButton}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.disclaimer}>
                Your habits are private and secure. We store your data in Firebase.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  featuresSection: {
    marginVertical: 30,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  featureDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  authSection: {
    gap: 12,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#ff6666',
    fontSize: 13,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  authButtonDisabled: {
    opacity: 0.5,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  toggleText: {
    color: '#999',
    fontSize: 14,
  },
  toggleButton: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
