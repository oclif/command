import {expect, fancy} from 'fancy-test'

import {Main} from '../src/main'
import * as OclifHelp from '@oclif/help'
import * as Config from '@oclif/config'
import {TestHelpClassConfig} from './helpers/test-help-in-src/src/test-help-plugin'

const pjson = require('../package.json')
const version = `@oclif/command/${pjson.version} ${process.platform}-${process.arch} node-${process.version}`
const originalgetHelpClass = OclifHelp.getHelpClass

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

TOPICS
  plugins  list installed plugins

COMMANDS
  plugins  list installed plugins

`))
  .it('runs -h')

  describe('with an alternative help class', async () => {
    const getMainWithHelpClass = async () => {
      const config: TestHelpClassConfig = await Config.load()
      config.pjson.oclif.helpClass = './lib/test-help-plugin'

      class MainWithHelpClass extends Main {
        config = config
      }

      return MainWithHelpClass
    }

    fancy
    .stdout()
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .stub(OclifHelp, 'getHelpClass', function (config: Config.IConfig) {
      const patchedConfig = {
        ...config,
        root: `${__dirname}/helpers/test-help-in-src/`,
      }

      return originalgetHelpClass(patchedConfig)
    })
    .do(async () => (await getMainWithHelpClass()).run(['-h']))
    .catch('EEXIT: 0')
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .do(output => expect(output.stdout).to.equal('hello showHelp\n'))
    .it('works with -h')

    fancy
    .stdout()
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .stub(OclifHelp, 'getHelpClass', function (config: Config.IConfig) {
      const patchedConfig = {
        ...config,
        root: `${__dirname}/helpers/test-help-in-src/`,
      }

      return originalgetHelpClass(patchedConfig)
    })
    .do(async () => (await getMainWithHelpClass()).run(['--help']))
    .catch('EEXIT: 0')
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .do(output => expect(output.stdout).to.equal('hello showHelp\n'))
    .it('works with --help')

    fancy
    .stdout()
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .stub(OclifHelp, 'getHelpClass', function (config: Config.IConfig) {
      const patchedConfig = {
        ...config,
        root: `${__dirname}/helpers/test-help-in-src/`,
      }

      return originalgetHelpClass(patchedConfig)
    })
    .do(async () => (await getMainWithHelpClass()).run(['help']))
    .catch('EEXIT: 0')
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .do(output => expect(output.stdout).to.equal('hello showHelp\n'))
    .it('works with help')
  })
})
