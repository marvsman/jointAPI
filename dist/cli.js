import caporal from 'caporal';
import { prompt } from 'enquirer';
import { PhilipsTV } from './philipstv';
const cli = caporal;
cli.version('0.0.1')
    .command('info', 'Fetch information from TV')
    .argument('<host>', 'TV IP Address', cli.STRING)
    .action(async (args, option, logger) => {
    try {
        try {
            const philipsTv = new PhilipsTV(args.host);
            const result = await philipsTv.info();
            logger.info(result);
        }
        catch (error) {
            logger.error(error.message);
            logger.debug(error.stack);
        }
        try {
            const philipsTv = new PhilipsTV(args.host);
            const result = await philipsTv.info();
            logger.info(result);
        }
        catch (error) {
            logger.error(error.message);
            logger.debug(error.stack);
        }
    }
    finally {
        process.exit();
    }
})
    .command('pair', 'Performs pairing with TV to generate API user and password')
    .argument('<host>', 'TV IP Address', cli.STRING)
    .action(async (args, option, logger) => {
    try {
        const philipsTv = new PhilipsTV(args.host);
        const result = await philipsTv.pair(async () => {
            const response = await prompt({
                type: 'input',
                name: 'pin',
                message: 'Please enter the four-digit PIN.'
            });
            return response.pin;
        });
        logger.info(result);
    }
    catch (error) {
        logger.error(error.message);
        logger.debug(error.stack);
    }
    finally {
        process.exit();
    }
})
    .command('powerstate', 'Control TV Powerstate')
    .argument('<host>', 'TV IP Address', cli.STRING)
    .argument('<apiUser>', 'TV API Username', cli.STRING)
    .argument('<apiPass>', 'TV API Password', cli.STRING)
    .option('-s, --state <state>', 'Turning TV on (true) or sleep (false)', cli.BOOLEAN)
    .action(async (args, option, logger) => {
    try {
        const auth = {
            user: args.apiUser,
            pass: args.apiPass,
            sendImmediately: false
        };
        const philipsTv = new PhilipsTV(args.host, undefined, auth);
        if (option.state) {
            const result = await philipsTv.setPowerState(option.state);
        }
        else {
            logger.info("PREV");
            philipsTv.getPowerState().then((result) => {
                logger.info('OK', result);
            }).catch((error) => {
                logger.error(error.message);
                logger.debug(error.stack);
            });
            logger.info(logger);
            // logger.info('OK', result);
        }
    }
    catch (error) {
        logger.info("HIER", error);
        logger.error(error.message);
        logger.debug(error.stack);
    }
    finally {
        process.exit();
    }
})
    .command('powerstate', 'Control TV Powerstate')
    .argument('<host>', 'TV IP Address', cli.STRING)
    .argument('<apiUser>', 'TV API Username', cli.STRING)
    .argument('<apiPass>', 'TV API Password', cli.STRING)
    .option('-s, --state <state>', 'Turning TV on (true) or sleep (false)', cli.BOOLEAN)
    .action(async (args, option, logger) => {
    try {
        const auth = {
            user: args.apiUser,
            pass: args.apiPass,
            sendImmediately: false
        };
        const philipsTv = new PhilipsTV(args.host, undefined, auth);
        if (option.state) {
            const result = await philipsTv.setPowerState(option.state);
        }
        else {
            logger.info("PREV");
            philipsTv.getPowerState().then((result) => {
                logger.info('OK', result);
            }).catch((error) => {
                logger.error(error.message);
                logger.debug(error.stack);
            });
            logger.info(logger);
            // logger.info('OK', result);
        }
    }
    catch (error) {
        logger.info("HIER", error);
        logger.error(error.message);
        logger.debug(error.stack);
    }
    finally {
        process.exit();
    }
})
    .command('pic', 'Gets Picture Settings')
    .argument('<host>', 'TV IP Address', cli.STRING)
    .argument('<apiUser>', 'TV API Username', cli.STRING)
    .argument('<apiPass>', 'TV API Password', cli.STRING)
    .action(async (args, option, logger) => {
    try {
        const auth = {
            user: args.apiUser,
            pass: args.apiPass,
            sendImmediately: false
        };
        const philipsTv = new PhilipsTV(args.host, undefined, auth);
        if (philipsTv.settings) {
            const result = await philipsTv.settings.getCurrent();
            logger.info('OK', result);
        }
    }
    catch (error) {
        logger.error("HIER", error.toString());
    }
    finally {
        process.exit();
    }
})
    .command('channels', 'Gets list of Channels')
    .argument('<host>', 'TV IP Address', cli.STRING)
    .argument('<apiUser>', 'TV API Username', cli.STRING)
    .argument('<apiPass>', 'TV API Password', cli.STRING)
    .action(async (args, option, logger) => {
    try {
        const auth = {
            user: args.apiUser,
            pass: args.apiPass,
            sendImmediately: false
        };
        const philipsTv = new PhilipsTV(args.host, undefined, auth);
        const result = await philipsTv.getCurrentActivity();
        logger.info('OK', result);
    }
    catch (error) {
        logger.error(error.message);
        logger.debug(error.stack);
    }
    finally {
        process.exit();
    }
})
    .command('volume', 'Gets Volume')
    .argument('<host>', 'TV IP Address', cli.STRING)
    .argument('<apiUser>', 'TV API Username', cli.STRING)
    .argument('<apiPass>', 'TV API Password', cli.STRING)
    .action(async (args, option, logger) => {
    try {
        const auth = {
            user: args.apiUser,
            pass: args.apiPass,
            sendImmediately: false
        };
        const philipsTv = new PhilipsTV(args.host, undefined, auth);
        const result = await philipsTv.getVolume();
        logger.info('OK', result);
    }
    catch (error) {
        logger.error(error.message);
        logger.debug(error.stack);
    }
    finally {
        process.exit();
    }
});
cli.parse(process.argv);
//# sourceMappingURL=cli.js.map