import { Address } from '@graphprotocol/graph-ts';
import { QuestChainToken } from '../types/schema';

import {
  QuestChainToken as QuestChainTokenContract,
  TransferSingle as TransferSingleEvent,
  URI as URIEvent,
} from '../types/templates/QuestChainToken/QuestChainToken';
import { removeFromArray, fetchMetadata, getUser } from './helpers';

export function handleTransferSingle(event: TransferSingleEvent): void {
  let tokenId = event.address
    .toHexString()
    .concat('-')
    .concat(event.params.id.toHexString());
  let token = QuestChainToken.load(tokenId);
  if (token == null) {
    token = new QuestChainToken(tokenId);
    token.owners = new Array<string>();
  }
  if (event.params.from == Address.fromI32(0)) {
    let user = getUser(event.params.to);
    let owners = token.owners;
    owners.push(user.id);
    token.owners = owners;
    token.save();
    let tokens = user.tokens;
    tokens.push(token.id);
    user.tokens = tokens;
    user.save();
  } else if (event.params.to == Address.fromI32(0)) {
    let user = getUser(event.params.from);
    let owners = token.owners;
    let newArray = removeFromArray(owners, user.id);
    token.owners = newArray;
    token.save();
    let tokens = user.tokens;
    newArray = removeFromArray(tokens, token.id);
    user.tokens = tokens;
    user.save();
  }
}

export function handleURI(event: URIEvent): void {
  let tokenId = event.address
    .toHexString()
    .concat('-')
    .concat(event.params.id.toHexString());
  let token = QuestChainToken.load(tokenId);
  if (token == null) {
    token = new QuestChainToken(tokenId);
    token.owners = new Array<string>();
  }
  let contract = QuestChainTokenContract.bind(event.address);
  token.questChain = contract.tokenOwner(event.params.id).toHexString();
  token.tokenId = event.params.id;

  let details = event.params.value;
  let metadata = fetchMetadata(details);
  token.details = details;
  token.name = metadata.name;
  token.description = metadata.description;
  token.imageUrl = metadata.imageUrl;
  token.animationUrl = metadata.animationUrl;
  token.externalUrl = metadata.externalUrl;
  token.mimeType = metadata.mimeType;
  token.save();
}
