export const AddSensitiveContentModal = (
  target: "channel" | "thread",
  channelId: string,
  messageTs: string
) => {
  const modal: any = {
    type: "modal",
    callback_id: `submit_sensitive_content_${target}`,
    title: {
      type: "plain_text",
      text: "Add Sensitive Content",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Enter a URL to sensitive content using the form below to prevent Slack from unfurling a preview in channel. Supports links to images only.",
        },
      },
      {
        type: "input",
        element: {
          type: "plain_text_input",
          action_id: "link_to_sensitive_content",
        },
        label: {
          type: "plain_text",
          text: "URL to sensitive image",
          emoji: true,
        },
      },
    ],
  };

  if (target === "thread") {
    modal["private_metadata"] = JSON.stringify({ messageTs, channelId });
  }

  if (target === "channel") {
    modal.blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Choose a channel to share the link in.",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "conversations_select",
            placeholder: {
              type: "plain_text",
              text: "Select a channel",
              emoji: true,
            },
            filter: {
              include: ["public", "private", "im", "mpim"],
            },
            action_id: "select_channel",
          },
        ],
      }
    );
  }

  return modal;
};
