export function formatBirr(amount: number) {
  return `${amount.toLocaleString("en-US")} Birr`;
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Addis_Ababa",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}