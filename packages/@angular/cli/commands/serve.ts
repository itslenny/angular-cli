import { BuildOptions } from '../models/build-options';
import { baseBuildCommandOptions } from './build';
import { CliConfig } from '../models/config';
import { Version } from '../upgrade/version';
import { ServeTaskOptions } from './serve';
import { checkPort } from '../utilities/check-port';
import { overrideOptions } from '../utilities/override-options';

const Command = require('../ember-cli/lib/models/command');

const config = CliConfig.fromProject() || CliConfig.fromGlobal();
const defaultPort = process.env.PORT || config.get('defaults.serve.port');
const defaultHost = config.get('defaults.serve.host');
const defaultSsl = config.get('defaults.serve.ssl');
const defaultSslKey = config.get('defaults.serve.sslKey');
const defaultSslCert = config.get('defaults.serve.sslCert');

export interface ServeTaskOptions extends BuildOptions {
  port?: number;
  host?: string;
  proxyConfig?: string;
  liveReload?: boolean;
  liveReloadClient?: string;
  ssl?: boolean;
  sslKey?: string;
  sslCert?: string;
  open?: boolean;
  hmr?: boolean;
  useDist?: boolean;
}

// Expose options unrelated to live-reload to other commands that need to run serve
export const baseServeCommandOptions: any = overrideOptions([
  ...baseBuildCommandOptions,
  {
    name: 'port',
    type: Number,
    default: defaultPort,
    aliases: ['p'],
    description: 'Port to listen to for serving.'
  },
  {
    name: 'host',
    type: String,
    default: defaultHost,
    aliases: ['H'],
    description: `Listens only on ${defaultHost} by default.`
  },
  {
    name: 'proxy-config',
    type: 'Path',
    aliases: ['pc'],
    description: 'Proxy configuration file.'
  },
  {
    name: 'ssl',
    type: Boolean,
    default: defaultSsl,
    description: 'Serve using HTTPS.'
  },
  {
    name: 'ssl-key',
    type: String,
    default: defaultSslKey,
    description: 'SSL key to use for serving HTTPS.'
  },
  {
    name: 'ssl-cert',
    type: String,
    default: defaultSslCert,
    description: 'SSL certificate to use for serving HTTPS.'
  },
  {
    name: 'open',
    type: Boolean,
    default: false,
    aliases: ['o'],
    description: 'Opens the url in default browser.',
  },
  {
    name: 'live-reload',
    type: Boolean,
    default: true,
    aliases: ['lr'],
    description: 'Whether to reload the page on change, using live-reload.'
  },
  {
    name: 'live-reload-client',
    type: String,
    description: 'Specify the URL that the live reload browser client will use.'
  },
  {
    name: 'hmr',
    type: Boolean,
    default: false,
    description: 'Enable hot module replacement.',
  },
  {
    name: 'use-dist',
    type: Boolean,
    default: false,
    aliases: ['ud'],
    description: 'Uses the files in the dist folder to run tests instead of re-building.',
  },
], [
    {
      name: 'watch',
      default: true,
      description: 'Rebuild on change.'
    }
  ]);

const ServeCommand = Command.extend({
  name: 'serve',
  description: 'Builds and serves your app, rebuilding on file changes.',
  aliases: ['server', 's'],

  availableOptions: baseServeCommandOptions,

  run: function (commandOptions: ServeTaskOptions) {
    const ServeTask = require('../tasks/serve').default;

    Version.assertAngularVersionIs2_3_1OrHigher(this.project.root);
    return checkPort(commandOptions.port, commandOptions.host, defaultPort)
      .then(port => {
        commandOptions.port = port;

        const serve = new ServeTask({
          ui: this.ui,
          project: this.project,
        });

        return serve.run(commandOptions);
      });
  }
});

export default ServeCommand;
