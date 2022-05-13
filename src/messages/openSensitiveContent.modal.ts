export const OpenSensitiveContentModal = (value: string) => ({
  type: "modal",
  title: {
    type: "plain_text",
    text: "Sensitive Content",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Close",
    emoji: true,
  },
  blocks: [
    {
      type: "image",
      image_url: value,
      alt_text: "sensitive content shared",
    },
  ],
});
