import { formatBytes, formatDuration, formatSpeed } from "./format.js";
import { REQUEST_COUNT, measureSequential } from "./measure.js";

const rawUrl = process.argv[2];

if (!rawUrl) {
  console.error("Укажите URL: node src/index.js https://example.com/file.jpg");
  process.exit(1);
}

let url;
try {
  url = new URL(rawUrl);
} catch {
  console.error("Некорректный URL. Нужна полная ссылка, например https://example.com/file.jpg");
  process.exit(1);
}

if (url.protocol !== "http:" && url.protocol !== "https:") {
  console.error("Поддерживаются только адреса http:// и https://");
  process.exit(1);
}

try {
  const result = await measureSequential(url.href, REQUEST_COUNT, {
    onStart(index, count) {
      console.log(`Запрос ${index}/${count}...`);
    },
    onSample(sample) {
      console.log(`  готово: ${formatBytes(sample.bytes)} за ${formatDuration(sample.durationMs)}`);
    },
  });

  console.log("");
  console.log(`URL: ${result.url}`);
  console.log(`Запросов: ${result.count} (последовательно)`);
  console.log(`Среднее время запроса: ${formatDuration(result.averageMs)}`);
  console.log(`Общее время: ${formatDuration(result.totalMs)}`);
  console.log(`Общий объём: ${formatBytes(result.totalBytes)}`);
  console.log(`Скорость скачивания: ${formatSpeed(result.bitsPerSecond)}`);
} catch (error) {
  const where = error.requestNumber
    ? `Запрос ${error.requestNumber} из ${REQUEST_COUNT} не выполнен. `
    : "";
  console.error(`${where}${error.message}`);
  process.exit(1);
}
