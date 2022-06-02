import "dotenv/config";
import express from "express";
import * as bodyParser from "body-parser";

import { connect } from "./dbInit";
import { SlackInstallUrl, SlackOAuthExchange } from "./slackOAuth";
import { SlackHandleShortcut } from "./slackInteractivity";

const app = express();
const port = process.env.PORT || 3000;
connect();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json({ type: "application/*+json" }));

app.get("/slack/install", SlackInstallUrl);
app.get("/slack/oauth", SlackOAuthExchange);
app.post("/slack/interactivity", SlackHandleShortcut);
app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      `There is no homepage for this Slack App. To install the app, visit: https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=chat:write,commands,chat:write.public&user_scope=`
    );
});

app.listen(port);
