import {expect, fancy} from 'fancy-test'

import {Main} from '../src/main'
import * as PluginHelp from '@oclif/plugin-help'
import * as Config from '@oclif/config'
import {TestHelpPluginConfig} from './helpers/test-help-in-src/src/test-help-plugin'

const pjson = require('../package.json')
const version = `@oclif/command/${pjson.version} ${process.platform}-${process.arch} node-${process.version}`
const originalGetHelpPlugin = PluginHelp.getHelpPlugin

describe('main', () => {
  fancy
  .stdout()
  .do(() => Main.run(['plugins']))
  .do(output => expect(output.stdout).to.equal('no plugins installed\n'))
  .it('runs plugins')

  fancy
  .stdout()
  .do(() => Main.run(['-v']))
  .catch('EEXIT: 0')
  .do(output => expect(output.stdout).to.equal(version + '\n'))
  .it('runs -v')

  fancy
  .stdout()
  .do(() => Main.run(['-h']))
  .catch('EEXIT: 0')
  .do(output => expect(output.stdout).to.equal(`oclif base command

VERSION
  ${version}

USAGE
  $ @oclif/command [COMMAND]

COMMANDS
  help     display help for @oclif/command
  plugins  list installed plugins

`))
  .it('runs -h')

  describe('with an alternative help plugin', async () => {
    const getMainWithHelpPlugin = async () => {
      const config: TestHelpPluginConfig = await Config.load()
      config.pjson.oclif.helpPlugin = './lib/test-help-plugin'

      class MainWithHelpPlugin extends Main {
        config = config
      }

      return MainWithHelpPlugin
    }

    fancy
    .stdout()
    .stub(PluginHelp, 'getHelpPlugin', function (config: Config.IConfig) {
      const patchedConfig = {
        ...config,
        root: `${__dirname}/helpers/test-help-in-src/`,
      }

      return originalGetHelpPlugin(patchedConfig)
    })
    .do(async () => (await getMainWithHelpPlugin()).run(['-h']))
    .catch('EEXIT: 0')
    .do(output => expect(output.stdout).to.equal('hello showHelp\n'))
    .it('works with -h')

    fancy
    .stdout()
    .stub(PluginHelp, 'getHelpPlugin', function (config: Config.IConfig) {
      const patchedConfig = {
        ...config,
        root: `${__dirname}/helpers/test-help-in-src/`,
      }

      return originalGetHelpPlugin(patchedConfig)
    })
    .do(async () => (await getMainWithHelpPlugin()).run(['--help']))
    .catch('EEXIT: 0')
    .do(output => expect(output.stdout).to.equal('hello showHelp\n'))
    .it('works with --help')

    fancy
    .stdout()
    .stub(PluginHelp, 'getHelpPlugin', function (config: Config.IConfig) {
      const patchedConfig = {
        ...config,
        root: `${__dirname}/helpers/test-help-in-src/`,
      }

      return originalGetHelpPlugin(patchedConfig)
    })
    .do(async () => (await getMainWithHelpPlugin()).run(['help']))
    .catch('EEXIT: 0')
    .do(output => expect(output.stdout).to.equal('hello showHelp\n'))
    .it('works with help')
  })
})
