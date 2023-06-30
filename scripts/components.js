/**
 * 
 * @param {object} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _dashboardLogIn = (_) => {
    return `<div class="btn-group" role="group" aria-label="Basic example">
                <button type="button" class="btn btn-primary" data-template="registration" onclick="showModal(this)">registration</button>
                <button type="button" class="btn btn-warning" data-template="authorization" onclick="showModal(this)">authorization</button>
            </div>`
}
/**
 * 
 * @param {{id: string | number, email: string }} _ 
 * @returns {string} // HTML LAYOUT COMPONENT
 */
const _dashboardLogOut = (_) => {
    const {id, email } = _
    return `<div class="btn-group" role="group" aria-label="Basic example" id="${id}">
                <button type="button" class="btn btn-primary">${email}</button>
                <button type="button" class="btn btn-warning" onclick="logOut()">
                    <i class="bi bi-box-arrow-in-right"></i>
                </button>
            </div>`
}

export {
    _dashboardLogIn,
    _dashboardLogOut
}