import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";

import { SlackInstall } from "./dbInit";
import { AddSensitiveContentModal } from "./messages/addSensitiveContent.modal";
import {
  ContentWarningButtonBlocksInChannel,
  ContentWarningButtonBlocksInThread,
} from "./messages/contentWarningButton.blocks";
import { NotInChannelModal } from "./messages/error.modal";
import { OpenSensitiveContentModal } from "./messages/openSensitiveContent.modal";

interface ISensitiveContentPayload {
  content: string;
  channel: string;
}

interface ISensitiveContentPayloadThread {
  content: string;
  messageTs: string;
  channelId: string;
}

const getSensitiveContentPayloadForChannel = (
  state: any
): null | ISensitiveContentPayload => {
  let values: any[];
  try {
    values = Object.values(state?.values);
  } catch (err) {
    return null;
  }
  const sensitiveContentValues = values.filter(
    (value) => value.link_to_sensitive_content
  )[0];
  const channelValues = values.filter((value) => value.select_channel)[0];

  return {
    content: sensitiveContentValues.link_to_sensitive_content.value,
    channel: channelValues.select_channel.selected_conversation,
  };
};

const getSensitiveContentPayloadForThread = (state: any): null | string => {
  let values: any[];
  try {
    values = Object.values(state?.values);
  } catch (err) {
    return null;
  }

  const sensitiveContent = values.filter(
    (value) => value.link_to_sensitive_content
  )[0];

  return sensitiveContent.link_to_sensitive_content.value;
};

const getSensitiveContentFromButton = (actions: any) => {
  const showContent = actions.filter(
    (action: any) => action.action_id === "show_content"
  )[0];
  return showContent.value;
};

export const SlackHandleShortcut = async (req: Request, res: Response) => {
  res.status(200).send("");
  const { payload } = req.body;
  const parsedPayload = JSON.parse(payload);

  const {
    type,
    callback_id,
    trigger_id: triggerId,
    team: { id: teamId },
    user: { id: userId },
    channel,
    view,
    actions,
    message_ts,
  } = parsedPayload;

  const channelId = channel?.id;

  // Clicking on the plus button opens a modal
  if (
    (type === "shortcut" && callback_id === "add_sensitive_content_channel") ||
    (type === "message_action" &&
      callback_id === "add_sensitive_content_thread")
  ) {
    const target =
      callback_id === "add_sensitive_content_channel" ? "channel" : "thread";
    return SlackOpenContentModal({
      triggerId,
      teamId,
      target,
      channelId,
      messageTs: message_ts,
    });
  }

  // Clicking on submit on the form
  if (
    type === "view_submission" &&
    view &&
    view.callback_id === "submit_sensitive_content_channel" &&
    view.state
  ) {
    const sensitiveContentPayload = getSensitiveContentPayloadForChannel(
      view.state
    );
    if (sensitiveContentPayload) {
      return SlackHandleContentSubmissionToChannel({
        teamId,
        userId,
        triggerId,
        sensitiveContentPayload,
      });
    }
  }

  // Clicking on submit on the form from thread
  if (
    type === "view_submission" &&
    view &&
    view.callback_id === "submit_sensitive_content_thread" &&
    view.state &&
    view.private_metadata
  ) {
    const { private_metadata } = view;
    const metaData = JSON.parse(private_metadata);
    const payload: ISensitiveContentPayloadThread = {
      content: getSensitiveContentPayloadForThread(view.state),
      messageTs: metaData.messageTs,
      channelId: metaData.channelId,
    };
    return SlackHandleContentSubmissionToThread(
      teamId,
      userId,
      triggerId,
      payload
    );
  }

  // Clicking on "show" button
  if (
    type === "block_actions" &&
    actions &&
    actions.length &&
    actions.filter((action: any) => action.action_id === "show_content").length
  ) {
    const content = getSensitiveContentFromButton(actions);
    return SlackOpenSensitiveContent(teamId, triggerId, content);
  }
};

const SlackOpenContentModal = async ({
  triggerId,
  teamId,
  target,
  channelId,
  messageTs,
}: {
  triggerId: string;
  teamId: string;
  target: "channel" | "thread";
  channelId: string;
  messageTs: string;
}) => {
  let slackInstall;
  try {
    slackInstall = await SlackInstall.findOne({
      where: {
        slackTeamId: teamId,
      },
    });
  } catch (err) {
    console.error(err);
  }

  const { token } = slackInstall;

  try {
    await axios.post(
      "https://slack.com/api/views.open",
      {
        trigger_id: triggerId,
        view: AddSensitiveContentModal(target, channelId, messageTs),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    console.error(err);
  }
  return;
};

const SlackHandleContentSubmissionToChannel = async ({
  teamId,
  userId,
  triggerId,
  sensitiveContentPayload,
}: {
  teamId: string;
  userId: string;
  triggerId: string;
  sensitiveContentPayload: ISensitiveContentPayload;
}) => {
  let slackInstall;
  try {
    slackInstall = await SlackInstall.findOne({
      where: {
        slackTeamId: teamId,
      },
    });
  } catch (err) {
    console.error(err);
    return;
  }

  const { token } = slackInstall;
  const blocks = ContentWarningButtonBlocksInChannel(
    userId,
    sensitiveContentPayload.content
  );

  let postMessage: AxiosResponse;
  try {
    postMessage = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: sensitiveContentPayload.channel,
        blocks,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!postMessage.data.ok) {
      if (postMessage.data.error === "not_in_channel") {
        return SlackHandleNotInChannel(teamId, triggerId);
      }
      throw new Error(postMessage.data.error || "could not post message");
    }
  } catch (err) {
    console.error(err);
  }
};

const SlackHandleContentSubmissionToThread = async (
  teamId: string,
  userId: string,
  triggerId: string,
  sensitiveContentPayload: ISensitiveContentPayloadThread
) => {
  let slackInstall;
  try {
    slackInstall = await SlackInstall.findOne({
      where: {
        slackTeamId: teamId,
      },
    });
  } catch (err) {
    console.error(err);
    return;
  }
  const { token } = slackInstall;
  const blocks = ContentWarningButtonBlocksInThread(
    userId,
    sensitiveContentPayload.content
  );

  let postMessage: AxiosResponse;
  try {
    postMessage = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: sensitiveContentPayload.channelId,
        thread_ts: sensitiveContentPayload.messageTs,
        blocks,
        unfurl_links: false,
        unfurl_media: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!postMessage.data.ok) {
      if (postMessage.data.error === "not_in_channel") {
        return SlackHandleNotInChannel(teamId, triggerId);
      }
      throw new Error(postMessage.data.error || "could not post message");
    }
  } catch (err) {
    console.error(err);
  }
};

const SlackHandleNotInChannel = async (teamId: string, triggerId: string) => {
  let slackInstall;
  try {
    slackInstall = await SlackInstall.findOne({
      where: {
        slackTeamId: teamId,
      },
    });
  } catch (err) {
    console.error(err);
    return;
  }
  const { token } = slackInstall;
  try {
    await axios.post(
      "https://slack.com/api/views.open",
      {
        trigger_id: triggerId,
        view: NotInChannelModal(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err) {
    console.error(err);
  }
};

const SlackOpenSensitiveContent = async (
  teamId: string,
  triggerId: string,
  content: string
) => {
  let slackInstall;
  try {
    slackInstall = await SlackInstall.findOne({
      where: {
        slackTeamId: teamId,
      },
    });
  } catch (err) {
    console.error(err);
    return;
  }

  const { token } = slackInstall;

  let open: AxiosResponse;
  try {
    open = await axios.post(
      "https://slack.com/api/views.open",
      {
        trigger_id: triggerId,
        view: OpenSensitiveContentModal(content),
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (open.data.error) {
      throw new Error(open.data.error || "Could not open content");
    }
  } catch (error) {
    console.error(error);
  }
};
