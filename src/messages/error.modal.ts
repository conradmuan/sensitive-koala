export const NotInChannelModal = () => ({
  type: "modal",
  callback_id: "not_in_channel",
  title: {
    type: "plain_text",
    text: "Sorry, that didn't work",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Close",
    emoji: true,
  },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Couldn't post the message in channel. Try inviting the bot into channel?",
      },
    },
  ],
});

export const GenericError = (url: string) => ({
  type: "modal",
  callback_id: "not_in_channel",
  title: {
    type: "plain_text",
    text: "Sorry, that didn't work",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Close",
    emoji: true,
  },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Couldn't open a preview to this url: ${url}`,
      },
    },
  ],
});
