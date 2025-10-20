export const format = () => {
  const capitalizeEachWord = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  function getJakartaTimeISO(): string {
    const now = new Date();
    const offsetMinutes = 7 * 60;
    const localTime = now.getTime() + offsetMinutes * 60 * 1000;
    return new Date(localTime).toISOString();
  }

  function formatDateToCustom(dateInput: string | Date): string {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    const tzOffset = 7 * 60; // UTC+7 dalam menit
    const localDate = new Date(date.getTime() + tzOffset * 60000);

    const year = localDate.getUTCFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(localDate.getUTCDate()).padStart(2, "0");
    const hours = String(localDate.getUTCHours()).padStart(2, "0");
    const minutes = String(localDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(localDate.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const formatDatetime = (date: Date) => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return {
    formatCurrency,
    getJakartaTimeISO,
    formatDatetime,
    formatDateToCustom,
    capitalizeEachWord,
  };
};
