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

app.listen(port);
