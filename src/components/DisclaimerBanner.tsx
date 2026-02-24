import React from "react";

export const DisclaimerBanner: React.FC = () => (
  <div className="disclaimer-banner">
    <span className="disclaimer-banner__icon">ℹ️</span>
    <span>
      <strong>免责声明</strong>
      ：估值仅供参考，请以基金公司披露的实际确认净值为准。估值数据来源于天天基金网，存在延迟和偏差的可能。
    </span>
  </div>
);
