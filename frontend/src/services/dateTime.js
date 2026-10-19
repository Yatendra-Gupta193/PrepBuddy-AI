export function localDateTimeToISO(date, time) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || "");
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time || "");
  if (!dateMatch || !timeMatch) {
    throw new Error("Enter a valid date and time.");
  }

  const [, year, month, day] = dateMatch.map(Number);
  const [, hour, minute] = timeMatch.map(Number);
  const localDate = new Date(year, month - 1, day, hour, minute);
  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day ||
    localDate.getHours() !== hour ||
    localDate.getMinutes() !== minute
  ) {
    throw new Error("Enter a valid local date and time.");
  }
  return localDate.toISOString();
}

export function toLocalDateTimeInput(value) {
  if (!value) return { date: "", time: "" };
  const dateOnly = /^(\d{4}-\d{2}-\d{2})$/.exec(value);
  if (dateOnly) return { date: dateOnly[1], time: "" };

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: "", time: "" };
  return {
    date: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`,
    time: `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`,
  };
}
