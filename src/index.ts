import { AnalyticsPlugin, AnalyticsInstance } from "analytics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Metadata = Record<string, any>;

interface ProfitwellStatic {
  (
    action: "start",
    options: {
      user_id: string;
    },
  ): void;
  (
    action: "start",
    options: {
      user_email: string;
    },
  ): void;
  (
    action: "start",
    options: {},
  ): void;
  (
    action: "cq_demo",
    demo: "lockout" | "custom_url",
  ): void;

  q?: IArguments[];

  isLoaded?: boolean;
}

declare global {
  interface Window {
    profitwell: ProfitwellStatic;
  }
}

export enum ProfitwellIdentifyMode {
  Email = 'email',
  UserId = 'user_id',
  Custom = 'custom',
}

export type ProfitwellPluginConfig = {
  publicToken: string;
  identifyMode: ProfitwellIdentifyMode.Custom;
  getCustomId(traits: Metadata): string;

} | {
  publicToken: string;
  identifyMode?: ProfitwellIdentifyMode.Email | ProfitwellIdentifyMode.UserId;
}

interface Params {
  payload: {
    instance: AnalyticsInstance;
    userId?: string;
    traits: Metadata;
    options: Record<string, unknown>;
  };
  config: ProfitwellPluginConfig;
}

const scriptSrc = "https://public.profitwell.com/js/profitwell.js";

const defaultConfig: Partial<ProfitwellPluginConfig> = {
  identifyMode: ProfitwellIdentifyMode.Email,
};

const profitwellPlugin = (config: ProfitwellPluginConfig): AnalyticsPlugin => {
  const sharedConfig = {
    name: "profitwell",
    config: {
      ...defaultConfig,
      ...config,
    },
  };

  if (process.env.BROWSER) {
    return {
      ...sharedConfig,

      initialize({ config }: Params): void {
        if (!config.publicToken)
          throw new Error("No Profitwell publicToken defined");

        const scriptElement = document.createElement('script');
        scriptElement.id = 'profitwell-js';
        scriptElement.setAttribute('data-pw-auth', config.publicToken);

        document.head.appendChild(scriptElement);

        (function(i, s, o: 'profitwell', g: 'script', r, a = s.createElement(g), m = s.getElementsByTagName(g)[0]) {
          i[o] = i[o] || function() { (i[o].q = i[o].q || []).push(arguments) };
          a.async = true; a.src = `${r}?auth=${config.publicToken}`; m.parentNode?.insertBefore(a, m);
        })(window, document, 'profitwell', 'script', scriptSrc);
      },

      loaded() {
        return window.profitwell?.isLoaded;
      },

      identify({ payload }: Params): void {
        const { userId } = payload;

        // authenticated user
        if (typeof userId === 'string') {
          switch (config.identifyMode) {
            case ProfitwellIdentifyMode.Custom:
              window.profitwell('start', {
                user_id: config.getCustomId?.(payload.traits),
              });
              return;
            case ProfitwellIdentifyMode.Email:
              window.profitwell('start', {
                user_email: payload.traits.email,
              });
              return;
            case ProfitwellIdentifyMode.UserId:
            default:
              window.profitwell('start', {
                user_id: userId,
              });
              return;
          }
        } else {
          // anonymous tracking
          window.profitwell('start', {});
        }
      },
    };
  } else {
    // TODO: Node API
    return sharedConfig;
  }
};

export default profitwellPlugin;
