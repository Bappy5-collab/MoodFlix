/**
 * Emotion to YouTube search keywords mapping
 * Maps detected facial expressions to relevant video categories
 */

export type Emotion = 'happy' | 'sad' | 'neutral' | 'surprised';

export interface EmotionConfig {
  label: string;
  emoji: string;
  color: string;
  keywords: string[];
  description: string;
}

export const emotionMapping: Record<Emotion, EmotionConfig> = {
  happy: {
    label: 'Happy',
    emoji: '😊',
    color: 'var(--color-happy)',
    keywords: [
      'romantic hindi songs 2024', 'bengali romantic songs', 'bollywood romantic songs', 
      'bangla romantic songs', 'hindi love songs', 'arijit singh romantic songs',
      'bengali love songs', 'hindi romantic hits', 'bangla love songs 2024'
    ],
    description: 'You look happy! Here are romantic songs for you. 💕',
  },
  sad: {
    label: 'Sad',
    emoji: '😢',
    color: 'var(--color-sad)',
    keywords: [
      'sad hindi songs 2024', 'bengali sad songs', 'bollywood sad songs', 
      'bangla sad songs', 'hindi heartbreak songs', 'arijit singh sad songs',
      'bengali emotional songs', 'hindi sad music', 'bangla heartbreak songs'
    ],
    description: 'Feeling sad? Here are emotional songs for you. 💔',
  },
  neutral: {
    label: 'Neutral',
    emoji: '😐',
    color: 'var(--color-neutral)',
    keywords: [
      'hindi romantic songs mix', 'bengali mix songs', 'bollywood hits 2024', 
      'bangla popular songs', 'hindi top songs', 'bollywood party songs',
      'bengali trending songs', 'hindi mix playlist', 'bangla best songs'
    ],
    description: 'In a calm mood. Here are romantic & mix songs for you. 🎵',
  },
  surprised: {
    label: 'Surprised',
    emoji: '😮',
    color: 'var(--color-surprised)',
    keywords: [
      'hindi romantic songs mix', 'bengali mix songs', 'bollywood hits 2024', 
      'bangla popular songs', 'hindi top songs', 'bollywood party songs',
      'bengali trending songs', 'hindi mix playlist', 'bangla best songs'
    ],
    description: 'Here are some mix songs for you! 🎵',
  },
};

/**
 * Get a random keyword from the emotion's keyword list
 */
export function getRandomKeyword(emotion: Emotion): string {
  const keywords = emotionMapping[emotion].keywords;
  return keywords[Math.floor(Math.random() * keywords.length)];
}

/**
 * Map face-api.js expression names to our simplified emotion types
 * Only detects: happy, sad, neutral (surprised maps to neutral)
 */
export function mapExpressionToEmotion(expressions: {
  happy: number;
  sad: number;
  neutral: number;
  surprised: number;
  angry: number;
  fearful: number;
  disgusted: number;
}): Emotion {
  // Only detect happy, sad, and neutral
  // Map surprised to neutral for mix songs
  const relevantExpressions = {
    happy: expressions.happy,
    sad: expressions.sad,
    neutral: expressions.neutral + expressions.surprised, // Combine neutral and surprised
  };

  let maxEmotion: Emotion = 'neutral';
  let maxScore = 0;

  for (const [emotion, score] of Object.entries(relevantExpressions)) {
    if (score > maxScore) {
      maxScore = score;
      maxEmotion = emotion as Emotion;
    }
  }

  // If confidence is too low, default to neutral
  if (maxScore < 0.3) {
    return 'neutral';
  }

  return maxEmotion;
}

