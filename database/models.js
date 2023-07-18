/**
 * @typedef { {id: string, title: string } } category
 */

/**
 * @typedef { {id: string, email:string, password: string } } user
 */

/**
 * @typedef { {id: string, 
 *              userId: string,
 *              categoryId: string,
 *              title: string, 
 *              description: string, 
 *              rating: number,
 *              views: number,
 *              tags: string[],
 *              isPublished: Boolean
 *            } } post
 */

/**
 * @typedef { {id: string, userId: string, postId: string, comment: string } } comment
 */

/**
 * @type {category}
 */
let category

/**
 * @type {category[]}
 */
let categories

/**
 * @type {user}
 */
let user

/**
 * @type {user[]}
 */
let users

/**
 * @type {post}
 */
let post

/**
 * @type {post[]}
 */
let posts

/**
 * @type {comment}
 */
let comment

/**
 * @type {comment[]}
 */
let comments
