import { TabStack } from '@/components/navigation/tab-stack';
import { LockGate } from '@/components/prayer/lock-gate';

export default function Layout() {
  return (
    <LockGate>
      <TabStack title="Prayer" />
    </LockGate>
  );
}
