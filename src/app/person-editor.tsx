import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView } from 'react-native';

import { AppText, Button, Chip, ChipRow, TextField } from '@/components/ui';
import { checkAchievements } from '@/db/achievements';
import { archivePerson, getPerson, savePerson } from '@/db/people';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

const RELATIONSHIPS = ['Family', 'Friend', 'Spouse', 'Child', 'Parent', 'Church', 'Coworker', 'Neighbor'];

/** Sheet: add or edit someone on your prayer list. */
export default function PersonEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = id ? getPerson(Number(id)) : null;
  const { colors } = useTheme();
  const [name, setName] = useState(existing?.name ?? '');
  const [relationship, setRelationship] = useState(existing?.relationship ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <AppText variant="title2">{existing ? 'Edit Person' : 'Add to Prayer List'}</AppText>
        <TextField value={name} onChangeText={setName} placeholder="Name" autoFocus={!existing} />
        <ChipRow>
          {RELATIONSHIPS.map((r) => (
            <Chip key={r} label={r} selected={relationship === r} onPress={() => setRelationship(relationship === r ? '' : r)} />
          ))}
        </ChipRow>
        <TextField
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="How can you pray for them? (e.g. new job, healing, faith)"
          style={{ minHeight: 100 }}
        />
        <Button
          title="Save"
          disabled={!name.trim()}
          onPress={() => {
            savePerson({ name, relationship, notes }, existing?.id);
            haptics.success();
            checkAchievements();
            router.back();
          }}
        />
        {existing && (
          <Pressable
            onPress={() =>
              Alert.alert(`Remove ${existing.name}?`, 'They will be removed from your prayer list.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => {
                    archivePerson(existing.id);
                    router.back();
                  },
                },
              ])
            }
            style={{ alignItems: 'center', padding: space.sm }}>
            <AppText variant="body" color="rose">
              Remove from list
            </AppText>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
