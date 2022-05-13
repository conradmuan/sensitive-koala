export const ContentWarningButtonBlocksInChannel = (
  userId: string,
  value: string
) => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Content Warning: <@${userId}> shared an image showing sensitive content.`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Show sensitive content",
          emoji: true,
        },
        value,
        action_id: "show_content",
      },
    },
  ];
};

export const ContentWarningButtonBlocksInThread = (
  userId: string,
  value: string
) => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Content Warning: <@${userId}> shared an image showing sensitive content.`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Show sensitive content",
            emoji: true,
          },
          value,
          action_id: "show_content",
        },
      ],
    },
  ];
};
