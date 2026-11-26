// Browser-independent input helpers. Axis numbers are zero-based internally.
export const defaultAxes = [0, 1, 2, 3];
export function readPad(pad, config, ready, active) {
  const zero = {left:{x:0,y:0},right:{x:0,y:0}};
  if (!pad || !config.enabled) return {values:zero,ready:false,status:pad?'手把已連接，尚未啟用':'尚未偵測到手把'};
  const axes = config.axes;
  if (new Set(axes).size !== 4 || axes.some(i=>!Number.isInteger(i)||i<0||i>=pad.axes.length||!Number.isFinite(pad.axes[i]))) {
    return {values:zero,ready:false,status:'手把軸設定無效：請選擇四個不同且存在的軸'};
  }
  const raw=axes.map((axis,i)=>Math.max(-1,Math.min(1,pad.axes[axis]))*(config.reverse[i]?-1:1));
  const neutral=raw.every(value=>Math.abs(value)<.15);
  const nextReady=active&&(ready||neutral);
  if(!nextReady) return {values:zero,ready:false,status:'手把已啟用：開始練習後請先將四軸移至中間'};
  const deadzone=value=>Math.abs(value)<.12?0:Math.sign(value)*(Math.abs(value)-.12)/.88;
  const [lx,ly,rx,ry]=raw.map(deadzone);
  return {values:{left:{x:lx,y:ly},right:{x:rx,y:ry}},ready:true,status:'手把已連接，可操控（美國手）'};
}
export function combineInputs(touch, keyboard, pad) {
  const clamp=n=>Math.max(-1,Math.min(1,n));
  return {
    left:{x:clamp(touch.left.x+keyboard.left.x+pad.left.x),y:clamp(touch.left.y+keyboard.left.y+pad.left.y)},
    right:{x:clamp(touch.right.x+keyboard.right.x+pad.right.x),y:clamp(touch.right.y+keyboard.right.y+pad.right.y)}
  };
}
