import {modal} from './dom.js';

const modalPopup = new bootstrap.Modal(modal, {
    keyboard: false
})
export { modalPopup}

// await Promise.all( posts.map( async (post) => {
//     const category = await _get_(`${API_URL}/categories/${post.categoryId}`)
//     return {...post, category: category.title }
// }) )