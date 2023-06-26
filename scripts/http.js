const _get_ = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    return data
}

const _post_ = async (url, doc) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
    })
    const data = await response.json()
    return data
}

const _update_ = async (url, doc, method = 'PUT') => {
    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
    })
    const data = await response.json()
    return data
}

const  _delete_ = async (url) => {
    const response = await fetch(url, {
        method: 'DELETE',
    })
    const data = await response.json()
    return data
}

export {
    _get_, _post_, _update_, _delete_
}