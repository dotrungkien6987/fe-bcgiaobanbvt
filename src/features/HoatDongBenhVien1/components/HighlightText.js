import React from 'react';

// Component để hiển thị văn bản có từ khóa được tô sáng
const HighlightText = ({ text, searchTerm }) => {
  if (!searchTerm || !text) return <>{text}</>;
  
  const searchTermLower = searchTerm.toLowerCase().trim();
  const textLower = text.toLowerCase();
  
  // Nếu không có từ khóa trong văn bản, trả về văn bản gốc
  if (!searchTermLower || textLower.indexOf(searchTermLower) === -1) {
    return <>{text}</>;
  }
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === searchTermLower ? (
          <span key={i} style={{ backgroundColor: '#FFEB3B', fontWeight: 'bold' }}>
            {part}
          </span>
        ) : (
          part
        )
      ))}
    </>
  );
};

export default HighlightText;
