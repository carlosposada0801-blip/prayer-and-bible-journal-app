import { withEntitlementsPlist, type ConfigPlugin } from 'expo/config-plugins';
import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Builds on app.json. Set FREE_APPLE_ID=1 to build with a free Apple ID in
 * Xcode (no paid developer account). Free accounts can't sign push
 * notifications or app groups, so this mode:
 *   - leaves out the widgets (they need an app group)
 *   - removes the push entitlement (Abide only uses local reminders, which still work)
 * See docs/XCODE_FREE.md.
 */
const freeAppleId = process.env.FREE_APPLE_ID === '1';

const withoutPushEntitlement: ConfigPlugin = (config) =>
  withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  if (!freeAppleId) return { ...base, extra: { ...base.extra, widgets: true } };

  const plugins = (base.plugins ?? []).filter((p) => (Array.isArray(p) ? p[0] : p) !== 'expo-widgets');
  return withoutPushEntitlement({ ...base, plugins, extra: { ...base.extra, widgets: false } });
};
