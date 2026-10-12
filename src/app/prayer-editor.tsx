import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { DateField } from '@/components/ui/date-field';
import { checkAchievements } from '@/db/achievements';
import { useLive } from '@/db/live';
import { listPeople } from '@/db/people';
import { createTag, getPrayer, listTags, savePrayer } from '@/db/prayers';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** Modal: write a new prayer or edit an existing one. */
export default function PrayerEditor() {
  const params = useLocalSearchParams<{ id?: string; personId?: string; title?: string }>();
  const id = params.id ? Number(params.id) : undefined;
  const existing = id ? getPrayer(id) : null;
  const { colors } = useTheme();
  const tags = useLive(listTags, ['tags']);
  const people = useLive(listPeople, ['people']);

  const [title, setTitle] = useState(existing?.title ?? params.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [date, setDate] = useState(existing ? new Date(existing.created_at) : new Date());
  const [selected, setSelected] = useState<Set<number>>(new Set(existing?.tags.map((t) => t.id) ?? []));
  const [personId, setPersonId] = useState<number | null>(
    existing?.person_id ?? (params.personId ? Number(params.personId) : null),
  );
  const [newTag, setNewTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const toggle = (tagId: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });

  const save = () => {
    savePrayer(
      { title: title.trim() || 'Untitled prayer', body: body.trim(), createdAt: date.toISOString(), tagIds: [...selected], personId },
      id,
    );
    checkAchievements();
    haptics.success();
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg, paddingBottom: 0 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <AppText variant="body" color="textSecondary">
            Cancel
          </AppText>
        </Pressable>
        <AppText variant="headline">{id ? 'Edit Prayer' : 'New Prayer'}</AppText>
        <Pressable onPress={save} hitSlop={10} disabled={!title.trim() && !body.trim()}>
          <AppText variant="body" color="gold" weight="700" style={{ opacity: !title.trim() && !body.trim() ? 0.4 : 1 }}>
            Save
          </AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <TextField value={title} onChangeText={setTitle} placeholder="Title" autoFocus={!id} style={{ fontWeight: '600' }} />
        <TextField
          multiline
          journal
          value={body}
          onChangeText={setBody}
          placeholder="Dear Lord…"
          style={{ minHeight: 220 }}
        />
        <DateField label="Date" value={date} onChange={setDate} maximumDate={new Date()} />

        <View style={{ gap: space.sm }}>
          <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase' }}>
            Tags
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {tags.map((t) => (
              <Chip key={t.id} label={t.name} selected={selected.has(t.id)} onPress={() => toggle(t.id)} />
            ))}
            {!addingTag && <Chip label="New tag" icon="plus" onPress={() => setAddingTag(true)} />}
          </View>
          {addingTag && (
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <TextField
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="e.g. Church, Missions"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (newTag.trim()) {
                      const tagId = createTag(newTag);
                      setSelected((prev) => new Set(prev).add(tagId));
                    }
                    setNewTag('');
                    setAddingTag(false);
                  }}
                />
              </View>
              <Pressable onPress={() => setAddingTag(false)} hitSlop={8}>
                <Icon name="close" size={20} color={colors.textTertiary} />
              </Pressable>
            </View>
          )}
        </View>

        {people.length > 0 && (
          <View style={{ gap: space.sm }}>
            <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase' }}>
              Praying for
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {people.map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  icon="person"
                  selected={personId === p.id}
                  onPress={() => setPersonId(personId === p.id ? null : p.id)}
                />
              ))}
            </View>
          </View>
        )}

        <Button title={id ? 'Save Changes' : 'Save Prayer'} onPress={save} disabled={!title.trim() && !body.trim()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
