// C2: shown on every AI output.
export const AiDisclosure = ({ className = "" }: { className?: string }) => (
  <p className={`text-[11px] font-medium text-amber-700 dark:text-amber-400 ${className}`}>
    AI-generated. The doctor must review before use.
  </p>
);
export default AiDisclosure;
