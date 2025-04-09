export const panUpDownAnim = [
  { opacity: 0, transform: "translate(-50%, 0px)" },
  { opacity: 1, transform: "translate(-50%, -20px)", offset: 0.025 },
  { opacity: 1, transform: "translate(-50%, -20px)", offset: 0.975 },
  { opacity: 0, transform: "translate(-50%, 0px)" },
];

export const timerTransitionAnim = [
  {
    background:
      "linear-gradient(var(--color-neutral-300) 0 0) bottom/ 100% 2px no-repeat, var(--color-neutral-900)",
  },
  {
    background:
      "linear-gradient(var(--color-neutral-300) 0 0) bottom/ 0% 2px no-repeat, var(--color-neutral-900)",
  },
];
