/** Study series registry (filled in by the Daily Bible Study step). */
export type StudyLessonMeta = { id: string };
export type StudySeriesMeta = { id: string; lessons: StudyLessonMeta[] };

export const STUDY_SERIES: StudySeriesMeta[] = [];
