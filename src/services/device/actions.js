export const SHOW_SIDER = 'SHOW_SIDER';
export const SHOW_SCROLL = 'SHOW_SCROLL';

export function showSider() {
  return {
    type: SHOW_SIDER
  };
}
export function showScroll(showScroll) {
  return {
    type: SHOW_SCROLL,
    payload: showScroll
  };
}
