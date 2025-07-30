// Yeni zorluk seviyeleri tanımı
export const DIFFICULTY_LEVELS = {
  easy: { tables: [2, 5, 10], name: 'Kolay', color: 'bg-green-100 text-green-800', icon: '🌱' },
  medium: { tables: [3, 4, 6], name: 'Orta', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' },
  hard: { tables: [7, 8, 9], name: 'Zor', color: 'bg-red-100 text-red-800', icon: '🔥' }
};

export const getDifficultyByTable = (table: number) => {
  if (DIFFICULTY_LEVELS.easy.tables.includes(table)) return 'easy';
  if (DIFFICULTY_LEVELS.medium.tables.includes(table)) return 'medium';
  if (DIFFICULTY_LEVELS.hard.tables.includes(table)) return 'hard';
  return 'medium'; // varsayılan
};

export const getTableColor = (table: number) => {
  const difficulty = getDifficultyByTable(table);
  return DIFFICULTY_LEVELS[difficulty].color;
};

export const getDifficultyName = (table: number) => {
  const difficulty = getDifficultyByTable(table);
  return DIFFICULTY_LEVELS[difficulty].name;
};

export const getDifficultyIcon = (table: number) => {
  const difficulty = getDifficultyByTable(table);
  return DIFFICULTY_LEVELS[difficulty].icon;
};

export const getAllTables = () => {
  return [2, 3, 4, 5, 6, 7, 8, 9, 10];
};

export const getTablesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return DIFFICULTY_LEVELS[difficulty].tables;
};