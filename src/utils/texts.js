export const TASK_INPUT_PLACEHOLDERS = [
  "Enter the task you want to focus on.",
  "What would you like to complete?",
  "What's your next priority?",
  "Set the task you'll work on now.",
  "What’s the goal for this session?",
  "Focus time! What’s on your list?",
  "Time to be productive — what’s the target?",
  "What’s the task you’re tackling?",
  "Eat that frog.",
  "What task would you like to achieve?",
  "What do you want to get done?",
  "Which task will you work on?",
  "What’s the next thing to complete?",
  "Name the task for this session.",
  "What’s your current focus?",
  "What needs your attention?",
];

export const START_BUTTON_LABELS = ["Start"];
export const PAUSE_BUTTON_LABELS = ["Pause"];
export const RESET_BUTTON_LABELS = ["Reset timer"];
export const SKIP_BUTTON_LABELS = ["Skip break"];

export const BREAK_STATE_LABELS = {
  short: ["S H O R T  B R E A K"],
  long: ["L O N G  B R E A K"],
};

export const MODE_LABELS = { focus: ["F O C U S"] };

export const COMPLETION_MESSAGES = {
  focus: [
    "Focus complete! Time for a break.",
    "Well done! Break time now.",
    "Session finished — enjoy your break.",
    "You did it! Take a breather.",
    "Great work! Take a moment to rest.",
    "Task done. Recharge during your break.",
    "Focus session complete. Relax for a bit.",
    "You stayed on track. Enjoy your pause.",
    "Task finished — enjoy your downtime.",
    "Nicely done! Time to unwind a little.",
  ],
  break: [
    "Break over! Back to focus.",
    "Time to get back to work.",
    "Break's up — let's go!",
    "Break’s done. Let’s dive back in.",
    "Rest is over, time to refocus.",
    "Hope you refreshed—let’s get back to it.",
    "Break finished. Let’s keep the momentum going.",
    "Back to business. You’ve got this."
  ],
};

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}


