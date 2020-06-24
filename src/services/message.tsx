/**
 * @jsx xml
 * https://xmpp.org/rfcs/rfc6120.html#stanzas
 */
import xml from '@xmpp/xml';
import { XmlElement } from '@xmpp/client';
import StanzaService from './stanza';
import Xmpp from '../xmpp';

export default class MessageService extends StanzaService {
  constructor(private readonly xmpp: Xmpp) {
    super(xmpp);
  }

  async sendMessage(to: string, body: string, lang?: string, from?: string) {
    if (!from) from = this.xmpp.fullJid!;
    if (!lang) lang = this.xmpp.lang;
    const request = xml(
      'message',
      {
        to,
        from,
        type: 'chat',
        'xml:lang': lang
      },
      <body>{body}</body>
    );
    await this.xmpp.query(request);
  }

  readMessages(callback: (message: Message) => any, to?: string): () => any {
    if (!to) to = this.xmpp.fullJid!;
    // console.log('to', to);
    return this.xmpp.handle(
      (messageElement: XmlElement) => {
        console.log('messageElement', messageElement);
        return (
          messageElement.name === 'message' &&
          messageElement.getAttr('type') === 'chat' &&
          messageElement.getAttr('to').split('/')[0] === to!.split('/')[0]
        );
      },
      (messageElement: XmlElement) => {
        const message = this.elementToMessage(messageElement);
        callback(message);
      }
    );
  }

  elementToMessage(messageElement: XmlElement): Message {
    const to = messageElement.getAttr('to');
    // console.log('to', to);
    const from = messageElement.getAttr('from');
    // console.log('from', from);
    const body = messageElement
      .getChildren('body')
      .reduce((body: string, bodyElement: XmlElement) => {
        // console.log('body', body);
        return [body, bodyElement.text()].join('\n');
      }, '');
    const header = messageElement.getChild('header')?.text() || undefined;
    if (body && from && to) {
      console.log('body', body);
      return { body, from, to, header };
    }
    throw new Error('invalid message stanza');
  }
}

export interface Message {
  body: string;
  from: string;
  header?: string;
  to: string;
  stamp?: Date;
}
