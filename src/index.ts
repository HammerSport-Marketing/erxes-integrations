import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { connect } from './connection';
import initFacebook from './facebook/controller';
import Accounts from './models/Accounts';
import Integrations from './models/Integrations';

// load environment variables
dotenv.config();

connect();

const app = express();

app.use((req: any, _res, next) => {
  req.rawBody = '';

  req.on('data', chunk => {
    req.rawBody += chunk;
  });

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/integrations/remove', async (req, res) => {
  const { integrationId } = req.body;

  await Integrations.remove({ erxesApiId: integrationId });

  return res.json({ status: 'ok ' });
});

app.get('/accounts', async (req, res) => {
  const accounts = await Accounts.find({ kind: req.query.kind });

  return res.json(accounts);
});

app.post('/accounts/remove', async (req, res) => {
  await Accounts.remove({ _id: req.body._id });

  return res.json({ status: 'removed' });
});

// init bots
initFacebook(app);

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Integrations server is running on port ${PORT}`);
});
