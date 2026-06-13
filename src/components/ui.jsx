import React from "react";
import { Minus, Plus } from "lucide-react";
import { S } from "../styles";

export function Stepper({ value, onDelta, small }) {
  const bs = small ? S.qtyBtnSm : S.qtyBtn;
  return (
    <div style={{ ...S.qty, ...(small ? { padding: 2 } : {}) }}>
      <button style={bs} onClick={() => onDelta(-1)}><Minus size={small ? 13 : 15} /></button>
      <span style={{ ...S.qtyNum, minWidth: small ? 18 : 24 }}>{value}</span>
      <button style={bs} onClick={() => onDelta(1)}><Plus size={small ? 13 : 15} /></button>
    </div>
  );
}
