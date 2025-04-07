/**
 * @typedef {Object} MenuItem
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} image
 */

/**
 * @typedef {MenuItem & { quantity: number }} CartItem
 */

/**
 * @typedef {Object} TelegramUser
 * @property {number} id
 * @property {string} first_name
 * @property {string} [last_name]
 * @property {string} [username]
 * @property {string} [language_code]
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {CartItem[]} items
 * @property {number} total
 * @property {TelegramUser} [user]
 * @property {'new' | 'processing' | 'completed' | 'cancelled'} status
 * @property {string} createdAt
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} ImageUpload
 * @property {number} id
 * @property {number} productId
 * @property {string} fileId
 * @property {string} url
 * @property {string} uploadDate
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {T} [data]
 */

module.exports = {}; // We export an empty object since these are just type definitions