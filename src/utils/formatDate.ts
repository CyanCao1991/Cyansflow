import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatDate = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
};

export const formatRelativeTime = (timestamp: number): string => {
  return dayjs(timestamp).fromNow();
};

export const formatDateShort = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const oneDay = 24 * 60 * 60 * 1000;
  
  if (diff < oneDay) {
    return dayjs(timestamp).format('HH:mm');
  } else if (diff < 7 * oneDay) {
    return dayjs(timestamp).format('ddd');
  } else {
    return dayjs(timestamp).format('MM-DD');
  }
};
