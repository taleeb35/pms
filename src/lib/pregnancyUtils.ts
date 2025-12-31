// Utility functions for pregnancy tracking

export const calculatePregnancyDuration = (startDate: string | null): string | null => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  const now = new Date();
  
  // Calculate total days
  const diffTime = now.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (totalDays < 0) return null;
  
  // Calculate total weeks only
  const weeks = Math.floor(totalDays / 7);
  
  return `${weeks} week${weeks !== 1 ? 's' : ''}`;
};

export const calculateExpectedDueDate = (startDate: string | null): Date | null => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  // Pregnancy duration is typically 280 days (40 weeks)
  const dueDate = new Date(start);
  dueDate.setDate(dueDate.getDate() + 280);
  
  return dueDate;
};
