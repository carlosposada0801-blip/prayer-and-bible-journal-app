import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';
import { AppState, View } from 'react-native';

import { AppText, Button, IconBadge } from '@/components/ui';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

let unlocked = false;

// Lock again whenever the app goes to the background.
AppState.addEventListener('change', (state) => {
  if (state === 'background') unlocked = false;
});

/** Unlocks with Face ID / Touch ID (or the device passcode). */
export async function authenticate(reason = 'Unlock your prayer journal') {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !enrolled) return true; // Nothing to protect with – don't lock people out.
  const result = await LocalAuthentication.authenticateAsync({ promptMessage: reason, fallbackLabel: 'Use Passcode' });
  return result.success;
}

/** Hides the Prayer tab behind Face ID when "Lock Prayer Journal" is on. */
export function LockGate({ children }: { children: React.ReactNode }) {
  const { appLock } = usePreferences();
  const { colors } = useTheme();
  const [, force] = useState(0);
  const isUnlocked = !appLock || unlocked;

  const unlock = useCallback(async () => {
    if (await authenticate()) {
      unlocked = true;
      force((n) => n + 1);
    }
  }, []);

  useEffect(() => {
    if (!isUnlocked && AppState.currentState === 'active') unlock();
    const sub = AppState.addEventListener('change', (s) => {
      // Hide prayers in the app switcher, and ask again when coming back.
      if (s === 'background') force((n) => n + 1);
      if (s === 'active' && appLock && !unlocked) unlock();
    });
    return () => sub.remove();
  }, [isUnlocked, unlock, appLock]);

  if (isUnlocked) return <>{children}</>;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, backgroundColor: colors.background, padding: space.xl }}>
      <IconBadge name="lock" tone="navy" size={72} />
      <AppText variant="title2" align="center">
        Your prayers are private
      </AppText>
      <AppText variant="callout" color="textSecondary" align="center">
        Unlock with Face ID to open your prayer journal.
      </AppText>
      <Button title="Unlock" icon="lock" onPress={unlock} />
    </View>
  );
}
