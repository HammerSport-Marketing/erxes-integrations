import { debugNylas } from '../debuggers';
import { Accounts } from '../models';
import { sendRequest } from '../utils';
import { GOOGLE_OAUTH_TOKEN_VALIDATION_URL } from './constants';
import { IFilter, IMessageDraft } from './types';
import { nylasRequest, nylasSendMessage } from './utils';

/**
 * Build message and send API request
 * @param {String} - child function name
 * @param {String} - accessToken
 * @param {String} - filter
 * @param {Promise} - nylas message object
 */
const buildMessage = (child: string, ...args: Array<string | IFilter>) => {
  const [accessToken, filter] = args;

  return nylasRequest({
    parent: 'messages',
    child,
    accessToken,
    filter,
  });
};

/**
 * Get messages
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas list of messagas
 */
const getMessages = (...args: string[]) => buildMessage('list', ...args);

/**
 * Get message by filtered args
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas message object
 */
const getMessageById = (...args: string[]) => buildMessage('find', ...args);

/**
 * Get most recent messages
 * @param {String} - accessToken
 * @returns {Promise} - nylas messages object
 */
const recentMessages = (accessToken: string) => {
  return buildMessage('find', accessToken, { in: 'inbox' });
};

const sendMessage = async (accessToken: string, args: IMessageDraft) => {
  return nylasSendMessage(accessToken, args);
};

/**
 * Google: get email from google with accessToken
 * @param accessToken
 * @returns {Promise} email
 */
const getEmailFromAccessToken = async (accessToken: string) => {
  const data = { access_token: accessToken, fields: ['email'] };

  const { email } = await sendRequest({
    url: GOOGLE_OAUTH_TOKEN_VALIDATION_URL,
    method: 'post',
    body: data,
  });

  return email;
};

/**
 * Sync messages with messageId from webhook
 * @param {String} accountId
 * @param {String} messageId
 * @retusn {Promise} nylas messages object
 */
const syncMessages = async (accountId: string, messageId: string) => {
  const account = await Accounts.findOne({ uid: accountId }).lean();

  if (!account) {
    return debugNylas('Account not found with uid: ', accountId);
  }

  const message = await getMessageById(account.token, messageId);

  debugNylas(message);
};

export { syncMessages, sendMessage, recentMessages, getMessageById, getMessages, getEmailFromAccessToken };