export const Colors = {
  background: {
    primary:  '#0D0F14',   // deepest bg — app root
    surface:  '#13161D',   // cards, sheets, tab bar
    elevated: '#1A1E27',   // inputs, code editor, popovers
    overlay:  'rgba(0,0,0,0.6)',
  },

  accent: {
    primary: '#6C63FF',
    dim:     'rgba(108,99,255,0.14)',
    border:  'rgba(108,99,255,0.25)',
  },

  method: {
    GET:     '#00D2A8',
    POST:    '#A39DFF',
    PUT:     '#F5C842',
    PATCH:   '#FF9F7F',
    DELETE:  '#FF6B6B',
    HEAD:    '#7A7F8E',
    OPTIONS: '#7A7F8E',
  } as const,

  methodDim: {
    GET:     'rgba(0,210,168,0.12)',
    POST:    'rgba(163,157,255,0.12)',
    PUT:     'rgba(245,200,66,0.12)',
    PATCH:   'rgba(255,159,127,0.12)',
    DELETE:  'rgba(255,107,107,0.12)',
    HEAD:    'rgba(122,127,142,0.12)',
    OPTIONS: 'rgba(122,127,142,0.12)',
  } as const,

  status: {
    success: '#00D2A8',
    warning: '#F5C842',
    error:   '#FF6B6B',
    info:    '#6C63FF',
    successDim: 'rgba(0,210,168,0.12)',
    warningDim: 'rgba(245,200,66,0.12)',
    errorDim:   'rgba(255,107,107,0.12)',
    infoDim:    'rgba(108,99,255,0.12)',
  },

  text: {
    primary:   '#E2E4ED',
    secondary: '#9195A3',
    muted:     '#5B5F6E',
    accent:    '#A39DFF',
    inverse:   '#0D0F14',
  },

  border: {
    subtle:  'rgba(255,255,255,0.07)',
    default: 'rgba(255,255,255,0.12)',
    strong:  'rgba(255,255,255,0.22)',
  },

  // HTTP status code ranges → color mapping
  httpStatus: {
    '2xx': '#00D2A8',
    '3xx': '#F5C842',
    '4xx': '#FF6B6B',
    '5xx': '#FF3B3B',
  },
} as const;

// Derive a union type for method keys
export type MethodColor = keyof typeof Colors.method;
