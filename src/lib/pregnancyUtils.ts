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

export const calculatePregnancyWeeks = (startDate: string | null): number | null => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  const now = new Date();
  
  const diffTime = now.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (totalDays < 0) return null;
  
  return Math.floor(totalDays / 7);
};

export const getTrimester = (startDate: string | null): number | null => {
  const weeks = calculatePregnancyWeeks(startDate);
  if (weeks === null) return null;
  
  // 1st Trimester: Weeks 1-12
  // 2nd Trimester: Weeks 13-26
  // 3rd Trimester: Weeks 27-40+
  if (weeks >= 1 && weeks <= 12) return 1;
  if (weeks >= 13 && weeks <= 26) return 2;
  if (weeks >= 27) return 3;
  
  return null;
};

export const getTrimesterLabel = (trimester: number | null): string => {
  if (trimester === 1) return "1st Trimester (Week 1-12)";
  if (trimester === 2) return "2nd Trimester (Week 13-26)";
  if (trimester === 3) return "3rd Trimester (Week 27+)";
  return "Unknown";
};
