import { useState, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View, Text, TouchableOpacity, TextInput,
  ScrollView, StyleSheet, SafeAreaView,
  StatusBar, Animated, Dimensions, Image,
} from 'react-native';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

const COLORS = {
  yellow: '#fceea4',
  cream: '#fffcfd',
  darkYellow: '#e8c100',
  ink: '#1a1a2e',
  muted: '#8a8a9a',
  border: '#e8e4d8',
  soft: '#f0ede8',
};

const LOCKABLE_APPS = [
  { name: 'Instagram', icon: 'https://www.instagram.com/favicon.ico' },
  { name: 'TikTok', icon: 'https://www.tiktok.com/favicon.ico' },
  { name: 'YouTube', icon: 'https://www.youtube.com/favicon.ico' },
  { name: 'Netflix', icon: 'https://www.netflix.com/favicon.ico' },
  { name: 'Spotify', icon: 'https://www.spotify.com/favicon.ico' },
  { name: 'Twitter', icon: 'https://www.x.com/favicon.ico' },
  { name: 'Snapchat', icon: 'https://www.snapchat.com/favicon.ico' },
  { name: 'Reddit', icon: 'https://www.reddit.com/favicon.ico' },
  { name: 'WhatsApp', icon: 'https://www.whatsapp.com/favicon.ico' },
  { name: 'Discord', icon: 'https://www.discord.com/favicon.ico' },
  { name: 'Facebook', icon: 'https://www.facebook.com/favicon.ico' },
  { name: 'Uber Eats', icon: 'https://www.ubereats.com/favicon.ico' },
  { name: 'DoorDash', icon: 'https://www.doordash.com/favicon.ico' },
  { name: 'Twitch', icon: 'https://www.twitch.tv/favicon.ico' },
  { name: 'BeReal', icon: 'https://bereal.com/favicon.ico' },
  { name: 'Pinterest', icon: 'https://www.pinterest.com/favicon.ico' },
];

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [tasks, setTasks] = useState([]);
  const [lockedApps, setLockedApps] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [newPriority, setNewPriority] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 800, useNativeDriver: true,
    }).start();
  }, [screen]);

  const fadeToScreen = (nextScreen) => {
    Animated.timing(fadeAnim, {
      toValue: 0, duration: 300, useNativeDriver: true,
    }).start(() => {
      setScreen(nextScreen);
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }).start();
    });
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.spring(sidebarAnim, {
        toValue: 0, useNativeDriver: true, tension: 65, friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.spring(sidebarAnim, {
        toValue: -SIDEBAR_WIDTH, useNativeDriver: true, tension: 65, friction: 11,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0, duration: 300, useNativeDriver: true,
      }),
    ]).start(() => setSidebarOpen(false));
  };

  const toggleLockedApp = (appName) => {
    if (remaining > 0) return;
    setLockedApps(prev =>
      prev.includes(appName) ? prev.filter(a => a !== appName) : [...prev, appName]
    );
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(),
      title: newTitle,
      about: newAbout,
      priority: newPriority,
      done: false,
    }]);
    setNewTitle('');
    setNewAbout('');
    setNewPriority(false);
  };

  const addTaskAndContinue = () => {
    if (!newTitle.trim()) return;
    setTasks([{
      id: Date.now(),
      title: newTitle,
      about: newAbout,
      priority: newPriority,
      done: false,
    }]);
    setNewTitle('');
    setNewAbout('');
    setNewPriority(false);
    fadeToScreen('selectApps');
  };

  const toggleDone = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task.done) {
      setCompletingTask(id);
      fadeToScreen('completion');
    }
  };

  const handleConfirm = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Camera permission is needed to prove task completion!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, quality: 0.7,
    });
    if (!result.canceled) {
      const updatedTasks = tasks.map(t =>
        t.id === completingTask
          ? { ...t, done: true, photo: result.assets[0].uri }
          : t
      );
      setTasks(updatedTasks);
      const allDone = updatedTasks.every(t => t.done);
      if (allDone) {
        fadeToScreen('allDone');
      } else {
        fadeToScreen('congrats');
        setTimeout(() => fadeToScreen('list'), 2500);
      }
    }
  };

  const remaining = tasks.filter(t => !t.done).length;
  const allDone = remaining === 0 && tasks.length > 0;
  const activeTasks = tasks.filter(t => !t.done);

  // ── WELCOME ───────────────────────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <Animated.View style={[styles.welcome, { opacity: fadeAnim }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTag}>productivity, enforced.</Text>
          <Text style={styles.welcomeTitle}>nudge.</Text>
          <Text style={styles.welcomeSub}>
            Lock your favourite apps until your to-do list is completely done. No excuses.
          </Text>
          <View style={styles.welcomeAppRow}>
            {LOCKABLE_APPS.slice(0, 6).map(app => (
              <Image
                key={app.name}
                source={{ uri: app.icon }}
                style={styles.welcomeAppIcon}
              />
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.welcomeBtn} onPress={() => fadeToScreen('onboardTask')}>
          <Text style={styles.welcomeBtnText}>Get Started →</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── ONBOARD: CREATE FIRST TASK ────────────────────────────────────────────
  if (screen === 'onboardTask') {
    return (
      <Animated.View style={[{ flex: 1, backgroundColor: COLORS.cream }, { opacity: fadeAnim }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" />
          <ScrollView contentContainerStyle={styles.onboardContainer}>
            <Text style={styles.onboardStep}>Step 1 of 2</Text>
            <Text style={styles.onboardTitle}>What do you need to get done?</Text>
            <Text style={styles.onboardSub}>Add your first task. You can add more later.</Text>

            <Text style={styles.label}>TASK TITLE</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="e.g. Morning Run"
              placeholderTextColor={COLORS.muted}
              autoFocus
            />

            <Text style={styles.label}>PROOF HINT</Text>
            <TextInput
              style={styles.input}
              value={newAbout}
              onChangeText={setNewAbout}
              placeholder="What should the photo show?"
              placeholderTextColor={COLORS.muted}
            />

            <View style={styles.priorityRow}>
              <Text style={styles.label}>PRIORITY TASK</Text>
              <TouchableOpacity onPress={() => setNewPriority(!newPriority)}>
                <Text style={{ fontSize: 28, color: newPriority ? COLORS.darkYellow : COLORS.border }}>★</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.addBtn, !newTitle.trim() && styles.addBtnDisabled]}
              onPress={addTaskAndContinue}
              disabled={!newTitle.trim()}
            >
              <Text style={styles.addBtnText}>Next: Choose Apps →</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    );
  }

  // ── ONBOARD: SELECT APPS ──────────────────────────────────────────────────
  if (screen === 'selectApps') {
    return (
      <Animated.View style={[{ flex: 1, backgroundColor: COLORS.cream }, { opacity: fadeAnim }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.onboardHeader}>
            <TouchableOpacity onPress={() => fadeToScreen('onboardTask')}>
              <Text style={styles.backBtn}>← back</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 28, paddingBottom: 16 }}>
            <Text style={styles.onboardStep}>Step 2 of 2</Text>
            <Text style={styles.onboardTitle}>Which apps should be locked?</Text>
            <Text style={styles.onboardSub}>
              These stay locked until every task is complete.
            </Text>
          </View>
          <ScrollView contentContainerStyle={styles.appGridContainer}>
            {LOCKABLE_APPS.map(app => {
              const selected = lockedApps.includes(app.name);
              return (
                <TouchableOpacity
                  key={app.name}
                  style={[styles.appGridItem, selected && styles.appGridItemSelected]}
                  onPress={() => setLockedApps(prev =>
                    prev.includes(app.name)
                      ? prev.filter(a => a !== app.name)
                      : [...prev, app.name]
                  )}
                >
                  <Image source={{ uri: app.icon }} style={styles.appGridIcon} />
                  <Text style={[styles.appGridName, selected && styles.appGridNameSelected]}>
                    {app.name}
                  </Text>
                  {selected && (
                    <View style={styles.appGridCheckBadge}>
                      <Text style={styles.appGridCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.selectAppsFooter}>
            <Text style={styles.selectedCount}>
              {lockedApps.length} app{lockedApps.length !== 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, lockedApps.length === 0 && styles.addBtnDisabled]}
              onPress={() => fadeToScreen('list')}
              disabled={lockedApps.length === 0}
            >
              <Text style={styles.addBtnText}>Start Working →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  // ── ALL DONE ──────────────────────────────────────────────────────────────
  if (screen === 'allDone') {
    return (
      <Animated.View style={[styles.allDoneScreen, { opacity: fadeAnim }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.allDoneEmoji}>🔓</Text>
        <Text style={styles.allDoneTitle}>All done!</Text>
        <Text style={styles.allDoneSub}>
          Your apps are unlocked.{'\n'}You earned it.
        </Text>
        <View style={styles.welcomeAppRow}>
          {lockedApps.map(name => {
            const app = LOCKABLE_APPS.find(a => a.name === name);
            return app ? (
              <Image key={name} source={{ uri: app.icon }} style={styles.welcomeAppIcon} />
            ) : null;
          })}
        </View>
        <TouchableOpacity
          style={styles.allDoneBtn}
          onPress={() => {
            setTasks([]);
            fadeToScreen('onboardTask');
          }}
        >
          <Text style={styles.allDoneBtnText}>Start a New List</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── CONGRATS ──────────────────────────────────────────────────────────────
  if (screen === 'congrats') {
    return (
      <Animated.View style={[styles.congrats, { opacity: fadeAnim }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.congratsStar}>✦</Text>
        <Text style={styles.congratsTitle}>Nice work!</Text>
        <Text style={styles.congratsSub}>
          {remaining - 1} task{remaining - 1 !== 1 ? 's' : ''} left until your apps unlock.
        </Text>
      </Animated.View>
    );
  }

  // ── COMPLETION / CAMERA ───────────────────────────────────────────────────
  if (screen === 'completion') {
    const task = tasks.find(t => t.id === completingTask);
    return (
      <Animated.View style={[styles.completionScreen, { opacity: fadeAnim }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.completionBox}>
          <Text style={styles.completionTitle}>Prove it! 📸</Text>
          <Text style={styles.completionSub}>"{task?.about}"</Text>
          <TouchableOpacity style={styles.cameraBox} onPress={handleConfirm}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraLabel}>tap to open camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Open Camera ✓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fadeToScreen('list')}>
            <Text style={styles.cancelText}>cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ── ADD TASK ──────────────────────────────────────────────────────────────
  if (screen === 'add') {
    return (
      <Animated.View style={[{ flex: 1, backgroundColor: COLORS.cream }, { opacity: fadeAnim }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => fadeToScreen('list')}>
              <Text style={styles.backBtn}>← back</Text>
            </TouchableOpacity>
            <Text style={styles.appName}>new task</Text>
          </View>
          <ScrollView contentContainerStyle={styles.form}>
            <Text style={styles.label}>TITLE</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="What needs doing?"
              placeholderTextColor={COLORS.muted}
              autoFocus
            />
            <Text style={styles.label}>PROOF HINT</Text>
            <TextInput
              style={styles.input}
              value={newAbout}
              onChangeText={setNewAbout}
              placeholder="What should the photo show?"
              placeholderTextColor={COLORS.muted}
            />
            <View style={styles.priorityRow}>
              <Text style={styles.label}>PRIORITY</Text>
              <TouchableOpacity onPress={() => setNewPriority(!newPriority)}>
                <Text style={{ fontSize: 28, color: newPriority ? COLORS.darkYellow : COLORS.border }}>★</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => { addTask(); fadeToScreen('list'); }}
            >
              <Text style={styles.addBtnText}>Add Task</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    );
  }

  // ── MAIN LIST ─────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" />

        {/* SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeSidebar} />
          </Animated.View>
        )}

        {/* SIDEBAR */}
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>nudge.</Text>
              <Text style={styles.sidebarSub}>locked apps</Text>
            </View>

            <View style={styles.sidebarLockStatus}>
              <Text style={styles.lockStatusIcon}>{allDone ? '🔓' : '🔒'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.lockStatusText}>
                  {allDone
                    ? 'All Unlocked!'
                    : `${lockedApps.length} app${lockedApps.length !== 1 ? 's' : ''} locked`}
                </Text>
                <Text style={styles.lockStatusSub}>
                  {allDone
                    ? 'Great work!'
                    : `Complete ${remaining} task${remaining !== 1 ? 's' : ''} to unlock`}
                </Text>
              </View>
            </View>

            {remaining > 0 && (
              <View style={styles.sidebarLockedNotice}>
                <Text style={styles.sidebarLockedNoticeText}>
                  🔒 Complete all tasks to edit your blocked apps
                </Text>
              </View>
            )}

            <Text style={styles.sidebarSectionLabel}>YOUR BLOCKED APPS</Text>
            <ScrollView style={styles.sidebarList}>
              {LOCKABLE_APPS.map(app => {
                const isLocked = lockedApps.includes(app.name);
                const canToggle = remaining === 0;
                return (
                  <TouchableOpacity
                    key={app.name}
                    style={[
                      styles.sidebarAppRow,
                      isLocked && styles.sidebarAppRowActive,
                    ]}
                    onPress={() => toggleLockedApp(app.name)}
                    activeOpacity={canToggle ? 0.7 : 1}
                  >
                    <Image
                      source={{ uri: app.icon }}
                      style={[styles.sidebarAppIcon, !canToggle && { opacity: 0.4 }]}
                    />
                    <Text style={[
                      styles.sidebarAppName,
                      isLocked && styles.sidebarAppNameActive,
                      !canToggle && { opacity: 0.4 },
                    ]}>
                      {app.name}
                    </Text>
                    <View style={[
                      styles.sidebarToggle,
                      isLocked && styles.sidebarToggleActive,
                      !canToggle && { opacity: 0.3 },
                    ]}>
                      <Text style={styles.sidebarToggleText}>{isLocked ? '✓' : '○'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.sidebarCloseBtn} onPress={closeSidebar}>
              <Text style={styles.sidebarCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.appName}>nudge.</Text>
            <Text style={styles.headerSub}>
              {remaining} task{remaining !== 1 ? 's' : ''} left
            </Text>
          </View>
          <View style={styles.logoBox}>
            <Text style={styles.logoStar}>✦</Text>
          </View>
        </View>

        {/* LOCKED APPS BANNER */}
        {lockedApps.length > 0 && !allDone && (
          <TouchableOpacity style={styles.lockedBanner} onPress={openSidebar}>
            <Text style={styles.lockedBannerIcon}>🔒</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={styles.lockedBannerIcons}>
                {lockedApps.map(name => {
                  const app = LOCKABLE_APPS.find(a => a.name === name);
                  return app ? (
                    <Image
                      key={name}
                      source={{ uri: app.icon }}
                      style={styles.bannerAppIcon}
                    />
                  ) : null;
                })}
              </View>
            </ScrollView>
            <Text style={styles.lockedBannerEdit}>manage</Text>
          </TouchableOpacity>
        )}

        {allDone && tasks.length > 0 && (
          <View style={styles.unlockedBanner}>
            <Text style={styles.lockedBannerIcon}>🔓</Text>
            <Text style={[styles.lockedBannerText, { color: '#4caf84' }]}>
              All apps unlocked — great work!
            </Text>
          </View>
        )}

        {/* TASK LIST */}
        <ScrollView style={styles.list} contentContainerStyle={{ padding: 16 }}>
          {activeTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✦</Text>
              <Text style={styles.emptyTitle}>All clear!</Text>
              <Text style={styles.emptySub}>Add a new task to get started.</Text>
            </View>
          )}
          {activeTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                { borderLeftColor: task.priority ? COLORS.darkYellow : 'transparent' }
              ]}
              onPress={() => toggleDone(task.id)}
              activeOpacity={0.85}
            >
              <View style={styles.checkbox}>
                <Text style={{ color: COLORS.border, fontSize: 11 }}>○</Text>
              </View>
              <View style={styles.taskText}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskAbout}>{task.about}</Text>
              </View>
              {task.priority && <Text style={styles.star}>★</Text>}
              <Text style={styles.taskArrow}>📷</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => fadeToScreen('add')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    flex: 1, backgroundColor: COLORS.ink,
    justifyContent: 'space-between',
    paddingBottom: 48, paddingTop: 80, paddingHorizontal: 32,
  },
  welcomeContent: { flex: 1, justifyContent: 'center' },
  welcomeTag: {
    fontSize: 12, color: COLORS.darkYellow,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 72, fontWeight: '900',
    color: COLORS.yellow, letterSpacing: -2, lineHeight: 76,
  },
  welcomeSub: {
    fontSize: 16, color: '#6a6a8a',
    lineHeight: 26, marginTop: 20, marginBottom: 28,
  },
  welcomeAppRow: {
    flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8,
  },
  welcomeAppIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#2a2a3e',
  },
  welcomeBtn: {
    backgroundColor: COLORS.yellow,
    borderRadius: 16, padding: 18, alignItems: 'center',
  },
  welcomeBtnText: {
    fontSize: 16, fontWeight: '700', color: COLORS.ink,
  },
  onboardContainer: { padding: 28, paddingTop: 12 },
  onboardHeader: { paddingHorizontal: 28, paddingTop: 16 },
  onboardStep: {
    fontSize: 11, color: COLORS.muted,
    letterSpacing: 2, marginBottom: 8,
  },
  onboardTitle: {
    fontSize: 26, fontWeight: '800',
    color: COLORS.ink, marginBottom: 8, lineHeight: 32,
  },
  onboardSub: {
    fontSize: 14, color: COLORS.muted,
    marginBottom: 28, lineHeight: 20,
  },
  appGridContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingBottom: 16, gap: 10,
  },
  appGridItem: {
    width: (width - 52) / 3,
    padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: '#fff', alignItems: 'center', gap: 8,
    position: 'relative',
  },
  appGridItemSelected: {
    borderColor: COLORS.darkYellow, backgroundColor: '#fffbe6',
  },
  appGridIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: COLORS.soft,
  },
  appGridName: {
    fontSize: 11, color: COLORS.muted, textAlign: 'center',
  },
  appGridNameSelected: { color: COLORS.ink, fontWeight: '600' },
  appGridCheckBadge: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.darkYellow,
    alignItems: 'center', justifyContent: 'center',
  },
  appGridCheck: { fontSize: 10, color: COLORS.ink, fontWeight: '900' },
  selectAppsFooter: {
    padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  selectedCount: {
    fontSize: 12, color: COLORS.muted,
    textAlign: 'center', marginBottom: 12,
  },
  screen: { flex: 1, backgroundColor: COLORS.cream },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10,
  },
  sidebar: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: SIDEBAR_WIDTH, backgroundColor: COLORS.ink,
    zIndex: 20, elevation: 20,
  },
  sidebarHeader: {
    padding: 24, paddingTop: 20,
    borderBottomWidth: 1, borderBottomColor: '#2a2a3e',
  },
  sidebarTitle: {
    fontSize: 32, fontWeight: '900',
    color: COLORS.yellow, letterSpacing: -1,
  },
  sidebarSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  sidebarLockStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, margin: 16, borderRadius: 14,
    backgroundColor: '#2a2a3e',
  },
  lockStatusIcon: { fontSize: 24 },
  lockStatusText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  lockStatusSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  sidebarLockedNotice: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#2a2a3e', borderRadius: 10, padding: 10,
  },
  sidebarLockedNoticeText: {
    fontSize: 12, color: COLORS.muted, textAlign: 'center',
  },
  sidebarSectionLabel: {
    fontSize: 10, color: '#3a3a5a',
    letterSpacing: 2, paddingHorizontal: 16, marginBottom: 8,
  },
  sidebarList: { flex: 1, paddingHorizontal: 12 },
  sidebarAppRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 12, borderRadius: 12, marginBottom: 4,
  },
  sidebarAppRowActive: { backgroundColor: '#2a2a3e' },
  sidebarAppIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#2a2a3e',
  },
  sidebarAppName: { flex: 1, fontSize: 14, color: '#5a5a7a' },
  sidebarAppNameActive: { color: '#fff', fontWeight: '600' },
  sidebarToggle: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a1a2e',
  },
  sidebarToggleActive: { backgroundColor: COLORS.darkYellow },
  sidebarToggleText: { fontSize: 13, color: '#fff' },
  sidebarCloseBtn: {
    margin: 16, backgroundColor: COLORS.darkYellow,
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  sidebarCloseBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.ink },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 20, paddingTop: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  menuBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 18, color: COLORS.yellow },
  logoBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.yellow,
    alignItems: 'center', justifyContent: 'center',
  },
  logoStar: { fontSize: 18, color: COLORS.ink, fontWeight: '900' },
  appName: { fontSize: 20, fontWeight: '700', color: COLORS.ink },
  headerSub: { fontSize: 11, color: COLORS.muted },
  backBtn: { fontSize: 13, color: COLORS.muted, marginRight: 8 },
  lockedBanner: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, backgroundColor: '#f0ede4',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  unlockedBanner: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, backgroundColor: '#edf7f0',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  lockedBannerIcons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  bannerAppIcon: {
    width: 26, height: 26, borderRadius: 6,
    backgroundColor: COLORS.soft,
  },
  lockedBannerIcon: { fontSize: 14 },
  lockedBannerText: { fontSize: 12, color: COLORS.muted, flex: 1 },
  lockedBannerEdit: {
    fontSize: 11, color: COLORS.muted, textDecorationLine: 'underline',
  },
  list: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 40, color: COLORS.darkYellow },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: COLORS.ink },
  emptySub: { fontSize: 14, color: COLORS.muted },
  taskCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderLeftWidth: 3,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 8, elevation: 2, marginBottom: 10,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 7,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  taskText: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: COLORS.ink },
  taskAbout: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  taskArrow: { fontSize: 16 },
  star: { fontSize: 16, color: COLORS.darkYellow },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.ink,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
  fabText: { fontSize: 28, color: COLORS.yellow, lineHeight: 32 },
  form: { padding: 24, gap: 8 },
  label: { fontSize: 11, color: COLORS.muted, letterSpacing: 1, marginBottom: 4 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 10, padding: 12, fontSize: 14,
    color: COLORS.ink, backgroundColor: '#fff', marginBottom: 12,
  },
  priorityRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  addBtn: {
    backgroundColor: COLORS.ink, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  addBtnDisabled: { backgroundColor: COLORS.border },
  addBtnText: { color: COLORS.yellow, fontSize: 14, fontWeight: '600' },
  completionScreen: {
    flex: 1, backgroundColor: COLORS.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  completionBox: {
    width: '85%', backgroundColor: COLORS.cream,
    borderRadius: 24, padding: 28, alignItems: 'center', gap: 16,
  },
  completionTitle: { fontSize: 24, fontWeight: '700', color: COLORS.ink },
  completionSub: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  cameraBox: {
    width: '100%', height: 140, borderRadius: 16,
    borderWidth: 2, borderColor: COLORS.border,
    borderStyle: 'dashed', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#fafaf8',
  },
  cameraIcon: { fontSize: 36 },
  cameraLabel: { fontSize: 12, color: COLORS.muted, marginTop: 8 },
  confirmBtn: {
    width: '100%', backgroundColor: COLORS.darkYellow,
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  confirmBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.ink },
  cancelText: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  congrats: {
    flex: 1, backgroundColor: COLORS.yellow,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  congratsStar: { fontSize: 48, color: COLORS.darkYellow, marginBottom: 16 },
  congratsTitle: { fontSize: 38, fontWeight: '900', color: COLORS.ink, marginBottom: 12 },
  congratsSub: { fontSize: 14, color: COLORS.ink, textAlign: 'center', lineHeight: 22 },
  allDoneScreen: {
    flex: 1, backgroundColor: COLORS.yellow,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  allDoneEmoji: { fontSize: 64, marginBottom: 16 },
  allDoneTitle: { fontSize: 42, fontWeight: '900', color: COLORS.ink, marginBottom: 12 },
  allDoneSub: {
    fontSize: 15, color: COLORS.ink,
    textAlign: 'center', lineHeight: 24, marginBottom: 24,
  },
  allDoneBtn: {
    backgroundColor: COLORS.ink, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14, marginTop: 16,
  },
  allDoneBtnText: { color: COLORS.yellow, fontSize: 14, fontWeight: '700' },
});

