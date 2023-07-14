/**
 * @type {string}
 */
const API_URL =  'http://localhost:3000'
/**
 * @type {Number}
 */
const PRE_PAGE = 3
/**
 * @type {Number}
 */
const TOTAL = 100
/**
 * @type{Number}
 */
const RATING_INTERVAL = 10

const COLLECTIONS = [
    {
        title: "carts",
        value: []
    },
    {
        title: "users",
        value: []
    }
]
const LANGUAGES = [
    'en',
    'ka'
]
export {
    API_URL,
    PRE_PAGE,
    TOTAL,
    COLLECTIONS,
    RATING_INTERVAL,
    LANGUAGES
}