/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu
 * @param {string} str - Chuỗi cần chuyển đổi
 * @returns {string} - Chuỗi không dấu
 */
export const removeVietnameseTones = (str) => {
  if (!str) return "";

  const vietnameseMap = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  return str.replace(/./g, (char) => vietnameseMap[char] || char);
};

/**
 * So sánh chuỗi tiếng Việt không phân biệt dấu
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {string} text - Văn bản cần tìm kiếm
 * @returns {boolean} - True nếu tìm thấy
 */
export const searchVietnamese = (searchTerm, text) => {
  if (!searchTerm || !text) return true;

  const normalizedSearchTerm = removeVietnameseTones(
    searchTerm.toLowerCase().trim()
  );
  const normalizedText = removeVietnameseTones(text.toLowerCase());

  return normalizedText.includes(normalizedSearchTerm);
};

/**
 * Highlight từ khóa trong text tiếng Việt (không phân biệt dấu)
 * @param {string} text - Văn bản gốc
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @returns {Array} - Mảng các phần text để render
 */
export const highlightVietnameseText = (text, searchTerm) => {
  if (!searchTerm || !text) return [text];

  const normalizedSearchTerm = removeVietnameseTones(
    searchTerm.toLowerCase().trim()
  );
  const normalizedText = removeVietnameseTones(text.toLowerCase());

  const index = normalizedText.indexOf(normalizedSearchTerm);
  if (index === -1) return [text];

  const beforeMatch = text.substring(0, index);
  const match = text.substring(index, index + normalizedSearchTerm.length);
  const afterMatch = text.substring(index + normalizedSearchTerm.length);

  return [
    beforeMatch,
    { text: match, highlight: true },
    ...highlightVietnameseText(afterMatch, searchTerm),
  ].filter(
    (item) => item && (typeof item === "string" ? item.length > 0 : true)
  );
};
