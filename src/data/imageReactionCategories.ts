// Template hard-coded categories for ImageReactionMinigame
// Follow the exact naming pattern for images:
// public/images/<category>/q<questionNumber>_opt<optionNumber>.jpg
// Example: public/images/anime/q3_opt2.jpg

// Interfaces match the structure you specified
export interface Option {
  image: string; // URL/path to public image
  isCorrect: boolean;
  label?: string;
}

export interface Question {
  statement: string; // fill in your statement text
  options: Option[];  // exactly 4 options
}

export interface Category {
  id: string;    // 'movies' | 'anime' | 'food'
  title: string; // display title
  questions: Question[]; // 10 questions per category
}

// NOTE: All `statement` fields are left empty for you to fill.
// All `isCorrect` flags are set to false — after you place images,
// edit the relevant option and set `isCorrect: true` for the correct image.

// Categories use lowercase folder names for the images: movies, anime, food
// This file uses the qXY filename convention but with a zero-based
// question digit to keep names two characters long (q01, q11, q92...).
// Interpretation: the first digit is the question index 0..9 (0 => first question,
// 9 => tenth question), the second digit is the option 1..4.
// Example: `q01.jpg` = question 1 (index 0) option 1. `q92.jpg` = question 10 (index 9) option 2.
export const imageReactionCategories: Category[] = [
  {
    id: 'movies',
    title: 'Movies',
    questions: [
      {
        statement: 'Which superhero snaps his fingers and erases half the universe?',
        options: [
          { image: `/images/movies/q01.jpeg`, isCorrect: true, label: 'Thanos' },
          { image: `/images/movies/q02.jpeg`, isCorrect: false },
          { image: `/images/movies/q03.jpeg`, isCorrect: false },
          { image: `/images/movies/q04.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which movie features a girl who falls down a rabbit hole into a fantasy world?',
        options: [
          { image: `/images/movies/q11.jpeg`, isCorrect: true, label: 'Alice In Wonderland' },
          { image: `/images/movies/q12.jpeg`, isCorrect: false },
          { image: `/images/movies/q13.jpeg`, isCorrect: false },
          { image: `/images/movies/q14.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which film has a lion cub being lifted on a cliff during sunrise?',
        options: [
          { image: `/images/movies/q21.jpeg`, isCorrect: false },
          { image: `/images/movies/q22.jpeg`, isCorrect: true, label: 'The Lion King' },
          { image: `/images/movies/q23.jpeg`, isCorrect: false },
          { image: `/images/movies/q24.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which movie features blue creatures living on planet Pandora?',
        options: [
          { image: `/images/movies/q31.jpeg`, isCorrect: false },
          { image: `/images/movies/q32.jpeg`, isCorrect: false },
          { image: `/images/movies/q33.jpeg`, isCorrect: false },
          { image: `/images/movies/q34.jpeg`, isCorrect: true, label: 'Avatar' }
        ]
      },
      {
        statement: 'Which movie has a character shouting “Wakanda Forever”?',
        options: [
          { image: `/images/movies/q41.jpeg`, isCorrect: false },
          { image: `/images/movies/q42.jpeg`, isCorrect: false },
          { image: `/images/movies/q43.jpeg`, isCorrect: true, label: 'Black Panther' },
          { image: `/images/movies/q44.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which character trains dragons instead of fighting them?',
        options: [
          { image: `/images/movies/q51.jpeg`, isCorrect: false },
          { image: `/images/movies/q52.jpeg`, isCorrect: true, label: 'How to train your dragon' },
          { image: `/images/movies/q53.jpeg`, isCorrect: false },
          { image: `/images/movies/q54.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Choose the pair who spend an entire series running from Vecna.',
        options: [
          { image: `/images/movies/q61.jpeg`, isCorrect: true, label: 'Eleven & Max' },
          { image: `/images/movies/q62.jpeg`, isCorrect: false },
          { image: `/images/movies/q63.jpeg`, isCorrect: false },
          { image: `/images/movies/q64.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Pick the wizard whose scar made him more recognizable than any logo.',
        options: [
          { image: `/images/movies/q71.jpeg`, isCorrect: false },
          { image: `/images/movies/q72.jpeg`, isCorrect: true, label: 'Harry Potter' },
          { image: `/images/movies/q73.jpeg`, isCorrect: false },
          { image: `/images/movies/q74.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Pick the queen who rode dragons like it was a Monday morning commute.',
        options: [
          { image: `/images/movies/q81.jpeg`, isCorrect: false },
          { image: `/images/movies/q82.jpeg`, isCorrect: false },
          { image: `/images/movies/q83.jpeg`, isCorrect: false },
          { image: `/images/movies/q84.jpeg`, isCorrect: true, label: 'Daenerys Targaryen' }
        ]
      },
      {
        statement: 'Who volunteers as tribute and instantly became a pop-culture icon?',
        options: [
          { image: `/images/movies/q91.jpeg`, isCorrect: false },
          { image: `/images/movies/q92.jpeg`, isCorrect: false },
          { image: `/images/movies/q93.jpeg`, isCorrect: true, label: 'Katniss Everdeen' },
          { image: `/images/movies/q94.jpeg`, isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'anime',
    title: 'Anime',
    questions: [
      {
        statement: 'Which character wears a mask and yells more than he breathes?',
        options: [
          { image: `/images/anime/q01.jpeg`, isCorrect: true, label: 'Inosuke' },
          { image: `/images/anime/q02.jpeg`, isCorrect: false },
          { image: `/images/anime/q03.jpeg`, isCorrect: false },
          { image: `/images/anime/q04.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which anime has a pink-haired esper who can read minds?',
        options: [
          { image: `/images/anime/q11.jpeg`, isCorrect: false },
          { image: `/images/anime/q12.jpeg`, isCorrect: false },
          { image: `/images/anime/q13.jpeg`, isCorrect: false },
          { image: `/images/anime/q14.jpeg`, isCorrect: true, label: 'Anya Forger' }
        ]
      },
      {
        statement: 'Which anime features curses, sorcerers, and a boy who eats a finger?',
        options: [
          { image: `/images/anime/q21.jpeg`, isCorrect: false },
          { image: `/images/anime/q22.jpeg`, isCorrect: false },
          { image: `/images/anime/q23.jpeg`, isCorrect: true, label: 'Jujutsu Kaisen' },
          { image: `/images/anime/q24.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which anime features a moving castle owned by a wizard?',
        options: [
          { image: `/images/anime/q31.jpeg`, isCorrect: false },
          { image: `/images/anime/q32.jpeg`, isCorrect: false },
          { image: `/images/anime/q33.jpeg`, isCorrect: false },
          { image: `/images/anime/q34.jpeg`, isCorrect: true, label: "Howl's Moving Castle" }
        ]
      },
      {
        statement: 'Which swordsman uses “Thunder Breathing: First Form”?',
        options: [
          { image: `/images/anime/q41.jpeg`, isCorrect: false },
          { image: `/images/anime/q42.jpeg`, isCorrect: false },
          { image: `/images/anime/q43.jpeg`, isCorrect: true, label: 'Zenitsu' },
          { image: `/images/anime/q44.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which anime features portals opening and monsters called “Gates”?',
        options: [
          { image: `/images/anime/q51.jpeg`, isCorrect: true, label: 'Solo Leveling' },
          { image: `/images/anime/q52.jpeg`, isCorrect: false },
          { image: `/images/anime/q53.jpeg`, isCorrect: false },
          { image: `/images/anime/q54.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which anime features a charming spy known as “Twilight”?',
        options: [
          { image: `/images/anime/q61.jpeg`, isCorrect: false },
          { image: `/images/anime/q62.jpeg`, isCorrect: false },
          { image: `/images/anime/q63.jpeg`, isCorrect: false },
          { image: `/images/anime/q64.jpeg`, isCorrect: true, label: 'Spy Family' }
        ]
      },
      {
        statement: 'Which anime follows a girl who can control the weather?',
        options: [
          { image: `/images/anime/q71.jpeg`, isCorrect: false },
          { image: `/images/anime/q72.jpeg`, isCorrect: false },
          { image: `/images/anime/q73.jpeg`, isCorrect: true, label: 'Weathering with You' },
          { image: `/images/anime/q74.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'In which anime do two teenagers switch bodies after a comet passes?',
        options: [
          { image: `/images/anime/q81.jpeg`, isCorrect: false },
          { image: `/images/anime/q82.jpeg`, isCorrect: false },
          { image: `/images/anime/q83.jpeg`, isCorrect: true, label: 'Your Name' },
          { image: `/images/anime/q84.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which sorcerer is known for his blindfold and overpowered domain expansions?',
        options: [
          { image: `/images/anime/q91.jpeg`, isCorrect: false },
          { image: `/images/anime/q92.jpeg`, isCorrect: true, label: 'Gojo Satouro' },
          { image: `/images/anime/q93.jpeg`, isCorrect: false },
          { image: `/images/anime/q94.jpeg`, isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'food',
    title: 'Food',
    questions: [
      {
        statement: 'Pick the dessert most commonly baked during Christmas in Western countries.',
        options: [
          { image: `/images/food/q01.jpeg`, isCorrect: true, label: 'Gingerbread cookie' },
          { image: `/images/food/q02.jpeg`, isCorrect: false },
          { image: `/images/food/q03.jpeg`, isCorrect: false },
          { image: `/images/food/q04.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'This food cries more than you when you cut it.',
        options: [
          { image: `/images/food/q11.jpeg`, isCorrect: true, label: 'Onion' },
          { image: `/images/food/q12.jpeg`, isCorrect: false },
          { image: `/images/food/q13.jpeg`, isCorrect: false },
          { image: `/images/food/q14.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'This drink wakes up more people than alarm clocks.',
        options: [
          { image: `/images/food/q21.jpeg`, isCorrect: false },
          { image: `/images/food/q22.jpeg`, isCorrect: false },
          { image: `/images/food/q23.jpeg`, isCorrect: true, label: 'Coffee' },
          { image: `/images/food/q24.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'You squeeze me for tears, flavor, and drama.',
        options: [
          { image: `/images/food/q31.jpeg`, isCorrect: true, label: 'Lemon' },
          { image: `/images/food/q32.jpeg`, isCorrect: false },
          { image: `/images/food/q33.jpeg`, isCorrect: false },
          { image: `/images/food/q34.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which food is Gordon Ramsay most likely to scream “IT’S RAW!” at?',
        options: [
          { image: `/images/food/q41.jpeg`, isCorrect: false },
          { image: `/images/food/q42.jpeg`, isCorrect: false },
          { image: `/images/food/q43.jpeg`, isCorrect: true, label: 'Steak' },
          { image: `/images/food/q44.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Select the chocolate bar known for the slogan “Have a break, have a…”',
        options: [
          { image: `/images/food/q51.jpeg`, isCorrect: false },
          { image: `/images/food/q52.jpeg`, isCorrect: false },
          { image: `/images/food/q53.jpeg`, isCorrect: false },
          { image: `/images/food/q54.jpeg`, isCorrect: true, label: 'Kitkat' }
        ]
      },
      {
        statement: 'Which drink became a global trend during lockdown on Instagram?',
        options: [
          { image: `/images/food/q61.jpeg`, isCorrect: true, label: 'Dalgona Coffee' },
          { image: `/images/food/q62.jpeg`, isCorrect: false },
          { image: `/images/food/q63.jpeg`, isCorrect: false },
          { image: `/images/food/q64.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Which snack is known as the universal cinema partner?',
        options: [
          { image: `/images/food/q71.jpeg`, isCorrect: false },
          { image: `/images/food/q72.jpeg`, isCorrect: false },
          { image: `/images/food/q73.jpeg`, isCorrect: false },
          { image: `/images/food/q74.jpeg`, isCorrect: true, label: 'Popcorn' }
        ]
      },
      {
        statement: 'Which dish is Japan’s most iconic comfort food often shown in anime?',
        options: [
          { image: `/images/food/q81.jpeg`, isCorrect: false },
          { image: `/images/food/q82.jpeg`, isCorrect: false },
          { image: `/images/food/q83.jpeg`, isCorrect: true },
          { image: `/images/food/q84.jpeg`, isCorrect: false }
        ]
      },
      {
        statement: 'Pick the food Italy is most protective about — people fight over pineapple on it.',
        options: [
          { image: `/images/food/q91.jpeg`, isCorrect: false },
          { image: `/images/food/q92.jpeg`, isCorrect: true, label: 'Ramen' },
          { image: `/images/food/q93.jpeg`, isCorrect: false },
          { image: `/images/food/q94.jpeg`, isCorrect: false }
        ]
      }
    ]
  }
];

// Helper example (you can paste this into an editor to mark an option correct):
// imageReactionCategories[0].questions[2].statement = 'Your statement here';
// imageReactionCategories[0].questions[2].options[1].isCorrect = true; // marks q3 option2 as correct

export default imageReactionCategories;
