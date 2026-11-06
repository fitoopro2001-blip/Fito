export const antTheme = {
  token: {
    colorPrimary: 'var(--primary)',
    colorPrimaryHover: 'var(--primary-hover)',
    colorBgBase: 'var(--background)',
    colorTextBase: 'var(--text)',
    colorBorder: 'var(--border-light)',
    borderRadius: 12,
    fontFamily: 'inherit',
  },
  components: {
    Button: {
      colorPrimary: 'var(--primary)',
      colorPrimaryHover: 'var(--primary-hover)',
      colorText: 'var(--text)',
    },
    Input: {
      colorBgContainer: 'var(--overlay)',
      colorBorder: 'var(--border)',
      colorText: 'var(--text)',
    },
    // colorBgElevated pinned like Popover below — the dropdown panel is a
    // floating surface too and reads as page background without it.
    Select: {
      colorBgContainer: 'var(--overlay)',
      colorBorder: 'var(--border)',
      colorText: 'var(--text)',
      colorBgElevated: 'var(--surface)',
    },
    DatePicker: {
      colorBgContainer: 'var(--overlay)',
      colorBorder: 'var(--border)',
      colorText: 'var(--text)',
    },
    Upload: {
      colorBgContainer: 'var(--overlay)',
      colorBorder: 'var(--border)',
    },
    Steps: {
      colorPrimary: 'var(--primary)',
      colorText: 'var(--text)',
      colorTextSecondary: 'var(--text-muted)',
    },
    Form: {
      labelColor: 'var(--text-secondary)',
    },
    // Floating panels (dropdowns, tooltips) read as page background rather
    // than a card unless pinned to --surface explicitly — colorBgBase alone
    // isn't enough since Popover derives its own elevated-surface token.
    Popover: {
      colorBgElevated: 'var(--surface)',
      colorText: 'var(--text)',
      colorTextHeading: 'var(--text)',
    },
    Tooltip: {
      colorBgSpotlight: 'var(--surface)',
      colorTextLightSolid: 'var(--text)',
    },
    Modal: {
      colorBgElevated: 'var(--surface)',
      colorText: 'var(--text)',
      colorTextHeading: 'var(--text)',
      colorIcon: 'var(--text-muted)',
      colorIconHover: 'var(--text)',
    },
    Empty: {
      colorText: 'var(--text-secondary)',
      colorTextDescription: 'var(--text-muted)',
    },
  },
};
