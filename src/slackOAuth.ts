import { Request, Response } from "express-serve-static-core";
import axios, { AxiosResponse } from "axios";
import qs from "qs";

import { SlackInstall } from "./dbInit";

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_SECRET;

export const SlackInstallUrl = (req: Request, res: Response) => {
  res.redirect(
    `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,commands,chat:write.public&user_scope=`
  );
  return;
};
export const SlackOAuthExchange = async (req: Request, res: Response) => {
  const { query } = req;
  const { code } = query;
  if (!code) {
    res.sendStatus(403);
    return;
  }

  let exchange: undefined | AxiosResponse;
  try {
    exchange = await axios.post(
      "https://slack.com/api/oauth.v2.access",
      qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      })
    );
    if (!exchange.data.ok) {
      throw new Error(exchange.data.error || "unknown error");
    }
  } catch (err) {
    res.send(
      `Unfortunately, something went wrong with the OAuth exchange. The Error message we got was: ${err.toString()}`
    );
    return;
  }

  const { data } = exchange;
  await SlackInstall.upsert({
    botUserId: data.bot_user_id,
    slackTeamId: data.team.id,
    token: data.access_token,
  });

  res.sendStatus(200);
  return;
};
