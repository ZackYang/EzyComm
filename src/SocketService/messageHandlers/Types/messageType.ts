type MessageDistnation = string | null | undefined;

type MessageType = {
  from: string;
  to: MessageDistnation;
  type: string;
  payloadType: string;
  payload: any;
} | null;

export { MessageDistnation, MessageType };