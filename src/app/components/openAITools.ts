import { OpenAIFunction } from "../types";
const tools: OpenAIFunction[] = [
    {
      type: "function",
        name: "change_background",
        description: "Change the background color of the app.",
        parameters: {
          type: "object",
          properties: {
            color: {
              type: "string",
              description: "The hex code or name of the background color.",
            },
          },
          required: ["color"],
          additionalProperties: false,
        },
    },
    {
      type: "function",
        name: "zoom_content",
        description: "Zoom in or out of the content on the app.",
        parameters: {
          type: "object",
          properties: {
            zoomLevel: {
              type: "number",
              description: "Zoom level (e.g., 0.5 for 50%, 2 for 200%).",
            },
          },
          required: ["zoomLevel"],
          additionalProperties: false,
        },
    },
  ];

  export default tools;

  