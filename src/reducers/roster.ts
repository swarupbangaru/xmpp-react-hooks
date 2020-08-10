import { RosterItem } from '@xmpp-ts/roster';
import { JID } from '@xmpp/jid';
import { Action } from '../types';
import { RosterState, RosterItemState } from '../state';
import { parseJid } from '../helpers';

export interface RosterPayload {
  item?: RosterItem;
  items: RosterItem[];
  version?: string;
}

export enum RosterActions {
  RemoveRosterItem = 'REMOVE_ROSTER_ITEM',
  SetRoster = 'SET_ROSTER',
  SetRosterItem = 'SET_ROSTER_ITEM'
}

export default function rosterReducer(
  state: RosterState | null = null,
  { type, payload }: Action<RosterPayload | RosterItem | JID>
) {
  switch (type) {
    case RosterActions.SetRosterItem: {
      const { jid } = payload as RosterItem;
      const roster: RosterState | null = state ? { ...state } : null;
      const rosterItem: RosterItemState | undefined = roster?.items.find(
        (rosterItem: RosterItemState) =>
          jid && parseJid(rosterItem.jid).equals(jid)
      );
      if (rosterItem) {
        Object.assign(rosterItem, payload);
        return roster;
      }
      return {
        ...(state?.version ? { version: state.version } : {}),
        items: [
          ...(state?.items || []),
          ...((payload as RosterItem) ? [payload as RosterItem] : [])
        ]
      };
    }
    case RosterActions.SetRoster: {
      return payload;
    }
    case RosterActions.RemoveRosterItem: {
      const jid = payload as JID;
      return {
        version: state?.version,
        items: state?.items.filter((rosterItem: RosterItemState) => {
          return !parseJid(rosterItem.jid).equals(jid);
        })
      };
    }
  }
  return state;
}