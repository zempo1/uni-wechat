//获取当前时间
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp); // 将时间戳转换为 Date 对象
    const year = date.getFullYear();  // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份，注意要 +1，且格式化为2位数
    const day = String(date.getDate()).padStart(2, '0'); // 获取日期，格式化为2位数
    const hours = String(date.getHours()).padStart(2, '0'); // 获取小时，格式化为2位数
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟，格式化为2位数
    const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取秒，格式化为2位数

    // 拼接成目标格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//截取时间为xx前或具体日期
export function formatDate(dateStr) {
  const now = new Date();
  dateStr = dateStr.replace(" ", "T");
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};