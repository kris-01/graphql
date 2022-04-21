/**
 * Works like the queryAPI function, but keeps querying with increasing offset until no more data is available.
 * 
 * The query must accept a variable $offset
 * The callback must take in response data and return the array that's being offset
 * @param {String} query
 * @param {function(data: Object): Array} callback
 * @param {Object} variables
 * @returns {Promise<*[]>}
 */
export async function queryAll(query, callback, variables = {}) {
    let result = []
    let offset = 0
    let len = 0

    do {
        const data = await queryAPI(query, {...variables, offset})
        const arr = callback(data)

        result = [...result, ...arr]

        len = arr.length
        offset += len
    } while (len > 0)

    return result
}


/**
 * Sends a GraphQL query and returns the response data in a promise
 * @param {String} query
 * @param {Object} variables
 * @returns {Promise<Object>}
 */
export async function queryAPI(query, variables = {}) {
    return fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({query, variables})
    })
        .then(res => res.json())
        .then(data => {
            if ("errors" in data) throw data.errors
            return data["data"]
        })
}