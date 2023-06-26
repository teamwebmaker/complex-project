/**
 * A number, or a string containing a number.
 * @typedef { { title: string, value: Array } } row
 */

/**
 * 
 * @param {row[]} rows
 */
const init = (rows) => {
    rows.forEach((row) => {
        if(!localStorage.hasOwnProperty(row.title)) {
            localStorage.setItem(row.title, JSON.stringify(row.value) );
        }
    })
}
/**
 * 
 * @param {string} collection 
 * @param {Object} doc 
 * @returns {Object}
 */
const insert = (collection, doc) => {
    if(localStorage.hasOwnProperty(collection)) {
        let rows = JSON.parse( localStorage.getItem(collection) );
        rows.push( doc );
        localStorage.setItem(collection, JSON.stringify(rows) );
    } else {
        let rows = []
        rows.push( doc );
        localStorage.setItem(collection, JSON.stringify(rows) );
    }
    return {ok:true, message: `${collection} inserted successfully`}
}
/**
 * 
 * @param {string} collection 
 * @returns {Array}
 */
const select = (collection) => {
    if(localStorage.hasOwnProperty(collection)) {
        let rows = JSON.parse( localStorage.getItem(collection) );
        return rows
    } else {
        let rows = []
        return rows
    }
}

/**
 * 
 * @param {string} collection 
 * @param {Object} doc 
 * @param {string | number } id 
 * @returns {Object}
 */
const update = (collection, doc, id) => {
    if(localStorage.hasOwnProperty(collection)) {
        let rows = JSON.parse( localStorage.getItem(collection) );
        rows = rows.map((row) => row.id === id ? doc : row)
        localStorage.setItem(collection, JSON.stringify(rows) );
        return {ok:true, message: `${collection} updated successfully`}
    } 
    return {ok:false, message: `${collection} did not updated successfully`}
}
/**
 * 
 * @param {string} collection 
 * @param {string | number} id 
 * @returns {Object}
 */
const remove = (collection, id) => {
    if(localStorage.hasOwnProperty(collection)) {
        let rows = JSON.parse( localStorage.getItem(collection) );
        rows = rows.filter((row) => row.id !== id)
        localStorage.setItem(collection, JSON.stringify(rows) );
        return {ok:true, message: `${collection} deleted successfully`}
    }
    return {ok:false, message: `${collection} did not deleted successfully`}
}

export {
    init, insert, select, update, remove
}

// SELECT - extracts data from a database.
// UPDATE - updates data in a database.
// DELETE - deletes data from a database.
// INSERT - inserts new data into a database.
