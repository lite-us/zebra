import commander from 'commander'
import Web3 from 'web3';
import { runTestFiles } from './runTestFiles'
import fs from './fileSystem'
import { Provider } from 'remix-simulator'
import Log from './logger'
const logger = new Log()
const log = logger.logger
import colors from 'colors'

// parse verbosity
function mapVerbosity (v: number) {
    const levels = {
        0: 'error',
        1: 'warn',
        2: 'info',
        3: 'verbose',
        4: 'debug',
        5: 'silly'
    }
    return levels[v]
}
const version = require('../package.json').version

commander.version(version)

commander.command('version').description('output the version number').action(function () {
    console.log(version)
})

commander.command('help').description('output usage information').action(function () {
    commander.help()
})

// get current version
commander
    .option('-v, --verbose <level>', 'run with verbosity', mapVerbosity)
    .action(async (filename) => {
        if(!filename.endsWith('_test.sol')){
            log.error('Test filename should end with "_test.sol"')
            process.exit()
        }
        // Console message
        console.log(colors.white('\n\tš\t:: Running zebra-tests - Unit testing for solidity ::\tš\n'))
        // set logger verbosity
        if (commander.verbose) {
            logger.setVerbosity(commander.verbose)
            log.info('verbosity level set to ' + commander.verbose.blue)
        }
        let web3 = new Web3()
        const provider = new Provider()
        await provider.init()
        web3.setProvider(provider)

        if (!fs.existsSync(filename)) {
            console.error(filename + ' not found')
            process.exit(1)
        }

        let isDirectory = fs.lstatSync(filename).isDirectory()
        runTestFiles(filename, isDirectory, web3)
    })

if (!process.argv.slice(2).length) {
    log.error('Please specify a filename')
    process.exit()
}

commander.parse(process.argv)
