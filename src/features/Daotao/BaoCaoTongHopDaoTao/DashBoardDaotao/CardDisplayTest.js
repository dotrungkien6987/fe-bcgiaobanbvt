import React from 'react';
import CardSoLuongHinhThuc1 from './CardSoLuongHinhThuc1';


const CardDisplayTest = () => {
  return (
    <div>
      <CardSoLuongHinhThuc1
        code="DDT06"
        name="Đang tham gia đào tạo thạc sĩ"
        organizationCount={167}
        memberCount={3456}
      />
    </div>
  );
};

export default CardDisplayTest;