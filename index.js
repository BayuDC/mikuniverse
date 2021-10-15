const app = require('./core/app');
const client = require('./core/client');

const port = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;

client.once('ready', () => console.log('Bot is ready'));
client.login(token);

app.listen(port, () => console.log('App listening at port', port));
