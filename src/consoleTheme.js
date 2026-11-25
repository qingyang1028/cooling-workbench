import {theme} from 'antd';

// Ant's dark algorithm takes resolved colors. Read the same palette used by CSS and SVG.
export function consoleTheme() {
  const style = getComputedStyle(document.documentElement);
  const token = name => style.getPropertyValue('--' + name).trim();
  const primary = token('brand');
  const accent = {colorPrimary: primary, colorPrimaryHover: primary, colorPrimaryActive: primary};
  return {
    algorithm: theme.darkAlgorithm,
    token: {
      ...accent, colorLink: primary, colorSuccess: primary, colorError: token('critical'),
      colorWarning: token('warning'), colorInfo: token('info'), colorText: token('ink'),
      colorTextSecondary: token('muted'), colorTextLightSolid: token('on-brand'),
      colorBgContainer: token('surface-raised'), colorBgElevated: token('surface-raised'),
      colorBorder: token('line'), fontFamily: token('font-ui'),
      borderRadius: parseInt(token('radius-md'), 10)
    },
    components: {Button: accent, Pagination: accent}
  };
}
